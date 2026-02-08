# Phase 01-01 Recovery and Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stabilize and verify the hours-fetch pipeline so interrupted runs can safely resume without re-scraping already-processed assets.

**Architecture:** Keep the current `scripts/fetch-hours.py` data model (`pid`, `h`) and make reliability explicit through deterministic checks, resumability verification, and documented operator runbook. Avoid full data refetch unless explicitly requested.

**Tech Stack:** Python 3.12, requests, python-dotenv, unittest, PowerShell, JSON data file at `website/cultural-map-redesign/data.json`

---

### Task 1: Baseline Snapshot and Sanity Audit

**Files:**
- Create: `docs/plans/artifacts/2026-02-08-hours-baseline.txt`
- Read: `website/cultural-map-redesign/data.json`

**Step 1: Capture baseline metrics**

Run:
```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe - <<'PY'
import json
from pathlib import Path
p = Path("website/cultural-map-redesign/data.json")
data = json.loads(p.read_text(encoding="utf-8"))
total = len(data)
with_pid = sum(1 for v in data if v.get("pid") is not None)
with_hours = sum(1 for v in data if isinstance(v.get("h"), list) and len(v.get("h")) > 0)
print(f"total={total}")
print(f"with_pid={with_pid}")
print(f"with_hours={with_hours}")
print(f"without_hours={total-with_hours}")
PY
```

Expected: Counts print successfully and match current known range.

**Step 2: Save baseline report**

Write the command output and timestamp to:
`docs/plans/artifacts/2026-02-08-hours-baseline.txt`

**Step 3: Commit**

```bash
git add docs/plans/artifacts/2026-02-08-hours-baseline.txt
git commit -m "docs: capture phase 01-01 hours data baseline"
```

### Task 2: Add Resumability Regression Tests

**Files:**
- Create: `tests/test_fetch_hours_resume.py`
- Modify: `scripts/fetch-hours.py` (only if test-driven fixes are required)

**Step 1: Write the failing test**

Create `tests/test_fetch_hours_resume.py` with tests for:
- `is_processed` returns true only when both `pid` and `h` keys exist.
- Resume mode skips already-processed entries.
- `--force` path reprocesses all entries.

Use `unittest` + `unittest.mock` to patch networked functions (`find_place_id`, `fetch_hours`) so tests never call external APIs.

**Step 2: Run test to verify it fails**

Run:
```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe -m unittest tests/test_fetch_hours_resume.py -v
```

Expected: FAIL because tests target behavior not yet fully locked.

**Step 3: Write minimal implementation fixes**

Adjust only what the tests require in `scripts/fetch-hours.py`.

**Step 4: Run test to verify it passes**

Run:
```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe -m unittest tests/test_fetch_hours_resume.py -v
```

Expected: PASS with no network activity.

**Step 5: Commit**

```bash
git add tests/test_fetch_hours_resume.py scripts/fetch-hours.py
git commit -m "test: lock resumable fetch-hours behavior"
```

### Task 3: Add Operator Runbook for Safe Re-Runs

**Files:**
- Create: `docs/plans/artifacts/2026-02-08-fetch-hours-runbook.md`

**Step 1: Document canonical command paths**

Add explicit commands using:
`C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe`

Include:
- API test command
- default resume run command
- forced full re-fetch command (`--force`)
- checkpoint tuning command (`--save-every`)

**Step 2: Add interruption/recovery procedure**

Document:
- how to identify a running process
- when to stop/restart
- how to verify final success lines in output

**Step 3: Commit**

```bash
git add docs/plans/artifacts/2026-02-08-fetch-hours-runbook.md
git commit -m "docs: add fetch-hours recovery runbook"
```

### Task 4: Final Verification and Phase Freeze

**Files:**
- Modify: `.planning/phases/01-data-pipeline-setup/01-01-SUMMARY.md` (append verification addendum)

**Step 1: Verify script interfaces**

Run:
```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py --help
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py --test-api
```

Expected: Help shows `--force` and `--save-every`; API test succeeds.

**Step 2: Verify no accidental full rerun**

Run one normal invocation and confirm output includes:
- `Resume mode: enabled`
- `processed_this_run=0` (if dataset already complete)

**Step 3: Record freeze status**

Append a short addendum in `01-01-SUMMARY.md` noting:
- resumability behavior verified
- baseline metrics
- runbook location

**Step 4: Commit**

```bash
git add .planning/phases/01-data-pipeline-setup/01-01-SUMMARY.md
git commit -m "docs: freeze phase 01-01 with resumability verification"
```
