const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);
const cards = JSON.parse(fs.readFileSync(path.join(dataDir, "anchor_cards.json"), "utf8"));
const paths = JSON.parse(fs.readFileSync(path.join(dataDir, "paths.json"), "utf8"));

const supportingStopIds = [
  "nevada-city-winery-nevada-city",
  "asif-studios-grass-valley",
  "hirschman-s-pond-nevada-city",
  "north-columbia-schoolhouse-cultural-center-nevada-city",
];
const cardsById = new Map(cards.map((card) => [card.placeId, card]));
const pathStopIds = new Set(paths.flatMap((route) => route.stops.map((stop) => stop.placeId)));
const internalCopyPattern = /\b(P0|P1|confidence|demo tier|implementation priority|audit|data quality)\b/i;

assert.match(appSource, /supporting-stop-card/, "app should render a subordinate supporting-stop detail mode");
assert.match(stylesSource, /\.supporting-stop-card/, "styles should distinguish supporting stops from primary anchors");
assert.match(appSource, /Candidate image/, "candidate supporting-stop imagery should be visibly labeled");
assert.match(appSource, /Source image pending/, "missing supporting-stop imagery should be visibly labeled");

for (const id of supportingStopIds) {
  const card = cardsById.get(id);
  assert.ok(card, `${id} should have a supporting stop card record`);
  assert.equal(card.promoteAsAnchor, false, `${card.name} should not be promoted as a Primary Anchor`);
  assert.match(card.anchorLabel || "", /\S/, `${card.name} should have a subordinate label`);
  assert.match(card.hook || "", /\S/, `${card.name} should have supporting-stop hook copy`);
  assert.match(card.whyItMatters || "", /\S/, `${card.name} should explain path/layer support`);
  assert.match(card.supportingDescription || "", /\S/, `${card.name} should have clicked-card support copy`);
  assert.ok(pathStopIds.has(id), `${card.name} should appear in authored path context`);
  assert.doesNotMatch(card.anchorLabel, /primary anchor/i, `${card.name} label should not imply Primary Anchor membership`);
  assert.doesNotMatch(card.hook, internalCopyPattern, `${card.name} hook should not expose internal audit language`);
  assert.doesNotMatch(card.whyItMatters, internalCopyPattern, `${card.name} why copy should not expose internal audit language`);
  assert.doesNotMatch(card.supportingDescription, internalCopyPattern, `${card.name} support copy should not expose internal audit language`);

  if (!card.image || card.image.status === "candidate") {
    assert.match(
      card.visibleIncompleteLabel || "",
      /\S/,
      `${card.name} should label visible image/source incompleteness`,
    );
    assert.doesNotMatch(
      card.visibleIncompleteLabel,
      internalCopyPattern,
      `${card.name} visible incompleteness label should stay public-facing`,
    );
  }
}

console.log("Supporting Stop treatment contract ok");
