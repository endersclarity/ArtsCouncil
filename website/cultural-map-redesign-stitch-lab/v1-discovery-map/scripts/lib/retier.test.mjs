import { test } from "node:test";
import assert from "node:assert/strict";
import { retierTrust } from "./retier.mjs";

// Behavior: a census-geocoded place is an estimated Coordinate Candidate, NOT a
// Map-Ready Place. retierTrust must override the mislabeled "Map-Ready" status,
// tag it as a candidate marker, and keep the estimated caveat — while leaving it
// publicly visible (publicMarker stays true) so CLA-16 can style it distinctly.
test("re-tiers a census place as a Coordinate Candidate, not Map-Ready", () => {
  const place = {
    id: "air-aligned-aerial-arts-academy-grass-valley",
    coordinateSource: "us-census-geocoder",
    coordinateConfidence: "medium",
    lat: 39.2252, lng: -121.0379,
    publicMarker: true,
    locationReviewStatus: "Map-Ready", // the mislabel CLA-15 fixes
    locationCaveat: "Map location not confirmed - estimated",
  };

  const out = retierTrust(place);

  assert.notEqual(out.locationReviewStatus, "Map-Ready", "census is not Map-Ready");
  assert.equal(out.markerTier, "candidate");
  assert.equal(out.coordinateProvenance, "candidate");
  assert.equal(out.publicMarker, true, "candidates stay visible");
  assert.equal(out.locationCaveat, "Map location not confirmed - estimated");
});

// Behavior: a Diana-workbook place is a trusted Map-Ready Place with no routine caveat.
test("re-tiers a Diana place as a trusted Map-Ready Place", () => {
  const out = retierTrust({
    id: "north-star-house-grass-valley",
    coordinateSource: "diana-workbook-lonlat",
    coordinateConfidence: "authoritative",
    lat: 39.196523, lng: -121.077862,
    locationCaveat: "Map location not confirmed - estimated", // stale, should be cleared
  });

  assert.equal(out.locationReviewStatus, "Map-Ready");
  assert.equal(out.markerTier, "map-ready");
  assert.equal(out.coordinateProvenance, "diana");
  assert.equal(out.publicMarker, true);
  assert.equal(out.locationCaveat, "", "trusted coords carry no routine caveat");
});

// Behavior: an ArcGIS-confident match is also Map-Ready, tagged with its own provenance.
test("re-tiers an ArcGIS-confident match as Map-Ready", () => {
  const out = retierTrust({
    id: "tahoe-truckee-school-of-music-truckee",
    coordinateSource: "arcgis-cultural-assets-confident-match",
    coordinateConfidence: "high",
    lat: 39.32, lng: -120.18,
  });

  assert.equal(out.locationReviewStatus, "Map-Ready");
  assert.equal(out.coordinateProvenance, "arcgis-confident");
  assert.equal(out.markerTier, "map-ready");
});

// Behavior: a place with no coordinate is Directory-Only — listed but not mapped.
test("re-tiers a coordinate-less place as Directory-Only", () => {
  const out = retierTrust({
    id: "some-po-box-place-grass-valley",
    coordinateSource: "none",
    coordinateConfidence: "needs-review",
    lat: null, lng: null,
  });

  assert.equal(out.publicMarker, false, "directory-only places are not mapped");
  assert.equal(out.markerTier, "directory-only");
  assert.equal(out.coordinateProvenance, "none");
  assert.equal(out.locationCaveat, "Map location coming soon");
});

// Behavior (defensive): a row claiming a trusted source but missing coordinates is
// still Directory-Only — we never invent a marker from a missing coordinate.
test("treats a trusted-source row with missing coords as Directory-Only", () => {
  const out = retierTrust({
    id: "broken-diana-row",
    coordinateSource: "diana-workbook-lonlat",
    coordinateConfidence: "authoritative",
    lat: null, lng: undefined,
  });

  assert.equal(out.publicMarker, false);
  assert.equal(out.markerTier, "directory-only");
});
