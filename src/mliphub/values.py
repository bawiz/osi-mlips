"""Bounded JSON conversion. Unsupported objects are reported, never stringified silently."""
from __future__ import annotations

import math
from collections.abc import Mapping
from pathlib import Path
from typing import Any

from .schema import MetadataValue, Record, missing

MAX_ITEMS = 30_000


def json_value(value: Any, budget: int = MAX_ITEMS):
    remaining = [budget]

    def convert(obj, depth=0):
        remaining[0] -= 1
        if remaining[0] < 0 or depth > 24:
            raise ValueError("Value exceeds metadata size/depth limit; store it as an external artifact")
        if obj is None or isinstance(obj, (str, bool, int)):
            return obj
        if isinstance(obj, float):
            if not math.isfinite(obj):
                raise ValueError("Non-finite numerical value")
            return obj
        if isinstance(obj, Path):
            return str(obj)
        if isinstance(obj, Mapping):
            if len(obj) > remaining[0]:
                raise ValueError("Mapping exceeds metadata size limit")
            if any(not isinstance(key, str) for key in obj):
                raise ValueError("JSON metadata keys must be strings")
            return {key: convert(item, depth + 1) for key, item in obj.items()}
        if isinstance(obj, (tuple, list)):
            if len(obj) > remaining[0]:
                raise ValueError("Array exceeds metadata size limit; attach a trajectory or array file")
            return [convert(item, depth + 1) for item in obj]
        # NumPy and already-loaded PyTorch tensors, without importing either framework.
        if type(obj).__module__.split(".")[0] in {"numpy", "torch"}:
            size = obj.numel() if callable(getattr(obj, "numel", None)) else obj.size
            if int(size) > remaining[0]:
                raise ValueError("Array exceeds metadata size limit; attach a trajectory or array file")
            if callable(getattr(obj, "detach", None)):
                obj = obj.detach().cpu()
            return convert(obj.tolist(), depth + 1)
        raise ValueError(f"Unsupported metadata type: {type(obj).__module__}.{type(obj).__name__}")

    return convert(value)


def put(record: Record, section: str, key: str, value: Any, source: str,
        unit: str | None = None, status: str = "extracted") -> None:
    target = getattr(record, section)
    try:
        converted = json_value(value)
        target[key] = (missing("Attribute is null", source) if converted is None else
                       MetadataValue(value=converted, source=source, unit=unit, status=status))
    except Exception as error:
        target[key] = missing(str(error), source)
        record.warnings.append(f"{section}.{key}: {error}")


def attribute(record: Record, section: str, key: str, obj: Any, name: str,
              source: str, unit: str | None = None) -> None:
    try:
        value = getattr(obj, name)
    except AttributeError:
        return
    except Exception as error:
        record.warnings.append(f"{source}.{name}: {error}")
        return
    put(record, section, key, value, f"{source}.{name}", unit)
