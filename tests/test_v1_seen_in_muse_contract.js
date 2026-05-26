const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);
const evidence = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_evidence_links.json"),
    "utf8",
  ),
);
const places = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json"),
    "utf8",
  ),
);

assert.match(appSource, /museEvidence: "data\/muse_evidence_links\.json"/, "app should load the MUSE evidence links data");
assert.match(appSource, /function buildDirectMuseEvidenceByPlace\(evidence\)/, "app should index direct MUSE evidence by place id");
assert.match(appSource, /function renderSeenInMuse\(place\)/, "app should render Seen in MUSE cards");
assert.match(appSource, /\$\{renderSeenInMuse\(place\)\}/, "Selected Directory Cards should include Seen in MUSE output");

const indexBody = appSource.match(/function buildDirectMuseEvidenceByPlace\(evidence\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.match(indexBody, /link\.target_type !== "place"/, "place cards should ignore theme evidence");
assert.match(indexBody, /link\.match_type !== "exact"/, "place cards should ignore fuzzy matches");
assert.match(indexBody, /link\.is_direct_evidence !== true/, "place cards should require direct evidence");
assert.match(indexBody, /!link\.target_id/, "place cards should ignore empty place ids");

const directLinks = evidence.links.filter((link) => (
  link.target_type === "place" &&
  link.match_type === "exact" &&
  link.is_direct_evidence === true &&
  link.target_id &&
  link.article
));
const directPlaceIds = new Set(directLinks.map((link) => link.target_id));
const placeIds = new Set(places.map((place) => place.id));

assert.ok(directLinks.length > 300, "MUSE evidence should include substantial direct place coverage");
assert.ok(directPlaceIds.size > 150, "MUSE direct evidence should cover many V1 places");
assert.ok([...directPlaceIds].every((id) => placeIds.has(id)), "direct MUSE place ids should resolve to V1 places");
assert.ok(
  directLinks.some((link) => link.target_id === "nevada-city-film-festival-nevada-city"),
  "fixture should include a browser-verifiable direct match",
);
assert.ok(
  !directLinks.some((link) => link.target_id === "air-aligned-aerial-arts-academy-grass-valley"),
  "negative fixture should have no direct MUSE place evidence",
);
assert.ok(
  evidence.links.some((link) => link.target_type === "theme" && link.is_direct_evidence),
  "source data should still include theme evidence that the card index excludes",
);
assert.ok(
  evidence.links.some((link) => link.target_type === "place" && link.is_direct_evidence === false),
  "source data should still include fuzzy place evidence that the card index excludes",
);

const renderBody = appSource.match(/function renderSeenInMuse\(place\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.match(renderBody, /article\.title/, "Seen in MUSE should cite article title");
assert.match(renderBody, /museArticleContext\(article\)/, "Seen in MUSE should include issue and page context");
assert.match(renderBody, /source_confidence/, "Seen in MUSE should expose available confidence context");
assert.doesNotMatch(renderBody, /thematic_matches|fuzzy|theme/, "Seen in MUSE rendering should not promote non-direct matches");

assert.match(stylesSource, /\.seen-in-muse/, "Seen in MUSE should have compact dedicated styling");

console.log("V1 Seen in MUSE contract ok");
