const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);
const places = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json"),
    "utf8",
  ),
);

const expectedCategoryAssets = {
  "Arts Organizations": "assets/category-placeholders-ncac/arts-organizations.png",
  "Creative Services": "assets/category-placeholders-ncac/arts-organizations.png",
  "Cultural Resources": "assets/category-placeholders-ncac/cultural-resources.png",
  "Eat, Drink & Stay": "assets/category-placeholders-ncac/eat-drink-stay.png",
  "Fairs & Festivals": "assets/category-placeholders-ncac/fairs-festivals.png",
  "Galleries & Studios": "assets/category-placeholders-ncac/galleries-studios.png",
  "Historic Places": "assets/category-placeholders-ncac/historic-places.png",
  "MUSE Picks": "assets/category-placeholders-ncac/muse-picks.png",
  "Performing Arts": "assets/category-placeholders-ncac/performing-arts.png",
  "Public Art": "assets/category-placeholders-ncac/public-art.png",
  "Shops & Makers": "assets/category-placeholders-ncac/shops-makers.png",
  "Walks & Trails": "assets/category-placeholders-ncac/walks-trails.png",
};

const actualCategories = [...new Set(places.map((place) => place.category))].sort();
assert.deepEqual(
  actualCategories,
  Object.keys(expectedCategoryAssets).sort(),
  "every exact V1 place category should have an NCAC placeholder asset mapping",
);

for (const [category, assetPath] of Object.entries(expectedCategoryAssets)) {
  assert.match(appSource, new RegExp(`${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}": "${assetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.ok(
    fs.existsSync(path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map", assetPath)),
    `${category} placeholder asset should exist at ${assetPath}`,
  );
}

assert.match(appSource, /const CATEGORY_PLACEHOLDER_IMAGES = \{/, "app should declare an explicit category placeholder map");
assert.match(appSource, /function categoryPlaceholderFor\(category\)/, "app should resolve category placeholders through a helper");
assert.match(appSource, /categoryPlaceholderFor\(place\.category\)/, "renderImage should fall back to the selected place category");
assert.match(appSource, /place\.image\?\.kind === "placeholder" \? "" : place\.image\?\.src/, "old generated placeholder metadata should not outrank NCAC category assets");
assert.match(appSource, /Photo not yet sourced/, "placeholder cards should label the image honestly outside the asset");
assert.doesNotMatch(appSource, /Category image/, "UI should not add the rejected Category image label");

const renderImageBody = appSource.match(/function renderImage\(place, options = \{\}\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.match(renderImageBody, /place\.image && place\.image\.kind === "real" && place\.image\.src/, "real Image Proof should remain first");
assert.ok(
  renderImageBody.indexOf('place.image.kind === "real"') < renderImageBody.indexOf("categoryPlaceholderFor(place.category)"),
  "real Image Proof should take precedence over category placeholders",
);
assert.match(renderImageBody, /Candidate image|proofLabel/, "supporting-stop candidate/source labels should still render through proofLabel");
assert.doesNotMatch(renderImageBody, /email|hours|sourceSheet|GlobalID|approvalStatus|editDate/);

console.log("V1 category placeholder contract ok");
