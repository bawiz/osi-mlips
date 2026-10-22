# Index extractor records and expose one conversational discovery workspace

The user requested a large sample library in the extractor's exact structure,
processing of uploaded training/usage information into a library, and one chat
interface to find suitable MLIPs with visual explanations. Implement that workflow
locally on `usefulness-boundary-hub` without deploying or changing remote storage.

## Records and sources

`scripts/generate-demo-library.py` uses the production Python Record model to
generate 320 deterministic, explicitly synthetic records: 64 training and 256
usage reports across eight fictional checkpoint IDs. Sixteen usage reports are
fictional failures/interruptions. Per-field provenance, missing-data envelopes,
schema version and all section names match the real extractor. Individual files
live in `examples/synthetic-library/records/`; the same values are bundled in
`app/data/demo-records.json` and loaded only when the finder opens.

`provenance.synthetic`, `evidence_status`, source labels, warnings and the `demo-`
identity prefix identify the fixtures. No real checkpoint performance, weights,
training datasets or DFT calculations are fabricated as genuine evidence.
Original uploads are preserved unchanged and remain unreviewed.

The library validates each saved upload before projecting structured fields,
deduplicates local/shared envelopes by upload ID, and reports invalid entries.
It indexes existing browser-local storage and up to 50 recent records from the
existing connected shared collection. This is an on-read frontend index, not a
new complete server database or global semantic search service. Reopening the
finder refreshes local records. Shared subscriptions update it while mounted.

Sources are separate: bundled synthetic fixtures; ordinary contributed uploads;
and uploaded synthetic fixtures. Synthetic rows never enter the ordinary
contributed recommendation source. Upload previews link to the correct library
source. Records with missing checkpoint identity or task remain inspectable but
cannot establish a matching usage case; missing type remains unclassified.
Legacy `simulation.run_type` and newer `simulation.type` are supported.

## Retrieval and explanations

`app/evidence-library.js` is the testable indexing/filtering engine. The single
chat surface at `#discover` converts a supported subset of natural language into
visible editable constraints: elements/formula, task, declared system class,
temperature in Kelvin/range, atom count/comparator, CPU/GPU and reference
functional. Follow-up messages update these constraints. No external LLM is
needed; unknown question types and broader reasoning are outside this prototype.

Element sets match exactly by default. An explicit “containing” query permits
additional elements. Formula stoichiometry, structure, charge, magnetism, pressure,
ensemble, reactive behaviour and UQ are not automatically matched. The UI states
these limits, and warns when common unsupported requirements are mentioned.
Default requested size means a reported run at least as large, not model capacity.

All active constraints must be satisfied by the same usage record. Separate
temperature, hardware or chemical reports cannot be stitched together to invent
a matching run. Unknown values fail required filters. Training metadata and a
declared supported-element list cannot substitute for a matching reported system.
Reported failures/interruption and checkpoint IDs with conflicting architecture
or model-artifact identities cannot support candidates; their records stay in
the library. Unknown completion remains labelled, never assumed successful.

Candidate ordering uses exact element-set coverage and number of matching usage
reports, with stable identity ordering for ties. It is not accuracy, uncertainty,
confidence or speed ranking. A lack of matching records is an evidence gap, not
a statement that a model is incapable. Numerical performance claims need matched
benchmark datasets, reference methods, structures, units, precision and hardware,
and review of the submitted evidence. The demo's numbers cannot validate this.

## Interface and visualisation

The finder stays within main's GUI and provides chat plus removable constraint
chips, candidate cards with source-record inspection, a filter funnel, a clickable
checkpoint-by-task coverage matrix, record-type/search controls and paginated
JSON inspection/download. Charts show reporting coverage rather than predictive
quality. Up to eight candidate cards and 30 coverage rows are shown, with explicit
truncation labels; the library searches all loaded records.

Main's former curator-only chat is no longer mounted; its source remains for
reference and the landing page links to the finder. This supersedes the mounted
entrypoint in ADR-0006/0009 in response to the user's updated design. It does not
put raw community prose in an LLM prompt, overwrite curated Model Pages, or turn
unreviewed records into vetted claims. Display strings use textContent; upload
content never supplies executable UI templates or agent instructions.

## Verification and next production boundary

Tests validate every sample against Python and JS, individual/aggregate agreement,
generator reproducibility, consistent checkpoint training metadata, parsing,
chemistry/units/CPU disambiguation, coherent per-record filtering, missing facts,
identity conflicts, failure exclusion, source separation, local/shared projection,
record preservation, DOM chat events and interactive chart filters. Optional real
browser steps cover the finder and download path when Chromium is available.

Visual browser QA is separate from these DOM-contract tests. A production Hub
still needs an authenticated, paginated shared library, review workflow, durable
server-side indexing and scientifically comparable evaluated evidence. A future
LLM can help interpret requests, but must output validated query constraints and
cite retrieved records rather than treating uploaded prose as instructions.
