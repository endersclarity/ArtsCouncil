"""
Phase 2 merge gate tests.
These tests verify the Tier 2 Events pipeline exists and produces correct output.
Run BEFORE merge (expect failures) and AFTER merge (expect all pass).

Usage:
    pip install -r scripts/requirements.txt
    python -m pytest tests/test_phase2_merge_gate.py -v
"""
import json
import os
import subprocess
import sys
import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts", "events")
SITE = os.path.join(ROOT, "website", "cultural-map-redesign")


# ─── Gate 1: Pipeline scripts exist ───────────────────────────────────

class TestScriptsExist:
    def test_libcal_ingest_exists(self):
        assert os.path.isfile(os.path.join(SCRIPTS, "ingest_libcal_ical.py"))

    def test_civicengage_ingest_exists(self):
        assert os.path.isfile(os.path.join(SCRIPTS, "ingest_civicengage_rss.py"))

    def test_merge_script_exists(self):
        assert os.path.isfile(os.path.join(SCRIPTS, "merge_events.py"))

    def test_family_keywords_exists(self):
        path = os.path.join(SCRIPTS, "family_keywords.json")
        assert os.path.isfile(path)
        data = json.load(open(path, encoding='utf-8'))
        assert "positive_patterns" in data
        assert "negative_patterns" in data
        assert len(data["positive_patterns"]) >= 5

    def test_requirements_has_deps(self):
        req = open(os.path.join(ROOT, "scripts", "requirements.txt"), encoding='utf-8').read()
        assert "icalendar" in req
        assert "rapidfuzz" in req
        assert "recurring-ical-events" in req

    def test_github_workflow_exists(self):
        wf = os.path.join(ROOT, ".github", "workflows", "refresh-events.yml")
        assert os.path.isfile(wf)
        content = open(wf, encoding='utf-8').read()
        assert "cron" in content
        assert "merge_events" in content
        assert "events-merged-flat" in content


# ─── Gate 2: Pipeline produces valid output ───────────────────────────

class TestPipelineOutput:
    """Run each ingest script and the merge script, verify output schema."""

    @pytest.fixture(scope="class")
    def tmp_dir(self, tmp_path_factory):
        return str(tmp_path_factory.mktemp("events"))

    def _run_script(self, script, args, timeout=60):
        cmd = [sys.executable, os.path.join(SCRIPTS, script)] + args
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=ROOT)
        return result

    def test_libcal_ingest_runs(self, tmp_dir):
        out = os.path.join(tmp_dir, "events-libcal.json")
        r = self._run_script("ingest_libcal_ical.py", ["--output-file", out])
        assert r.returncode == 0, f"LibCal ingest failed: {r.stderr}"
        data = json.load(open(out, encoding='utf-8'))
        assert "generated_at" in data
        assert "events" in data
        assert len(data["events"]) >= 5, f"Expected 5+ LibCal events, got {len(data['events'])}"

    def test_civicengage_ingest_runs(self, tmp_dir):
        out = os.path.join(tmp_dir, "events-civicengage.json")
        r = self._run_script("ingest_civicengage_rss.py", ["--output-file", out])
        assert r.returncode == 0, f"CivicEngage ingest failed: {r.stderr}"
        data = json.load(open(out, encoding='utf-8'))
        assert "generated_at" in data
        assert "events" in data
        # CivicEngage can be 0 events (low volume) - just verify schema

    def test_merge_produces_valid_output(self, tmp_dir):
        # First run both ingest scripts
        self._run_script("ingest_trumba_rss.py", [], timeout=60)
        self._run_script("ingest_libcal_ical.py", [
            "--output-file", os.path.join(tmp_dir, "events-libcal.json")
        ])
        self._run_script("ingest_civicengage_rss.py", [
            "--output-file", os.path.join(tmp_dir, "events-civicengage.json")
        ])

        merged = os.path.join(tmp_dir, "events-merged.json")
        flat = os.path.join(tmp_dir, "events-merged-flat.json")
        r = self._run_script("merge_events.py", [
            "--libcal-file", os.path.join(tmp_dir, "events-libcal.json"),
            "--civicengage-file", os.path.join(tmp_dir, "events-civicengage.json"),
            "--output-file", merged,
            "--flat-output-file", flat,
        ])
        assert r.returncode == 0, f"Merge failed: {r.stderr}"

        # Wrapped format
        data = json.load(open(merged, encoding='utf-8'))
        assert "generated_at" in data
        assert "source_counts" in data
        assert "events" in data
        assert len(data["events"]) > 50, f"Expected 50+ merged events, got {len(data['events'])}"

        # Family classification happened
        family = [e for e in data["events"] if e.get("is_family")]
        assert len(family) >= 1, "Expected at least 1 family-tagged event"

        # Flat format is bare array
        flat_data = json.load(open(flat, encoding='utf-8'))
        assert isinstance(flat_data, list), f"Flat file must be a list, got {type(flat_data)}"
        assert len(flat_data) == len(data["events"])

    def test_canonical_event_schema(self, tmp_dir):
        merged = os.path.join(tmp_dir, "events-merged.json")
        if not os.path.isfile(merged):
            pytest.skip("Merge output not found (run test_merge_produces_valid_output first)")
        data = json.load(open(merged, encoding='utf-8'))
        required_keys = [
            "event_id", "title", "start_iso", "end_iso", "timezone",
            "venue_name", "venue_city", "source_type", "source_label", "is_family"
        ]
        for event in data["events"][:10]:  # spot check first 10
            for key in required_keys:
                assert key in event, f"Event {event.get('event_id', '?')} missing key: {key}"

    def test_no_duplicate_event_ids(self, tmp_dir):
        merged = os.path.join(tmp_dir, "events-merged.json")
        if not os.path.isfile(merged):
            pytest.skip("Merge output not found")
        data = json.load(open(merged, encoding='utf-8'))
        ids = [e["event_id"] for e in data["events"]]
        dupes = [eid for eid in ids if ids.count(eid) > 1]
        assert len(dupes) == 0, f"Duplicate event IDs: {set(dupes)}"


# ─── Gate 3: Client integration exists ────────────────────────────────

class TestClientIntegration:
    def test_event_loader_references_merged_json(self):
        js = open(os.path.join(SITE, "index-maplibre.js"), encoding='utf-8').read()
        assert "events-merged.json" in js, "index-maplibre.js must reference events-merged.json"

    def test_event_loader_has_fallback(self):
        js = open(os.path.join(SITE, "index-maplibre.js"), encoding='utf-8').read()
        # Should have both merged and fallback to events.json
        assert "events-merged.json" in js
        assert "events.json" in js

    def test_source_badge_in_view(self):
        js = open(os.path.join(SITE, "index-maplibre-events-view.js"), encoding='utf-8').read()
        assert "source_label" in js, "Events view must render source_label badges"

    def test_family_filter_in_model(self):
        js = open(os.path.join(SITE, "index-maplibre-events-model.js"), encoding='utf-8').read()
        assert "family" in js.lower(), "Events model must support family filter"
        assert "is_family" in js, "Events model must check is_family field"

    def test_family_chip_in_html(self):
        html_path = os.path.join(SITE, "index-maplibre-hero-intent.html")
        html = open(html_path, encoding='utf-8').read()
        assert 'data-event-filter="family"' in html, "HTML must have Family filter chip"

    def test_github_workflow_uses_flat_file(self):
        wf = open(os.path.join(ROOT, ".github", "workflows", "refresh-events.yml"), encoding='utf-8').read()
        assert "events-merged-flat.json" in wf, "Workflow must pass flat file to build_event_index.py"
