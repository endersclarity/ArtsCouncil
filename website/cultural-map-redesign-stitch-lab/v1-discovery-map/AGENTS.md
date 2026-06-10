# AGENTS.md — V1 Discovery Map (the live app)

This is the active NCAC Cultural Asset Map. One `app.js` (~1,500-line vanilla IIFE, loaded via a
plain `<script>` tag — **NOT** `type=module`) + `review-state.js` (URL state) + `styles.css` +
`index.html`. MapLibre GL JS 4.7.1, CARTO Positron basemap repainted to a quiet palette. Loads flat
JSON from `data/`. No backend, no bundler. (Repo-root `AGENTS.md` explains why the rest of the repo
is graveyard — read it for the live-vs-dead map.)

## What this owns / out of scope
**Owns:** the map render, markers, filters, anchors, smart labels, local-reveal, URL state.
The offline data pipeline is `scripts/lib/*.mjs` (+ `build-places.mjs`) — pure transforms, the one
place `node:test` fits. **Out of scope:** the dead flagship (`website/cultural-map-redesign/`) and
the `.planning/` roadmap.

## Invariants — violate these and it breaks *silently*
1. **Markers are declarative MapLibre GL paint expressions, not DOM.** Marker state (tier,
   selection, density) lives in `circle`/`symbol` layer paint, evaluated per-feature on the GPU.
   There is **no callable JS seam** to unit-test render logic.
2. **MapLibre silently DROPS a layer whose paint expression is invalid** — no console error, only a
   `map.on('error')` event. A `zoom` expression may ONLY be a top-level input to `step`/`interpolate`;
   nesting `zoom` inside a `case` is rejected and the layer vanishes. Invert it: `zoom` as the
   top-level `interpolate` input, data-driven `case` in the output stops. (This exact bug silently
   killed `place-density` — Codex PR #71, repaired in CLA-18 `aa19a31`.) Validate any new paint expr
   with `map.addLayer({id:'tx',...})` + `map.getLayer('tx')` BEFORE committing.
3. **Verify render behavior via the CDP contract, not `node:test`.**
   `scripts/contract/marker-hierarchy.contract.js` — run `runMarkerHierarchyContract(window.__map)`
   via chrome-devtools `evaluate_script`; expect `{allPass:true}`. The map isn't global — capture it
   by reloading with an initScript that wraps `maplibregl.Map` so `window.__map = inst`.
4. **The static server caches `app.js`.** The `?v=...` query in `index.html` is the cache-bust —
   bump it on every change so real users get the rebuilt file. CDP reloads must pass
   `ignoreCache:true` or you test stale code.
5. **The `data/*.json` files are huge** (`places.json` ~2MB, `muse_grounded_sampler.json` ~4.6MB).
   Never read them wholesale into context; sample with `jq`/`head`.

## Data model
`data/places.json` (~1,959 rows) is provenance-tagged: Diana (authoritative) / ArcGIS-confident /
census-estimated / none. Marker tier **"Candidate"** = estimated coords (hollow marker);
**"Map-Ready"** = solid. Decision record: `docs/adr/0001-place-dataset-trust-tiers.md`.

## How to view
Serve static from the `cultural-map-redesign-stitch-lab` dir: `python -m http.server 4178` →
`http://127.0.0.1:4178/v1-discovery-map/index.html`. Observe via the chrome-devtools MCP over CDP
9222 against the **existing** Chrome (never launch/kill it). Not Playwright/agent-browser.

## Changelog + journey tracking (owner rule, 2026-06-10)
6. **Every commit that changes this folder's source must add an entry to
   `data/changelog.json`** (newest first, plain language for the Arts Council — what changed
   for a visitor). The page `changelog.html` ("What's New" in the site nav) renders it.
   A pre-commit hook (`scripts/git-hooks/pre-commit` at repo root, wired via
   `git config core.hooksPath scripts/git-hooks`) blocks commits that forget;
   bypass for non-visitor-visible changes with `SKIP_CHANGELOG=1`.
   Also keep `.planning/STATE.md` (Current Position / Last activity / Next) current at the
   end of each working session — that file is the cross-session journey tracker.
