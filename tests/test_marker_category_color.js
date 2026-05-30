const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  colorForCategory,
  GROUP_COLORS,
  FALLBACK_COLOR,
  CATEGORY_TO_GROUP,
  CATEGORY_COLOR_EXPRESSION,
} = require(path.resolve(
  __dirname,
  "../website/cultural-map-redesign-stitch-lab/v1-discovery-map/marker-category-color.js",
));

test("Galleries & Studios is colored as the Art group (gold)", () => {
  assert.equal(colorForCategory("Galleries & Studios"), "#b8860b");
});

test("Performing Arts is colored as the Music & Performance group (blue)", () => {
  assert.equal(colorForCategory("Performing Arts"), "#365c76");
});

test("the remaining outing groups each get their own color", () => {
  assert.equal(colorForCategory("Historic Places"), "#1a1a2e"); // History
  assert.equal(colorForCategory("Cultural Resources"), "#1a1a2e"); // History
  assert.equal(colorForCategory("Eat, Drink & Stay"), "#2e6b5e"); // Local Shops
  assert.equal(colorForCategory("Shops & Makers"), "#2e6b5e"); // Local Shops
  assert.equal(colorForCategory("Walks & Trails"), "#4a7c2f"); // Outdoors
  assert.equal(colorForCategory("Fairs & Festivals"), "#6b3f8c"); // Events
});

test("unknown or missing category falls back to the quiet neutral color", () => {
  assert.equal(colorForCategory("Totally Unknown"), FALLBACK_COLOR);
  assert.equal(colorForCategory(undefined), FALLBACK_COLOR);
  assert.equal(colorForCategory(null), FALLBACK_COLOR);
  assert.equal(colorForCategory(""), FALLBACK_COLOR);
});

test("no group color is red — red stays reserved for selection", () => {
  const RED = "#ff2e00";
  for (const [group, hex] of Object.entries(GROUP_COLORS)) {
    assert.notEqual(hex.toLowerCase(), RED, `${group} must not use selection red`);
  }
  assert.notEqual(FALLBACK_COLOR.toLowerCase(), RED);
});

// Minimal evaluator for a MapLibre ["match", input, l1, o1, ..., default] expression,
// supporting array-of-labels branches, against a feature's properties.
function evalMatch(expr, props) {
  assert.equal(expr[0], "match", "expression must be a match");
  const getter = expr[1];
  assert.deepEqual(getter, ["get", "category"], "match input must be ['get','category']");
  const key = getter[1];
  const value = props[key];
  const fallback = expr[expr.length - 1];
  for (let i = 2; i < expr.length - 1; i += 2) {
    const labels = Array.isArray(expr[i]) ? expr[i] : [expr[i]];
    if (labels.includes(value)) return expr[i + 1];
  }
  return fallback;
}

test("CATEGORY_COLOR_EXPRESSION matches colorForCategory for every real category", () => {
  for (const category of Object.keys(CATEGORY_TO_GROUP)) {
    assert.equal(
      evalMatch(CATEGORY_COLOR_EXPRESSION, { category }),
      colorForCategory(category),
      `expression disagrees with resolver for ${category}`,
    );
  }
  // and an unmatched category resolves to the fallback
  assert.equal(evalMatch(CATEGORY_COLOR_EXPRESSION, { category: "Nope" }), FALLBACK_COLOR);
});
