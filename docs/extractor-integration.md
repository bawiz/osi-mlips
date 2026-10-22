# Extractor upload contract

The branch contains both the installable `mliphub` Python package (`src/`) and
the static Hub (`app/`). The normal workflow is one extraction call, followed
by selecting `mliphub-metadata.json` in the Hub. Upload preview and structured
display require no metadata form or manual retyping.

## Record and terminology

The exporter retains schema version `0.1.0`; the added canonical fields are
backward-compatible entries inside its existing extensible `model` dictionary:

| Extractor field | Meaning | Hub association |
| --- | --- | --- |
| `model.id` | Specific checkpoint identifier, if known | Exact `modelId` |
| `model.name` | Explicit checkpoint name, if exposed | Exact catalogue name/alias |
| `model.architecture_id` | Method family, e.g. `mace` | `architectureId` |
| `model.implementation_class` | Python class of the loaded model | Displayed as implementation detail, never a checkpoint ID |
| `model.framework` | Legacy MLIP package/family label | Family fallback for older exports |
| `model.architecture` | Legacy implementation-class field | Preserved and labeled explicitly |

All entries still carry `{value, status, source, unit, reason}`. Exact checkpoint
declarations on loaded objects can populate identity; unknown identities stay
unavailable. `extract(..., model_id="...")` is an optional declaration and cannot
overwrite a conflicting identity observed on the loaded object. Committees retain
member-specific information and are not automatically assigned to one checkpoint.

The importer resolves declarations against catalogued Models and Known Variants.
Only exact identifiers/names/registered aliases or registered model artifact hashes
match; filename substrings and architecture alone do not. Catalogue entries may
provide `aliases` and `sha256` arrays. No checkpoint hashes are invented. Multiple
conflicting matches remain unresolved. An optional checkpoint selector can associate
an unknown record, with the association recorded independently of the original JSON.
It cannot select a conflicting architecture or override an existing exact match.

Unknown records can always remain unassigned and still be saved. An upload from a
model page is not silently attributed to that page's checkpoint. Known Variant
uploads keep the variant's own ID and do not count as runs of its parent Model.

## Validation and preservation

`app/data/extractor-record.schema.json` comes from `Record.model_json_schema()`.
Python tests check that it stays in sync. `app/import-record.js` validates complete
exported records, supported versions, all sections, provenance fields, finite JSON
values, artifact hashes, timestamps, and bounded input size/depth before preview
or persistence. The file limit is 10 MiB. Schema 0.1.0 records produced before
canonical identity fields were introduced remain accepted.

The browser preserves the original file text as `recordJson` and computes its
SHA-256 as `uploadId`. All metadata, unavailable-field explanations, warnings,
custom fields, and artifact references survive. Table previews may shorten large
values; downloads reproduce the original JSON text. No referenced model weights,
training datasets, or trajectory files are automatically uploaded.

The persistence envelope is separate from the extraction record:

```text
schemaVersion       Integration contract version (0.1.0)
recordType          extractedRun
uploadId            SHA-256 of original JSON text
runId               Extractor record's run_id
modelId             Exact Model/Known Variant ID or null
architectureId      Resolved method-family ID or null
associationMethod   declared_identity, artifact_hash, user_selected,
                    user_unassigned, unresolved, or combined exact methods
createdAt           Submission time in epoch milliseconds
collectedAt         Original record creation timestamp
reviewStatus        unreviewed
fileName            Selected file's name
recordJson          Full original JSON text
```

This keeps record collection time separate from upload time. Metadata extraction
statuses are not converted into scientific evidence grades. Prediction values do
not become benchmark errors, UQ studies, or failure-mode claims automatically.

## Storage and display

Connected hosted Hub instances use the existing `window.claude.use("db")`
capability and a new `extractedRuns` collection. Shared reads use its existing
subscription API; writes use `collection.add()`. Native nested arrays are kept
inside the preserved JSON string rather than forced into database field types.
Database size/access failures are surfaced instead of being reported as success.
The current preview reads the 50 most recent shared uploads; it is not paginated.

Standalone static hosting does not supply that database capability. Its shared
upload button is disabled and browser-local saving uses IndexedDB. Local records
survive reloads on the same origin, but are not accessible to other users/devices.
The storage destination is explicit in both controls and saved-record labels.

Uploaded runs display on the landing page and on the exact associated Model page.
Known Variant and unresolved records are available in the landing-page list.
They remain contributed/unreviewed records; they neither replace curated content
nor enter the recommender corpus. There is no new Model-creation workflow, live
MLIP inference, or automatic scientific interpretation in this feature.

## Validation status

Verified locally:

- Python suite: **52 passed, 1 skipped** (actual ASE integration module absent).
- Node importer/storage contract tests: **13 passed**.
- Upload UI event tests against a minimal DOM contract: **5 passed**. These check
  file selection, automatic preview/association, original-file preservation,
  shared/local save behavior, failure recovery, and disposal of stale views;
  they are not a substitute for a full browser run.
- The checked-in synthetic fixture was generated by the bundled Python exporter
  and is accepted by both the Python schema and browser importer. It is labeled
  synthetic and does not represent an actual MLIP evaluation.
- JavaScript syntax and the embedded application script were checked.
- Full raw-record preservation, exact/unresolved/variant identity, older exports,
  invalid provenance/version/data rejection, and shared-storage API/error paths
  are covered by the contract tests.

The Playwright browser test is included for file selection, IndexedDB/reload,
exact download, model-page filtering, escaped content, mobile layout, and mocked
shared uploads. It serves the checked-out assets through test request interception
and never writes to a real shared database. It **could not run in this sandbox**:
Chromium startup is denied by the environment's socket restrictions. A separate
browser connection also forbids local file URLs. Browser layout, real hosted
database access, and real MACE/CHGNet checkpoints therefore remain unverified here.
CI includes a browser job for an environment that permits Chromium.

No remote branch was pushed, and no real user/community records were published.
