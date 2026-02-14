# Technology Stack

**Analysis Date:** 2026-02-14

## Languages

**Primary:**
- JavaScript (ES5+) - Client-side application logic, modular architecture with IIFEs
- HTML5 - Semantic markup for web interface
- CSS3 - Styling with custom properties, responsive design
- Python 3 - Data pipeline scripts for event ingestion, hours enrichment, OCR processing

**Secondary:**
- JSON - Data storage format (cultural assets, events, experiences, editorials)
- GeoJSON - Geospatial data format (Nevada County boundary, route geometries)

## Runtime

**Environment:**
- Browser (Chrome, Firefox, Safari, Edge) - No build step, runs directly via static file server
- Python 3.12+ - Script execution environment for data pipeline

**Package Manager:**
- None for frontend (vanilla JS, no npm/package.json in website directory)
- pip - Python dependencies managed via `scripts/requirements.txt`

## Frameworks

**Core:**
- MapLibre GL JS 4.5.0 - WebGL-based mapping library with 3D terrain support
- Leaflet.js (legacy) - Fallback version in `index.html` (3500+ line monolith, not actively developed)

**Animation:**
- GSAP 3.12.2 - High-performance animation library for UI transitions, map flyTo effects

**Geospatial:**
- Turf.js 6.x - Geospatial analysis (route slicing, distance calculations, bounding boxes)

**Data Processing (Python):**
- requests 2.31.0+ - HTTP client for API calls
- python-dotenv 1.0.0+ - Environment variable management

**Testing:**
- None - No test framework detected in repository

**Build/Dev:**
- None - No build system, no webpack, no vite, no transpilation
- Static file server - Python `http.server` or Node `http-server` for local development
- Vercel CLI - Deployment via `vercel --prod` command

## Key Dependencies

**Critical:**
- MapLibre GL JS 4.5.0 - Entire map rendering, layer management, 3D terrain via `https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.js`
- MapTiler API (free tier) - Basemap provider (Landscape style + terrain-rgb-v2 tiles), API key: `LrWxywMynJX4Y3SvVJby` in `website/cultural-map-redesign/index-maplibre-config.js`
- GSAP 3.12.2 - All UI animations (panel slides, scroll reveals, carousel transitions) via `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`
- Turf.js 6.x - Experience route slicing, distance calculations via `https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js`

**Infrastructure:**
- Google Fonts - Playfair Display (headings), DM Sans (body), JetBrains Mono (labels) via `https://fonts.googleapis.com/css2`
- Native browser APIs - Intl.DateTimeFormat for timezone handling (Pacific/Los_Angeles), fetch for data loading, Geolocation API for "Near Me" feature

**Data Pipeline (Python):**
- requests - Trumba RSS fetching, Google Places API calls, Wikimedia API queries
- python-dotenv - Load `.env` for `GOOGLE_PLACES_API_KEY` in `scripts/fetch-hours.py`
- xml.etree.ElementTree - RSS parsing in `scripts/events/ingest_trumba_rss.py`
- zoneinfo - Timezone handling (America/Los_Angeles) for event date parsing

## Configuration

**Environment:**
- `.env` file (root) - Google Places API key for hours enrichment (exists, not committed)
- `.env.local` (website/cultural-map-redesign) - Development environment config (exists, not committed)
- `.env.example` (root) - Template for required environment variables
- MapTiler API key - Hardcoded in `website/cultural-map-redesign/index-maplibre-config.js` as `MAPTILER_KEY = 'LrWxywMynJX4Y3SvVJby'`

**Build:**
- `vercel.json` - Deployment redirects, routes `/` and `/index.html` to `/index-maplibre-hero-intent.html`
- `.vercelignore` - Exclude patterns from deployment (tmp files, planning docs)
- `.vercel/project.json` - Vercel project metadata (projectId, orgId, projectName)

**Module Loading:**
- 36 JS modules loaded via `<script>` tags in dependency order
- No ES6 modules, no import/export statements
- All modules expose globals via `window.CulturalMap*` namespace
- Main entry point: `website/cultural-map-redesign/index-maplibre.js` (loads last, bootstraps app)

**Script Load Order (critical):**
1. External libraries (MapLibre, Turf, GSAP)
2. Config (`index-maplibre-config.js`)
3. Core utils (`index-maplibre-core-utils.js`)
4. Domain modules (events, hours, explore, map, experiences, detail)
5. UI bindings (`index-maplibre-bindings.js`)
6. Main bootstrap (`index-maplibre.js`)

## Platform Requirements

**Development:**
- Python 3.12+ with pip
- Static file server (Python `http.server` or Node `http-server`)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No Node.js required for frontend (no npm, no build step)

**Production:**
- Vercel static hosting (deployed to `cultural-map-redesign.vercel.app`)
- CDN for external libraries (unpkg, jsdelivr, cdnjs, Google Fonts)
- MapTiler API (free tier, 100k tile loads/month)

**Data Pipeline:**
- Python 3.12+ with `requests`, `python-dotenv`
- Google Places API key (optional, for hours enrichment)
- Trumba RSS feed access (public, no auth)
- ArcGIS REST API access (public, no auth)

---

*Stack analysis: 2026-02-14*
