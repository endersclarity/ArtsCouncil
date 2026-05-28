const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);

assert.match(appSource, /const QUIET_BASEMAP = \{/, "app should define a quiet basemap palette");
assert.match(appSource, /standard:\s*\{[\s\S]*background:\s*"#f4f5f1"/, "standard map background should be pale/quiet");
assert.match(appSource, /twilight:\s*\{[\s\S]*background:\s*"#eff1ed"/, "alternate map background should remain pale/quiet");
assert.match(appSource, /const palette = isTwilight \? QUIET_BASEMAP\.twilight : QUIET_BASEMAP\.standard;/, "basemap styling should use the quiet palette");
assert.match(appSource, /palette\.roadCaseOpacity/, "road case opacity should come from the quiet map palette");
assert.match(appSource, /palette\.roadFillOpacity/, "road fill opacity should come from the quiet map palette");

const basemapBody = appSource.match(/function applyCustomBasemapStyling\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
for (const staleColor of ["#ecdcb9", "#ccbca0", "#dfceaa", "#d9c7a2", "#d4c193", "#f4efe4", "#e0d6bd", "#e8ddc6", "#d9cfaa", "#d9cdb8"]) {
  assert.doesNotMatch(basemapBody, new RegExp(staleColor, "i"), `${staleColor} should not remain in basemap styling`);
}

const addMapLayersBody = appSource.match(/function addMapLayers\(\) \{([\s\S]*?)\n  async function init/)?.[1] || "";
assert.match(addMapLayersBody, /"circle-color": \[[\s\S]*MARKERS\.paper/, "selected and contextual place markers should use bright marker paper");
assert.match(addMapLayersBody, /"circle-stroke-color": MARKERS\.ink/, "clusters and events should keep black contrast");
assert.match(addMapLayersBody, /"circle-stroke-color": \[[\s\S]*MARKERS\.red[\s\S]*MARKERS\.paper/, "selected place markers should stay red-on-white");
assert.match(addMapLayersBody, /"circle-color": "rgba\(255,255,255,0\)"/, "anchor rings should be transparent over the quiet map");
assert.match(addMapLayersBody, /"line-color": MARKERS\.red/, "path lines should keep NCAC red");
assert.match(addMapLayersBody, /"line-opacity": 0\.2/, "path lines should be visible against the quiet map");
assert.doesNotMatch(addMapLayersBody, /#faf6ec|#8c8177|#1a1a1a/, "map layer styling should not use stale warm marker colors");

console.log("V1 quiet basemap contract ok");
