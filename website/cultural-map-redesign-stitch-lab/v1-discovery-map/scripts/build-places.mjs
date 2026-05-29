#!/usr/bin/env node
// build-places.mjs — CLA-15 canonical-dataset rebuild.
//
// Reads data/places.json, runs the rebuildPlaces pipeline (dedupe + honest
// re-tier + scope + anchor reconciliation), and writes data/places.clean.json.
// Prints a before/after report and checks that anchor_cards.json and paths.json
// placeIds still resolve.
//
//   node scripts/build-places.mjs            # dry run -> writes places.clean.json
//   node scripts/build-places.mjs --apply    # back up + overwrite places.json
//
// The pure transforms live in scripts/lib/ and are covered by node:test.

import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rebuildPlaces } from "./lib/pipeline.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "data");
const apply = process.argv.includes("--apply");

const readJson = (name) => JSON.parse(readFileSync(join(DATA, name), "utf8"));

const placesIn = readJson("places.json");
const anchorCards = readJson("anchor_cards.json");
const paths = readJson("paths.json");

const { places, warnings, report } = rebuildPlaces(placesIn, anchorCards, paths);

// --- referential integrity: do anchor_cards / paths still resolve? ---
const ids = new Set(places.map((p) => p.id));
const orphanAnchors = anchorCards.map((c) => c.placeId).filter((id) => !ids.has(id));
const stopPlaceIds = paths.flatMap((p) => (p.stops || []).map((s) => s.placeId));
const orphanStops = [...new Set(stopPlaceIds)].filter((id) => !ids.has(id));

// --- report ---
const tierOf = (src) =>
  String(src).startsWith("diana-workbook") ? "diana"
  : src === "arcgis-cultural-assets-confident-match" ? "arcgis"
  : src === "us-census-geocoder" ? "census"
  : "none";
const beforeMapReady = placesIn.filter((p) => p.locationReviewStatus === "Map-Ready").length;

console.log("=== CLA-15 rebuild ===");
console.log(`listings in:        ${placesIn.length}`);
console.log(`unique places out:  ${report.uniquePlaces}  (collapsed ${placesIn.length - report.uniquePlaces})`);
console.log("");
console.log("trust tiers (after honest re-tier):");
console.log(`  Map-Ready:        ${report.mapReady}   (was mislabeled "Map-Ready": ${beforeMapReady})`);
console.log(`  Coordinate Candidate: ${report.candidates}`);
console.log(`  Directory-Only:   ${report.directoryOnly}`);
console.log("");
console.log(`coordinate conflicts flagged: ${report.coordinateConflicts}`);
console.log(`in GVNC scope:               ${report.inGvncScope} / ${report.uniquePlaces}`);
console.log("");
console.log(`anchor warnings: ${warnings.length}`);
for (const w of warnings) console.log(`  - ${w.placeId}: ${w.reason}`);
console.log("");
console.log(`orphaned anchor_cards placeIds: ${orphanAnchors.length}${orphanAnchors.length ? " -> " + orphanAnchors.join(", ") : ""}`);
console.log(`orphaned paths stop placeIds:   ${orphanStops.length}${orphanStops.length ? " -> " + orphanStops.join(", ") : ""}`);

// --- write ---
const out = JSON.stringify(places, null, 2) + "\n";
if (apply) {
  copyFileSync(join(DATA, "places.json"), join(DATA, "places.backup.json"));
  writeFileSync(join(DATA, "places.json"), out);
  console.log("\nAPPLIED: places.json overwritten (backup at places.backup.json).");
} else {
  writeFileSync(join(DATA, "places.clean.json"), out);
  console.log("\nDRY RUN: wrote places.clean.json. Re-run with --apply to swap.");
}
