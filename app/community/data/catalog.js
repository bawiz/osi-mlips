// Generated from catalog.json by npm run build:catalog. Do not edit.
window.MLIP_CATALOG = {
  "metadata": {
    "title": "Usefulness Boundary Hub — Extended Catalogue",
    "version": "2.0.0",
    "generationDate": "2026-10-21",
    "license": "MIT",
    "description": "Structured catalog of pretrained MACE foundation models, verified benchmarks, and operational guardrails.",
    "platformName": "Usefulness Boundary Hub",
    "subtitle": "Community-driven knowledge, uncertainty quantification & mechanistic diagnostics for atomistic potentials"
  },
  "taxonomy": {
    "domains": [
      {
        "id": "crystalline_materials",
        "label": "Crystalline Materials",
        "description": "Inorganic solids, alloys, lattices, high-pressure phases, and solid-state mineralogy.",
        "tasks": [
          {
            "id": "stability_discovery",
            "label": "Thermodynamic Stability (Convex Hull)",
            "dftAnalogue": "Distance to convex hull ($\\Delta E_{hull}$), formation energy from elemental references.",
            "recommendedCheckpointIds": [
              "mace-mpa-0",
              "mace-mp-0"
            ]
          },
          {
            "id": "geometry_optimization",
            "label": "Geometry Optimization (IS2RE-SR)",
            "dftAnalogue": "VASP ISIF=3 relaxation of lattice vectors and atomic positions.",
            "recommendedCheckpointIds": [
              "mace-mpa-0",
              "mace-mp-0",
              "mace-matpes-r2scan-0"
            ]
          },
          {
            "id": "phonons_vibrations",
            "label": "Phonons & Thermal Conductivity",
            "dftAnalogue": "Harmonic finite-displacement supercell phonon calculations (Phonopy) or Boltzmann transport (phono3py).",
            "recommendedCheckpointIds": [
              "mace-mpa-0",
              "mace-mp-0"
            ]
          }
        ]
      },
      {
        "id": "molecular_chemistry",
        "label": "Molecular Chemistry",
        "description": "Organic small molecules, conformers, drug-like ligands, solvents, and non-covalent complexes.",
        "tasks": [
          {
            "id": "organic_molecules",
            "label": "Neutral Molecule Conformer Sampling",
            "dftAnalogue": "ωB97M-D3/def2-TZVP single-points or geometry optimizations of neutral organic conformers.",
            "recommendedCheckpointIds": [
              "mace-off23",
              "mace-omol-0"
            ]
          },
          {
            "id": "transition_metal_complexes",
            "label": "Transition Metal Complexes & Ions",
            "dftAnalogue": "Open-shell coordination chemistry with explicit charge and spin multiplicity.",
            "recommendedCheckpointIds": [
              "mace-omol-0"
            ]
          },
          {
            "id": "dipole_and_polarizability",
            "label": "Dipole & Polarizability Only",
            "dftAnalogue": "Static dipole moments and polarizability tensors (Response DFT).",
            "recommendedCheckpointIds": [
              "mace-mdp"
            ]
          }
        ]
      },
      {
        "id": "surfaces_and_catalysis",
        "label": "Surfaces & Heterogeneous Catalysis",
        "description": "Slab models, gas-surface adsorption, catalytic reaction pathways, and solid-gas interfaces.",
        "tasks": [
          {
            "id": "surfaces_and_adsorption",
            "label": "Adsorption Energy on Slabs",
            "dftAnalogue": "Adsorption energy: E_ads = E_adslab - E_slab - E_gas (or direct OC20 output).",
            "recommendedCheckpointIds": [
              "mace-mh-1",
              "mace-mp-0",
              "mace-mpa-0"
            ]
          }
        ]
      },
      {
        "id": "biology",
        "label": "Biomolecular Assemblies",
        "description": "Proteins, peptides, nucleic acids, and aqueous macromolecular solvation.",
        "tasks": [
          {
            "id": "protein_ligand",
            "label": "Protein-Ligand Interaction",
            "dftAnalogue": "Semi-empirical or QM/MM non-covalent binding energy in solution.",
            "recommendedCheckpointIds": [
              "mace-off23"
            ]
          }
        ]
      }
    ],
    "sixPillars": {
      "A": {
        "id": "system",
        "name": "System",
        "description": "Composition, formula, periodicity, reference DFT code/functional"
      },
      "B": {
        "id": "model",
        "name": "Model",
        "description": "Architecture, equivariance, force construction, hyperparameters"
      },
      "C": {
        "id": "data",
        "name": "Training and Test Data",
        "description": "Split definitions, distribution shift, energy/force ranges"
      },
      "D": {
        "id": "calculation",
        "name": "Calculation (Provenance)",
        "description": "Engine, workflow settings, hardware execution record"
      },
      "E": {
        "id": "property",
        "name": "Property or Task",
        "description": "L0 Direct, L1 Static Derived, L2 Dynamic, L3 Non-Native"
      },
      "F": {
        "id": "comparison",
        "name": "Comparison & Uncertainty (UQ)",
        "description": "Accuracy metrics, UQ methods, ECE, Spearman rho, evidence status"
      }
    }
  },
  "checkpoints": [
    {
      "id": "mace-mp-0",
      "name": "MACE-MP-0",
      "family": "MACE",
      "releaseVersion": "v0.3.5 / v0.3.6+",
      "license": "MIT",
      "commercialUseAllowed": true,
      "targetDomain": "crystalline_materials",
      "targetDomainLabel": "Crystalline Materials",
      "supportedTasks": [
        "bulk_crystal_properties",
        "stability_discovery",
        "geometry_optimization",
        "phonons_vibrations",
        "surfaces_and_adsorption"
      ],
      "elementsCovered": {
        "count": 89,
        "summary": "89 elements (H to Ac, Materials Project coverage)",
        "list": [
          "H",
          "He",
          "Li",
          "Be",
          "B",
          "C",
          "N",
          "O",
          "F",
          "Ne",
          "Na",
          "Mg",
          "Al",
          "Si",
          "P",
          "S",
          "Cl",
          "Ar",
          "K",
          "Ca",
          "Sc",
          "Ti",
          "V",
          "Cr",
          "Mn",
          "Fe",
          "Co",
          "Ni",
          "Cu",
          "Zn",
          "Ga",
          "Ge",
          "As",
          "Se",
          "Br",
          "Kr",
          "Rb",
          "Sr",
          "Y",
          "Zr",
          "Nb",
          "Mo",
          "Tc",
          "Ru",
          "Rh",
          "Pd",
          "Ag",
          "Cd",
          "In",
          "Sn",
          "Sb",
          "Te",
          "I",
          "Xe",
          "Cs",
          "Ba",
          "La",
          "Ce",
          "Pr",
          "Nd",
          "Pm",
          "Sm",
          "Eu",
          "Gd",
          "Tb",
          "Dy",
          "Ho",
          "Er",
          "Tm",
          "Yb",
          "Lu",
          "Hf",
          "Ta",
          "W",
          "Re",
          "Os",
          "Ir",
          "Pt",
          "Au",
          "Hg",
          "Tl",
          "Pb",
          "Bi",
          "Ac",
          "Th",
          "Pa",
          "U",
          "Np",
          "Pu"
        ]
      },
      "trainingData": {
        "datasetId": "MPtrj",
        "datasetName": "MPtrj (Materials Project Trajectories)",
        "levelOfTheory": "DFT (PBE+U, VASP)",
        "functional": "PBE+U",
        "code": "VASP",
        "structureCount": 1580395,
        "source": {
          "label": "MPtrj Dataset on Figshare",
          "url": "https://figshare.com/articles/dataset/23713842",
          "localFile": "matbench-discovery-main/data/datasets.yml#L64"
        }
      },
      "designedFor": "Universal interatomic potential for inorganic crystalline materials covering 89 chemical elements.",
      "modelSizes": [
        "small",
        "medium",
        "large"
      ],
      "recommendedDefaultSize": "medium",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float32",
        "rationale": "float64 prevents force noise during minimization; float32 provides 2x speedup for thermal MD."
      },
      "fineTuningGuidance": {
        "supported": true,
        "e0Mode": "estimated",
        "command": "mace_run_train --foundation_model=\"medium\" --train_file=\"train.xyz\" --E0s=\"estimated\" --energy_weight=1.0 --forces_weight=1.0 --lr=0.01 --device=cuda",
        "source": "mace-develop/README.md#L330"
      },
      "benchmarks": [
        {
          "suite": "Matbench Discovery",
          "task": "Thermodynamic Stability Discovery",
          "dataset": "WBM (215k unique prototypes)",
          "metric": "F1 Score (Stability Classification)",
          "value": 0.669,
          "unit": "fraction",
          "displayValue": "0.669",
          "contextBaseline": {
            "model": "CHGNet (Context Baseline)",
            "value": 0.613,
            "note": "Context only: CHGNet is a different architecture."
          },
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "Matbench Discovery",
          "task": "Formation Energy MAE",
          "dataset": "WBM Test Set",
          "metric": "Energy MAE",
          "value": 0.057,
          "unit": "eV/atom",
          "displayValue": "0.057 eV/atom",
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "Matbench Discovery",
          "task": "Geometry Optimization",
          "dataset": "WBM relaxed structures",
          "metric": "Structural RMSD",
          "value": 0.0915,
          "unit": "Å",
          "displayValue": "0.0915 Å",
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "Matbench Discovery",
          "task": "Lattice Thermal Conductivity",
          "dataset": "PhononDB (103 structures)",
          "metric": "κ_SRME",
          "value": 0.682,
          "unit": "dimensionless (lower is better)",
          "displayValue": "0.682",
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "CatBench",
          "task": "Catalytic Adsorption Energy",
          "dataset": "MamunTutorial (20-reaction alloy subset)",
          "metric": "ADwT (Adsorption Detection within Tolerance)",
          "value": 80.3,
          "unit": "%",
          "displayValue": "80.3%",
          "plotAsset": "assets/catbench_mace_mp0_mono.png",
          "multiPlotAsset": "assets/catbench_mace_mp0_multi.png",
          "evidenceLabel": "Benchmarked on",
          "note": "CatBench evaluation from tutorial run. 20/20 reactions succeeded without unphysical collapse."
        }
      ],
      "guidance": [
        {
          "type": "DO",
          "title": "Use float64 Precision for Relaxation & Phonons",
          "statement": "Configure default_dtype='float64' for geometry optimization and phonon calculations in ASE.",
          "dftRationale": "Like setting a tight EDIFF tolerance in VASP, float64 suppresses roundoff noise in forces that causes false minimization plateaus.",
          "source": {
            "label": "mace/calculators/foundations_models.py#L470",
            "url": "https://github.com/ACEsuit/mace"
          }
        },
        {
          "type": "DO",
          "title": "Add D3 Dispersion for Surface Adsorption",
          "statement": "When evaluating surface adsorption, wrap MACE-MP-0 in D3 dispersion correction (dispersion=True or catbench.dispersion).",
          "dftRationale": "MPTrj reference calculations used standard PBE+U without van der Waals dispersion. Weak adsorption requires explicit D3 dispersion.",
          "source": {
            "label": "CatBench-main/README.md#L216",
            "url": "https://github.com/JinukMoon/CatBench"
          }
        },
        {
          "type": "DO_NOT",
          "title": "Do Not Directly Compare to Materials Project Hull Energies",
          "statement": "Do not subtract raw MACE-MP-0 predicted total energies from Materials Project hull entries without MP2020Compatibility corrections.",
          "dftRationale": "MACE predicts raw VASP total energies. MP published energies incorporate empirical GGA/GGA+U mixing shifts and anion corrections.",
          "source": {
            "label": "mace-develop/README.md#L289-291",
            "url": "https://github.com/ACEsuit/mace"
          }
        },
        {
          "type": "DO_NOT",
          "title": "Check Before Using for Protactinium (Pa) or Selenium (Se) Bonds",
          "statement": "Be cautious when simulating isolated Pa or Se bond dissociation; Matbench diatomics benchmark observed anomalous curve flips on MACE-MP-0.",
          "dftRationale": "Reference MPTrj lacks isolated diatomics trajectories for these species. MACE-MPA-0 resolves this limitation.",
          "source": {
            "label": "matbench-discovery-main/models/mace/mace-mp-0.yml#L106",
            "url": "https://github.com/janosh/matbench-discovery"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE GitHub Repository",
          "url": "https://github.com/ACEsuit/mace"
        },
        {
          "label": "MACE-MP Preprint (arXiv:2401.00096)",
          "url": "https://arxiv.org/abs/2401.00096"
        },
        {
          "label": "Matbench Discovery Benchmark Entry",
          "url": "https://matbench-discovery.materialsproject.org"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "89 elements (H to Ac, Materials Project coverage)"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "PBE+U",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.5 / v0.3.6+",
            "license": "MIT",
            "commercial_allowed": true,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 1580395,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "MPtrj (Materials Project Trajectories)",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "mace-mpa-0",
      "name": "MACE-MPA-0",
      "family": "MACE",
      "releaseVersion": "v0.3.9+",
      "license": "MIT",
      "commercialUseAllowed": true,
      "targetDomain": "crystalline_materials",
      "targetDomainLabel": "Crystalline Materials",
      "supportedTasks": [
        "bulk_crystal_properties",
        "stability_discovery",
        "geometry_optimization",
        "phonons_vibrations",
        "surfaces_and_adsorption"
      ],
      "elementsCovered": {
        "count": 89,
        "summary": "89 elements (H to Ac, MP + Alexandria coverage)",
        "list": [
          "H",
          "He",
          "Li",
          "Be",
          "B",
          "C",
          "N",
          "O",
          "F",
          "Ne",
          "Na",
          "Mg",
          "Al",
          "Si",
          "P",
          "S",
          "Cl",
          "Ar",
          "K",
          "Ca",
          "Sc",
          "Ti",
          "V",
          "Cr",
          "Mn",
          "Fe",
          "Co",
          "Ni",
          "Cu",
          "Zn",
          "Ga",
          "Ge",
          "As",
          "Se",
          "Br",
          "Kr",
          "Rb",
          "Sr",
          "Y",
          "Zr",
          "Nb",
          "Mo",
          "Tc",
          "Ru",
          "Rh",
          "Pd",
          "Ag",
          "Cd",
          "In",
          "Sn",
          "Sb",
          "Te",
          "I",
          "Xe",
          "Cs",
          "Ba",
          "La",
          "Ce",
          "Pr",
          "Nd",
          "Pm",
          "Sm",
          "Eu",
          "Gd",
          "Tb",
          "Dy",
          "Ho",
          "Er",
          "Tm",
          "Yb",
          "Lu",
          "Hf",
          "Ta",
          "W",
          "Re",
          "Os",
          "Ir",
          "Pt",
          "Au",
          "Hg",
          "Tl",
          "Pb",
          "Bi",
          "Ac",
          "Th",
          "Pa",
          "U",
          "Np",
          "Pu"
        ]
      },
      "trainingData": {
        "datasetId": "MPtrj+sAlex",
        "datasetName": "MPtrj + Alexandria (sAlex)",
        "levelOfTheory": "DFT (PBE+U, VASP)",
        "functional": "PBE+U",
        "code": "VASP",
        "structureCount": 1680000,
        "source": {
          "label": "Matbench Discovery mace-mpa-0.yml",
          "url": "https://github.com/janosh/matbench-discovery/pull/175",
          "localFile": "matbench-discovery-main/models/mace/mace-mpa-0.yml#L63"
        }
      },
      "designedFor": "Upgraded universal materials model with augmented high-pressure and Alexandria trajectory coverage.",
      "modelSizes": [
        "medium"
      ],
      "recommendedDefaultSize": "medium",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float32",
        "rationale": "float64 for force minimization; float32 for high-throughput MD."
      },
      "fineTuningGuidance": {
        "supported": true,
        "e0Mode": "estimated",
        "command": "mace_run_train --foundation_model=\"medium-mpa-0\" --train_file=\"train.xyz\" --E0s=\"estimated\" --lr=0.01 --device=cuda",
        "source": "mace-develop/README.md#L138"
      },
      "benchmarks": [
        {
          "suite": "Matbench Discovery",
          "task": "Thermodynamic Stability Discovery",
          "dataset": "WBM (215k unique prototypes)",
          "metric": "F1 Score (Stability Classification)",
          "value": 0.852,
          "unit": "fraction",
          "displayValue": "0.852",
          "contextBaseline": {
            "model": "MACE-MP-0 (Predecessor)",
            "value": 0.669,
            "note": "Substantial accuracy gain from Alexandria dataset augmentation."
          },
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "Matbench Discovery",
          "task": "Formation Energy MAE",
          "dataset": "WBM Test Set",
          "metric": "Energy MAE",
          "value": 0.028,
          "unit": "eV/atom",
          "displayValue": "0.028 eV/atom",
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "Matbench Discovery",
          "task": "Geometry Optimization",
          "dataset": "WBM relaxed structures",
          "metric": "Structural RMSD",
          "value": 0.0731,
          "unit": "Å",
          "displayValue": "0.0731 Å",
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "Matbench Discovery",
          "task": "Lattice Thermal Conductivity",
          "dataset": "PhononDB (103 structures)",
          "metric": "κ_SRME",
          "value": 0.412,
          "unit": "dimensionless (lower is better)",
          "displayValue": "0.412",
          "evidenceLabel": "Benchmarked on"
        },
        {
          "suite": "CatBench",
          "task": "Catalytic Adsorption Energy",
          "dataset": "Not documented here",
          "metric": "ADwT",
          "value": null,
          "unit": "%",
          "displayValue": "Not documented here",
          "evidenceLabel": "Not documented here",
          "note": "CatBench evaluation for MACE-MPA-0 is not present in local files."
        }
      ],
      "guidance": [
        {
          "type": "DO",
          "title": "Preferred Foundation Model for Inorganic Materials",
          "statement": "Use MACE-MPA-0 as the default foundation model over MACE-MP-0 for crystal property and stability predictions.",
          "dftRationale": "The addition of the Alexandria dataset resolves MPTrj unphysical high-pressure and elemental boundary artifacts.",
          "source": {
            "label": "mace-develop/mace/calculators/foundations_models.py#L170-173",
            "url": "https://github.com/ACEsuit/mace"
          }
        },
        {
          "type": "DO",
          "title": "Use float64 for Reliable Phonon Spectra",
          "statement": "Keep default_dtype='float64' for second-order force constants and harmonic phonon dispersion curves.",
          "dftRationale": "Avoids imaginary acoustic modes near the Gamma point caused by finite floating-point rounding.",
          "source": {
            "label": "matbench-discovery-main/models/mace/mace-mpa-0.yml#L212",
            "url": "https://github.com/janosh/matbench-discovery"
          }
        },
        {
          "type": "DO_NOT",
          "title": "Do Not Mix Total Energies with Hybrid or Meta-GGA Calculations",
          "statement": "Do not compare formation energies to reference data calculated with HSE06 or SCAN without recalibrating.",
          "dftRationale": "MACE-MPA-0 predicts PBE+U exchange-correlation. Cross-functional energy differences are not physically meaningful.",
          "source": {
            "label": "mace-develop/README.md#L274",
            "url": "https://github.com/ACEsuit/mace"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE GitHub Repository",
          "url": "https://github.com/ACEsuit/mace"
        },
        {
          "label": "Matbench Discovery Submission #175",
          "url": "https://github.com/janosh/matbench-discovery/pull/175"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "89 elements (H to Ac, MP + Alexandria coverage)"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "PBE+U",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.9+",
            "license": "MIT",
            "commercial_allowed": true,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 1680000,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "MPtrj + Alexandria (sAlex)",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "mace-off23",
      "name": "MACE-OFF23",
      "family": "MACE",
      "releaseVersion": "v0.3.6+",
      "license": "ASL (Academic Software License)",
      "commercialUseAllowed": false,
      "targetDomain": "molecular_chemistry",
      "targetDomainLabel": "Molecular Chemistry & Organic Systems",
      "supportedTasks": [
        "organic_molecules",
        "conformer_search",
        "molecular_liquids",
        "geometry_optimization"
      ],
      "elementsCovered": {
        "count": 10,
        "summary": "10 elements: H, C, N, O, F, P, S, Cl, Br, I",
        "list": [
          "H",
          "C",
          "N",
          "O",
          "F",
          "P",
          "S",
          "Cl",
          "Br",
          "I"
        ]
      },
      "trainingData": {
        "datasetId": "SPICE-v1",
        "datasetName": "SPICE v1 (Small-molecule/Protein Interaction Chemical Entities)",
        "levelOfTheory": "DFT (ωB97M-D3 / def2-TZVP)",
        "functional": "ωB97M-D3",
        "code": "NWChem / Psi4",
        "structureCount": 1132808,
        "source": {
          "label": "MACE-OFF Paper (arXiv:2312.15211)",
          "url": "https://arxiv.org/abs/2312.15211",
          "localFile": "mace-develop/README.md#L276"
        }
      },
      "designedFor": "Transferable force field for neutral organic chemistry, drug-like small molecules, conformers, and molecular liquids.",
      "modelSizes": [
        "small",
        "medium",
        "large"
      ],
      "recommendedDefaultSize": "medium",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float32",
        "rationale": "float64 is strongly recommended by authors for geometry optimization; float32 for MD."
      },
      "fineTuningGuidance": {
        "supported": true,
        "e0Mode": "estimated",
        "command": "mace_run_train --foundation_model=\"mace_off23_medium.model\" --train_file=\"molecules.xyz\" --E0s=\"estimated\" --lr=0.01",
        "source": "mace-develop/README.md#L306"
      },
      "benchmarks": [
        {
          "suite": "MACE-OFF Benchmarks",
          "task": "Conformer Energy Ranking",
          "dataset": "SPICE Test Subset",
          "metric": "Conformer Relative Energy MAE",
          "value": "Reported in arXiv:2312.15211",
          "unit": "kcal/mol",
          "displayValue": "< 0.5 kcal/mol",
          "evidenceLabel": "Designed for"
        },
        {
          "suite": "Matbench Discovery",
          "task": "Solid-State Stability",
          "dataset": "Not documented here",
          "metric": "F1",
          "value": null,
          "unit": "",
          "displayValue": "Not documented here",
          "evidenceLabel": "Not documented here",
          "note": "MACE-OFF23 is an organic molecular potential and is not benchmarked on inorganic crystals."
        },
        {
          "suite": "CatBench",
          "task": "Catalytic Adsorption Energy",
          "dataset": "Not documented here",
          "metric": "ADwT",
          "value": null,
          "unit": "%",
          "displayValue": "Not documented here",
          "evidenceLabel": "Not documented here"
        }
      ],
      "guidance": [
        {
          "type": "DO",
          "title": "Use for Organic Molecules and Drug-like Conformers",
          "statement": "Use MACE-OFF23 for neutral organic molecules, conformer sampling, and solvent box molecular dynamics.",
          "dftRationale": "Trained on ωB97M-D3 reference data, capturing torsional barriers and dispersion-driven intramolecular stacking.",
          "source": {
            "label": "mace-develop/README.md#L306",
            "url": "https://github.com/ACEsuit/mace-off"
          }
        },
        {
          "type": "DO_NOT",
          "title": "Commercial Use Prohibited Under ASL License",
          "statement": "Do not deploy MACE-OFF23 in commercial products without an explicit agreement from the copyright holders.",
          "dftRationale": "Model is released under Academic Software License (ASL). ASL permits research and non-commercial evaluation only.",
          "source": {
            "label": "mace-develop/mace/calculators/foundations_models.py#L446-451",
            "url": "https://github.com/gabor1/ASL"
          }
        },
        {
          "type": "DO_NOT",
          "title": "Do Not Use for Transition Metal Complexes or Inorganic Solids",
          "statement": "Never attempt calculations on coordination complexes containing metals or inorganic framework crystals.",
          "dftRationale": "Only 10 organic species (H, C, N, O, F, P, S, Cl, Br, I) are parametrized. Any metal atom will raise a KeyError.",
          "source": {
            "label": "mace-develop/README.md#L276",
            "url": "https://github.com/ACEsuit/mace-off"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE-OFF GitHub Repository",
          "url": "https://github.com/ACEsuit/mace-off"
        },
        {
          "label": "MACE-OFF Preprint (arXiv:2312.15211)",
          "url": "https://arxiv.org/abs/2312.15211"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "10 elements: H, C, N, O, F, P, S, Cl, Br, I"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "ωB97M-D3",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.6+",
            "license": "ASL (Academic Software License)",
            "commercial_allowed": false,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 1132808,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "SPICE v1 (Small-molecule/Protein Interaction Chemical Entities)",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "mace-omat-0",
      "name": "MACE-OMAT-0",
      "family": "MACE",
      "releaseVersion": "v0.3.10+",
      "license": "ASL (Academic Software License)",
      "commercialUseAllowed": false,
      "targetDomain": "crystalline_materials",
      "targetDomainLabel": "Crystalline Materials",
      "supportedTasks": [
        "bulk_crystal_properties",
        "geometry_optimization"
      ],
      "elementsCovered": {
        "count": 89,
        "summary": "89 elements (OMAT dataset)",
        "list": []
      },
      "trainingData": {
        "datasetId": "OMAT",
        "datasetName": "Open Materials 2024 (OMAT)",
        "levelOfTheory": "DFT (PBE+U, VASP 54)",
        "functional": "PBE+U",
        "code": "VASP 54",
        "structureCount": 10000000,
        "source": {
          "label": "mace-develop/README.md#L275",
          "url": "https://github.com/ACEsuit/mace",
          "localFile": "mace-develop/README.md#L275"
        }
      },
      "designedFor": "Trained on the large-scale OMAT dataset with VASP 54 PBE+U settings.",
      "modelSizes": [
        "small",
        "medium"
      ],
      "recommendedDefaultSize": "medium",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float32",
        "rationale": "Standard MACE precision defaults apply."
      },
      "fineTuningGuidance": {
        "supported": true,
        "e0Mode": "estimated",
        "command": "mace_run_train --foundation_model=\"medium-omat-0\" --train_file=\"train.xyz\" --E0s=\"estimated\"",
        "source": "mace-develop/README.md#L138"
      },
      "benchmarks": [
        {
          "suite": "Matbench Discovery",
          "task": "Thermodynamic Stability Discovery",
          "dataset": "Not documented here",
          "metric": "F1",
          "value": null,
          "unit": "",
          "displayValue": "Not documented here",
          "evidenceLabel": "Not documented here",
          "note": "OMAT checkpoint benchmark submission not present in local matbench directory."
        }
      ],
      "guidance": [
        {
          "type": "DO_NOT",
          "title": "Commercial Use Restricted by ASL License",
          "statement": "Do not incorporate MACE-OMAT-0 into commercial software pipelines without commercial licensing.",
          "dftRationale": "Published under the Academic Software License.",
          "source": {
            "label": "mace-develop/mace/calculators/foundations_models.py#L179",
            "url": "https://github.com/gabor1/ASL"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE-Foundations Releases",
          "url": "https://github.com/ACEsuit/mace-foundations/releases"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "89 elements (OMAT dataset)"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "PBE+U",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.10+",
            "license": "ASL (Academic Software License)",
            "commercial_allowed": false,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 10000000,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "Open Materials 2024 (OMAT)",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "mace-matpes-r2scan-0",
      "name": "MACE-MATPES-r2SCAN-0",
      "family": "MACE",
      "releaseVersion": "v0.3.10+",
      "license": "ASL (Academic Software License)",
      "commercialUseAllowed": false,
      "targetDomain": "crystalline_materials",
      "targetDomainLabel": "Crystalline Materials (Meta-GGA)",
      "supportedTasks": [
        "bulk_crystal_properties",
        "geometry_optimization"
      ],
      "elementsCovered": {
        "count": 89,
        "summary": "89 elements",
        "list": []
      },
      "trainingData": {
        "datasetId": "MATPES-r2SCAN",
        "datasetName": "MATPES Meta-GGA Dataset",
        "levelOfTheory": "DFT (r2SCAN Meta-GGA)",
        "functional": "r2SCAN",
        "code": "VASP",
        "structureCount": 2000000,
        "source": {
          "label": "mace-develop/README.md#L278",
          "url": "https://github.com/ACEsuit/mace",
          "localFile": "mace-develop/README.md#L278"
        }
      },
      "designedFor": "Materials modeling using the r2SCAN meta-GGA functional for enhanced bandgaps and phase stability.",
      "modelSizes": [
        "medium"
      ],
      "recommendedDefaultSize": "medium",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float32",
        "rationale": "float64 for relaxation."
      },
      "fineTuningGuidance": {
        "supported": true,
        "e0Mode": "estimated",
        "command": "mace_run_train --foundation_model=\"mace-matpes-r2scan-0\" --train_file=\"train.xyz\" --E0s=\"estimated\"",
        "source": "mace-develop/README.md#L138"
      },
      "benchmarks": [
        {
          "suite": "Matbench Discovery",
          "task": "Thermodynamic Stability Discovery",
          "dataset": "Not documented here",
          "metric": "F1",
          "value": null,
          "unit": "",
          "displayValue": "Not documented here",
          "evidenceLabel": "Not documented here"
        }
      ],
      "guidance": [
        {
          "type": "DO",
          "title": "Use When High-Fidelity Meta-GGA is Required",
          "statement": "Select MACE-MATPES-r2SCAN-0 if your baseline DFT studies require meta-GGA description without empirical Hubbard U corrections.",
          "dftRationale": "r2SCAN provides superior crystal geometries and polymorph energy orderings compared to standard PBE.",
          "source": {
            "label": "mace-develop/README.md#L278",
            "url": "https://github.com/ACEsuit/mace"
          }
        },
        {
          "type": "DO_NOT",
          "title": "Do Not Mix With PBE Reference Energies",
          "statement": "Do not evaluate energy differences between PBE-relaxed structures and r2SCAN predictions.",
          "dftRationale": "r2SCAN and PBE evaluate different exchange-correlation approximations; raw energy differences have no thermodynamic meaning.",
          "source": {
            "label": "mace-develop/README.md#L278",
            "url": "https://github.com/ACEsuit/mace"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE Foundations Releases",
          "url": "https://github.com/ACEsuit/mace-foundations/releases"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "89 elements"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "r2SCAN",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.10+",
            "license": "ASL (Academic Software License)",
            "commercial_allowed": false,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 2000000,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "MATPES Meta-GGA Dataset",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "mace-omol-0",
      "name": "MACE-OMOL-0",
      "family": "MACE",
      "releaseVersion": "v0.3.14+",
      "license": "ASL (Academic Software License)",
      "commercialUseAllowed": false,
      "targetDomain": "molecular_chemistry",
      "targetDomainLabel": "Molecules, Transition Metals & Cations",
      "supportedTasks": [
        "organic_molecules",
        "conformer_search",
        "transition_metal_complexes"
      ],
      "elementsCovered": {
        "count": 89,
        "summary": "89 elements with charge & spin embedding",
        "list": []
      },
      "trainingData": {
        "datasetId": "OMOL",
        "datasetName": "Open Molecular Dataset (OMOL)",
        "levelOfTheory": "DFT (ωB97M-VV10)",
        "functional": "ωB97M-VV10",
        "code": "Q-Chem / ORCA",
        "structureCount": 5000000,
        "source": {
          "label": "mace-develop/README.md#L279",
          "url": "https://github.com/ACEsuit/mace",
          "localFile": "mace-develop/README.md#L279"
        }
      },
      "designedFor": "Accurate molecular potential supporting charge and spin states across 89 elements including transition metal complexes.",
      "modelSizes": [
        "large"
      ],
      "recommendedDefaultSize": "large",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float32",
        "rationale": "float64 recommended for molecular geometry optimization."
      },
      "fineTuningGuidance": {
        "supported": true,
        "e0Mode": "estimated",
        "command": "mace_run_train --foundation_model=\"large\" --head=\"omol\" --train_file=\"train.xyz\" --E0s=\"estimated\"",
        "source": "mace-develop/mace/calculators/foundations_models.py#L631"
      },
      "benchmarks": [
        {
          "suite": "OMOL Benchmarks",
          "task": "Molecular Accuracy",
          "dataset": "OMOL Test Set",
          "metric": "Energy MAE",
          "value": "Reported in OMOL preprint",
          "unit": "kcal/mol",
          "displayValue": "< 1.0 kcal/mol",
          "evidenceLabel": "Designed for"
        }
      ],
      "guidance": [
        {
          "type": "DO",
          "title": "Use for Charged Organic Species and Metal-Organic Complexes",
          "statement": "Choose MACE-OMOL-0 when molecular systems include charged cations or organometallic transition centers.",
          "dftRationale": "Unlike MACE-OFF23 (neutral, 10 elements), MACE-OMOL-0 embeds charge/spin states across 89 elements.",
          "source": {
            "label": "mace-develop/README.md#L279",
            "url": "https://github.com/ACEsuit/mace"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE Foundations Releases",
          "url": "https://github.com/ACEsuit/mace-foundations/releases"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "89 elements with charge & spin embedding"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "ωB97M-VV10",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.14+",
            "license": "ASL (Academic Software License)",
            "commercial_allowed": false,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 5000000,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "Open Molecular Dataset (OMOL)",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "mace-mh-1",
      "name": "MACE-MH-1",
      "family": "MACE",
      "releaseVersion": "v0.3.14+",
      "license": "ASL (Academic Software License)",
      "commercialUseAllowed": false,
      "targetDomain": "surfaces_and_catalysis",
      "targetDomainLabel": "Multi-Head (Surfaces, Crystals & Molecules)",
      "supportedTasks": [
        "surfaces_and_adsorption",
        "bulk_crystal_properties",
        "organic_molecules"
      ],
      "elementsCovered": {
        "count": 89,
        "summary": "89 elements",
        "list": []
      },
      "trainingData": {
        "datasetId": "Multi-Head-OMAT-OMOL-OC20-MATPES",
        "datasetName": "OMAT / OMOL / OC20 / MATPES Joint Corpus",
        "levelOfTheory": "Multi-Theory (PBE, r2SCAN, ωB97M-VV10)",
        "functional": "Multi-Theory",
        "code": "VASP / Q-Chem",
        "structureCount": 20000000,
        "source": {
          "label": "mace-develop/README.md#L280",
          "url": "https://huggingface.co/mace-foundations/mace-mh-1",
          "localFile": "mace-develop/README.md#L280"
        }
      },
      "designedFor": "Universal multi-head foundation model bridging solid-state materials, surface catalysis (OC20), and molecular chemistry.",
      "modelSizes": [
        "mh-0",
        "mh-1"
      ],
      "recommendedDefaultSize": "mh-1",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float32",
        "rationale": "float64 for surface optimization."
      },
      "fineTuningGuidance": {
        "supported": true,
        "e0Mode": "estimated",
        "command": "mace_run_train --foundation_model=\"mh-1\" --head=\"omat_pbe\" ...",
        "source": "CatBench-main/tests/test_116.py#L50"
      },
      "benchmarks": [
        {
          "suite": "Cross-Domain Evaluation",
          "task": "Cross Domain Performance",
          "dataset": "OC20 / OMAT / OMOL",
          "metric": "Generalization",
          "value": "State of the art cross-domain performance",
          "unit": "",
          "displayValue": "Documented in HuggingFace release",
          "evidenceLabel": "Designed for"
        }
      ],
      "guidance": [
        {
          "type": "DO",
          "title": "Specify Explicit Model Head in Calculator",
          "statement": "Always pass the target head explicitly (e.g. head='omat_pbe' or head='oc20_usemppbe') when initializing MACECalculator.",
          "dftRationale": "mace-torch falls back to a default head with only a logging warning if given an unrecognized head name.",
          "source": {
            "label": "CatBench-main/README.md#L313-317",
            "url": "https://github.com/JinukMoon/CatBench"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE-MH-1 on Hugging Face",
          "url": "https://huggingface.co/mace-foundations/mace-mh-1"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "89 elements"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "Multi-Theory",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.14+",
            "license": "ASL (Academic Software License)",
            "commercial_allowed": false,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 20000000,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "OMAT / OMOL / OC20 / MATPES Joint Corpus",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "mace-mdp",
      "name": "MACE-MDP",
      "family": "MACE",
      "releaseVersion": "v0.3.x",
      "license": "MIT / Academic",
      "commercialUseAllowed": true,
      "targetDomain": "molecular_chemistry",
      "targetDomainLabel": "Organic Dipole & Polarizability",
      "supportedTasks": [
        "dipole_and_polarizability"
      ],
      "elementsCovered": {
        "count": 10,
        "summary": "Organic elements (H, C, N, O, etc.)",
        "list": []
      },
      "trainingData": {
        "datasetId": "QM9 / Dipole Trajectories",
        "datasetName": "Molecular Polarizability Reference Data",
        "levelOfTheory": "DFT / Response Theory",
        "functional": "B3LYP / ωB97X",
        "code": "Gaussian / Q-Chem",
        "structureCount": 130000,
        "source": {
          "label": "mace/calculators/foundations_models.py#L653",
          "url": "https://github.com/Nilsgoe/MACE-MDP",
          "localFile": "mace-develop/mace/calculators/foundations_models.py#L653"
        }
      },
      "designedFor": "Predicting molecular dipole moments and static polarizability tensors of organic systems.",
      "modelSizes": [
        "single"
      ],
      "recommendedDefaultSize": "single",
      "defaultDtype": {
        "relaxation": "float64",
        "md": "float64",
        "rationale": "Not applicable for relaxation."
      },
      "fineTuningGuidance": {
        "supported": false,
        "e0Mode": "average",
        "command": "Fine-tuning MACE-MDP is not documented in standard CLI.",
        "source": "mace-develop/mace/calculators/foundations_models.py#L658"
      },
      "benchmarks": [],
      "guidance": [
        {
          "type": "DO_NOT",
          "title": "NEVER USE FOR ENERGIES OR FORCES",
          "statement": "Do not attempt geometry relaxation, molecular dynamics, or potential energy evaluation with MACE-MDP.",
          "dftRationale": "MACE-MDP is strictly a dipole and polarizability model. It has no physical representation of the potential energy surface.",
          "source": {
            "label": "mace-develop/mace/calculators/foundations_models.py#L658-660",
            "url": "https://github.com/ACEsuit/mace"
          }
        }
      ],
      "sources": [
        {
          "label": "MACE-MDP Repository",
          "url": "https://github.com/Nilsgoe/MACE-MDP"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "periodic_crystal",
          "identity": {
            "formula": "89 elements (H to Bi)",
            "composition": "Materials Project crystal structures",
            "num_atoms": 20,
            "periodicity": "3d",
            "source": "Materials Project (MP-trj-2022.9)"
          },
          "material_specific": {
            "space_group": "All 230 space groups represented",
            "crystal_system": "Cubic, Tetragonal, Orthorhombic, Hexagonal, Monoclinic, Triclinic",
            "cell_type": "Primitive & Conventional cells"
          },
          "element_coverage": {
            "elements": [
              "89 elements"
            ],
            "status": "Organic elements (H, C, N, O, etc.)"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "B3LYP / ωB97X",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "MACE",
            "checkpoint_version": "v0.3.x",
            "license": "MIT / Academic",
            "commercial_allowed": true,
            "source_repo": "https://github.com/ACEsuit/mace"
          },
          "origin": "pre-trained",
          "architecture": {
            "type": "Higher-order Equivariant Message Passing (MACE)",
            "symmetry_equivariance": "SO(3) / O(3) Equivariant",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": 3,
            "layers": 2,
            "parameter_count": "1.2M - 4.7M"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Higher-body interaction expansion enables smooth dissociation limits and correct phonon dispersion",
            "method": "Direct spherical harmonics projection"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 130000,
            "val_count": 10000,
            "test_count": 215000,
            "split_strategy": "Random & prototype holdout"
          },
          "distribution_relationship": "compositional shift & prototype extrapolation (WBM)",
          "energy_force_ranges": {
            "train_energy_range": "Materials Project ground states + thermal rattling",
            "test_energy_range": "WBM unique prototypes"
          },
          "provenance": {
            "dataset_name": "Molecular Polarizability Reference Data",
            "doi": "10.1038/s41524-023-01077-6",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 1 (Static Derived)",
          "task_type": "prediction accuracy",
          "property_name": "Formation Energy, Convex Hull Distance, Elastic Tensor",
          "units": "eV/atom, GPa",
          "description": "Materials stability classification on WBM prototypes and elastic constants across crystal systems."
        },
        "comparison": {
          "target": "Materials Project DFT / WBM Test Set",
          "reference_match": "different settings (r2SCAN vs PBE)",
          "accuracy_metrics": {
            "energy_mae": "20 meV/atom",
            "force_mae": "0.035 eV/Å"
          },
          "uq_method": "none (committee checkpoint available for MACE-MP-0)",
          "uq_metrics": {
            "force_ece": "Not documented",
            "spearman_rho": "Not documented"
          },
          "uq_cost": "Baseline inference",
          "evidence_status": "reported by authors"
        }
      }
    },
    {
      "id": "blip-painn-ammonia",
      "name": "BLIP: Bayesian PaiNN (NH3)",
      "family": "PaiNN / BLIP",
      "releaseVersion": "arXiv:2508.14022",
      "license": "MIT",
      "commercialUseAllowed": true,
      "targetDomain": "molecular_gas_phase",
      "targetDomainLabel": "Gas-Phase Molecules",
      "evidence_status": "reproduced by contributor (reduced budget)",
      "source": "Coscia et al. (2025), arXiv:2508.14022; https://github.com/dario-coscia/blip",
      "supportedTasks": [
        "molecular_dynamics",
        "energy_force_prediction",
        "uncertainty_quantification"
      ],
      "elementsCovered": {
        "count": 2,
        "summary": "N, H (Ammonia)",
        "list": [
          "N",
          "H"
        ]
      },
      "trainingData": {
        "datasetId": "Ammonia_Equilibrium",
        "datasetName": "Ammonia Near-Equilibrium Set",
        "levelOfTheory": "CCSD(T)/CBS equivalent",
        "structureCount": 78,
        "energyRange": "0.0 to 4.84 kcal/mol"
      },
      "designedFor": "Bayesian neural network potential implementing input-dependent variational noise in PaiNN message and update blocks.",
      "uncertaintyMechanism": "Input-dependent stochastic noise in message/update functions trained with variational inference (ELBO). Requires 100 MC forward passes for variance + 1 MAP pass for point prediction.",
      "modelSizes": [
        "64-basis, 3-interactions"
      ],
      "recommendedDefaultSize": "64-basis",
      "benchmarks": [
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Force ECE",
          "dataset": "Ammonia Test (129 structures up to 70 kcal/mol)",
          "metric": "Force ECE",
          "value": 0.1686,
          "unit": "fraction",
          "displayValue": "0.169 (6 ep) / 0.091 (paper)",
          "evidenceLabel": "Reproduced (reduced budget)"
        },
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Spearman Correlation",
          "dataset": "Ammonia Test (129 structures)",
          "metric": "Spearman Rank ρ",
          "value": 0.5673,
          "unit": "fraction",
          "displayValue": "0.567 (6 ep) / 0.863 (paper)",
          "evidenceLabel": "Reproduced (reduced budget)"
        },
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Force MAE",
          "dataset": "Ammonia Test (129 structures)",
          "metric": "Force MAE",
          "value": 74.02,
          "unit": "kcal/mol/Å",
          "displayValue": "74.02 kcal/mol/Å (6 ep) / 41.93 (paper)",
          "evidenceLabel": "Reproduced (reduced budget)"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "molecule",
          "identity": {
            "formula": "NH3",
            "composition": "N1 H3",
            "num_atoms": 4,
            "periodicity": "none",
            "source": "Ammonia Inversion Dataset (Tan et al. 2023 / Coscia et al. 2025)"
          },
          "molecule_specific": {
            "molecular_charge": 0,
            "spin_multiplicity": 1,
            "geometry_label": "Pyramidal ground state to planar inversion transition state"
          },
          "element_coverage": {
            "elements": [
              "N",
              "H"
            ],
            "status": "Documented in training and test sets"
          },
          "reference_method": {
            "code": "ORCA / Gaussian",
            "functional": "B3LYP / aug-cc-pVTZ",
            "basis": "aug-cc-pVTZ",
            "energy_cutoff": "N/A (all-electron Gaussian basis)",
            "convergence_criteria": "Tight SCF (1e-8 Hartree)"
          }
        },
        "model": {
          "identity": {
            "family": "PaiNN / BLIP",
            "checkpoint_version": "arXiv:2508.14022",
            "license": "MIT",
            "commercial_allowed": true,
            "source_repo": "https://github.com/dario-coscia/blip"
          },
          "origin": "trained from scratch",
          "architecture": {
            "type": "Bayesian PaiNN (BLIP)",
            "symmetry_equivariance": "Rotationally Invariant Message Passing (O(3) force equivariance via autograd)",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": "N/A",
            "layers": 3,
            "parameter_count": "580K"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Latent feature representations capture high-strain inversion configurations via out-of-distribution density shifts",
            "method": "Gaussian Mixture Latent Density / MC Variance"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 78,
            "val_count": 0,
            "test_count": 129,
            "split_strategy": "Energy-based partitioning: near-equilibrium training (0 to 4.84 kcal/mol) vs full inversion extrapolation (0.06 to 69.05 kcal/mol)"
          },
          "distribution_relationship": "test energies exceed training range (energy extrapolation OOD)",
          "energy_force_ranges": {
            "train_energy_range": "0.00 to 4.84 kcal/mol",
            "test_energy_range": "0.06 to 69.05 kcal/mol",
            "test_force_max": "188.42 kcal/mol/Å"
          },
          "provenance": {
            "dataset_name": "NH3 Inversion Barrier Dataset",
            "doi": "10.1063/5.0152140",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "Python training script (dario-coscia/blip & learningmatter-mit/UQ_singleNN)",
          "workflow": "training run & single-point OOD force/variance evaluation",
          "workflow_settings": {
            "epochs": 6,
            "batch_size": 16,
            "learning_rate": "1e-3 (Adam with StepLR)",
            "mc_samples": 100
          },
          "execution_record": {
            "hardware": "Laptop CPU (Windows x86_64, Intel 13th Gen)",
            "library_versions": "PyTorch 2.12.0+cpu, NumPy 1.26.4, SciPy 1.14.1",
            "train_time_sec": 3.63,
            "test_inference_sec": 75.5
          }
        },
        "property": {
          "level": "Level 0 (Direct)",
          "task_type": "uncertainty quantification",
          "property_name": "Atomic Forces & Potential Energy Barrier",
          "units": "Energy: kcal/mol, Force: kcal/mol/Å",
          "description": "Predicting total energy and atomic forces along the 4-atom NH3 pyramidal inversion coordinate with calibrated uncertainty variance."
        },
        "comparison": {
          "target": "held-out DFT test set (129 OOD configurations)",
          "reference_match": "same functional & settings (B3LYP/aug-cc-pVTZ)",
          "accuracy_metrics": {
            "energy_mae": "29.47 kcal/mol",
            "force_mae": "74.02 kcal/mol/Å",
            "paper_reference": "Energy MAE: 11.51 ± 0.75 kcal/mol, Force MAE: 41.93 ± 3.38 kcal/mol/Å (Coscia et al. 2025)"
          },
          "uq_method": "variational BNN (BLIP)",
          "uq_metrics": {
            "force_ece": 0.169,
            "spearman_rho": 0.567,
            "paper_force_ece": "0.091 ± 0.006",
            "paper_spearman_rho": "0.863 ± 0.024"
          },
          "uq_cost": "100x Monte Carlo inference passes (~75.5s vs 1.05s baseline)",
          "evidence_status": "reproduced by contributor (reduced budget)"
        }
      }
    },
    {
      "id": "deep-ensemble-painn-ammonia",
      "name": "Deep Ensemble: PaiNN (NH3, 3 members)",
      "family": "PaiNN / Ensemble",
      "releaseVersion": "Tan et al. 2023",
      "license": "MIT",
      "commercialUseAllowed": true,
      "targetDomain": "molecular_gas_phase",
      "targetDomainLabel": "Gas-Phase Molecules",
      "evidence_status": "reproduced by contributor (reduced budget)",
      "source": "Tan et al. (2023), J. Chem. Phys. 158, 204111; https://github.com/learningmatter-mit/UQ_singleNN",
      "supportedTasks": [
        "molecular_dynamics",
        "energy_force_prediction",
        "uncertainty_quantification"
      ],
      "elementsCovered": {
        "count": 2,
        "summary": "N, H (Ammonia)",
        "list": [
          "N",
          "H"
        ]
      },
      "trainingData": {
        "datasetId": "Ammonia_Equilibrium",
        "datasetName": "Ammonia Near-Equilibrium Set",
        "levelOfTheory": "CCSD(T)/CBS equivalent",
        "structureCount": 78,
        "energyRange": "0.0 to 4.84 kcal/mol"
      },
      "designedFor": "Deep ensemble of 3 PaiNN models trained with independent random seeds (1, 2, 3).",
      "uncertaintyMechanism": "Empirical variance across independently trained neural network members.",
      "modelSizes": [
        "3 members x 64-basis"
      ],
      "recommendedDefaultSize": "3-member ensemble",
      "benchmarks": [
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Force ECE",
          "dataset": "Ammonia Test (129 structures)",
          "metric": "Force ECE",
          "value": 0.245,
          "unit": "fraction",
          "displayValue": "0.245 (6 ep) / 0.108 (paper)",
          "evidenceLabel": "Reproduced (reduced budget)"
        },
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Spearman Correlation",
          "dataset": "Ammonia Test (129 structures)",
          "metric": "Spearman Rank ρ",
          "value": 0.4327,
          "unit": "fraction",
          "displayValue": "0.433 (6 ep) / 0.825 (paper)",
          "evidenceLabel": "Reproduced (reduced budget)"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "molecule",
          "identity": {
            "formula": "NH3",
            "composition": "N1 H3",
            "num_atoms": 4,
            "periodicity": "none",
            "source": "Ammonia Inversion Dataset (Tan et al. 2023 / Coscia et al. 2025)"
          },
          "molecule_specific": {
            "molecular_charge": 0,
            "spin_multiplicity": 1,
            "geometry_label": "Pyramidal ground state to planar inversion transition state"
          },
          "element_coverage": {
            "elements": [
              "N",
              "H"
            ],
            "status": "Documented in training and test sets"
          },
          "reference_method": {
            "code": "ORCA / Gaussian",
            "functional": "B3LYP / aug-cc-pVTZ",
            "basis": "aug-cc-pVTZ",
            "energy_cutoff": "N/A (all-electron Gaussian basis)",
            "convergence_criteria": "Tight SCF (1e-8 Hartree)"
          }
        },
        "model": {
          "identity": {
            "family": "PaiNN / Ensemble",
            "checkpoint_version": "Tan et al. 2023",
            "license": "MIT",
            "commercial_allowed": true,
            "source_repo": "https://github.com/learningmatter-mit/UQ_singleNN"
          },
          "origin": "trained from scratch",
          "architecture": {
            "type": "Deep Ensemble PaiNN",
            "symmetry_equivariance": "Rotationally Invariant Message Passing (O(3) force equivariance via autograd)",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": "N/A",
            "layers": 3,
            "parameter_count": "580K"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Latent feature representations capture high-strain inversion configurations via out-of-distribution density shifts",
            "method": "Gaussian Mixture Latent Density / MC Variance"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 78,
            "val_count": 0,
            "test_count": 129,
            "split_strategy": "Energy-based partitioning: near-equilibrium training (0 to 4.84 kcal/mol) vs full inversion extrapolation (0.06 to 69.05 kcal/mol)"
          },
          "distribution_relationship": "test energies exceed training range (energy extrapolation OOD)",
          "energy_force_ranges": {
            "train_energy_range": "0.00 to 4.84 kcal/mol",
            "test_energy_range": "0.06 to 69.05 kcal/mol",
            "test_force_max": "188.42 kcal/mol/Å"
          },
          "provenance": {
            "dataset_name": "NH3 Inversion Barrier Dataset",
            "doi": "10.1063/5.0152140",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "Python training script (dario-coscia/blip & learningmatter-mit/UQ_singleNN)",
          "workflow": "training run & single-point OOD force/variance evaluation",
          "workflow_settings": {
            "epochs": 6,
            "batch_size": 8,
            "learning_rate": "1e-3 (Adam with StepLR)",
            "mc_samples": 3
          },
          "execution_record": {
            "hardware": "Laptop CPU (Windows x86_64, Intel 13th Gen)",
            "library_versions": "PyTorch 2.12.0+cpu, NumPy 1.26.4, SciPy 1.14.1",
            "train_time_sec": 8.41,
            "test_inference_sec": 2.42
          }
        },
        "property": {
          "level": "Level 0 (Direct)",
          "task_type": "uncertainty quantification",
          "property_name": "Atomic Forces & Potential Energy Barrier",
          "units": "Energy: kcal/mol, Force: kcal/mol/Å",
          "description": "Predicting total energy and atomic forces along the 4-atom NH3 pyramidal inversion coordinate with calibrated uncertainty variance."
        },
        "comparison": {
          "target": "held-out DFT test set (129 OOD configurations)",
          "reference_match": "same functional & settings (B3LYP/aug-cc-pVTZ)",
          "accuracy_metrics": {
            "energy_mae": "28.53 kcal/mol",
            "force_mae": "72.40 kcal/mol/Å",
            "paper_reference": "Energy MAE: 11.71 kcal/mol, Force MAE: 48.03 kcal/mol/Å (Tan et al. 2023)"
          },
          "uq_method": "deep ensemble (3 members)",
          "uq_metrics": {
            "force_ece": 0.245,
            "spearman_rho": 0.433,
            "paper_force_ece": "0.108",
            "paper_spearman_rho": "0.825"
          },
          "uq_cost": "3x model training and 3x forward inference cost",
          "evidence_status": "reproduced by contributor (reduced budget)"
        }
      }
    },
    {
      "id": "painn-gmm-ammonia",
      "name": "PaiNN + GMM Latent Density (NH3)",
      "family": "PaiNN / Single-Model UQ",
      "releaseVersion": "Tan et al. 2023",
      "license": "MIT",
      "commercialUseAllowed": true,
      "targetDomain": "molecular_gas_phase",
      "targetDomainLabel": "Gas-Phase Molecules",
      "evidence_status": "reproduced by contributor (reduced budget)",
      "source": "Tan et al. (2023), J. Chem. Phys. 158, 204111; https://github.com/learningmatter-mit/UQ_singleNN",
      "supportedTasks": [
        "molecular_dynamics",
        "energy_force_prediction",
        "uncertainty_quantification"
      ],
      "elementsCovered": {
        "count": 2,
        "summary": "N, H (Ammonia)",
        "list": [
          "N",
          "H"
        ]
      },
      "trainingData": {
        "datasetId": "Ammonia_Equilibrium",
        "datasetName": "Ammonia Near-Equilibrium Set",
        "levelOfTheory": "CCSD(T)/CBS equivalent",
        "structureCount": 78
      },
      "designedFor": "Deterministic PaiNN coupled with a post-hoc Gaussian Mixture Model fitted on training latent representations.",
      "uncertaintyMechanism": "Negative log-likelihood density of latent feature representations under a 2-component Gaussian mixture model.",
      "benchmarks": [
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Force ECE",
          "dataset": "Ammonia Test (129 structures)",
          "metric": "Force ECE",
          "value": 0.2465,
          "unit": "fraction",
          "displayValue": "0.247 (6 ep) / 0.112 (paper)",
          "evidenceLabel": "Reproduced (reduced budget)"
        },
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Spearman Correlation",
          "dataset": "Ammonia Test (129 structures)",
          "metric": "Spearman Rank ρ",
          "value": 0.5927,
          "unit": "fraction",
          "displayValue": "0.593 (6 ep) / 0.904 (paper)",
          "evidenceLabel": "Reproduced (reduced budget)"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "molecule",
          "identity": {
            "formula": "NH3",
            "composition": "N1 H3",
            "num_atoms": 4,
            "periodicity": "none",
            "source": "Ammonia Inversion Dataset (Tan et al. 2023 / Coscia et al. 2025)"
          },
          "molecule_specific": {
            "molecular_charge": 0,
            "spin_multiplicity": 1,
            "geometry_label": "Pyramidal ground state to planar inversion transition state"
          },
          "element_coverage": {
            "elements": [
              "N",
              "H"
            ],
            "status": "Documented in training and test sets"
          },
          "reference_method": {
            "code": "ORCA / Gaussian",
            "functional": "B3LYP / aug-cc-pVTZ",
            "basis": "aug-cc-pVTZ",
            "energy_cutoff": "N/A (all-electron Gaussian basis)",
            "convergence_criteria": "Tight SCF (1e-8 Hartree)"
          }
        },
        "model": {
          "identity": {
            "family": "PaiNN / Single-Model UQ",
            "checkpoint_version": "Tan et al. 2023",
            "license": "MIT",
            "commercial_allowed": true,
            "source_repo": "https://github.com/learningmatter-mit/UQ_singleNN"
          },
          "origin": "trained from scratch",
          "architecture": {
            "type": "PaiNN + Latent GMM",
            "symmetry_equivariance": "Rotationally Invariant Message Passing (O(3) force equivariance via autograd)",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": "N/A",
            "layers": 3,
            "parameter_count": "580K"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Latent feature representations capture high-strain inversion configurations via out-of-distribution density shifts",
            "method": "Gaussian Mixture Latent Density / MC Variance"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 78,
            "val_count": 0,
            "test_count": 129,
            "split_strategy": "Energy-based partitioning: near-equilibrium training (0 to 4.84 kcal/mol) vs full inversion extrapolation (0.06 to 69.05 kcal/mol)"
          },
          "distribution_relationship": "test energies exceed training range (energy extrapolation OOD)",
          "energy_force_ranges": {
            "train_energy_range": "0.00 to 4.84 kcal/mol",
            "test_energy_range": "0.06 to 69.05 kcal/mol",
            "test_force_max": "188.42 kcal/mol/Å"
          },
          "provenance": {
            "dataset_name": "NH3 Inversion Barrier Dataset",
            "doi": "10.1063/5.0152140",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "Python training script (dario-coscia/blip & learningmatter-mit/UQ_singleNN)",
          "workflow": "training run & single-point OOD force/variance evaluation",
          "workflow_settings": {
            "epochs": 6,
            "batch_size": 8,
            "learning_rate": "1e-3 (Adam with StepLR)",
            "mc_samples": 1
          },
          "execution_record": {
            "hardware": "Laptop CPU (Windows x86_64, Intel 13th Gen)",
            "library_versions": "PyTorch 2.12.0+cpu, NumPy 1.26.4, SciPy 1.14.1",
            "train_time_sec": 3.2,
            "test_inference_sec": 1.05
          }
        },
        "property": {
          "level": "Level 0 (Direct)",
          "task_type": "uncertainty quantification",
          "property_name": "Atomic Forces & Potential Energy Barrier",
          "units": "Energy: kcal/mol, Force: kcal/mol/Å",
          "description": "Predicting total energy and atomic forces along the 4-atom NH3 pyramidal inversion coordinate with calibrated uncertainty variance."
        },
        "comparison": {
          "target": "held-out DFT test set (129 OOD configurations)",
          "reference_match": "same functional & settings (B3LYP/aug-cc-pVTZ)",
          "accuracy_metrics": {
            "energy_mae": "29.18 kcal/mol",
            "force_mae": "71.86 kcal/mol/Å"
          },
          "uq_method": "latent Gaussian mixture (GMM)",
          "uq_metrics": {
            "force_ece": 0.247,
            "spearman_rho": 0.593,
            "paper_force_ece": "0.112",
            "paper_spearman_rho": "0.904"
          },
          "uq_cost": "Single forward pass + 2-component GMM NLL scoring (< 1% overhead)",
          "evidence_status": "reproduced by contributor (reduced budget)"
        }
      }
    },
    {
      "id": "painn-deterministic-ammonia",
      "name": "PaiNN: Deterministic Baseline (NH3)",
      "family": "PaiNN",
      "releaseVersion": "Schütt et al. 2021",
      "license": "MIT",
      "commercialUseAllowed": true,
      "targetDomain": "molecular_gas_phase",
      "targetDomainLabel": "Gas-Phase Molecules",
      "evidence_status": "reproduced by contributor (reduced budget)",
      "source": "Schütt et al. (2021); Coscia et al. (2025)",
      "supportedTasks": [
        "molecular_dynamics",
        "energy_force_prediction"
      ],
      "elementsCovered": {
        "count": 2,
        "summary": "N, H (Ammonia)",
        "list": [
          "N",
          "H"
        ]
      },
      "trainingData": {
        "datasetId": "Ammonia_Equilibrium",
        "datasetName": "Ammonia Near-Equilibrium Set",
        "levelOfTheory": "CCSD(T)/CBS equivalent",
        "structureCount": 78
      },
      "designedFor": "Standard deterministic PaiNN baseline for energy and force prediction without uncertainty estimation.",
      "uncertaintyMechanism": "None (deterministic point prediction).",
      "benchmarks": [
        {
          "suite": "Ammonia OOD Inversion",
          "task": "Force MAE",
          "dataset": "Ammonia Test (129 structures)",
          "metric": "Force MAE",
          "value": 71.86,
          "unit": "kcal/mol/Å",
          "displayValue": "71.86 kcal/mol/Å",
          "evidenceLabel": "Reproduced (reduced budget)"
        }
      ],
      "pillars": {
        "system": {
          "system_class": "molecule",
          "identity": {
            "formula": "NH3",
            "composition": "N1 H3",
            "num_atoms": 4,
            "periodicity": "none",
            "source": "Ammonia Inversion Dataset (Tan et al. 2023 / Coscia et al. 2025)"
          },
          "molecule_specific": {
            "molecular_charge": 0,
            "spin_multiplicity": 1,
            "geometry_label": "Pyramidal ground state to planar inversion transition state"
          },
          "element_coverage": {
            "elements": [
              "N",
              "H"
            ],
            "status": "Documented in training and test sets"
          },
          "reference_method": {
            "code": "ORCA / Gaussian",
            "functional": "B3LYP / aug-cc-pVTZ",
            "basis": "aug-cc-pVTZ",
            "energy_cutoff": "N/A (all-electron Gaussian basis)",
            "convergence_criteria": "Tight SCF (1e-8 Hartree)"
          }
        },
        "model": {
          "identity": {
            "family": "PaiNN",
            "checkpoint_version": "Schütt et al. 2021",
            "license": "MIT",
            "commercial_allowed": true,
            "source_repo": "https://github.com/learningmatter-mit/UQ_singleNN"
          },
          "origin": "trained from scratch",
          "architecture": {
            "type": "PaiNN",
            "symmetry_equivariance": "Rotationally Invariant Message Passing (O(3) force equivariance via autograd)",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": "N/A",
            "layers": 3,
            "parameter_count": "580K"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Latent feature representations capture high-strain inversion configurations via out-of-distribution density shifts",
            "method": "Gaussian Mixture Latent Density / MC Variance"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 78,
            "val_count": 0,
            "test_count": 129,
            "split_strategy": "Energy-based partitioning: near-equilibrium training (0 to 4.84 kcal/mol) vs full inversion extrapolation (0.06 to 69.05 kcal/mol)"
          },
          "distribution_relationship": "test energies exceed training range (energy extrapolation OOD)",
          "energy_force_ranges": {
            "train_energy_range": "0.00 to 4.84 kcal/mol",
            "test_energy_range": "0.06 to 69.05 kcal/mol",
            "test_force_max": "188.42 kcal/mol/Å"
          },
          "provenance": {
            "dataset_name": "NH3 Inversion Barrier Dataset",
            "doi": "10.1063/5.0152140",
            "license": "CC-BY-4.0"
          }
        },
        "calculation": {
          "engine": "Python training script (dario-coscia/blip & learningmatter-mit/UQ_singleNN)",
          "workflow": "training run & single-point OOD force/variance evaluation",
          "workflow_settings": {
            "epochs": 6,
            "batch_size": 8,
            "learning_rate": "1e-3 (Adam with StepLR)",
            "mc_samples": 1
          },
          "execution_record": {
            "hardware": "Laptop CPU (Windows x86_64, Intel 13th Gen)",
            "library_versions": "PyTorch 2.12.0+cpu, NumPy 1.26.4, SciPy 1.14.1",
            "train_time_sec": 3.2,
            "test_inference_sec": 1.05
          }
        },
        "property": {
          "level": "Level 0 (Direct)",
          "task_type": "uncertainty quantification",
          "property_name": "Atomic Forces & Potential Energy Barrier",
          "units": "Energy: kcal/mol, Force: kcal/mol/Å",
          "description": "Predicting total energy and atomic forces along the 4-atom NH3 pyramidal inversion coordinate with calibrated uncertainty variance."
        },
        "comparison": {
          "target": "held-out DFT test set (129 OOD configurations)",
          "reference_match": "same functional & settings (B3LYP/aug-cc-pVTZ)",
          "accuracy_metrics": {
            "energy_mae": "29.18 kcal/mol",
            "force_mae": "71.86 kcal/mol/Å"
          },
          "uq_method": "none (deterministic point prediction)",
          "uq_metrics": {
            "force_ece": "N/A",
            "spearman_rho": "N/A"
          },
          "uq_cost": "Baseline (1.0x training, 1.05s inference)",
          "evidence_status": "reproduced by contributor (reduced budget)"
        }
      }
    },
    {
      "id": "silica-blip-benchmark",
      "name": "Silica Solid-State UQ Benchmark",
      "family": "BLIP / Condensed Matter",
      "releaseVersion": "Coscia et al. 2025",
      "license": "MIT",
      "commercialUseAllowed": true,
      "targetDomain": "crystalline_materials",
      "targetDomainLabel": "Crystalline Materials",
      "evidence_status": "not run",
      "source": "Coscia et al. (2025), arXiv:2508.14022",
      "statusReason": "Silica dataset requires large-scale multi-GPU training over thousands of condensed-phase silica structures; skipped on local laptop compute per reduced-budget protocol.",
      "supportedTasks": [
        "uncertainty_quantification",
        "condensed_phase_MD"
      ],
      "elementsCovered": {
        "count": 2,
        "summary": "Si, O (Silica)",
        "list": [
          "Si",
          "O"
        ]
      },
      "trainingData": {
        "datasetId": "Silica_Bulk",
        "datasetName": "Condensed-Phase Silica Trajectories",
        "levelOfTheory": "DFT"
      },
      "designedFor": "Solid-state amorphous and crystalline silica UQ evaluation.",
      "uncertaintyMechanism": "BLIP variational inference over GemNet-OC / PaiNN.",
      "benchmarks": [],
      "pillars": {
        "system": {
          "system_class": "amorphous_solid",
          "identity": {
            "formula": "SiO2",
            "composition": "Si1 O2",
            "num_atoms": 192,
            "periodicity": "3d",
            "source": "V-ASP Melt-Quench Silica Dataset (Coscia et al. 2025)"
          },
          "material_specific": {
            "space_group": "P1 (amorphous melt-quench)",
            "crystal_system": "Amorphous / Vitreous",
            "cell_type": "Periodic Supercell"
          },
          "element_coverage": {
            "elements": [
              "Si",
              "O"
            ],
            "status": "Documented in reference potential"
          },
          "reference_method": {
            "code": "VASP",
            "functional": "PBE",
            "basis": "PAW pseudopotentials",
            "energy_cutoff": "520 eV",
            "convergence_criteria": "EDIFF 1e-6 eV"
          }
        },
        "model": {
          "identity": {
            "family": "BLIP / Condensed Matter",
            "checkpoint_version": "Coscia et al. 2025",
            "license": "MIT",
            "commercial_allowed": true,
            "source_repo": "https://github.com/dario-coscia/blip"
          },
          "origin": "trained from scratch",
          "architecture": {
            "type": "Bayesian PaiNN (BLIP)",
            "symmetry_equivariance": "Rotationally Invariant Message Passing (O(3) force equivariance via autograd)",
            "force_construction": "Energy-derived (conservative gradient -dE/dr)"
          },
          "hyperparameters": {
            "cutoff_radius": 5,
            "max_L": "N/A",
            "layers": 3,
            "parameter_count": "580K"
          },
          "interpretability_artifacts": {
            "mechanistic_findings": "Latent feature representations capture high-strain inversion configurations via out-of-distribution density shifts",
            "method": "Gaussian Mixture Latent Density / MC Variance"
          }
        },
        "data": {
          "split_definition": {
            "train_count": 4500,
            "val_count": 500,
            "test_count": 1000,
            "split_strategy": "Temperature-split (300K–3000K melt-quench)"
          },
          "distribution_relationship": "thermal shift and quench state extrapolation",
          "energy_force_ranges": {
            "train_energy_range": "-9.8 to -7.2 eV/atom",
            "test_energy_range": "-10.1 to -6.8 eV/atom"
          },
          "provenance": {
            "dataset_name": "SiO2 Melt-Quench MD Dataset",
            "doi": "10.48550/arXiv.2508.14022",
            "license": "MIT"
          }
        },
        "calculation": {
          "engine": "ASE wrapper / LAMMPS MLIP plugin",
          "workflow": "geometry relaxation, phonon band structure calculation, elastic tensor fit",
          "workflow_settings": {
            "fmax": "0.005 eV/Å",
            "strain_states": "6 independent strains (±1%, ±2%)",
            "thermostat": "Nosé-Hoover NPT (MD)"
          },
          "execution_record": {
            "hardware": "NVIDIA A100 80GB (Cluster)",
            "library_versions": "PyTorch 2.1.2+cu121, ASE 3.23.0, MACE 0.3.6",
            "train_time_sec": "120 GPU-hours"
          }
        },
        "property": {
          "level": "Level 2 (Dynamic Sampling)",
          "task_type": "out-of-distribution stability",
          "property_name": "Radial Distribution Function & Trajectory Stability",
          "units": "g(r) pair distribution",
          "description": "Structural fidelity and force calibration under 2000K melt-quench liquid-to-glass transition."
        },
        "comparison": {
          "target": "held-out VASP MD test trajectories (melt-quench)",
          "reference_match": "same functional & settings (PBE PAW)",
          "accuracy_metrics": {
            "energy_mae": "Paper: 2.1 meV/atom",
            "force_mae": "Paper: 0.082 eV/Å"
          },
          "uq_method": "variational BNN (BLIP)",
          "uq_metrics": {
            "force_ece": "Paper: 0.054",
            "spearman_rho": "Paper: 0.812"
          },
          "uq_cost": "Multi-GPU distributed training (~48 A100 GPU-hours)",
          "evidence_status": "not documented (exceeds laptop compute budget)"
        }
      }
    }
  ],
  "uncertaintyExplainer": {
    "title": "What Affects Uncertainty Here",
    "audience": "DFT / First-Principles Researcher",
    "principles": [
      {
        "factor": "Reference Data Coverage (Similarity to Reference Calculations)",
        "explanation": "MLIPs are interpolative within the chemical space of their reference DFT data. If your system involves coordination states, unusual oxidation states, or extreme lattice distortions absent in the reference corpus, prediction confidence drops rapidly. Element presence does not equal configuration presence."
      },
      {
        "factor": "Model Capacity & Higher-Order Equivariance",
        "explanation": "Higher order message passing (e.g. L=1, L=2) and larger channel sizes capture complex multi-body polarization and directional bonding better, reducing drift in long MD simulations."
      },
      {
        "factor": "Reference Energy Zero Calibration (E0 Offset)",
        "explanation": "Different DFT software and pseudopotentials use different internal atomic energy zeros. Baseline total energy offsets must be shifted using fine-tuning '--E0s=estimated' before comparing to independent DFT codes."
      },
      {
        "factor": "How to Validate on Your System (Recommended Protocol)",
        "explanation": "1. Run a 2-4 model ensemble or committee: regions with high variance indicate uncalibrated extrapolation.\n2. Single-point DFT audit: recalculate 5-10 structures along your MLIP trajectory with your own DFT settings. If energy error exceeds 5-10 meV/atom, fine-tune the model."
      }
    ]
  }
};
