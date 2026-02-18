---
phase: 09-directory-page-redesign
plan: 02
subsystem: ui
tags: [maplibre, directory, history-api, pushstate, popstate, deep-link, toast, breadcrumb]

# Dependency graph
requires:
  - phase: 09-01-directory-foundation
    provides: directory.html base with editorial palette, hours, events wiring
provides:
  - pushState/popstate browser history for category + card navigation
  - collapseCardImmediate before all re-render paths (search, city filter)
  - Toast notification system (loading, error states)
  - Deep link breadcrumb (All Categories > Category > Venue)
  - map.flyTo() pre-load race condition guard
affects: [09-03-card-redesign, 09-04-mobile-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "history.pushState with state object {cat, place} for category + card transitions"
    - "popstate handler restores full UI state (category view, expanded card, map camera)"
    - "Toast pattern: showToast(msg, isError) / hideToast() with auto-dismiss on errors"
    - "map.loaded() guard: flyTo deferred with map.once('load') if map not ready"
    - "Breadcrumb injected via insertBefore(firstChild) into #directoryHeaderArea after deep link"

key-files:
  created: []
  modified:
    - website/cultural-map-redesign-stitch-lab/directory.html

key-decisions:
  - "history.pushState used for all meaningful state transitions (category select, card expand, card collapse) — replaceState only for initial seed"
  - "popstate handler registered inside loadData().then() so allData is available for place lookup"
  - "Toast shown synchronously before allData.find() — data is already in memory from loadData(), so toast shows briefly then hides after expandCard()"
  - "Breadcrumb injected via insertBefore(headerArea.firstChild) to appear above category header title"
  - "collapseCardImmediate() is the FIRST call in onSearch() and city filter pill click — this is the critical ordering that prevents ghost gold outline"
  - "map flyTo guarded with map.loaded() check — prevents silent failure when deep link arrives before MapLibre fires 'load' event"

patterns-established:
  - "Pattern: Collapse-before-render — always call collapseCardImmediate() before any renderList() triggered by user interaction"
  - "Pattern: State-in-history — pushState carries full serializable UI state, popstate restores it without any URL parsing"

requirements-completed: [M1, M2, M12, M13, M14, M15, Min1, Min6, Min7]

# Metrics
duration: 3min
completed: 2026-02-18
---

# Phase 9 Plan 02: Directory Interaction Polish Summary

**pushState/popstate history system, collapse-before-render fix, deep link loading/error states, and breadcrumb navigation — making the directory feel like a proper SPA.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-18T03:21:01Z
- **Completed:** 2026-02-18T03:24:13Z
- **Tasks:** 2 (committed as one atomic change to directory.html)
- **Files modified:** 1

## Accomplishments

- `collapseCardImmediate()` added as first call in `onSearch()` — eliminates ghost gold-outline bug when typing search while a card is expanded
- `collapseCardImmediate()` added as first call in city filter pill click handler — same clean collapse behavior for city filter transitions
- `history.pushState({ cat, place })` replaces `history.replaceState` in `expandCard()`, `collapseCard()`, and `selectCategory()` — browser back/forward now navigates through directory states
- `popstate` handler registered inside `loadData().then()` — restores full UI state (category view, expanded card, map camera) from `history.state`
- `history.replaceState` seeds initial state on page load — ensures popstate has a state object to restore to
- Toast HTML + CSS added (`#directoryToast`, `.directory-toast`, `.directory-toast--error`)
- `showToast()` / `hideToast()` helper functions added
- Deep link flow updated: `showToast('Loading X...')` before place lookup, `hideToast()` after successful `expandCard()`
- Error toast `'Place "X" not found'` with 4-second auto-dismiss for unmatched `?place=` values
- Breadcrumb injected after successful deep link: "All Categories > Category > Venue" with gold links
- Breadcrumb CSS added (`.directory-breadcrumb` with gold `a` links and hover underline)
- `map.flyTo()` guarded with `map.loaded()` check — falls back to `map.once('load', ...)` to prevent silent failure on pre-load deep links
- Verified: no `?idx=` or `?pid=` URL generation anywhere in the file

## Task Commits

All changes committed as one atomic commit (both tasks modify the same file, no meaningful breakpoint):

1. **Tasks 1+2: directory deep link + history system** - `9a865f4` (feat)

## Files Created/Modified

- `website/cultural-map-redesign-stitch-lab/directory.html` — 122 insertions: toast HTML, toast/breadcrumb CSS, showToast/hideToast helpers, pushState in expandCard/collapseCard/selectCategory, popstate handler, initial replaceState seed, collapseCardImmediate in onSearch/filter pill, flyTo guard, loading/error/breadcrumb in deep link handler

## Decisions Made

- `history.pushState` used for all meaningful state transitions — `replaceState` only for the initial seed. This ensures back/forward navigates through real states, not just the current URL.
- `popstate` handler registered inside `loadData().then()` — `allData` must be populated before the handler can look up places by name.
- Toast shown synchronously before `allData.find()` — since data is already in memory after `loadData()`, the toast shows briefly and then hides immediately after `expandCard()` resolves. No async delay needed.
- `collapseCardImmediate()` is the FIRST call in `onSearch()` and city filter pill click — ordering is critical. Any call to `renderList()` will nuke the expanded DOM, so the active state must be cleared first.
- `map.flyTo()` guarded: `map.loaded()` check with `map.once('load', ...)` fallback — deep links via QR codes or shared URLs trigger `expandCard()` synchronously during `requestAnimationFrame`, which may execute before MapLibre fires the `load` event.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Directory now has robust SPA-style navigation with pushState/popstate
- Deep links work correctly for QR codes and shared URLs
- No ghost-active-state bugs on search or filter re-renders
- Ready for Phase 09-03: Card redesign (richer card UI, photo treatment, expanded detail layout)
- Ready for Phase 09-04: Mobile UX fixes

---
*Phase: 09-directory-page-redesign*
*Completed: 2026-02-18*
