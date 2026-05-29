import { test } from "node:test";
import assert from "node:assert/strict";
import { applyScope } from "./scope.mjs";

// Behavior: GVNC-core places (Grass Valley, Nevada City, and the immediate ridge
// towns) are tagged inGvncScope:true so the first-load surface can focus on them.
test("tags a Grass Valley place as in GVNC scope", () => {
  const out = applyScope({ id: "x", city: "Grass Valley" });
  assert.equal(out.inGvncScope, true);
});

test("tags a Nevada City place as in GVNC scope", () => {
  const out = applyScope({ id: "y", city: "Nevada City" });
  assert.equal(out.inGvncScope, true);
});

// Behavior: out-of-area places (e.g. Truckee, across the Sierra crest) are tagged
// out of scope — but NEVER deleted. They remain in the dataset for directory use.
test("tags a Truckee place as out of GVNC scope but keeps it", () => {
  const out = applyScope({ id: "z", city: "Truckee", name: "Word After Word Books" });
  assert.equal(out.inGvncScope, false);
  assert.equal(out.name, "Word After Word Books", "the place is preserved, not removed");
});

// Behavior: a known city-name typo in the source ("Grass Vally") still resolves to scope.
test("tolerates the 'Grass Vally' source typo", () => {
  const out = applyScope({ id: "w", city: "Grass Vally" });
  assert.equal(out.inGvncScope, true);
});
