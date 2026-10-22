"""Actual ASE integration: cache/force invariance, MD recording and retrospective I/O."""
import numpy as np
import pytest

pytest.importorskip("ase")
from ase import units
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.io import write
from ase.md.verlet import VelocityVerlet

from mliphub import Record, extract, extract_trajectory, record
from mliphub.demo import run_demo


def test_energy_force_invariance_and_caching():
    baseline = bulk("Cu")
    baseline.calc = EMT()
    expected_energy, expected_forces = baseline.get_potential_energy(), baseline.get_forces()
    atoms = bulk("Cu")
    atoms.calc = EMT()
    with record(atoms, include_environment=False) as recorder:
        assert atoms.get_potential_energy() == expected_energy
        np.testing.assert_array_equal(atoms.get_forces(), expected_forces)
        atoms.get_potential_energy()
    assert recorder.record.results["calculate_calls"].value == 1
    assert recorder.record.results["energy"].value == expected_energy


def test_md_matches_unrecorded_trajectory(tmp_path):
    baseline = bulk("Cu").repeat((2, 2, 2))
    baseline.set_velocities(np.random.default_rng(1).normal(scale=0.01, size=(len(baseline), 3)))
    atoms = baseline.copy()
    baseline.calc, atoms.calc = EMT(), EMT()
    VelocityVerlet(baseline, 1 * units.fs, logfile=None).run(5)
    driver = VelocityVerlet(atoms, 1 * units.fs, logfile=None)
    with record(atoms, dynamics=driver, run_type="md", output=tmp_path / "md.json") as recorder:
        driver.run(5)
    np.testing.assert_array_equal(atoms.positions, baseline.positions)
    np.testing.assert_array_equal(atoms.get_velocities(), baseline.get_velocities())
    assert recorder.record.simulation["steps_in_scope"].value == 5
    assert recorder.record.simulation["timestep"].value == pytest.approx(1.)
    assert Record.load(tmp_path / "md.json").results["status"].value == "completed"


def test_retrospective_extraction_does_not_invent_execution(tmp_path):
    atoms = bulk("Cu")
    atoms.calc = EMT()
    atoms.get_potential_energy()
    path = tmp_path / "run.traj"
    write(path, [atoms, atoms])
    result = extract_trajectory(path)
    assert result.simulation["saved_frame_count"].value == 2
    assert result.results["energy"].value == atoms.get_potential_energy()
    assert result.results["status"].status == "unavailable"
    assert result.simulation["runtime"].status == "unavailable"
    assert not result.environment


def test_offline_demo(tmp_path):
    directory = run_demo(tmp_path / "demo")
    assert Record.load(directory / "md.json").simulation["steps_in_scope"].value == 5
    assert extract_trajectory(directory / "md.traj").simulation["saved_frame_count"].value == 6
    with pytest.raises(FileExistsError):
        run_demo(directory)


def test_one_call_after_md_discovers_driver_and_saves(tmp_path):
    atoms = bulk("Cu")
    atoms.calc = EMT()
    dynamics = VelocityVerlet(atoms, 1 * units.fs, logfile=None)
    dynamics.run(2)
    cached_energy = atoms.calc.results["energy"]
    result = extract(atoms, output=tmp_path / "extracted.json", include_environment=False)
    assert result.simulation["step_count"].value == 2
    assert result.simulation["timestep"].value == pytest.approx(1.)
    assert result.results["energy"].value == cached_energy
    assert result.results["scope_wall_time"].status == "unavailable"
    assert Record.load(tmp_path / "extracted.json") == result
