---
phase: 04-copy-positioning
plan: 01
subsystem: ui
tags: [copy, editorial, MUSE-voice, SEO, hub-page]

# Dependency graph
requires:
  - phase: 03.1-content-architecture-demo-curation
    provides: Adaptive split layout, demo picks, tab UI structure
provides:
  - Hub HTML with all 26 copy surfaces rewritten per writers' room decisions
  - Config.js with MUSE-aligned category names and editorial taglines
  - Zero user-facing "cultural asset" language across hub + config
affects: [04-02 (itinerary/experience narrative rewrites), 04-03 (platform name decision)]

# Tech tracking
tech-stack:
  added: []
  patterns: [two-register voice (editorial vs functional), cover-subline/geo-context CSS pattern]

key-files:
  created: []
  modified:
    - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
    - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css
    - website/cultural-map-redesign-stitch-lab/index-maplibre-config.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-filter-state-model.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-explore-view.js

key-decisions:
  - "Hero headline: 'The Creative Life' with town sub-line (editor Recommendation #1 from MUSE voice)"
  - "Cultural Resources category renamed to 'Community & Learning' (58 venues: libraries, media, schools, chambers)"
  - "Tab labels simplified to single nouns: Picks, Events, Routes (Voice Rule 6)"
  - "'Cultural District' permitted in cover tag + colophon only; MUSE editorial quotes preserved as-is"

patterns-established:
  - "Two-register voice: editorial for narrative surfaces, functional for utility labels"
  - "Geographic context as quiet utility element (cover-geo-context class)"

# Metrics
duration: 5min
completed: 2026-02-16
---

# Phase 04 Plan 01: Hub & Config Copy Rewrite Summary

**All 26 hub copy surfaces rewritten per writers' room decisions: "The Creative Life" hero, MUSE editorial voice, zero "cultural assets," functional tab labels, geographic drive-time context for tourists**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-16T16:34:27Z
- **Completed:** 2026-02-16T16:40:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Hero headline changed from "Your Guide to Local Culture" to "The Creative Life" with town sub-line and drive-time geographic context
- SEO title tag rewritten with real keywords (galleries, events, dining, Sierra Foothills)
- All tab labels simplified to plain nouns per Voice Rule 6 (Picks, Events, Routes)
- MUSE section reframed with visitor-accessible context ("From MUSE, the Nevada County Arts Council's print journal")
- Colophon credits Experience Planning Committee with "Created by" language
- All 8 demo pick taglines rewritten in MUSE editorial voice with Nevada County specificity
- "Cultural Resources" category renamed to "Community & Learning" based on data inspection (58 venues)
- Zero instances of "cultural asset(s)" in any user-facing text

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite hub HTML copy** - `1cd4c13` (feat)
2. **Task 2: Rewrite config.js copy** - `29ad171` (feat)

## Files Created/Modified
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html` - All 26 hub copy surfaces rewritten
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css` - Added cover-subline, cover-geo-context, sr-only styles
- `website/cultural-map-redesign-stitch-lab/index-maplibre-config.js` - Category rename, tagline rewrites
- `website/cultural-map-redesign-stitch-lab/index-maplibre-filter-state-model.js` - "all assets" -> "all places"
- `website/cultural-map-redesign-stitch-lab/index-maplibre-explore-view.js` - "N of M assets" -> "places"

## Decisions Made
- Hero headline: "The Creative Life" (editor Recommendation #1, derived from Eliza Tudor's "creative life in motion")
- Cultural Resources -> "Community & Learning" (data inspection: 58 venues spanning libraries, media, schools, chambers, community orgs)
- Tab labels: "Picks" (was "Feature Picks"), "Events" (was "Upcoming Events"), "Routes" (was "Curated Routes")
- "Cultural District" in MUSE editorial body quotes preserved (actual MUSE content, not conversational copy)
- Map events title: "What's On" (was "Now and next" -- editor flagged as trying too hard)
- Corridor label: "Heritage Corridors" (was "Cultural Corridors from MUSE '26" -- tourist flagged as insider shorthand)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed "all assets" fallback in filter state model**
- **Found during:** Task 2 (config.js rewrite)
- **Issue:** `index-maplibre-filter-state-model.js` had user-facing "all assets" as fallback label when no filter active
- **Fix:** Changed to "all places"
- **Files modified:** index-maplibre-filter-state-model.js
- **Verification:** Grep confirms zero "all assets" in JS
- **Committed in:** 29ad171 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Fixed "N of M assets" in explore view**
- **Found during:** Task 2 (config.js rewrite)
- **Issue:** `index-maplibre-explore-view.js` displayed "Showing X of Y assets" to users
- **Fix:** Changed to "places"
- **Files modified:** index-maplibre-explore-view.js
- **Verification:** Grep confirms zero user-facing "assets" in explore view
- **Committed in:** 29ad171 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 missing critical terminology)
**Impact on plan:** Both fixes necessary for the "zero cultural assets" requirement. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Hub page copy complete. Ready for Plan 02 (itinerary + experience narrative rewrites)
- Plan 03 (platform name decision package) can proceed independently
- CSS for cover-subline and cover-geo-context may need visual tuning after browser review

---
*Phase: 04-copy-positioning*
*Completed: 2026-02-16*
