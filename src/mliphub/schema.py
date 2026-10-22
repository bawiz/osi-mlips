"""Versioned, framework-independent records with provenance on every metadata value."""
from __future__ import annotations

import json
import math
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, JsonValue, model_validator

SECTIONS = ("model", "training", "system", "simulation", "environment", "results", "reliability", "provenance")


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)


class MetadataValue(StrictModel):
    value: JsonValue = None
    status: Literal["extracted", "user_provided", "inferred", "unavailable"]
    source: str = Field(min_length=1)
    unit: str | None = None
    reason: str | None = None

    @model_validator(mode="after")
    def check_status(self):
        if self.status == "unavailable":
            if self.value is not None or not self.reason:
                raise ValueError("Unavailable values require null and an explanation")
        elif self.value is None:
            raise ValueError("Known values cannot be null; use status='unavailable'")

        def finite(value):
            if isinstance(value, float) and not math.isfinite(value):
                raise ValueError("Metadata must contain finite JSON numbers")
            if isinstance(value, dict):
                for item in value.values():
                    finite(item)
            elif isinstance(value, list):
                for item in value:
                    finite(item)

        finite(self.value)
        return self


class Artifact(StrictModel):
    path: str
    role: str
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    size_bytes: int = Field(ge=0)


class Record(StrictModel):
    schema_version: Literal["0.1.0"] = "0.1.0"
    run_id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    model: dict[str, MetadataValue] = Field(default_factory=dict)
    training: dict[str, MetadataValue] = Field(default_factory=dict)
    system: dict[str, MetadataValue] = Field(default_factory=dict)
    simulation: dict[str, MetadataValue] = Field(default_factory=dict)
    environment: dict[str, MetadataValue] = Field(default_factory=dict)
    results: dict[str, MetadataValue] = Field(default_factory=dict)
    reliability: dict[str, MetadataValue] = Field(default_factory=dict)
    provenance: dict[str, MetadataValue] = Field(default_factory=dict)
    artifacts: list[Artifact] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)

    def save(self, path: str | Path) -> Path:
        """Revalidate and atomically replace the destination; never write partial JSON."""
        validated = Record.model_validate(self.model_dump())
        destination = Path(path)
        if any(destination.resolve() == Path(artifact.path).resolve() for artifact in self.artifacts):
            raise ValueError("Metadata output must not overwrite a referenced artifact")
        destination.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps(validated.model_dump(mode="json"), indent=2, allow_nan=False) + "\n"
        fd, temporary = tempfile.mkstemp(prefix=f".{destination.name}.", dir=destination.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(payload)
            os.replace(temporary, destination)
        finally:
            Path(temporary).unlink(missing_ok=True)
        return destination

    @classmethod
    def load(cls, path: str | Path) -> Record:
        return cls.model_validate_json(Path(path).read_text(encoding="utf-8"))


def missing(reason: str, source: str = "not observed") -> MetadataValue:
    return MetadataValue(status="unavailable", source=source, reason=reason)


def new_record() -> Record:
    record = Record()
    for key in ("id", "name", "architecture_id", "implementation_class", "framework", "architecture",
                "supported_atomic_numbers", "cutoff_radius", "parameter_count"):
        record.model[key] = missing("No accessible model metadata")
    for key in ("datasets", "hyperparameters", "reference_method", "epochs", "optimizer"):
        record.training[key] = missing("Not preserved in accessible model metadata; supply training provenance explicitly")
    for key in ("accuracy", "uncertainty"):
        record.reliability[key] = missing("Requires reference data or an explicit diagnostic method")
    record.results["status"] = missing("No execution was observed")
    record.provenance["collector"] = MetadataValue(value="mliphub 0.1.0", status="extracted", source="mliphub")
    return record
