import { test } from "node:test";
import assert from "node:assert/strict";
import { dedupePlaces } from "./dedupe.mjs";

// Behavior: two listings of the SAME place (same id) at the SAME trust tier
// collapse into one record, and enrichment from both listings is unioned.
// (Diana cross-lists the same place across category sheets — e.g. an arts org
// that also appears on the MUSE sheet — producing duplicate ids.)
test("collapses a same-tier duplicate id into one record with unioned enrichment", () => {
  const rows = [
    {
      id: "art-works-gallery-grass-valley",
      coordinateDecisionId: "art-works-gallery-grass-valley--arts org table--row-12",
      name: "Art Works Gallery",
      city: "Grass Valley",
      coordinateSource: "us-census-geocoder",
      coordinateConfidence: "medium",
      lat: 39.219, lng: -121.063,
      musePick: false,
      description: "A co-op gallery.",
      website: "https://artworks.example",
      address: "113 Mill St",
    },
    {
      id: "art-works-gallery-grass-valley",
      coordinateDecisionId: "art-works-gallery-grass-valley--muse bd table--row-378",
      name: "Art Works Gallery",
      city: "Grass Valley",
      coordinateSource: "us-census-geocoder",
      coordinateConfidence: "medium",
      lat: 39.219, lng: -121.063,
      musePick: true,
      description: "",
      phone: "530-555-0100",
    },
  ];

  const out = dedupePlaces(rows);

  assert.equal(out.length, 1, "two listings of one id collapse to a single record");
  const place = out[0];
  assert.equal(place.id, "art-works-gallery-grass-valley");
  // enrichment unioned across both listings
  assert.equal(place.musePick, true, "musePick is OR'd across listings");
  assert.equal(place.website, "https://artworks.example", "website preserved from listing A");
  assert.equal(place.phone, "530-555-0100", "phone preserved from listing B");
  // a real (non-empty) description wins over an empty one
  assert.equal(place.description, "A co-op gallery.");
});

// Behavior: when one listing of an id is Diana (authoritative) and another is
// census (medium), the collapsed record keeps the Diana coordinate + provenance.
test("cross-tier duplicate keeps the higher-confidence (Diana) coordinate", () => {
  const rows = [
    {
      id: "north-star-house-grass-valley",
      coordinateDecisionId: "north-star-house--census--row-5",
      name: "North Star House",
      coordinateSource: "us-census-geocoder",
      coordinateConfidence: "medium",
      lat: 39.1980, lng: -121.0760,
    },
    {
      id: "north-star-house-grass-valley",
      coordinateDecisionId: "north-star-house--diana--row-9",
      name: "North Star House",
      coordinateSource: "diana-workbook-lonlat",
      coordinateConfidence: "authoritative",
      lat: 39.196523, lng: -121.077862,
    },
  ];

  const [place] = dedupePlaces(rows);

  assert.equal(place.coordinateSource, "diana-workbook-lonlat");
  assert.equal(place.coordinateConfidence, "authoritative");
  assert.equal(place.lat, 39.196523);
  assert.equal(place.lng, -121.077862);
});

// Behavior: when two listings AT THE WINNING TIER disagree on location beyond the
// co-location threshold (~50m), the merge must NOT silently pick one — it flags the
// record for human review while still choosing a deterministic coordinate.
test("flags a same-tier coordinate conflict instead of silently merging", () => {
  const rows = [
    {
      id: "nevada-county-fairgrounds-grass-valley",
      coordinateDecisionId: "fairgrounds--diana--row-1",
      name: "Nevada County Fairgrounds",
      coordinateSource: "diana-workbook-webmercator",
      coordinateConfidence: "authoritative",
      lat: 39.2050, lng: -121.0700,
      address: "11228 McCourtney Rd",
    },
    {
      id: "nevada-county-fairgrounds-grass-valley",
      coordinateDecisionId: "fairgrounds--diana--row-2",
      name: "Nevada County Fairgrounds",
      coordinateSource: "diana-workbook-webmercator",
      coordinateConfidence: "authoritative",
      lat: 39.2120, lng: -121.0700, // ~0.48 mi north — genuinely divergent
      address: "11410 McCourtney Rd",
    },
  ];

  const [place] = dedupePlaces(rows);

  assert.equal(place.coordinateConflict, true, "divergent same-tier coords are flagged");
  // still deterministic: lowest coordinateDecisionId wins the coordinate
  assert.equal(place.coordinateDecisionId, "fairgrounds--diana--row-1");
});

// Behavior: a cross-tier divergence is NOT a conflict — the lower tier's coordinate
// is simply discarded, so the winner is unambiguous.
test("does not flag a conflict when divergence is only across tiers", () => {
  const rows = [
    {
      id: "north-star-house-grass-valley",
      coordinateDecisionId: "nsh--census--row-1",
      coordinateSource: "us-census-geocoder",
      coordinateConfidence: "medium",
      lat: 39.2200, lng: -121.0900, // far from the Diana coord
    },
    {
      id: "north-star-house-grass-valley",
      coordinateDecisionId: "nsh--diana--row-2",
      coordinateSource: "diana-workbook-lonlat",
      coordinateConfidence: "authoritative",
      lat: 39.196523, lng: -121.077862,
    },
  ];

  const [place] = dedupePlaces(rows);

  assert.notEqual(place.coordinateConflict, true);
});

// Behavior: when one listing has a real image and another only a placeholder,
// the merged record keeps the real image (matters for anchor cards).
test("keeps a real image over a placeholder when merging", () => {
  const rows = [
    {
      id: "the-curious-forge-nevada-city",
      coordinateDecisionId: "forge--a",
      coordinateSource: "diana-workbook-lonlat",
      coordinateConfidence: "authoritative",
      lat: 39.26, lng: -121.0,
      image: { kind: "placeholder", src: "assets/placeholders/maker.webp" },
    },
    {
      id: "the-curious-forge-nevada-city",
      coordinateDecisionId: "forge--b",
      coordinateSource: "diana-workbook-lonlat",
      coordinateConfidence: "authoritative",
      lat: 39.26, lng: -121.0,
      image: { kind: "real", src: "assets/anchors/curious-forge.jpg" },
    },
  ];

  const [place] = dedupePlaces(rows);

  assert.equal(place.image.kind, "real");
  assert.equal(place.image.src, "assets/anchors/curious-forge.jpg");
});
