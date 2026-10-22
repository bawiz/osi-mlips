"""Small deterministic examples using ASE's built-in classical EMT calculator."""
from pathlib import Path

from .extraction import require_ase
from .recorder import record


def run_demo(directory: str | Path) -> Path:
    require_ase()
    import numpy as np
    from ase import units
    from ase.build import bulk
    from ase.calculators.emt import EMT
    from ase.io.trajectory import Trajectory
    from ase.md.verlet import VelocityVerlet

    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    outputs = [directory / name for name in ("single-point.json", "md.json", "md.traj")]
    if any(path.exists() for path in outputs):
        raise FileExistsError("Demo output already exists; choose an empty directory")
    atoms = bulk("Cu", "fcc", a=3.6).repeat((2, 2, 2))
    atoms.calc = EMT()
    with record(atoms, run_type="single_point", output=outputs[0]):
        atoms.get_potential_energy()
        atoms.get_forces()
    atoms.set_velocities(np.random.default_rng(42).normal(scale=0.01, size=(len(atoms), 3)))
    dynamics = VelocityVerlet(atoms, timestep=1 * units.fs, logfile=None)
    with Trajectory(outputs[2], "w", atoms) as trajectory:
        dynamics.attach(trajectory.write, interval=1)
        with record(atoms, run_type="molecular_dynamics", dynamics=dynamics,
                    metadata={"simulation": {"ensemble": "NVE"}}, output=outputs[1]):
            dynamics.run(5)
    # Hash only after the writer is closed and its data have been flushed.
    from .artifacts import fingerprint
    from .schema import Record
    md_record = Record.load(outputs[1])
    md_record.artifacts.append(fingerprint(outputs[2], "trajectory"))
    md_record.save(outputs[1])
    return directory
