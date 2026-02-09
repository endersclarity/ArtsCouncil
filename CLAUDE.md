# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Nevada County Arts Council** project — a cultural asset mapping initiative for Nevada County, California. It contains scraped data from the Arts Council's ArcGIS cultural asset map (687 features across 10 categories) and a redesigned interactive web visualization.

The project is associated with Kaelen's volunteer work at North Star Historic Conservancy. The Arts Council is a separate organization, but North Star House appears in 4 of the 10 data layers.

## Repository Structure

- `data/cultural-asset-map/` — Raw data extracted from ArcGIS web map `604050d4965c4b93b984781f72941d5b`. Individual GeoJSON files per layer, combined CSV/GeoJSON, and ArcGIS metadata. Source of truth for all cultural asset data.
- `website/cultural-map-redesign/` — Static single-page site deployed to **Vercel** (project: `cultural-map-redesign`, org: `endersclarity's-projects`). This is the main deliverable.
- `assets/` — Reference images and planning files. Includes 8 screenshots from the Arts Council's **original 2019 cultural asset map presentation deck** — watercolor illustration style (barn, deer, wine bottle, flowers, tree, camera), the quatrefoil "Nevada County Cultural Assets" brand badge, category headers, and their stated design philosophy ("quiet graphics"). These are the original designer's vision that never made it into the deployed ArcGIS map. Available for future incorporation as decorative elements to honor the original work.
- `Transcripts/` — Meeting transcripts (raw audio transcriptions with timestamps).
- `meetings/` — Meeting prep documents.

## Website Architecture

The cultural map has two versions:

1. **`index.html`** — Leaflet.js version (original, single-file monolith, 3500+ lines)
2. **`index-maplibre.html`** — MapLibre GL JS version (flagship, modular architecture) ⭐

Both share the same HTML structure and CSS. The MapLibre version is the actively developed variant with 3D terrain, cinematic cameras, and advanced interactions.

### Tech Stack

- **MapLibre GL JS 4.5.0** — WebGL-based mapping library with 3D terrain support
- **MapTiler** — Basemap provider (Landscape style + terrain-rgb-v2 tiles)
- **GSAP 3.11** — High-performance animation library for UI transitions
- **Turf.js 7.2** — Geospatial analysis (route slicing, distance calculations)
- **Luxon 3.4** — Date/time handling with timezone support (Pacific/Los_Angeles)
- **Google Fonts** — Playfair Display (headings), DM Sans (body), JetBrains Mono (labels)
- **Vanilla JS** — No framework, no build system, just ES5 IIFEs and global namespace

### Modular Architecture (MapLibre version)

The MapLibre version uses a **namespace-based module system** with 36+ separate `.js` files loaded via `<script>` tags. Each module exposes functions/objects via `window.CulturalMap*` globals and uses IIFEs for encapsulation.

**Module categories:**

- **Config/Utils** (`-config.js`, `-core-utils.js`) — Constants, color helpers, sanitization
- **Events** (`-events-*.js`) — RSS event ingestion, filtering, carousel, venue matching
- **Hours** (`-hours-utils.js`) — Business hours parsing, "Open Now" logic, timezone-aware state
- **Explore** (`-explore-*.js`) — Asset catalog/directory list with search and pagination
- **Map** (`-map-*.js`) — Layer definitions, rendering, filtering, labels, interactions
- **Experiences** (`-experience-*.js`) — Curated routes with theme switching and auto-tour
- **Detail** (`-detail-*.js`) — Right-hand slide-in panel for asset details
- **UI** (`-filter-ui.js`, `-page-effects.js`, `-bindings.js`) — Filter pills, scroll reveals, event wiring

**Load order matters:** Modules declare dependencies via assertion checks. The main entry point (`index-maplibre.js`) loads last and bootstraps the app. See lines 342-377 in `index-maplibre.html` for the canonical script order.

**MVC-ish pattern:**
- **Models** (`*-model.js`) — State management, data transformations, filtering logic
- **Views** (`*-view.js`) — HTML generation, DOM rendering (no state)
- **Controllers** (`*-controller.js`) — Event handling, model-view coordination
- **Utils** (`*-utils.js`) — Pure functions, no side effects

### Data Flow

- `data.json` — 687 cultural assets with single-letter keys: `n` (name), `l` (layer/category), `c` (city), `a` (address), `d` (description), `p` (phone), `w` (website), `h` (hours JSON string), `x` (longitude), `y` (latitude), `e` (Trumba event count 14d, added dynamically)
- `image_data.json` — Optional hero images keyed by asset name
- `experiences.json` — Curated routes with stops, themes, narratives
- `events.xml` — Trumba RSS feed (fetched at runtime, cached for 30min)
- `county-outline.geojson` — Nevada County boundary polygon

All files loaded via `fetch()` at runtime. No build step.

### Key Features

- **Category filtering** — 10 categories with color-coded pills and markers
- **"Open Now" mode** — Real-time business hours check (hourly refresh)
- **Events integration** — 100+ upcoming events from Trumba RSS, matched to venues
- **Curated Experiences** — Themed routes with dim+highlight, cinematic flyTo, auto-tour
- **Cultural Corridors** — Highway 40/20/49 routes from MUSE '26 magazine article
- **Smart labels** — Progressive collision detection for map labels
- **3D terrain** — MapTiler terrain-rgb-v2 with 2x exaggeration
- **Detail panel** — Slide-in with asset info, hours, events, Google Maps link
- **Watercolor assets** — 11 decorative images from Arts Council's 2019 design deck

### Category System

10 categories defined in `CATS` object (see `index-maplibre-config.js`):
- Historic Landmarks, Eat/Drink/Stay, Cultural Organizations, Galleries, Museums, Education, Performing Arts, Trails, Regional, Film/Media

Each category has: display name, short label, hex color, watercolor image filename. Category colors cascade through the entire UI (pills, markers, cards, tooltips, detail panel).

## Working with the Modular Codebase

### Adding a New Module

1. Create `index-maplibre-your-module.js` in `website/cultural-map-redesign/`
2. Wrap in IIFE: `(function() { 'use strict'; /* code */ window.CulturalMapYourModule = { ... }; })();`
3. Add `<script src="index-maplibre-your-module.js"></script>` to `index-maplibre.html` in dependency order (before modules that use it, after modules it depends on)
4. Import in main file: `const yourModule = window.CulturalMapYourModule || {};`
5. Add assertion check if critical: `assertModuleMethods(yourModule, ['method1', 'method2'], 'Missing CulturalMapYourModule...')`

### Modifying Existing Logic

- **Filtering logic** → `index-maplibre-map-filter-model.js`
- **Map rendering** → `index-maplibre-map-render-controller.js`
- **Hours/Open Now** → `index-maplibre-hours-utils.js`
- **Events** → `index-maplibre-events-*.js` (8 files, see Events slice below)
- **Experience tours** → `index-maplibre-experience-controller.js`
- **UI interactions** → `index-maplibre-bindings.js`

### Testing Locally

No build step required. Just:
1. Open `website/cultural-map-redesign/index-maplibre.html` in a browser
2. Or run a local server: `python -m http.server 8000` (or Node `http-server`)
3. Navigate to `http://localhost:8000/website/cultural-map-redesign/index-maplibre.html`

**IMPORTANT:** Some features require a MapTiler API key. Free tier allows 100k tile loads/month. Key is hardcoded in `index-maplibre-config.js` as `MAPTILER_KEY`.

### Common Gotchas

- **Module load order** — If you get "Missing CulturalMap*" errors, check script order in HTML
- **Global namespace pollution** — All modules share `window.*` globals. Name collisions will silently overwrite.
- **No ES6 modules** — This is intentional (no build system). Use IIFEs, not `import/export`.
- **MapLibre vs Leaflet** — The two versions have diverged significantly. Don't assume code is portable between them.
- **Category colors** — Defined in CSS (`--cat-*` custom properties) AND JS (`CATS` object). Single source of truth is CSS; JS reads via `getComputedStyle()` in some modules, duplicates in others. Inconsistent.
- **Timezone handling** — All date/time logic uses `America/Los_Angeles` (Pacific). Luxon is the single library for this; don't use native `Date` objects.

## Data Pipeline

ArcGIS REST endpoints are publicly queryable:
```
https://services9.arcgis.com/dunJqHWsrgVVzHCy/arcgis/rest/services/{LAYER_NAME}/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson
```

The `clean_data.json` → `data.json` pipeline compresses the raw GeoJSON into the compact single-letter key format consumed by the website.

### Events Data (Trumba RSS)

Events are fetched from Nevada County Arts Council's Trumba RSS feed at runtime:
```
https://www.trumba.com/calendars/nevada-county-arts-council.rss
```

The **Events slice** (8 modules) handles ingestion, parsing, venue matching, and UI rendering:
1. `events-utils.js` — Parsing, date math, tokenization
2. `events-model.js` — Venue matching via fuzzy string logic, filtering by date/category
3. `events-carousel.js` — Spotlight card carousel (3 visible, paginated)
4. `events-view.js` — HTML generation for cards and list items
5. `events-search.js` — Text search across event titles/descriptions
6. `events-filter-ui.js` — Category dropdown, time range chips (Today/Weekend/14d)
7. `events-controller.js` — Wires filter UI to model, triggers re-renders
8. Main app (`index-maplibre.js`) — Fetches RSS, builds venue index, binds UI

**Venue matching:** Events have a "location" string (e.g., "North Star House, Grass Valley"). We tokenize and fuzzy-match against the 687 asset names to display event counts on markers and show venue-specific events in the detail panel.

## Deployment

The website is deployed to **Vercel** as a static site:
- **Project:** `cultural-map-redesign`
- **Org:** `endersclarity's-projects`
- **URL:** [cultural-map-redesign.vercel.app](https://cultural-map-redesign.vercel.app/)

**Deploy methods:**
1. Push to linked Git repo (auto-deploy on push to `master`)
2. Vercel CLI: `cd website/cultural-map-redesign && vercel --prod`
3. Vercel dashboard: drag-and-drop the `website/cultural-map-redesign/` folder

No build step required — it's just static files (HTML, CSS, JS, JSON, images).

## Design Language

The site uses an editorial/magazine aesthetic:
- Color palette: cream (`#f5f0e8`), ink (`#1a1612`), gold (`#c8943e`), rust, deep-green, slate
- CSS custom properties for all colors, fonts, and category colors (`--cat-*`)
- Scroll-reveal animations via IntersectionObserver
- Responsive breakpoints at 900px and 600px

## Current Work: Curated Experiences Layer

**Full design doc:** `docs/plans/2026-02-07-curated-experiences-design.md`

**What it is:** Themed overlays on the map that highlight curated subsets of assets with route lines, narrative text, and optional visual theme switching. First experience is "Gold Rush Heritage Trail" with a MUSE-magazine-inspired theme.

**Implementation status:**

Phase 1 (Leaflet version - the deliverable):
- [x] 1. Create `experiences.json` with Gold Rush Heritage Trail
- [x] 2. Add experience selector UI (horizontal card row above map)
- [x] 3. Implement dim+highlight (marker opacity toggling on activation)
- [x] 4. Implement theme switching (CSS custom property swap + basemap crossfade)
- [x] 5. Build MUSE theme (teal `#2a8c8c`, rust `#b85c38`, sage `#7a9e7e`, warm cream `#f2ece4`)
- [x] 6. Add route line with dash animation between stops
- [x] 7. Add numbered stop markers with tooltips
- [x] 8. Add info panel with narrative connector text
- [x] 9. Author additional experiences (Highway 40, 20, 49, Poetry Trail)
- [x] 10. Deploy to Vercel

Phase 2 (MapLibre prototype - the wow factor):
- [x] 1. Duplicate page as MapLibre GL JS variant (`index-maplibre.html`)
- [x] 2. Port markers, filters, experience system to MapLibre API (GeoJSON circle layer, filter expressions)
- [x] 3. Add 3D terrain via MapTiler (terrain-rgb-v2, exaggeration 2, pitch 35°)
- [x] 4. Basemap: MapTiler Landscape (warm, natural terrain colors — honors 2019 "quiet graphics" vision)
- [x] 5. Cinematic camera (flyTo with pitch 55°, bearing toward next stop, auto-tour)
- [x] 6. Animated route drawing (Turf.js lineSliceAlong progressive reveal)
- [x] 7. GSAP for UI transitions (stats, panels, scroll reveal, corridor entrance)
- [x] 8. Deploy to Vercel as `/index-maplibre.html`

Phase 2.5 (Corridor branding):
- [x] Separate Cultural Corridors (Hwy 40, 20, 49) from thematic experiences in UI
- [x] Apply MUSE theme to all 3 corridor routes (not just Gold Rush Heritage)
- [x] Add "Cultural Corridors / from MUSE '26" section header
- [x] Phase 3 planning (page redesign, watercolor assets, richer interactions)

Phase 3 (Quiet Graphics rebrand):
- [x] Generate 11 watercolor assets (AI extraction/generation via ChatGPT)
- [x] CSS rebrand — dark to "quiet graphics" cream backgrounds
- [x] Integrate watercolors into page (category cards, tooltips, detail panel, section decorations)
- [x] Add interaction improvements (tooltip animation, GSAP staggers, experience badges)
- [x] Brand guide created at `docs/brand-guide.md`
- [ ] Phase 3.5: Design overhaul based on critique (see below)
- [ ] Sync rebrand to Leaflet version (`index.html`)
- [ ] Deploy and commit

Phase 3.5 (Design overhaul — based on `docs/design-critique-phase3.md`):
- [x] Hero simplified: stripped AI-slop patterns (stats row, 50/50 grid, scattered watercolors). Now: badge-as-hero centered on cream, compact title below. Clean.
- [x] Category cards hidden (filter pills on map do the same job). JS still works, grid just hidden.
- [x] Section intro simplified to single-column prose (was 2-column with cards).
- [x] Decorative section-watercolor images removed from explore/colophon.
- [x] MUSE editorial content: Added expandable cards with quotes from Jesse Locks article (Highway 40/20/49 corridor descriptions). Progressive disclosure via `<details>` tags.
- [ ] MUSE illustration integration: `img/muse_cultural_corridor_original.png` (Belohlavek & Pitcher). NOT as a hero background overlay (tried, looks bad). User wants it visible between sections as you scroll — peek-through gaps, parallax strips, or section dividers. The illustration should bring color/vibrancy without being a lazy watermark. Still needs a good approach.
- [ ] Explore list overhaul: currently a plain text spreadsheet. Needs rich cards or compact search.
- [ ] Visual rhythm: sections need alternating treatments. The MUSE illustration peek-through could solve this.
- [ ] Colophon upgrade: proper credits, attribution, CTA.
- [ ] Update `docs/brand-guide.md` visual identity section to reflect simplified hero.

**Key decisions (don't revisit):**
- Vanilla HTML/CSS/JS, no framework (YAGNI)
- Dim+highlight, not progressive reveal
- Theme switching per experience via CSS custom properties
- MUSE visual identity pulled from Arts Council's MUSE '26 Issue 03
- Experiences defined in `experiences.json`, authored by hand, no CMS
- MapLibre = flagship (default), Leaflet = fallback. Design for MapLibre first.
- Basemap: MapTiler Landscape. Comparison page saved at `docs/design-decisions/basemap-compare.html`
- Cultural Corridors (highway routes) are distinct from Curated Experiences (thematic trails)
- MapTiler API key: stored in JS constant (client-side, free tier)

## Archive and Refactoring History

### Monolith → Modular Refactor (Feb 8-9, 2026)

The MapLibre version started as a 3,527-line monolithic HTML file (`index-neumorphism.html`, 108KB). It was refactored into 36+ modules over 2 days to improve maintainability. See `CODE_SIMPLIFICATION_ANALYSIS.md` for the original analysis that drove the refactor.

**Pre-refactor archive:** `website/cultural-map-redesign/archive/index-maplibre.pre-refactor-2026-02-09.html` (monolith snapshot for reference)

**Design variants archive:** `website/cultural-map-redesign/archive/` also contains:
- `index-neumorphism.html` — Soft neumorphic design experiment
- `mockup-dim-highlight.html` — Dim+highlight UI exploration
- `mockup-progressive-reveal.html` — Progressive reveal alternative (rejected)

### Temporary Files

The repo root contains several `.tmp*` files and `.tmp/` directory from development experiments. These can be safely deleted and are already `.gitignore`'d.
