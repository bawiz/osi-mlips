"""A tiny calculator contract for core tests; actual ASE integration is tested separately."""
import numpy as np
import pytest


class AtomsContract:
    def __init__(self, calculator=None):
        self.calc = calculator
        self.positions = np.array([[0., 0., 0.], [0., 0., 0.74]])
        self.cell = type("Cell", (), {"array": np.eye(3) * 10})()
        self.constraints = []

    def __len__(self):
        return len(self.positions)

    def get_atomic_numbers(self):
        return np.array([1, 1])

    def get_positions(self):
        return self.positions.copy()

    def get_pbc(self):
        return np.array([False, False, False])

    def get_masses(self):
        return np.ones(2)

    def has(self, name):
        return False

    def energy(self):
        if not self.calc.results or self.calc.check_state(self):
            self.calc.calculate(self)
        return self.calc.results["energy"]


class CalculatorContract:
    implemented_properties = ["energy", "forces"]

    def __init__(self):
        self.parameters = {"cutoff": 5.0}
        self.results = {}
        self.positions = None
        self.calls = 0

    def calculate(self, atoms, *args, **kwargs):
        self.calls += 1
        self.positions = atoms.get_positions()
        self.results = {"energy": float((self.positions ** 2).sum()), "forces": -2 * self.positions}

    def check_state(self, atoms):
        return self.positions is None or not np.array_equal(atoms.positions, self.positions)


@pytest.fixture
def atoms():
    return AtomsContract(CalculatorContract())
