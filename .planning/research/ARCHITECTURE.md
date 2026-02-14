# Architecture Research

**Domain:** Cultural tourism interactive platform — adding analytics, itinerary, event aggregation, chatbot, and reporting modules to existing 37-module vanilla JS IIFE architecture on static Vercel site
**Researched:** 2026-02-14
**Confidence:** HIGH

## System Overview

```
                          EXISTING SITE (static Vercel)
┌─────────────────────────────────────────────────────────────────────┐
│                       Browser (Client-Side)                         │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │ Analytics │  │Itinerary │  │  Chat UI   │  │ Existing 37      │   │
│  │  Module   │  │ Module   │  │  Widget    │  │ IIFE Modules     │   │
│  │ (wrapper) │  │ (MVC)    │  │ (floating) │  │ (map, events,    │   │
│  └─────┬────┘  └────┬─────┘  └─────┬──────┘  │  explore, etc.)  │   │
│        │            │               │         └────────┬─────────┘   │
│        │            │               │                  │             │
│  ┌─────┴────────────┴───────────────┴──────────────────┴──────────┐  │
│  │              window.CulturalMap* Namespace + ctx object         │  │
│  └────────────────────────────────┬───────────────────────────────┘  │
│                                   │                                  │
├───────────────────────────────────┼──────────────────────────────────┤
│                         Data Layer (fetch)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │data.json │  │events.   │  │itinerary │  │ muse_editorials   │   │
│  │          │  │json      │  │s.json    │  │ .json + others    │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │                │                │
         │   ┌────────────┴────────┐       │
         │   │  Vercel Edge / API  │       │
         │   ├────────────────────-┤       │
         │   │ /api/chat           │───────┤──→ Google Gemini API
         │   │ /api/report         │───────┤──→ Plausible Stats API
         │   └─────────┬──────────-┘       │
         │             │                   │
         │   ┌─────────┴──────────┐        │
         │   │     Supabase       │        │
         │   │ (chat logs, usage) │        │
         │   └────────────────────┘        │
         │                                 │
         │   ┌─────────────────────────┐   │
         │   │  Plausible Analytics    │   │
         │   │  (external SaaS)        │   │
         │   └─────────────────────────┘   │
         │                                 │
    ┌────┴─────────────────────────────┐   │
    │  GitHub Actions (cron)           │   │
    │  ┌────────────────────────────┐  │   │
    │  │ iCal event aggregator      │──┼───┘
    │  │ → events.json              │  │
    │  │ → events.index.json        │  │
    │  └────────────────────────────┘  │
    │  ┌────────────────────────────┐  │
    │  │ Reporting aggregator       │  │
    │  │ → Plausible + Supabase    │  │
    │  │ → summary email / log     │  │
    │  └────────────────────────────┘  │
    └──────────────────────────────────┘
```

## Component Responsibilities

### New Modules (Client-Side)

| Component | Namespace | Responsibility | Communicates With |
|-----------|-----------|----------------|-------------------|
| Analytics Module | `CulturalMapAnalytics` | Provider-agnostic event tracking wrapper; throttling; queue | Plausible script (external), all existing modules via ctx hooks |
| Itinerary Model | `CulturalMapItineraryModel` | Itinerary state: selected items, day slots, save/load | Config, data.json items, localStorage |
| Itinerary View | `CulturalMapItineraryView` | Render itinerary cards in hero, day planner UI, print view | Itinerary Model, Detail Controller (for openDetail) |
| Itinerary Controller | `CulturalMapItineraryController` | Coordinate add/remove/reorder, map route drawing, deep links | Itinerary Model, Itinerary View, Map Render Controller, Analytics |
| Chat Widget | `CulturalMapChatWidget` | Floating chat UI, message rendering, typing indicators | Vercel `/api/chat` endpoint, Detail Controller (deep links from responses) |

### New Server-Side (Vercel `/api/` directory)

| Component | Path | Responsibility | Communicates With |
|-----------|------|----------------|-------------------|
| Chat Proxy | `/api/chat.js` | Proxy chat requests to Gemini API; inject system prompt with asset data context; rate limit | Google Gemini API, Supabase (chat logging) |
| Report Endpoint | `/api/report.js` | Aggregate Plausible stats + Supabase usage into summary JSON | Plausible Stats API, Supabase |

### New Offline/Cron (GitHub Actions)

| Component | Script | Responsibility | Communicates With |
|-----------|--------|----------------|-------------------|
| iCal Event Aggregator | `scripts/events/aggregate-ical.mjs` | Fetch iCal feeds from multiple sources, merge, dedupe, geocode venues, output events.json | iCal endpoints (Trumba, etc.), existing events.json format |
| Reporting Cron | `scripts/reporting/weekly-report.mjs` | Pull Plausible API + Supabase metrics, format summary | Plausible Stats API, Supabase, (optional: email via Resend/SendGrid) |

## Integration Architecture: How New Modules Plug Into Existing IIFE System

### The ctx Object Pattern (Critical Integration Surface)

The existing architecture's primary integration point is the `ctx` object. The main entry point (`index-maplibre.js`) constructs a context bag with closures over module-private state, then passes it to `bindings.bindEvents(ctx)`, `detailController.openDetail(ctx)`, `exploreControllerModule.createExploreController(ctx)`, etc.

**New modules integrate by:**
1. Exposing their public API on `window.CulturalMap*` (same IIFE pattern)
2. Being imported in `index-maplibre.js` at the top (same `const analytics = window.CulturalMapAnalytics || {}`)
3. Receiving the `ctx` bag in their init/bind calls (same factory/controller pattern)
4. Never directly accessing other modules' state — always through ctx closures

```javascript
// NEW MODULE: index-maplibre-analytics.js
(function() {
  'use strict';

  var queue = [];
  var provider = null;
  var throttleTimers = {};

  function init(options) {
    // options.provider = 'plausible' | 'debug'
    provider = options.provider || 'plausible';
  }

  function track(eventName, props) {
    // Throttle: max 1 event of same name per 2 seconds
    if (throttleTimers[eventName]) return;
    throttleTimers[eventName] = setTimeout(function() {
      delete throttleTimers[eventName];
    }, 2000);

    if (provider === 'plausible' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: props });
    }
    // Always log to console in dev
    if (location.hostname === 'localhost') {
      console.log('[Analytics]', eventName, props);
    }
  }

  window.CulturalMapAnalytics = {
    init: init,
    track: track
  };
})();
```

### Analytics Hook Points (Wiring Into Existing Code)

Analytics hooks wire into the existing `bindEvents()` function in `index-maplibre.js`. The current `bindEvents()` call at line ~2696 passes a ctx bag to `bindings.bindEvents()`. Analytics tracking calls go **inside the ctx closures** — not in the bindings module.

**12 Event Types and Where They Hook:**

| Event | Hook Location | How |
|-------|---------------|-----|
| `page_view` | Auto (Plausible script) | Plausible handles this natively |
| `category_filter` | `setCategory()` in index-maplibre.js | Add `analytics.track('category_filter', {cat: cat})` |
| `open_now_toggle` | `setOpenNowMode()` in index-maplibre.js | Add tracking call inside |
| `detail_open` | `openDetail()` in index-maplibre.js | Track asset name + category |
| `experience_start` | `activateExperience()` in index-maplibre.js | Track experience slug |
| `event_click` | `focusEventById()` / `focusEvent()` in bindings | Track event title |
| `search_query` | searchInput handler in bindings.js | Track debounced query (no PII) |
| `itinerary_add` | New itinerary controller | Track asset added |
| `itinerary_share` | New itinerary controller | Track share action |
| `chat_message` | New chat widget | Track message sent (not content) |
| `muse_editorial_open` | `openMuseStory()` in index-maplibre.js | Track editorial ID |
| `deep_link_arrive` | `applyDeepLinkFromLocation()` | Track which param type arrived |

### Itinerary Module Integration

The itinerary system adds 3 new files following the existing MVC-ish pattern:

```
index-maplibre-itinerary-model.js      ← State: items[], day assignments, localStorage persistence
index-maplibre-itinerary-view.js       ← HTML generation: hero cards, day planner, print layout
index-maplibre-itinerary-controller.js ← Coordination: add/remove, route drawing, deep links
```

**Data file:** `itineraries.json` — Pre-built itinerary templates (1-day, 2-day, 3-day) referencing assets by name or pid. Loaded in `Promise.all` alongside existing data files.

**Hero integration:** The hero section (`index-maplibre-hero-intent.html`) gains a fifth discovery tab: "Plan a Trip." The itinerary view renders into a new `<section class="intent-pane" id="intentPaneItinerary">` element.

**Map integration:** When an itinerary is active, the controller calls existing `mapRenderController` to highlight stops and uses Turf.js (already loaded) to draw connecting route lines — same pattern as experience routes.

**Detail panel integration:** The detail panel gains an "Add to Itinerary" button. The itinerary controller exposes `addToItinerary(asset)` on the ctx bag. The detail controller calls it when the button is clicked.

### Chat Widget Integration

```
index-maplibre-chat-widget.js  ← Single file: UI + fetch to /api/chat
```

The chat widget is a self-contained floating UI element. It:
1. Renders a FAB (floating action button) in the bottom-right corner
2. Expands to a chat panel on click
3. Sends messages to `/api/chat` (Vercel serverless function)
4. Receives responses that may contain deep-link references to assets
5. Parses response for `[asset:NAME]` or `[event:ID]` tokens and renders them as clickable links
6. On link click, calls `ctx.openDetail(asset)` or `ctx.focusEventById(id)` — reusing existing functions

**Server-side proxy (`/api/chat.js`):**
```javascript
// api/chat.js — Vercel Serverless Function (NOT edge, needs Node.js for fetch)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history } = req.body;
  // Rate limit by IP (simple in-memory, resets on cold start)
  // System prompt includes: asset categories, example names, deep-link format
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
    })
  });

  // Log to Supabase (async, don't block response)
  // Return response to client
}
```

**Vercel project structure change:**
```
website/cultural-map-redesign/
├── api/
│   ├── chat.js          ← Gemini proxy + Supabase logging
│   └── report.js        ← Plausible + Supabase aggregation
├── index-maplibre-chat-widget.js
├── ... (existing files)
```

The `/api/` directory is auto-detected by Vercel as serverless functions. No framework needed. The `vercel.json` redirects continue working alongside the api routes.

### iCal Event Pipeline Integration

The event aggregator runs as a GitHub Actions cron job (not client-side). It:
1. Fetches iCal feeds from configured sources
2. Parses events, deduplicates, geocodes venues against existing data.json
3. Outputs `events.json` and `events.index.json` in the same format the client already expects
4. Commits updated files to the repo (triggering Vercel redeploy)

**The client code needs ZERO changes for Tier 2 events.** The existing `index-maplibre-events-model.js` already loads from `events.json` and `events.index.json`. The pipeline just enriches those files with more events from more sources.

**Fallback:** If the cron fails, the existing Trumba RSS fetch (`events.xml`) still works as the client-side runtime fallback. The events model can merge both sources.

### Reporting Script Integration

A Node.js script (`scripts/reporting/weekly-report.mjs`) runs via GitHub Actions cron (weekly). It:
1. Queries Plausible Stats API for page views, top pages, custom event counts
2. Queries Supabase for chat usage metrics, itinerary saves
3. Aggregates into a summary JSON
4. Optionally sends email digest or writes to a Supabase `reports` table

This has NO client-side footprint. It is purely a backend/ops concern.

## Data Flow

### Analytics Flow

```
User interacts with map/filters/detail
    ↓
ctx closure calls analytics.track(eventName, props)
    ↓
CulturalMapAnalytics throttles (2s per event type)
    ↓
window.plausible(eventName, {props}) → Plausible SaaS (external)
```

### Itinerary Flow

```
User clicks "Add to Itinerary" in detail panel
    ↓
detailController → ctx.addToItinerary(asset)
    ↓
ItineraryController.addItem(asset)
    ↓
ItineraryModel: push to items[], persist to localStorage
    ↓
ItineraryView: re-render hero card count + day planner
    ↓
ItineraryController: update map route line via mapRenderController
    ↓
Analytics.track('itinerary_add', {asset: asset.n, category: asset.l})
```

### Chat Flow

```
User types message in chat widget
    ↓
CulturalMapChatWidget → POST /api/chat {message, history}
    ↓
Vercel serverless function:
  - Injects system prompt with asset context
  - Calls Gemini API
  - Logs to Supabase (fire-and-forget)
  - Returns {response, deep_links[]}
    ↓
Chat widget renders response
  - Parses [asset:NAME] tokens → clickable chips
  - On click → ctx.openDetail(asset) or ctx.focusEventById(id)
```

### Event Aggregation Flow

```
GitHub Actions cron (every 6 hours)
    ↓
scripts/events/aggregate-ical.mjs
  - Fetch iCal feeds (Trumba, community calendars)
  - Parse with ical.js
  - Geocode venues against data.json (fuzzy match)
  - Deduplicate by title + date + venue
  - Merge with existing events
    ↓
Output: events.json + events.index.json (committed to repo)
    ↓
Vercel auto-deploys on push
    ↓
Client loads updated events.json at runtime (existing flow, unchanged)
```

## Recommended Project Structure (New Files Only)

```
website/cultural-map-redesign/
├── api/                                         # Vercel serverless functions
│   ├── chat.js                                  # Gemini API proxy
│   └── report.js                                # Plausible + Supabase aggregation
├── index-maplibre-analytics.js                  # Analytics wrapper module
├── index-maplibre-itinerary-model.js            # Itinerary state + localStorage
├── index-maplibre-itinerary-view.js             # Itinerary UI rendering
├── index-maplibre-itinerary-controller.js       # Itinerary coordination
├── index-maplibre-chat-widget.js                # Chat floating UI + API fetch
├── itineraries.json                             # Pre-built itinerary templates
scripts/
├── events/
│   ├── aggregate-ical.mjs                       # iCal feed aggregator
│   ├── ical-sources.json                        # Feed URL configuration
│   └── venue-geocoder.mjs                       # Match venues to data.json
├── reporting/
│   └── weekly-report.mjs                        # Plausible + Supabase digest
.github/
└── workflows/
    ├── aggregate-events.yml                     # Cron: every 6 hours
    └── weekly-report.yml                        # Cron: weekly Monday AM
```

### Structure Rationale

- **`api/` inside the Vercel deploy root:** Vercel auto-detects this directory. No config needed. Functions are deployed alongside static files.
- **New modules follow `index-maplibre-*.js` naming:** Consistent with existing 37 modules. Load order controlled in HTML.
- **Scripts stay in repo `scripts/` directory:** Not deployed to Vercel. Run via GitHub Actions or locally.
- **No new build system:** All new client modules are vanilla JS IIFEs. No bundler, no transpiler. Consistent with project decision.

## Architectural Patterns

### Pattern 1: Provider-Agnostic Analytics Wrapper

**What:** A thin wrapper module that abstracts the analytics provider behind `track(eventName, props)`. Internally delegates to Plausible's `window.plausible()` function but can swap to any provider.

**When to use:** Always. Never call `window.plausible()` directly from business logic.

**Trade-offs:** Slight indirection (trivial), but gains: testability (mock the wrapper), provider swap (change one file), throttling (centralized), and dev-mode logging (console.log when localhost).

```javascript
// Usage in existing code (inside index-maplibre.js closures):
var analytics = window.CulturalMapAnalytics || { track: function() {} };

function setCategory(cat) {
  // ... existing logic ...
  analytics.track('category_filter', { category: cat, active: activeCategories.has(cat) });
}
```

### Pattern 2: Lazy Module Init via ctx Bag Extension

**What:** New modules register on the window namespace, get imported at the top of `index-maplibre.js`, and receive ctx properties in `init()`. The ctx bag is extended with new closures for new capabilities.

**When to use:** For every new module that needs to interact with existing state.

**Trade-offs:** The ctx bag grows larger (already ~40 properties). This is manageable but documents the need for an eventual ctx interface contract.

```javascript
// In index-maplibre.js init():
var itineraryController = itineraryControllerModule.createItineraryController({
  data: DATA,
  map: map,
  openDetail: openDetail,
  analytics: analytics,
  // ... other ctx properties
});

// Extend the bindEvents ctx with itinerary actions:
bindings.bindEvents({
  // ... existing ctx properties ...
  addToItinerary: itineraryController.addItem,
  removeFromItinerary: itineraryController.removeItem,
  getItineraryItems: itineraryController.getItems
});
```

### Pattern 3: Vercel Serverless as API Proxy (No Framework)

**What:** Place `.js` files in `api/` directory. Vercel auto-deploys them as serverless functions. They proxy requests to external APIs (Gemini, Plausible Stats), keeping API keys server-side.

**When to use:** For any operation requiring secret API keys (Gemini, Supabase service key, Plausible API token).

**Trade-offs:** Cold starts (~200-500ms for Node.js functions). Hobby tier limit: 100GB-hours/month, 12 serverless functions max (we need 2). No persistent state between invocations.

```javascript
// api/chat.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cultural-map-redesign.vercel.app');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_KEY = process.env.GEMINI_API_KEY; // Set in Vercel dashboard
  // ... proxy logic ...
}
```

### Pattern 4: Cron-Generated Static Data (Build-Time Events)

**What:** GitHub Actions cron runs a Node.js script that fetches external data (iCal feeds), processes it, and commits the output as static JSON files to the repo. Vercel redeploys automatically.

**When to use:** For any data that changes infrequently (events update every few hours) and doesn't need real-time freshness.

**Trade-offs:** 6-hour staleness window for events. But: eliminates CORS issues with iCal feeds, removes client-side parsing overhead, and the client code needs zero changes.

## Anti-Patterns

### Anti-Pattern 1: Direct DOM Manipulation from New Modules

**What people do:** New modules directly query and modify DOM elements owned by other modules.
**Why it's wrong:** Creates invisible coupling. When the detail panel HTML changes, the chat widget breaks because it was reaching into `#detailName` directly.
**Do this instead:** Communicate through the ctx bag. Chat widget calls `ctx.openDetail(asset)` — it never touches the detail panel DOM.

### Anti-Pattern 2: ES6 Module Syntax in New Files

**What people do:** Use `import`/`export` in new module files since "it's 2026."
**Why it's wrong:** The existing 37 modules all use IIFEs with `window.*` globals. Mixing `import`/`export` with script-tag loading creates two incompatible module systems. Either all modules migrate or none do.
**Do this instead:** Use the same IIFE + `window.CulturalMap*` pattern. The decision to avoid a build system is already made and documented.

### Anti-Pattern 3: Putting API Keys in Client-Side Code

**What people do:** Hardcode Gemini API key in the chat widget JS file (like the MapTiler key).
**Why it's wrong:** Gemini API has per-request cost. MapTiler free tier is acceptable to expose; Gemini is not.
**Do this instead:** Proxy through `/api/chat.js`. The API key lives in Vercel environment variables, never in client code.

### Anti-Pattern 4: Building a Full Chat Backend

**What people do:** Implement conversation threading, user authentication, message persistence with real-time sync for the chat feature.
**Why it's wrong:** This is a cultural tourism discovery tool, not a chat application. The chat is a convenience feature for "What should I do this weekend?" questions.
**Do this instead:** Stateless chat proxy. Send conversation history in each request (last 10 messages). Log to Supabase for analytics only. No user accounts, no persistent threads.

### Anti-Pattern 5: Analytics in the Bindings Module

**What people do:** Add analytics.track() calls inside `index-maplibre-bindings.js` event handlers.
**Why it's wrong:** Bindings is a wiring module — it maps DOM events to ctx functions. Analytics should fire from the business logic (the ctx closures in index-maplibre.js), not the event handlers.
**Do this instead:** Add tracking calls inside the functions that bindings calls (e.g., inside `setCategory()`, `openDetail()`, `activateExperience()`).

## Scaling Considerations

| Concern | Current (100 users/day) | At 1K users/day | At 10K users/day |
|---------|------------------------|-----------------|------------------|
| Static assets | Vercel CDN handles it | No change | No change |
| Analytics | Plausible handles all scale | No change | Check Plausible plan limits |
| Chat API | ~50 chats/day, Vercel hobby OK | ~500 chats/day, monitor Gemini costs | Need Vercel Pro + Gemini budget |
| Event pipeline | 6h cron, ~5 iCal feeds | No change | No change |
| Supabase | Free tier (500MB, 50K rows) | Still fine | Check row limits on chat logs |

### Scaling Priorities

1. **First bottleneck: Gemini API costs.** Chat is the only feature with per-interaction API cost. Mitigation: aggressive client-side rate limiting (max 20 messages/session), response caching for common queries, and a hard daily budget cap in the proxy.
2. **Second bottleneck: Vercel serverless function invocations.** Hobby plan has limits. If chat usage grows, upgrade to Pro ($20/mo) or add client-side caching of recent responses.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Plausible Analytics | `<script>` tag + `window.plausible()` calls | < 1KB script, privacy-friendly, no cookies. Self-hosted or cloud. |
| Google Gemini API | Server-side proxy via `/api/chat.js` | API key in Vercel env vars. Use `gemini-2.0-flash` for cost efficiency. |
| Supabase | `@supabase/supabase-js` in serverless functions; anon key in client for read-only | Service key in serverless only. Client gets anon key with RLS. |
| iCal Feeds | Server-side fetch in GitHub Actions script | No CORS issues since it runs in CI, not browser. |
| Plausible Stats API | Server-side only (in `/api/report.js` and cron script) | Bearer token auth. Never expose to client. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Analytics <-> All Modules | `analytics.track()` calls from ctx closures | One-way: modules fire events, analytics sends them. Analytics never calls back. |
| Itinerary <-> Detail Panel | `ctx.addToItinerary(asset)` closure | Detail panel button triggers; itinerary controller handles. No direct coupling. |
| Itinerary <-> Map | `mapRenderController.applyAssetFilters()` + Turf.js route lines | Same pattern as existing experience routes. |
| Chat Widget <-> `/api/chat` | `fetch('/api/chat', {method: 'POST'})` | Standard REST. No WebSocket needed. |
| Chat Widget <-> Detail/Map | `ctx.openDetail(asset)` / `ctx.focusEventById(id)` | Chat parses response tokens, calls existing ctx functions. |
| Event Pipeline <-> Client | Static JSON files (events.json) | No runtime coupling. Pipeline writes files; client reads them. |
| Reporting <-> Everything | Read-only aggregation | Reads from Plausible API + Supabase. Never writes to client-facing data. |

## Build Order (Dependency Chain)

```
Phase 1: Analytics Module
    (no dependencies on other new modules; enables measurement for everything after)
    ↓
Phase 2: iCal Event Pipeline
    (no client changes; enriches existing events data; analytics tracks event interactions)
    ↓
Phase 3: Itinerary System
    (depends on: analytics for tracking; uses existing map/detail infrastructure)
    ↓
Phase 4: Chat Widget + Vercel API Proxy
    (depends on: analytics for tracking; references itinerary if built;
     needs Supabase setup; most complex new server-side code)
    ↓
Phase 5: Reporting Script
    (depends on: analytics being live for data; Supabase having chat logs;
     pure backend, no client changes)
```

**Rationale:** Analytics goes first because every subsequent feature benefits from measurement. Event pipeline is independent infrastructure work with zero client risk. Itinerary is the highest-value user feature and only needs existing infrastructure. Chat requires the most new server-side setup (Vercel functions, Supabase, Gemini). Reporting comes last because it needs data from all other features to be meaningful.

## Sources

- Vercel Edge Functions docs: https://vercel.com/docs/functions/runtimes/edge/edge-functions.rsc (MEDIUM confidence)
- Vercel Functions general docs: https://vercel.com/docs/functions (MEDIUM confidence)
- Vercel API proxy pattern: https://github.com/simple-frontend-dev/vercel-functions-api-proxy (MEDIUM confidence)
- Plausible script integration: https://plausible.io/docs/plausible-script (HIGH confidence — official docs)
- Plausible custom events: https://plausible.io/docs/custom-event-goals (HIGH confidence — official docs)
- Plausible custom properties: https://plausible.io/docs/custom-props/for-custom-events (HIGH confidence — official docs)
- Existing codebase analysis: `index-maplibre.js`, `index-maplibre-bindings.js`, `index-maplibre-events-model.js`, `index-maplibre-detail-controller.js`, `index-maplibre-config.js`, `index-maplibre-hero-intent.html`, `vercel.json` (HIGH confidence — direct code reading)

---
*Architecture research for: GVNC Cultural District Experience Platform — Milestone 2 Module Integration*
*Researched: 2026-02-14*
