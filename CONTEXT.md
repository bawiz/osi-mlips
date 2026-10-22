# Context

Glossary of domain terms for the MLIP Hub project. No implementation details — see `docs/adr/` for decisions with rationale.

### Extracted Run
A structured record of one MLIP calculation, produced by the extractor and
imported as JSON without retyping its metadata. Contains accessible model/training,
system, simulation, environment, and cached-result information with per-field
source/status/unit and explicit missing values. It may link to an existing Model
or Known Variant, or stay unassigned when checkpoint identity is unresolved. The
original record and extra fields are preserved. This is an unreviewed contribution,
not a Model Page, Known Failure Mode, Mechanistic Finding, or evaluated Bayesian
study. Extraction provenance is separate from scientific evidence quality.
See ADR-0008.

## Terms

### Hub
The Usefulness Boundary Hub: the main branch's directory of curated Model Pages
remains the default GUI, browsed as a flat list/grid. Find an MLIP is the single
chat entrypoint and provides structured discovery over a selected evidence library.
Additional workspace tabs provide
the contribution branch's extended catalogue with filtering/comparison, UQ
benchmarks, knowledge graph and six-pillar drafting, plus extractor calculation
uploads. These are explicit additions to the flat-grid rule, not replacements
for the Model Pages or their three Lenses. See ADR-0009 and ADR-0011.

### Evidence Library
A searchable projection of validated extractor records, retaining original JSON
and per-field provenance. Browser-local and connected shared records are indexed
on read. Ordinary contributed records remain unreviewed; synthetic demonstrations
are explicitly labelled and kept in separate sources. A library record is not a
curated scientific claim. Training reports provide context, while reported usage
supports matching only when the same record satisfies the active constraints.

### Find an MLIP
The current conversational discovery workspace. Converts a supported subset of
natural language into visible structured filters, finds matching usage records,
and links candidate checkpoints to those records. Shows evidence gaps rather than
inventing suitability. Reported failures and conflicting checkpoint identities
cannot support candidates. Rankings reflect matching record coverage, not measured
accuracy, model confidence or general superiority. No contributed text is used as
instructions for an LLM. See ADR-0011.

### Six-Pillar Contribution
A draft organising System, Model, Training/Test Data, Calculation, Property/Task
and Comparison/UQ facts. The six pillars organise metadata; the three Lenses
interpret checkpoint-specific scientific evidence. An extractor file can populate
matching draft fields while retaining its complete original JSON and provenance.
Missing facts remain unknown. Draft export does not publish a Model Page or assert
that a study has been reproduced.

### Model (Checkpoint)
A specific trained, downloadable set of weights for a machine learning interatomic potential (MLIP) — e.g. `MACE-MP-0`, `MACE-OFF23`, `SevenNet-l3i5`. This is the unit the Hub catalogues: one page per Model. "What is this good for / not good for" is a claim about a Model, not about its Architecture, because the claim depends on the Model's specific training data/distribution.

### Architecture
The method family / formalism a Model is trained with — e.g. MACE, NequIP, Allegro, SevenNet. Not a page of its own; it is an attribute that one or more Models reference (many Models can share an Architecture, e.g. MACE-MP-0 and MACE-OFF23 are both MACE-architecture).

### Model Page
The page for a single Model. Organized into parallel Lenses (tabs/sections), all describing the same Model from different angles. Not progressive disclosure and not persona-gated — a viewer can freely switch between any Lens on the page. Created curator-only: the community cannot propose or stub out a new Model Page, only annotate existing ones (Community Annotation). A Model Page is only published once its curated core content exists — no half-empty pages.

### Lens
One of several parallel ways of describing a Model's "what is it good/bad for" — e.g. the Descriptive Lens, the Mechanistic Lens, the Bayesian Lens. Deliberately not called a "level": the Lenses are not ordered by depth or prerequisite (Mechanistic is not "deeper than" Bayesian, etc.) — they're independent facets a viewer picks among.

### Descriptive Lens
The Lens holding a Model's core factual profile: training data summary, plain-language scope statement ("good for X, not for Y"), benchmark accuracy numbers, and an architectural/physical-inductive-bias explanation (e.g. "MACE's body-order-4 message passing limits its representation of long-range many-body effects") — explaining behavior from the *known structure of the Architecture*, not from probing a specific Model's trained internals (that's the Mechanistic Lens). Authored/seeded by the Hub maintainers, not community-contributable (see Known Failure Mode for the one piece of this Lens that is). Computational cost (inference speed, model size) is an open/deferred addition, not yet decided in or out.

### Mechanistic Lens
The Lens holding internals-probing findings about a *specific trained Model's* weights — e.g. a circuit that lets you detect or steer some phenomenon — to explain why this particular checkpoint behaves as it does. Distinct from the Descriptive Lens's architectural explanation, which is about the Architecture in general, not any one trained Model. Not a Hub-precomputed visualization: a real Model has hundreds of millions of parameters, far too many to usefully render as a clickable map, and every researcher's method produces its own, generally incommensurable, notion of "circuit" anyway. The Hub holds no activations or circuits of its own for this Lens — it is purely a feed of Mechanistic Findings, each self-contained (see Mechanistic Finding).

### Mechanistic Finding
The Mechanistic Lens's Community Annotation subtype: a self-contained report of an interpretability result on a specific Model. Has a claim type — **Detection** (probing a subset lets you decode/detect a phenomenon) or **Causal/Control** (ablating or steering a subset changes a phenomenon) — plus the subset/circuit examined and the phenomenon it relates to, both free text (there is no Hub-wide canonical indexing of a Model's internals — every researcher's method produces its own notion of "circuit," and a real Model has far too many parameters to index on a shared map anyway), plus a prose write-up of method and evidence. Flat and standalone like every other Community Annotation subtype: no threaded replies — a disagreement or failed replication is posted as its own separate Finding.

### Bayesian Lens
The Lens holding uncertainty-related content for a Model, precomputed offline like the Mechanistic Lens (the Hub never runs inference). Organized around UQ Purposes (see UQ Purpose): **Distribution-shift detection** is universal, present on every Model Page — how far an example structure sits from the Model's training distribution, as a proxy for "should you trust this prediction." **Error detection**, **Calibration**, and **Simulation reliability** are recorded per Model rather than assumed — each Model Page states plainly whether that purpose has been evaluated for this checkpoint yet, or not (see ADR-0007; this resolves Calibration's prior open/deferred status). Epistemic-vs-aleatoric decomposition is a secondary supporting breakdown, not a purpose of its own, shown only as a sample/showcase on Models whose uncertainty method supports it.

### UQ Purpose
One of six distinct scientific questions uncertainty quantification can answer for a Model — Calibration, Error detection, Active learning, Distribution-shift detection, Model comparison, Simulation reliability — doing well at one does not imply doing well at another (see ADR-0007). Four are built out as Bayesian Lens content (Error detection, Calibration, Distribution-shift detection, Simulation reliability); Active learning and Model comparison are named on the Lens for reference only, not yet evaluated for any Model. Not (yet) a first-class field on Bayesian Annotation — community notes stay free-text.

### Bayesian Annotation
The Bayesian Lens's Community Annotation subtype: a claim about a Model's uncertainty behavior on a specific example structure — e.g. disputing an OOD call, or reporting an observed case of miscalibration.

### Community Annotation
The general pattern underlying all community contribution on a Model Page: a Contributor submits a claim attached to a specific Lens, it goes live immediately (no moderation queue), no field it attaches to is otherwise editable by the community. Every Lens has exactly one Community Annotation subtype: community Evidence (Descriptive, attached to an existing Known Failure Mode), Mechanistic Finding (Mechanistic), Bayesian Annotation (Bayesian).

### Known Failure Mode
A named phenomenon describing a way a specific Model is known to perform poorly — e.g. "Systematic PES softening" for MACE-MP-0. Distinct from Mechanistic Lens content: a Known Failure Mode states *that* and *where* a Model fails (empirical/experiential), not *why* it fails at the level of the Model's internals. Curator-authored core fields: name, symptom, root cause (optional), an evidence grade (how directly it's been tested on this Model vs. inherited from training data or sibling Models), and a status-in-other-variants note (prose only — this note may mention other Models, but it is not a structural link between Model Pages). Bound to exactly one Model, like every other Descriptive Lens claim. Holds a list of Evidence (see Evidence) rather than being a single flat post itself — a deliberate divergence from the flat, standalone, no-append pattern used by Mechanistic Finding and Bayesian Annotation (see ADR-0003): failure modes genuinely recur across independent reports, so new evidence accumulates under one named phenomenon instead of spawning a near-duplicate. Creating a new Known Failure Mode (naming a phenomenon) is curator-only, the same as creating a Model Page; the community can only add Evidence to one that already exists.

### Evidence
One report supporting a Known Failure Mode, literature-sourced or community-sourced. A literature Evidence item is curator-added (seeded from a paper) and points to a Reference. A community Evidence item is the Descriptive Lens's Community Annotation subtype: a Contributor-submitted anecdote, live immediately, no moderation — it may optionally also point to a Reference if the contributor wants to cite something. Both kinds attach only to an *existing* Known Failure Mode; nobody can create one standalone.

### Reference
A bibliographic record (authors, title, venue, DOI/URL) for a cited source, e.g. a paper. Hub-wide, not scoped to one Model — one paper can be Evidence for phenomena on several Models. Curator-maintained; pointed to by Evidence items, which may share the same Reference rather than repeating its metadata.

### Contributor
A person submitting a Community Annotation (of any subtype). Identified by a self-reported name/email typed at submission time — not an authenticated account, not verified. Attribution only, not access control.

### Known Variant
A lightweight, curator-authored node for a checkpoint known from the literature (e.g. MACE-MP-0b2) that hasn't been fully catalogued as a Model — just a name and a short note on what changed, no Lenses. Exists so Lineage and Fixes (below) can reference real checkpoints without waiting for someone to fully catalogue every one as a Model Page first. Can later be promoted to a full Model Page; creating one is curator-only, like naming a Known Failure Mode or creating a Model Page.

### Lineage
A directional relationship between two checkpoint-like entities (a Model or a Known Variant) meaning "is a later/derived checkpoint of." Curator-authored. Distinct from Architecture: Architecture is a flat shared tag (MACE-MP-0 and MACE-OFF23 are both `mace`), Lineage is an ordered succession (MACE-MP-0 → MACE-MP-0b → MACE-MP-0b2 is a sequence, not a group).

### Fixes
A relationship from a Known Variant to a Known Failure Mode, meaning this variant resolves or improves that specific phenomenon. Formalizes what the literature today narrates as prose (`status_in_later_variants`, `mitigations`). Curator-authored.

### Graph View
A derived `{nodes, edges}` structure assembled on demand from the existing typed entities (Model, Known Failure Mode, Evidence, Reference, Mechanistic Finding, Bayesian Annotation, Known Variant, Lineage, Fixes) — not a separate master store, a query/rendering layer over them (see ADR-0004). Powers the family-tree visualization and the Recommender (below). Cross-Model evidence connectivity falls out of it for free: a Reference cited by Evidence under two different Models' Known Failure Modes appears in the Graph View as one Reference node connected to both Models, with no dedicated field for it.

### Recommender
Legacy definition below applies to the original main-branch implementation. That
chat is retained in source but no longer mounted on this branch; Find an MLIP is
now the single chat surface. ADR-0011 supersedes its entrypoint and evidence scope
without admitting community text into an LLM prompt.

A multi-turn chat surface on the Hub landing page, separate from the flat browsing grid, where a viewer describes a use case in their own words and gets a reasoned answer about which Model(s) — or, caveated, which Known Variant — fit it. The one place on the Hub explicitly allowed to synthesize across Models (see Hub, above). Strictly grounded: every answer must trace to the Hub's curator-authored content (Models' Descriptive Lens fields, Known Failure Modes with their literature Evidence and grade, Known Variants, Lineage, Fixes, and the Bayesian Lens's precomputed per-purpose UQ data — OOD/decomposition, error detection, calibration, simulation reliability); it states a gap explicitly rather than filling it from Claude's general knowledge, and never draws on live Community Annotations (see ADR-0005, ADR-0006). Answers carry structured citations back to the Model Page or Known Failure Mode they came from, the same way Evidence citations work elsewhere on the Hub; a citation to a Known Variant instead links into the Lineage & Evidence graph, focused on that variant's node, since it has no page of its own. Where it draws on data the Hub itself already marks illustrative/placeholder (e.g. Bayesian Lens OOD/decomposition/error-detection/calibration/simulation-reliability examples), it carries that caveat into the answer rather than citing it with the same confidence as literature-sourced evidence. Ephemeral per viewer — nothing about a Recommender conversation is itself a Community Annotation, and nothing is persisted.
