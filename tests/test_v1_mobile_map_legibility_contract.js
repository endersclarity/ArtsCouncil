const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);
const htmlSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html"),
  "utf8",
);

const mobileViewMatch = appSource.match(/const MOBILE_INITIAL_MAP_VIEW = \{\s*center:\s*\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\],\s*zoom:\s*(\d+\.\d+),\s*\};/);
assert.ok(mobileViewMatch, "mobile first load should use a named initial map view");

const [, mobileLngRaw, mobileLatRaw, mobileZoomRaw] = mobileViewMatch;
const mobileLng = Number(mobileLngRaw);
const mobileLat = Number(mobileLatRaw);
const mobileZoom = Number(mobileZoomRaw);

assert.ok(mobileLng < -120.98 && mobileLng > -121.09, "mobile view should frame the Grass Valley/Nevada City corridor");
assert.ok(mobileLat >= 39.14 && mobileLat <= 39.19, "mobile view should compensate for the drawer so the corridor lands above it");
assert.ok(mobileZoom >= 10.1, "mobile first load should be close enough for basemap context and density marks");
assert.match(appSource, /center:\s*isMobileViewport\(\) \? MOBILE_INITIAL_MAP_VIEW\.center : DESKTOP_INITIAL_MAP_VIEW\.center/);
assert.match(appSource, /zoom:\s*isMobileViewport\(\) \? MOBILE_INITIAL_MAP_VIEW\.zoom : DESKTOP_INITIAL_MAP_VIEW\.zoom/);
assert.match(htmlSource, /mobile-map-context-label grass-valley[\s\S]*Grass Valley/, "mobile first map band should name Grass Valley");
assert.match(htmlSource, /mobile-map-context-label nevada-city[\s\S]*Nevada City/, "mobile first map band should name Nevada City");

assert.match(
  appSource,
  /"circle-radius":\s*\["interpolate",\s*\["linear"\],\s*\["zoom"\],\s*7,\s*2\.[4-9]/,
  "low-zoom density dots should be visible on mobile first load",
);
assert.match(
  appSource,
  /\["get",\s*"sampler"\],\s*0\.[6-9]/,
  "first-load sampler density should stay legible above the mobile drawer",
);

const mobileCss = stylesSource.match(/@media \(max-width: 520px\) \{([\s\S]*?)\n\}/)?.[1] || "";
assert.match(mobileCss, /\.map-stage\s*\{[\s\S]*min-height:\s*calc\(100svh - 64px\);/, "mobile map should use stable small-viewport height");
assert.match(mobileCss, /\.mobile-map-context-label\s*\{[\s\S]*display:\s*block;/, "mobile map context labels should only appear in the mobile first viewport");
assert.match(mobileCss, /\.control-panel\s*\{[\s\S]*max-height:\s*44%;/, "mobile drawer should leave more first-viewport map visible");
assert.match(
  mobileCss,
  /\.control-panel:has\(\.primary-anchor-card\)\s*\{[\s\S]*max-height:\s*58%;/,
  "mobile primary-anchor drawer should not consume the first-load map band",
);

console.log("V1 mobile map legibility contract ok");
