"""The bundled Python exporter and the browser importer share an actual JSON fixture."""
import json
from pathlib import Path

import pytest

from mliphub import Record, extract
from mliphub.schema import new_record


ROOT = Path(__file__).resolve().parents[1]


def test_checked_in_browser_schema_matches_python_schema():
    browser_schema = json.loads((ROOT / "app/data/extractor-record.schema.json").read_text())
    assert browser_schema == Record.model_json_schema()


def test_browser_fixture_is_valid_python_record():
    record = Record.load(ROOT / "tests/fixtures/extractor-record.json")
    assert record.model["id"].value == "mace-mp-0"
    assert record.model["architecture_id"].value == "mace"
    assert "synthetic" in record.system["final.info.fixture"].value.lower()


def test_explicit_identity_is_optional_and_does_not_predict(atoms, tmp_path):
    record = extract(atoms, model_id="mace-mp-0", output=tmp_path / "record.json", include_environment=False)
    assert record.model["id"].value == "mace-mp-0"
    assert record.model["id"].status == "user_provided"
    assert atoms.calc.calls == 0


def test_architecture_and_checkpoint_identity_are_independent(atoms, tmp_path):
    atoms.calc.model_id = "custom-checkpoint"
    record = extract(atoms, output=tmp_path / "record.json", include_environment=False)
    assert record.model["id"].value == "custom-checkpoint"
    assert record.model["architecture_id"].status == "unavailable"
    with pytest.raises(ValueError, match="conflicts"):
        extract(atoms, model_id="other", output=tmp_path / "other.json", include_environment=False)


def test_unknown_identity_remains_explicitly_unavailable():
    record = new_record()
    assert record.model["id"].status == "unavailable"
    assert record.model["architecture_id"].status == "unavailable"
