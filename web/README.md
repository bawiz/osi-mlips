# MLIP Hub (v2.0 • Hub Release)

> **Community-driven knowledge, uncertainty quantification & mechanistic diagnostics for atomistic potentials**

MLIP Hub is an open, evidence-backed decision toolkit and benchmarking platform designed to help computational materials scientists, chemists, and DFT researchers evaluate, diagnose, and select **Machine Learning Interatomic Potentials (MLIPs)**.

---

## 🚀 Live Demo & Visualizing from Anywhere

This repository contains the standalone, client-side web application for **MLIP Hub**. It requires **zero server-side dependencies, zero npm installs, and zero database setup**.

### Option A: GitHub Pages (Instant Web Link)
1. In your GitHub repository, navigate to **Settings** → **Pages**.
2. Under **Build and deployment** → **Branch**, select `main` (or `master`) and set the folder to `/ (root)`.
3. Click **Save**. Within 60 seconds, your site will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

### Option B: Local Execution (5 seconds)
Clone the repository and run any static file server:
```bash
# Python built-in server
python -m http.server 8080
```
Then open `http://localhost:8080/` in your browser.

---

## 🔬 Core Features & Workspace Views

1. **Catalog & Benchmarks (Default View):**
   - Interactive SVG Mind Map and accessible Table View indexing major foundation potentials (MACE-MP-0, MACE-MPA-0, MACE-OFF23, MACE-OMAT, etc.).
   - Filterable by System Domain, Calculation Task, and real-time omni-search.
   - Comprehensive **6-Pillar Inspector Drawer** providing deep operational provenance.

2. **Uncertainty Hub (UQ):**
   - Dedicated benchmark showcase featuring empirical evaluations on **Ammonia ($NH_3$) Out-of-Distribution (OOD)** geometries across the pyramidal inversion coordinate.
   - Rigorous side-by-side comparison matrix: Contributor reproduction (6 epochs, laptop CPU) vs published literature (Tan et al. 2023, Coscia et al. 2025).
   - 5 interactive Plotly visual panels:
     - **Panel A:** Predicted Variance vs. Squared Force Error (log-log Spearman $ho$).
     - **Panel B:** Force Calibration Curve & Expected Calibration Error (ECE).
     - **Panel C:** Force Error vs. True Energy (0–70 kcal/mol barrier extrapolation).
     - **Panel D:** Side-by-side Numerical Metrics Table.
     - **Panel E:** Computational Cost Profile (training wall-clock vs 100x MC inference penalty).
   - Method explanations for Bayesian PaiNN (BLIP), Deep Ensembles, and Latent Gaussian Mixture Models (GMM).

3. **MACE Knowledge Graph (Reference Library):**
   - Interactive rabbit-hole mind map visualizing the MACE ecosystem, training corpora (MP-trj, Materials Project, Alexandria), and task recommendations.

4. **Contribute (+ Add Entry):**
   - Community submission form structured across all 6 pillars.
   - **Real-time Live Card Preview** dynamically rendering user input.
   - **JSON Schema Exporter** generating standardized snippets with clipboard copy for GitHub PRs.
   - Contributor attribution via CRediT taxonomy tags.

5. **Omni-Search Bar & Agent Inquiry Assistant:**
   - Real-time client-side filter across checkpoint names, elements (e.g. Fe, Ti), and level of theory.
   - **Ask MLIP Agent Modal** providing structured, evidence-grounded answers, exact literature citations, and explicit DO/DO NOT operational guardrails.

---

## 🏛️ The 6-Pillar Taxonomy Schema

Every checkpoint and benchmark in MLIP Hub is structured under six standardized pillars:

- **Pillar A: System:** System class, chemical formula, atom count, periodicity, reference DFT code (VASP, ORCA) and functional (PBE, r2SCAN, B3LYP).
- **Pillar B: Model Architecture:** Family, release version, symmetry/equivariance (SO(3), invariant), conservative force construction ($-
abla E$), cutoff radius, parameters.
- **Pillar C: Training & Test Data:** Partitioning strategy, distribution relationship (IID vs OOD energy extrapolation), energy/force bounds, provenance DOI.
- **Pillar D: Calculation Provenance:** Execution engine (ASE, LAMMPS, Python), workflow settings, hardware execution record, train/inference latency.
- **Pillar E: Property or Task:** Hierarchical level (**L0** Direct, **L1** Static Derived, **L2** Dynamic Sampling, **L3** Non-Native), task type.
- **Pillar F: Comparison & UQ:** Reference targets, functional match, MAE metrics, UQ method, calibration ECE, Spearman $ho$, and **evidence status**.

---

## 📂 File Structure

```text
├── index.html                           # Main application web shell
├── README.md                            # Documentation and deployment guide
├── .nojekyll                            # Enables GitHub Pages for all asset paths
├── css/
│   └── style.css                        # Dark slate-navy design system and glassmorphic UI
├── js/
│   └── app.js                           # Controller: 4 views, mind map, UQ panels, agent assistant
├── data/
│   ├── catalog.js                       # Offline-ready JavaScript catalog (window.MLIP_CATALOG)
│   └── catalog.json                     # Canonical 6-pillar JSON database
└── assets/
    ├── mlip_hub_logo.png                # Brand logo (wireframe globe with glowing nodes)
    ├── catbench_mace_mp0_mono.png       # CatBench single-adsorbate parity plot
    ├── catbench_mace_mp0_multi.png      # CatBench multi-adsorbate parity plot
    └── ammonia/                         # Embedded UQ benchmark visual panels
        ├── predicted_variance_vs_squared_error.html / .png
        ├── calibration_curve.html / .png
        ├── error_vs_true_energy.html / .png
        ├── metrics_table.html / .png
        └── cost_panel.html / .png
```

---

## 📜 Citation & References

- Coscia, Farris et al. (2025). *BLIP: Bayesian Machine Learning Interatomic Potentials from Scratch*. arXiv:2508.14022.
- Tan et al. (2023). *Single-Model Uncertainty Quantification in Neural Network Potentials*. J. Chem. Phys. 158, 204111.
- Batatia et al. (2022). *MACE: Higher Order Equivariant Message Passing Neural Networks for Materials Science*. NeurIPS.
- Riebesell et al. (2023). *Matbench Discovery: A benchmark for materials discovery*.
- Moon et al. (2024). *CatBench: Benchmark Framework of Machine Learning Interatomic Potentials in Adsorption Energy Predictions*.
