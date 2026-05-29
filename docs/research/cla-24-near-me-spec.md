# CLA-24 — "Near Me" Proximity Slice Spec

Status: shaping / spec only (no implementation)
Date: 2026-05-29
Scope: V1 Discovery Map (`website/cultural-map-redesign-stitch-lab/v1-discovery-map/`)
Controlling context: `CONTEXT.md`, `docs/V1-DISCOVERY-MAP-REVIEW-NAVIGATION-SPRINT-PRD-2026-05-25.md` (User Story 17, "Near Me as later slice")

## 1. Principle: a Behavior Layered on the Existing Places List

Near Me is **not** a separate product mode. Per PRD User Story 17 (line 43) and Implementation Decision (line 62), it must "fit the same map/list model... without creating a separate product mode." This is achievable cheaply because **the proximity primitive already exists in the codebase.**

Existing model (all in `v1-discovery-map/app.js`):

- **`distanceMiles(a, b)`** (`app.js:325-335`) — a working haversine distance function, already in production for constellation density and Local Reveal.
- **`startLocalReveal(lngLat)`** (`app.js:545-576`) — already takes an origin coordinate, runs `filteredPlaces()`, computes `distanceMiles` for each, **sorts ascending by distance, and slices the nearest 12**. This is exactly the proximity-sort Near Me needs — but the origin is a *map click*, not the *device location*.
- **`filteredPlaces()`** (`app.js:319-323`) — returns places filtered by `state.activeIntents` (the Outing Type filters). Proximity must compose with this, not replace it.
- **`listedPlaces()`** (`app.js:419-425`) → **`renderPlacesList()`** (`app.js:461-519`) — the compact list renderer. Local Reveal already feeds it a proximity-ordered subset via `state.localReveal`.

**Design consequence:** Near Me is a thin variant of the existing Local Reveal mechanism — replace the click-origin with a geolocation origin, and surface distance in the list. It reuses `distanceMiles`, the `filteredPlaces()` filter pipeline, `listedPlaces()`/`renderPlacesList()`, and existing `showPlace()` selection. No new detail model, no new panel.

### Interaction model with Outing Type filters

- Outing Type filters (`state.activeIntents`, toggled in the filter chips at `app.js:736-755`) remain the **primary filter**. Near Me is a **sort/scope applied on top of the already-filtered set**, mirroring `startLocalReveal`'s use of `filteredPlaces()` as its input (`app.js:556`).
- When Near Me is active: take `filteredPlaces()` → keep only records with finite `lat`/`lng` → sort by `distanceMiles(userOrigin, place)` → present in `renderPlacesList()` with a distance suffix ("0.4 mi").
- Toggling an Outing Type while Near Me is on re-runs the same pipeline (filter then proximity-sort). Clearing all Outing Types with Near Me on = "nearest cultural places of any type."
- Near Me is a **toggle pill**, parallel to the filter chips, not a mode switch — `state.mode` stays `"places"` (Local Reveal already forces `state.mode = "places"`, `app.js:565`).
- Records lacking map-ready coordinates (Directory-Only Places, `CONTEXT.md:75-81`) are excluded from proximity sort but should remain reachable via search/browse; do not let Near Me hide them as if deleted.

## 2. UX States

Near Me has four geolocation states. Copy uses Public Beta Surface plain language (`CONTEXT.md:19-21`) — no process/audit labels.

| State | Trigger | Behavior | Copy |
|---|---|---|---|
| **Prompt (idle)** | User taps the "Near Me" pill before granting permission | Show pill in default state; on tap, call `navigator.geolocation.getCurrentPosition`. Show a brief inline "Locating…" state on the pill. | Pill label: **"Near me"**. While resolving: **"Finding places near you…"** |
| **Allowed** | `getCurrentPosition` success | Set `userOrigin = {lat, lng}`. Run filter→proximity-sort pipeline. Pill shows active/selected state. List re-sorts nearest-first with distance suffix. Optionally fly map to user origin (reuse existing camera behavior). | List summary: **"Places near you"**; items append **"· 0.4 mi"**. Pill active: **"Near me ✓"** |
| **Denied** | `getCurrentPosition` error code 1 (PERMISSION_DENIED) | Do **not** error out. Revert pill to inactive; keep the existing County Sampler / filtered list intact. Offer a fallback. | **"Location access is off, so we can't sort by distance. You can still browse by area on the map or by Outing Type."** (optional secondary: how to re-enable in browser settings.) |
| **Unavailable** | `navigator.geolocation` undefined, or error codes 2/3 (POSITION_UNAVAILABLE / TIMEOUT) | Disable or hide the pill; never block browsing. Fall back to existing browse + map-click Local Reveal (`startLocalReveal`) as the manual proximity path. | **"Near Me isn't available on this device right now. Tap a spot on the map to see places nearby instead."** |

In every non-allowed state, the existing list/map experience must remain fully usable — Near Me failing must never degrade core browsing (Orientation Failure risk, `CONTEXT.md:251-253`).

## 3. Privacy: No Raw Coordinates in Shareable URLs

**Constraint confirmed against current serialization.**

`review-state.js` `apply()` (lines 22–35) serializes **only** these URL parameters: `mode`, `intent` (repeatable), `place`, `path`, `event`. `parse()` (lines 10–20) reads the same set. `currentReviewState()` in `app.js:437-445` likewise emits only `mode/intents/place/path/event`. `updateReviewUrl()` (`app.js:447-452`) writes exactly that via `replaceState`.

This is reinforced by the PRD Implementation Decision (line 54): *"Do not include map camera, zoom, bounds, cluster selection, search query, **Near Me coordinates**, or drawer/panel pixel state in the first deep-linking slice."*

**Spec requirement:** Near Me must **not** add any coordinate parameter (`lat`, `lng`, `near`, `origin`, etc.) to the serialized review state. The user's location stays in client-side `state` only (e.g. a new `state.userOrigin`, alongside `state.localReveal` which is also non-serialized). A shared review URL therefore can never leak a reviewer's or visitor's raw coordinates.

If a future privacy decision explicitly approves coarse location sharing, that is a separate ticket; until then the default is **never serialize coordinates**, and any "Near Me active" indication in a URL (if ever wanted) must use a non-location flag, not real coordinates.

## 4. Mobile Verification Plan

Near Me is primarily a mobile pattern; verify on a real or emulated mobile viewport (`isMobileViewport()` threshold is `< 700px`, `app.js:399-401`).

**Allowed path:**
1. On mobile, load Places mode. Tap "Near me". Confirm the browser permission prompt appears.
2. Grant permission. Confirm: list re-sorts nearest-first, distance suffixes appear, pill shows active state, and the same tap opens the same Selected Directory Card as a marker tap (reuses `showPlace`, `app.js:517`).
3. Toggle an Outing Type chip while Near Me is active. Confirm the list = (intent filter) ∩ (proximity sort), count updates via `updateCount()` (`app.js:427-435`).
4. Confirm no `lat`/`lng`/`near` parameter appears in the address bar after granting (privacy check against §3).

**Denied path:**
1. Fresh session (or reset site permissions). Tap "Near me". When prompted, **deny**.
2. Confirm: no console error, pill reverts to inactive, the existing filtered/County Sampler list is unchanged and still usable, and the denied-state copy (§2) is shown.
3. Confirm map-click Local Reveal (`startLocalReveal`) still works as the manual nearby fallback.

**Unavailable path (supplementary):** simulate `navigator.geolocation` absent / timeout; confirm pill is hidden/disabled and unavailable copy shows; browsing unaffected.

Verify through public UI + URL state, not internals, per PRD Testing Decisions (lines 67–72).

## 5. Open Dependency — "Blocked by #37"

The GitHub issue body for CLA-24 states it is **"Blocked by #37."** A human must confirm #37's status before this slice is scheduled.

- **What #37 likely is (best inference, NOT confirmed):** The controlling sprint PRD orders work as (1) deep linking, (2) compact places list, (3) search, (4) Near Me, (5) hours readiness (`PRD lines 87-93`). Near Me's stated prerequisite in the PRD is that it "fit the same map/list model" (User Story 17) — i.e. it depends on the **compact places list** and possibly the **search** slice landing first. So **#37 is most plausibly the compact-places-list issue (PRD item 2) or the deep-linking/list foundation** that Near Me layers onto.
- **Repo search result:** Grepping `docs/` for `#37`, `CLA-37`, and `Blocked by` returns **no match** — the dependency is tracked only in the issue tracker, not in repo docs. **Status of #37 cannot be determined from the codebase and is UNKNOWN — needs human confirmation.**
- **Action:** Before implementation, a human must (a) confirm what #37 is and (b) confirm it is closed/delivered. If #37 is the compact list, note that the list, `distanceMiles`, and Local Reveal proximity sort already exist in `app.js`, so the technical prerequisite may already be satisfied even if the issue is administratively open.

## 6. Out of Scope (this slice)

Implementation, distance-radius filtering UI tuning, map-pin distance tooltips beyond list suffixes, persisting location across sessions, background/continuous geolocation, and any coordinate serialization. This document is shaping only.
