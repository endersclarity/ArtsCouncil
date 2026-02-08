import importlib.util
from pathlib import Path
import unittest
from unittest import mock


def load_fetch_hours_module():
    script_path = Path("scripts/fetch-hours.py")
    spec = importlib.util.spec_from_file_location("fetch_hours_module", script_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class FetchHoursResumeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mod = load_fetch_hours_module()

    def test_is_processed_requires_both_keys(self):
        self.assertFalse(self.mod.is_processed({}))
        self.assertFalse(self.mod.is_processed({"pid": "abc"}))
        self.assertFalse(self.mod.is_processed({"h": ["Mon: 9-5"]}))
        self.assertTrue(self.mod.is_processed({"pid": None, "h": None}))
        self.assertTrue(self.mod.is_processed({"pid": "abc", "h": ["Mon: 9-5"]}))

    def test_resume_mode_skips_processed_entries(self):
        venues = [
            {"n": "Processed", "pid": "already", "h": ["Monday: Closed"]},
            {"n": "Needs Processing"},
        ]

        def fake_process_venue(venue):
            venue["pid"] = "new_pid"
            venue["h"] = ["Tuesday: 9:00 AM – 5:00 PM"]
            return venue

        with mock.patch.object(self.mod, "process_venue", side_effect=fake_process_venue) as mocked_process:
            with mock.patch.object(self.mod.time, "sleep", return_value=None):
                with mock.patch.object(self.mod.random, "uniform", return_value=0.0):
                    out = self.mod.process_venues_with_backoff(
                        venues,
                        resume=True,
                        save_every=0,
                        output_path=Path("website/cultural-map-redesign/data.json"),
                    )

        self.assertEqual(mocked_process.call_count, 1)
        self.assertEqual(out[0]["pid"], "already")
        self.assertEqual(out[1]["pid"], "new_pid")
        self.assertEqual(out[1]["h"], ["Tuesday: 9:00 AM – 5:00 PM"])

    def test_force_mode_reprocesses_all_entries(self):
        venues = [
            {"n": "Processed A", "pid": "old_a", "h": ["Monday: Closed"]},
            {"n": "Processed B", "pid": "old_b", "h": ["Monday: Closed"]},
        ]

        def fake_process_venue(venue):
            venue["pid"] = f"refetched_{venue['n']}"
            venue["h"] = ["Wednesday: 10:00 AM – 6:00 PM"]
            return venue

        with mock.patch.object(self.mod, "process_venue", side_effect=fake_process_venue) as mocked_process:
            with mock.patch.object(self.mod.time, "sleep", return_value=None):
                with mock.patch.object(self.mod.random, "uniform", return_value=0.0):
                    out = self.mod.process_venues_with_backoff(
                        venues,
                        resume=False,
                        save_every=0,
                        output_path=Path("website/cultural-map-redesign/data.json"),
                    )

        self.assertEqual(mocked_process.call_count, 2)
        self.assertTrue(out[0]["pid"].startswith("refetched_"))
        self.assertTrue(out[1]["pid"].startswith("refetched_"))


if __name__ == "__main__":
    unittest.main()
