"""Command line operations write local files and never execute checkpoint contents."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import __version__
from .extraction import extract_trajectory, inspect_model, read_metadata
from .schema import Record
from .collect import DEFAULT_OUTPUT


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="mliphub", description="Collect local MLIP metadata and provenance")
    root.add_argument("--version", action="version", version=__version__)
    commands = root.add_subparsers(dest="command", required=True)
    inspect = commands.add_parser("inspect", help="Fingerprint a model artifact (does not deserialize it)")
    inspect.add_argument("model", type=Path)
    inspect.add_argument("--framework", help="User-declared framework; no inference from the filename")
    inspect.add_argument("--metadata", type=Path, help="JSON mapping of section names to user-provided fields")
    inspect.add_argument("-o", "--output", type=Path, required=True)
    extract = commands.add_parser("extract", help="Recover metadata and cached predictions from an ASE-readable trajectory")
    extract.add_argument("trajectory", type=Path)
    extract.add_argument("--model", type=Path, action="append", default=[])
    extract.add_argument("--format", help="Explicit ASE reader format")
    extract.add_argument("--metadata", type=Path)
    extract.add_argument("-o", "--output", type=Path, default=Path(DEFAULT_OUTPUT))
    validate = commands.add_parser("validate", help="Validate an exported metadata record")
    validate.add_argument("record", type=Path)
    schema = commands.add_parser("schema", help="Export JSON Schema")
    schema.add_argument("-o", "--output", type=Path)
    commands.add_parser("adapters", help="List built-in and explicitly registered adapters")
    demo = commands.add_parser("demo", help="Run a short offline ASE/EMT demonstration (EMT is not an MLIP)")
    demo.add_argument("--output-dir", type=Path, default=Path("demo-output"))
    return root


def main(argv=None) -> int:
    args = parser().parse_args(argv)
    try:
        if args.command == "inspect":
            record = inspect_model(args.model, framework=args.framework, metadata=read_metadata(args.metadata))
            inputs = [args.model] + ([args.metadata] if args.metadata else [])
            if args.output.resolve() in {path.resolve() for path in inputs}:
                raise ValueError("Output must not overwrite an input file")
            record.save(args.output)
            print(f"Saved {args.output}")
        elif args.command == "extract":
            inputs = [args.trajectory, *args.model] + ([args.metadata] if args.metadata else [])
            if args.output.resolve() in {p.resolve() for p in inputs}:
                raise ValueError("Output must not overwrite an input artifact")
            extract_trajectory(args.trajectory, model_paths=args.model, format=args.format,
                               metadata=read_metadata(args.metadata)).save(args.output)
            print(f"Saved {args.output}")
        elif args.command == "validate":
            record = Record.load(args.record)
            print(f"Valid schema {record.schema_version}; run {record.run_id}")
        elif args.command == "schema":
            payload = json.dumps(Record.model_json_schema(), indent=2) + "\n"
            if args.output is None:
                print(payload, end="")
            else:
                args.output.parent.mkdir(parents=True, exist_ok=True)
                args.output.write_text(payload, encoding="utf-8")
                print(f"Saved {args.output}")
        elif args.command == "adapters":
            from .adapters import names
            print("generic_ase (fallback)")
            print("\n".join(names()))
        elif args.command == "demo":
            from .demo import run_demo
            print(f"Saved demo files in {run_demo(args.output_dir)} (classical EMT demonstration)")
    except (OSError, ValueError, ImportError, RuntimeError) as error:
        print(f"mliphub: {error}", file=sys.stderr)
        return 1
    return 0
