"""Small local environment snapshot, without importing ML frameworks or collecting secrets."""
from __future__ import annotations

import os
import platform
import csv
import io
import shutil
import subprocess
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

from .schema import Record, missing
from .values import put


def capture_environment(record: Record) -> None:
    source = "collector process"
    cpu_model = platform.processor()
    if not cpu_model:
        try:
            for line in Path("/proc/cpuinfo").read_text().splitlines():
                if line.startswith("model name"):
                    cpu_model = line.split(":", 1)[1].strip()
                    break
        except OSError:
            pass
    for key, value in {
        "python_version": platform.python_version(), "operating_system": platform.system(),
        "os_release": platform.release(), "machine": platform.machine(),
        "cpu_model": cpu_model or None, "logical_cpu_count": os.cpu_count(),
    }.items():
        put(record, "environment", key, value, source)
    try:
        put(record, "environment", "total_host_memory", os.sysconf("SC_PAGE_SIZE") * os.sysconf("SC_PHYS_PAGES"),
            "os.sysconf; host memory, not scheduler/container allocation", "byte")
    except (AttributeError, OSError, ValueError):
        pass
    versions = {}
    for name in ("mliphub", "ase", "numpy", "torch", "mace-torch", "nequip", "chgnet"):
        try:
            versions[name] = version(name)
        except PackageNotFoundError:
            continue
    put(record, "environment", "package_versions", versions, "importlib.metadata; installed distributions")
    record.environment["gpu_devices"] = missing("No GPU inventory provider available; model device may still be recorded", "nvidia-smi (optional)")
    executable = shutil.which("nvidia-smi")
    if executable:
        try:
            result = subprocess.run(
                [executable, "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader,nounits"],
                capture_output=True, text=True, check=True, timeout=2,
            )
            devices = [{"name": row[0].strip(), "total_memory_MiB": int(row[1]), "driver_version": row[2].strip()}
                       for row in csv.reader(io.StringIO(result.stdout)) if len(row) == 3]
            put(record, "environment", "gpu_devices", devices, "nvidia-smi; host inventory, not proof of model device use")
        except (OSError, ValueError, subprocess.SubprocessError) as error:
            record.environment["gpu_devices"] = missing(f"GPU inventory unavailable: {type(error).__name__}", "nvidia-smi")
