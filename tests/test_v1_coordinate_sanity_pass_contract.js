const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const decisionsPath = path.join(
  root,
  "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/coordinate_sanity_pass.json",
);
const markersPath = path.join(
  root,
  "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/coordinate_sanity_markers.geojson",
);
const reportPath = path.join(root, "reports/v1-coordinate-sanity-pass-summary.json");

const pass = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));
const markers = JSON.parse(fs.readFileSync(markersPath, "utf8"));
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredFields = [
  "coordinateSource",
  "coordinateConfidence",
  "geocodedAddress",
  "matchQuality",
  "reviewNotes",
  "locationReviewStatus",
  "publicMarker",
];

assert.equal(pass.decisions.length, report.counts.dianaRows);
assert.equal(markers.features.length, report.counts.mapReadyMarkers);
assert.equal(report.rules.some((rule) => rule.includes("Arts Hub Coordinate Bridge is not read")), true);
assert.ok(report.counts.dianaCoordinates > 0, "Diana Workbook coordinates should be preserved");
assert.ok(report.counts.arcgisConfidentFallbacks > 0, "ArcGIS confident fallbacks should be present");
assert.ok("freeGeocodedCandidates" in report.counts, "free geocoder count should be reported");
assert.ok(report.counts.needsLocationReview > 0, "low-confidence rows should remain out of ordinary marker output");

for (const decision of pass.decisions) {
  for (const field of requiredFields) {
    assert.ok(field in decision, `${field} should exist on every coordinate decision`);
  }

  if (decision.publicMarker) {
    assert.equal(decision.locationReviewStatus, "Map-Ready");
    assert.equal(typeof decision.lat, "number");
    assert.equal(typeof decision.lng, "number");
  } else {
    assert.equal(decision.locationReviewStatus, "Needs Location Review");
    assert.equal(decision.coordinateConfidence, "needs-review");
    assert.equal(decision.lat, null);
    assert.equal(decision.lng, null);
  }

  if (String(decision.coordinateSource).startsWith("diana-workbook")) {
    assert.equal(decision.coordinateConfidence, "authoritative");
    assert.equal(decision.matchQuality, "direct-diana-coordinate");
  }

  if (decision.coordinateSource === "arcgis-cultural-assets-confident-match") {
    assert.equal(decision.coordinateConfidence, "high");
    assert.equal(decision.matchQuality, "normalized-name-city-unique");
    assert.match(decision.reviewNotes, /normalized name \+ city/);
  }

  if (decision.coordinateSource === "us-census-geocoder") {
    assert.equal(decision.coordinateConfidence, "medium");
    assert.match(decision.reviewNotes, /interpolated street-address/);
  }
}

const markerIds = new Set(markers.features.map((feature) => feature.properties.decisionId));
for (const decision of pass.decisions) {
  assert.equal(markerIds.has(decision.decisionId), decision.publicMarker);
}

console.log("V1 coordinate sanity pass contract ok");
