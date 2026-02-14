# Codebase Structure

**Analysis Date:** 2026-02-14

## Directory Layout

```
artscouncil/
├── .claude/                         # Claude configuration
│   └── commands/                    # Custom GSD commands
├── .planning/                       # GSD planning docs (this dir)
│   └── codebase/                    # Architecture analysis docs
├── assets/                          # Legacy design deck (2019 watercolor mockups)
├── data/                            # Source data (ArcGIS GeoJSON exports)
│   └── cultural-asset-map/          # 687 features across 10 layers
├── docs/                            # Documentation and publications
│   ├── analysis/                    # Feature audits, content inventory
│   ├── committee/                   # Experience charter, meeting agendas
│   ├── correspondence/              # Stakeholder emails
│   ├── plans/                       # Implementation plans
│   ├── publications/                # MUSE magazines + Destination NC
│   └── references/                  # Design decisions, UX analysis
├── scripts/                         # Data processing scripts
│   └── events/                      # Python RSS event processors
├── screenshots/                     # Site UI screenshots
├── tests/                           # JS test files (manual tests, no framework)
└── website/                         # THE SITE
    └── cultural-map-redesign/       # Active development (Vercel-deployed)
        ├── archive/                 # Pre-refactor monolith backups
        ├── img/                     # Images and graphics
        │   ├── muse/                # MUSE editorial graphics
        │   └── watercolor/          # 11 category watercolor assets
        ├── mockups/                 # Design experiment HTML files
        ├── *.html                   # Entry points (33 variants)
        ├── index-maplibre*.js       # 36 modular JS files
        ├── index-maplibre*.css      # 28 style variants
        └── *.json                   # Data files (data, experiences, events, muse, images)
```

## Directory Purposes

**`website/cultural-map-redesign/`:**
- Purpose: Primary application root — Vercel-deployed interactive map
- Contains: HTML entry points, 36 JS modules, 28 CSS variants, JSON data files, images
- Key files: `index-maplibre-hero-intent.html` (flagship), `index-maplibre.js` (bootstrap), `data.json` (687 assets), `experiences.json` (curated routes), `events.json` (Trumba RSS cache)

**`website/cultural-map-redesign/img/watercolor/`:**
- Purpose: Category-specific watercolor illustrations (from 2019 design deck)
- Contains: 11 PNG files — `landmarks.png`, `eat-drink.png`, `performance.png`, etc., plus `badge.png`
- Key files: Referenced in `CATS` config by slug, used in category pills and hero cards

**`website/cultural-map-redesign/img/muse/`:**
- Purpose: MUSE magazine editorial graphics
- Contains: Corridor map illustration, feature photography
- Key files: `muse_cultural_corridor_original.png` (not yet integrated)

**`website/cultural-map-redesign/archive/`:**
- Purpose: Pre-refactor backups before modular split (Feb 9, 2026)
- Contains: Single-file monoliths (3500+ lines)
- Key files: `index-maplibre.pre-refactor-2026-02-09.html` (last working monolith)

**`website/cultural-map-redesign/mockups/`:**
- Purpose: Design experiment HTML files for testing layout variants
- Contains: Top-row color labs, progressive reveal mockups
- Key files: All prefixed with `_debug-` or `_render-` for screenshot comparison

**`data/cultural-asset-map/`:**
- Purpose: Source GeoJSON from ArcGIS REST API (10 layers)
- Contains: Raw feature collections per category, `all_cultural_assets.geojson`, `county_boundary.geojson`
- Key files: `clean_data.json` (intermediate format before compression to `data.json`)

**`docs/publications/`:**
- Purpose: MUSE magazines and Destination NC as screenshot archives + OCR text
- Contains: 3 MUSE issues (2024-2026), Destination NC 2025, all with page-numbered screenshots and searchable OCR
- Key files: `muse-issue-03-2026/muse-issue-03-2026-ocr-full.txt` (112 pages), `muse-issue-03-2026/ocr/` (56 per-spread OCR files)

**`docs/committee/`:**
- Purpose: Experience Planning Committee governance docs
- Contains: Charter, meeting agendas, transcripts
- Key files: `charter/experience-charter.md`, `meeting-agendas/2026-02-18-agenda.md`

**`docs/correspondence/`:**
- Purpose: Stakeholder communications
- Contains: Diana Arbex email (Feb 14, 2026) defining MUSE-inspired design direction
- Key files: `diana-arbex-email-2026-02-14.md`

**`docs/analysis/`:**
- Purpose: Feature audits, content inventories, competitive research
- Contains: User stories, MUSE content catalog, DMO analysis
- Key files: `2026-02-14-feature-audit.md`, `muse-content-catalog.md`

**`scripts/events/`:**
- Purpose: Python scripts for Trumba RSS processing
- Contains: Event fetchers, venue matchers, JSON exporters
- Key files: Event processing utilities (not executed by site — events fetched at runtime via JS)

**`tests/`:**
- Purpose: Manual JS tests for specific features (no test framework)
- Contains: Baseline bootstrap tests, deeplink codec tests, legend icon tests
- Key files: `test_maplibre_baseline_bootstrap.js`, `test_maplibre_deeplink_codec.js`

**`.planning/codebase/`:**
- Purpose: GSD codebase mapping documents (this file)
- Contains: Architecture and structure analysis
- Key files: `ARCHITECTURE.md`, `STRUCTURE.md`

## Key File Locations

**Entry Points:**
- `website/cultural-map-redesign/index-maplibre-hero-intent.html`: Flagship entry point (intent-first hero variant)
- `website/cultural-map-redesign/index-maplibre.html`: Original MapLibre entry point
- `website/cultural-map-redesign/index.html`: Leaflet fallback version (legacy, 3500+ lines, single-file monolith)
- `website/cultural-map-redesign/variants.html`: Showcase page for all hero variants

**Configuration:**
- `website/cultural-map-redesign/index-maplibre-config.js`: Constants (`MAPTILER_KEY`, `CATS`, `ICONS`)
- `website/cultural-map-redesign/vercel.json`: Vercel deployment config (rewrites, redirects)
- `website/cultural-map-redesign/.vercelignore`: Files excluded from deployment

**Core Logic:**
- `website/cultural-map-redesign/index-maplibre.js`: Main bootstrap (7219 lines across all modules)
- `website/cultural-map-redesign/index-maplibre-map-filter-model.js`: Filter expression builder (45 lines)
- `website/cultural-map-redesign/index-maplibre-events-model.js`: Venue-event matching logic
- `website/cultural-map-redesign/index-maplibre-experience-controller.js`: Curated route orchestration
- `website/cultural-map-redesign/index-maplibre-bindings.js`: Event listener wiring

**Testing:**
- `tests/test_maplibre_baseline_bootstrap.js`: Bootstrap smoke test
- `tests/test_maplibre_deeplink_codec.js`: Deep link serialization test
- `tests/test_maplibre_legend_icons.js`: Category icon rendering test

**Data Files:**
- `website/cultural-map-redesign/data.json`: 687 cultural assets (single-letter keys, 414KB)
- `website/cultural-map-redesign/experiences.json`: Curated routes (33KB)
- `website/cultural-map-redesign/muse_editorials.json`: Editorial cards (17KB)
- `website/cultural-map-redesign/muse_places.json`: Deep-linkable MUSE mentions (10KB)
- `website/cultural-map-redesign/image_data.json`: Hero images keyed by asset name (232KB)
- `website/cultural-map-redesign/county-outline.geojson`: Nevada County boundary polygon
- `website/cultural-map-redesign/events.json`: Cached Trumba RSS feed (217KB, regenerated at runtime)

## Naming Conventions

**Files:**
- `index-maplibre-{module-name}.js`: Modular JS files with namespace exports
- `index-maplibre-{variant-name}.html`: Hero variant entry points
- `index-maplibre-{variant-name}.css`: Variant-specific stylesheets
- `*-model.js`: State management and business logic (no DOM)
- `*-view.js`: HTML generation (pure functions)
- `*-controller.js`: Coordination between model and view
- `*-utils.js`: Pure utility functions (no side effects)

**Directories:**
- `lowercase-with-dashes`: Standard directory naming
- `cultural-map-redesign`: Not `cultural-map-redesign-v2` — no version suffixes

**Modules:**
- `window.CulturalMap{ModuleName}`: Global namespace exports (PascalCase)
- Examples: `CulturalMapConfig`, `CulturalMapEventsModel`, `CulturalMapExperienceController`

**Data Keys (data.json):**
- Single-letter keys for size optimization: `n` (name), `l` (layer), `x` (longitude), `y` (latitude), `h` (hours), `d` (description), `w` (website), `p` (phone), `a` (address), `c` (city), `pid` (place_id)

**CSS Custom Properties:**
- `--cat-{category-slug}`: Category colors (e.g., `--cat-performance-spaces`)
- `--accent`, `--accent-secondary`, `--accent-tertiary`: Theme colors during experiences
- `--background`, `--text`, `--dimmed-marker`: Theme overrides

## Where to Add New Code

**New Feature (e.g., "Favorites"):**
- Primary code: `website/cultural-map-redesign/index-maplibre-favorites-model.js` (state), `index-maplibre-favorites-view.js` (HTML), `index-maplibre-favorites-controller.js` (coordination)
- Tests: `tests/test_maplibre_favorites.js`
- Add script tags to all HTML entry points in dependency order (before `index-maplibre.js`)

**New Component/Module:**
- Implementation: `website/cultural-map-redesign/index-maplibre-{name}.js`
- Wrap in IIFE: `(function() { 'use strict'; /* code */ window.CulturalMap{Name} = { ... }; })();`
- Export functions via `window.CulturalMap{Name}` object
- Add to HTML: `<script src="index-maplibre-{name}.js"></script>` before main entry point

**Utilities:**
- Shared helpers: Add to `website/cultural-map-redesign/index-maplibre-core-utils.js` if general-purpose, or create new `*-utils.js` file if domain-specific (e.g., `route-utils.js` for route calculations)

**New Category:**
- Add to `CATS` object in `website/cultural-map-redesign/index-maplibre-config.js`
- Add SVG icon to `ICONS` object
- Add watercolor PNG to `website/cultural-map-redesign/img/watercolor/`
- Add CSS custom property to all CSS files: `--cat-{slug}: {hex-color};`

**New Curated Experience:**
- Add to `website/cultural-map-redesign/experiences.json`
- Schema: `{ slug, type, title, subtitle, description, color, theme, stops: [{asset, order, note, connector}] }`
- No code changes required — experiences are data-driven

**New MUSE Editorial Card:**
- Add to `website/cultural-map-redesign/muse_editorials.json`
- Schema: `{ id, title, subtitle, quote, author, body_paragraphs, heyzine_url, story_panel_html }`
- Renders automatically in hero via `index-maplibre-experience-view.js`

**New Hero Variant:**
- HTML: `website/cultural-map-redesign/index-maplibre-hero-{name}.html`
- CSS: `website/cultural-map-redesign/index-maplibre-hero-{name}.css`
- Copy script tag order from `index-maplibre-hero-intent.html` (canonical dependency order)
- Add link to `variants.html` showcase page

**New Data Source:**
- Fetch in main entry point: `website/cultural-map-redesign/index-maplibre.js` (around line 100-150 where other fetches happen)
- Use parallel `Promise.all()` if independent of other data
- Add error handling (fallback to empty array/object)

## Special Directories

**`website/cultural-map-redesign/archive/`:**
- Purpose: Pre-refactor backups
- Generated: Manually via `cp index-maplibre.html archive/index-maplibre.pre-refactor-YYYY-MM-DD.html`
- Committed: Yes (for historical reference)

**`website/cultural-map-redesign/.vercel/`:**
- Purpose: Vercel deployment metadata
- Generated: Automatically by `vercel` CLI on deploy
- Committed: No (`.vercelignore` excludes it)

**`website/cultural-map-redesign/tmp/`:**
- Purpose: Temporary build artifacts or test outputs
- Generated: Manually during development
- Committed: No

**`.planning/` (root):**
- Purpose: GSD planning documents
- Generated: Via `/gsd:map-codebase` command
- Committed: Yes (should be version-controlled for team reference)

**`.planning-archive-happening-now/`:**
- Purpose: Archived GSD planning docs from earlier phases
- Generated: Manual archive before GSD reset
- Committed: Yes (historical context)

**`docs/publications/muse-issue-03-2026/screenshots/`:**
- Purpose: Page-numbered screenshots of MUSE Issue 3
- Generated: Manually via screenshot capture + OCR batch processing
- Committed: Yes (source material for editorial content)

**`scripts/events/reports/`:**
- Purpose: Event processing reports (venue match stats, category coverage)
- Generated: By Python scripts in `scripts/events/`
- Committed: Optional (useful for debugging venue matching)

**`.tmp*` files (repo root):**
- Purpose: Temporary agent screenshots for debugging
- Generated: By Claude during development sessions
- Committed: No (`.gitignore`'d)

---

*Structure analysis: 2026-02-14*
