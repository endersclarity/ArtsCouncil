# Stitch-Lab Codebase Audit for Arts Hub Cherry-Picking

Audited: `website/cultural-map-redesign-stitch-lab/`
Date: 2026-03-14

---

## 1. File Inventory

### Core JavaScript Modules (~40 files)
All use the IIFE + `window.CulturalMap*` namespace pattern. No build tooling — plain browser JS.

| File | Purpose | Lines |
|------|---------|-------|
| `index-maplibre-config.js` | Category taxonomy, SVG icons, MapTiler key, intent groups, demo picks | ~180 |
| `index-maplibre-core-utils.js` | `hexToRgba`, `escapeHTML`, `isValidCountyCoord`, deep-link parse/serialize, `normalizeCategory`, `extractCityFromAddress` | ~160 |
| `index-maplibre-map-init-model.js` | MapLibre style URL builder (MapTiler landscape + CARTO fallback), map init options (center, zoom, pitch) | ~65 |
| `index-maplibre-map-data-model.js` | GeoJSON builder for assets, county outline layer, tooltip HTML, category icon keys | ~170 |
| `index-maplibre-map-filter-model.js` | Category filter state machine | small |
| `index-maplibre-map-interaction-model.js` | Click/hover handlers on map features | small |
| `index-maplibre-map-style-model.js` | Dim/highlight paint mutations for category filtering | small |
| `index-maplibre-map-scroll-observer.js` | IntersectionObserver to lazy-init map on scroll | small |
| `index-maplibre-map-render-controller.js` | Marker layer rendering, symbol layers, label collision | medium |
| `index-maplibre-map-label-controller.js` | Progressive text labels on map at zoom thresholds | small |
| `index-maplibre-asset-layer-defs.js` | MapLibre layer paint/layout definitions for asset dots | ~50 |
| `index-maplibre-asset-interactions.js` | Click-to-detail, hover popup logic | ~100 |
| `index-maplibre-events-model.js` | Venue-to-event matching, fuzzy token overlap, recurring event dedup, filtered events pipeline | ~445 |
| `index-maplibre-events-view.js` | Event card HTML, event row HTML, image fallback resolution | ~220 |
| `index-maplibre-events-controller.js` | Featured event rotation, date filter wiring | ~100 |
| `index-maplibre-events-carousel.js` | Auto-rotating featured event carousel | ~100 |
| `index-maplibre-events-filter-ui.js` | Date chip UI (today/tonight/weekend/14d/family) | small |
| `index-maplibre-events-search.js` | Fuzzy text search across event titles/venues | small |
| `index-maplibre-events-utils.js` | `parseEventDate`, `formatEventDateRange`, `isEventUpcoming`, `isEventToday`, `isEventTonight`, `isWeekendEvent` | ~100 |
| `index-maplibre-hours-utils.js` | Business hours parser — `getHoursState()`, `isOpenAtNow()`, handles Google Places hour strings | ~125 |
| `index-maplibre-geolocation-model.js` | Haversine distance, geolocation control options, auto-trigger | ~115 |
| `index-maplibre-detail-view.js` | Detail panel HTML builders (hero, meta, experience badges, fly-to button), GSAP open/close | ~120 |
| `index-maplibre-detail-controller.js` | Detail panel orchestration | small |
| `index-maplibre-explore-model.js` | Directory filtering (search, city, category, open-now, events-14d) | ~80 |
| `index-maplibre-explore-view.js` | Directory card rendering, category grid, city pills | ~150 |
| `index-maplibre-explore-controller.js` | Wires explore model+view, search debounce, analytics | ~260 |
| `index-maplibre-dreamboard-model.js` | localStorage bookmark store (places + events, 30-item limit, dedup) | ~185 |
| `index-maplibre-dreamboard-view.js` | Bookmark button rendering, badge count, toast notifications | ~250 |
| `index-maplibre-tripbuilder-model.js` | User trips localStorage CRUD, URL encode/decode for sharing | ~245 |
| `index-maplibre-tripbuilder-view.js` | Trip page rendering, day/stop cards, map route display | medium |
| `index-maplibre-tripbuilder-controller.js` | Trip builder orchestration | small |
| `index-maplibre-chat-controller.js` | AI concierge — Gemini API calls, `{{ITINERARY}}` block parser, message state | ~400 |
| `index-maplibre-chat-view.js` | Chat panel HTML, message bubbles, typing indicator | ~250 |
| `index-maplibre-chat-widget.js` | FAB button, panel toggle, keyboard shortcuts | ~100 |
| `index-maplibre-bindings.js` | DOM event delegation hub — wires all click/input handlers to the context object | ~390 |
| `index-maplibre-analytics.js` | Umami wrapper with dedup throttle, session hash, outbound URL tagging | ~130 |
| `index-maplibre-experience-model.js` | Experience/corridor data model | small |
| `index-maplibre-experience-view.js` | Experience panel rendering | small |
| `index-maplibre-experience-controller.js` | Corridor tour orchestration, auto-fly between stops | ~200 |
| `index-maplibre-corridor-map.js` | Corridor route polyline rendering on map | small |
| `index-maplibre-itinerary-model.js` | Itinerary data loader from `itineraries.json` | small |
| `index-maplibre-itinerary-view.js` | Itinerary day/stop card rendering | medium |
| `index-maplibre-itinerary-calendar.js` | Calendar export for itinerary stops | small |
| `index-maplibre-itinerary-controller.js` | Itinerary page orchestration | small |
| `index-maplibre-deeplink-bridge.js` | URL state restore on page load | small |
| `index-maplibre-filter-state-model.js` | Filter state management | small |
| `index-maplibre-filter-ui.js` | Filter pill/chip rendering | small |
| `index-maplibre-lodging-section.js` | Lodging cards with VRBO deep links | small |
| `index-maplibre-email-capture.js` | Email signup form handler | small |
| `index-maplibre-page-effects.js` | Scroll animations, hero carousel auto-rotate | small |
| `index-maplibre-photo-carousel.js` | Photo carousel for detail panel | small |
| `index-maplibre-catalog-view.js` | Catalog/grid layout view | small |
| `index-maplibre-tour-utils.js` | Tour utilities for experience corridors | small |
| `index-maplibre.js` | Main orchestrator — boots everything, loads data, wires modules | large |

### HTML Pages
| File | Purpose |
|------|---------|
| `index-maplibre-hero-intent-stitch-frontend-design-pass.html` | **Current production homepage** — magazine editorial layout |
| `index-maplibre-hero-intent.html` | Canonical homepage (functional wiring target) |
| `directory.html` | Business directory page |
| `events.html` | Events listing page |
| `itineraries.html` | Curated itineraries page |
| `trip.html` | My Trip / dreamboard page |
| `submit-event.html` | Community event submission form |
| `qr-gallery.html` | QR code demo flyers |
| ~20 variant HTML files | Design explorations (atelier-pop, brutalist-signal, chromafold, etc.) — NOT needed |

### CSS
| File | Purpose |
|------|---------|
| `index-maplibre.css` | Base styles — CSS custom properties, map, detail panel, cards, tooltips, explore grid |
| `index-maplibre-hero-intent.css` | Intent-based hero layout styles |
| `index-maplibre-hero-intent-stitch-frontend-design-pass.css` | Production design pass overrides — cover grid, mast, district spread |
| ~15 variant CSS files | Design explorations — NOT needed |

### Data Files
| File | Size | Purpose |
|------|------|---------|
| `data.json` | ~414KB | **687 cultural assets** — the core dataset |
| `events.json` | ~75KB | Trumba-sourced events (Arts Council calendar) |
| `events-kvmr.json` | ~35KB | KVMR radio station events |
| `events-gvda.json` | ~38KB | Grass Valley Downtown Association events |
| `events-libcal.json` | ~69KB | Nevada County Library events |
| `events-crazyhorse.json` | ~13KB | Crazy Horse Saloon events |
| `events-goldenera.json` | ~4KB | Golden Era Lounge events |
| `events-bodhihive.json` | ~68B | Bodhi Hive events (nearly empty) |
| `events-civicengage.json` | ~1KB | City of Nevada City events |
| `events-merged.json` | ~392KB | All sources merged with venue matching |
| `events-merged-flat.json` | ~379KB | Flat version of merged events |
| `events.index.json` | ~235KB | Pre-computed venue match index |
| `itineraries.json` | ~36KB | 3 curated itineraries (1-day, 2-day, 3-day) |
| `experiences.json` | ~36KB | Heritage corridors / guided experiences |
| `muse_editorials.json` | editorial articles | MUSE magazine content |
| `muse_places.json` | MUSE-mentioned places | Places referenced in MUSE articles |
| `image_data.json` | ~232KB | Photo URLs + alt text per asset |
| `chat-knowledge-pack.json` | ~213KB | AI concierge knowledge base |

---

## 2. MapLibre Integration

### Map Setup
- **Tile source**: MapTiler Landscape (`api.maptiler.com/maps/landscape/style.json`)
- **Key**: `LrWxywMynJX4Y3SvVJby` (in `index-maplibre-config.js`)
- **Fallback**: CARTO dark raster tiles if key is missing
- **Center**: `[-120.8, 39.22]` (Nevada County)
- **Zoom**: 9 desktop / 8.5 mobile
- **Pitch**: 35deg desktop / 0 mobile
- **Bearing**: -15deg desktop / 0 mobile
- **Container ID**: `#map`

### GeoJSON Layer
`buildAssetsGeoJSON()` in `index-maplibre-map-data-model.js` converts `data.json` into a FeatureCollection. Each feature has:
```
properties: { name, label_name, layer, city, address, description,
              phone, website, hours_state, hours_label, event_count_14d,
              has_events_14d, color, icon_key, idx }
geometry: { type: "Point", coordinates: [lon, lat] }
```

### Marker Layers
Defined in `index-maplibre-asset-layer-defs.js`:
- Circle markers colored by category
- Symbol layer for progressive text labels
- County outline (glow + core line layers)

### Detail Panel
`index-maplibre-detail-view.js` builds the side panel with:
- Hero image (from `image_data.json`) with watercolor fallback
- Category tag with SVG icon
- Hours state pill (open/closed/unknown)
- Event count badge
- Address, phone, website, Google Maps link
- Experience corridor badges
- Bookmark button
- GSAP slide-in animation

### What to Lift
- `getMapStyle()` / `getMapInitOptions()` — map bootstrap (adapt center/zoom)
- `buildAssetsGeoJSON()` — GeoJSON conversion from compact schema
- `addCountyOutlineLayer()` — county boundary rendering
- `buildFeatureTooltipHTML()` — hover popup construction
- Asset layer paint definitions
- The cooperative gestures pattern

---

## 3. Events System

### Data Pipeline
1. **Source feeds** scraped externally, stored as `events-*.json` files per source
2. `events-merged.json` combines all sources with venue matching
3. `events.index.json` has pre-computed `matched_asset_idx` per event
4. At runtime, `buildVenueEventIndex()` in `index-maplibre-events-model.js` does:
   - PID matching (Google Places ID)
   - Exact name+city matching
   - Fuzzy token overlap matching (tokenized venue names, stop words stripped)
   - Category priority sorting when multiple assets match

### Event Schema (from events.json)
```json
{
  "event_id": "trumba-195046987",
  "title": "...",
  "start_iso": "2026-02-15T11:00:00-08:00",
  "end_iso": "2026-02-15T15:30:00-08:00",
  "timezone": "America/Los_Angeles",
  "venue_name": "The Curious Forge",
  "venue_city": "Nevada City",
  "source_type": "feed",
  "source_ref": "https://www.trumba.com/...",
  "ticket_url": "...",
  "tags": ["Art & Gallery", "Visual Arts", "Workshop"],
  "image_url": "...",
  "description": "..."
}
```

### Filtering Pipeline
`getFilteredMapEvents()` applies in order:
1. `isEventUpcoming()` — future events only
2. Date filter: today / tonight / weekend / 14d / family
3. Audience filter: exclude kids/library events by default
4. Category filter: by asset category, tag slug, or source slug
5. `dedupeRecurringEvents()` — collapses same-title/venue/city series
6. Distance sort (if geolocation available)

### What to Lift
- **`buildVenueEventIndex()`** — the entire venue matching engine. This is the hardest part of the events system and it works well. ~300 lines of battle-tested fuzzy matching.
- **`dedupeRecurringEvents()`** — series collapsing logic
- **`getFilteredMapEvents()`** — the filtering pipeline
- **Event date utilities** from `index-maplibre-events-utils.js` — `parseEventDate`, `formatEventDateRange`, `isEventUpcoming`, `isEventToday`, `isEventTonight`, `isWeekendEvent`
- **`resolveEventImage()`** from events-view — layered image fallback (event image > venue image > tag watercolor > default)
- **`getInferredEventCategories()`** — regex-based category inference from event text

---

## 4. Data Models

### Asset Schema (data.json)
Compact single-letter keys for file size:
```
n = name (string)
a = address (string)
c = city (string)
p = phone (string)
w = website URL (string)
d = description (string)
l = layer/category (string) — one of 8 consolidated categories
x = longitude (number)
y = latitude (number)
pid = Google Places ID (string)
h = hours array (string[] | null) — e.g. ["Monday: 11:00 AM - 12:00 AM", ...]
```
687 assets total.

### 8 Consolidated Categories
```
Historic Landmarks, Eat Drink & Stay, Cultural Organizations,
Galleries & Museums, Fairs & Festivals, Walks & Trails,
Public Art, Performance Spaces
```
Mapped from 10 raw ArcGIS categories via `CATEGORY_MAP` in config.

### Itinerary Schema (itineraries.json)
```json
{
  "id": "perfect-day",
  "title": "...",
  "subtitle": "...",
  "duration": "1-day",
  "season": "year-round",
  "heroImage": "img/...",
  "description": "...",
  "theme": { "accent": "#2a8c8c", "routeColor": "#b85c38", "background": "#f2ece4" },
  "days": [{
    "label": "Day 1",
    "stops": [{
      "asset": "Empire Mine",    // matches data.json .n field
      "time": "09:00",
      "duration": 90,
      "narrative": "...",
      "tip": "..."
    }]
  }]
}
```

### Experience/Corridor Schema (experiences.json)
```json
{
  "slug": "gold-rush-heritage",
  "type": "experience",
  "title": "Gold Rush Heritage Trail",
  "description": "...",
  "color": "#c8943e",
  "theme": { "basemap": "terrain", "accent": "...", ... },
  "stops": [{ "asset": "Empire Mine", "order": 1, "note": "...", "connector": "..." }]
}
```

### Dreamboard Schema (localStorage: `ncac-dreamboard`)
```json
{
  "version": 1,
  "places": [{ "asset": "...", "layer": "...", "city": "...", "addedAt": timestamp, "source": "detail" }],
  "events": [{ "title": "...", "venue": "...", "date": "...", "layer": "...", "addedAt": timestamp }]
}
```

### Trip Builder Schema (localStorage: `ncac-user-trips`)
```json
{
  "version": 1,
  "trips": [{ "id": "usr-...", "title": "...", "days": [...], "theme": {...} }],
  "activeTrip": "usr-..."
}
```

---

## 5. UI Components Worth Noting

### Category Grid
`exploreCats` — 8-cell grid with hero images, count badges, click-to-filter. Built in `index-maplibre-explore-view.js`.

### Directory Cards
Expandable cards in explore list. Show: image/watercolor fallback, name, category dot, city, hours pill, event count badge, bookmark button.

### Event Cards (Featured + Row)
Two formats in `index-maplibre-events-view.js`:
- **Featured card**: large image, title, date, description, venue, badges (source, series count, distance, mapped/unmapped), ticket link
- **Row card**: thumbnail + compact info, same badge system

### Detail Panel
Slide-in right panel with GSAP animation. Contains hero image, metadata rows (hours, address, phone, website, directions), experience badges, upcoming events list, bookmark button.

### Toast Notifications
Undo-capable toast in dreamboard-view. Pattern: show message with "Undo" link, auto-dismiss after 4s.

### Chat Widget
FAB button bottom-right, expands to chat panel. Message bubbles with typing indicator. Parses `{{ITINERARY|...}}` blocks from AI response into trip objects.

### Date Filter Chips
Horizontal chip bar: Today | Tonight | Weekend | 14 Days | Family. Mutually exclusive selection.

---

## 6. CSS Patterns

### Design Tokens (index-maplibre.css `:root`)
```css
--ink: #15171c;
--cream: #f2f0e9;
--parchment: #e6e3da;
--gold: #d8dd42;
--rust: #f45f4c;
--deep-green: #118173;
--slate: #50545f;
--navy: #111f34;
--font-display: 'Archivo', 'Playfair Display', Georgia, sans-serif;
--font-body: 'DM Sans', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--card-bg, --card-border, --card-radius, --card-shadow, --card-shadow-hover, --card-transition
```

### Fonts Used
- **Archivo** (display headings, 500/700/900)
- **Playfair Display** (editorial serif, 400/700/900, italic)
- **DM Sans** (body text, 300/400/500/700)
- **JetBrains Mono** (eyebrows, mono labels)

### What to Keep
- The card token system (`--card-*`) is a solid pattern — adapt values for new brand
- The responsive `clamp()` typography sizing
- Hours pill styling (`.hours-open`, `.hours-closed`, `.hours-unknown`)

### What to Replace
- ALL color values — new brand palette needed
- Font families — new brand fonts
- The magazine/editorial layout system (cover-grid, district-spread) — too coupled to stitch-lab identity
- The `--neuro-*` neumorphism variables (dead code from earlier direction)

---

## 7. What to Take (Shopping List)

### HIGH VALUE — Copy directly, minimal adaptation needed

| Module | Key Functions | Why |
|--------|--------------|-----|
| `index-maplibre-events-model.js` | `buildVenueEventIndex()`, `getFilteredMapEvents()`, `dedupeRecurringEvents()` | 445 lines of battle-tested venue matching + event filtering. This is the most complex and valuable code in the codebase. |
| `index-maplibre-events-utils.js` | `parseEventDate()`, `formatEventDateRange()`, `isEventUpcoming()`, `isEventToday()`, `isEventTonight()`, `isWeekendEvent()` | Date parsing/comparison utils. Handles timezone-aware ISO strings correctly. |
| `index-maplibre-hours-utils.js` | `getHoursState()`, `isOpenAtNow()`, `parseTodayRanges()`, `parseTimeToken()` | Business hours parser that handles Google Places format. ~125 lines, well-tested. |
| `index-maplibre-core-utils.js` | `escapeHTML()`, `parseDeepLinkSearch()`, `serializeDeepLinkSearch()`, `normalizeCategory()`, `extractCityFromAddress()` | General utilities. Deep-link codec is useful for shareable URLs. |
| `index-maplibre-geolocation-model.js` | `distanceMiles()`, `formatDistanceMiles()`, `compareDistanceMiles()` | Haversine distance calculation + formatting. Clean, testable. |
| `index-maplibre-config.js` | `CATEGORY_MAP`, `CATS`, `ICONS` | Category taxonomy is canonical. SVG icons are clean. MapTiler key is reusable. |
| `index-maplibre-dreamboard-model.js` | All functions | Clean localStorage CRUD with dedup and limits. ~185 lines. Rename from "dreamboard" to whatever the hub calls it. |
| `index-maplibre-tripbuilder-model.js` | `encodeForUrl()`, `decodeFromUrl()`, CRUD functions | URL-safe trip sharing via base64. Clean localStorage pattern. |
| `index-maplibre-analytics.js` | Event taxonomy, Umami wrapper, dedup throttle | Analytics wrapper is provider-agnostic. Event naming taxonomy is well-designed. |

### MEDIUM VALUE — Worth referencing, needs adaptation

| Module | What to Reference | Notes |
|--------|------------------|-------|
| `index-maplibre-map-init-model.js` | Map bootstrap config | Adapt center/zoom for hub. Keep CARTO fallback pattern. |
| `index-maplibre-map-data-model.js` | `buildAssetsGeoJSON()`, `buildFeatureTooltipHTML()` | GeoJSON builder is solid. Tooltip HTML will need new styling. |
| `index-maplibre-detail-view.js` | `buildDetailMetaHTML()`, watercolor fallback pattern | Panel HTML structure is useful reference. GSAP dependency may change. |
| `index-maplibre-events-view.js` | `resolveEventImage()`, card/row HTML templates | Image fallback cascade is smart. HTML templates need new design. |
| `index-maplibre-explore-controller.js` | Search debounce + analytics tracking pattern | The controller pattern (model+view+controller separation) is good architecture. |
| `index-maplibre-chat-controller.js` | `parseItineraryBlock()`, message state management | The `{{ITINERARY}}` parser is clever. API wiring will change for hub. |

### DATA FILES — Copy directly

| File | Notes |
|------|-------|
| `data.json` | 687 assets. This IS the dataset. Use as-is or migrate to Supabase. |
| `itineraries.json` | 3 curated itineraries with narratives. Content is good. |
| `experiences.json` | Heritage corridor content. Worth keeping. |
| `muse_editorials.json` | MUSE magazine editorial content. |
| `muse_places.json` | MUSE-referenced places. |
| `image_data.json` | Photo URLs per asset. Essential for any visual display. |
| `chat-knowledge-pack.json` | AI concierge knowledge base. |
| `events.json` | Trumba events (will be refreshed, but schema is the reference). |
| `events-kvmr.json`, `events-gvda.json`, etc. | Multi-source events. Keep schema, content will refresh. |

---

## 8. What to Leave

### Dead Weight
- **~20 variant HTML/CSS pairs** (atelier-pop, brutalist-signal, chromafold, civic-grid, etc.) — design explorations, none selected
- **BACKUP files** (`*.BACKUP-pre-phase1-merge.*`, `*.BACKUP-pre-phase1.*`) — git has history
- **Neumorphism artifacts** (`NEUMORPHISM.md`, `index-neumorphism.html`, `--neuro-*` CSS vars)
- **`index-maplibre-phase1-wip.css`** — work-in-progress, superseded
- **Mockup HTML files** (`mockup-dim-highlight.html`, `mockup-progressive-reveal.html`)
- **`variants.html`** — design variant switcher page
- **`.tmp-*` files** — temporary screenshots/debugging artifacts

### Too Coupled to Old Design
- **`index-maplibre-hero-intent-stitch-frontend-design-pass.css`** — magazine editorial layout system (cover-grid, district-spread, hero-photo-stack) is deeply tied to the stitch-lab visual identity
- **`index-maplibre-hero-intent.css`** — same, intent-tab styling etc.
- **`index-maplibre-bindings.js`** — DOM event delegation is entirely tied to the current page structure with hardcoded element IDs. New build should use component-level event binding.
- **`index-maplibre.js`** (main orchestrator) — massive file that boots everything with tight coupling. New build should use proper module system.
- **`index-maplibre-page-effects.js`** — scroll animations tied to current layout
- **`index-maplibre-lodging-section.js`** — VRBO affiliate deep links, may not be relevant to hub
- **`index-maplibre-email-capture.js`** — Beehiiv-specific email capture

### Architecture Decisions to Change
- **No module system** — everything is IIFE + `window.*` globals. Hub should use ES modules or a proper framework.
- **No build step** — Hub will likely have one (Vite, Next.js, etc.)
- **GSAP dependency** for detail panel animations — consider CSS transitions or smaller library
- **All state in closures** — no reactive state management. Hub should use signals, stores, or framework state.
- **Hardcoded element IDs everywhere** — new build should use component encapsulation

---

## Summary: Priority Cherry-Pick List

1. **Events model** (`events-model.js`) — venue matching + filtering pipeline
2. **Hours utils** (`hours-utils.js`) — business hours parsing
3. **Events date utils** (`events-utils.js`) — timezone-aware date handling
4. **Core utils** (`core-utils.js`) — escapeHTML, deep-link codec, category normalization
5. **Geolocation model** (`geolocation-model.js`) — distance calculation
6. **Config** (`config.js`) — category taxonomy, SVG icons
7. **Dreamboard model** (`dreamboard-model.js`) — bookmark localStorage CRUD
8. **Trip builder model** (`tripbuilder-model.js`) — trip CRUD + URL sharing
9. **Analytics wrapper** (`analytics.js`) — Umami integration
10. **All JSON data files** — assets, events, itineraries, experiences, images, chat knowledge

Total reusable code: ~2,000 lines of well-tested business logic.
Total to leave behind: ~15,000+ lines of layout/styling/DOM wiring tied to the old design.
