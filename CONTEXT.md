# Context

Glossary of domain terms for the MLIP Hub project. No implementation details — see `docs/adr/` for decisions with rationale.

## Terms

### Hub
The overall site: a directory of Model Pages, browsed as a flat list/grid (no filtering/search, no side-by-side comparison view) — a viewer scans the list and looks at one Model Page at a time.

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
The Lens holding uncertainty-related content for a Model, precomputed offline like the Mechanistic Lens (the Hub never runs inference). Universal part, present on every Model Page: out-of-distribution (OOD) detection — how far an example structure sits from the Model's training distribution, as a proxy for "should you trust this prediction." Optional part, shown only as a sample/showcase on Models whose uncertainty method supports it: epistemic-vs-aleatoric decomposition (distinguishing "the model doesn't know" from "the system is inherently noisy"). Calibration of reported predictive uncertainty against real error is an open/deferred addition, not yet decided in or out.

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
