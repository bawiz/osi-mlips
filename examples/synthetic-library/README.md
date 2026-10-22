# Synthetic extractor-record library

**Every checkpoint, system, result and performance number here is fictional.**
Real architecture names identify example metadata categories, not measurements
or claims about the actual MACE, MTP, NequIP, CHGNet or Allegro implementations.

There are 320 individual JSON files in `records/`, each validated by the bundled
Python `Record` model and browser importer. This is exactly the extractor record
structure, including version, run identity, eight metadata sections, per-field
value/status/source/unit/reason, artifacts and warnings. Extra MLIP-specific fields
use the existing extensible section dictionaries. No simulation or training was
performed to create these files.

| Fictional checkpoint | Architecture label | Example system class |
| --- | --- | --- |
| `demo-bulk-equi` | MACE | Bulk |
| `demo-bulk-fast` | MTP | Bulk |
| `demo-oxide` | CHGNet | Bulk oxides |
| `demo-molecule` | NequIP | Molecules |
| `demo-organic` | MACE | Organic molecules |
| `demo-surface` | Allegro | Surfaces |
| `demo-silicon` | MTP | Bulk |
| `demo-water` | NequIP | Liquids |

Each checkpoint has eight training reports and 32 usage reports. Across all
checkpoints this gives 64 training and 256 usage records, including 16 fictional
failed/interrupted runs. Reported training settings stay consistent for a given
fictional checkpoint. Benchmark identifiers include system elements, task, atom
count and temperature; metrics must not be compared across unrelated contexts.

Try the example prompts in **Find an MLIP**. Inspect a candidate's record and
download its JSON. Alternatively, upload one of these files in Calculation
uploads, save it, then follow the library link. It appears under **Uploaded
synthetic records**, separate from ordinary contributed data.

`app/data/demo-records.json` is the UI's aggregate array of the same records, not
an individual upload record. Use an individual file for import demonstrations.

From the repository root:

```bash
python3 scripts/generate-demo-library.py
python3 scripts/generate-demo-library.py --check
```

The generator is deterministic: stable UUIDs, timestamps, inputs and results.
Metadata values are labelled user-provided synthetic fixtures; missing model
internals, reference accuracy and UQ are never presented as extracted real facts.
