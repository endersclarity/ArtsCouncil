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

const forbiddenVisibleCopy = /internal alpha|alpha review|review list|visible places|prototype|stakeholder/i;

const acceptedFirstViewportCopy = [
  "Nevada County Cultural Map",
  "Browse cultural places, stories, and events across Grass Valley and Nevada City.",
  "Places to explore",
  "Search places",
];

for (const copy of acceptedFirstViewportCopy) {
  assert.ok(htmlSource.includes(copy), `first viewport should include "${copy}"`);
}

const panelToplineCopy = htmlSource.match(/<div class="panel-topline">([\s\S]*?)<\/div>/)?.[1] || "";
assert.match(panelToplineCopy, /Nevada County Cultural Map/, "visible panel header should carry the public map title");
assert.match(
  panelToplineCopy,
  /Browse cultural places, stories, and events across Grass Valley and Nevada City\./,
  "visible panel header should carry the public beta subtitle",
);

assert.match(appSource, /Show places in this area/, "dense-map action should use public beta copy");
assert.match(appSource, /Place details/, "selected place drawer should use public beta details label");
assert.match(appSource, /In the pages of MUSE Magazine/, "selected place drawer should carry the citizen-voiced MUSE credit");

const countRuntimeCopy = appSource.match(/function updateCount\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.doesNotMatch(countRuntimeCopy, /visible places/i, "first viewport count should avoid internal inventory copy");

const firstViewportRuntimeCopy = appSource.match(/function renderPlacesList\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.doesNotMatch(
  `${htmlSource}\n${countRuntimeCopy}\n${firstViewportRuntimeCopy}`,
  forbiddenVisibleCopy,
  "first viewport copy should avoid internal review/prototype language",
);

const selectedPlaceRuntimeCopy = appSource.match(/function showPlace\(place\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.doesNotMatch(
  selectedPlaceRuntimeCopy,
  forbiddenVisibleCopy,
  "selected place copy should avoid internal review/prototype language",
);

const placesById = new Map(places.map((place) => [place.id, place]));
const samplerPlaces = sampler.recommendedSampler.map((place) => placesById.get(place.id)).filter(Boolean);

assert.equal(samplerPlaces.length, 12, "public Browse Starting View sampler should still have 12 selectable places");

for (const place of samplerPlaces) {
  assert.doesNotMatch(
    [place.name, place.description, place.anchorCard?.hook, place.anchorCard?.supportingDescription]
      .filter(Boolean)
      .join("\n"),
    forbiddenVisibleCopy,
    `${place.name} selected-card copy should avoid internal review/prototype language`,
  );
}

console.log("V1 Public Beta Copy contract ok");
