"""Run against a local model; no model weights are downloaded by MLIPHub."""
import argparse

from ase.io import read
from mace.calculators import MACECalculator
from mliphub import extract

parser = argparse.ArgumentParser()
parser.add_argument("structure")
parser.add_argument("model")
parser.add_argument("--device", default="cpu")
parser.add_argument("--output", default="mace-metadata.json")
args = parser.parse_args()

atoms = read(args.structure)
atoms.calc = MACECalculator(model_paths=args.model, device=args.device)
print("Energy (eV):", atoms.get_potential_energy())
atoms.get_forces()
extract(atoms, output=args.output)
