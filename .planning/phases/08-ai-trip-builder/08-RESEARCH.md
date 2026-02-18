# Phase 8: AI Trip Builder - Research

**Researched:** 2026-02-17
**Domain:** localStorage-based bookmarking, chatbot itinerary generation, itinerary rendering reuse, URL sharing
**Confidence:** HIGH

## Summary

Phase 8 builds a complete trip-planning pipeline: bookmark icons across all surfaces save places and events to a localStorage-backed dream board, the existing AI concierge gains trip-planning mode with a structured `{{ITINERARY}}` response block, and finalized itineraries render identically to curated ones (day tabs, stop cards, map route, calendar export) with a gold accent distinguishing user trips from editorial content.

The critical insight from codebase research is that the existing itinerary pipeline (`resolveItineraryStops` -> `flattenStopsForMap` -> `activateItineraryOnMap` -> `renderDetailOverlay`) works unchanged for user-generated trips if the trip object matches the `itineraries.json` schema. This means the "wow factor" feature -- dynamic map route rendering from chatbot output -- requires zero changes to the rendering and map layers. The work is in (1) the dream board model/view, (2) the `{{ITINERARY}}` parser in the chat controller, (3) the system prompt extension, and (4) the new trip.html page that wires everything together.

**Primary recommendation:** Implement in 4 sub-phases matching the plan structure: dream board model + bookmark buttons (08-01), trip page + dream board view + "Make it mine" bridge (08-02), chatbot itinerary mode + parser (08-03), finalized rendering + share + calendar + polish (08-04).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Both **venues AND events** are bookmarkable (resolves open question #1 from UX flows doc)
- Events carry date/time context -- chatbot can factor event schedules into itinerary timing
- Stale events (past date) should be handled gracefully in the dream board (visual indicator or auto-archive)
- **One-shot plans via style cards** preferred over multi-turn Q&A conversation
- Quick-action cards ("1-day plan", "2-day plan", "Just organize my list") let users skip the interview and go straight to itinerary generation
- The back-and-forth Q&A is available but not the default path -- users who want to customize can type naturally
- "Make it mine" from curated itineraries should copy stops into dream board for modification
- **YES -- inline map on trip.html** showing dream board pins and itinerary route
- Dynamic route rendering on the interactive map, same treatment as curated routes (numbered stop markers, route line, flyTo camera)
- The existing `activateItineraryOnMap()` + `resolveItineraryStops()` pipeline handles this -- schema-identical trip objects render identically to curated itineraries
- Dream board cards **SHOULD open detail panel** when clicked (overrides brainstorm UX doc recommendation of dead-end cards)
- Remove button (X) still intercepts with `e.stopPropagation()` -- card click = detail, X click = remove
- Simple list with small thumbnails for unplanned items -- minimal treatment
- No elaborate "swap in" UI -- just a visible list of what didn't make the cut
- Users can ask the chatbot to include them if they want

### Claude's Discretion
- Onboarding and empty state messaging -- surface during planning
- First-use discoverability approach (text labels vs icon-only)
- Dream board item limit thresholds (20 soft / 30 hard from brainstorm docs is fine as starting point)
- Toast notification design and timing
- Badge count animation details
- Exact responsive breakpoints for trip page layout

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (already in project -- no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (ES5 IIFEs) | N/A | All new modules | Project convention -- no framework, no build system |
| GSAP 3.11 | CDN | Bookmark animations, toast slide, badge pulse, panel transitions | Already loaded; used throughout UI |
| MapLibre GL JS 4.5.0 | CDN | Inline map on trip.html for dream board pins and route rendering | Already loaded; trip.html needs its own map instance |
| Luxon 3.4 | CDN | Stale event detection (date comparison for past events on dream board) | Already loaded; timezone-aware date math |
| Google Generative AI SDK | npm | Gemini 3.0 Flash for chatbot (server-side) | Already installed in `api/chat.js` |

### Supporting (already in project)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Turf.js 7.2 | CDN | Route line generation for user trip map rendering | Via existing `corridor-map.js` module |
| MapTiler Landscape | API | Basemap tiles for trip.html inline map | Same config as hub page |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage | IndexedDB | More storage, async API, but overkill for <100KB of dream board data. localStorage is simpler, synchronous, and the brainstorm team already designed around it. |
| Base64 URL sharing | Supabase-stored trips | Clean short URLs, no length limit, but adds server dependency. Base64 works for v1 (12 stops comfortable). Supabase deferred to v2. |
| Pipe-delimited `{{ITINERARY}}` | JSON response blocks | JSON is more structured but LLMs produce malformed JSON ~15% of the time. Pipe-delimited is harder to break and matches existing `[[asset|pid]]` and `{{MUSE|id|quote}}` conventions. |

**Installation:** No new packages required. All dependencies already present.

## Architecture Patterns

### Recommended Module Structure

```
website/cultural-map-redesign-stitch-lab/
  index-maplibre-dreamboard-model.js      # localStorage CRUD for dream board
  index-maplibre-dreamboard-view.js       # Bookmark icon rendering, toast, badge
  index-maplibre-tripbuilder-model.js     # localStorage CRUD for user trips, URL encode/decode
  index-maplibre-tripbuilder-view.js      # Trip page rendering (dream board zone, itinerary zone, unplanned zone)
  index-maplibre-tripbuilder-controller.js # Wires dream board, chatbot, and itinerary views
  trip.html                                # New page: trip planning destination
  api/chat.js                              # Modified: dream board context, {{ITINERARY}} prompt
```

### Script Load Order (verified from HTML entry point)

New modules insert after `index-maplibre-itinerary-controller.js` (line 564) and before `index-maplibre-detail-view.js` (line 565):

```html
<!-- Existing: itinerary system -->
<script src="index-maplibre-itinerary-controller.js"></script>

<!-- NEW: trip builder system (5 modules) -->
<script src="index-maplibre-dreamboard-model.js"></script>
<script src="index-maplibre-dreamboard-view.js"></script>
<script src="index-maplibre-tripbuilder-model.js"></script>
<script src="index-maplibre-tripbuilder-view.js"></script>
<script src="index-maplibre-tripbuilder-controller.js"></script>

<!-- Existing: continues -->
<script src="index-maplibre-detail-view.js"></script>
```

The dreamboard-model must load first (no dependencies beyond config). The tripbuilder-controller loads last (depends on all 4 preceding modules).

### Pattern 1: Itinerary Schema Compatibility (CRITICAL)

**What:** User-generated trips must be schema-identical to entries in `itineraries.json` so the existing rendering pipeline works unchanged.

**Verified from codebase:** The `resolveItineraryStops()` function in `index-maplibre-itinerary-model.js` (line 46) iterates `itinerary.days[].stops[]` and matches `stop.asset` against `data[].n` (case-insensitive). It produces a flat array of resolved stops with `{ asset, time, duration, narrative, tip, data, dayIndex, dayLabel }`. The view's `renderDetailOverlay()` and `renderStopCard()` consume this format directly. The map's `activateItineraryOnMap()` wraps resolved stops in `{ data, order, note, connector }` and passes to `corridor-map.js`.

**Required trip object shape** (must match exactly):
```javascript
{
  id: 'usr-1739800000',           // "usr-" prefix distinguishes from curated
  title: 'My Weekend in Gold Country',
  subtitle: '',
  duration: '2-day',              // "N-day" format
  season: 'year-round',
  heroImage: '',
  description: '',
  theme: {
    accent: '#c8943e',            // gold for user trips
    routeColor: '#7a9e7e',        // sage
    background: '#f5f0e8'         // cream
  },
  days: [
    {
      label: 'Day 1',
      stops: [
        {
          asset: 'Empire Mine',   // must match data.json .n (case-insensitive)
          time: '09:00',          // 24h format
          duration: 90,           // minutes
          narrative: 'Start at the largest hard-rock gold mine.',
          tip: ''                 // optional
        }
      ]
    }
  ]
}
```

**Compatibility table** (verified by reading each function):

| Existing function | File | Works unchanged? | Notes |
|---|---|---|---|
| `resolveItineraryStops(trip, data)` | itinerary-model.js:46 | YES | Matches `stop.asset` vs `data[].n` |
| `flattenStopsForMap(resolved)` | itinerary-model.js:112 | YES | Extracts `{lng, lat, name, stopNumber}` |
| `renderDetailOverlay(trip, resolved)` | itinerary-view.js:192 | YES | Uses `.theme.accent`, `.days`, `.title` |
| `renderStopCard(stop, index, trip, date, accent)` | itinerary-view.js:162 | YES | All fields present |
| `activateItineraryOnMap(id, resolved, trip)` | itinerary-controller.js:229 | YES | Uses corridor-map layers |
| `buildStopCalendarUrl(stop, trip, dateStr)` | itinerary-calendar.js:95 | YES | Needs resolved stop with `.data` |

**What needs changing:** The itinerary controller's `activateItinerary(id)` function (line 59) only looks up itineraries from `state.itineraries` (the pre-loaded `itineraries.json` array). A new `activateUserTrip(trip)` method is needed that accepts an ad-hoc trip object, resolves stops on-the-fly, and calls the existing `activateItineraryOnMap()`. Estimated: ~20 lines.

### Pattern 2: Dream Board localStorage Schema

**What:** Two localStorage keys manage all user data.

```javascript
// Key: 'ncac-dreamboard'
{
  "version": 1,
  "places": [
    {
      "asset": "Empire Mine",           // join key to data.json .n
      "layer": "Historic Landmarks",    // denormalized for offline rendering
      "city": "Grass Valley",           // denormalized
      "addedAt": 1739800000000,         // Date.now()
      "source": "detail"               // "detail" | "explore" | "map" | "event"
    }
  ],
  "events": [
    {
      "title": "Jazz at the Foundry",
      "venue": "Miners Foundry",       // join key to data.json .n
      "date": "2026-02-22T19:00:00",   // ISO string
      "layer": "Performing Arts",
      "addedAt": 1739800100000,
      "source": "event"
    }
  ]
}

// Key: 'ncac-user-trips'
{
  "version": 1,
  "trips": [
    { /* itinerary-schema-compatible trip object */ }
  ]
}
```

**Size budget:** Each place entry ~150 bytes, each event ~200 bytes. At max capacity (30 items + 50 trips), total is ~105KB -- negligible against 5MB localStorage cap.

**Version field strategy:** Always read through `migrateIfNeeded()` to handle schema evolution without data loss.

### Pattern 3: {{ITINERARY}} Response Block Format

**What:** Pipe-delimited structured block that the chatbot outputs and the client parses.

```
{{ITINERARY|Weekend in Gold Country|2-day
DAY|Day 1 -- Downtown Nevada City
STOP|Broad Street Bistro|09:00|60|Start with breakfast on Nevada City's main drag.
STOP|Nevada City Winery|10:30|45|Wine tasting in a historic building.
DAY|Day 2 -- Grass Valley Heritage
STOP|Empire Mine|09:00|120|Tour the largest hard-rock gold mine in California.
}}
```

**Parser integration point:** In `index-maplibre-chat-controller.js`, the `parseResponse()` function (line 163) processes text sequentially: first `[[asset|pid]]` links, then `{{MUSE|id|quote}}` blocks, then `**bold**`, then `\n` to `<br>`. The `{{ITINERARY}}` detection should be added AFTER `{{MUSE}}` and BEFORE `**bold**` conversion, using the regex:

```javascript
var itineraryMatch = html.match(/\{\{ITINERARY\|([^}]*(?:\n[^}]*)*)\}\}/);
```

The parser splits by lines, then splits each line by `|`. Narrative is the last field -- use `parts.slice(4).join('|')` to handle pipes in narrative text.

### Pattern 4: Dream Board Context Injection (Preserves Prompt Cache)

**What:** Dream board contents are passed as a user-message appendix, NOT as a system prompt modification. This preserves the Gemini prompt cache (the system prompt is built once at cold start in `api/chat.js` line 105: `const SYSTEM_PROMPT = buildSystemPrompt()`).

**Client-side:** Before `fetch('/api/chat')`, read `ncac-dreamboard` from localStorage and add `dreamBoard` array to the request payload.

**Server-side:** In the handler, if `req.body.dreamBoard` exists, append a context block to the last user message:

```javascript
const dreamBoard = req.body.dreamBoard;
if (Array.isArray(dreamBoard) && dreamBoard.length > 0) {
  const safeNames = dreamBoard.slice(0, 50).map(n => sanitize(String(n)));
  const contextNote = '\n\nThe user has saved these places to their trip:\n' +
    safeNames.map(n => '- ' + n).join('\n') +
    '\n\nIncorporate these when planning. If they say "plan my trip," use these as the starting set.';
  sanitized[sanitized.length - 1] = {
    role: sanitized[sanitized.length - 1].role,
    content: sanitized[sanitized.length - 1].content + contextNote
  };
}
```

This approach adds ~500 bytes to the user message (for 20 places), well within Gemini's context window.

### Pattern 5: trip.html Page Architecture

**What:** A new standalone page following the pattern of `itineraries.html`, `events.html`, and `directory.html`.

**Key difference from other subpages:** trip.html needs an inline MapLibre GL map. This requires loading the full MapLibre stack and initializing a map instance on the page. The directory.html page already does this -- it loads a subset of the module scripts and creates its own map. trip.html follows the same pattern.

**Two-column layout:**
- Left: Dream board zone (cards, CTA)
- Right: Itinerary zone (empty state or rendered itinerary)
- Below both: Unplanned items zone
- Below that: Inline map showing pins and route

On mobile (<600px): Single column stacked. Dream board, CTA, itinerary, unplanned, map.

### Anti-Patterns to Avoid

- **Do NOT modify the system prompt per-request for dream board context.** This would bust the Gemini prompt cache (system prompt is const at module scope). Pass dream board in the user message.
- **Do NOT build a drag-and-drop reorder UI.** The AI chatbot handles sequencing -- that is its job. Manual reorder contradicts the core product thesis.
- **Do NOT use ES6 import/export.** Project convention is IIFEs with `window.CulturalMap*` globals. No build system exists.
- **Do NOT store coordinates in the dream board.** Coordinates come from `data.json` at resolve time via `resolveItineraryStops()`. Denormalizing coordinates creates stale data risk when data.json updates.
- **Do NOT create a separate chatbot instance for trip planning.** Extend the existing concierge with trip-planning mode. One chatbot, two modes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Itinerary rendering (day tabs, stop cards, time formatting) | Custom trip view components | Existing `CulturalMapItineraryView.renderDetailOverlay()` and `renderStopCard()` | Already handles all edge cases (multi-day tabs, mobile swipe, calendar links, GSAP animations). Schema compatibility means zero view code needed. |
| Map route rendering (numbered stops, animated route line, bounds fit) | Custom map drawing | Existing `activateItineraryOnMap()` -> `CulturalMapCorridorMap` pipeline | Route animation, stop markers, glow layers all implemented. Just pass resolved stops. |
| Calendar export (Google Calendar URL generation) | Custom .ics generation | Existing `CulturalMapItineraryCalendar.buildStopCalendarUrl()` | Handles timezone, duration, location composition. Works for user trips unchanged. |
| Deep link URL parameter codec | Custom URL parser | Existing `parseDeepLinkSearch()` / `serializeDeepLinkSearch()` | Just add `'trip'` to the `scalars` array (2 lines changed). |
| Tooltip HTML for map markers | Custom popup builder | Existing `buildFeatureTooltipHTML()` in map-data-model.js | Adding a bookmark icon to the tooltip HTML is a one-line addition. |
| Asset name resolution | Custom fuzzy matcher | Existing `resolveItineraryStops()` in itinerary-model.js | Case-insensitive exact match, handles missing assets gracefully with console warnings. |

**Key insight:** The itinerary rendering pipeline is the highest-leverage reuse opportunity in this phase. By matching the trip schema to `itineraries.json`, approximately 500+ lines of existing view, map, and calendar code are reused without modification.

## Common Pitfalls

### Pitfall 1: Gemini Produces Malformed {{ITINERARY}} Blocks

**What goes wrong:** The chatbot outputs an itinerary block with missing pipes, extra whitespace, or incorrect field order. The parser crashes or produces garbage.

**Why it happens:** LLMs are probabilistic. Even with explicit format instructions, Gemini will occasionally produce variations (e.g., adding an extra pipe, omitting the time field, wrapping in markdown code fences).

**How to avoid:**
1. System prompt includes the exact format with explicit rules and a complete example
2. Parser is lenient: skip unparseable lines (don't crash), default missing fields (time defaults to '09:00', duration defaults to 60)
3. Handle markdown code fences: strip ` ```itinerary ` and ` ``` ` wrappers before parsing
4. Handle both `{{ITINERARY|...}}` and `{{ ITINERARY | ... }}` (whitespace tolerance)
5. Show a fallback message if parsing fails: "I had trouble formatting that itinerary. Let me try again."

**Warning signs:** Console warnings from `resolveItineraryStops` about unresolved stops. These indicate Gemini used a place name that doesn't match data.json exactly.

### Pitfall 2: Asset Name Mismatches Between Gemini and data.json

**What goes wrong:** Gemini generates stop names like "Empire Mine State Historic Park" but data.json has "Empire Mine". `resolveItineraryStops()` fails to match.

**Why it happens:** Gemini's training data includes full official names; data.json uses shortened display names.

**How to avoid:**
1. System prompt explicitly includes the full asset directory (already done via `knowledgePack.assets`)
2. System prompt instruction: "Place names MUST match the directory exactly (case-insensitive)"
3. Consider a fuzzy fallback in the parser: if exact match fails, try `startsWith` or Levenshtein distance. But this is a v2 enhancement -- for v1, accept the occasional miss and show the name without "Show on Map" button.

**Warning signs:** Console output `[ItineraryModel] Unresolved stop: "..."`.

### Pitfall 3: Stale Events on the Dream Board

**What goes wrong:** User bookmarks an event for Feb 22. On Feb 23, it's past. The dream board shows a stale event with no indication.

**Why it happens:** Events are time-bound; localStorage persists indefinitely.

**How to avoid:**
1. On dream board render, compare each event's date against `DateTime.now()` (Luxon, timezone-aware)
2. Past events get a visual treatment: reduced opacity (0.5), strikethrough on date, small "Past" badge
3. Do NOT auto-delete -- the user may want to remember they were interested in that venue
4. Optionally: a "Clear past events" action at the bottom of the dream board

**Warning signs:** Users seeing events with dates that have passed, with no visual distinction from upcoming events.

### Pitfall 4: Base64 URL Too Long for Complex Trips

**What goes wrong:** A 3-day trip with 15+ stops generates a URL exceeding 2048 characters, breaking on some browsers (especially IE11 and some proxies).

**Why it happens:** Each stop contributes ~100 bytes to the JSON, which base64-encodes to ~130 bytes. 15 stops = ~2000 chars.

**How to avoid:**
1. Compress aggressively: single-letter keys (`t` for title, `d` for days, `a` for asset, etc.) as designed in brainstorm doc
2. Strip narratives from the shared URL (they can be regenerated from the asset name)
3. If encoded URL exceeds 1800 chars, show a warning: "This trip is too long to share via link. Copy the trip details instead."
4. Practical limit: ~12 stops. Covers 1-day (4-5 stops) and 2-day (8-10 stops) comfortably.

**Warning signs:** Share button produces a URL that doesn't work when pasted into a browser.

### Pitfall 5: Cross-Page Dream Board Badge Sync

**What goes wrong:** User adds a place on the hub page, then navigates to events.html. The "My Trip" badge count doesn't update.

**Why it happens:** Each page loads independently. The badge reads localStorage on page load, but there's no live-update mechanism across pages (only across tabs via `storage` event).

**How to avoid:**
1. Read `ncac-dreamboard` on every page load and render the badge count
2. The `storage` event fires when localStorage changes from another tab -- listen for it on all pages
3. For same-tab navigation (user clicks nav link), the page reload naturally refreshes the badge

**Warning signs:** Badge showing stale count after navigating between pages.

### Pitfall 6: trip.html Map Initialization Timing

**What goes wrong:** The map container on trip.html isn't visible when MapLibre tries to initialize, resulting in a zero-size canvas.

**Why it happens:** If the map is below the fold or in a collapsed section, MapLibre can't calculate dimensions.

**How to avoid:**
1. Initialize the map only when the container is visible (use IntersectionObserver)
2. Or initialize immediately but call `map.resize()` when the container becomes visible
3. The directory.html page already handles this -- follow the same pattern

**Warning signs:** Map appears as a blank white rectangle or has incorrect dimensions.

## Code Examples

### Dream Board Model (verified pattern from brainstorm architecture doc)

```javascript
// index-maplibre-dreamboard-model.js
(function() {
  'use strict';

  var STORAGE_KEY = 'ncac-dreamboard';

  function getStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var store = raw ? JSON.parse(raw) : null;
      if (!store || !store.version) return { version: 1, places: [], events: [] };
      return store;
    } catch (e) {
      return { version: 1, places: [], events: [] };
    }
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('[DreamBoard] Failed to save:', e);
    }
  }

  function addPlace(asset) {
    var store = getStore();
    // Deduplicate by asset name (case-insensitive)
    var exists = store.places.some(function(p) {
      return p.asset.toLowerCase() === asset.n.toLowerCase();
    });
    if (exists) return false;
    if (store.places.length + store.events.length >= 30) return false; // hard limit

    store.places.push({
      asset: asset.n,
      layer: asset.l || '',
      city: asset.c || '',
      addedAt: Date.now(),
      source: 'detail'
    });
    saveStore(store);
    return true;
  }

  function removePlace(assetName) {
    var store = getStore();
    store.places = store.places.filter(function(p) {
      return p.asset.toLowerCase() !== assetName.toLowerCase();
    });
    saveStore(store);
  }

  function hasPlace(assetName) {
    var store = getStore();
    return store.places.some(function(p) {
      return p.asset.toLowerCase() === assetName.toLowerCase();
    });
  }

  function getItemCount() {
    var store = getStore();
    return store.places.length + store.events.length;
  }

  window.CulturalMapDreamboardModel = {
    getStore: getStore,
    addPlace: addPlace,
    removePlace: removePlace,
    hasPlace: hasPlace,
    getItemCount: getItemCount
    // addEvent, removeEvent, hasEvent -- same pattern for events
  };
})();
```

### {{ITINERARY}} Parser (verified integration point in chat-controller.js parseResponse())

```javascript
// Added to index-maplibre-chat-controller.js parseResponse():
function parseItineraryBlock(rawContent) {
  var lines = rawContent.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
  if (lines.length < 2) return null;

  // First line is header: "Trip Title|2-day"
  var header = lines[0].split('|');
  var trip = {
    id: 'usr-' + Math.floor(Date.now() / 1000),
    title: header[0] || 'My Trip',
    subtitle: '',
    duration: header[1] || '1-day',
    season: 'year-round',
    heroImage: '',
    description: '',
    created: Date.now(),
    modified: Date.now(),
    theme: { accent: '#c8943e', routeColor: '#7a9e7e', background: '#f5f0e8' },
    days: []
  };

  var currentDay = null;
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i];
    if (line.indexOf('DAY|') === 0) {
      currentDay = { label: line.split('|')[1] || ('Day ' + (trip.days.length + 1)), stops: [] };
      trip.days.push(currentDay);
    } else if (line.indexOf('STOP|') === 0 && currentDay) {
      var parts = line.split('|');
      currentDay.stops.push({
        asset: parts[1] || '',
        time: parts[2] || '09:00',
        duration: parseInt(parts[3], 10) || 60,
        narrative: parts.slice(4).join('|') || '',  // rejoin to handle pipes in narrative
        tip: ''
      });
    }
    // Skip unparseable lines silently (lenient)
  }

  if (trip.days.length > 0) {
    trip.duration = trip.days.length + '-day';
  }
  return trip.days.length > 0 ? trip : null;
}
```

### activateUserTrip() (new method for itinerary-controller.js)

```javascript
// Added to CulturalMapItineraryController:
function activateUserTrip(trip) {
  if (!trip || !trip.days) return;

  // Resolve stops on-the-fly (not pre-resolved like curated itineraries)
  var resolved = itineraryModel.resolveItineraryStops(trip, state.data);
  if (!resolved || !resolved.length) return;

  // Store temporarily for map interaction
  state.resolved[trip.id] = resolved;
  state.activeId = trip.id;

  // Render overlay (reuses existing view entirely)
  var container = state.overlayContainer || document.getElementById('itineraryOverlay');
  if (container) {
    container.innerHTML = itineraryView.renderDetailOverlay(trip, resolved);
    container.classList.add('active');
    // ... same binding logic as activateItinerary() ...
  }

  // Draw route on map (reuses existing pipeline)
  activateItineraryOnMap(trip.id, resolved, trip);
}
```

### Bookmark Icon HTML for Detail Panel

```javascript
// Added to buildDetailMetaHTML or as a separate element in openDetail():
var isBookmarked = window.CulturalMapDreamboardModel &&
  window.CulturalMapDreamboardModel.hasPlace(asset.n);
var bookmarkHTML = '<button class="detail-bookmark-btn' +
  (isBookmarked ? ' active' : '') +
  '" data-asset-name="' + escapeHTML(asset.n) +
  '" aria-label="' + (isBookmarked ? 'Remove from trip' : 'Save to trip') +
  '" title="' + (isBookmarked ? 'Remove from trip' : 'Save to trip') + '">' +
  '<svg class="bookmark-icon" viewBox="0 0 24 24" width="24" height="24">' +
  '<path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"' +
  ' fill="' + (isBookmarked ? '#c8943e' : 'none') + '"' +
  ' stroke="' + (isBookmarked ? '#c8943e' : '#8a8278') + '"' +
  ' stroke-width="2"/></svg></button>';
```

### Deep Link Codec Change (2 lines)

```javascript
// In index-maplibre-core-utils.js, lines 76 and 99:
// BEFORE:
var scalars = ['open', 'events14d', 'experience', 'itinerary', 'muse', 'pid', 'event', 'eventDate', 'eventCat', 'eventAudience'];
// AFTER:
var scalars = ['open', 'events14d', 'experience', 'itinerary', 'muse', 'pid', 'event', 'eventDate', 'eventCat', 'eventAudience', 'trip'];
```

## Codebase Integration Map

### Existing Files Requiring Modification

| File | What Changes | Lines Changed |
|---|---|---|
| `api/chat.js` | Add trip-planning system prompt extension + dream board context injection + `dreamBoard` field in request body | ~35 |
| `index-maplibre-chat-controller.js` | Add `parseItineraryBlock()`, extend `parseResponse()` for `{{ITINERARY}}`, add `saveUserTrip()`, add dream board to fetch payload | ~120 |
| `index-maplibre-chat-view.js` | Add trip-planning style cards (conditional on dream board count), add chat itinerary card rendering, add click handlers | ~60 |
| `index-maplibre-itinerary-controller.js` | Add `activateUserTrip(trip)` method | ~25 |
| `index-maplibre-core-utils.js` | Add `'trip'` to scalars array in both `parseDeepLinkSearch` and `serializeDeepLinkSearch` | ~2 |
| `index-maplibre-detail-view.js` or `detail-controller.js` | Add bookmark button to detail panel | ~20 |
| `index-maplibre-explore-view.js` | Add bookmark icon on directory cards | ~15 |
| `index-maplibre-map-data-model.js` | Add bookmark icon to `buildFeatureTooltipHTML()` | ~5 |
| `index-maplibre-bindings.js` | Bind bookmark delegated click handlers, toast, badge updates | ~30 |
| `index-maplibre.js` | Import new modules, handle `?trip=` deep link, init trip builder | ~20 |
| Hub HTML entry point | Add `<script>` tags for 5 new modules, add "My Trip" nav link with badge | ~12 |
| `events.html`, `itineraries.html`, `directory.html` | Add "My Trip" nav link with badge | ~4 each |

### New Files

| File | Responsibility | Est. Lines |
|---|---|---|
| `index-maplibre-dreamboard-model.js` | localStorage CRUD for dream board (places + events) | ~120 |
| `index-maplibre-dreamboard-view.js` | Bookmark icon rendering, toast notifications, badge count, dream board card HTML | ~150 |
| `index-maplibre-tripbuilder-model.js` | localStorage CRUD for user trips, URL encode/decode, migration | ~180 |
| `index-maplibre-tripbuilder-view.js` | Trip page zones (dream board, itinerary, unplanned), empty states | ~220 |
| `index-maplibre-tripbuilder-controller.js` | Wire dream board to itinerary controller, chatbot handoff, storage events | ~200 |
| `trip.html` | Page shell with nav, two-zone layout, inline map container, script loads | ~250 |

**Grand total: ~1,460 lines** (new ~920 + modified ~540).

## Discretion Recommendations

### Onboarding / First-Use Discoverability

**Recommendation:** Use a one-time text label that appears below the bookmark icon on the first asset the user sees in the detail panel.

```
[bookmark icon] Save to Trip
```

After the user's first bookmark action (or after 3 detail panel opens without bookmarking), replace with icon-only. Track via `localStorage.setItem('ncac-bookmark-seen', '1')`.

**Rationale:** Text labels on every surface create visual noise. A single contextual label on the detail panel (where the icon is largest and most prominent) teaches the interaction once.

### Toast Notification Design

**Recommendation:**
- Bottom-center, 60px from viewport bottom
- Slide up via GSAP (y: 20 -> 0, opacity: 0 -> 1, 200ms)
- Display for 3 seconds, auto-dismiss with fade
- Content: "Empire Mine added to your trip" + "Undo" text link
- Background: `rgba(26,22,18,0.9)` (near-black), white text
- Max one toast at a time (new toast replaces old)
- On mobile: full-width with 1rem side padding

### Badge Count Animation

**Recommendation:**
- Gold circle (#c8943e), 18px diameter, white number, DM Sans 0.68rem bold
- On increment: GSAP scale pulse (1.0 -> 1.25 -> 1.0, 300ms, ease: 'back.out')
- On decrement: no animation (removal is less emotionally charged)
- Badge hidden when count is 0
- Position: top-right of "My Trip" nav link text, offset -8px -4px

### Responsive Breakpoints

**Recommendation:** Follow existing project breakpoints exactly:
- Desktop (>900px): Two-column layout, 55% dream board / 45% itinerary
- Tablet (600-900px): Same columns, tighter gutters, 2-across cards
- Mobile (<600px): Single column stacked, dream board -> CTA -> itinerary -> unplanned

### Item Limits

**Recommendation:** 20 soft / 30 hard (as brainstorm proposed).
- At 20: Gentle inline note below dream board cards: "Great collection! Ready to let the concierge organize it?"
- At 30: Bookmark icon becomes disabled with title tooltip: "Remove a place to add more"
- These limits prevent the Gemini context from being overwhelmed (30 place names = ~600 characters of context)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Manual drag-and-drop trip building (Wanderlog pattern) | AI conversational organizer (MindTrip pattern) | 2024-2025 | AI replaces the most tedious part of trip planning. Users describe preferences; AI handles sequencing, timing, and logistics. |
| JSON response blocks from LLMs | Pipe-delimited structured blocks | Project convention | LLMs produce malformed JSON ~15% of the time. Pipe-delimited format is harder to break and human-readable in chat. |
| Server-side trip storage + accounts | localStorage + URL sharing | Project convention | No auth complexity, no server state, instant UX. Trade-off: data is device-local. |

## Open Questions

1. **Map initialization on trip.html**
   - What we know: trip.html needs an inline MapLibre map. Directory.html already does this with a subset of modules.
   - What's unclear: Exactly which modules trip.html needs to load. The full hub page loads 36+ scripts. Trip.html needs only the map init, data model, corridor map, and trip builder modules.
   - Recommendation: During planning, audit which modules are required and create a minimal script set for trip.html. Estimate: 15-20 scripts (vs 36+ on hub).

2. **Event bookmarking schema and stale detection**
   - What we know: User decided both venues AND events are bookmarkable. Events have dates. Past events should be visually distinguished.
   - What's unclear: Should events be stored as separate items (with date/time) or should booking an event just bookmark the venue? The brainstorm UX doc (01-ux-flows.md line 93) says "the bookmark saves the *venue*" for events, but the CONTEXT.md explicitly says "events carry date/time context."
   - Recommendation: Store events as separate entries with date, venue reference, and title. Render them distinctly from place bookmarks (show date, show "Past" badge). The chatbot receives both places and events, using event dates to inform timing.

3. **Chat panel location on trip.html**
   - What we know: The brainstorm UX doc (01-ux-flows.md lines 330-348) proposes the chat opens in-page, replacing the itinerary column. The existing chat is a floating FAB panel.
   - What's unclear: Should trip.html use the in-page chat (as designed) or reuse the existing FAB chat widget?
   - Recommendation: Use the existing FAB chat widget for v1 (it works, it's tested, it handles mobile). The in-page chat is a nice-to-have that adds significant layout complexity. The chat can still be pre-seeded with dream board context regardless of its visual location.

4. **"Make it mine" bridge from curated itineraries**
   - What we know: User wants a button on curated itineraries that copies stops into the dream board.
   - What's unclear: Does it copy ALL stops (potentially 7-8) at once? Does it navigate to trip.html after copying?
   - Recommendation: Copy all stops at once (simpler, matches competitive analysis finding "subtraction over addition"). Show a toast: "7 places added to your dream board" with a "View Trip" link that navigates to trip.html.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `index-maplibre-itinerary-model.js`, `index-maplibre-itinerary-controller.js`, `index-maplibre-itinerary-view.js` -- confirmed schema compatibility
- Codebase inspection: `api/chat.js` -- confirmed system prompt structure and Gemini integration
- Codebase inspection: `index-maplibre-chat-controller.js` -- confirmed `parseResponse()` integration points
- Codebase inspection: `index-maplibre-core-utils.js` -- confirmed deep link codec scalars array
- Codebase inspection: `index-maplibre-itinerary-calendar.js` -- confirmed calendar export compatibility
- Codebase inspection: `index-maplibre-map-data-model.js` -- confirmed tooltip HTML structure
- Codebase inspection: `index-maplibre-detail-view.js` / `detail-controller.js` -- confirmed detail panel structure
- Codebase inspection: HTML entry point script tags (lines 528-577) -- confirmed load order
- Brainstorm docs: `.planning/brainstorm/trip-builder/01-ux-flows.md` -- UX flow design
- Brainstorm docs: `.planning/brainstorm/trip-builder/02-technical-architecture.md` -- schema and implementation architecture
- Brainstorm docs: `.planning/brainstorm/trip-builder/03-competitive-analysis.md` -- competitive landscape
- Brainstorm docs: `.planning/brainstorm/trip-builder/04-editorial-design.md` -- editorial voice and visual design
- Phase CONTEXT.md: `.planning/phases/08-ai-trip-builder/08-CONTEXT.md` -- user decisions

### Secondary (MEDIUM confidence)
- Competitive analysis (from brainstorm team): Wanderlog two-zone pattern, MindTrip conversational AI, Visit a City subtraction-first pattern -- validated the architectural approach
- LLM JSON failure rate (~15%) -- sourced from brainstorm architecture doc, consistent with general LLM engineering experience

### Tertiary (LOW confidence)
- None. All findings verified against codebase or brainstorm docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all verified in codebase
- Architecture: HIGH -- itinerary schema compatibility verified line-by-line against existing functions
- Pitfalls: HIGH -- identified from both codebase analysis and brainstorm team risk assessment
- Integration points: HIGH -- every file modification verified by reading the actual code

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days -- stable vanilla JS project, no dependency churn)
