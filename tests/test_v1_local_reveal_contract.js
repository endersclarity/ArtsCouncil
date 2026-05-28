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

assert.match(appSource, /function startLocalReveal\(lngLat\)/, "dense-area clicks should enter Local Reveal mode");
assert.match(appSource, /function clearLocalReveal\(\)/, "Local Reveal should expose a Back action");
assert.match(appSource, /places near this spot/, "Local Reveal summary should name the immediate origin");
assert.match(appSource, /id="local-reveal-back"/, "Local Reveal should render a Back control");
assert.match(appSource, /state\.map\.addSource\("local-reveal-area"/, "map should include a Local Reveal cue source");
assert.match(appSource, /id:\s*"local-reveal-area"/, "map should include a subtle Local Reveal cue layer");

assert.match(
  appSource,
  /queryRenderedFeatures\([\s\S]*layers:\s*\["place-density"\]/,
  "Local Reveal should use an area hit test against density dots, not require an exact tiny-dot click",
);
assert.match(
  appSource,
  /state\.map\.on\("click",\s*\(event\) =>/,
  "Local Reveal should listen to ordinary map clicks so dense-area intent is not lost between tiny dots",
);

const startBody = appSource.match(/function startLocalReveal\(lngLat\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.match(startBody, /distanceMiles\(origin/, "Local Reveal should rank nearby places by distance from the clicked spot");
assert.match(startBody, /state\.mode = "places"/, "Local Reveal should keep the Directory Browser as the carrying surface");
assert.doesNotMatch(startBody, /new maplibregl\.Popup|setHTML|addTo/, "Local Reveal should not open a cramped map popover list");

const clearBody = appSource.match(/function clearLocalReveal\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.match(clearBody, /state\.searchQuery = previous\.searchQuery/, "Back should restore prior search context");
assert.match(clearBody, /state\.activeIntents = new Set\(previous\.activeIntents\)/, "Back should restore prior filter context");

assert.match(stylesSource, /\.local-reveal-summary/, "Local Reveal should have dedicated Directory Browser summary styling");
assert.match(stylesSource, /\.local-reveal-back/, "Local Reveal Back action should have dedicated styling");

console.log("V1 Local Reveal contract ok");
