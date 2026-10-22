from types import SimpleNamespace

import mliphub.environment as environment
from mliphub.schema import new_record


def test_environment_uses_installed_metadata_without_importing_ml_frameworks(monkeypatch):
    monkeypatch.setattr(environment.shutil, "which", lambda _: None)
    record = new_record()
    environment.capture_environment(record)
    assert record.environment["python_version"].status == "extracted"
    assert record.environment["logical_cpu_count"].value > 0
    assert record.environment["gpu_devices"].status == "unavailable"
    assert "host" not in record.environment


def test_optional_gpu_inventory(monkeypatch):
    monkeypatch.setattr(environment.shutil, "which", lambda _: "/usr/bin/nvidia-smi")
    monkeypatch.setattr(environment.subprocess, "run", lambda *a, **kw: SimpleNamespace(stdout="Test GPU, 1024, 555.1\n"))
    record = new_record()
    environment.capture_environment(record)
    assert record.environment["gpu_devices"].value == [{"name": "Test GPU", "total_memory_MiB": 1024, "driver_version": "555.1"}]


def test_gpu_inventory_failure_is_nonfatal(monkeypatch):
    monkeypatch.setattr(environment.shutil, "which", lambda _: "/usr/bin/nvidia-smi")

    def failing(*a, **kw):
        raise environment.subprocess.TimeoutExpired("nvidia-smi", 2)

    monkeypatch.setattr(environment.subprocess, "run", failing)
    record = new_record()
    environment.capture_environment(record)
    assert record.environment["gpu_devices"].status == "unavailable"
