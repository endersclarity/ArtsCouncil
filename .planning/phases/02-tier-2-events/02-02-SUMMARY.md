---
phase: 02-tier-2-events
plan: 02
subsystem: data-pipeline
tags: [rapidfuzz, dedup, family-classification, github-actions, cron, python, event-merge]

# Dependency graph
requires:
  - "02-01: LibCal iCal and CivicEngage RSS ingest scripts"
provides:
  - "merge_events.py: cross-source dedup pipeline with family classification"
  - "family_keywords.json: configurable positive/negative family patterns"
  - "events-merged.json: wrapped format with source_counts and dedup_removed metadata"
  - "events-merged-flat.json: bare array compatible with build_event_index.py"
  - "refresh-events.yml: daily GitHub Actions cron workflow"
affects: [02-tier-2-events-plan-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [cross-source fuzzy dedup with rapidfuzz, family keyword classification, dual output format]

key-files:
  created:
    - scripts/events/merge_events.py
    - scripts/events/family_keywords.json
    - .github/workflows/refresh-events.yml
  modified: []

key-decisions:
  - "Dual output: wrapped events-merged.json for client, bare-array events-merged-flat.json for build_event_index.py"
  - "Dedup thresholds: title>=85, venue>=70 via rapidfuzz token_sort_ratio"
  - "Empty venue on either side treated as potential match (dedup aggressively)"
  - "Source priority: Trumba > LibCal > CivicEngage for dedup winner selection"

patterns-established:
  - "Merge pipeline: load -> normalize -> dedup -> classify -> dual output"
  - "Family classification: negative patterns checked first, then positive, default false"
  - "GitHub Actions event refresh: daily cron with continue-on-error for bonus sources"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 02 Plan 02: Event Merge/Dedup/Classify Pipeline Summary

**Cross-source event merge with rapidfuzz title+venue dedup, keyword-based family classification, and daily GitHub Actions cron workflow**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T07:20:33Z
- **Completed:** 2026-02-15T07:23:28Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- merge_events.py combines Trumba (49) + LibCal (70) + CivicEngage (1) into 120 deduplicated events
- Family classification tags 26 events as family-friendly using keyword patterns (storytime, lego club, stay & play, etc.)
- Graceful degradation: missing source files are logged and skipped, pipeline still produces valid output
- GitHub Actions workflow runs full pipeline daily at midnight Pacific with auto-commit

## Task Commits

Each task was committed atomically:

1. **Task 1: Merge/dedup/classify script with family keywords config** - `accd0c6` (feat)
2. **Task 2: GitHub Actions daily cron workflow** - `fb88a01` (chore)

## Files Created/Modified
- `scripts/events/merge_events.py` - Cross-source event merge, dedup, and family classification pipeline
- `scripts/events/family_keywords.json` - Configurable positive/negative family keyword regex patterns
- `.github/workflows/refresh-events.yml` - Daily cron workflow running full ingest -> merge -> index pipeline

## Decisions Made
- Dual output format: wrapped JSON (events-merged.json) with metadata for the client, bare array (events-merged-flat.json) for build_event_index.py compatibility. This avoids modifying build_event_index.py which expects `isinstance(events, list)`.
- Dedup uses BOTH title (>=85) AND venue (>=70) fuzzy matching. If either event has empty venue, venue check is skipped (dedup aggressively on title alone).
- Source priority for dedup winners: Trumba > LibCal > CivicEngage. Winner gets merged source_labels list from all matched events.
- Family classification: negative patterns (21+, adults only, bar night) checked first to prevent false positives on events like "Children of the Revolution" (band name).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. All feeds are publicly accessible. GitHub Actions workflow will need the repo pushed to GitHub to run.

## Next Phase Readiness
- events-merged.json ready for client consumption (Plan 03)
- events-merged-flat.json ready for build_event_index.py venue matching
- 26 family-tagged events available for family filter UI
- Daily cron will keep data fresh once repo is on GitHub

---
*Phase: 02-tier-2-events*
*Completed: 2026-02-14*
