# Usefulness Boundary Hub — contribution workspaces

These workspaces are integrated into the main Hub GUI on the
`usefulness-boundary-hub` branch. Open the application through `app/index.html`,
not a second standalone Hub.

From the repository root:

```bash
python -m http.server 8000 --directory app
```

Open http://localhost:8000/ and use the shared tabs:

- **Catalogue & benchmarks:** filters, mind map/table, six-pillar inspector,
  shortlist and comparisons. Existing curated models link back to their Model Pages.
- **UQ benchmarks:** inherited ammonia evaluation tables, plots and epoch filters.
- **Knowledge graph:** MACE model, data and task relationships.
- **Contribute:** no-install browser folder extraction or existing extractor JSON import, six-pillar draft, safe live preview,
  downloadable JSON and clipboard copy. Empty fields remain unknown. Draft export
  preserves the original extraction and its provenance; it does not publish a model.

The example inquiry helper uses prewritten local responses; the main Hub's
curator-grounded recommender remains on the Model profiles landing page.

## Data and development

`data/catalog.json` is the editable extended catalogue. Run `npm run build:catalog`
from the repository root to regenerate `data/catalog.js`; `npm test` checks the
browser asset is current. The contribution branch's differing multi-epoch source
catalogue remains under `data/archive/`. Its separate trial JSON/CSV and precomputed
plots remain here as well. Inherited scientific results have not been independently
verified by this integration.

The main shell keeps this controller in a persistent same-origin frame, hiding its
old brand/navigation and controlling the selected view through `MLIPWorkspace.show`.
This isolates legacy styles and preserves the draft/shortlist when changing tabs.

See the [combined workspace decision](../../docs/adr/0009-combined-hub-workspaces.md)
and [root README](../../README.md) for deployment and extractor installation.

## 📜 Citation & References

- Coscia, Farris et al. (2025). *BLIP: Bayesian Machine Learning Interatomic Potentials from Scratch*. arXiv:2508.14022.
- Tan et al. (2023). *Single-Model Uncertainty Quantification in Neural Network Potentials*. J. Chem. Phys. 158, 204111.
- Batatia et al. (2022). *MACE: Higher Order Equivariant Message Passing Neural Networks for Materials Science*. NeurIPS.
- Riebesell et al. (2023). *Matbench Discovery: A benchmark for materials discovery*.
- Moon et al. (2024). *CatBench: Benchmark Framework of Machine Learning Interatomic Potentials in Adsorption Energy Predictions*.
