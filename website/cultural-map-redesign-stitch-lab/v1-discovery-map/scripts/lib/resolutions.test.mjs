import { test } from "node:test";
import assert from "node:assert/strict";
import { applyResolutions } from "./resolutions.mjs";

// Behavior: when a human has reviewed a flagged coordinate conflict and confirmed
// the correct location, applyResolutions pins that record to the verified
// coordinate (and address), promotes it to a trusted Map-Ready tier, and clears
// the coordinateConflict flag so it is no longer surfaced for review.
test("pins a record to a human-verified coordinate and clears the conflict", () => {
  const places = [
    {
      id: "north-star-house-grass-valley",
      coordinateSource: "diana-workbook-lonlat",
      coordinateProvenance: "diana",
      markerTier: "map-ready",
      address: "12075 Old Auburn Rd",
      lat: 39.1944, lng: -121.0764, // the wrong outlier the auto-merge picked
      coordinateConflict: true,
    },
  ];
  const resolutions = {
    "north-star-house-grass-valley": {
      lat: 39.196523, lng: -121.077862,
      address: "12075 Auburn Rd",
      note: "human-confirmed 2026-05-28",
    },
  };

  const [place] = applyResolutions(places, resolutions);

  assert.equal(place.lat, 39.196523);
  assert.equal(place.lng, -121.077862);
  assert.equal(place.address, "12075 Auburn Rd");
  assert.equal(place.coordinateProvenance, "human-verified");
  assert.equal(place.markerTier, "map-ready");
  assert.equal(place.locationReviewStatus, "Map-Ready");
  assert.equal(place.publicMarker, true);
  assert.equal(place.coordinateConflict, undefined, "conflict flag is cleared once resolved");
});

// Behavior: records without a resolution pass through untouched.
test("leaves unresolved records untouched", () => {
  const places = [{ id: "other-place", lat: 1, lng: 2 }];
  const [place] = applyResolutions(places, { "north-star-house-grass-valley": { lat: 0, lng: 0 } });
  assert.deepEqual(place, { id: "other-place", lat: 1, lng: 2 });
});
