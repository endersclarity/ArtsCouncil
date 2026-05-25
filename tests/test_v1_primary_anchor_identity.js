const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const mapDataDir = path.join(
  repoRoot,
  "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data",
);

const anchorCards = JSON.parse(
  fs.readFileSync(path.join(mapDataDir, "anchor_cards.json"), "utf8"),
);
const places = JSON.parse(fs.readFileSync(path.join(mapDataDir, "places.json"), "utf8"));

const primaryAnchorNames = [
  "The Center for the Arts",
  "Nevada Theatre",
  "North Star House",
  "Empire Mine",
  "Art Works Gallery",
  "The Curious Forge",
];

const cardsByName = new Map(anchorCards.map((card) => [card.name, card]));
const promotedCards = anchorCards.filter((card) => card.promoteAsAnchor);
const anchoredPlaces = places.filter((place) => place.anchor);

assert.deepEqual(
  promotedCards.map((card) => card.name).sort(),
  [...primaryAnchorNames].sort(),
  "only the six Primary Anchor Set records should be promoted as cultural anchors",
);

assert.deepEqual(
  anchoredPlaces.map((place) => place.name).sort(),
  [...primaryAnchorNames].sort(),
  "only the six Primary Anchor Set places should carry embedded anchor identity",
);

for (const [index, name] of primaryAnchorNames.entries()) {
  const card = cardsByName.get(name);
  const place = places.find((candidate) => candidate.name === name);
  assert.ok(card, `${name} should have an Anchor Card record`);
  assert.ok(place, `${name} should have a place record`);
  assert.equal(card.promoteAsAnchor, true, `${name} should be promoted`);
  assert.equal(card.priority, index + 1, `${name} should have stable primary priority`);
  assert.match(card.anchorLabel || "", /\S/, `${name} should have an anchor label`);
  assert.match(card.hook || "", /\S/, `${name} should have a cultural hook`);
  assert.match(card.whyItMatters || "", /\S/, `${name} should have why-it-matters copy`);
  assert.match(card.website || "", /^https?:\/\//, `${name} should have a website action`);
  assert.match(card.iconKey || "", /\S/, `${name} should have an icon key`);
  assert.ok(card.image, `${name} should have image proof`);
  assert.equal(card.image.kind, "real", `${name} should use real image proof`);
  assert.equal(card.image.status, "credible", `${name} should use credible image proof`);
  assert.match(card.image.src || "", /^assets\/anchors\//, `${name} should use anchor image assets`);
  assert.doesNotMatch(card.image.src || "", /placeholders|watercolor|logo|logomark|brandmark/i, `${name} should not use placeholder, category, or logo imagery`);

  assert.equal(place.anchor.priority, index + 1, `${name} place anchor should match primary priority`);
  assert.equal(place.anchor.label, card.anchorLabel, `${name} place anchor label should match card label`);
  assert.equal(place.anchor.hook, card.hook, `${name} place anchor hook should match card hook`);
  assert.equal(place.anchor.iconKey, card.iconKey, `${name} place anchor icon should match card icon`);
  assert.ok(place.image, `${name} place should have embedded image proof`);
  assert.equal(place.image.kind, "real", `${name} place should use real image proof`);
  assert.equal(place.image.status, "credible", `${name} place should use credible image proof`);
  assert.match(place.image.src || "", /^assets\/anchors\//, `${name} place should use anchor image assets`);
  assert.doesNotMatch(place.image.src || "", /placeholders|watercolor|logo|logomark|brandmark/i, `${name} place should not use placeholder, category, or logo imagery`);
}

console.log("Primary Anchor identity contract ok");
