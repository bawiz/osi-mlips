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
The general pattern underlying all community contribution on a Model Page: a Contributor submits a claim attached to a specific Lens, it goes live immediately (no moderation queue), no field it attaches to is otherwise editable by the community. Every Lens has exactly one Community Annotation subtype: Known Failure Mode (Descriptive), Mechanistic Finding (Mechanistic), Bayesian Annotation (Bayesian).

### Known Failure Mode
The Descriptive Lens's Community Annotation subtype: an anecdotal entry describing an observed case where a Model performs poorly. Distinct from Mechanistic Lens content: a Known Failure Mode states *that* and *where* a Model fails (empirical/experiential), not *why* it fails at the level of the Model's internals — that explanation, if any, belongs in the Mechanistic Lens.

### Contributor
A person submitting a Community Annotation (of any subtype). Identified by a self-reported name/email typed at submission time — not an authenticated account, not verified. Attribution only, not access control.
