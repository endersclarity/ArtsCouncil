const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);
const htmlSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html"),
  "utf8",
);
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);
const places = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json"),
    "utf8",
  ),
);
const sampler = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_grounded_sampler.json"),
    "utf8",
  ),
);

const expectedCopy = [
  "Nevada County Cultural Map",
  "Browse cultural places, stories, and events across Grass Valley and Nevada City.",
  "Places to explore",
  "Search places",
];

for (const text of expectedCopy) {
  assert.ok(htmlSource.includes(text), `first-load copy should include "${text}"`);
}
assert.doesNotMatch(htmlSource, /Internal alpha|stakeholder review|review list/i);

assert.ok(appSource.includes('museSampler: "data/muse_grounded_sampler.json"'));
assert.match(appSource, /browseSamplerPlaceIds/);
assert.match(appSource, /function isBrowseStartingView\(\)/);
assert.match(appSource, /function browseStartingPlaces\(\)/);
assert.match(appSource, /return browseStartingPlaces\(\);/);
assert.match(stylesSource, /\.browse-heading/);

const samplerIds = sampler.showcaseSampler.map((place) => place.id);
const firstRawIds = places.slice(0, samplerIds.length).map((place) => place.id);
assert.equal(samplerIds.length, 12, "showcase sampler fixture should provide the first-load rows");
assert.notDeepEqual(samplerIds, firstRawIds, "first-load rows should not be the raw first inventory records");

const samplerIdSet = new Set(samplerIds);
const fullInventorySearchFixture = places.find((place) => place.id === "air-aligned-aerial-arts-academy-grass-valley");
assert.ok(fullInventorySearchFixture, "full inventory fixture should exist");
assert.equal(samplerIdSet.has(fullInventorySearchFixture.id), false, "search fixture should not be in the first sampler");

const searchableText = [fullInventorySearchFixture.name, fullInventorySearchFixture.category, fullInventorySearchFixture.city, fullInventorySearchFixture.intent]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();
assert.ok(searchableText.includes("air aligned"), "full inventory fixture should remain searchable by name");

console.log("V1 Browse Starting View contract ok");
