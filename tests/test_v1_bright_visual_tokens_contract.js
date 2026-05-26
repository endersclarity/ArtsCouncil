const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);

const rootBlock = stylesSource.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] || "";
const twilightBlock = stylesSource.match(/body\.twilight-mode\s*\{([\s\S]*?)\n\}/)?.[1] || "";

assert.match(rootBlock, /--ncac-red:\s*#ff2e00;/i, "bright tokens should preserve NCAC red");
assert.match(rootBlock, /--ink:\s*#141414;/i, "bright tokens should use strong near-black type");
assert.match(rootBlock, /--field:\s*#ffffff;/i, "bright tokens should expose a white field");
assert.match(rootBlock, /--surface:\s*#ffffff;/i, "bright tokens should use white card surfaces");
assert.match(rootBlock, /--panel:\s*#ffffff;/i, "bright tokens should use white panel surfaces");
assert.match(rootBlock, /--map-quiet-field:/, "bright tokens should prepare quiet map colors");
assert.match(rootBlock, /--map-quiet-line:/, "bright tokens should prepare quiet map line colors");
assert.match(rootBlock, /--map-quiet-label:/, "bright tokens should prepare quiet map label colors");
assert.match(rootBlock, /--shadow-float:/, "bright tokens should distinguish floating panel shadow");
assert.match(rootBlock, /--font-ui:\s*var\(--font-brand\);/, "UI font token should be defined");

for (const staleColor of ["#faf6ec", "#f5f0e8", "#fffdf7", "#d8d0c6", "#ecdcb9", "#dfceaa", "#f6ebcf", "#ccbca0"]) {
  assert.doesNotMatch(rootBlock, new RegExp(staleColor, "i"), `${staleColor} should not remain in root visual tokens`);
  assert.doesNotMatch(twilightBlock, new RegExp(staleColor, "i"), `${staleColor} should not remain in alternate visual tokens`);
}

assert.doesNotMatch(rootBlock, /#00aeef|#00a9e0|cyan|blue/i, "visible blue construction-grid color should not be a root token");
assert.doesNotMatch(twilightBlock, /#00aeef|#00a9e0|cyan|blue/i, "visible blue construction-grid color should not be an alternate token");

const tokenConsumers = [
  [".site-header", /background:\s*var\(--field\)/],
  [".map-stage", /background:\s*var\(--map-quiet-field\)/],
  [".control-panel", /background:\s*var\(--panel\)/],
  [".mode-tab.active", /background:\s*var\(--ncac-red\)/],
  [".marker-preview-popup .maplibregl-popup-content", /box-shadow:\s*var\(--shadow\)/],
  [".detail-card.primary-anchor-card", /var\(--ncac-red-soft\)/],
  [".path-number-marker::after", /border:\s*1px solid var\(--ncac-red-ring\)/],
  [".anchor-marker .anchor-ring", /box-shadow:\s*var\(--shadow-low\)/],
];

for (const [selector, expected] of tokenConsumers) {
  const selectorIndex = stylesSource.indexOf(selector);
  assert.notEqual(selectorIndex, -1, `${selector} should exist`);
  const block = stylesSource.slice(selectorIndex, stylesSource.indexOf("}", selectorIndex) + 1);
  assert.match(block, expected, `${selector} should consume bright visual tokens`);
}

console.log("V1 bright visual tokens contract ok");
