import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcileAnchors } from "./anchors.mjs";

// Behavior: an anchor card may point at a census-coordinate record while a Diana
// twin of the SAME physical place exists under a different id (Art Works Gallery:
// `art-works-gallery-grass-valley` is census; `art-works-gallery-co-op-grass-valley`
// carries the Diana coordinate). reconcileAnchors adopts the trusted coordinate onto
// the anchor's record so the anchor ships on a verified location — without a warning.
test("adopts a Diana twin's coordinate onto a census-coordinate anchor", () => {
  const rows = [
    {
      id: "art-works-gallery-grass-valley",
      coordinateSource: "us-census-geocoder",
      coordinateProvenance: "candidate",
      markerTier: "candidate",
      lat: 39.219049, lng: -121.063026,
      anchor: { label: "Grass Valley gallery anchor" },
    },
    {
      id: "art-works-gallery-co-op-grass-valley",
      coordinateSource: "diana-workbook-webmercator",
      coordinateProvenance: "diana",
      markerTier: "map-ready",
      lat: 39.218671, lng: -121.062905,
    },
  ];
  const anchorCards = [{ placeId: "art-works-gallery-grass-valley" }];

  const { rows: out, warnings } = reconcileAnchors(rows, anchorCards);

  const anchor = out.find((r) => r.id === "art-works-gallery-grass-valley");
  assert.equal(anchor.lat, 39.218671, "anchor adopts the Diana latitude");
  assert.equal(anchor.lng, -121.062905, "anchor adopts the Diana longitude");
  assert.equal(anchor.coordinateProvenance, "diana");
  assert.equal(anchor.markerTier, "map-ready");
  assert.equal(warnings.length, 0, "a resolved adoption produces no warning");
  // the twin is preserved, not deleted
  assert.ok(out.find((r) => r.id === "art-works-gallery-co-op-grass-valley"));
});

// Behavior: an anchor that has no trusted twin and remains on a candidate coordinate
// (The Center for the Arts, census, 314 W Main St) produces a WARNING — not a build
// failure. The map still ships; a human is told to verify.
test("warns (does not fail) for an anchor stuck on a candidate coordinate", () => {
  const rows = [
    {
      id: "the-center-for-the-arts-grass-valley",
      coordinateProvenance: "candidate",
      markerTier: "candidate",
      lat: 39.2192, lng: -121.0639,
      anchor: { label: "Grass Valley performance anchor" },
    },
  ];
  const { warnings } = reconcileAnchors(rows, [
    { placeId: "the-center-for-the-arts-grass-valley" },
  ]);

  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].placeId, "the-center-for-the-arts-grass-valley");
  assert.match(warnings[0].reason, /candidate/);
});

// Behavior: an anchor card pointing at an id that no longer resolves to any record
// (e.g. lost in a dedup) produces a warning.
test("warns when an anchor card has no matching place record", () => {
  const { warnings } = reconcileAnchors([], [{ placeId: "ghost-anchor-nevada-city" }]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0].reason, /no place record/);
});

// Behavior: an anchor already on a trusted coordinate is left untouched, no warning.
test("leaves an already-trusted anchor untouched", () => {
  const rows = [
    {
      id: "nevada-theatre-nevada-city",
      coordinateProvenance: "diana",
      markerTier: "map-ready",
      lat: 39.261, lng: -121.016,
      anchor: { label: "Historic performance anchor" },
    },
  ];
  const { rows: out, warnings } = reconcileAnchors(rows, [
    { placeId: "nevada-theatre-nevada-city" },
  ]);
  assert.equal(warnings.length, 0);
  assert.equal(out[0].lat, 39.261);
});

// Behavior: a human-verified coordinate counts as trusted — no warning. (A person
// confirming the location is at least as authoritative as the Diana workbook.)
test("treats a human-verified anchor coordinate as trusted", () => {
  const rows = [
    {
      id: "hirschman-s-pond-nevada-city",
      coordinateProvenance: "human-verified",
      markerTier: "map-ready",
      lat: 39.26844, lng: -121.02969,
      anchor: { label: "Pond anchor" },
    },
  ];
  const { warnings } = reconcileAnchors(rows, [{ placeId: "hirschman-s-pond-nevada-city" }]);
  assert.equal(warnings.length, 0);
});
