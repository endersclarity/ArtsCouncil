const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const modelPath = path.resolve(
  __dirname,
  "../website/cultural-map-redesign/index-maplibre-map-data-model.js",
);
const exploreModelPath = path.resolve(
  __dirname,
  "../website/cultural-map-redesign/index-maplibre-explore-model.js",
);
const mapFilterModelPath = path.resolve(
  __dirname,
  "../website/cultural-map-redesign/index-maplibre-map-filter-model.js",
);
const dataPath = path.resolve(
  __dirname,
  "../website/cultural-map-redesign/data.json",
);

const sandbox = { window: {}, requestAnimationFrame: (fn) => fn() };
vm.runInNewContext(fs.readFileSync(modelPath, "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(exploreModelPath, "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(mapFilterModelPath, "utf8"), sandbox);

const { normalizeAssetData } = sandbox.window.CulturalMapMapDataModel;
const { getFilteredData } = sandbox.window.CulturalMapExploreModel;
const { getFitCandidates } = sandbox.window.CulturalMapMapFilterModel;

assert.equal(typeof normalizeAssetData, "function");

const fixture = [
  {
    n: "Nevada County Fair",
    l: "Fairs & Festivals",
    pid: "fairgrounds",
    a: "11228 McCourtney Rd",
    c: "Grass Valley",
    d: "Annual fair",
    x: -121.063,
    y: 39.207,
  },
  {
    n: "Nevada County Fairgrounds",
    l: "Performance Spaces",
    pid: "fairgrounds",
    a: "11228 McCourtney Rd",
    c: "Grass Valley",
    d: "Large event venue",
    x: -121.063,
    y: 39.207,
  },
  {
    n: "Strawberry Music Festival",
    l: "Fairs & Festivals",
    pid: "fairgrounds",
    a: "11228 McCourtney Rd",
    c: "Grass Valley",
    d: "Music festival",
    x: -121.063,
    y: 39.207,
  },
  {
    n: "Golden Era Lounge",
    l: "Eat, Drink & Stay",
    pid: "golden-era",
    a: "309 Broad St",
    c: "Nevada City",
    d: "Cocktails",
    x: -121.019,
    y: 39.263,
  },
];

const normalizedFixture = normalizeAssetData(fixture);
assert.equal(normalizedFixture.length, 2);

const fairgrounds = normalizedFixture.find((asset) => asset.pid === "fairgrounds");
assert.ok(fairgrounds, "fairgrounds group should survive as one canonical asset");
assert.equal(fairgrounds.n, "Nevada County Fairgrounds");
assert.deepEqual(Array.from(fairgrounds.source_indices), [0, 1, 2]);
assert.deepEqual(Array.from(fairgrounds.categories), ["Performance Spaces", "Fairs & Festivals"]);
assert.ok(fairgrounds.aliases.includes("Nevada County Fair"));
assert.ok(fairgrounds.aliases.includes("Strawberry Music Festival"));
assert.match(fairgrounds.search_text, /Strawberry Music Festival/);

const fairsFiltered = getFilteredData({
  data: normalizedFixture,
  activeCategories: new Set(["Fairs & Festivals"]),
  query: "",
  openNowMode: false,
  events14dMode: false,
  getHoursState: () => "unknown",
  getHoursRank: () => 0,
  getEventCountForAsset14d: () => 0,
});

assert.equal(fairsFiltered.length, 1);
assert.equal(fairsFiltered[0].n, "Nevada County Fairgrounds");

const aliasSearch = getFilteredData({
  data: normalizedFixture,
  activeCategories: new Set(),
  query: "strawberry",
  openNowMode: false,
  events14dMode: false,
  getHoursState: () => "unknown",
  getHoursRank: () => 0,
  getEventCountForAsset14d: () => 0,
});

assert.equal(aliasSearch.length, 1);
assert.equal(aliasSearch[0].n, "Nevada County Fairgrounds");

const fitCandidates = getFitCandidates({
  data: normalizedFixture,
  activeCategories: new Set(["Fairs & Festivals"]),
  openNowMode: false,
  events14dMode: false,
  getHoursState: () => "unknown",
  getEventCountForAsset14d: () => 0,
});

assert.equal(fitCandidates.length, 1);
assert.equal(fitCandidates[0].n, "Nevada County Fairgrounds");

const geojson = sandbox.window.CulturalMapMapDataModel.buildAssetsGeoJSON({
  data: normalizedFixture,
  cats: {
    "Performance Spaces": { color: "#111" },
    "Fairs & Festivals": { color: "#222" },
    "Eat, Drink & Stay": { color: "#333" },
  },
  getHoursState: () => "unknown",
  getHoursLabel: () => "Hours unknown",
  getEventCountForAsset14d: () => 0,
});

const fairgroundsFeature = geojson.features.find((feature) => (
  feature.properties.name === "Nevada County Fairgrounds"
));
assert.deepEqual(Array.from(fairgroundsFeature.properties.layers), [
  "Performance Spaces",
  "Fairs & Festivals",
]);

const rawData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const normalizedData = normalizeAssetData(rawData);
const duplicatePids = new Map();

for (const asset of normalizedData) {
  if (!asset.pid) continue;
  duplicatePids.set(asset.pid, (duplicatePids.get(asset.pid) || 0) + 1);
}

const repeatedPidCount = Array.from(duplicatePids.values()).filter((count) => count > 1).length;

assert.equal(repeatedPidCount, 0, "normalized map data should not repeat Google Place IDs");
assert.ok(
  normalizedData.length < rawData.length - 150,
  "normalization should remove the visible repeat-place pollution",
);

console.log("V1 canonical asset dedupe contract ok");
