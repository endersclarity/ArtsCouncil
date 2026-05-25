const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data");
const appPath = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js");
const cards = JSON.parse(fs.readFileSync(path.join(dataDir, "anchor_cards.json"), "utf8"));
const evidence = JSON.parse(fs.readFileSync(path.join(dataDir, "muse_evidence_links.json"), "utf8"));
const appSource = fs.readFileSync(appPath, "utf8");

const primaryCards = cards.filter((card) => card.promoteAsAnchor);
const linksById = new Map(evidence.links.map((link) => [link.id, link]));
const internalCopyPattern = /\b(P0|confidence|demo tier|implementation priority|stakeholder-proof|prototype)\b/i;
const expected2026 = new Set([
  "the-center-for-the-arts-grass-valley",
  "north-star-house-grass-valley",
  "empire-mine-grass-valley",
]);
const expectedFullCorpus = new Set([
  "nevada-theatre-nevada-city",
  "art-works-gallery-grass-valley",
  "the-curious-forge-nevada-city",
]);

assert.equal(primaryCards.length, 6, "only the six Primary Anchor Cards should be checked here");
assert.match(appSource, /primaryAction/, "rendered place cards should use the primary action label");
assert.match(appSource, /card\.whyItMatters/, "rendered place cards should use why-this-place-matters copy");

for (const card of primaryCards) {
  assert.match(card.hook || "", /\S/, `${card.name} should have a concise public-facing hook`);
  assert.ok(card.hook.length <= 150, `${card.name} hook should stay concise`);
  assert.match(card.whyItMatters || "", /\S/, `${card.name} should explain cultural relevance`);
  assert.doesNotMatch(card.hook, internalCopyPattern, `${card.name} hook should not expose internal audit language`);
  assert.doesNotMatch(card.whyItMatters, internalCopyPattern, `${card.name} why copy should not expose internal audit language`);
  assert.match(card.primaryAction || "", /\S/, `${card.name} should have one clear public action`);
  assert.ok(Array.isArray(card.museEvidence), `${card.name} should carry MUSE evidence notes`);
  assert.ok(card.museEvidence.length > 0, `${card.name} should have at least one MUSE evidence note`);

  const allIssueYears = new Set();
  for (const note of card.museEvidence) {
    assert.match(note.claim || "", /\S/, `${card.name} evidence note should include a claim`);
    assert.equal(typeof note.direct, "boolean", `${card.name} evidence note should mark directness`);
    assert.ok(Array.isArray(note.linkIds), `${card.name} evidence note should include link ids`);
    assert.ok(note.linkIds.length > 0, `${card.name} evidence note should include at least one link id`);
    assert.ok(Array.isArray(note.sourceRefs), `${card.name} evidence note should include source refs`);
    assert.ok(note.sourceRefs.length > 0, `${card.name} evidence note should include at least one source ref`);

    const noteLinks = note.linkIds.map((id) => {
      const link = linksById.get(id);
      assert.ok(link, `${card.name} evidence link should exist: ${id}`);
      assert.equal(link.target_type, "place", `${card.name} evidence link should target a place`);
      assert.equal(link.target_id, card.placeId, `${card.name} evidence link should target this card's place`);
      assert.equal(link.is_direct_evidence, note.direct, `${card.name} note directness should match link directness`);
      return link;
    });

    for (const ref of note.sourceRefs) {
      allIssueYears.add(ref.issueYear);
      assert.ok(Number.isInteger(ref.issueYear), `${card.name} source ref should include issue year`);
      assert.ok(Array.isArray(ref.pages), `${card.name} source ref should include pages`);
      assert.ok(ref.pages.length > 0, `${card.name} source ref should include at least one page`);
      for (const page of ref.pages) {
        assert.ok(Number.isInteger(page), `${card.name} source ref page should be an integer`);
      }
      assert.ok(
        noteLinks.some(
          (link) =>
            link.article.issue_year === ref.issueYear &&
            ref.pages.every((page) => link.source_pages.some((sourcePage) => sourcePage.page === page)),
        ),
        `${card.name} source ref should match at least one evidence link`,
      );
    }

    if (!note.direct) {
      assert.match(
        `${note.claim} ${note.notes || ""}`,
        /not direct|thematic|fuzzy/i,
        `${card.name} fuzzy evidence should be explicitly limited`,
      );
    }
  }

  if (expected2026.has(card.placeId)) {
    assert.ok(allIssueYears.has(2026), `${card.name} should be checked against known MUSE 2026 links`);
  }
  if (expectedFullCorpus.has(card.placeId)) {
    assert.ok(
      [...allIssueYears].some((year) => year >= 2024 && year <= 2026),
      `${card.name} should be checked against the 2024-2026 corpus`,
    );
  }
}

console.log("MUSE Primary Anchor card copy schema ok");
