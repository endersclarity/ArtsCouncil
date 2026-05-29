// CLA-27 — the v1 map uses the OpenFreeMap "Liberty" street basemap (free, no key),
// with the basemap's own stale OSM business POIs suppressed so our dots are the only
// place markers. Town/place labels, street names, and highway shields are kept.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);

// 1. A named street-basemap style constant points at OpenFreeMap Liberty.
assert.match(
  appSource,
  /const STREET_BASEMAP_STYLE\s*=\s*"https:\/\/tiles\.openfreemap\.org\/styles\/liberty"/,
  "app should define STREET_BASEMAP_STYLE as the OpenFreeMap Liberty style",
);

// 2. The active map is initialized with that street basemap (not the quiet Positron style).
const mapInit = appSource.match(/new maplibregl\.Map\(\{([\s\S]*?)\}\)/)?.[1] || "";
assert.match(mapInit, /style:\s*STREET_BASEMAP_STYLE/, "the map should boot on the street basemap");
assert.doesNotMatch(
  mapInit,
  /positron-gl-style/,
  "the active map style should no longer be the quiet Positron base",
);

// 3. A function suppresses the basemap's own OSM POI symbol layers (source-layer "poi").
assert.match(
  appSource,
  /function hideBasemapPoiLayers\(\)/,
  "app should define hideBasemapPoiLayers()",
);
const hideBody = appSource.match(/function hideBasemapPoiLayers\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.match(hideBody, /"source-layer"\]\s*===\s*"poi"/, "should target layers whose source-layer is 'poi'");
assert.match(hideBody, /setLayoutProperty\([^)]*"visibility",\s*"none"\)/, "should hide POI layers via visibility:none");

// 4. The load handler actually invokes the POI suppression.
const loadHandler = appSource.match(/state\.map\.on\("load",[\s\S]*?\}\);/)?.[0] || "";
assert.match(loadHandler, /hideBasemapPoiLayers\(\)/, "the map load handler should call hideBasemapPoiLayers()");

console.log("CLA-27 street basemap contract ok");
