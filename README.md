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
| Model profiles | Original curated profiles, Descriptive/Mechanistic/Bayesian lenses, failure modes, lineage and grounded recommender |
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
