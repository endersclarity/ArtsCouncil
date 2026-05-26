const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const appPath = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js");
const htmlPath = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/index.html");
const stylesPath = path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css");

const appSource = fs.readFileSync(appPath, "utf8");
const htmlSource = fs.readFileSync(htmlPath, "utf8");
const stylesSource = fs.readFileSync(stylesPath, "utf8");

assert.match(htmlSource, /review-state\.js/, "V1 app should load the review-state URL helper");
assert.match(htmlSource, /id="place-search"/, "V1 app should expose a place search input");
assert.match(htmlSource, /id="places-list"/, "V1 app should expose a compact places list region");

assert.match(appSource, /applyInitialReviewState/, "app should apply incoming review URL state");
assert.match(appSource, /updateReviewUrl/, "app should update shareable review URL state");
assert.match(appSource, /renderPlacesList/, "app should render the compact places list");
assert.match(appSource, /listedPlaces/, "app should derive listed places from current review state");
assert.match(appSource, /searchableText/, "app should search place name/category/city/intent text");
const currentReviewStateBody = appSource.match(/function currentReviewState\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
assert.doesNotMatch(currentReviewStateBody, /searchQuery/, "search query should not be serialized into review URLs");

assert.match(stylesSource, /\.review-tools/, "review navigation tools should have dedicated styling");
assert.match(stylesSource, /\.place-list-item/, "places list items should have dedicated styling");
assert.match(stylesSource, /body:not\(\[data-map-mode="places"\]\) \.review-tools/, "review tools should be scoped to Places mode");

console.log("V1 review navigation contract ok");
