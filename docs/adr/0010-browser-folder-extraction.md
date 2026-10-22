# Offer browser folder extraction alongside the standalone Python extractor

Users should have a no-install option as well as the live Python workflow. The
Hub now offers a directory file input in both Calculation uploads and Contribute.
After the user chooses a folder, browser JavaScript reads only the selected,
supported files and generates the same provenance-bearing record used by the
existing importer. No Python interpreter, server extraction service, notebook
execution, shell command or model inference is invoked.

This uses standard browser-selected File objects and their relative paths:
[directory input](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory).
The reader makes no network requests. Saving to shared storage remains a separate,
explicit Upload to Hub action; only the generated record is submitted. Download
and local persistence work without a shared backend.

## Initial supported readers

- JSON objects: named model/training/system/simulation/environment/results/
  reliability/provenance sections, and whitelisted common flat configuration
  keys. Source labels identify saved declarations, not observed execution.
- YAML/TOML/INI/CFG/log/out/text: recognised scalar `key: value` / `key = value`
  declarations, plus simple TOML/INI section headers. This is intentionally not a
  general YAML/TOML parser; multiline YAML, anchors, expressions and arbitrary
  nested configurations are not evaluated.
- Jupyter `.ipynb`: language metadata and simple literal assignments in code-cell
  sources, labelled inferred. No outputs, rich HTML or execution counts are
  treated as predictions, and no live kernel is contacted. The underlying JSON
  layout follows [nbformat](https://nbformat.readthedocs.io/en/5.2.0/format_description.html).
- XYZ/extXYZ: first/last saved species and Cartesian positions, explicit lattice
  and PBC, saved frame count and original comment text. The species/pos column
  layout follows the extXYZ Properties descriptor. Additional per-atom columns
  are not interpreted yet. Coordinate/cell units are left unknown and missing
  PBC is not assumed. See [ASE format documentation](https://ase.gitlab.io/ase/ase/io/formatoptions.html).

Unrecognised/binary files are not deserialised. Their relative names, sizes and
skip reasons appear in the inventory. Browser hardware is not substituted for
the calculation's execution hardware. Completion, reference accuracy and UQ are
not computed from file presence.

## Conflicts, provenance and existing records

Every extracted fact retains its filename/location. Equal declarations can be
exposed as canonical fields; conflicting values leave those canonical fields
unavailable and preserve each source value separately. Multiple structure files
retain file-specific systems without choosing a final structure. Configuration
provenance cannot overwrite the browser collector/mode identity.

Exactly one valid existing extractor record in the folder is imported byte for
byte, with a message that other files were not merged. Multiple valid records
require explicitly selecting one. Invalid JSON and malformed XYZ are skipped
with reasons when useful metadata is available elsewhere. A selection containing
no supported information produces an explanation and no submittable record.

The browser scans at most 1,000 selected files, reads at most 10 MiB per supported
file / 32 MiB total, and handles at most 5,000 atoms per XYZ frame. There is a
2,048-observation limit, and final JSON must pass the existing 10 MiB/depth/finite
number contract. Source checksums use actual file bytes with SHA-256. Cancelled
or superseded selections cannot replace a newer preview.

The generated JSON is accepted by the same JS importer and Python Record model.
Contribute maps compatible facts into its draft while retaining the complete
generated JSON. The Python package remains a separate option for live objects,
framework adapters, notebook kernels and ASE-supported binary trajectory readers.
It does not promise to recover unavailable checkpoint training history either.

## Verification

Tests cover configuration/XYZ/notebook reading, explicit column layouts, first/
last frames, unknown units, conflicting identities, multiple structures, binary
and oversized-file skipping, malformed inputs, existing-record preservation,
cancellation, provenance integrity, manual persistence and the JS-to-Python schema
contract. A synthetic example lives in `examples/browser-folder/`. Browser test
steps exercise folder pickers when Chromium is available; visual QA remains a
separate check in environments where browser automation is restricted.
