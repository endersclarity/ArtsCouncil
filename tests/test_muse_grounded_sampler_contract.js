const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const samplerPath = path.join(
  repoRoot,
  "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_grounded_sampler.json",
);
const evidencePath = path.join(
  repoRoot,
  "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_evidence_links.json",
);
const reportPath = path.join(repoRoot, "reports/muse-grounded-sampler-summary.json");

const sampler = JSON.parse(fs.readFileSync(samplerPath, "utf8"));
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const directPlaceLinks = evidence.links.filter(
  (link) => link.target_type === "place" && link.is_direct_evidence === true,
);
const fuzzyPlaceLinks = evidence.links.filter(
  (link) => link.target_type === "place" && link.is_direct_evidence !== true,
);
const themeLinks = evidence.links.filter((link) => link.target_type === "theme");
const directPlaceIds = new Set(directPlaceLinks.map((link) => link.target_id));

assert.equal(sampler.schemaVersion, 2);
assert.equal(sampler.counts.directPlaceEvidenceLinks, directPlaceLinks.length);
assert.equal(sampler.counts.directMusePlaceCandidatesConsidered, directPlaceIds.size);
assert.equal(sampler.counts.fuzzyPlaceLinksExcludedAsQualifiers, fuzzyPlaceLinks.length);
assert.equal(sampler.counts.themeLinksExcludedAsQualifiers, themeLinks.length);
assert.equal(sampler.counts.beforeRefinement.qualifiedMapReadyDirectCandidates, 139);
assert.equal(sampler.counts.showcaseScopeDirectCandidates, 99);
assert.equal(sampler.counts.qualifiedShowcaseCandidates, 85);
assert.equal(sampler.counts.finalRecommendedSamplerSize, 12);
assert.equal(sampler.directMuseCandidates.length, sampler.counts.directMusePlaceCandidatesConsidered);
assert.equal(sampler.qualifiedCandidates.length, sampler.counts.beforeRefinement.qualifiedMapReadyDirectCandidates);
assert.equal(sampler.showcaseQualifiedCandidates.length, sampler.counts.qualifiedShowcaseCandidates);
assert.equal(report.counts.finalRecommendedSamplerSize, sampler.counts.finalRecommendedSamplerSize);

for (const rule of [
  /Showcase Sampler Scope: Grass Valley or Nevada City/i,
  /Editorial Direct MUSE Evidence/i,
  /Administrative, acknowledgement, get-involved, editor-letter, and calendar/i,
  /Fuzzy place links and theme links are counted as exclusions/i,
  /seeded and semiautomatic/i,
]) {
  assert.ok(sampler.rules.some((text) => rule.test(text)), `missing sampler rule ${rule}`);
}

for (const category of ["editorial", "administrative", "acknowledgement", "calendar", "editor-letter", "get-involved"]) {
  assert.ok(category in sampler.counts.directEvidenceCategoryCounts, `${category} count should be auditable`);
}

for (const candidate of sampler.recommendedSampler) {
  assert.ok(directPlaceIds.has(candidate.id), `${candidate.id} must have direct MUSE place evidence`);
  assert.ok(["Grass Valley", "Nevada City"].includes(candidate.city), `${candidate.id} must be in GV/NC scope`);
  assert.equal(candidate.coordinate.status, "Map-Ready", `${candidate.id} must be map-ready`);
  assert.equal(candidate.coordinate.publicMarker, true, `${candidate.id} must be an ordinary marker`);
  assert.ok(candidate.editorialDirectMuseArticles.length > 0, `${candidate.id} must include editorial source articles`);

  for (const article of candidate.editorialDirectMuseArticles) {
    assert.equal(typeof article.title, "string");
    assert.equal(typeof article.issueYear, "number");
    assert.equal(article.editorialQualifying, true);
    assert.equal(article.evidenceCategory, "editorial");
    assert.ok(article.sourcePages.length > 0, `${candidate.id} article should carry page evidence`);
  }
}

console.log("MUSE grounded sampler contract ok");
