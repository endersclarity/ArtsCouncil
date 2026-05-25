const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const corpusDir = path.join(repoRoot, "docs/muse-corpus");
const indexPath = path.join(corpusDir, "article-index.json");

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

assert.equal(index.schema_version, 1, "article index schema version should be stable");
assert.ok(Array.isArray(index.articles), "article index should expose an articles array");

const years = new Set(index.articles.map((article) => article.issue_year));
assert.deepEqual([...years].sort(), [2024, 2025, 2026], "article index should cover all ingested MUSE years");

for (const article of index.articles) {
  assert.match(article.id || "", /^muse-20\d{2}-[a-z0-9-]+$/, "article should have a stable id");
  assert.ok(article.title, `${article.id} should have a title`);
  assert.ok(article.issue, `${article.id} should name its issue`);
  assert.ok(Number.isInteger(article.issue_year), `${article.id} should have an issue year`);
  assert.ok(Number.isInteger(article.page_start), `${article.id} should have page_start`);
  assert.ok(Number.isInteger(article.page_end), `${article.id} should have page_end`);
  assert.ok(article.page_start <= article.page_end, `${article.id} page range should be ordered`);
  assert.ok(Array.isArray(article.source_pages), `${article.id} should link source Page Pairs`);
  assert.ok(article.source_pages.length > 0, `${article.id} should have source pages`);
  assert.ok(Array.isArray(article.exact_place_matches), `${article.id} should expose exact place matches`);
  assert.ok(Array.isArray(article.thematic_matches), `${article.id} should expose thematic matches`);
  assert.ok(article.source_confidence, `${article.id} should expose source confidence`);
  assert.match(article.source_confidence.level, /^(high|medium|low)$/, `${article.id} confidence level should be explicit`);

  for (const page of article.source_pages) {
    assert.ok(Number.isInteger(page.page), `${article.id} source page should include a page number`);
    assert.match(page.image || "", /^pages\/muse-20\d{2}-page-\d{3}\.jpg$/, `${article.id} source page should point to a page image`);
    assert.match(page.text || "", /^pages\/muse-20\d{2}-page-\d{3}\.txt$/, `${article.id} source page should point to OCR text`);
    assert.ok(
      fs.existsSync(path.join(corpusDir, String(article.issue_year), page.image)),
      `${article.id} source image should exist: ${page.image}`,
    );
    assert.ok(
      fs.existsSync(path.join(corpusDir, String(article.issue_year), page.text)),
      `${article.id} source text should exist: ${page.text}`,
    );
  }

  for (const match of article.exact_place_matches) {
    assert.equal(match.match_type, "exact", `${article.id} exact matches should be labelled exact`);
    assert.ok(match.name, `${article.id} exact match should include a display name`);
    assert.ok(match.alias, `${article.id} exact match should include matched alias`);
  }

  for (const match of article.thematic_matches) {
    assert.equal(match.match_type, "theme", `${article.id} thematic matches should be labelled theme`);
    assert.ok(match.theme, `${article.id} thematic match should include a theme`);
  }
}

assert.ok(
  index.articles.some((article) => article.exact_place_matches.length > 0),
  "at least one article should have exact place matches",
);
assert.ok(
  index.articles.some((article) => article.thematic_matches.length > 0),
  "at least one article should have thematic matches",
);

console.log("MUSE Article Index schema ok");
