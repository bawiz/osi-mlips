# osi-mlips — Usefulness Boundary Hub

The MLIPs team's entry for the Open Scientific Intelligence Hackathon 2026.

Live demo: https://35-204-59-194.sslip.io/

Video demo: https://youtu.be/oFlc0wbX8-0

![Usefulness Boundary Hub workflow](./UB%20Hub_Flowchart.png)

## What this is

A catalogue of MLIP (machine learning interatomic potential) checkpoints — MACE, NequIP, and friends — that answers "what is this model actually good for, and where does it break?" For each cataloged **Model** (a specific checkpoint, e.g. `MACE-MP-0`), a **Model Page** covers the same model from three parallel **Lenses**:

- **Descriptive** — scope ("good for X, not for Y"), training data, architectural inductive biases, and curator-maintained **Known Failure Modes** with graded literature/community Evidence.
- **Mechanistic** — a live community feed of interpretability findings on that specific checkpoint (the Hub computes no circuits itself).
- **Bayesian** — precomputed uncertainty-quantification content, organized by which of several distinct UQ purposes (calibration, error detection, distribution-shift detection, simulation reliability) have actually been evaluated for that checkpoint.

Community members can annotate any Lens live, with no moderation queue; only curators can create a new Model Page or name a new Known Failure Mode.

Beyond the model-by-model catalogue, the Hub has two more Sections that work across all models at once:

- **Recommender** — a chat surface where you describe a use case and get a reasoned answer about which cataloged Model(s) fit it, grounded strictly in the Hub's own curated content (never general model knowledge, never live community annotations).
- **Explore** — browse reported **Usage Records** (what model, what chemical system, what kind of run, what came out) across every model at once, filterable by model, system class, or simulation type.

The full domain vocabulary — Model, Lens, Known Failure Mode, Evidence, Lineage, Known Variant, Section, and more — is defined in [CONTEXT.md](CONTEXT.md). The reasoning behind non-obvious architectural decisions (e.g. why the Mechanistic Lens holds no Hub-computed data, why the Recommender only ever sees curator-authored content) lives in [docs/adr/](docs/adr/).

## Project layout

```
app/
  index.html                        single-page vanilla-JS app, no build step
  data/mace-mp-0.json                curated literature: failure modes, evidence, references, known variants
  data/synthetic_mlip_demo_library.json  synthetic usage-record data powering Explore (clearly disclaimed as fictional)
server/
  recommender.py                     stdlib proxy in front of a local Ollama, for self-hosting the Recommender outside claude.ai
  Caddyfile, *.service                deployment config for the live demo (Caddy + systemd)
docs/adr/                            architecture decision records
CONTEXT.md                           domain glossary
```

## Running locally

The app is static — no build step, no server-side rendering:

```
cd app
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The Recommender and the live Community Annotation forms expect the `sample`/`db` capabilities, which are only available when the page is opened inside claude.ai; outside of it, the Recommender falls back to `/api/recommend`, served by `server/recommender.py` in front of a local Ollama (see `server/` for the self-hosting setup used for the live demo). Community annotation forms show a sign-in prompt instead of their form when no `db` capability is available.
