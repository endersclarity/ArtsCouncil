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

The cultural map redesign is a **single `index.html` file** — no build system, no framework. Everything (HTML, CSS, JS) is in one file.

**Tech stack:**
- Leaflet.js 1.9.4 (CDN) for the interactive map
- CartoDB dark basemap tiles
- Google Fonts: Playfair Display (headings), DM Sans (body), JetBrains Mono (labels)
- Vanilla JS with an IIFE pattern

**Data flow:**
- `data.json` — Compact array of asset objects (derived from `data/cultural-asset-map/clean_data.json`). Each object uses single-letter keys: `n` (name), `l` (layer/category), `c` (city), `a` (address), `d` (description), `p` (phone), `w` (website), `x` (longitude), `y` (latitude).
- `image_data.json` — Optional image URLs keyed by asset name. Used for tooltip/detail panel hero images.
- Both files are loaded via `fetch()` at runtime.

**Key UI components:**
- Hero section with animated stat counters
- Category grid cards (clickable, sync with map filter)
- Leaflet map with CircleMarkers, rich tooltips, and category filtering via pill buttons
- Searchable directory list with pagination (30 items per page)
- Slide-in detail panel (right side) with asset info, links, Google Maps link

**Category system:** 10 categories defined in the `CATS` object, each with a hex color and short label. Category colors are used consistently across cards, pills, map markers, list items, and the detail panel. The categories map to the original ArcGIS layer names but use shortened display names.

## Data Pipeline

ArcGIS REST endpoints are publicly queryable:
```
https://services9.arcgis.com/dunJqHWsrgVVzHCy/arcgis/rest/services/{LAYER_NAME}/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson
```

The `clean_data.json` → `data.json` pipeline compresses the raw GeoJSON into the compact single-letter key format consumed by the website.

## Deployment

The website is deployed to Vercel as a static site. Deploy by pushing to the Vercel-linked repo or using the Vercel CLI from the `website/cultural-map-redesign/` directory. No build step required — it's just static files.

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
- [ ] Phase 3 planning (page redesign, watercolor assets, richer interactions)

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
