"""Adapters inspect already-loaded objects. Register extensions with register_adapter()."""
from __future__ import annotations

from typing import Any, Protocol

from ..schema import Record
from ..values import attribute, put


class Adapter(Protocol):
    name: str

    def detect(self, calculator: Any) -> bool: ...

    def extract(self, calculator: Any, record: Record) -> None: ...


_adapters: list[Adapter] = []


def register_adapter(adapter: Adapter) -> None:
    """Register an adapter before recording. Names must be unique."""
    if any(item.name == adapter.name for item in _adapters):
        raise ValueError(f"Adapter already registered: {adapter.name}")
    _adapters.insert(0, adapter)


def names() -> list[str]:
    return [adapter.name for adapter in _adapters]


def inspect_calculator(calculator: Any, record: Record) -> None:
    class_name = f"{type(calculator).__module__}.{type(calculator).__qualname__}"
    put(record, "model", "calculator_class", class_name, "type(calculator)")
    attribute(record, "model", "implemented_properties", calculator, "implemented_properties", "calculator")
    attribute(record, "simulation", "calculator_parameters", calculator, "parameters", "calculator")
    for adapter in _adapters:
        try:
            if not adapter.detect(calculator):
                continue
            # An incompatible adapter must not leave a half-written model description.
            candidate = record.model_copy(deep=True)
            adapter.extract(calculator, candidate)
            for section in ("model", "training", "environment", "simulation"):
                setattr(record, section, getattr(candidate, section))
            record.warnings = candidate.warnings
            put(record, "provenance", "adapter", adapter.name, "mliphub adapter registry")
            return
        except Exception as error:
            record.warnings.append(f"Adapter {adapter.name} failed: {type(error).__name__}: {error}")
    put(record, "provenance", "adapter", "generic_ase", "mliphub adapter registry")


def model_details(model: Any, record: Record, source: str, *, prefix: str = "") -> None:
    put(record, "model", f"{prefix}implementation_class", f"{type(model).__module__}.{type(model).__qualname__}",
        f"type({source})")
    put(record, "model", f"{prefix}architecture", f"{type(model).__module__}.{type(model).__qualname__}",
        f"type({source})")
    try:
        parameters = model.parameters()
        count = 0
        first = None
        for parameter in parameters:
            if first is None:
                first = parameter
            count += parameter.numel()
        put(record, "model", f"{prefix}parameter_count", count, f"sum({source}.parameters().numel())")
        if first is not None:
            put(record, "environment", f"{prefix}model_device", str(first.device), f"{source}.parameters()")
            put(record, "environment", f"{prefix}model_dtype", str(first.dtype), f"{source}.parameters()")
    except Exception as error:
        record.warnings.append(f"{source}: parameter inspection unavailable: {error}")
    for attr in ("training_metadata", "training_config"):
        try:
            metadata = getattr(model, attr, None)
            if isinstance(metadata, dict):
                put(record, "training", f"{prefix}{attr}", metadata, f"{source}.{attr}")
                for key in ("datasets", "hyperparameters", "reference_method", "epochs", "optimizer"):
                    if key in metadata:
                        put(record, "training", f"{prefix}{key}", metadata[key], f"{source}.{attr}.{key}")
        except Exception as error:
            record.warnings.append(f"{source}.{attr}: {error}")


class MACEAdapter:
    name = "mace"

    def detect(self, calculator):
        return any(cls.__module__.startswith("mace.") for cls in type(calculator).__mro__)

    def extract(self, calculator, record):
        put(record, "model", "architecture_id", "mace", "calculator class module", status="inferred")
        put(record, "model", "framework", "MACE", "calculator class module", status="inferred")
        attribute(record, "model", "model_type", calculator, "model_type", "calculator")
        attribute(record, "model", "selected_head", calculator, "head", "calculator")
        attribute(record, "model", "available_heads", calculator, "available_heads", "calculator")
        attribute(record, "environment", "requested_device", calculator, "device", "calculator")
        if hasattr(calculator, "r_max"):
            conversion = float(getattr(calculator, "length_units_to_A", 1.0))
            put(record, "model", "cutoff_radius", float(calculator.r_max) * conversion,
                "calculator.r_max * calculator.length_units_to_A (default 1)", "angstrom")
        table = getattr(calculator, "z_table", None)
        if table is not None:
            attribute(record, "model", "supported_atomic_numbers", table, "zs", "calculator.z_table")
        models = getattr(calculator, "models", [])
        put(record, "model", "member_count", len(models), "len(calculator.models)")
        for index, model in enumerate(models):
            # Committees retain member-specific metadata; no first-model assumptions.
            prefix = "" if len(models) == 1 else f"member_{index}."
            model_details(model, record, f"calculator.models[{index}]", prefix=prefix)
            attribute(record, "model", f"{prefix}atomic_numbers", model, "atomic_numbers", f"calculator.models[{index}]")
            attribute(record, "model", f"{prefix}num_interactions", model, "num_interactions", f"calculator.models[{index}]")


class CHGNetAdapter:
    name = "chgnet"

    def detect(self, calculator):
        return any(cls.__module__.startswith("chgnet.") for cls in type(calculator).__mro__)

    def extract(self, calculator, record):
        put(record, "model", "architecture_id", "chgnet", "calculator class module", status="inferred")
        put(record, "model", "framework", "CHGNet", "calculator class module", status="inferred")
        model = calculator.model
        model_details(model, record, "calculator.model")
        attribute(record, "model", "version", model, "version", "calculator.model")
        attribute(record, "model", "architecture_parameters", model, "model_args", "calculator.model")
        attribute(record, "environment", "requested_device", calculator, "device", "calculator")
        converter = getattr(model, "graph_converter", None)
        if converter is not None:
            attribute(record, "model", "cutoff_radius", converter, "atom_graph_cutoff", "calculator.model.graph_converter", "angstrom")
            attribute(record, "model", "bond_cutoff_radius", converter, "bond_graph_cutoff", "calculator.model.graph_converter", "angstrom")


register_adapter(MACEAdapter())
register_adapter(CHGNetAdapter())
