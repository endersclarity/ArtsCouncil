const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);

function blockFor(selector) {
  const index = stylesSource.search(new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`));
  assert.notEqual(index, -1, `${selector} should exist`);
  return stylesSource.slice(index, stylesSource.indexOf("}", index) + 1);
}

assert.match(stylesSource, /--focus-ring:\s*0 0 0 3px var\(--ncac-red-ring\);/, "bright interface should expose a red focus ring token");

const blockExpectations = [
  [".site-header", /background:\s*var\(--field\)/, "site header should sit on the white NCAC field"],
  [".site-header", /border-bottom:\s*6px solid var\(--ncac-red\)/, "site header should use red structure"],
  [".control-panel", /border:\s*2px solid var\(--line-strong\)/, "control panel should have sharp black framing"],
  [".control-panel::before", /background:\s*var\(--ncac-red\)/, "control panel should include a red structural rule"],
  [".panel-topline", /border-bottom:\s*2px solid var\(--line-strong\)/, "panel topline should use black hierarchy"],
  [".mode-tabs", /border:\s*2px solid var\(--ink\)/, "mode tabs should be sharply framed"],
  [".filter-chip.active", /background:\s*var\(--ncac-red\)/, "active filters should use NCAC red state"],
  [".review-tools", /box-shadow:\s*inset 4px 0 0 var\(--ncac-red\)/, "review tools should carry a red rule"],
  [".marker-preview-popup .maplibregl-popup-content", /border:\s*2px solid var\(--ink\)/, "marker previews should be sharply framed"],
  [".detail-card", /background:\s*var\(--surface\)/, "detail cards should use bright surfaces"],
  [".detail-card", /border-top:\s*5px solid var\(--ink\)/, "ordinary detail cards should use black hierarchy"],
  [".detail-card.primary-anchor-card", /border-top:\s*6px solid var\(--ncac-red\)/, "primary anchors should use red hierarchy"],
  [".seen-in-muse", /box-shadow:\s*inset 5px 0 0 var\(--ncac-red\)/, "Seen in MUSE should have red evidence structure"],
  [".event-mini", /box-shadow:\s*inset 4px 0 0 var\(--ncac-red\)/, "event cards should have red structure"],
  [".map-legend", /border:\s*2px solid var\(--line-strong\)/, "map legend should be sharply framed"],
];

for (const [selector, expected, message] of blockExpectations) {
  assert.match(blockFor(selector), expected, message);
}

assert.match(stylesSource, /\.place-list-item\.active,[\s\S]*box-shadow:\s*inset 5px 0 0 var\(--ncac-red\)/, "active list rows should use red selection");
assert.match(stylesSource, /\.mode-tab:focus-visible,[\s\S]*box-shadow:\s*var\(--focus-ring\)/, "interactive controls should share the focus ring");
assert.doesNotMatch(stylesSource, /blue construction|grid-line|cyan/i, "bright interface should not expose visible construction-grid styling");

console.log("V1 bright interface surfaces contract ok");
