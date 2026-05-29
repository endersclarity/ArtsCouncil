import { test } from "node:test";
import assert from "node:assert/strict";
import { rebuildPlaces } from "./pipeline.mjs";

const fixture = () => [
  // A place cross-listed twice across category sheets, spanning census + Diana tiers.
  {
    id: "art-works-gallery-grass-valley",
    coordinateDecisionId: "aw--census",
    name: "Art Works Gallery", city: "Grass Valley",
    coordinateSource: "us-census-geocoder", coordinateConfidence: "medium",
    lat: 39.219049, lng: -121.063026, musePick: true,
  },
  {
    id: "art-works-gallery-grass-valley",
    coordinateDecisionId: "aw--diana",
    name: "Art Works Gallery", city: "Grass Valley",
    coordinateSource: "diana-workbook-webmercator", coordinateConfidence: "authoritative",
    lat: 39.218671, lng: -121.062905,
  },
  // A pure census candidate.
  {
    id: "air-aligned-grass-valley",
    coordinateDecisionId: "air--1",
    name: "Air Aligned", city: "Grass Valley",
    coordinateSource: "us-census-geocoder", coordinateConfidence: "medium",
    lat: 39.225, lng: -121.038, locationReviewStatus: "Map-Ready",
  },
  // An out-of-scope place with no coordinate.
  {
    id: "ghost-truckee",
    coordinateDecisionId: "ghost--1",
    name: "Ghost Listing", city: "Truckee",
    coordinateSource: "none", coordinateConfidence: "needs-review",
    lat: null, lng: null,
  },
];

const anchorCards = () => [{ placeId: "art-works-gallery-grass-valley" }];

test("rebuild produces one record per id with honest tiers and scope", () => {
  const { places } = rebuildPlaces(fixture(), anchorCards());

  const ids = places.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "no duplicate ids");
  assert.equal(places.length, 3);

  const aw = places.find((p) => p.id === "art-works-gallery-grass-valley");
  assert.equal(aw.coordinateProvenance, "diana", "cross-tier dup keeps Diana");
  assert.equal(aw.locationReviewStatus, "Map-Ready");
  assert.equal(aw.musePick, true, "enrichment unioned across listings");

  const air = places.find((p) => p.id === "air-aligned-grass-valley");
  assert.equal(air.markerTier, "candidate");
  assert.notEqual(air.locationReviewStatus, "Map-Ready");

  const ghost = places.find((p) => p.id === "ghost-truckee");
  assert.equal(ghost.publicMarker, false, "no-coord place is directory-only");
  assert.equal(ghost.inGvncScope, false, "Truckee is out of scope but kept");
});

test("rebuild reports counts and anchor warnings", () => {
  const { report, warnings } = rebuildPlaces(fixture(), anchorCards());
  assert.equal(report.uniquePlaces, 3);
  assert.equal(report.mapReady, 1); // Art Works (Diana) — air is candidate, ghost directory
  assert.equal(report.candidates, 1);
  assert.equal(report.directoryOnly, 1);
  assert.equal(warnings.length, 0, "Art Works anchor resolved via its own Diana listing");
});

// Acceptance: re-running the rebuild on its own output is a no-op.
test("rebuild is idempotent", () => {
  const once = rebuildPlaces(fixture(), anchorCards());
  const twice = rebuildPlaces(once.places, anchorCards());
  assert.deepEqual(twice.places, once.places);
});
