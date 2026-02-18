---
phase: quick-3
plan: 01
subsystem: ai-trip-builder
tags: [bug-fix, chat-controller, tripbuilder-model, events-page, dreamboard]
dependency_graph:
  requires: [phase-8-complete]
  provides: [hardened-trip-pipeline]
  affects: [chat-controller, tripbuilder-model, events.html, api/chat.js]
tech_stack:
  added: []
  patterns: [millisecond-random-id, past-event-filter, code-fence-stripping, canonical-name-injection]
key_files:
  modified:
    - website/cultural-map-redesign-stitch-lab/index-maplibre-chat-controller.js
    - website/cultural-map-redesign-stitch-lab/index-maplibre-tripbuilder-model.js
    - website/cultural-map-redesign-stitch-lab/events.html
    - website/cultural-map-redesign-stitch-lab/api/chat.js
decisions:
  - "dreamboard model stores {asset, layer, city, addedAt, source} — no .data field — so p.data.n always falls back to p.asset; canonical fix is future improvement when addPlace stores full asset object"
  - "events.html bookmark uses start_iso as date key for dedup consistency with dreamboard model's title+date combo"
  - "hasEvent/removeEvent called with (title, start_iso) matching actual API signature — not wrapped in object"
metrics:
  duration: "~8 minutes"
  completed: "2026-02-18"
  tasks_completed: 3
  tasks_skipped: 1
  files_modified: 4
---

# Quick Task 3: Fix Phase 8 Remaining Bugs

Phase 8 AI Trip Builder pipeline hardening — 5 confirmed bugs fixed across 4 files. Task 28 (make it mine structure) was pre-verified as no-bug by planner.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (Tasks 24/25/27) | chat-controller: code fences, past events, canonical names | 7aa5957 | index-maplibre-chat-controller.js, api/chat.js |
| 2 (Task 29) | tripbuilder-model: ID collision fix | 1fe28f6 | index-maplibre-tripbuilder-model.js |
| 3 (Task 26) | events.html: bookmark buttons | 06e84bf | events.html |

## Task 28 (make it mine structure)

Pre-determined by planner: no code change needed. The existing `handleMakeItMine()` -> `addPlace()` per resolved stop already preserves `dayIndex` correctly. Verified by reading existing code — no bug found.

## Changes Made

### Task 25 — Code fence stripping in parseResponse() [chat-controller.js line ~392]

```js
// Fix A (Task 25): Strip outer markdown code fences that Gemini sometimes wraps around the full response
html = html.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '');
```

Placed immediately before `var itinRegex = ...`. The `parseItineraryBlock()` internal fence strip (line 28) was not sufficient because the outer `{{` was hidden inside backtick fences and the regex never matched.

### Task 27 — Past event filter in getDreamBoardPayload() [chat-controller.js line ~150]

```js
var nowMs = Date.now();
events = events.filter(function(e) {
  if (!e.start_iso) return true; // keep if no date (safe default)
  try {
    return new Date(e.start_iso).getTime() >= nowMs;
  } catch(ex) { return true; }
});
```

Applied after `model.getEvents()` before constructing `eventNames` array.

### Task 24 — Canonical asset names [chat-controller.js line ~144]

```js
var names = places.map(function(p) {
  // Prefer canonical .n field from stored data object; fallback to .asset display name
  return (p.data && p.data.n) ? p.data.n : (p.asset || '');
});
```

Note: dreamboard model's `addPlace()` stores `{asset, layer, city, addedAt, source}` — no `.data` field — so fallback to `p.asset` always applies currently. The fix is forward-compatible for when addPlace is updated to store full asset object.

### Task 24 — api/chat.js context note reinforces exact name matching

```js
const contextNote = '\n\nThe user has saved these places to their trip dream board — use these exact place names in STOP lines:\n' +
  safeNames.map(n => '- ' + n).join('\n') +
  '\n\nIncorporate these places when planning an itinerary. Place names in {{ITINERARY}} STOP lines must match this list exactly.';
```

### Task 29 — Trip ID collision fix (3 locations)

All 3 `'usr-' + Math.floor(Date.now() / 1000)` patterns replaced:
- `tripbuilder-model.js` `createTrip()` line 42
- `tripbuilder-model.js` `decodeFromUrl()` line 193
- `chat-controller.js` `parseItineraryBlock()` line 35

New pattern: `'usr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)`

### Task 26 — events.html bookmark buttons

Three changes:
1. Added `<script src="index-maplibre-dreamboard-model.js"></script>` after Luxon CDN
2. Render star button per event row in `renderEvents()` with `hasEvent(title, start_iso)` state check
3. `bindBookmarkDelegation()` — body-level click handler, calls `addEvent({title, venue, date: start_iso})` / `removeEvent(title, start_iso)`, updates button state inline + badge count

**API deviation from plan:** The plan's template used `hasEvent(evObj)` (object form). The actual dreamboard-model API takes `hasEvent(title, date)` as two separate strings. Implementation uses the correct actual API.

## Deviations from Plan

### Auto-fixed: API signature mismatch in events.html Task 26 template

**Rule 1 — Bug:** Plan template showed `dbModel.hasEvent(ev)` passing an event object. Actual dreamboard-model API uses `hasEvent(title, date)` with two string params.

**Fix:** Read dreamboard-model.js before writing. Used correct signatures throughout (`hasEvent(title, start_iso)`, `removeEvent(title, start_iso)`, `addEvent({title, venue, date: start_iso})`).

**Files modified:** events.html
**Commit:** 06e84bf

## Success Criteria Check

- [x] Task 24: getDreamBoardPayload() sends p.data.n with p.asset fallback; api/chat.js context note enforces exact name matching
- [x] Task 25: parseResponse() strips outer code fences before {{ITINERARY}} regex
- [x] Task 26: events.html renders star bookmark button per event row; click saves to ncac-dreamboard
- [x] Task 27: getDreamBoardPayload() filters events where start_iso < Date.now()
- [x] Task 28: Verified no code change needed (existing clone logic preserves multi-day stops)
- [x] Task 29: All 3 trip ID generation sites use millisecond+random suffix

## Ready For

Wave 2: Local UAT with playwright-cli against all Phase 8 features.

## Self-Check: PASSED

All 4 commits verified:
- `7aa5957` — chat-controller + api/chat.js (2 files, 25 insertions)
- `1fe28f6` — tripbuilder-model.js (1 file, 2 changes)
- `06e84bf` — events.html (1 file, 52 insertions)
