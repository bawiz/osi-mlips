"""Synthetic examples must stay compatible with the production extraction schema."""
import json
import runpy
from pathlib import Path

from mliphub.schema import Record

ROOT = Path(__file__).resolve().parents[1]


def test_all_demo_records_validate_and_are_explicitly_synthetic():
    records = json.loads((ROOT / "app/data/demo-records.json").read_text())
    assert len(records) == 320
    assert len({r["run_id"] for r in records}) == 320
    for data in records:
        record = Record.model_validate(data)
        assert record.provenance["synthetic"].value is True
        assert record.provenance["evidence_status"].value == "synthetic_demo"
        assert record.model["id"].value.startswith("demo-")
        individual = ROOT / "examples/synthetic-library/records" / f"{record.run_id}.json"
        assert Record.load(individual).model_dump(mode="json") == data


def test_demo_generator_is_reproducible_and_checkpoint_training_metadata_is_consistent():
    generate = runpy.run_path(str(ROOT / "scripts/generate-demo-library.py"))["generate"]
    records = generate()
    assert records == json.loads((ROOT / "app/data/demo-records.json").read_text())
    training = {}
    for record in records:
        model_id = record["model"]["id"]["value"]
        if model_id in training:
            assert record["training"] == training[model_id]
        training[model_id] = record["training"]
