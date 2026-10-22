from types import SimpleNamespace

import numpy as np
import pytest

from mliphub import Record, extract
from mliphub.cli import parser
from conftest import AtomsContract


def test_single_call_saves_default_file_without_running_calculation(atoms, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    expected = atoms.energy()
    original = atoms.calc.calculate
    result = extract(atoms, include_environment=False)
    saved = Record.load(tmp_path / "mliphub-metadata.json")
    assert saved == result
    assert saved.results["energy"].value == expected
    assert saved.results["scope_wall_time"].status == "unavailable"
    assert atoms.calc.calls == 1
    assert atoms.calc.calculate == original
    assert saved.provenance["mode"].value == "one_call_extraction"


def test_no_arguments_discovers_calling_system_and_deduplicates_aliases(atoms, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    alias = atoms
    result = extract(include_environment=False)
    assert result.provenance["target_selection"].value == "calling scope: atoms"
    assert result.system["final.number_of_atoms"].value == 2
    assert alias is atoms


def test_ambiguous_namespace_requires_explicit_target(atoms, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    other = AtomsContract()
    with pytest.raises(ValueError, match="Multiple atomic systems"):
        extract(include_environment=False)
    assert not list(tmp_path.iterdir())
    assert other is not atoms
    extract(atoms, include_environment=False)


def test_no_system_and_invalid_target_give_useful_errors(tmp_path):
    with pytest.raises(ValueError, match="No atomic system"):
        exec("extract(output=destination)", {"extract": extract, "destination": tmp_path / "none.json"})
    with pytest.raises(TypeError, match="Atoms"):
        extract(42, output=tmp_path / "none.json")


def test_preserves_custom_atomic_arrays_info_and_survives_bad_value(atoms, tmp_path):
    atoms.info = {"reference": "doi:example", "unsupported": object()}
    atoms.arrays = {"positions": atoms.positions, "custom_labels": np.array([3, 4])}
    result = extract(atoms, output=tmp_path / "record.json", include_environment=False)
    assert result.system["final.info.reference"].value == "doi:example"
    assert result.system["final.info.unsupported"].status == "unavailable"
    assert result.system["final.arrays.custom_labels"].value == [3, 4]


def test_generic_loaded_model_configuration_and_artifact_discovery(atoms, tmp_path):
    model_path = tmp_path / "model.bin"
    model_path.write_bytes(b"weights")
    atoms.calc.model_paths = [model_path, model_path]
    atoms.calc.model = SimpleNamespace(
        config={"hidden_channels": 64, "bad": object(), "num_layers": 3},
        training_config={"datasets": ["local-dataset"], "epochs": 42},
    )
    result = extract(atoms, output=tmp_path / "metadata.json", include_environment=False)
    assert result.model["calculator.model.config.hidden_channels"].value == 64
    assert result.model["calculator.model.config.bad"].status == "unavailable"
    assert result.model["calculator.model.config.num_layers"].value == 3
    assert result.training["epochs"].value == 42
    assert len(result.artifacts) == 1
    assert result.artifacts[0].path == str(model_path)
    assert result.provenance["model_artifact_binding"].status == "inferred"
    assert atoms.calc.calls == 0


def test_missing_discovered_checkpoint_does_not_stop_extraction(atoms, tmp_path):
    atoms.calc.parameters["checkpoint_path"] = str(tmp_path / "missing.model")
    result = extract(atoms, output=tmp_path / "metadata.json", include_environment=False)
    assert not result.artifacts
    assert any("cannot fingerprint" in warning for warning in result.warnings)
    assert result.system["final.number_of_atoms"].value == 2


def test_optional_failure_does_not_erase_other_information(atoms, tmp_path):
    def broken(*args):
        raise RuntimeError("not exposed")

    atoms.get_masses = broken
    atoms.calc.check_state = broken
    atoms.energy = lambda: None
    atoms.calc.results = {"energy": -1.}
    result = extract(atoms, output=tmp_path / "record.json", include_environment=False)
    assert result.system["final.masses"].status == "unavailable"
    assert result.system["final.positions"].status == "extracted"
    assert "energy" not in result.results
    assert any("Cached predictions" in warning for warning in result.warnings)


def test_no_unrelated_caller_configuration_is_recorded(atoms, tmp_path):
    training_config = {"datasets": ["unrelated model"]}
    secret = "should not be saved"
    extract(atoms, output=tmp_path / "record.json", include_environment=False)
    text = (tmp_path / "record.json").read_text()
    assert secret not in text
    assert training_config["datasets"][0] not in text


def test_trajectory_cli_has_default_output():
    args = parser().parse_args(["extract", "md.traj"])
    assert str(args.output) == "mliphub-metadata.json"


def test_path_dispatch_saves_automatically(tmp_path, monkeypatch):
    import mliphub.collect as collection
    from mliphub.schema import new_record

    path = tmp_path / "run.traj"
    output = tmp_path / "metadata.json"
    called = []

    def trajectory_reader(target):
        called.append(target)
        return new_record()

    monkeypatch.setattr(collection, "extract_trajectory", trajectory_reader)
    result = extract(path, output=output)
    assert called == [path]
    assert Record.load(output) == result


class Driver:
    def __init__(self, atoms):
        self.atoms = atoms
        self.nsteps = 12

    def run(self):
        raise AssertionError("Extraction must not run the driver")


def test_discover_driver_bound_to_selected_atoms(atoms, tmp_path, monkeypatch):
    import mliphub.collect as collection
    from mliphub.values import put

    dynamics = Driver(atoms)

    def capture(driver, result):
        assert driver is dynamics
        put(result, "simulation", "step_count", driver.nsteps, "driver.nsteps")

    monkeypatch.setattr(collection, "capture_dynamics", capture)
    result = extract(atoms, output=tmp_path / "record.json", include_environment=False)
    assert result.simulation["step_count"].value == 12


def test_multiple_drivers_are_not_silently_selected(atoms, tmp_path):
    first, second = Driver(atoms), Driver(atoms)
    result = extract(atoms, output=tmp_path / "record.json", include_environment=False)
    assert "step_count" not in result.simulation
    assert any("Multiple drivers" in warning for warning in result.warnings)
    assert first is not second


def test_foreign_driver_rejected(atoms, tmp_path):
    with pytest.raises(ValueError, match="selected atomic system"):
        extract(atoms, dynamics=Driver(AtomsContract()), output=tmp_path / "record.json")


def test_committee_does_not_claim_first_members_training_as_shared(atoms, tmp_path):
    atoms.calc.models = [
        SimpleNamespace(training_config={"datasets": ["first"]}),
        SimpleNamespace(training_config={"datasets": ["second"]}),
    ]
    result = extract(atoms, output=tmp_path / "record.json", include_environment=False)
    assert result.training["datasets"].status == "unavailable"
    assert result.training["calculator.models[0].training_config.datasets"].value == ["first"]
    assert result.training["calculator.models[1].training_config.datasets"].value == ["second"]
