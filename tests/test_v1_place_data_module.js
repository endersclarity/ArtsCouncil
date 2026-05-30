const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Load the place-data UMD module into an isolated sandbox (mirrors the project's
// existing model-module test pattern), then read its exports off the sandbox window.
const modulePath = path.resolve(
  __dirname,
  "../website/cultural-map-redesign-stitch-lab/v1-discovery-map/place-data.js",
);
const sandbox = { window: {}, module: { exports: {} } };
vm.runInNewContext(fs.readFileSync(modulePath, "utf8"), sandbox);
const PlaceData = sandbox.module.exports;

// Test doubles for the dependencies app.js injects, so the module stays pure.
const opts = {
  resolveMedia: (src) => (/^https?:\/\//.test(src) ? src : `../${src}`),
  categoryPlaceholderFor: (category) =>
    ({ "Galleries & Studios": "assets/cat/galleries.png" }[category] || ""),
  defaultPlaceholder: "assets/placeholders/gallery-studio.webp",
};

test("resolvePlaceImage: a real image resolves as Image Proof", () => {
  const place = {
    id: "p1",
    category: "Galleries & Studios",
    image: { kind: "real", src: "https://lh3.googleusercontent.com/x", alt: "X", credit: "via Google" },
  };
  const result = PlaceData.resolvePlaceImage(place, opts);
  assert.equal(result.isRealImage, true);
  assert.equal(result.src, "https://lh3.googleusercontent.com/x");
  assert.equal(result.status, "real");
});

test("resolvePlaceImage: a kind=placeholder entry uses the NCAC category placeholder, not its stale placeholderSrc", () => {
  // Matches the live app: for kind="placeholder" the stale per-record placeholderSrc
  // is ignored in favor of the nicer category placeholder art.
  const place = {
    id: "p2",
    category: "Galleries & Studios",
    image: { kind: "placeholder", placeholderSrc: "assets/placeholders/gallery-studio.webp", status: "missing" },
  };
  const result = PlaceData.resolvePlaceImage(place, opts);
  assert.equal(result.isRealImage, false);
  assert.equal(result.src, "../assets/cat/galleries.png");
  assert.equal(result.status, "placeholder");
});

test("resolvePlaceImage: a non-real image with an explicit src (no kind) uses that src", () => {
  const place = {
    id: "p2b",
    category: "Galleries & Studios",
    image: { src: "assets/custom/special.png" },
  };
  const result = PlaceData.resolvePlaceImage(place, opts);
  assert.equal(result.isRealImage, false);
  assert.equal(result.src, "../assets/custom/special.png");
});

test("resolvePlaceImage: no image falls back to the category placeholder", () => {
  const place = { id: "p3", category: "Galleries & Studios" };
  const result = PlaceData.resolvePlaceImage(place, opts);
  assert.equal(result.isRealImage, false);
  assert.equal(result.src, "../assets/cat/galleries.png");
  assert.equal(result.status, "placeholder");
});

test("resolvePlaceImage: an unknown category falls back to the default placeholder", () => {
  const place = { id: "p4", category: "Nonexistent Category" };
  const result = PlaceData.resolvePlaceImage(place, opts);
  assert.equal(result.isRealImage, false);
  assert.equal(result.src, "../assets/placeholders/gallery-studio.webp");
  assert.equal(result.status, "placeholder");
});

test("placeById: indexed lookup returns the place, or undefined when absent", () => {
  const places = [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }];
  const index = PlaceData.buildPlaceIndex(places);
  assert.equal(PlaceData.placeById(index, "b").name, "Beta");
  assert.equal(PlaceData.placeById(index, "missing"), undefined);
});

const problemsOfType = (places, type) =>
  PlaceData.findPlaceDataProblems(places).filter((p) => p.type === type);

test("findPlaceDataProblems: flags duplicate ids", () => {
  const dupes = problemsOfType(
    [{ id: "x", name: "One" }, { id: "x", name: "Two" }, { id: "y", name: "Three" }],
    "duplicate-id",
  );
  assert.equal(dupes.length, 1);
  assert.equal(dupes[0].id, "x");
});

test("findPlaceDataProblems: flags Canonical Place name+city collisions (id differs)", () => {
  const collisions = problemsOfType(
    [
      { id: "1", name: "Arquils Wine", city: "Grass Valley" },
      { id: "2", name: "Arquils  WINERY", city: "Grass Valley" },
    ],
    "canonical-name-collision",
  );
  // normalized "arquilswine"/"arquilswinery" differ — should NOT collide on exact-normalized
  assert.equal(collisions.length, 0);
  const exact = problemsOfType(
    [
      { id: "1", name: "The Union", city: "Grass Valley" },
      { id: "2", name: "the  union", city: "Grass Valley" },
    ],
    "canonical-name-collision",
  );
  assert.equal(exact.length, 1);
});

test("findPlaceDataProblems: flags invalid image.kind", () => {
  const bad = problemsOfType(
    [{ id: "1", image: { kind: "real", src: "x" } }, { id: "2", image: { kind: "wat" } }],
    "invalid-image-kind",
  );
  assert.equal(bad.length, 1);
  assert.equal(bad[0].id, "2");
});

test("findPlaceDataProblems: flags map-ready places with non-finite coordinates", () => {
  const bad = problemsOfType(
    [
      { id: "1", markerTier: "map-ready", lat: 39.2, lng: -121.0 },
      { id: "2", markerTier: "map-ready", lat: null, lng: -121.0 },
    ],
    "map-ready-missing-coord",
  );
  assert.equal(bad.length, 1);
  assert.equal(bad[0].id, "2");
});
