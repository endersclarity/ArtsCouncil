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

assert.match(appSource, /function markerPreviewHtml\(place\)/, "app should render marker previews");
assert.match(appSource, /function showMarkerPreview\(event\)/, "app should show marker previews from map features");
assert.match(appSource, /function hideMarkerPreview\(\)/, "app should hide marker previews");
assert.match(appSource, /new maplibregl\.Popup/, "marker previews should use MapLibre popups");
assert.match(appSource, /state\.map\.on\("mouseenter", layer, \(event\)/, "place marker layers should show preview on hover");
assert.match(appSource, /state\.map\.on\("mousemove", layer, showMarkerPreview\)/, "marker previews should track pointer movement");
assert.match(appSource, /\["place-points", "anchor-rings", "anchor-icons"\]/, "ordinary and anchor marker layers should share preview behavior");
assert.match(appSource, /hideMarkerPreview\(\);\n      const id = event\.features\[0\]\.properties\.id/, "click selection should clear preview for touch/click users");

const markerPreviewBody = appSource.match(/function markerPreviewHtml\(place\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.match(markerPreviewBody, /place\.name/, "marker preview should include place name");
assert.match(markerPreviewBody, /place\.category/, "marker preview should include category/type");
assert.match(markerPreviewBody, /place\.city/, "marker preview should include city or area");
assert.doesNotMatch(markerPreviewBody, /email|hours|sourceSheet|GlobalID|approvalStatus|editDate|lat|lng/);

assert.match(stylesSource, /\.marker-preview-popup/, "marker preview popup should have dedicated styling");
assert.match(stylesSource, /\.marker-preview-kicker/, "marker preview should label the place kind");

console.log("V1 Marker Preview contract ok");
