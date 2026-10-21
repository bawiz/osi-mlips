**Status:** partially superseded by ADR-0002 for the Mechanistic Lens — it no longer has any Hub-computed data at all, so the "precomputed activation/attribution data, rendered as an interactive artifact" part below no longer applies there. This ADR's reasoning still holds for the Bayesian Lens's OOD/uncertainty precompute.

# Precompute Mechanistic and Bayesian Lens content instead of running live inference

The Hub needs the Mechanistic Lens (activation/attribution data) and Bayesian Lens (OOD detection, uncertainty) to feel interactive and support community annotation (see Mechanistic Annotation in CONTEXT.md), which raised the option of running Model inference live, on demand, in the GUI. We decided the Hub never loads Model weights or runs inference itself: all activation, attribution, and OOD data is precomputed offline by Hub maintainers for a fixed set of example structures per Model, and the GUI only renders this precomputed data as an interactive, annotatable artifact.

**Why:** standing up real on-demand ML inference infrastructure (model loading, compute, attribution tooling) per Model, reliably, under hackathon time and live-demo conditions, is significant and fragile scope. Precomputed data still delivers live *interactivity* (clicking/exploring the artifact) and the community annotation layer without requiring the Hub to run models.

**Considered options:** Live, on-demand inference + attribution computed in the GUI backend per viewer request — rejected for the hackathon due to infra cost and demo fragility; may be revisited post-hackathon.
