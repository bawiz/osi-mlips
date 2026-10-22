import pytest

from mliphub import record
from mliphub.cli import main


def test_output_failure_does_not_mask_simulation_exception(atoms, tmp_path):
    blocked = tmp_path / "not-a-directory"
    blocked.write_text("file")
    with pytest.raises(ArithmeticError, match="original"):
        with record(atoms, output=blocked / "metadata.json", include_environment=False) as recorder:
            raise ArithmeticError("original")
    assert any("Could not save" in warning for warning in recorder.record.warnings)
    assert "calculate" not in atoms.calc.__dict__


def test_cli_refuses_to_overwrite_metadata_input(tmp_path):
    model = tmp_path / "model.pt"
    model.write_bytes(b"checkpoint")
    metadata = tmp_path / "training.json"
    original = '{"training": {"epochs": 12}}'
    metadata.write_text(original)
    assert main(["inspect", str(model), "--metadata", str(metadata), "-o", str(metadata)]) == 1
    assert metadata.read_text() == original
