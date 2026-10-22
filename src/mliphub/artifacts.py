"""Fingerprint files without executing model/checkpoint contents."""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

from .schema import Artifact


def fingerprint(path: str | Path, role: str = "model") -> Artifact:
    path = Path(path)
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as handle:
        before = os.fstat(handle.fileno())
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
            size += len(block)
        after = os.fstat(handle.fileno())
    if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns) or size != after.st_size:
        raise ValueError(f"Artifact changed while hashing: {path}")
    return Artifact(path=str(path), role=role, sha256=digest.hexdigest(), size_bytes=size)
