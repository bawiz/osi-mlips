"""Generate reproducible, explicitly synthetic records using the actual extractor schema."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from mliphub.schema import MetadataValue, new_record  # noqa: E402

SOURCE = "Synthetic demonstration fixture; no model was trained or evaluated"
PROFILES = [
    ("bulk-equi", "Demo Bulk Equivariant", "mace", "bulk", [["Cu"], ["Al"], ["Fe"], ["Si", "O"]], ["single_point", "md", "relaxation", "phonons"], 8192, False),
    ("bulk-fast", "Demo Bulk CPU", "mtp", "bulk", [["Cu"], ["Al"], ["Fe"], ["Ni"]], ["single_point", "md", "relaxation", "elastic"], 32768, True),
    ("oxide", "Demo Oxide", "chgnet", "bulk", [["Li", "Fe", "P", "O"], ["Si", "O"], ["Fe", "O"], ["Ni", "O"]], ["single_point", "md", "relaxation", "elastic"], 4096, False),
    ("molecule", "Demo Molecular Equivariant", "nequip", "molecule", [["C", "H"], ["C", "H", "O"], ["N", "H"], ["H", "O"]], ["single_point", "md", "relaxation", "vibrations"], 256, False),
    ("organic", "Demo Organic", "mace", "molecule", [["C", "H"], ["C", "H", "N"], ["C", "H", "O"], ["N", "H"]], ["single_point", "md", "relaxation", "vibrations"], 512, False),
    ("surface", "Demo Surface", "allegro", "surface", [["Cu", "O"], ["Pt", "H"], ["Ni", "C", "H"], ["Fe", "O"]], ["single_point", "md", "relaxation", "adsorption"], 4096, False),
    ("silicon", "Demo Silicon CPU", "mtp", "bulk", [["Si"], ["Si", "Ge"], ["Ge"], ["C"]], ["single_point", "md", "relaxation", "phonons"], 65536, True),
    ("water", "Demo Aqueous", "nequip", "liquid", [["H", "O"], ["Na", "Cl", "H", "O"], ["C", "H", "O"], ["K", "Cl", "H", "O"]], ["single_point", "md", "relaxation", "diffusion"], 2048, False),
]


def generate():
    records = []
    for profile_index, (slug, name, architecture, domain, systems, tasks, large_size, cpu) in enumerate(PROFILES):
        model_id = "demo-" + slug
        supported = sorted({element for system in systems for element in system})
        for index in range(40):
            training = index < 8
            offset = index if training else index - 8
            species = systems[offset % 4]
            task = "training" if training else tasks[(offset // 4) % 4]
            replica = index % 2 if training else offset // 16
            atoms = 64 if replica == 0 else large_size
            temperature = 300 if replica == 0 else 600
            device = "cpu" if cpu or replica == 0 else "cuda"
            record = new_record()
            record.run_id = str(uuid5(NAMESPACE_URL, f"ubh-synthetic-v1/{model_id}/{index}"))
            record.created_at = (datetime(2026, 1, 1, tzinfo=timezone.utc) + timedelta(hours=profile_index * 40 + index)).isoformat()

            def put(section, key, value, unit=None):
                getattr(record, section)[key] = MetadataValue(value=value, status="user_provided", source=SOURCE, unit=unit)

            put("model", "id", model_id)
            put("model", "name", name)
            put("model", "architecture_id", architecture)
            put("model", "framework", architecture.upper())
            put("model", "supported_elements", supported)
            put("model", "cutoff_radius", 5.0 + profile_index % 3, "angstrom")
            put("model", "parameter_count", 500000 + profile_index * 125000)
            put("training", "datasets", [{"id": f"demo-training-{slug}", "synthetic": True, "configurations": 1200 + profile_index * 200}])
            put("training", "reference_method", {"code": "DEMO-REFERENCE", "functional": "PBE", "synthetic": True})
            put("training", "epochs", 100 + profile_index * 20)
            put("training", "optimizer", "Adam")
            put("training", "hyperparameters", {"learning_rate": 0.001, "batch_size": 8, "seed": profile_index})
            put("system", "final.elements", species)
            put("system", "final.number_of_atoms", atoms)
            put("system", "class", domain)
            put("system", "final.pbc", [domain != "molecule", domain != "molecule", domain not in ("molecule", "surface")])
            put("simulation", "type", task)
            if not training:
                put("simulation", "temperature_K", temperature, "K")
                if task in ("md", "diffusion"):
                    put("simulation", "timestep_fs", 0.5, "fs")
                    put("simulation", "steps", 1000 + index * 100)
                    put("simulation", "ensemble", "NVT")
            put("environment", "model_device", device)
            put("environment", "hardware_id", "demo-cpu-01" if device == "cpu" else "demo-gpu-01")
            put("environment", "model_dtype", "float64")
            outcome = "synthetic_example" if training else "failed" if index == 38 else "interrupted" if index == 39 else "completed"
            put("results", "status", outcome)
            put("results", "scope_wall_time", round((profile_index + 1) * (index + 1) * 0.17, 3), "s")
            if not training and outcome == "completed":
                put("results", "energy", round(-0.1 * atoms - profile_index * 0.03, 4), "eV")
                put("reliability", "reference_comparison", {
                    "synthetic": True,
                    "benchmark_id": f"demo-{'-'.join(sorted(species))}-{task}-n{atoms}-t{temperature}-v1",
                    "reference_id": "demo-reference-PBE",
                    "force_mae": round(0.015 + profile_index * 0.003 + replica * 0.002, 4),
                    "force_unit": "eV/angstrom",
                    "energy_mae_per_atom": round(0.002 + profile_index * 0.0005, 4),
                    "energy_unit": "eV/atom",
                })
            if outcome in ("failed", "interrupted"):
                put("results", "exception_type", "SyntheticFailure" if outcome == "failed" else "SyntheticInterruption")
            put("provenance", "synthetic", True)
            put("provenance", "evidence_status", "synthetic_demo")
            put("provenance", "record_kind", "training" if training else "usage")
            put("provenance", "collector", "ubh synthetic library generator v1")
            put("provenance", "disclaimer", "Fictional checkpoint, systems and numbers. Not evidence about any real MLIP or architecture.")
            record.warnings.append(SOURCE)
            payload = record.model_dump(mode="json")
            # Exercise the production model again, including extended fields.
            type(record).model_validate(payload)
            records.append(payload)
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    records = generate()
    aggregate = ROOT / "app/data/demo-records.json"
    directory = ROOT / "examples/synthetic-library/records"
    files = {aggregate: json.dumps(records, separators=(",", ":"), ensure_ascii=False) + "\n"}
    for record in records:
        files[directory / (record["run_id"] + ".json")] = json.dumps(record, indent=2) + "\n"
    if args.check:
        bad = [str(path.relative_to(ROOT)) for path, content in files.items() if not path.exists() or path.read_text() != content]
        if bad:
            raise SystemExit("Regenerate demo data: " + ", ".join(bad[:5]))
        print(f"Verified {len(records)} synthetic extractor records")
    else:
        for path, content in files.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        digest = hashlib.sha256(files[aggregate].encode()).hexdigest()
        print(f"Generated {len(records)} records; aggregate SHA-256 {digest}")


if __name__ == "__main__":
    main()
