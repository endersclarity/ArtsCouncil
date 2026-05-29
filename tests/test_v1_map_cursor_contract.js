const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// CLA-30: the map's interactive canvas must use a crisp custom (inline SVG)
// cursor for grab/grabbing, not MapLibre's default keyword that falls back to
// the low-res Windows OS bitmap hand. Marker pointer behavior is unaffected.

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);

// Grab (idle hover over the pannable map)
const grabBlock = stylesSource.match(
  /\.maplibregl-canvas-container\.maplibregl-interactive\s*\{([\s\S]*?)\}/,
)?.[1] || "";
assert.match(grabBlock, /cursor:\s*url\(["']?data:image\/svg\+xml/i,
  "grab cursor should be a crisp inline SVG data URI, not a keyword/bitmap");
assert.match(grabBlock, /,\s*grab\b/i,
  "grab cursor should keep the `grab` keyword as a fallback");

// Grabbing (while panning) — MapLibre toggles the :active state
const grabbingBlock = stylesSource.match(
  /\.maplibregl-canvas-container\.maplibregl-interactive:active\s*\{([\s\S]*?)\}/,
)?.[1] || "";
assert.match(grabbingBlock, /cursor:\s*url\(["']?data:image\/svg\+xml/i,
  "grabbing cursor should be a crisp inline SVG data URI");
assert.match(grabbingBlock, /,\s*grabbing\b/i,
  "grabbing cursor should keep the `grabbing` keyword as a fallback");

console.log("test_v1_map_cursor_contract: OK");
