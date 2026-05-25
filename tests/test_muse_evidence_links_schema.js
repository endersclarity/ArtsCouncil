const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const corpusDir = path.join(repoRoot, "docs/muse-corpus");
const dataDir = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data");
const evidencePath = path.join(dataDir, "muse_evidence_links.json");
const placesPath = path.join(dataDir, "places.json");
const anchorCardsPath = path.join(dataDir, "anchor_cards.json");

const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const anchorCards = JSON.parse(fs.readFileSync(anchorCardsPath, "utf8"));
const placeIds = new Set(places.map((place) => place.id));
const primaryAnchorIds = anchorCards
  .filter((card) => card.promoteAsAnchor)
  .map((card) => card.placeId);

assert.equal(evidence.schema_version, 1, "MUSE evidence links schema version should be stable");
assert.ok(Array.isArray(evidence.links), "MUSE evidence links should expose a links array");
assert.ok(evidence.links.length > 0, "MUSE evidence links should not be empty");

const ids = new Set();
const placeLinks = [];
const themeLinks = [];
const fuzzyLinks = [];
const directPlaceLinks = [];

for (const link of evidence.links) {
  assert.ok(link.id, "each evidence link should have a stable id");
  assert.equal(ids.has(link.id), false, `${link.id} should be unique`);
  ids.add(link.id);

  assert.match(link.target_type, /^(place|theme)$/, `${link.id} should target a place or theme`);
  assert.ok(link.target_id, `${link.id} should include a target id`);
  assert.ok(link.target_name, `${link.id} should include a target name`);
  assert.match(link.match_type, /^(exact|theme|fuzzy)$/, `${link.id} should mark match type`);
  assert.equal(typeof link.is_direct_evidence, "boolean", `${link.id} should mark directness`);

  assert.ok(link.article, `${link.id} should include article traceability`);
  assert.match(link.article.id || "", /^muse-20\d{2}-[a-z0-9-]+$/, `${link.id} should include an article id`);
  assert.ok(Number.isInteger(link.article.issue_year), `${link.id} should include issue year`);
  assert.ok(link.article.issue, `${link.id} should include issue label`);
  assert.ok(link.article.title, `${link.id} should include article title`);

  assert.ok(Array.isArray(link.source_pages), `${link.id} should include source pages`);
  assert.ok(link.source_pages.length > 0, `${link.id} should include at least one source page`);
  for (const page of link.source_pages) {
    assert.equal(page.issue_year, link.article.issue_year, `${link.id} source page should retain issue year`);
    assert.ok(Number.isInteger(page.page), `${link.id} source page should include page number`);
    assert.ok(fs.existsSync(path.join(repoRoot, page.image)), `${link.id} source image should exist`);
    assert.ok(fs.existsSync(path.join(repoRoot, page.text)), `${link.id} source text should exist`);
    assert.ok(
      fs.existsSync(path.join(corpusDir, String(page.issue_year), "manifest.json")),
      `${link.id} issue manifest should exist`,
    );
  }

  if (link.target_type === "place") {
    placeLinks.push(link);
    assert.ok(placeIds.has(link.target_id), `${link.id} should target a V1 place`);
  }
  if (link.target_type === "theme") themeLinks.push(link);
  if (link.match_type === "fuzzy") fuzzyLinks.push(link);
  if (link.target_type === "place" && link.is_direct_evidence) directPlaceLinks.push(link);

  if (link.match_type === "exact") {
    assert.equal(link.is_direct_evidence, true, `${link.id} exact place match should be direct evidence`);
  }
  if (link.match_type === "theme") {
    assert.equal(link.target_type, "theme", `${link.id} theme match should target a theme`);
    assert.equal(link.is_direct_evidence, true, `${link.id} MUSE theme match should be direct theme evidence`);
  }
  if (link.match_type === "fuzzy") {
    assert.equal(link.target_type, "place", `${link.id} fuzzy match should target a place`);
    assert.equal(link.is_direct_evidence, false, `${link.id} fuzzy match should not be direct evidence`);
    assert.ok((link.notes || []).some((note) => /not direct place evidence/i.test(note)), `${link.id} should explain fuzzy directness`);
  }
}

assert.ok(placeLinks.length > 0, "evidence links should answer which MUSE articles support places");
assert.ok(themeLinks.length > 0, "evidence links should answer which MUSE articles support themes");
assert.ok(directPlaceLinks.length > 0, "evidence links should include direct place evidence");
assert.ok(fuzzyLinks.length > 0, "evidence links should include marked fuzzy place support");

for (const placeId of primaryAnchorIds) {
  const links = placeLinks.filter((link) => link.target_id === placeId);
  assert.ok(links.length > 0, `${placeId} Primary Anchor should be queryable against evidence links`);
}

assert.deepEqual(
  evidence.generated_counts,
  {
    articles: new Set(evidence.links.map((link) => link.article.id)).size,
    links: evidence.links.length,
    direct_place_links: directPlaceLinks.length,
    fuzzy_place_links: fuzzyLinks.length,
    theme_links: themeLinks.length,
  },
  "generated counts should match evidence links",
);

console.log("MUSE evidence links schema ok");
