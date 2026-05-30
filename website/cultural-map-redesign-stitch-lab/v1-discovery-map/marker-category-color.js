/*
 * Marker category color (CLA-34)
 * ------------------------------
 * Single source of truth for "what color is a place dot, given its category".
 *
 * Dots on the v1 discovery map are colored by OUTING GROUP (6 groups), derived
 * from the place's raw `category` (11 values). Selection is signaled separately
 * by red rings + a thicker white stroke, so RED IS RESERVED and never used here.
 *
 * Loaded as a plain global before app.js (like review-state.js); also exports via
 * CommonJS so the decision logic can be unit-tested in node without a browser.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MarkerCategoryColor = api;
})(typeof window !== "undefined" ? window : this, function () {
  // Group -> hex. No value is red (#ff2e00); red is reserved for selection.
  const GROUP_COLORS = {
    Art: "#b8860b", // gold
    "Music & Performance": "#365c76", // blue
    History: "#1a1a2e", // dark (the existing default ink)
    "Local Shops": "#2e6b5e", // teal-green
    Outdoors: "#4a7c2f", // forest
    Events: "#6b3f8c", // plum
  };

  const FALLBACK_COLOR = "#5d625b"; // MARKERS.quiet — unmatched / missing category

  // Each of the 11 real categories maps to exactly one group (deterministic).
  const CATEGORY_TO_GROUP = {
    "Arts Organizations": "Art",
    "Galleries & Studios": "Art",
    "Public Art": "Art",
    "MUSE Picks": "Art",
    "Creative Services": "Art",
    "Performing Arts": "Music & Performance",
    "Historic Places": "History",
    "Cultural Resources": "History",
    "Eat, Drink & Stay": "Local Shops",
    "Shops & Makers": "Local Shops",
    "Walks & Trails": "Outdoors",
    "Fairs & Festivals": "Events",
  };

  function colorForCategory(category) {
    const group = CATEGORY_TO_GROUP[category];
    return (group && GROUP_COLORS[group]) || FALLBACK_COLOR;
  }

  // Build a MapLibre ["match", ["get","category"], [labels...], color, ..., fallback]
  // from the same mapping, grouping all categories that share a group color so the
  // expression and colorForCategory() can never drift.
  function buildExpression() {
    const byColor = new Map(); // color -> [categories]
    for (const category of Object.keys(CATEGORY_TO_GROUP)) {
      const color = colorForCategory(category);
      if (!byColor.has(color)) byColor.set(color, []);
      byColor.get(color).push(category);
    }
    const expr = ["match", ["get", "category"]];
    for (const [color, categories] of byColor) {
      expr.push(categories, color);
    }
    expr.push(FALLBACK_COLOR);
    return expr;
  }

  const CATEGORY_COLOR_EXPRESSION = buildExpression();

  return {
    colorForCategory,
    GROUP_COLORS,
    FALLBACK_COLOR,
    CATEGORY_TO_GROUP,
    CATEGORY_COLOR_EXPRESSION,
  };
});
