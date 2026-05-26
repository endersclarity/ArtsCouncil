const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css"),
  "utf8",
);
const appSource = fs.readFileSync(
  path.join(repoRoot, "website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js"),
  "utf8",
);

function blockFor(selector) {
  const index = stylesSource.search(new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`));
  assert.notEqual(index, -1, `${selector} should exist`);
  return stylesSource.slice(index, stylesSource.indexOf("}", index) + 1);
}

const placeholderWrap = blockFor(".placeholder-image-wrap");
assert.match(placeholderWrap, /border:\s*2px solid var\(--line-strong\)/, "category placeholders should sit in a sharp black frame");
assert.match(placeholderWrap, /background:\s*var\(--field\)/, "category placeholders should sit on the bright field");
assert.match(placeholderWrap, /box-shadow:\s*inset 0 -6px 0 var\(--ncac-red\)/, "category placeholders should carry NCAC red structure");

const placeholderImage = blockFor(".placeholder-image");
assert.match(placeholderImage, /border:\s*0/, "category image assets should not receive fake photo borders");
assert.match(placeholderImage, /saturate\(1\.05\) contrast\(1\.04\)/, "category image assets should keep their graphic presence");

const placeholderLabel = blockFor(".placeholder-label");
assert.match(placeholderLabel, /background:\s*var\(--field\)/, "honesty label should be outside the image asset language");
assert.match(placeholderLabel, /color:\s*var\(--ink\)/, "honesty label should read as UI text, not image content");
assert.match(placeholderLabel, /box-shadow:\s*inset 0 -3px 0 var\(--ncac-red\)/, "honesty label should use NCAC red structure");

const proofLabel = blockFor(".image-proof-label");
assert.match(proofLabel, /background:\s*var\(--ink\)/, "ordinary real/candidate proof labels should be visually distinct from placeholder labels");
assert.match(blockFor(".primary-anchor-card .image-proof-label"), /background:\s*var\(--ncac-red\)/, "primary anchor Image Proof should keep a stronger red proof label");

assert.match(appSource, /Photo not yet sourced/, "placeholder label copy should remain honest");
assert.match(appSource, /place\.image && place\.image\.kind === "real" && place\.image\.src/, "real Image Proof should still take precedence in rendering");
assert.match(appSource, /place\.image\?\.kind === "placeholder" \? "" : place\.image\?\.src/, "old generated placeholder metadata should not outrank category panels");
assert.doesNotMatch(appSource, /Category image/, "rejected in-asset/category-image label should not be used");

console.log("V1 placeholder card treatment contract ok");
