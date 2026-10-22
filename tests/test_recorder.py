import pytest

from mliphub import Record, record


def test_recording_preserves_predictions_cache_and_method(atoms):
    calculator = atoms.calc
    original = calculator.calculate
    expected = atoms.energy()
    with record(atoms, run_type="single_point", include_environment=False) as recorder:
        assert atoms.energy() == expected  # ASE-style cache hit, no evaluation.
        atoms.positions[0, 0] += 0.1
        assert atoms.energy() == pytest.approx(expected + 0.01)
        assert atoms.energy() == pytest.approx(expected + 0.01)
    assert recorder.record.results["calculate_calls"].value == 1
    assert recorder.record.results["status"].value == "completed"
    assert calculator.calculate == original
    assert "calculate" not in calculator.__dict__
    assert atoms.calc is calculator


@pytest.mark.parametrize("exception,status", [(RuntimeError, "failed"), (KeyboardInterrupt, "interrupted")])
def test_failed_run_saved_and_exception_preserved(atoms, tmp_path, exception, status):
    output = tmp_path / "failed.json"
    original = atoms.calc.calculate
    with pytest.raises(exception):
        with record(atoms, output=output, include_environment=False):
            atoms.energy()
            raise exception("simulation interrupted")
    saved = Record.load(output)
    assert saved.results["status"].value == status
    assert "energy" not in saved.results
    assert atoms.calc.calculate == original


def test_failed_calculator_is_counted_even_if_user_catches_error(atoms):
    original = atoms.calc.calculate

    def failing(*args, **kwargs):
        raise ArithmeticError("model error")

    atoms.calc.calculate = failing
    with record(atoms, include_environment=False) as recorder:
        with pytest.raises(ArithmeticError):
            atoms.energy()
    assert recorder.record.results["status"].value == "failed"
    assert recorder.record.results["failed_calculate_calls"].value == 1
    assert atoms.calc.calculate is failing
    atoms.calc.calculate = original


def test_nested_recorders_rejected_without_breaking_outer(atoms):
    with record(atoms, include_environment=False) as outer:
        with pytest.raises(RuntimeError, match="already"):
            with record(atoms, include_environment=False):
                pass
        atoms.energy()
    assert outer.record.results["calculate_calls"].value == 1


def test_save_only_after_exit_and_single_use(atoms, tmp_path):
    recorder = record(atoms, include_environment=False)
    with pytest.raises(RuntimeError):
        recorder.save(tmp_path / "early.json")
    with recorder:
        with pytest.raises(RuntimeError):
            recorder.save(tmp_path / "active.json")
    with pytest.raises(RuntimeError, match="only once"):
        with recorder:
            pass
    recorder.save(tmp_path / "finished.json")


def test_unattached_calculator_restored_and_changed_attachment_detected(atoms):
    calc = atoms.calc
    atoms.calc = None
    with record(atoms, calc, include_environment=False) as recorder:
        atoms.energy()
        atoms.calc = None
    assert atoms.calc is None
    assert "energy" not in recorder.record.results
    assert any("attachment changed" in warning for warning in recorder.record.warnings)


def test_configuration_error_leaves_calculator_untouched(atoms):
    original = atoms.calc.calculate
    with pytest.raises(ValueError):
        with record(atoms, metadata={"typo": {}}, include_environment=False):
            pass
    assert atoms.calc.calculate == original
