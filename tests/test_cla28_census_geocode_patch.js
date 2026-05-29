// CLA-28 contract test — rooftop-geocode patch applied to places.json.
// Verifies the apply step (docs/issues/CLA-28-street-interpolated-rows/_apply_patch.py)
// moved ONLY the safe accepts onto their OSM coords and left everything else untouched.
//
// Run from app/:  node tests/test_cla28_census_geocode_patch.js
//
// Safe-to-apply rule (must match _apply_patch.py exactly):
//   decision === "accept"  AND  shift_m <= APPLY_MAX_SHIFT_M
// Everything else (reject-road, reject-other, no-result, no-address, and any
// accept whose shift exceeds the cutoff) keeps its original coordinate.
const fs = require("fs");
const path = require("path");

const APPLY_MAX_SHIFT_M = 150; // second gate: rejects building-typed-but-wrong-building matches
const EPS = 1e-6;

const placesPath = path.join(
  __dirname, "..", "website", "cultural-map-redesign-stitch-lab",
  "v1-discovery-map", "data", "places.json",
);
const patchPath = path.join(
  __dirname, "..", "docs", "issues", "CLA-28-street-interpolated-rows",
  "_census_patch.json",
);

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const patch = JSON.parse(fs.readFileSync(patchPath, "utf8"));

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures += 1;
  }
}

const byId = new Map(places.map((p) => [p.id, p]));
const near = (a, b) => Math.abs(a - b) <= EPS;

const isApplied = (r) =>
  r.decision === "accept" &&
  typeof r.shift_m === "number" &&
  r.shift_m <= APPLY_MAX_SHIFT_M;

let appliedCount = 0;
let keptCount = 0;
const appliedIds = new Set();

for (const r of patch) {
  const p = byId.get(r.id);
  assert(p, `patch id not found in places.json: ${r.id}`);
  if (!p) continue;

  if (isApplied(r)) {
    appliedCount += 1;
    appliedIds.add(r.id);
    // (a) coords moved to the OSM rooftop point
    assert(near(p.lat, r.osm_lat) && near(p.lng, r.osm_lng),
      `applied place did not move to OSM coords: ${r.id} (${r.name})`);
    // (a) honest provenance
    assert(p.coordinateSource === "osm-nominatim",
      `applied place missing osm-nominatim source: ${r.id} (${r.name})`);
    // (c) never apply a road fallback
    assert(!String(r.osm_kind || "").startsWith("highway"),
      `applied place came from a highway/* fallback: ${r.id} (${r.name})`);
  } else {
    keptCount += 1;
    // (b) untouched: coords still equal the pre-patch (census) coords
    assert(near(p.lat, r.cur_lat) && near(p.lng, r.cur_lng),
      `non-applied place coords changed: ${r.id} (${r.name})`);
  }
}

// (c, strong) every osm-nominatim place in the dataset must be one we applied
for (const p of places) {
  if (p.coordinateSource === "osm-nominatim") {
    assert(appliedIds.has(p.id),
      `place has osm-nominatim source but is not in the applied set: ${p.id}`);
  }
}

// (d) count unchanged
assert(places.length === 1415, `place count changed: ${places.length} (expected 1415)`);

assert(appliedCount > 0, "expected at least one applied place");

if (failures === 0) {
  console.log(
    `test_cla28_census_geocode_patch: OK ` +
    `(applied=${appliedCount}, kept=${keptCount}, total=${places.length})`,
  );
} else {
  console.error(`test_cla28_census_geocode_patch: ${failures} failure(s)`);
  process.exit(1);
}
