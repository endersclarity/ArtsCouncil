---
phase: 02-tier-2-events
plan: 03
subsystem: ui
tags: [events, fallback-loading, source-badges, family-filter, vanilla-js]

# Dependency graph
requires:
  - "02-02: merge_events.py producing events-merged.json with source_label and is_family fields"
provides:
  - "Fallback-aware event loading: events-merged.json -> events.json with 48h staleness check"
  - "Source attribution badges on event cards for non-Trumba sources"
  - "Family & Kids filter chip in events UI"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [fallback fetch chain with staleness check, source badge rendering, additive filter chip]

key-files:
  created: []
  modified:
    - website/cultural-map-redesign/index-maplibre.js
    - website/cultural-map-redesign/index-maplibre-events-model.js
    - website/cultural-map-redesign/index-maplibre-events-view.js
    - website/cultural-map-redesign/index-maplibre-hero-intent.html
    - website/cultural-map-redesign/index-maplibre.css

key-decisions:
  - "Source badge hidden for Trumba events (default source) to avoid noise"
  - "Family filter uses same data-event-filter chip mechanism as date filters for consistency"
  - "48h staleness threshold for merged events before falling back to Trumba-only"

patterns-established:
  - "Fallback fetch: try merged JSON first, reject on staleness or error, catch to Trumba-only"
  - "Source badges: only shown when source_label differs from default (Nevada County Arts Council)"

# Metrics
duration: 2min
completed: 2026-02-14
---

# Phase 02 Plan 03: Client Integration for Multi-Source Events Summary

**Fallback-aware event loading with source attribution badges and Family & Kids filter chip**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-15T07:25:10Z
- **Completed:** 2026-02-15T07:26:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Event loading now tries events-merged.json first with 48h staleness check, gracefully falling back to events.json (Trumba-only)
- Source attribution badges render on event cards for LibCal and CivicEngage events (hidden for default Trumba source)
- Family & Kids filter chip added to events UI, filtering on is_family field from merge pipeline
- Both card view and row/list view include source badges consistently

## Task Commits

Each task was committed atomically:

1. **Task 1: Fallback-aware event loading and family filter logic** - `2521be6` (feat)
2. **Task 2: Source badges, family filter chip, and CSS** - `7fcfea0` (feat)

## Files Created/Modified
- `website/cultural-map-redesign/index-maplibre.js` - Fallback fetch chain for events-merged.json with staleness check
- `website/cultural-map-redesign/index-maplibre-events-model.js` - Family filter case in getFilteredMapEvents
- `website/cultural-map-redesign/index-maplibre-events-view.js` - Source badge rendering in card and row views
- `website/cultural-map-redesign/index-maplibre-hero-intent.html` - Family & Kids filter chip button
- `website/cultural-map-redesign/index-maplibre.css` - Source badge styling (indigo accent) and family chip active state (pink)

## Decisions Made
- Source badge hidden for "Nevada County Arts Council" (Trumba default) to avoid visual noise on existing events -- only LibCal/CivicEngage events get badges
- Family filter reuses existing data-event-filter chip mechanism rather than adding a separate filter system
- 48h staleness threshold chosen to balance freshness with resilience to temporary pipeline failures

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. Events-merged.json is produced by the pipeline from Plan 02; if absent, the site falls back to events.json seamlessly.

## Next Phase Readiness
- Phase 02 (Tier 2 Events) is now complete: ingest -> merge -> client rendering pipeline fully wired
- GitHub Actions daily cron (from Plan 02) will keep events-merged.json fresh once repo is on GitHub
- Family filter will show results once merge pipeline runs and populates is_family field

---
*Phase: 02-tier-2-events*
*Completed: 2026-02-14*
