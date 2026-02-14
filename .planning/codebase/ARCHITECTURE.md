# Architecture

**Analysis Date:** 2026-02-14

## Pattern Overview

**Overall:** IIFE Namespace Module Pattern with MVC-inspired separation

**Key Characteristics:**
- 36 modular JavaScript files loaded via script tags in strict dependency order
- Each module exposes functions via `window.CulturalMap*` global namespace
- IIFEs encapsulate implementation, export only public interface
- No build system or transpilation — vanilla ES5 for maximum compatibility
- Models hold state and data transformations, Views generate HTML strings, Controllers coordinate between them
- Assertion-based dependency validation at runtime

## Layers

**Configuration Layer:**
- Purpose: Define constants, color schemes, category metadata, API keys
- Location: `website/cultural-map-redesign/index-maplibre-config.js`
- Contains: `MAPTILER_KEY`, `ICONS` (SVG per category), `CATS` (10 categories with colors and metadata)
- Depends on: Nothing (loaded first)
- Used by: All other modules

**Utility Layer:**
- Purpose: Pure functions with no side effects — color conversion, HTML escaping, date parsing, geospatial helpers
- Location: `website/cultural-map-redesign/index-maplibre-core-utils.js`, `index-maplibre-events-utils.js`, `index-maplibre-hours-utils.js`, `index-maplibre-tour-utils.js`
- Contains: `hexToRgba()`, `escapeHTML()`, `parseEventDate()`, `getHoursState()`, timezone-aware date logic
- Depends on: Config layer, Luxon library (Pacific timezone)
- Used by: Models, Views, Controllers

**Model Layer:**
- Purpose: State management, data filtering, business logic, no DOM manipulation
- Location: `*-model.js` files — `index-maplibre-explore-model.js`, `index-maplibre-events-model.js`, `index-maplibre-map-filter-model.js`, `index-maplibre-experience-model.js`, `index-maplibre-filter-state-model.js`, `index-maplibre-map-interaction-model.js`, `index-maplibre-map-init-model.js`, `index-maplibre-map-data-model.js`, `index-maplibre-map-style-model.js`, `index-maplibre-geolocation-model.js`
- Contains: Filter expression builders, venue-event matching, hours/distance sorting, theme application, MapLibre layer definitions
- Depends on: Utilities, Config
- Used by: Controllers

**View Layer:**
- Purpose: HTML generation from data, zero state, pure functions returning strings
- Location: `*-view.js` files — `index-maplibre-explore-view.js`, `index-maplibre-events-view.js`, `index-maplibre-detail-view.js`, `index-maplibre-experience-view.js`, `index-maplibre-catalog-view.js`
- Contains: Template functions like `getEventsCardsHTML()`, `buildDetailHeroHTML()`, `getTourPopupHTML()`
- Depends on: Utilities (for escaping)
- Used by: Controllers

**Controller Layer:**
- Purpose: Coordinate models and views, handle DOM updates, manage MapLibre interactions
- Location: `*-controller.js` files — `index-maplibre-events-controller.js`, `index-maplibre-explore-controller.js`, `index-maplibre-map-render-controller.js`, `index-maplibre-experience-controller.js`, `index-maplibre-detail-controller.js`, `index-maplibre-map-label-controller.js`
- Contains: `buildMapEventsList()`, `applyAssetFilters()`, `createExperienceController()`, `openDetail()`
- Depends on: Models, Views, Utilities
- Used by: Main entry point

**UI/Interaction Layer:**
- Purpose: Event binding, scroll effects, filter UI, carousel logic
- Location: `index-maplibre-bindings.js`, `index-maplibre-filter-ui.js`, `index-maplibre-events-filter-ui.js`, `index-maplibre-page-effects.js`, `index-maplibre-events-carousel.js`, `index-maplibre-experience-ui.js`, `index-maplibre-asset-interactions.js`, `index-maplibre-corridor-map.js`, `index-maplibre-asset-layer-defs.js`, `index-maplibre-events-search.js`
- Contains: Click handlers, scroll reveals, filter pill rendering, carousel step logic
- Depends on: Controllers, Models
- Used by: Main entry point

**Main Entry Point:**
- Purpose: Bootstrap application, wire all modules together, handle deep linking
- Location: `website/cultural-map-redesign/index-maplibre.js`
- Contains: Data loading, map initialization, module orchestration, global context object
- Depends on: All other modules (loaded last)
- Used by: HTML page

## Data Flow

**Initial Load:**

1. HTML loads external libraries (MapLibre GL JS 4.5.0, Turf.js 6, GSAP 3.12, Luxon 3.4)
2. Modules load in dependency order via `<script>` tags (36 files)
3. Main entry point (`index-maplibre.js`) executes, runs assertions to validate dependencies
4. Parallel `fetch()` calls retrieve JSON data files (`data.json`, `experiences.json`, `muse_editorials.json`, `muse_places.json`, `image_data.json`, `county-outline.geojson`, `events.xml`)
5. MapLibre map initializes with MapTiler Landscape basemap + terrain-rgb-v2 tiles
6. GeoJSON layers added: county outline, cultural assets (687 features), experience routes
7. Deep link params (`?pid=`, `?muse=`, `?open=`, `?events14d=`) parsed and applied
8. Event listeners bound via `index-maplibre-bindings.js`

**User Interaction Flow (Category Filter):**

1. User clicks category pill in hero or filter bar
2. `bindings.js` handler calls `toggleCategoryFilter(layerName)`
3. `filter-state-model.js` updates `activeCategories` Set
4. `map-filter-model.js` builds MapLibre filter expression `['in', ['get', 'layer'], ['literal', selected]]`
5. `map-render-controller.js` applies filter to map layers (`assets-circle`, `assets-symbols`, `assets-hit`, `assets-mobile-labels`)
6. `explore-model.js` filters directory list, `explore-view.js` generates HTML, `explore-controller.js` updates DOM
7. `map-render-controller.js` calls `fitBounds()` to zoom to filtered features
8. URL updated via `serializeDeepLinkSearch()` for shareable state

**Event Data Synchronization:**

1. RSS feed fetched from Trumba at page load
2. `events-utils.js` parses XML, normalizes dates to Pacific timezone
3. `events-model.js` builds venue-event index by matching venue names to asset names (tokenized, stop-words removed)
4. 14-day event count added to asset features as `has_events_14d` property
5. Events filtered by date range (all/today/weekend/14d) via `events-controller.js`
6. Event carousel renders via `events-carousel.js` with auto-rotation (paused on user interaction, resumes after 10s)
7. Events refresh hourly via `setInterval()` in main entry point

**Experience Tour Flow:**

1. User clicks curated route button
2. `experience-controller.js` calls `activateExperience(exp)`
3. `experience-model.js` resolves asset names to coordinates, applies theme (CSS custom properties + MapTiler basemap swap)
4. `map-render-controller.js` dims all markers, highlights route stops
5. Route line drawn via `corridor-map.js` using Turf.js `lineString()` and animated dashed offset
6. Auto-tour starts: cinematic `flyTo()` to each stop with eased camera movements (GSAP)
7. Tour popup shows at each stop via `experience-view.js` template
8. Theme removal restores original basemap and marker styles

**State Management:**

- Global `ctx` object holds all state (active filters, selected asset, experience, events cache, map reference)
- Models expose getter/setter functions, Controllers mutate state
- No reactive framework — manual DOM updates after state changes
- URL query params persist filter state for deep linking

## Key Abstractions

**Asset (Cultural Feature):**
- Purpose: Represents a place on the map (687 total)
- Examples: `{ n: "Nevada Theatre", l: "Performance Spaces", x: -121.016, y: 39.261, h: [...hours], pid: "ChIJ..." }`
- Pattern: Single-letter keys for size optimization (`n`=name, `l`=layer/category, `x`=longitude, `y`=latitude, `h`=hours, `d`=description, `w`=website, `p`=phone, `a`=address, `c`=city, `pid`=place_id)

**Event:**
- Purpose: Represents a time-bounded happening from Trumba RSS
- Examples: Events parsed from `<item>` in RSS XML feed
- Pattern: Matched to venues via fuzzy name matching, enriched with category inference from tags/title/description

**Experience:**
- Purpose: Curated narrative route connecting multiple assets
- Examples: `website/cultural-map-redesign/experiences.json` — "Gold Rush Heritage Trail", "Literary Nevada County"
- Pattern: Theme object with color scheme, ordered stops with notes and connectors, route drawn with Turf.js

**Category:**
- Purpose: Top-level classification of cultural assets
- Examples: "Historic Landmarks", "Eat, Drink & Stay", "Performance Spaces"
- Pattern: Defined in `CATS` config (10 categories), each has color (hex), short label, SVG icon, watercolor image filename

**Filter Expression:**
- Purpose: MapLibre-compatible JSON array for layer filtering
- Examples: `['in', ['get', 'layer'], ['literal', ['Performance Spaces', 'Galleries & Museums']]]`
- Pattern: Built by `map-filter-model.js`, combines category + openNow + events14d logic

**Theme:**
- Purpose: Visual transformation applied during experience tours
- Examples: Dim+highlight, basemap swap, custom accent colors, route color
- Pattern: CSS custom properties (`--accent`, `--accent-secondary`, etc.) + MapTiler basemap URL change

**Hours State:**
- Purpose: Real-time business status based on current Pacific time
- Examples: `"open"`, `"closing_soon"`, `"closed"`, `"unknown"`
- Pattern: Computed by `hours-utils.js` from JSON hours array, refreshed every 60s

## Entry Points

**Primary Entry Point:**
- Location: `website/cultural-map-redesign/index-maplibre-hero-intent.html`
- Triggers: Browser page load
- Responsibilities: Load external libraries, load 36 module scripts in order, execute main bootstrap

**Main Bootstrap:**
- Location: `website/cultural-map-redesign/index-maplibre.js`
- Triggers: After all modules loaded
- Responsibilities: Fetch data files, initialize MapLibre map, parse deep links, bind events, start hourly refresh interval

**Map Interaction Entry Points:**
- Location: `website/cultural-map-redesign/index-maplibre-asset-interactions.js`
- Triggers: Map click, hover events
- Responsibilities: Handle marker clicks (open detail panel), cursor style changes, popup triggers

**Deep Link Entry Point:**
- Location: Query param parsing in `index-maplibre.js`
- Triggers: URL with `?pid=` or `?muse=` param
- Responsibilities: Auto-open detail panel for specific asset, apply filter state from URL

**Event Binding Entry Point:**
- Location: `website/cultural-map-redesign/index-maplibre-bindings.js`
- Triggers: DOM ready
- Responsibilities: Wire all click handlers, scroll listeners, input events to controller functions

## Error Handling

**Strategy:** Fail-fast assertions at module load time, graceful degradation at runtime

**Patterns:**
- Module assertions: `assertModuleMethods(eventsModel, ['buildVenueEventIndex', 'getUpcomingEventsForAssetIdx'], 'Missing CulturalMapEventsModel...')` throws Error if module missing
- Data fetch failures: Empty arrays returned, UI shows "No events" or "No results" messages
- Missing hours: `getHoursState()` returns `"unknown"` instead of crashing
- Optional modules: Geolocation module wrapped in fallback `|| { getGeolocateControlOptions: () => ({}), ... }`
- MapLibre layer errors: Try-catch blocks around `map.getLayer()` checks before `setFilter()` or `setPaintProperty()`

## Cross-Cutting Concerns

**Logging:** Console-only (`console.log`, `console.warn`, `console.error`) for debugging, no production logging framework

**Validation:** HTML escaping via `escapeHTML()` for all user-generated content, RSS event data sanitized before rendering

**Authentication:** None — public read-only site, no user accounts or API auth

**Timezone Handling:** All date/time logic uses `America/Los_Angeles` (Pacific) via Luxon, never native `Date` object. Enforced in `events-utils.js` and `hours-utils.js`.

**Caching:** Events RSS feed cached for 30 minutes in memory (no localStorage), Hours state recomputed every 60 seconds

**Theming:** CSS custom properties (`--accent`, `--background`, `--text`) applied to `:root` during experience tours, removed on exit

**Deep Linking:** URL state serialized via `serializeDeepLinkSearch()`, parsed via `parseDeepLinkSearch()`, both in `core-utils.js`. Supports `?pid=`, `?muse=`, `?open=`, `?events14d=` params.

**Responsive Design:** CSS breakpoints at 768px and 1024px, mobile-specific map label layer (`assets-mobile-labels`) toggled based on viewport width

**Performance:** Progressive label rendering with collision detection via `map-label-controller.js`, GSAP for 60fps animations, WebGL rendering via MapLibre

---

*Architecture analysis: 2026-02-14*
