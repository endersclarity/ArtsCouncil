---
phase: 01-data-pipeline-setup
plan: 02
subsystem: data-pipeline-automation
tags: [github-actions, automation, data-quality, google-places-api]

requires:
  - phase: 01-data-pipeline-setup
    plan: 01
    provides: Resumable fetch-hours script and validated data baseline
provides:
  - GitHub workflow for scheduled/manual hours refresh
  - CI data-structure verification script
affects: [operations, weekly-data-refresh]

tech-stack:
  added: [GitHub Actions, gh CLI, Python verifier script]
  patterns: [scheduled refresh, workflow_dispatch, commit-on-change, schema checks]

key-files:
  created:
    - .github/workflows/refresh-hours.yml
    - scripts/verify-hours-data.py
    - docs/plans/artifacts/2026-02-08-refresh-hours-ops-checklist.md

duration: in-progress
completed: null
---

# Phase 1 Plan 02: Hours Data Integration and Automation Summary

## Status

In progress. Local implementation and validation are complete; remote workflow execution is blocked by default-branch workflow registration requirement.

## Completed Work

- Added workflow `.github/workflows/refresh-hours.yml` with:
  - weekly cron (`0 8 * * 1`)
  - manual dispatch trigger
  - dependency install
  - hours refresh execution
  - data verification step
  - auto-commit for `website/cultural-map-redesign/data.json`
- Added verifier script `scripts/verify-hours-data.py`
  - checks record count floor
  - checks required keys (`pid`, `h`) for all records
  - checks type validity (`pid`: string/null, `h`: list/null)
- Set repository secret:
  - `GOOGLE_PLACES_API_KEY` (verified in `gh secret list`)

## Validation

- Local verifier passed on current dataset:
  - `total=685`
  - `with_pid=652`
  - `with_hours=401`
  - `without_hours=284`

## Blocker Encountered

Attempting to dispatch workflow on feature branch failed:

- `HTTP 404: workflow refresh-hours.yml not found on the default branch`

This is a GitHub Actions behavior: a workflow must exist on the default branch before dispatching by workflow ID/path.

## Next Action to Complete Plan 02

1. Merge branch `feat/superpowers-hours-workflow-takeover` to default branch.
2. Trigger workflow manually.
3. Review run logs and verify success.
4. Confirm auto-commit behavior.
5. Mark this summary as completed.
