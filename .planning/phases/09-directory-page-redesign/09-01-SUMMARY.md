---
phase: 09-directory-page-redesign
plan: 01
subsystem: ui
tags: [maplibre, directory, hamburger, events-wiring, hours-utils, css-tokens, editorial-palette]

# Dependency graph
requires:
  - phase: 01.1-demo-visual-polish
    provides: mast-inner header structure, hamburger/search toggle JS in photo-carousel.js, editorial CSS tokens
  - phase: 02.2-live-music-venue-event-ingestion
    provides: events-merged-flat.json, events.index.json
  - phase: 06.1-deep-analytics-instrumentation
    provides: hours-utils module with getHoursState/getHoursLabel
provides:
  - Hub-matching header in directory.html (mast-inner, mast-nav-desktop, mast-actions)
  - Hamburger overlay DOM with close button and nav links
  - Hamburger/search toggle JS via CulturalMapPhotoCarousel.init()
  - Real hours state in expanded card detail (not always 'unknown')
  - Real 14-day event counts in expanded card detail (not always 0)
  - Editorial cream/ink/gold sidebar palette replacing dark charcoal
  - nav-active CSS for mast-nav-desktop
  - Base hours-pill CSS with open/closed/unknown variants
  - Archivo font in Google Fonts link
affects: [09-02-directory-interaction-polish, 09-03-card-redesign]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Non-blocking events fetch: Promise.all with .catch() fallback so page works without events data"
    - "rawDataForEvents preserved before .filter() to align with events.index.json matched_asset_idx positions"
    - "getEventCountForAsset14d() wrapper closure provides module variables to eventsModel function"
    - "CulturalMapPhotoCarousel.init() handles hamburger/search toggle; cloneCategoryGrid() silently no-ops"

key-files:
  created: []
  modified:
    - website/cultural-map-redesign-stitch-lab/directory.html
    - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css

key-decisions:
  - "Dark charcoal sidebar replaced entirely with editorial cream/ink/gold palette — no dark theme preserved"
  - "Hours pill CSS uses class names hours-open/hours-closed/hours-unknown matching detailView output conventions"
  - "rawDataForEvents (unfiltered) passed to buildVenueEventIndex; allData (filtered) used for all display"
  - "CulturalMapPhotoCarousel.init() reused for hamburger; no separate hamburger module needed"
  - "Archivo added to Google Fonts link per M7 requirement (font used by future tasks in this phase)"

patterns-established:
  - "Pattern: Non-blocking data loading — events fetch chain isolated from main Promise.all in loadData()"
  - "Pattern: Raw vs filtered data split — preserve rawMapped before .filter() when modules use raw indices"

requirements-completed: [C1, C2, C3, C4, C5, M4, M7]

# Metrics
duration: 18min
completed: 2026-02-18
---

# Phase 9 Plan 01: Directory Foundation Summary

**Hub-matched header with hamburger overlay, editorial cream/ink/gold sidebar palette, and real hours + events data wiring replacing all stubbed values.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-02-18T00:00:00Z
- **Completed:** 2026-02-18T00:18:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Header rebuilt with `.mast-inner` / `.mast-nav-desktop` / `.mast-actions` structure matching the hub exactly — mobile hamburger now works
- Dark charcoal sidebar (#1f2937) replaced with editorial cream (#f5f0e8) palette throughout — all text, borders, cards, pills, buttons updated
- Events wiring added: `events-merged-flat.json` + `events.index.json` fetched non-blocking; real event counts in expanded cards
- Hours wiring fixed: `buildAssetsGeoJSON` now calls `hoursUtils.getHoursState(asset)` and `hoursUtils.getHoursLabel(state)` instead of returning constant 'unknown'
- `CulturalMapPhotoCarousel.init()` loaded — hamburger open/close/focus-trap works with no code changes to photo-carousel.js
- `.mast-nav-desktop a.nav-active` rule added; Directory link shows gold active state
- Base `.hours-pill` CSS added with editorial green/red/gray variants for open/closed/unknown

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace header markup and add hamburger overlay** - `8e6e832` (feat)
2. **Task 2: Fix sidebar color tokens and add missing CSS** - `6a62bfc` (fix)
3. **Task 3: Wire real hours and events data** - `01ed6a7` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `website/cultural-map-redesign-stitch-lab/directory.html` - Header replaced, 3 new script tags, events wiring, photo-carousel init, trip badge multi-element
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css` - Dark sidebar section replaced with editorial palette; nav-active and hours-pill base styles added

## Decisions Made

- Dark charcoal sidebar replaced entirely with editorial palette — the dark theme was Stitch-era design that never matched the editorial direction. No dark override preserved.
- `rawDataForEvents` preserved before `.filter()` so `events.index.json` matched_asset_idx values align correctly with `buildVenueEventIndex()` input.
- Hours pill class names use `hours-open` / `hours-closed` / `hours-unknown` (not the `hours-pill--open` BEM variant) because `buildDetailMetaHTML` in `detail-view.js` generates these class names.
- `CulturalMapPhotoCarousel.init()` handles the hamburger via `setupHamburger()` + `setupSearchToggle()`. The `cloneCategoryGrid()` call inside silently no-ops (directory has no `#categoryGrid`) — accepted per research doc.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Foundation is solid: header matches hub, mobile hamburger works, sidebar is editorial cream
- Events model loaded and wired — `matchedEventsByAsset` populated after fetch
- Hours utils wired — real state shows in tooltips and expanded cards
- Ready for Phase 09-02: Interaction polish (card expand/collapse re-render bug, city filter collapse, deep link improvements)
- The `renderList()` / `onSearch()` re-render bug (ghost active state when card expanded) was noted in research as Pattern 6 — not addressed in this plan (scoped to 09-02)

---
*Phase: 09-directory-page-redesign*
*Completed: 2026-02-18*
