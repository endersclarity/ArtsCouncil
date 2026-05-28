const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);

assert.doesNotMatch(appSource, /id:\s*"cluster-count"/, "ordinary place density should not render as numbered clusters");
assert.doesNotMatch(appSource, /point_count_abbreviated/, "ordinary place density should not expose cluster count labels");

assert.match(appSource, /id:\s*"place-density"/, "map should expose a restrained density-dot place layer");
assert.match(appSource, /"circle-radius":\s*\[[\s\S]*\["zoom"\][\s\S]*\]/, "density dots should stay small across broad and medium zoom");
assert.match(appSource, /"circle-opacity":\s*\[[\s\S]*currentContext[\s\S]*sampler[\s\S]*\]/, "density dots should quietly emphasize current-context and sampler places");
assert.match(appSource, /sampler:\s*state\.browseSamplerPlaceIds\.includes\(place\.id\)/, "place features should mark first-load sampler places");
assert.match(appSource, /currentContext:\s*isCurrentContextPlace\(place\)/, "place features should mark current-context places");

assert.match(appSource, /id:\s*"place-points"[\s\S]*filter:\s*\["any",\s*\["get",\s*"selected"\],\s*\["get",\s*"anchor"\],\s*\["get",\s*"musePick"\],\s*\["get",\s*"sampler"\],\s*\["get",\s*"currentContext"\]\]/, "emphasis layer should only lift selected, anchor, MUSE, sampler, and current-context places");
assert.doesNotMatch(appSource, /"text-field":\s*\["get",\s*"category"\]/, "constellation disclosure should avoid category icon soup");

assert.match(appSource, /id:\s*"event-points"/, "event marker meaning should remain separate from ordinary place density");
assert.match(appSource, /id:\s*"path-line"/, "path marker meaning should remain separate from ordinary place density");

console.log("V1 Constellation Disclosure contract ok");
