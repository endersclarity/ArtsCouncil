# CLA-25 — Historical PRD Close-Out Assessment (Review Navigation Sprint)

Status: close-out audit
Date: 2026-05-29
PRD audited: `docs/V1-DISCOVERY-MAP-REVIEW-NAVIGATION-SPRINT-PRD-2026-05-25.md` (present, read in full)
Code audited: `v1-discovery-map/app.js`, `v1-discovery-map/review-state.js`
Controlling PRD for residue: CLA-14

## Method

The 2026-05-25 Review Navigation Sprint PRD has no numbered "Acceptance Criteria" section; its testable commitments live in **User Stories (1–18)**, **Implementation Decisions**, and **Testing Decisions**. I audit each material commitment against actual code, citing `file:function`/line regions.

## Criterion-by-Criterion Audit

### A. Deep linking / shareable URL state (User Stories 1–7; Impl. lines 50–55)

| Commitment | Status | Evidence |
|---|---|---|
| US3: URL preserves active map **mode** | **DELIVERED** | `review-state.js` `parse`/`apply` handle `mode` against `VALID_MODES = {places, events, paths}` (lines 8, 25). Applied via `applyInitialReviewState` → `setMode` (`app.js:1183-1187`). |
| US4/US9: URL preserves active **visitor-intent filters** | **DELIVERED** | `intent` serialized as repeatable, de-duped, sorted params (`review-state.js:27-29`); restored & validated against `OUTING_TYPES` labels (`app.js:1184-1185`). |
| US1: URL directly to a **place / Primary Anchor** | **DELIVERED** | `place` param round-trips (`review-state.js:30`); restored only if in current filtered/visible set (`app.js:1194-1197`). |
| US2: URL directly to a **path** | **DELIVERED** | `path` param (`review-state.js:31`); `applyInitialReviewState` → `showPath` (`app.js:1188-1190`). |
| US (events): URL to a selected **event** | **DELIVERED** | `event` param (`review-state.js:32`); → `showEvent` (`app.js:1191-1193`). |
| US7: URL **updates live** as user clicks filters/anchors/paths/events | **DELIVERED** | `updateReviewUrl()` (`app.js:447-452`) called after every relevant interaction: filter toggle (`app.js:755`), place/path/event selection and mode change (`app.js:727, 1027, 1051, 1093, 1175`), Local Reveal (`app.js:575, 591`). Uses `history.replaceState` (no history spam). |
| US5: invalid/stale URL state **falls back gracefully** | **DELIVERED** | `parse` coerces unknown `mode` to `""` (→ default "places", `review-state.js:12, 25`); `intent` filtered to valid labels (`app.js:1185`); `place` restored only if it exists AND is currently visible (`app.js:1196`); `path`/`event` only if found (`app.js:1189-1192`). |
| US6: copy useful state from address bar | **DELIVERED** (implied) | Live URL via `replaceState` means the address bar always reflects current state; copyable by definition. |
| Impl. line 54: **exclude** camera/zoom/bounds/search-query/Near Me coords from URL | **DELIVERED / RESPECTED** | `apply`/`parse` serialize only `mode, intent, place, path, event` (`review-state.js:8-35`); no camera, bounds, `searchQuery`, or coordinates are written. |

**Deep linking: fully DELIVERED.** The PRD even anticipated extracting "a small state helper" for focused JS tests (Testing Decision line 68) — this exists as the standalone UMD module `review-state.js` with pure `parse`/`apply` functions.

### B. Compact places list panel (User Stories 8–12; Impl. lines 56–58)

| Commitment | Status | Evidence |
|---|---|---|
| US8: compact list of visible places | **DELIVERED** | `renderPlacesList()` (`app.js:461-519`) renders a compact `place-list-item` button list, capped at `limit = 60` (`app.js:466, 487`). |
| US9: list respects visitor-intent filters & explains the count | **DELIVERED** | List source `listedPlaces()` derives from `filteredPlaces()` (`app.js:419-425`); summary shows "N listed of M places on the map" using `filteredPlaces().length` (`app.js:465, 499`). |
| US10: list items open the **same selected card** as markers | **DELIVERED** | Each item's click calls `showPlace(place)` (`app.js:515-518`) — identical to marker behavior. No second detail model. |
| US11: list identifies **Primary Anchors / Supporting Stops** | **DELIVERED** | `placeReviewLabel()` (`app.js:454-459`) returns "Primary anchor" / "Supporting stop" / "MUSE pick" / "Place"; rendered as `place-list-badge` (`app.js:507`). |
| US12: list stays **compact on desktop and mobile** | **DELIVERED (functionally)** | Hard 60-item cap with "Showing first 60. Use search to narrow" hint (`app.js:512`); Browse Starting View shows only the sampler subset (`browseStartingPlaces`, `app.js:403-407`). Visual compactness on mobile is CSS-side (not re-verified here) — see residue note. |
| Impl. line 57: list reflects **currently relevant** records, not a full directory | **DELIVERED** | Starting view = `browseSamplerPlaceIds` (County Sampler); filtered/search views = filtered subset; Local Reveal = nearest 12 (`listedPlaces`, `app.js:419-425`). Not a full 1,415-row dump. |
| Impl. line 58: reuse existing selection + anchor/stop treatment | **DELIVERED** | Reuses `showPlace` and `placeReviewLabel` (above). |

**Compact list: DELIVERED.** One soft spot: mobile compactness (US12) is asserted in markup/limits but its visual verification is CSS/QA, not provable from `app.js` alone.

### C. Search within filtered places (User Stories 13–16; Impl. lines 59–61)

| Commitment | Status | Evidence |
|---|---|---|
| US13: search by **name, category, city, visitor intent** | **DELIVERED** | `searchableText()` concatenates `name, category, city, intent, + outing-type labels` lowercased (`app.js:390-393`); search filters via `searchableText(place).includes(query)` (`listedPlaces`, `app.js:421-424`). Search input wired at `app.js:1484-1486`. |
| US14: search results use the **same selected-place behavior** | **DELIVERED** | Search results render through the same `renderPlacesList()` → `showPlace()` path (`app.js:515-518`). |
| US15: empty results **explain plainly** | **DELIVERED** | Empty state: "No places match \"query\"." with optional "Clear filters" button (`app.js:471-486`). |
| US16: search + filters **compose predictably** | **DELIVERED** | `listedPlaces()` applies `filteredPlaces()` first, then the query substring (`app.js:421-424`) — filter ∩ search, deterministic. |
| Impl. line 60: search respects active filters by default, with a clear-filters escape | **DELIVERED** | Default search runs within `filteredPlaces()`; empty-state offers `#clear-place-filters` which calls `state.activeIntents.clear()` (`app.js:478-484`). |
| Impl. line 59: search over **static V1 data in the browser** | **DELIVERED** | Pure client-side filter over `state.places`; no network. |

**Search: DELIVERED.**

### D. Deferred items (correctly NOT built in this sprint)

| Item | Status | Evidence |
|---|---|---|
| US17: Near Me **groundwork** fits same map/list model | **PARTIAL (intentionally deferred)** | Not shipped as a feature, but the substrate exists: `distanceMiles` (`app.js:325-335`) and proximity-sorted list via `startLocalReveal` (`app.js:545-576`). PRD defers Near Me to a later slice (lines 62, 92) → tracked as **CLA-24**. |
| US18 / Out-of-scope: **Open Now excluded** until structured hours exist | **DELIVERED (as exclusion)** | No hours fields in `places.json` (0/1,415), no Open Now UI. Matches Out Of Scope lines 76–77. Data readiness tracked as **CLA-23**. |

## Summary Scorecard

- Deep linking (US1–7): **DELIVERED**
- Compact places list (US8–12): **DELIVERED** (mobile visual compactness = QA-confirmable, not code-provable)
- Search (US13–16): **DELIVERED**
- Near Me groundwork (US17): **PARTIAL by design** → CLA-24
- Open Now exclusion (US18): **DELIVERED as exclusion** → CLA-23

The audit's claim that the PRD is "largely delivered" is **confirmed and stronger than stated**: every in-scope acceptance commitment (deep linking, compact list, search) is DELIVERED with code evidence, and both deferred items were correctly deferred and already have successor issues (CLA-23, CLA-24).

## Recommendation

**Close CLA-25 as delivered.** The three in-scope slices are implemented and verifiable in `app.js` + `review-state.js`. Fold the following **small residue** into the controlling PRD (CLA-14) rather than keeping CLA-25 open:

1. **Mobile compactness verification (US12).** Code enforces a 60-item cap and sampler-only starting view, but the *visual* compact behavior on mobile (`< 700px`) is CSS/QA and was not verified here. Add a one-line mobile-list QA check to CLA-14's verification list.
2. **Browser verification of URL → state restoration (Testing Decisions lines 68–70).** The `parse`/`apply` helpers are testable; confirm whether automated checks for `review-state.js` exist, and if not, carry a small "add focused parse/serialize tests" item into CLA-14.
3. **Successor pointers.** Ensure CLA-14 references CLA-23 (hours readiness) and CLA-24 (Near Me) as the live continuations of US17/US18, so closing CLA-25 does not orphan those deferred commitments.

No functional gap blocks close-out; the residue above is QA/test hygiene, not unbuilt features.
