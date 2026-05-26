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

assert.match(appSource, /function directoryRecordMeta\(place\)/, "app should render baseline Directory Record facts");
assert.match(appSource, /place\.address/, "Selected Directory Cards should include address when available");
assert.match(appSource, /place\.phone/, "Selected Directory Cards should include phone when available");
assert.match(appSource, /place\.website/, "Selected Directory Cards should include website when available");
assert.match(appSource, /tel:\$\{escapeHtml\(place\.phone\.replace/, "phone numbers should be actionable with tel links");
assert.match(appSource, /\$\{directoryRecordMeta\(place\)\}/, "showPlace should include Directory Record facts");

const directoryRecordMetaBody = appSource.match(/function directoryRecordMeta\(place\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.doesNotMatch(directoryRecordMetaBody, /email|hours|sourceSheet|GlobalID|approvalStatus|editDate/);

assert.match(stylesSource, /\.directory-record-meta/, "Directory Record facts should have dedicated styling");

console.log("V1 Selected Directory Card contract ok");
