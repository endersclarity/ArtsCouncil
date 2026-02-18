---
phase: 09-directory-page-redesign
plan: 03
subsystem: ui
tags: [maplibre, directory, hover-sync, keyboard-a11y, empty-state, sort, mobile-ux, footer, css-polish]

# Dependency graph
requires:
  - phase: 09-01-directory-foundation
    provides: directory.html base with editorial palette, hours, events wiring
  - phase: 09-02-directory-interaction
    provides: pushState/popstate history, deep links, toast, breadcrumb
provides:
  - Empty state UI for zero-result searches
  - Pagination progress count on load-more button
  - Sort dropdown (A-Z, Z-A, By City) in expanded category view
  - Mobile map collapse/expand toggle
  - Upgraded footer with brand, nav links, attribution
  - Bidirectional map-list hover sync (map marker <-> sidebar card highlight)
  - Keyboard accessibility: tabindex, role=button, Enter/Space handlers on cards/items
  - Sticky search input within directory pane
  - WCAG AA contrast fix for expanded card text
  - CSS custom property tokens in tooltip (no more hardcoded colors)
  - CITY_FILTER_MIN named constant
  - Fuzzy partial match for ?cat= deep links
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "promoteId: 'idx' on GeoJSON source enables setFeatureState for hover glow"
    - "highlightSidebarCard(assetId): cross-reference asset ID to DOM [data-asset-id] selector"
    - "mouseenter/mouseleave on list items: map.setFeatureState({source:'assets', id:featureId}, {hover:true})"
    - "setHoveredFeatureId callbacks call highlightSidebarCard(v) for map->list direction"
    - "Empty state early return in renderList() before forEach loop"
    - "Sort via localeCompare in getFilteredData() after search filter"
    - "map.resize() called 300ms after map pane re-show for correct render"

key-files:
  created: []
  modified:
    - website/cultural-map-redesign-stitch-lab/directory.html
    - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css

key-decisions:
  - "promoteId: 'idx' added to assets GeoJSON source — required for setFeatureState to work by feature property rather than array index"
  - "highlightSidebarCard wired into BOTH setHoveredFeatureId callbacks (label controller + bindAssetInteractions) to cover all hover entry points"
  - "List->Map hover: set featureState directly (hover:true/false) rather than filter-based approach — cleaner with promoteId in place"
  - "Sticky search input uses position:sticky within .directory-pane (scrollable container) rather than fixed positioning"
  - "Category grid overridden to 2-column with !important to win specificity over existing 3-column rule"
  - "Footer upgrade uses existing colophon-inner flex layout — added brand/links/meta children with new CSS classes"
  - "Fuzzy ?cat= matching: exact match first, then partial indexOf match — handles 'galleries' matching 'Galleries & Museums'"
  - "CITY_FILTER_MIN = 3 named constant replaces magic number inline in filter()"

patterns-established:
  - "Pattern: Empty-state-early-return — check filtered.length === 0 before any DOM mutation, return early"
  - "Pattern: Bidirectional hover sync — set featureState on map for list->map, call highlightSidebarCard for map->list"

requirements-completed: [M3, M5, M6, M8, M9, M10, M11, Min2, Min3, Min4, Min5, Min8, Min9, Min10]

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 9 Plan 03: Directory Polish Summary

**Empty state, pagination progress, sort, map-list hover sync, mobile map toggle, footer upgrade, keyboard accessibility, and CSS token polish — making the directory feel finished.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T03:29:00Z
- **Completed:** 2026-02-18T03:33:32Z
- **Tasks:** 3 committed individually
- **Files modified:** 2

## Accomplishments

### Task 1: Empty state, pagination progress, sort options, footer

- `renderList()` checks `filtered.length === 0` early — renders `.directory-empty-state` with "No places found" message and hint, hides load-more, returns
- Load-more button shows `"Show more (X of Y)"` progress count instead of bare "Show more"
- Sort dropdown (A-Z, Z-A, By City) injected by `buildHeaderAndFilters()` after city filter pills
- Sort logic added to `getFilteredData()` using `localeCompare` — sort runs on a copy (`allData.slice()`) to avoid mutating original
- `CITY_FILTER_MIN = 3` constant replaces magic number
- Footer upgraded from 2 bare elements to structured `colophon-brand / colophon-links / colophon-meta` layout
- Fuzzy `?cat=` match: exact match first, then partial `indexOf` fallback (handles `?cat=galleries`)

### Task 2: Category grid density, mobile map toggle

- Map toggle button (`#directoryMapToggle`) added before `.map-pane` in HTML
- Toggle handler: `classList.toggle('map-pane--collapsed')`, updates button text, calls `map.resize()` after 300ms on re-show
- CSS: button hidden by default, visible at `max-width: 900px`; `.map-pane--collapsed { display: none !important }` at mobile
- CSS: `.directory-page .directory-pane .directory-grid` overridden to `repeat(2, 1fr)` with `!important` (was 3 columns)
- Mobile `<600px` falls back to `1fr`

### Task 3: Map-list hover sync, keyboard a11y, sticky search, CSS polish

- `highlightSidebarCard(assetId)` helper: clears previous `.directory-item--hover`, adds to matched `[data-asset-id]` card, scrolls into view
- Wired into both `setHoveredFeatureId` callbacks (label controller + `bindAssetInteractions`) for full map->list coverage
- `promoteId: 'idx'` added to assets GeoJSON source — enables `setFeatureState` by property `idx` rather than array index
- `mouseenter`/`mouseleave` on list items: `map.setFeatureState({source:'assets', id:featureId}, {hover:true/false})` + `.directory-item--hover` class toggle
- Category cards: `tabindex="0"`, `role="button"`, keydown Enter/Space handler
- Directory items: `tabindex="0"`, `role="button"`, keydown Enter/Space handler
- `.directory-page #directorySearch` set to `position: sticky; top: 0; z-index: 10`
- Gold `:focus` outline rings for `.directory-card`, `.directory-item`, `.directory-search-input`
- Tooltip hardcoded `#934512` → `var(--rust, #934512)` token
- Expanded card text: `color: var(--ink)` at `opacity: 0.85` (was `rgba(26,22,18,0.75)` — meets WCAG AA)

## Task Commits

1. **Task 1: empty state, pagination progress, sort options, footer** - `9df576c`
2. **Task 2: category grid 2-col, mobile map toggle, CITY_FILTER_MIN** - `c37bbec`
3. **Task 3: map-list hover sync, keyboard a11y, sticky search, CSS polish** - `b5f2cf2`

## Files Created/Modified

- `website/cultural-map-redesign-stitch-lab/directory.html` — 3 commits: empty state, sort, pagination, map toggle, promoteId, highlightSidebarCard, featureState hover, keyboard handlers, token fixes
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css` — CSS sections added: empty state, sort, map toggle, grid density override, hover sync, sticky search, focus rings, colophon brand/links/meta

## Decisions Made

- `promoteId: 'idx'` required for `setFeatureState` to work — the GeoJSON features use `idx` as their stable property, not array index.
- Both `setHoveredFeatureId` callbacks updated: label controller path and `bindAssetInteractions` path both call `highlightSidebarCard(v)` — covers full hover coverage regardless of which module fires first.
- Grid override uses `!important` to win CSS specificity over the existing `repeat(3, 1fr)` rule that appears earlier in the same file.
- Footer colophon-brand/links/meta CSS added to the stitch CSS file (not inline) since these are shared design tokens used across pages.

## Deviations from Plan

None — plan executed exactly as written. All 14 requirements (M3, M5, M6, M8, M9, M10, M11, Min2, Min3, Min4, Min5, Min8, Min9, Min10) addressed.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Self-Check: PASSED

- `directory.html` modified: FOUND (verified via Grep — all key selectors present)
- Commits 9df576c, c37bbec, b5f2cf2: FOUND (git log verified)
- `.directory-empty-state` in HTML and CSS: FOUND
- `CITY_FILTER_MIN` constant: FOUND
- `directoryMapToggle` button in HTML: FOUND
- `colophon-brand`, `colophon-links`, `colophon-meta` in HTML: FOUND
- `highlightSidebarCard` function: FOUND
- Both `setHoveredFeatureId` callbacks updated: FOUND
- `promoteId: 'idx'` on assets source: FOUND
- `tabindex="0"` on category cards and directory items: FOUND

---
*Phase: 09-directory-page-redesign*
*Completed: 2026-02-18*
