# External Integrations

**Analysis Date:** 2026-02-14

## APIs & External Services

**Mapping & Geospatial:**
- MapTiler - Basemap provider and terrain tiles
  - SDK/Client: MapLibre GL JS 4.5.0 (CDN)
  - API Key: `LrWxywMynJX4Y3SvVJby` (hardcoded in `website/cultural-map-redesign/index-maplibre-config.js`)
  - Endpoints:
    - Style: `https://api.maptiler.com/maps/landscape/style.json?key={key}`
    - Terrain: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key={key}`
  - Usage: Basemap rendering, 3D terrain elevation (2x exaggeration), hillshading
  - Tier: Free (100k tile loads/month)

**Event Data:**
- Trumba RSS Feed - Nevada County Arts Council event calendar
  - Endpoint: `https://www.trumba.com/calendars/nevada-county-arts-council.rss`
  - Auth: None (public RSS feed)
  - Ingestion: Python script `scripts/events/ingest_trumba_rss.py`
  - Output: `website/cultural-map-redesign/events.json` (100+ upcoming events)
  - Namespace: `x-trumba` custom XML elements for extended metadata
  - Refresh: Runtime fetch with 30min cache in frontend, manual regeneration via script

**Cultural Asset Data:**
- ArcGIS REST API - Nevada County Arts Council cultural asset layers
  - Endpoint pattern: `https://services9.arcgis.com/dunJqHWsrgVVzHCy/arcgis/rest/services/{LAYER_NAME}/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson`
  - Auth: None (public)
  - Usage: Initial data extraction, 687 features across 10 categories (no runtime integration)
  - Pipeline: Manual extraction → `data.json` compression (single-letter keys for bandwidth)

**Business Hours & Place Data:**
- Google Places API (New) - Hours of operation, Place IDs
  - Endpoint: `https://places.googleapis.com/v1`
  - SDK/Client: `requests` library in Python
  - Auth: `GOOGLE_PLACES_API_KEY` environment variable (`.env` file)
  - Usage: Enrichment script `scripts/fetch-hours.py` for regularOpeningHours data
  - Rate limiting: 150ms base delay + 0-50ms jitter, exponential backoff for 429 errors
  - Fields added: `h` (hours array), `pid` (Place ID) in `data.json`

**Image Data:**
- Google Places API - Photo references (optional tier in image fetch script)
  - Endpoint: `https://maps.googleapis.com/maps/api/place/textsearch/json`, `https://maps.googleapis.com/maps/api/place/photo`
  - Auth: Google Places API key from `~/.gmail_credentials/google_places_api_key.txt`
  - Usage: Fallback for venue images in `scripts/fetch_images.py`

- Wikimedia Commons API - Public domain/CC-licensed images
  - Usage: Image enrichment for Historic Landmarks, Walks & Trails, Public Art categories
  - Script: `scripts/fetch_images.py` (tier 2 fallback after og:image scraping)

**Geocoding & Location Data:**
- OpenStreetMap Nominatim - Geocoding for MUSE places
  - User-Agent: `ArtsCouncilMuseEnricher/1.0`
  - Usage: `scripts/enrich-muse-places-osm.mjs` for lat/lng enrichment of editorial mentions
  - Rate limiting: 1s delay between requests (Nominatim usage policy)

- OpenStreetMap Overpass API - POI data fallback
  - Usage: `scripts/enrich-muse-places-osm.mjs` for place data enrichment
  - Bounds filtering: Nevada County bounding box (39.00-39.70 lat, -121.60 to -120.00 lng)

## Data Storage

**Databases:**
- None - Fully static site with JSON file storage

**File Storage:**
- Local filesystem - All data files in `website/cultural-map-redesign/`
  - `data.json` - 687 cultural assets (414KB, compressed with single-letter keys)
  - `events.json` - Upcoming events from Trumba RSS (217KB)
  - `events.index.json` - Venue-to-events index for fast lookup (235KB)
  - `experiences.json` - Curated routes with themes, stops, narratives (33KB)
  - `muse_editorials.json` - Editorial cards from MUSE magazine issues
  - `muse_places.json` - MUSE "missing mentions" not in main dataset
  - `image_data.json` - Hero images with attribution (232KB)
  - `nevada-county.geojson` - County boundary polygon
- Vercel CDN - Static file hosting, global edge distribution

**Caching:**
- Browser cache - Standard HTTP caching for JSON files, images, CSS, JS
- Runtime cache - 30min cache for events RSS feed in frontend

## Authentication & Identity

**Auth Provider:**
- None - Public read-only application, no user accounts

**Admin/Edit Access:**
- ArcGIS Online - Cultural asset data maintained by Nevada County Arts Council staff (external system)
- Trumba - Event calendar maintained by Arts Council staff (external system)

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry, no error reporting service

**Logs:**
- Browser console only (no server-side logs)
- Python script output to stdout/stderr during data pipeline runs

**Analytics:**
- None detected - No Google Analytics, no Plausible, no tracking pixels

## CI/CD & Deployment

**Hosting:**
- Vercel - Static site hosting
  - Project: `cultural-map-redesign`
  - Org: `endersclarity's-projects`
  - Project ID: `prj_kgmGpAY9Mqgg27jPrssaN5h7XH2B`
  - URL: `cultural-map-redesign.vercel.app`

**CI Pipeline:**
- None - Manual deployment via `vercel --prod` CLI command
- Auto-deploy on push to `master` branch (Vercel Git integration)

**Build Process:**
- None - No build step, static files deployed as-is

## Environment Configuration

**Required env vars:**
- `GOOGLE_PLACES_API_KEY` - For `scripts/fetch-hours.py` hours enrichment (optional, pipeline only)

**Optional env vars:**
- None required for production frontend (MapTiler key is hardcoded)

**Secrets location:**
- `.env` (root) - Python script secrets
- `.env.local` (website/cultural-map-redesign) - Development config
- `~/.gmail_credentials/google_places_api_key.txt` - Google Places API key for image fetch script

**Public keys (committed):**
- MapTiler API key: `LrWxywMynJX4Y3SvVJby` in `website/cultural-map-redesign/index-maplibre-config.js` (free tier, intentional)

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints, no server-side processing

**Outgoing:**
- None - No webhook triggers, no external notifications

## Deep Linking & URL State

**Query Parameters:**
- `?pid=<place_id>` - Open specific marker from `data.json` (Google Place ID)
- `?muse=<id>` - Open MUSE "missing mention" from `muse_places.json`
- `?open=0|1` - "Open Now" filter state
- `?events14d=0|1` - Events filter state
- Map state (lat, lng, zoom) - Not currently persisted in URL

**Examples:**
- `/index-maplibre.html?pid=ChIJRY258Dtwm4ARmf8wS-mzAzA` (Del Oro Theater)
- `/index-maplibre.html?muse=rainbow-theatre&open=1`

## CDN Dependencies

**JavaScript Libraries:**
- MapLibre GL JS 4.5.0 - `https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.js`
- Turf.js 6.x - `https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js`
- GSAP 3.12.2 - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`

**Stylesheets:**
- MapLibre GL CSS 4.5.0 - `https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.css`

**Fonts:**
- Google Fonts - `https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap`

**Preconnect Domains:**
- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com`
- `https://unpkg.com`
- `https://cdn.jsdelivr.net`
- `https://cdnjs.cloudflare.com`
- `https://api.maptiler.com`

## External Links & Attribution

**Magazine Content:**
- Heyzine flipbooks - MUSE magazine issues (public attribution links)
  - MUSE 2024: `https://heyzine.com/flip-book/4d7f1d311e.html`
  - MUSE 2025: `https://heyzine.com/flip-book/MUSE`
  - MUSE 2026: `https://heyzine.com/flip-book/MUSE26#page/<N>`

**Navigation:**
- Google Maps - Directions links from detail panel (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`)

---

*Integration audit: 2026-02-14*
