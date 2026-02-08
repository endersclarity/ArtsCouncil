# Refresh Hours Workflow Ops Checklist

Date: 2026-02-08
Branch: `feat/superpowers-hours-workflow-takeover`
Repo: `endersclarity/ArtsCouncil`

## Completed

- [x] Added workflow file: `.github/workflows/refresh-hours.yml`
- [x] Added data verifier: `scripts/verify-hours-data.py`
- [x] Verified local dataset validation command passes
- [x] Set repo secret `GOOGLE_PLACES_API_KEY`

## Validation Results

- Local verifier output:
  - `total=685`
  - `with_pid=652`
  - `with_hours=401`
  - `without_hours=284`

## GitHub Actions Dispatch Attempt

Command:

```bash
gh workflow run refresh-hours.yml --ref feat/superpowers-hours-workflow-takeover --repo endersclarity/ArtsCouncil
```

Result:

- Failed with:
  - `HTTP 404: workflow refresh-hours.yml not found on the default branch`

## Why It Failed

GitHub API requires the workflow file to exist on the default branch before `workflow_dispatch` can run it by name/path.

## Next Step

1. Merge workflow branch into default branch (or cherry-pick the workflow commit).
2. Re-run:

```bash
gh workflow run "Refresh Hours Data" --repo endersclarity/ArtsCouncil
```

3. Check latest run:

```bash
gh run list --workflow="Refresh Hours Data" --limit 1 --repo endersclarity/ArtsCouncil
gh run view --log --repo endersclarity/ArtsCouncil
```
