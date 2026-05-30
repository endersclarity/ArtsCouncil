// Citizen-voice copy contract (CLA-39).
// The visible surface speaks to a citizen, not a reviewer: no taxonomy buckets,
// provenance, vetting, or review-process language on the page. Grows one
// assertion per TDD slice.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const v1 = "website/cultural-map-redesign-stitch-lab/v1-discovery-map";
const appSource = fs.readFileSync(path.join(repoRoot, v1, "app.js"), "utf8");

function bodyOf(name) {
  const re = new RegExp(`function ${name}\\(place\\) \\{([\\s\\S]*?)\\n  \\}`);
  const m = appSource.match(re);
  assert.ok(m, `${name}() should exist`);
  return m[1];
}

// --- Slice 1: marker/eyebrow kind label is the place category, not a bucket ---
const kindBody = bodyOf("placeKindLabel");
assert.match(kindBody, /place\.category/, "placeKindLabel should return the place category");
for (const bucket of ["Cultural anchor", "Supporting stop", "MUSE pick", "Directory record"]) {
  assert.ok(!kindBody.includes(bucket), `placeKindLabel must not emit the "${bucket}" bucket label`);
}

// --- Slice 2: list badge is the place category, not a review bucket ---
const reviewBody = bodyOf("placeReviewLabel");
assert.match(reviewBody, /place\.category/, "placeReviewLabel should return the place category");
for (const bucket of ["Primary anchor", "Supporting stop", "MUSE pick", "Directory record"]) {
  assert.ok(!reviewBody.includes(bucket), `placeReviewLabel must not emit the "${bucket}" bucket label`);
}

// --- Slice 3: detail-card eyebrow shows the category, not anchor/stop bucket ---
const detailEyebrow = appSource.match(/<p class="detail-eyebrow">\$\{([^}]*)\}<\/p>\s*\n\s*\$\{anchorBadge/);
assert.ok(detailEyebrow, "detail-eyebrow expression should exist before the anchor badge");
assert.match(detailEyebrow[1], /place\.category/, "detail eyebrow should show the place category");
for (const bucket of ["Cultural anchor", "Supporting stop", "MUSE pick"]) {
  assert.ok(!detailEyebrow[1].includes(bucket), `detail eyebrow must not emit the "${bucket}" bucket`);
}

// --- Slice 4: anchor "what you'll find" header is citizen-voiced, not justification ---
const metaBody = bodyOf("anchorCardMeta");
for (const reviewerHeader of ["Why this place matters", "How this stop supports the path"]) {
  assert.ok(!metaBody.includes(reviewerHeader), `anchorCardMeta must not use the reviewer header "${reviewerHeader}"`);
}
assert.match(metaBody, /What you'll find here/, "anchorCardMeta should use a citizen-voiced header");

// --- Slice 5: real photos carry no "Image proof" justification stamp ---
assert.ok(!appSource.includes("Image proof"), 'app.js must not stamp "Image proof" on photos');
// kept on purpose: honest-incompleteness labels stay (decided with owner)
assert.match(appSource, /Candidate image/, "Candidate image honesty label should stay");
assert.match(appSource, /Source image pending/, "Source image pending honesty label should stay");

// --- Slice 6: remaining hint/aria labels are not reviewer/insider language ---
for (const insider of ["Featured cultural anchor", "Curated path", "First matching place", "Cultural context", "Visible gap"]) {
  assert.ok(!appSource.includes(insider), `app.js must not surface the insider label "${insider}"`);
}

// --- Slice 7: anchor card prose carries no justification/insider tokens ---
const anchorCards = JSON.parse(fs.readFileSync(path.join(repoRoot, v1, "data/anchor_cards.json"), "utf8"));
const bannedTokens = ["MUSE", "map", "route", "path", "anchor", "gateway", "corpus", "slice", "review", "evidence", "itinerary", "prototype"];
for (const card of anchorCards) {
  for (const field of ["whyItMatters", "supportingDescription"]) {
    const value = card[field];
    if (!value) continue;
    for (const token of bannedTokens) {
      const hit = new RegExp(`\\b${token}\\b`, "i").test(value);
      assert.ok(!hit, `${card.name} ${field} must not contain justification token "${token}": ${value}`);
    }
  }
}

console.log("V1 citizen-voice contract ok");
