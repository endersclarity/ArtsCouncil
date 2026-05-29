# CLA-27 — Map basemap styling pass (street basemap)

**Status:** implemented on branch `endersclarity/cla-27-street-basemap` (from `master`).
**Date:** 2026-05-29

## Problem
The v1 map repainted CARTO Positron to a near-blank beige. At county zoom it read as empty/
"frightful" (owner feedback, 2026-05-29). Water, parks, land, and roads all collapsed into the
same pale grey; markers floated on a featureless field. See `before-county-positron.png`.

## Decision
Switch the active basemap to **OpenFreeMap "Liberty"** (`https://tiles.openfreemap.org/styles/liberty`)
— a free, no-API-key MapLibre street style. Reads as a real place: yellow roads, blue water/creeks,
green national-forest fills, highway shields, town + street labels.

### How it was chosen
Built a live variant toggle (`website/.../prototypes/cla27-basemap-variants.html`) comparing four
free no-key options + the current Positron. Screenshots:
- `variant-1-voyager.png` — Carto Voyager (warm light streets)
- `variant-2-positron.png` — Positron recolored (calm/editorial)
- `variant-3-streets-CHOSEN.png` — OpenFreeMap Liberty ← **picked**
- `variant-4-hillshade.png` — Positron + terrain hillshade

## Built-in OSM business POIs — HIDDEN
Liberty ships its own OSM business/landmark labels (Booktown Books, Bank of America, Hair Razors…).
These are **stale/incomplete** and would compete with our 1,415 place dots. Decision (owner,
2026-05-29): **hide them.** They are basemap `symbol` layers with `source-layer === "poi"`; hidden
via `setLayoutProperty(id, "visibility", "none")`. Town/place labels, street names, water names, and
highway shields are kept. They cannot be turned into our interactive markers (not our features).

## Implementation (app.js)
- New `STREET_BASEMAP_STYLE` constant → Liberty URL.
- Map boots on `style: STREET_BASEMAP_STYLE` (was Positron).
- New `hideBasemapPoiLayers()` called in the map `load` handler (replaces the
  `applyCustomBasemapStyling()` call, which was the Positron quiet-wash).
- `QUIET_BASEMAP` + `applyCustomBasemapStyling()` retained as legacy (Positron path) but not applied.
- `index.html` app.js cache-buster bumped to `?v=cla-27-street-basemap`.

## TDD
- `tests/test_cla27_street_basemap_contract.js` (RED→GREEN): asserts the Liberty style is the active
  basemap, the quiet Positron base is no longer active, `hideBasemapPoiLayers()` exists and targets
  `source-layer "poi"` with `visibility:none`, and the load handler calls it.
- `tests/test_v1_quiet_basemap_contract.js` still passes (legacy palette/function retained).
- Pre-existing failures unrelated to this change: `test_v1_mobile_map_legibility_contract`,
  `test_v1_marker_preview_contract` (both fail on clean `master` too). `test_v1_map_cursor_contract`
  does not exist on this branch.

## Proof
- Before: `before-county-positron.png`
- After (downtown Grass Valley, street zoom): `after-downtown-grassvalley.png` — street names,
  buildings, our dots/events on top, NO OSM business-POI clutter, detail card works.
- After (real app, Liberty + POIs hidden): `after-county-streets.png`

## Out of scope / follow-ups
- Marker restyle for the new colorful base (category colors) → CLA-16.
- Dots still sit in street-interpolated rows down Mill St → CLA-28 (separate; this change makes it
  more visible because the basemap now shows the true storefronts).
- First-load on a very narrow/mobile window showed slow blank tiles before paint; mobile legibility
  contract was already failing on master — track under mobile work, not here.
