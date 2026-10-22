# Usefulness Boundary Hub

The MLIPs team in the Open Scientific Intelligence hackathon 2026.

The `usefulness-boundary-hub` branch combines all three development branches:
`main` supplies the primary GUI, curated Model Pages and their three lenses;
`contribute` supplies additional workspaces; `feature/extractor-integration`
supplies the standalone extractor and calculation uploads.

## Open the combined Hub locally

From this branch's repository root:

```bash
python -m http.server 8000 --directory app
```

Open **http://localhost:8000/**. The main branch's GUI is the default view.

| Tab | Features |
| --- | --- |
| Model profiles | Original curated profiles, Descriptive/Mechanistic/Bayesian lenses, failure modes and lineage |
| Find an MLIP | One chat interface, structured evidence filters, candidate records, selection funnel, interactive task-coverage matrix and searchable library |
| Catalogue & benchmarks | Extended catalogue, filters, map/table views, six-pillar inspector and shortlist comparisons |
| UQ benchmarks | Precomputed ammonia studies, plots and training-budget comparisons |
| Knowledge graph | MACE model, training-data and task relationships |
| Contribute | Six-pillar draft form, optional extractor import, live preview and downloadable contribution JSON |
| Calculation uploads | Validate extractor JSON, inspect all metadata and provenance, associate a checkpoint, and save locally or to connected Hub storage |

The contribution workspace stays mounted while changing tabs, preserving its
draft and shortlist until the page reloads. Curated Model Pages remain distinct
from extended catalogue entries and benchmark studies.

In **Contribute**, importing extractor JSON fills only matching facts. Unknown
fields stay blank; reference settings, training counts, symmetry and evidence
are never filled with example defaults. The downloaded draft includes the exact
original JSON in `extractor_record_json`, extra metadata included, plus provenance
for the form fields. Edited fields are marked `user_provided`. This draft is a
separate format for review; use **Calculation uploads** for the original extractor
file. Neither exporting a draft nor importing a file changes curated claims.

For deployment, serve the **contents of `app/`**, including its `community/`
subdirectory. There is no server application to install for a static preview.
Shared publication still needs the connected storage described below.

See [the combined-workspace design](docs/adr/0009-combined-hub-workspaces.md).

## Sample library and evidence-based discovery

Open **Find an MLIP** or visit **http://localhost:8000/#discover** with the local
server running. Try:

```text
Bulk Cu molecular dynamics on CPU at 300 K
```

Then refine the request, for example `at 600 K with 10,000 atoms`. Active filters
are visible and individually removable. The chat asks for missing chemistry/task
information and reports an evidence gap when nothing matches.

The demonstration includes **320 extractor-schema records**: **64 training** and
**256 usage** reports for eight fictional checkpoints spanning bulk, molecular,
surface and liquid examples. Sixteen usage reports are fictional failures or
interruptions, retained in the library and excluded from candidate support.
Every record is explicitly marked `provenance.synthetic = true`. All checkpoint
names, systems and numerical results are invented; architecture labels do not
imply real architecture performance. These records must never be used as real
benchmark evidence.

- **Filter funnel:** shows how chemistry, task, hardware, temperature and size
  requirements narrow the loaded usage records.
- **Task-coverage matrix:** click a cell to select a task and inspect that model's
  records. Counts indicate reporting coverage, not predictive quality.
- **Record library:** search, filter training/usage/unclassified records, inspect
  provenance and download individual JSON files in the extractor's format.
- **Candidates:** show matching reported systems/conditions and link directly to
  their source records. Failed/interrupted runs and conflicting checkpoint
  architectures/weight artifacts cannot support recommendations.

Saved uploads enter the **Contributed records** source automatically when that
view is opened; the upload preview links directly to it. It reads browser-local
records and up to 50 recent shared records when the existing backend is connected.
Uploaded synthetic records have their own source and never mix into the ordinary
contributed-record recommendations. Original uploaded JSON is preserved. Training
records are searchable context; they do not substitute for matching usage reports.

The current chat is a deterministic natural-language-to-filter prototype. It
supports elements/formula, task, system class, Kelvin temperature/range, atom
count, CPU/GPU and reference functional. Filters must be satisfied by the **same
usage record**. Element sets match exactly unless the user explicitly says
`containing Cu` (for example); stoichiometry, charge and local environments are
not matched. Default size filtering looks for a reported run at least as large
as the requested size, not a guarantee of capacity. Unknown facts never satisfy
a requirement. Recorder's `simulation.run_type` and newer `simulation.type`
records are both understood; missing task/type stays unclassified.

Ranking uses relevant record coverage, not an accuracy or speed leaderboard.
Comparing numerical performance needs matching benchmark datasets, reference
methods, structures, units and hardware, plus a scientific review process. This
prototype does not certify user-reported claims, select a universally best MLIP,
or turn community text into instructions for an LLM. Main's curator-only chat is
no longer mounted: the finder is the single chat entrypoint on this branch.

Individual examples live in [examples/synthetic-library/records](examples/synthetic-library/records).
The lazily loaded UI bundle is `app/data/demo-records.json` (an array of the same
records; upload individual JSON files, not the aggregate array). Regenerate and
verify the samples with:

```bash
npm run generate:demo
python3 scripts/generate-demo-library.py --check
```

See [the discovery design](docs/adr/0011-evidence-library-and-discovery.md).

## Choose how to extract information

| Option | Installation | Workflow |
| --- | --- | --- |
| Browser folder extraction | None | In Calculation uploads or Contribute, choose a calculation folder. Supported saved files are read locally and a metadata preview is generated automatically. |
| Import existing JSON | None for the Hub | Select a previously generated `mliphub-metadata.json`. All fields and provenance are retained. |
| Python extractor | Standalone wheel today; PyPI planned | Run one line in the simulation/notebook environment to inspect live ASE and calculator objects, or use supported ASE file readers. |

For the no-install option, open **Calculation uploads → Choose calculation folder
— no installation**. After extraction, review the metadata, then choose
**Download metadata JSON**, **Save in this browser**, or **Upload to Hub** when
shared storage is connected. Selecting a folder does not publish anything. Source
files are not uploaded; the optional upload contains the generated metadata,
relative-file inventory and checksums. You may also select a folder directly in
**Contribute** to populate a draft.

The browser reader currently supports JSON configuration; whitelisted scalar
settings in YAML/TOML/INI/CFG/text/log files; simple literal assignments in saved
Jupyter code cells; and species/Cartesian positions from XYZ/extXYZ files (first
and last saved frames). It reads explicit extXYZ lattice and periodicity, without
assuming missing periodicity or coordinate units. This is a saved-file reader:
it does not execute a notebook, inspect its running kernel, load model weights,
run inference, or recover hardware/timing that was never saved.

Missing facts stay unknown and conflicting declarations stay file-specific. When
multiple structure files exist, no single final system is guessed. A folder
containing one valid extractor record imports that original JSON unchanged;
multiple existing records require selecting one directly. The Python workflow
remains useful for live model details and binary trajectory formats supported by
ASE; arbitrary model checkpoints do not guarantee recoverable training metadata.

Folder limits are 1,000 files, 10 MiB per supported file, 32 MiB total read data,
and 5,000 atoms per XYZ frame. Unsupported/oversized files are inventoried with
skip reasons. Generated records must fit the existing 10 MiB upload contract.
Use HTTPS or localhost. Try the synthetic [example folder](examples/browser-folder)
to demonstrate the workflow; it contains no real MLIP results.

See [browser folder extraction details](docs/adr/0010-browser-folder-extraction.md).

## Download and install the extractor today

End users only need the extractor, not a checkout of the Hub. The current
standalone distribution is the wheel file
`mliphub-0.1.0-py3-none-any.whl`. It contains the extractor and package metadata;
the Hub application, tests, and documentation are not included.

Obtain this wheel from the project maintainer and download it to your computer.
There is not yet a published PyPI package or GitHub Release download for this
branch. With Python 3.10+, activate the environment you already use for your MLIP
calculation, then install the downloaded file:

```bash
python -m pip install ./mliphub-0.1.0-py3-none-any.whl
```

Keep ASE and your chosen MLIP installed in that same environment. The wheel does
not bundle MLIP frameworks or model weights.

## Run the extractor

After your existing ASE calculation:

```python
import mliphub; mliphub.extract(atoms)
```

This saves `mliphub-metadata.json`. If only one atomic system is present in the
calling scope, `mliphub.extract()` also works. Available model, training, system,
calculation, environment, and cached-result information is collected without
running another prediction. Missing values stay explicitly unavailable.

Optional identification when you already know the catalogue checkpoint ID:

```python
import mliphub; mliphub.extract(atoms, model_id="mace-mp-0")
```

For saved trajectories: `mliphub extract md.traj`. More options and limitations
are described in [the extractor guide](docs/extractor.md).

Upload the resulting `mliphub-metadata.json` to the online Hub using
**Calculation uploads → Choose extractor JSON**. The Hub reads the structured
fields automatically, so you do not need to type the extracted information.

## Planned installation through PyPI

In the future, the extractor will be published as an independently installable
Python package on PyPI. Users will then be able to install it directly, without
downloading a wheel manually or downloading the Hub repository. The intended
command is:

```bash
python -m pip install "mliphub[ase]"
```

**This is a planned installation method, not a currently published release of
this extractor.** The final PyPI package name is subject to availability. The
one-line extraction call and JSON upload workflow will remain the same.

## Preview the Hub locally

These steps are for contributors testing a checkout of this branch; end users of
the online Hub do not need to run a local Hub server. From the repository root:

```bash
python -m http.server 8000 --directory app
```

Open `http://localhost:8000`, then use **Calculation uploads → Choose extractor
JSON** on the landing page or a model page. Serve over localhost or HTTPS so file
hashing and browser storage are available.

The Hub validates the file, displays its sections with sources/statuses and units,
and associates an exact checkpoint ID or name when possible. Models and Known
Variants are supported. Architecture alone never determines checkpoint identity.
Unknown records can stay unassigned or be associated using a dropdown.

- **Upload to Hub** uses the hosting environment's existing database capability,
  `window.claude.use("db")`, and the new `extractedRuns` collection. This requires
  a connected hosted preview, as do existing shared community features.
- **Save in this browser** uses IndexedDB, survives reloads on the same origin,
  and works on the standalone static site. It is explicitly local, not published.
- Records appear in recent uploads and on their associated checkpoint's page,
  where they can be expanded or downloaded.

The original JSON is preserved, including additional fields the curated Hub does
not use. Inputs are limited to 10 MiB. Display previews may shorten large arrays;
the downloaded file retains all data. Referenced model/trajectory files are not
uploaded with the JSON.

Uploads are unreviewed calculation records. They do not overwrite curated Model
profiles, create Model Pages, establish failure modes or UQ studies, or enter the
curator-only recommender automatically. The Hub never runs MLIP inference. Legacy
extractor 0.1.0 records work without the new canonical identity fields.

## Development

For contributors working from the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
python -m pytest -q
npm test
python -m build
```

The build produces the standalone wheel in `dist/`. Maintainers can distribute
that file independently of the Hub, and later publish it through PyPI or attach
it to a GitHub Release.

Edit `app/community/data/catalog.json` for the extended catalogue and run
`npm run build:catalog` to regenerate its browser asset. `npm test` checks that
the two agree. The contribution branch's alternate multi-epoch catalogue is
preserved under `app/community/data/archive/`; it is not silently substituted for
the displayed benchmark records. Merging these workspaces does not independently
validate the inherited scientific results. Main's illustrative UQ content retains
its original labels.

The browser importer has no runtime dependencies. Its checked-in
[JSON Schema](app/data/extractor-record.schema.json) is generated from the bundled
Python `Record`. A Python-exported synthetic fixture is tested in both languages.
See [the integration contract](docs/extractor-integration.md) for details.

Optional browser integration test:

```bash
npm install
npx playwright install chromium
npm run test:browser
```
