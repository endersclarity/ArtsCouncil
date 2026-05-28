const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const placesPath = path.resolve(
  __dirname,
  "../website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json",
);
const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));

const forbiddenPublicKeys = [
  "email",
  "hours",
  "h",
  "sourceSheet",
  "GlobalID",
  "globalId",
  "approvalStatus",
  "editDate",
];

assert.equal(places.length, 1959, "V1 should keep the full visible place set");

for (const place of places) {
  assert.equal(typeof place.name, "string", "Directory Records should expose a name");
  assert.equal(typeof place.category, "string", "Directory Records should expose a category/type");
  assert.equal(typeof place.description, "string", "Directory Records should expose a description");
  assert.ok("website" in place, "Directory Records should keep the website field, even when blank");
  assert.ok("address" in place, "Directory Records should keep the address field, even when blank");
  assert.ok("phone" in place, "Directory Records should keep the phone field, even when blank");
  for (const key of forbiddenPublicKeys) {
    assert.ok(!(key in place), `${key} should not be exposed in first-pass Directory Records`);
  }
}

const withAddress = places.filter((place) => place.address).length;
const withPhone = places.filter((place) => place.phone).length;
assert.ok(withAddress >= 900, "V1 should restore source-backed addresses for most records");
assert.ok(withPhone >= 600, "V1 should restore source-backed phone numbers where available");

const airAligned = places.find((place) => place.id === "air-aligned-aerial-arts-academy-grass-valley");
assert.equal(airAligned.address, "900 Golden Gate Ter, Ste E");
assert.equal(airAligned.phone, "530-277-4489");

console.log("V1 Directory Record data contract ok");
