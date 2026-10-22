"""Contract tests for adapter field layouts, independent of heavyweight ML libraries."""
from types import SimpleNamespace

import pytest

from mliphub import snapshot
from mliphub.adapters import register_adapter
from conftest import CalculatorContract


class Parameter:
    device = "cpu"
    dtype = "float64"

    def numel(self):
        return 42


class Model:
    atomic_numbers = [1, 8]
    num_interactions = 2

    def parameters(self):
        return iter([Parameter(), Parameter()])


def test_mace_metadata_and_missing_training(atoms):
    cls = type("MACECalculator", (CalculatorContract,), {"__module__": "mace.calculators.mace"})
    calc = cls()
    calc.r_max, calc.length_units_to_A = 5.0, 2.0
    calc.z_table = SimpleNamespace(zs=[1, 8])
    calc.models = [Model()]
    atoms.calc = calc
    result = snapshot(atoms, include_environment=False)
    assert result.model["framework"].value == "MACE"
    assert result.model["cutoff_radius"].value == 10.0
    assert result.model["parameter_count"].value == 84
    assert result.training["datasets"].status == "unavailable"
    assert calc.calls == 0


def test_committee_keeps_member_details(atoms):
    cls = type("MACECalculator", (CalculatorContract,), {"__module__": "mace.calculators.mace"})
    calc = cls()
    first, second = Model(), Model()
    first.training_metadata = {"datasets": ["dataset-a"]}
    second.training_metadata = {"datasets": ["dataset-b"]}
    calc.models = [first, second]
    atoms.calc = calc
    result = snapshot(atoms, include_environment=False)
    assert result.model["member_count"].value == 2
    assert result.training["member_0.datasets"].value == ["dataset-a"]
    assert result.training["member_1.datasets"].value == ["dataset-b"]
    assert result.training["datasets"].status == "unavailable"


def test_chgnet_exposes_training_only_when_preserved(atoms):
    cls = type("CHGNetCalculator", (CalculatorContract,), {"__module__": "chgnet.model.dynamics"})
    calc = cls()
    calc.model = Model()
    calc.model.version = "custom"
    calc.model.model_args = {"atom_fea_dim": 64}
    calc.model.graph_converter = SimpleNamespace(atom_graph_cutoff=6., bond_graph_cutoff=3.)
    calc.model.training_config = {"epochs": 50, "optimizer": "Adam"}
    atoms.calc = calc
    result = snapshot(atoms, include_environment=False)
    assert result.model["framework"].value == "CHGNet"
    assert result.model["cutoff_radius"].value == 6.
    assert result.training["epochs"].value == 50
    assert result.training["datasets"].status == "unavailable"


def test_broken_extension_falls_back_atomically(atoms):
    class BrokenAdapter:
        name = "test_broken"

        def detect(self, calculator):
            return isinstance(calculator, CalculatorContract)

        def extract(self, calculator, record):
            record.model.clear()
            raise RuntimeError("unsupported version")

    import mliphub.adapters as adapters
    before = adapters._adapters.copy()
    try:
        register_adapter(BrokenAdapter())
        with pytest.raises(ValueError):
            register_adapter(BrokenAdapter())
        result = snapshot(atoms, include_environment=False)
        assert "calculator_class" in result.model
        assert result.provenance["adapter"].value == "generic_ase"
        assert any("unsupported version" in warning for warning in result.warnings)
    finally:
        adapters._adapters[:] = before
