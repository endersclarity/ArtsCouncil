# Dogfood Report — v1-discovery-map.vercel.app

**Date:** 2026-06-09
**Tester:** Claude (agent-browser dogfood)
**Target:** https://v1-discovery-map.vercel.app
**Scope:** Full app — Places / Events / Paths modes, desktop + mobile widths

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 | all fixed |
| Major    | 4 | all fixed |
| Minor    | 6 | all fixed |

## Issues

### [FIXED 2026-06-10] ISSUE-001 — Detail drawer keeps previous scroll position when opening a new place
**Severity:** Major (UX)
**Area:** Places mode — selection drawer
**Repro:**
1. Click a place card (e.g. Center for the Arts) — drawer opens.
2. Scroll down inside the drawer (e.g. to the address block).
3. Close the drawer, click a different place (e.g. Nevada Theatre).
4. Drawer opens still scrolled 400px down — photo and header are skipped; user lands mid-content. (`scrollTop` confirmed = 400 after new selection.)
**Expected:** Drawer resets to top on each new selection.
**Evidence:** screenshots/nevada-theatre-firstclick.png, screenshots/issue-001-result.png
**Repro video:** N/A (state bug, fully shown by screenshots)

### [FIXED 2026-06-10] ISSUE-002 — Map smart labels render on top of the detail drawer
**Severity:** Minor (visual)
**Area:** Places mode — z-index layering
**Repro:** Open any place's detail drawer; map venue labels near the right edge ("Hour…", "Juxtarts…", "InConcert…") poke over the drawer surface.
**Expected:** Drawer overlays all map UI.
**Evidence:** screenshots/drawer-open.png, screenshots/nevada-theatre-firstclick.png
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-003 — Paths copy says "Three routes" but there are 4 curated paths
**Severity:** Minor (content)
**Area:** Paths mode — sidebar intro
**Detail:** Counter reads "4 CURATED PATHS" and four path cards render (Living Like a Local, Makers/Working Artists, Evening Arts Night, Landscape/Ridge Context), but the intro card says "Three routes through the county's cultural life."
**Evidence:** screenshots/paths-mode.png, screenshots/issue-003.png
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-004 — CRITICAL: On mobile, the auto-opened "Start here" drawer traps the user (no close button, covers all navigation)
**Severity:** Critical (functional, mobile)
**Area:** Mobile layout (390px) — selection drawer + mode tabs
**Repro:**
1. Open the site at mobile width (390x844). Layout is fine: map on top, panel with Places/Events/Paths tabs below.
2. Tap Events, then tap Places.
3. The "Start here" anchor place (Center for the Arts) drawer auto-opens WITHOUT any user selection.
4. The drawer covers the entire bottom panel — tabs, search, and category list are unreachable.
5. The anchor drawer contains no Close button (only "View on map" ~1200px deep in its scroll). The user is stuck; only a page reload recovers.
**Root causes:** (a) drawer auto-opens the featured anchor on entering Places mode; (b) the anchor variant of the drawer has no close affordance; (c) mobile z-order puts the drawer over the whole control panel.
**Evidence:** screenshots/mobile-fresh.png (good state), screenshots/mobile-anchor-drawer.png (trapped state)
**Repro video:** N/A (state fully shown in before/after screenshots; reproduced twice)

### [FIXED 2026-06-10] ISSUE-005 — Drawer auto-opens featured place on entering Places mode (desktop too)
**Severity:** Minor on desktop (annoyance; on mobile it escalates to ISSUE-004)
**Detail:** Switching from Events or Paths back to Places auto-opens the "Start here" anchor detail without user action. Also seen after selecting a category (anchor swaps and opens). Recommend: never auto-open the drawer; highlight the anchor card in the list instead.
**Evidence:** screenshots/search-winery2.png (drawer open with no selection made)
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-006 — Top navigation disappears entirely on mobile (no hamburger)
**Severity:** Major (mobile)
**Area:** Header — MUSE MAGAZINE / CULTURE FORWARD / CURRENT MAP / PROPOSED FLOWS links
**Detail:** At 390px the `nav` is `display:none` and no hamburger or alternate menu exists. Mobile users cannot reach any of the four reference pages.
**Evidence:** screenshots/mobile-fresh.png (header shows brand only)
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-007 — Events mode offers no browsable list of the 60 events
**Severity:** Major (UX)
**Area:** Events mode sidebar
**Detail:** Header says "60 UPCOMING EVENTS" but the sidebar still shows only the Places category list (with place counts: Art 365 etc.). There is no event list, no date filter, no search. The only way to discover events is clicking small red diamonds on the map one by one. An event popup also auto-opens on mode switch without user action.
**Evidence:** screenshots/events-mode2.png
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-008 — Search is buried below the category list; sidebar has triple-nested scrollbars
**Severity:** Major (UX)
**Area:** Places mode sidebar
**Detail:** To reach "Search places" the user must scroll past the intro, tabs, "Start here" card, and all 7 category rows. The sidebar then contains an inner scrollbar for the results list inside the panel's own scrollbar, next to the page scrollbar — three nested scroll regions. Results list shows ~2.5 cards at a time in a small inner window.
**Evidence:** screenshots/sidebar-scrolled.png, screenshots/search-winery3.png
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-009 — Active route view has no back/close control
**Severity:** Minor (UX)
**Area:** Paths mode
**Detail:** After activating a path, the stop-list panel replaces the path list with no back button or close affordance. The only way out is re-clicking the Paths tab (not discoverable).
**Evidence:** screenshots/path-active.png
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-010 — Map attribution clipped behind legend; "Plan a night out" link bleeds out from under drawer
**Severity:** Minor (visual)
**Area:** Map bottom-right corner
**Detail:** The legend box overlaps the OpenMapTiles attribution ("© O…" clipped). When the detail drawer is open, the "Plan a night out" pill pokes out from under the drawer's left edge (same z-index family as ISSUE-002).
**Evidence:** screenshots/clean-initial.png, screenshots/nevada-theatre-firstclick.png
**Repro video:** N/A

### [FIXED 2026-06-10] ISSUE-011 — Sidebar headline wraps one word per line
**Severity:** Minor (visual)
**Area:** Places sidebar intro (desktop)
**Detail:** "Nevada County Cultural Map" wraps to 4 lines ("Nevada / County / Cultural / Map") in the narrow sidebar; intro text column is similarly cramped while the right half of the intro card is empty whitespace.
**Evidence:** screenshots/clean-initial.png
**Repro video:** N/A


## Fix log

- ISSUE-001 FIXED: openSelectionDrawer() now resets scrollTop to 0. Verified: selected place A, scrolled 400px, selected place B — drawer opened at top (scrollTop 0).
- ISSUE-004 FIXED: setMode() closes the drawer on every mode switch; Events mode no longer auto-opens the first event; anchor/summary cards now carry a Close button. Verified at 390x844: Events→Places leaves drawer closed; control panel reachable.
- ISSUE-005 FIXED: same change — drawer never opens without a user selection. Verified close button works on the anchor card.
- ISSUE-002 FIXED: .selection-drawer z-index raised 5→8 (selected smart label is 6). Verified: labels now clip under the drawer.
- ISSUE-003 FIXED: "Three routes" → "Four routes" in renderPathChooser copy. Verified live text.
- ISSUE-010 FIXED: MapLibre attribution moved to bottom-left; legend fades out while drawer is open. Verified.
- ISSUE-011 FIXED: panel topline now wraps (count drops below the title); headline renders on one line. Verified.
- ISSUE-009 FIXED: route view now has an "‹ All routes" back button (clears markers + route line, returns to chooser); the chooser itself got a Close button. Also fixed a regression my mode-switch change introduced (chooser rendered into a closed drawer — now explicitly reveals). Verified on desktop and 390px mobile, including Close from mobile.
REMAINING (3): ISSUE-006 (mobile nav hamburger), ISSUE-007 (events list), ISSUE-008 (sidebar search placement / nested scrolling).
- ISSUE-006 FIXED: added a hamburger toggle (≤880px) that opens the four reference links as a dropdown sheet under the header; aria-expanded wired; desktop nav unchanged (toggle display:none). Verified at 390px (open/close) and 1258px.
- ISSUE-007 FIXED: Events mode now renders a date-sorted browsable list of all upcoming events in the sidebar (click opens the detail drawer, active row highlighted, place search hidden in events mode). Event detail card also gained a Close button. Verified: 58 rows, click-through, close.
- ISSUE-008 FIXED: search block moved above the category list (visible in the first viewport, results directly under the input); results window raised 220px -> 340px (~6 cards). Verified: "winery" shows 13 results under the search box without scrolling past categories.

ALL 11 ISSUES FIXED — verified locally at 1258px and 390px, zero console errors. Not pushed to master.
