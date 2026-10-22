"""A scoped recorder that observes ASE calculate() calls without extra predictions."""
from __future__ import annotations

import time
from pathlib import Path

from .extraction import capture_dynamics, capture_results, capture_system, snapshot
from .artifacts import fingerprint
from .schema import Record
from .values import put

_ABSENT = object()


class Recorder:
    """Record one serial ASE calculation/driver scope. See README for timing limits.

    The calculator's instance-level calculate method is temporarily instrumented;
    its original method and ASE cache behavior are restored on all exit paths.
    """

    def __init__(self, atoms, calculator=None, *, run_type: str = "unspecified", dynamics=None,
                 metadata=None, model_paths=(), trajectory_paths=(), output: str | Path | None = None,
                 include_environment: bool = True):
        self.atoms = atoms
        self.calculator = calculator if calculator is not None else atoms.calc
        if self.calculator is None:
            raise ValueError("Attach an ASE calculator or pass calculator= explicitly")
        self.run_type = run_type
        self.dynamics = dynamics
        self.metadata = metadata
        self.model_paths = tuple(model_paths)
        self.trajectory_paths = tuple(trajectory_paths)
        self.output = output
        self.include_environment = include_environment
        self.record: Record | None = None
        self._used = False
        self._active = False
        self._calls = 0
        self._failed_calls = 0
        self._calculation_time = 0.0

    def __enter__(self):
        if self._used:
            raise RuntimeError("A Recorder can be used only once")
        if getattr(self.calculator.calculate, "_mliphub_recorder_hook", False):
            raise RuntimeError("This calculator is already being recorded; nested scopes are unsupported")
        if not hasattr(self.calculator, "__dict__"):
            raise TypeError("This calculator does not support instance method instrumentation")
        if self.atoms.calc is not None and self.atoms.calc is not self.calculator:
            raise ValueError("atoms.calc differs from the supplied calculator")
        if self.dynamics is not None and getattr(self.dynamics, "atoms", self.atoms) is not self.atoms:
            raise ValueError("The dynamics object must operate on the recorded Atoms object")
        self._used = True
        self._original_atoms_calc = self.atoms.calc
        self._original_method = self.calculator.calculate
        self._instance_method = self.calculator.__dict__.get("calculate", _ABSENT)
        self.record = snapshot(self.atoms, self.calculator, model_paths=self.model_paths,
                               include_environment=self.include_environment)
        # Pre-existing cached predictions are not results of this new scope.
        self.record.results.clear()
        self.record.system.clear()
        capture_system(self.atoms, self.record, "initial")
        put(self.record, "simulation", "run_type", self.run_type, "Recorder argument", status="user_provided")
        if self.dynamics is not None:
            capture_dynamics(self.dynamics, self.record)
            self._start_steps = getattr(self.dynamics, "nsteps", None)
        from .extraction import supply_metadata
        supply_metadata(self.record, self.metadata)
        self.atoms.calc = self.calculator

        def measured(*args, **kwargs):
            start = time.perf_counter()
            self._calls += 1
            try:
                return self._original_method(*args, **kwargs)
            except BaseException:
                self._failed_calls += 1
                raise
            finally:
                self._calculation_time += time.perf_counter() - start

        measured._mliphub_recorder_hook = True
        try:
            self.calculator.calculate = measured
        except BaseException:
            self.atoms.calc = self._original_atoms_calc
            raise
        self._active = True
        self._start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, traceback):
        elapsed = time.perf_counter() - self._start
        attachment_changed = self.atoms.calc is not self.calculator
        # Restore first: metadata failures must not leave the calculator instrumented.
        if self._instance_method is _ABSENT:
            del self.calculator.__dict__["calculate"]
        else:
            self.calculator.calculate = self._instance_method
        self.atoms.calc = self._original_atoms_calc
        self._active = False
        record = self.record
        put(record, "provenance", "mode", "live_recording", "mliphub")
        put(record, "provenance", "environment_scope", "collector process during this execution scope", "mliphub")
        state = "interrupted" if exc_type and issubclass(exc_type, (KeyboardInterrupt, SystemExit)) else (
            "failed" if exc_type or self._failed_calls else "completed")
        put(record, "results", "status", state, "recorder context exit; completion means scope returned normally")
        put(record, "results", "scope_wall_time", elapsed, "time.perf_counter; excludes metadata collection", "s")
        put(record, "results", "calculator_wall_time", self._calculation_time,
            "host wall time inside calculate(); includes dispatch; no explicit GPU synchronization", "s")
        put(record, "results", "calculate_calls", self._calls, "instrumented calculator.calculate; excludes cache hits")
        put(record, "results", "failed_calculate_calls", self._failed_calls, "instrumented calculator.calculate")
        if exc_type:
            put(record, "results", "exception_type", f"{exc_type.__module__}.{exc_type.__qualname__}", "context exception")
        try:
            capture_system(self.atoms, record, "final")
            # Failed predictions can leave a partially populated result dictionary.
            if state == "completed" and not attachment_changed:
                capture_results(self.atoms, self.calculator, record)
            if self.dynamics is not None:
                capture_dynamics(self.dynamics, record)
                end_steps = getattr(self.dynamics, "nsteps", None)
                if end_steps is not None and self._start_steps is not None:
                    put(record, "simulation", "steps_in_scope", end_steps - self._start_steps, "dynamics.nsteps delta")
            if attachment_changed:
                record.warnings.append("Calculator attachment changed during the scope; final predictions omitted and original attachment restored")
        except Exception as error:
            record.warnings.append(f"Final snapshot incomplete: {type(error).__name__}: {error}")
        for path in self.trajectory_paths:
            try:
                record.artifacts.append(fingerprint(path, "trajectory"))
            except (OSError, ValueError) as error:
                record.warnings.append(f"Trajectory artifact unavailable ({path}): {error}")
        if self.output is not None:
            try:
                self.save(self.output)
            except Exception as error:
                if exc_type is None:
                    raise
                record.warnings.append(f"Could not save record: {error}")
                message = f"MLIPHub could not save {self.output}: {error}"
                if callable(getattr(exc, "add_note", None)):
                    exc.add_note(message)
                else:
                    import warnings
                    # A warnings-as-errors policy must not replace the run's exception.
                    try:
                        warnings.warn(message, RuntimeWarning, stacklevel=2)
                    except Warning:
                        pass
        return False

    def save(self, path: str | Path) -> Path:
        if self.record is None or self._active:
            raise RuntimeError("Save the recorder after its context exits")
        return self.record.save(path)


def record(atoms, calculator=None, **kwargs) -> Recorder:
    return Recorder(atoms, calculator, **kwargs)
