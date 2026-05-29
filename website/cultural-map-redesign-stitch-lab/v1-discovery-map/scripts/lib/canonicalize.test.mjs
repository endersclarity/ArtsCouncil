import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalizePlaces, canonicalKey } from "./canonicalize.mjs";

// Behavior: two records that are the SAME place under different slugs (id-dedupe
// can't catch them) collapse into one. "The Center for the Arts" (census coord)
// and "Center for the Arts" (Diana coord) are one venue. The survivor keeps the
// Diana coordinate and — because an anchor card references the "the-" id — keeps
// THAT id so the anchor is not orphaned.
test("collapses a leading-article slug variant, preserving the referenced id + Diana coord", () => {
  const rows = [
    {
      id: "center-for-the-arts-grass-valley",
      name: "Center for the Arts", city: "Grass Valley",
      coordinateSource: "diana-workbook-webmercator", coordinateConfidence: "authoritative",
      lat: 39.219196, lng: -121.064316,
    },
    {
      id: "the-center-for-the-arts-grass-valley",
      name: "The Center for the Arts", city: "Grass Valley",
      coordinateSource: "us-census-geocoder", coordinateConfidence: "medium",
      lat: 39.219199, lng: -121.063916,
      anchor: { label: "Grass Valley performance anchor" },
    },
  ];
  const referencedIds = new Set(["the-center-for-the-arts-grass-valley"]);

  const out = canonicalizePlaces(rows, { referencedIds });

  assert.equal(out.length, 1, "two slugs for one place collapse to a single record");
  const place = out[0];
  assert.equal(place.id, "the-center-for-the-arts-grass-valley", "survivor keeps the referenced id");
  assert.equal(place.coordinateConfidence, "authoritative", "Diana coordinate wins");
  assert.equal(place.lat, 39.219196);
  assert.ok(place.anchor, "anchor enrichment is preserved");
});

// Behavior: when neither slug is referenced by an anchor/path, the survivor keeps
// the merge winner's id (the higher-confidence row).
test("for an unreferenced cluster, the higher-confidence row's id survives", () => {
  const rows = [
    {
      id: "the-holbrooke-hotel-grass-valley",
      name: "The Holbrooke Hotel", city: "Grass Valley",
      coordinateSource: "us-census-geocoder", coordinateConfidence: "medium",
      lat: 39.2188, lng: -121.0599,
    },
    {
      id: "holbrooke-hotel-grass-valley",
      name: "Holbrooke Hotel", city: "Grass Valley",
      coordinateSource: "diana-workbook-lonlat", coordinateConfidence: "authoritative",
      lat: 39.2189, lng: -121.0600,
    },
  ];

  const out = canonicalizePlaces(rows, { referencedIds: new Set() });

  assert.equal(out.length, 1);
  assert.equal(out[0].id, "holbrooke-hotel-grass-valley", "winner (Diana) id survives");
});

// Behavior: apostrophe variants fold to the same canonical key.
test("folds apostrophe variants together", () => {
  const rows = [
    { id: "mcgee-s-annex-nevada-city", name: "McGee's Annex", city: "Nevada City",
      coordinateSource: "us-census-geocoder", coordinateConfidence: "medium", lat: 39.26, lng: -121.01 },
    { id: "mcgees-annex-nevada-city", name: "McGees Annex", city: "Nevada City",
      coordinateSource: "diana-workbook-lonlat", coordinateConfidence: "authoritative", lat: 39.26, lng: -121.01 },
  ];
  const out = canonicalizePlaces(rows, { referencedIds: new Set() });
  assert.equal(out.length, 1);
});

// Behavior (the safety guard): two records that share a normalized name in the same
// city but sit far apart are NOT the same place — they must NOT be merged.
test("does not merge same-named places that are far apart", () => {
  const rows = [
    { id: "gallery-grass-valley", name: "Gallery", city: "Grass Valley",
      coordinateSource: "diana-workbook-lonlat", coordinateConfidence: "authoritative", lat: 39.219, lng: -121.063 },
    { id: "gallery-2-grass-valley", name: "Gallery", city: "Grass Valley",
      coordinateSource: "diana-workbook-lonlat", coordinateConfidence: "authoritative", lat: 39.260, lng: -121.010 },
  ];
  const out = canonicalizePlaces(rows, { referencedIds: new Set() });
  assert.equal(out.length, 2, "distinct places sharing a name stay separate");
});

// Behavior: an event hosted AT a venue has a distinct name and must not be folded
// into the venue (its normalized name differs).
test("keeps an event-host record distinct from the venue", () => {
  const rows = [
    { id: "the-center-for-the-arts-grass-valley", name: "The Center for the Arts", city: "Grass Valley",
      coordinateSource: "diana-workbook-lonlat", coordinateConfidence: "authoritative", lat: 39.2192, lng: -121.0643 },
    { id: "fall-colors-tour-host-center-for-the-arts-grass-valley",
      name: "Fall Colors Open Studio Tour (host:Center for the Arts)", city: "Grass Valley",
      coordinateSource: "diana-workbook-lonlat", coordinateConfidence: "authoritative", lat: 39.2192, lng: -121.0643 },
  ];
  const out = canonicalizePlaces(rows, { referencedIds: new Set() });
  assert.equal(out.length, 2, "the event stays separate from the venue");
});
