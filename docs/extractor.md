# MLIPHub

A local Python package for collecting machine-learning interatomic potential (MLIP)
metadata and calculation provenance. It produces a versioned JSON record describing
the loaded model, available training provenance, atomic system, calculation,
environment, and cached predictions. The main interface is a single extraction
call after your existing calculation; timing is available through an optional recorder.

**Version 0.1.0 is a working first implementation.** Generic ASE extraction is the
common interface. MACE and CHGNet adapters inspect already-loaded Python models;
other ASE calculators receive generic extraction. No model, dataset, or metadata
is uploaded.

## Install

Python 3.10 or newer:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[ase]'
mliphub --help
```

Core schema, artifact inspection, validation, and JSON export work with
`pip install -e .` and do not require ASE, PyTorch, MACE, or CHGNet.
Install your chosen MLIP separately in the environment where its calculation runs.

## One-line extraction

After your existing calculation, add this one line:

```python
import mliphub; mliphub.extract(atoms)
```

This automatically inspects the attached calculator, accessible loaded models and
configuration, available training metadata, atomic system, cached predictions,
hardware, and software. It saves **`mliphub-metadata.json`** in the current directory.
No context manager, framework selection, metadata form, or explicit save call is
required. It does not run another calculation or change your calculator.

If there is only one atomic system in the calling script/notebook scope, even the
argument is optional:

```python
import mliphub; mliphub.extract()
```

The function examines the immediate caller's globals and locals to identify an
ASE-compatible atomic system and an associated driver. It deduplicates aliases;
if several different systems exist, pass the intended `atoms` explicitly. It does
not serialize unrelated variables or guess which of multiple drivers was used.

For an existing trajectory, use one terminal command:

```bash
mliphub extract md.traj
```

Or `mliphub.extract("md.traj")` in Python. Both save `mliphub-metadata.json`
automatically. Use `output="my-run.json"` in Python or `-o my-run.json` on the CLI
to change the destination. Existing metadata at the output path is replaced.

One-call extraction also collects custom `atoms.info` fields and atomic arrays,
available model configuration fields individually, and fingerprints local checkpoint
paths exposed by calculator/model attributes or calculator parameters. It reads no
arbitrary directory or caller configuration files, and never deserializes weights.
If a checkpoint path is not exposed, the model can still be inspected in memory.
Unsupported fields produce warnings while other accessible metadata is preserved.

Training details that were never retained remain unavailable. After-the-fact
extraction cannot reconstruct execution timing; use the optional recorder below
only when you need to measure a new run. An accessible driver's settings describe
its current state, and do not prove that those settings were used for every saved
frame. The Python API returns the `Record` as well as saving it.

## Optional recording during execution

Wrap the calculation you already run. The recorder does not request extra energies
or forces. It uses the attached calculator and its existing ASE cache.

```python
from mliphub import record

# atoms is your existing ASE Atoms object with atoms.calc already attached.
with record(atoms, run_type="single_point", output="metadata.json") as rec:
    energy = atoms.get_potential_energy()
    forces = atoms.get_forces()

print(rec.record.model)
```

For MACE:

```python
from ase.io import read
from mace.calculators import MACECalculator
from mliphub import record

atoms = read("POSCAR")
atoms.calc = MACECalculator(model_paths="trained.model", device="cpu")

with record(
    atoms,
    run_type="single_point",
    model_paths=["trained.model"],
    metadata={"training": {"datasets": ["doi:your-dataset"], "epochs": 200}},
    output="mace-metadata.json",
) as rec:
    energy = atoms.get_potential_energy()
    forces = atoms.get_forces()
```

`model_paths` are optional explicit artifact references. Their contents are hashed
but their correspondence to loaded weights is not independently verified. The
recorder never loads a checkpoint itself. A CHGNet calculator works with the same
`record(atoms, ...)` interface; see [examples](../examples/).

## Record MD or optimization

Pass the actual ASE driver to record its available settings and step-count delta.
Driver dictionaries use their native ASE units; `simulation.timestep` is also
converted explicitly to femtoseconds for MD drivers exposing `dt`.

```python
from mliphub import record

# dynamics is your existing ASE MD or optimization driver, operating on atoms.
with record(
    atoms,
    dynamics=dynamics,
    run_type="molecular_dynamics",
    metadata={"simulation": {"ensemble": "NVT", "target_temperature_K": 300}},
    output="md-metadata.json",
) as rec:
    dynamics.run(1000)
```

The package does not assume an ensemble from a class name. If execution raises,
an `output=` record is saved with `failed` or `interrupted` status, and the original
exception propagates. `completed` means the recording scope exited normally, not
that an optimization converged or that a simulation is physically reliable.

Close/flush trajectory writers before attaching their hashes. You can add an
artifact to a finished record and save it again:

```python
from mliphub.artifacts import fingerprint

rec.record.artifacts.append(fingerprint("md.traj", role="trajectory"))
rec.save("md-metadata.json")
```

## Inspect and recover metadata

```bash
# Inspect file identity without deserializing a potentially executable checkpoint.
mliphub inspect trained.model --framework mace -o model-metadata.json

# Recover initial/final structures and final saved predictions, when available.
mliphub extract md.traj
mliphub extract md.traj --model trained.model -o recovered-metadata.json

# Include explicit training/simulation metadata from a JSON file.
mliphub inspect trained.model --metadata examples/training-metadata.json -o metadata.json

mliphub validate metadata.json
mliphub schema -o schema.json
mliphub adapters
```

File-only `inspect` fingerprints bytes; it does **not** reconstruct a neural
network or infer its training dataset from a filename. Use the live API to inspect
architecture. `snapshot(atoms)` inspects an existing loaded calculation without
recording execution or making predictions. `extract_trajectory(path)` streams
saved frames through ASE; it does not load all frames into the metadata record.

Retrospective extraction cannot establish original runtime, hardware, thermostat,
MD step count, or run completion from atomic structures alone. Saved predictions
often use ASE's `SinglePointCalculator`, which does not establish original model
identity. Host metadata is recorded for live runs or snapshots with its collection
scope clearly identified, and is omitted from file-only retrospective extraction.

## Try it without model downloads

```bash
mliphub demo --output-dir demo-output
mliphub validate demo-output/md.json
mliphub extract demo-output/md.traj -o demo-output/recovered.json
```

This runs a copper single-point calculation and five MD steps using ASE's built-in
**classical EMT calculator, not an MLIP**. It demonstrates the recording and I/O
path without downloading model weights. The demo refuses to overwrite its outputs.

## What the record contains

| Section | Recorded information |
| --- | --- |
| `model` | Calculator class/properties; adapter-specific architecture, cutoffs, heads, parameter counts, supported species when exposed |
| `training` | Preserved model training metadata and explicit user declarations; unknown datasets/hyperparameters remain unavailable |
| `system` | Initial/final atomic numbers, positions, cell, PBC, masses, available momenta, initial charges/moments, constraints |
| `simulation` | Run type, calculator parameters, driver class/settings, timestep, steps in scope |
| `environment` | OS, Python, CPU model/count, machine, host memory, installed package versions; optional NVIDIA GPU inventory; loaded-model device/dtype when exposed |
| `results` | Cached final predictions with known ASE units; scope/calculator wall time, calculate-call counts, execution status |
| `reliability` | Explicitly unavailable accuracy and uncertainty until supplied by a diagnostic/reference method |
| `provenance` | Collector, collection mode/scope, adapter, artifact binding information |
| `artifacts` | Paths, SHA-256 fingerprints, byte counts, and roles for explicit files |

Sections are extensible dictionaries of provenance-bearing fields. For example:

```json
{
  "cutoff_radius": {
    "value": 5.0,
    "status": "extracted",
    "source": "calculator.model.graph_converter.atom_graph_cutoff",
    "unit": "angstrom",
    "reason": null
  },
  "datasets": {
    "value": null,
    "status": "unavailable",
    "source": "not observed",
    "unit": null,
    "reason": "Training data provenance was not preserved"
  }
}
```

Every field has a source and one of `extracted`, `user_provided`, `inferred`, or
`unavailable`. Unavailable values require an explanation. Non-finite numbers and
unsupported objects are not silently serialized. Large arrays exceeding the
30,000-item conversion budget are marked unavailable with a warning: attach an
external trajectory or array file instead. Positions/cell/composition are stored
as independent fields so a large positions array does not erase other information.

User metadata uses `{ "section": { "field": value } }` mappings. It fills unknown
fields or adds new ones; conflicting declarations cannot silently replace observed
values. Metadata records are validated and written atomically. Input artifacts
cannot be overwritten by a record that references them.

## Adapters and extensions

| Calculator | Specialized extraction in v0.1 |
| --- | --- |
| Generic ASE | Class, parameters, available properties, matching cached results |
| MACE | Loaded model classes/parameter counts, supported atomic numbers, cutoff with length conversion, heads, member-specific committee details, preserved training configuration |
| CHGNet | Loaded model class/parameter count, version/model arguments, atom/bond cutoffs, preserved training configuration |
| NequIP / MTP / other ASE calculators | Generic ASE extraction; specialized adapters are future work |

The built-in MLIP adapters use capability checks, and fall back to generic
metadata with a warning when an incompatible model layout fails inspection.
They do not import either MLIP package. Contract tests cover their expected object
layouts; real checkpoints and supported release matrices require further validation.

Third-party adapters implement `name`, `detect(calculator)`, and
`extract(calculator, record)` and register explicitly before recording:

```python
from mliphub.adapters import register_adapter
from mliphub.values import put

class MyAdapter:
    name = "my_potential"

    def detect(self, calculator):
        return type(calculator).__module__.startswith("my_potential.")

    def extract(self, calculator, record):
        put(record, "model", "framework", "MyPotential", "calculator module", status="inferred")
        put(record, "model", "cutoff_radius", calculator.cutoff, "calculator.cutoff", "angstrom")

register_adapter(MyAdapter())
```

## Measurement limits

- Timing observes host wall time inside `calculator.calculate()`, including failed
  calls, and the entire recording scope. Cached property accesses are not counted
  as evaluations. Initialization before the scope is not timed. There is no explicit
  GPU synchronization, device-kernel timing, or CPU/GPU peak-memory monitor.
- The recorder temporarily instruments one calculator instance's `calculate`
  method and restores it on exit. Use one serial recorder per calculator; shared
  concurrent/threaded use and distributed/MPI orchestration are not supported.
  Direct calls bypassing ASE's `calculate()` are outside the timing coverage.
- The calculator must remain attached to the same recorded `Atoms` scope. Final
  cached results are omitted if they are stale or the attachment changed. No new
  calculation is launched to obtain missing results.
- Software versions describe installed distributions, not a lockfile. Host memory
  is not a scheduler allocation. Environment snapshots exclude secrets, usernames,
  hostnames, and full environment variables; user-supplied paths/metadata can still
  contain sensitive information.
- Metadata alone does not establish prediction accuracy, calibrated uncertainty,
  optimization convergence, or reproducibility. Reference comparisons, UQ,
  benchmarking suites, SQLite, and AiiDA/NOMAD export mappings are future modules.

## Development

```bash
pip install -e '.[dev]'
python -m pytest -q
python -m build
```

Tests cover schema/provenance validation, hashing, CLI failures, stale-cache
handling, exception preservation, recorder restoration, adapter fallback, and ASE
energy/force and MD invariance. Actual ASE integration tests skip explicitly when
ASE is absent. See [integration validation notes](extractor-integration.md) for the checks run in
the implementation environment.

Implementation references: [ASE calculators](https://docs.ase-lib.org/ase/calculators/calculators.html),
[MACE calculator source](https://github.com/ACEsuit/mace/blob/develop/mace/calculators/mace.py),
[CHGNet API](https://chgnet.lbl.gov/api),
and [Pydantic serialization](https://docs.pydantic.dev/latest/concepts/serialization/).
