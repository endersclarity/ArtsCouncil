---
phase: quick
plan: 2
subsystem: ui
tags: [events, filter, timezone, intl-datetimeformat]

requires:
  - phase: 02-tier-2-events
    provides: events-utils.js, events-model.js, events-filter-ui.js

provides:
  - isEventTonight utility function in events-utils.js
  - Tonight filter branch in getFilteredMapEvents
  - Tonight chip in HTML filter row

affects: [events-ux, demo-prep]

tech-stack:
  added: []
  patterns: [timezone-aware hour extraction via Intl.DateTimeFormat]

key-files:
  created: []
  modified:
    - website/cultural-map-redesign-stitch-lab/index-maplibre-events-utils.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-events-model.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html

key-decisions:
  - "isEventTonight uses Intl.DateTimeFormat hour12:false for timezone-safe hour extraction (>= 17)"
  - "Tonight chip placed between Today and Weekend in filter row for natural reading order"

patterns-established:
  - "Date filter extension: add util function, add model branch, add wrapper, add HTML chip -- no filter-ui.js or bindings.js changes needed"

requirements-completed: [TONIGHT-FILTER]

duration: 2min
completed: 2026-02-17
---

# Quick Task 2: Tonight Filter Summary

**"Tonight" event filter chip using Intl.DateTimeFormat hour extraction with Pacific timezone binding, inserted between Today and Weekend chips**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-17T15:12:25Z
- **Completed:** 2026-02-17T15:14:24Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `isEventTonight` utility: checks event start is today AND hour >= 17 in Pacific timezone
- Model integration: `tonight` branch in `getFilteredMapEvents` date filter chain
- Timezone-bound wrapper in `index-maplibre.js` passes `PACIFIC_TZ` to utility
- HTML chip button with `data-event-filter="tonight"` -- existing filter-ui.js handles it generically

## Task Commits

Each task was committed atomically:

1. **Task 1: Add isEventTonight utility + model branch + wrapper wiring** - `a5e5534` (feat)
2. **Task 2: Add Tonight chip button to HTML filter row** - `c207486` (feat)

## Files Modified
- `website/cultural-map-redesign-stitch-lab/index-maplibre-events-utils.js` - Added isEventTonight function (13 lines), exported via CulturalMapEventsUtils
- `website/cultural-map-redesign-stitch-lab/index-maplibre-events-model.js` - Added isEventTonight to destructured params, added tonight branch in date filter chain
- `website/cultural-map-redesign-stitch-lab/index-maplibre.js` - Added timezone-bound isEventTonight wrapper, passed to getFilteredMapEvents params
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html` - Added Tonight chip button between Today and Weekend

## Decisions Made
- Used `Intl.DateTimeFormat` with `hour12: false` for timezone-safe hour extraction (same pattern as `isWeekendEvent` uses for weekday)
- Tonight chip placed between Today and Weekend for natural temporal ordering: All | Today | Tonight | Weekend | 2 Weeks
- No changes needed to `events-filter-ui.js` or `index-maplibre-bindings.js` -- they handle any `data-event-filter` value generically via click delegation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Steps
- Deploy to stitch-lab Vercel for committee demo (Feb 18)
- Tonight filter will show meaningful results during evening demo times

---
*Quick Task: 2-tonight-filter*
*Completed: 2026-02-17*
