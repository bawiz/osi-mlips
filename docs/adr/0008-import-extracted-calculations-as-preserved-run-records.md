# Import extractor JSON as preserved calculation records

The Hub accepts JSON from the bundled MLIPHub extractor. Import validates the
record, fills the structured view automatically, and retains the original JSON,
including additional information that has no current curated display field.

An imported calculation is a new typed **Extracted Run**, not a Model profile or
a scientific claim. It links to an existing Model or Known Variant, or remains
unassigned if exact identity is unavailable. Checkpoint identifiers/names may
match automatically; architecture families, Python classes, and filenames alone
cannot. An optional dropdown supplies association without retyping metadata.

Shared uploads use the existing database capability and a new `extractedRuns`
collection. Browser-local saves use IndexedDB, with distinct labels and controls
so local persistence is never presented as publication. No inference or checkpoint
deserialization occurs in the Hub.

Extraction provenance remains independent of scientific evidence grades and
curator-authored conclusions. Uploads do not create Model Pages, change scope
claims, name failure modes, or enter the curated recommender automatically.

**Why:** converting one run into a curated Model would conflate its conditions
with the checkpoint's general capabilities and discard information. Preserving
run records makes uploads useful now while retaining evidence for later analysis.
