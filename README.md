# osi-mlips

The MLIPs team in the Open Scientific Intelligence hackathon 2026.

This branch integrates the **MLIPHub extractor** with the Usefulness Boundary Hub.
Researchers generate a JSON file, select it in the Hub, and import the structured
information without retyping it.

## Extract a calculation

Python 3.10+:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[ase]'
```

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

## Open the Hub and import

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

```bash
pip install -e '.[dev]'
python -m pytest -q
node tests/import-record.test.cjs
python -m build
```

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
