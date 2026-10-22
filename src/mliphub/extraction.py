"""Static extraction and retrospective trajectory inspection; never invoke a prediction."""
from __future__ import annotations

import json
from collections.abc import Mapping
from pathlib import Path

from .adapters import inspect_calculator
from .artifacts import fingerprint
from .environment import capture_environment
from .schema import Record, SECTIONS, missing, new_record
from .values import attribute, put

RESULT_UNITS = {
    "energy": "eV", "free_energy": "eV", "energies": "eV", "forces": "eV/angstrom",
    "stress": "eV/angstrom^3", "stresses": "eV/angstrom^3",
    "dipole": "e*angstrom", "magmom": "mu_B", "magmoms": "mu_B",
}


def require_ase():
    try:
        import ase
    except ImportError as error:
        raise ImportError("ASE support requires: pip install 'mliphub[ase]'") from error
    return ase


def capture_system(atoms, record: Record, key: str) -> None:
    """Copy only state; getters used here do not call the calculator."""
    readers = {
        "number_of_atoms": lambda: len(atoms), "atomic_numbers": atoms.get_atomic_numbers,
        "positions": atoms.get_positions, "cell": lambda: atoms.cell.array, "pbc": atoms.get_pbc,
        "masses": lambda: atoms.get_masses(),
    }
    for name in ("momenta", "initial_charges", "initial_magmoms", "tags"):
        try:
            if atoms.has(name):
                readers[name] = (atoms.get_momenta if name == "momenta" else lambda name=name: atoms.get_array(name))
        except Exception as error:
            record.warnings.append(f"{key}.{name}: {error}")
    # Store independently: a large positions array must not erase cell/composition.
    for name, reader in readers.items():
        unit = {"positions": "angstrom", "cell": "angstrom", "masses": "atomic_mass_unit",
                "momenta": "sqrt(atomic_mass_unit*eV)", "initial_charges": "e",
                "initial_magmoms": "mu_B"}.get(name)
        try:
            put(record, "system", f"{key}.{name}", reader(), f"ASE Atoms ({key})", unit)
        except Exception as error:
            record.system[f"{key}.{name}"] = missing(str(error), f"ASE Atoms ({key})")
            record.warnings.append(f"{key}.{name}: {error}")
    constraints = []
    failed_constraints = []
    for constraint in getattr(atoms, "constraints", []):
        try:
            constraints.append(constraint.todict())
        except Exception as error:
            failed_constraints.append(type(constraint).__name__)
            record.warnings.append(f"{key}: constraint {type(constraint).__name__} could not be serialized: {error}")
    if failed_constraints:
        record.system[f"{key}.constraints"] = missing(f"Cannot serialize constraints: {failed_constraints}", f"ASE Atoms ({key})")
    else:
        put(record, "system", f"{key}.constraints", constraints, f"ASE Atoms ({key})")


def capture_results(atoms, calculator, record: Record) -> None:
    """Report cached results only if they match the final structure."""
    results = getattr(calculator, "results", {})
    if not results:
        return
    check_state = getattr(calculator, "check_state", None)
    if not callable(check_state):
        record.warnings.append("Calculator has no check_state(); cached results were omitted because their structure cannot be verified")
        return
    if check_state(atoms):
        record.warnings.append("Cached calculator results do not match the final structure; omitted to avoid stale predictions")
        return
    for name, value in results.items():
        put(record, "results", name, value, f"calculator.results.{name}; valid for final structure", RESULT_UNITS.get(name))


def supply_metadata(record: Record, metadata: Mapping | None, source: str = "user metadata") -> None:
    """Merge explicit training/simulation/model declarations, without overwriting observations."""
    if metadata is None:
        return
    if not isinstance(metadata, Mapping):
        raise ValueError("Supplied metadata must be a JSON object of section-to-field mappings")
    for section, fields in metadata.items():
        if section not in SECTIONS or not isinstance(fields, Mapping):
            raise ValueError(f"Metadata section must be one of {SECTIONS} and contain a mapping: {section}")
        for key, value in fields.items():
            if not isinstance(key, str):
                raise ValueError("Metadata field names must be strings")
            target = getattr(record, section)
            if key in target and target[key].status != "unavailable":
                # Require an explicit name for competing declarations.
                raise ValueError(f"Cannot overwrite observed {section}.{key}; use a distinct field name")
            put(record, section, key, value, source, status="user_provided")


def read_metadata(path: str | Path | None):
    return None if path is None else json.loads(Path(path).read_text(encoding="utf-8"))


def inspect_model(path: str | Path, *, framework: str | None = None, metadata: Mapping | None = None) -> Record:
    record = new_record()
    record.artifacts.append(fingerprint(path))
    put(record, "provenance", "mode", "artifact_inspection", "mliphub")
    if framework:
        put(record, "model", "framework", framework, "framework argument", status="user_provided")
    record.warnings.append("Artifact inspection fingerprints bytes only. Inspect a loaded calculator to extract architecture; checkpoint deserialization is not performed.")
    # The host inspecting a file is not necessarily the host that trained or ran it.
    supply_metadata(record, metadata)
    return record


def snapshot(atoms, calculator=None, *, metadata: Mapping | None = None,
             model_paths=(), include_environment: bool = True) -> Record:
    record = new_record()
    calculator = calculator if calculator is not None else atoms.calc
    capture_system(atoms, record, "final")
    if calculator is not None:
        for label, collector in (("Calculator inspection", lambda: inspect_calculator(calculator, record)),
                                 ("Cached predictions", lambda: capture_results(atoms, calculator, record))):
            try:
                collector()
            except Exception as error:
                record.warnings.append(f"{label}: {type(error).__name__}: {error}")
    if include_environment:
        try:
            capture_environment(record)
        except Exception as error:
            record.warnings.append(f"Environment inspection incomplete: {error}")
        put(record, "provenance", "environment_scope", "collector process at inspection time; not original training/execution host", "mliphub")
    for path in model_paths:
        record.artifacts.append(fingerprint(path))
    if record.artifacts:
        put(record, "provenance", "model_artifact_binding", "User-supplied model paths; correspondence to loaded weights is not verified", "model_paths argument", status="user_provided")
    put(record, "provenance", "mode", "snapshot", "mliphub")
    supply_metadata(record, metadata)
    return record


def extract_trajectory(path: str | Path, *, model_paths=(), metadata: Mapping | None = None,
                       format: str | None = None) -> Record:
    require_ase()
    from ase.io import iread

    record = new_record()
    first = last = None
    count = 0
    # iread releases frames as it proceeds. No full trajectory in the JSON or RAM.
    for frame in iread(str(path), index=":", format=format):
        if first is None:
            first = frame
        last = frame
        count += 1
    if last is None:
        raise ValueError("Trajectory contains no structures")
    capture_system(first, record, "initial")
    capture_system(last, record, "final")
    if last.calc is not None:
        inspect_calculator(last.calc, record)
        capture_results(last, last.calc, record)
    record.artifacts.append(fingerprint(path, "trajectory"))
    for model_path in model_paths:
        record.artifacts.append(fingerprint(model_path))
    put(record, "simulation", "saved_frame_count", count, "ASE trajectory reader")
    put(record, "provenance", "mode", "retrospective", "mliphub")
    for key in ("runtime", "original_environment", "thermostat", "timestep"):
        record.simulation[key] = missing("Not recoverable from structures alone; supply original run metadata")
    record.warnings.append("Saved frames do not establish the number of MD steps, original model identity, or whether execution completed.")
    supply_metadata(record, metadata)
    return record


def capture_dynamics(dynamics, record: Record) -> None:
    """Capture the supplied ASE driver, without assuming an ensemble from its name."""
    require_ase()
    from ase import units

    put(record, "simulation", "driver_class", f"{type(dynamics).__module__}.{type(dynamics).__qualname__}", "type(dynamics)")
    if callable(getattr(dynamics, "todict", None)):
        try:
            put(record, "simulation", "driver_parameters", dynamics.todict(), "dynamics.todict(); native ASE units")
        except Exception as error:
            record.warnings.append(f"Driver settings unavailable: {error}")
    if hasattr(dynamics, "dt"):
        put(record, "simulation", "timestep", float(dynamics.dt) / units.fs, "dynamics.dt / ase.units.fs", "fs")
    attribute(record, "simulation", "step_count", dynamics, "nsteps", "dynamics")
