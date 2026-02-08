# Phase 01-02 Hours Automation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automate weekly hours refresh safely with GitHub Actions, preserving API-key security and data quality checks.

**Architecture:** Use a scheduled/manual GitHub Actions workflow that installs Python dependencies, runs `scripts/fetch-hours.py` in resume mode, validates resulting dataset metrics, and commits only `website/cultural-map-redesign/data.json` changes.

**Tech Stack:** GitHub Actions, Python 3.12 runtime via setup-python, requests/python-dotenv, PowerShell/bash workflow steps, GitHub repository secrets

---

### Task 1: Create Refresh Workflow

**Files:**
- Create: `.github/workflows/refresh-hours.yml`

**Step 1: Write the failing workflow (draft)**

Create a minimal workflow with:
- `workflow_dispatch`
- weekly cron (`0 8 * * 1`)
- checkout + setup-python + pip install + run fetch-hours script

**Step 2: Validate workflow syntax locally**

Run:
```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe - <<'PY'
import yaml, pathlib
p = pathlib.Path(".github/workflows/refresh-hours.yml")
yaml.safe_load(p.read_text(encoding="utf-8"))
print("yaml-ok")
PY
```

Expected: `yaml-ok`.

**Step 3: Add auto-commit step**

Use `stefanzweifel/git-auto-commit-action@v5` configured to commit:
- `website/cultural-map-redesign/data.json`
- message: `chore(data): refresh hours of operation`

**Step 4: Commit**

```bash
git add .github/workflows/refresh-hours.yml
git commit -m "ci: add scheduled hours refresh workflow"
```

### Task 2: Add Dataset Verification Script for CI Guardrails

**Files:**
- Create: `scripts/verify-hours-data.py`
- Modify: `.github/workflows/refresh-hours.yml`

**Step 1: Write failing verification test case**

Create `scripts/verify-hours-data.py` to fail if:
- missing `h` or `pid` keys in any record
- total records below expected floor (e.g. `< 680`)
- malformed types (`h` not list/null, `pid` not str/null)

Script should print summary counts and exit non-zero on violations.

**Step 2: Run locally to confirm behavior**

Run:
```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/verify-hours-data.py
```

Expected: PASS on current data with summary counts.

**Step 3: Wire into workflow**

Add CI step after fetch:
```bash
python scripts/verify-hours-data.py
```

**Step 4: Commit**

```bash
git add scripts/verify-hours-data.py .github/workflows/refresh-hours.yml
git commit -m "ci: verify hours dataset structure before auto-commit"
```

### Task 3: Configure Secrets and Run Manual End-to-End Test

**Files:**
- Create: `docs/plans/artifacts/2026-02-08-refresh-hours-ops-checklist.md`

**Step 1: Add secret in GitHub**

In repo settings, add:
- `GOOGLE_PLACES_API_KEY`

**Step 2: Trigger workflow manually**

Run:
```bash
gh workflow run "Refresh Hours Data"
```

Then inspect:
```bash
gh run list --workflow="Refresh Hours Data" --limit 1
gh run view --log
```

Expected: successful run with no secret errors and no data-schema verification failures.

**Step 3: Record operational checklist**

Document run URL, duration, and result in:
`docs/plans/artifacts/2026-02-08-refresh-hours-ops-checklist.md`

**Step 4: Commit**

```bash
git add docs/plans/artifacts/2026-02-08-refresh-hours-ops-checklist.md
git commit -m "docs: capture hours refresh workflow operational checklist"
```

### Task 4: Final Production Hardening and Handoff

**Files:**
- Modify: `.planning/phases/01-data-pipeline-setup/01-02-SUMMARY.md` (create if missing)

**Step 1: Verify workflow content**

Confirm:
- schedule + manual trigger exist
- `GOOGLE_PLACES_API_KEY` read from secrets
- fetch + verify + commit steps are present

**Step 2: Verify idempotent behavior**

Run workflow twice manually.

Expected:
- first run may commit changes
- second run should usually produce no-op or minimal diff

**Step 3: Write summary**

Create/update `01-02-SUMMARY.md` with:
- workflow file path
- secret configured status
- latest run IDs and outcomes
- open risks (API quota, data drift)

**Step 4: Commit**

```bash
git add .planning/phases/01-data-pipeline-setup/01-02-SUMMARY.md
git commit -m "docs: complete phase 01-02 automation summary"
```
