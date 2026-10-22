# Keep main's GUI and add contribution features as workspace tabs

**Update:** ADR-0011 adds the single Find an MLIP chat/evidence workspace and
replaces the original landing-page chat with a link to it.

The user chose **Usefulness Boundary Hub**, keeping `main` as the primary GUI and
bringing `contribute` features into extra tabs. The fourth local branch is
`usefulness-boundary-hub` because Git reference names cannot contain spaces.

The branch starts from `feature/extractor-integration` (which already includes
`main`) and merges `contribute`. Original source branches remain unchanged.

## Interface and routing

`app/index.html` remains the entrypoint and retains the original model grid,
three Lenses, curated corpus, lineage graph, annotations and recommender. The
shared header adds these routes:

| Route | View |
| --- | --- |
| `#` | Original model-profile landing page |
| `#<model-id>` / `#graph/<model-id>` | Existing Model Page / lineage |
| `#workspace/catalog` | Extended catalogue, inspector and comparisons |
| `#workspace/uq` | Contribution UQ studies and plots |
| `#workspace/knowledge` | MACE knowledge graph |
| `#workspace/contribute` | Six-pillar contribution draft |
| `#uploads` | Original extractor file import and storage |

The contribution frontend lives in `app/community/`. A persistent same-origin
iframe isolates its legacy CSS, DOM IDs and controller from main's model-page
code. Its duplicate brand/navigation is hidden; the outer header controls its
views, with colours and fonts following main. Draft and shortlist state survive
outer tab changes. A full reload resets unsaved contribution state. This is a
static integration without a framework or bundler requirement.

## Metadata and scientific evidence

Original extractor JSON remains unchanged and uses the existing validated upload
contract, storage adapters and download path. The association catalogue includes
named MACE entries from the extended catalogue alongside main's Models/Known
Variants. Benchmark studies are not treated as checkpoint identities. Main's
recommender continues to use only its existing curated content.

The six-pillar form can import the same validated extractor file. It maps only
explicit compatible facts and simple labelled derivations (composition/formula
from atomic numbers, periodic dimensionality from PBC). No crystal class, accuracy,
reference functional or reproduction status is inferred. Cutoff is mapped only
when its units are angstrom. Unmapped fields remain in the original JSON.

A contribution download has `record_type: sixPillarContribution`,
`schema_version: 0.1.0`, `review_status: draft`, the six original pillar sections,
contributor metadata, per-input `field_provenance`, and optional
`extractor_record_json` containing the exact imported text. Empty fields are
`null` (lists may be empty). Numeric zero survives export. Space group, charge,
epochs and seeds are included. Editing a mapped field changes its form provenance
to `user_provided` while retaining the original extraction. This format is a
review draft, not an extractedRun or a JSON Schema definition; it is not accepted
by the original-extractor upload endpoint.

Preview values and example-answer queries are escaped before HTML rendering.
Imported files use the same validation and 10 MiB limit as calculation uploads.

## Catalogue reconciliation

The contribution branch's served `catalog.js` and unused `catalog.json` contained
different studies, budgets and object shapes. Preserve the served records as
canonical `data/catalog.json` so existing visible results do not silently change.
Generate `catalog.js` with `npm run build:catalog`; CI checks equality. Preserve
the alternate source JSON under `data/archive/contribute-multi-epoch-catalog.json`.
The separate multi-epoch trial tables and plots remain available in the UQ tab.
This integration makes no independent claim that inherited results are verified.

## Validation and remaining limits

Unit/DOM-contract checks cover routing, persistent workspace state, missing-data
handling, zero values, complete export, extractor mapping/provenance, escaping,
catalogue consistency, script syntax and relocated asset paths. Existing Python
and upload/storage tests remain required. Browser tests cover the combined flow
when Chromium is available; minimal DOM tests are not visual browser QA.

The hosting database capability remains required for shared uploads; static
previews use local IndexedDB. Contribution drafts do not have a new publication
backend. Main's illustrative UQ data retains its existing labels. The merge does
not train models, run inference or certify uploaded evidence. Extractor PyPI
publication remains planned, with standalone wheel distribution available now.
