"""One-call, best-effort extraction from an existing calculation or saved trajectory."""
from __future__ import annotations

import inspect
from itertools import islice
from collections.abc import Mapping
from pathlib import Path

from .adapters import model_details
from .artifacts import fingerprint
from .extraction import capture_dynamics, extract_trajectory, snapshot
from .schema import Record, missing
from .values import attribute, put

DEFAULT_OUTPUT = "mliphub-metadata.json"
_PATH_FIELDS = ("model_path", "model_paths", "checkpoint_path", "checkpoint_file", "model_file", "potential_file")
_CONFIG_FIELDS = ("config", "model_args", "hparams", "hyperparameters", "metadata", "training_metadata", "training_config")
_MODEL_FIELDS = ("name", "version", "model_type", "cutoff", "r_max", "atomic_numbers",
                 "num_interactions", "num_layers", "hidden_channels", "num_features", "heads")
_TRAINING_FIELDS = ("datasets", "dataset", "training_data", "train_file", "valid_file", "test_file",
                    "epochs", "max_epochs", "optimizer", "learning_rate", "loss", "loss_weights", "reference_method")


def _is_atoms(value) -> bool:
    """Check the interface on the type; do not probe arbitrary namespace objects."""
    return all(callable(getattr(type(value), name, None))
               for name in ("get_positions", "get_atomic_numbers", "get_pbc"))


def _state(value) -> dict:
    try:
        state = vars(value)
        return state if isinstance(state, dict) else {}
    except TypeError:
        return {}


def _caller_objects(namespace: Mapping) -> list[tuple[str, object]]:
    seen = set()
    objects = []
    for name, value in namespace.items():
        if not name.startswith("_") and id(value) not in seen:
            seen.add(id(value))
            objects.append((name, value))
    return objects


def _find_atoms(objects):
    candidates = [(name, value) for name, value in objects if _is_atoms(value)]
    # A driver is also a usable entry point if its Atoms is not separately named.
    for name, value in objects:
        if callable(getattr(type(value), "run", None)):
            atoms = _state(value).get("atoms")
            if _is_atoms(atoms) and not any(atoms is item for _, item in candidates):
                candidates.append((f"{name}.atoms", atoms))
    if not candidates:
        raise ValueError("No atomic system found in the calling scope. Use mliphub.extract(atoms) or mliphub.extract('md.traj').")
    if len(candidates) > 1:
        names = ", ".join(name for name, _ in candidates)
        raise ValueError(f"Multiple atomic systems found ({names}); select one with mliphub.extract(atoms).")
    return candidates[0]


def _guard(record, label, function):
    try:
        function()
    except Exception as error:
        record.warnings.append(f"{label}: {type(error).__name__}: {error}")


def _objects(calculator, record):
    if calculator is None:
        return []
    result = [("calculator", calculator)]
    seen = {id(calculator)}
    for name in ("model", "models", "potential"):
        try:
            value = getattr(calculator, name, None)
        except Exception as error:
            record.warnings.append(f"calculator.{name}: {error}")
            continue
        values = value if isinstance(value, (list, tuple)) else [value]
        if len(values) > 64:
            record.warnings.append(f"calculator.{name}: inspecting the first 64 loaded models only")
        for index, model in enumerate(values[:64]):
            if model is not None and not isinstance(model, (str, Path)) and id(model) not in seen:
                seen.add(id(model))
                result.append((f"calculator.{name}" + (f"[{index}]" if isinstance(value, (list, tuple)) else ""), model))
    return result


def _extract_object_metadata(objects, record):
    generic = record.provenance.get("adapter")
    for index, (source, obj) in enumerate(objects):
        # Only explicit checkpoint declarations fill catalogue identity. Calculator
        # package names and model filenames are not evidence of checkpoint identity.
        if len(objects) <= 2:
            for key, attrs in (("id", ("checkpoint_id", "hub_model_id", "model_id")),
                               ("name", ("checkpoint_name", "model_name"))):
                for name in attrs:
                    try:
                        value = getattr(obj, name, None)
                        if isinstance(value, str) and value.strip():
                            put(record, "model", f"{source}.{name}", value, f"{source}.{name}")
                            current = record.model.get(key)
                            if current is None or current.status == "unavailable":
                                put(record, "model", key, value, f"{source}.{name}")
                    except Exception as error:
                        record.warnings.append(f"{source}.{name}: {error}")
        # Framework adapters already perform parameter inspection. For other
        # calculators, inspect accessible loaded models without importing a framework.
        if index and generic and generic.value == "generic_ase":
            prefix = "" if len(objects) == 2 else f"loaded_model_{index - 1}."
            _guard(record, source, lambda: model_details(obj, record, source, prefix=prefix))
        for name in _MODEL_FIELDS:
            attribute(record, "model", f"{source}.{name}", obj, name, source)
        for name in _CONFIG_FIELDS:
            try:
                config = getattr(obj, name, None)
                if not isinstance(config, Mapping):
                    continue
                section = "training" if name.startswith("training_") else "model"
                # Field-by-field conversion preserves the other settings if one
                # value is unsupported or too large to serialize.
                for key, value in islice(config.items(), 256):
                    put(record, section, f"{source}.{name}.{key}", value, f"{source}.{name}.{key}")
                    if section == "training" and key in _TRAINING_FIELDS and len(objects) <= 2:
                        current = record.training.get(key)
                        if current is None or current.status == "unavailable":
                            put(record, "training", key, value, f"{source}.{name}.{key}")
                if len(config) > 256:
                    record.warnings.append(f"{source}.{name}: only the first 256 configuration fields were extracted")
            except Exception as error:
                record.warnings.append(f"{source}.{name}: {error}")


def _extract_atomic_metadata(atoms, record):
    info = getattr(atoms, "info", {})
    if isinstance(info, Mapping):
        for name, value in info.items():
            put(record, "system", f"final.info.{name}", value, f"atoms.info.{name}")
    arrays = getattr(atoms, "arrays", {})
    if isinstance(arrays, Mapping):
        for name, value in arrays.items():
            if name not in {"numbers", "positions", "masses", "momenta", "initial_charges", "initial_magmoms", "tags"}:
                put(record, "system", f"final.arrays.{name}", value, f"atoms.arrays.{name}")
    if callable(getattr(type(atoms), "get_chemical_symbols", None)):
        put(record, "system", "final.elements", sorted(set(atoms.get_chemical_symbols())), "atoms.get_chemical_symbols()")


def _extract_artifacts(objects, record):
    seen = set()
    for source, obj in objects:
        locations = [(source, _state(obj))]
        parameters = _state(obj).get("parameters")
        if isinstance(parameters, Mapping):
            locations.append((f"{source}.parameters", parameters))
        for origin, values in locations:
            for name in _PATH_FIELDS:
                value = values.get(name)
                paths = value if isinstance(value, (list, tuple)) else [value]
                if len(paths) > 64:
                    record.warnings.append(f"{origin}.{name}: fingerprinting the first 64 paths only")
                for path in paths[:64]:
                    if not isinstance(path, (str, Path)):
                        continue
                    candidate = Path(path).expanduser()
                    field_source = f"{origin}.{name}"
                    put(record, "provenance", f"discovered.{field_source}", path, field_source)
                    try:
                        resolved = candidate.resolve()
                        if resolved not in seen:
                            seen.add(resolved)
                            record.artifacts.append(fingerprint(candidate))
                    except (OSError, ValueError) as error:
                        record.warnings.append(f"{field_source}: cannot fingerprint {path}: {error}")
    if record.artifacts:
        put(record, "provenance", "model_artifact_binding",
            "Paths discovered in calculator/model attributes; correspondence to loaded weights is not verified",
            "object attribute discovery", status="inferred")


def extract(target=None, *, output: str | Path = DEFAULT_OUTPUT, dynamics=None,
            include_environment: bool = True, model_id: str | None = None) -> Record:
    """Extract accessible metadata and save JSON in one call, without running a calculation.

    ``extract(atoms)`` inspects that atomic system and its attached calculator.
    ``extract()`` finds a single atomic system in the immediate calling scope.
    ``extract('md.traj')`` reads a saved ASE-compatible trajectory.
    The output defaults to ``mliphub-metadata.json``. The Record is also returned.
    """
    if isinstance(target, (str, Path)):
        record = extract_trajectory(target)
        _declare_identity(record, model_id)
        record.save(output)
        return record
    frame = inspect.currentframe()
    try:
        caller = frame.f_back if frame else None
        namespace = {**caller.f_globals, **caller.f_locals} if caller else {}
        objects = _caller_objects(namespace)
        drivers = []
        selection = "explicit target argument"
        if target is None:
            name, target = _find_atoms(objects)
            selection = f"calling scope: {name}"
        elif not _is_atoms(target):
            raise TypeError("Expected an ASE-compatible Atoms object or a trajectory path")
        if dynamics is None:
            drivers = [(name, obj) for name, obj in objects
                       if callable(getattr(type(obj), "run", None)) and _state(obj).get("atoms") is target]
            if len(drivers) == 1:
                dynamics = drivers[0][1]
    finally:
        # Do not retain caller frames, notebooks, or unrelated objects in the record.
        del frame
        if "caller" in locals():
            del caller
    if dynamics is not None and _state(dynamics).get("atoms") is not target:
        raise ValueError("The dynamics object must operate on the selected atomic system")
    record = snapshot(target, include_environment=include_environment)
    put(record, "provenance", "mode", "one_call_extraction", "mliphub.extract")
    put(record, "provenance", "target_selection", selection, "mliphub.extract")
    loaded = _objects(getattr(target, "calc", None), record)
    _guard(record, "Atomic metadata", lambda: _extract_atomic_metadata(target, record))
    _guard(record, "Model metadata", lambda: _extract_object_metadata(loaded, record))
    _guard(record, "Artifact discovery", lambda: _extract_artifacts(loaded, record))
    if dynamics is not None:
        _guard(record, "Driver metadata", lambda: capture_dynamics(dynamics, record))
    elif len(drivers) > 1:
        record.warnings.append("Multiple drivers refer to this atomic system; pass dynamics= to choose one")
    for name in ("scope_wall_time", "calculator_wall_time"):
        record.results[name] = missing("Post-calculation extraction cannot reconstruct execution timing", "mliphub.extract")
    _declare_identity(record, model_id)
    record.save(output)
    return record


def _declare_identity(record, model_id):
    if model_id is None:
        return
    if not isinstance(model_id, str) or not model_id.strip():
        raise ValueError("model_id must be a nonempty checkpoint identifier")
    current = record.model.get("id")
    if current and current.status != "unavailable" and current.value != model_id:
        raise ValueError("model_id conflicts with the checkpoint identity exposed by the loaded model")
    if current is None or current.status == "unavailable":
        put(record, "model", "id", model_id, "extract(model_id=...)", status="user_provided")
