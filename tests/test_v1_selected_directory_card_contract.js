const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);
const indexSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html"),
  "utf8",
);
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);

assert.match(appSource, /function directoryRecordMeta\(place\)/, "app should render baseline Directory Record facts");
assert.match(appSource, /place\.address/, "Selected Directory Cards should include address when available");
assert.match(appSource, /place\.phone/, "Selected Directory Cards should include phone when available");
assert.match(appSource, /place\.website/, "Selected Directory Cards should include website when available");
assert.match(appSource, /tel:\$\{escapeHtml\(place\.phone\.replace/, "phone numbers should be actionable with tel links");
assert.match(appSource, /\$\{directoryRecordMeta\(place\)\}/, "showPlace should include Directory Record facts");
assert.match(appSource, /function revealDetailCard\(\)/, "marker selections should reveal the clicked-place card");
assert.match(appSource, /revealDetailCard\(\);\n    updateReviewUrl\(\);/, "showPlace should scroll the selected card into view before updating URL state");
assert.match(indexSource, /<div class="selection-drawer" id="selection-drawer"/, "selected place details should live in a separate desktop Selection Drawer");
assert.match(appSource, /class="selected-place-close"/, "selected place drawer should have a close action");
assert.match(appSource, /aria-current="\$\{place\.id === state\.selectedPlaceId \? "true" : "false"\}"/, "selected Directory Browser item should remain clear while the drawer is open");
assert.doesNotMatch(appSource, /context-rail|breadcrumb-dashboard|numbered-context/i, "desktop selection should not add a Context Rail or breadcrumb dashboard");

const directoryRecordMetaBody = appSource.match(/function directoryRecordMeta\(place\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.doesNotMatch(directoryRecordMetaBody, /email|hours|sourceSheet|GlobalID|approvalStatus|editDate/);

assert.match(stylesSource, /\.directory-record-meta/, "Directory Record facts should have dedicated styling");
assert.match(stylesSource, /\.selection-drawer/, "desktop Selection Drawer should have dedicated styling");
assert.match(stylesSource, /\.selection-drawer\.open/, "selected place should open the Selection Drawer");
assert.match(stylesSource, /\.selection-drawer \.detail-card/, "selected place card should be styled inside the drawer");
assert.match(stylesSource, /@media \(max-width: 880px\)[\s\S]*\.selection-drawer/, "mobile should adapt selected place details into a bottom sheet");

console.log("V1 Selected Directory Card contract ok");
