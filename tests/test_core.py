import hashlib
import json

import numpy as np
import pytest
from pydantic import ValidationError

from mliphub import MetadataValue, Record, inspect_model, snapshot
from mliphub.cli import main
from mliphub.extraction import supply_metadata
from mliphub.schema import missing, new_record
from mliphub.values import json_value, put


def test_artifact_inspection_does_not_deserialize(tmp_path):
    path = tmp_path / "untrusted.model"
    path.write_bytes(b"not a Python checkpoint")
    record = inspect_model(path, framework="MACE", metadata={"training": {"epochs": 200}})
    assert record.artifacts[0].sha256 == hashlib.sha256(path.read_bytes()).hexdigest()
    assert record.model["framework"].status == "user_provided"
    assert record.model["architecture"].status == "unavailable"
    assert record.training["epochs"].value == 200
    assert not record.environment


def test_snapshot_never_predicts_and_handles_cached_results(atoms):
    initial = snapshot(atoms, include_environment=False)
    assert atoms.calc.calls == 0
    assert "energy" not in initial.results
    expected = atoms.energy()
    cached = snapshot(atoms, include_environment=False)
    assert atoms.calc.calls == 1
    assert cached.results["energy"].value == expected
    assert cached.results["forces"].unit == "eV/angstrom"
    atoms.positions[0, 0] += 1
    stale = snapshot(atoms, include_environment=False)
    assert "energy" not in stale.results
    assert any("do not match" in warning for warning in stale.warnings)


@pytest.mark.parametrize("kwargs", [
    {"value": 1, "status": "unavailable", "source": "test", "reason": "missing"},
    {"status": "unavailable", "source": "test"},
    {"status": "extracted", "source": "test"},
    {"value": float("nan"), "status": "extracted", "source": "test"},
    {"value": [float("inf")], "status": "extracted", "source": "test"},
])
def test_invalid_field_provenance_rejected(kwargs):
    with pytest.raises(ValidationError):
        MetadataValue(**kwargs)


def test_save_roundtrip_and_json_schema(tmp_path):
    record = new_record()
    destination = record.save(tmp_path / "sub" / "record.json")
    assert Record.load(destination) == record
    import jsonschema
    jsonschema.validate(json.loads(destination.read_text()), Record.model_json_schema())
    assert not list(destination.parent.glob(".record.json.*"))


def test_missing_sections_are_independent():
    first, second = new_record(), new_record()
    first.training["epochs"] = missing("custom")
    assert first.training["epochs"] != second.training["epochs"]


def test_unsupported_and_large_values_are_explained():
    record = new_record()
    put(record, "model", "bad", object(), "test")
    put(record, "results", "forces", np.zeros((20_000, 3)), "test")
    assert record.model["bad"].status == "unavailable"
    assert record.results["forces"].status == "unavailable"
    assert len(record.warnings) == 2
    assert json_value(np.array([1, 2])) == [1, 2]


def test_user_metadata_cannot_hide_observations():
    record = new_record()
    supply_metadata(record, {"training": {"epochs": 20}})
    assert record.training["epochs"].status == "user_provided"
    with pytest.raises(ValueError, match="overwrite"):
        supply_metadata(record, {"training": {"epochs": 30}})
    with pytest.raises(ValueError):
        supply_metadata(record, {"typo": {"epochs": 30}})


def test_cli_inspection_validation_and_input_protection(tmp_path, capsys):
    artifact = tmp_path / "model.pt"
    artifact.write_bytes(b"weights")
    output = tmp_path / "metadata.json"
    assert main(["inspect", str(artifact), "-o", str(output)]) == 0
    assert main(["validate", str(output)]) == 0
    assert main(["inspect", str(artifact), "-o", str(artifact)]) == 1
    assert artifact.read_bytes() == b"weights"
    output.write_text('{"schema_version": "999"}')
    assert main(["validate", str(output)]) == 1
    assert main(["inspect", str(tmp_path / "missing"), "-o", str(output)]) == 1
    assert "mliphub:" in capsys.readouterr().err


def test_cli_schema(tmp_path):
    output = tmp_path / "schema.json"
    assert main(["schema", "-o", str(output)]) == 0
    assert "MetadataValue" in json.loads(output.read_text())["$defs"]


def test_record_save_protects_referenced_artifacts(tmp_path):
    artifact = tmp_path / "checkpoint.model"
    artifact.write_bytes(b"weights")
    record = inspect_model(artifact)
    with pytest.raises(ValueError, match="overwrite"):
        record.save(artifact)
    assert artifact.read_bytes() == b"weights"


def test_bad_constraint_is_not_silently_reported_as_empty(atoms):
    atoms.constraints = [object()]
    result = snapshot(atoms, include_environment=False)
    assert result.system["final.constraints"].status == "unavailable"
