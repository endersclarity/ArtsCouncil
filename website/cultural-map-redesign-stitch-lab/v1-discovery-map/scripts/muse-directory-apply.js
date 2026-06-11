#!/usr/bin/env node
/**
 * muse-directory-apply.js — Stage 2 of the MUSE business directory layer.
 *
 * Applies the reconciliation results (scripts/muse-directory-listings.json,
 * produced by muse-directory-parse.js and reviewed via
 * muse-directory-reconcile.md) to data/places.json:
 *
 *   1. Enrich every ALREADY-FLAGGED (musePick: true) place that matched a
 *      directory listing with:
 *        museCategory — the directory's own label, latest issue wins
 *        museIssues   — sorted list of issue years the place appeared in
 *        musePage     — print page number in the latest issue
 *      No musePick flags are added or removed (PRD §9 Q6/Q7 — owner calls).
 *
 *   2. Re-home the 186 places whose category is "MUSE Picks" into real map
 *      categories guided by museCategory (PRD §5). markerTier/publicMarker
 *      are untouched, so marker visibility cannot change (PRD §9 Q3).
 *
 * Idempotent. Prints invariant checks. Run from anywhere:
 *   node scripts/muse-directory-apply.js
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { mapCategory } = require("./muse-directory-parse.js");

const PLACES_PATH = path.join(__dirname, "..", "data", "places.json");
const LISTINGS_PATH = path.join(__dirname, "muse-directory-listings.json");

const places = JSON.parse(fs.readFileSync(PLACES_PATH, "utf8"));
const recon = JSON.parse(fs.readFileSync(LISTINGS_PATH, "utf8"));

// section lookup for mapCategory's section hint
const sectionByKey = new Map();
for (const li of recon.listings) {
  sectionByKey.set(`${li.issue}|${li.page}|${li.name}`, li.section || "");
}

// fold matches per place
const perPlace = new Map();
for (const m of recon.matches) {
  if (!perPlace.has(m.placeId)) perPlace.set(m.placeId, []);
  perPlace.get(m.placeId).push(m);
}

const before = {
  total: places.length,
  musePicksCat: places.filter((p) => p.category === "MUSE Picks"),
};
const beforeVisibility = summary(before.musePicksCat);

let enriched = 0;
let rehomed = 0;
const rehomeCounts = {};

for (const p of places) {
  const ms = perPlace.get(p.id);

  if (p.musePick && ms && ms.length) {
    const sorted = [...ms].sort((a, b) => b.issue - a.issue);
    const latest = sorted.find((m) => m.museCategory) || sorted[0];
    const issues = [...new Set(ms.map((m) => m.issue))].sort();
    if (latest.museCategory) p.museCategory = latest.museCategory;
    p.museIssues = issues;
    p.musePage = sorted[0].page;
    enriched++;
  }

  if (p.category === "MUSE Picks") {
    const entry = ms && ms.length
      ? {
          listings: [...ms]
            .sort((a, b) => b.issue - a.issue)
            .map((m) => ({
              section: sectionByKey.get(`${m.issue}|${m.page}|${m.name}`) || "",
            })),
        }
      : null;
    const target = mapCategory(p.museCategory || "", entry);
    p.category = target;
    rehomeCounts[target] = (rehomeCounts[target] || 0) + 1;
    rehomed++;
  }
}

// ------------------------------------------------------------ invariants
function summary(list) {
  const s = { total: list.length, rendered: 0, hidden: 0, mapReady: 0 };
  for (const p of list) {
    if (p.markerTier === "map-ready") s.mapReady++;
    else if (p.publicMarker) s.rendered++;
    else s.hidden++;
  }
  return s;
}
const afterIds = new Set(before.musePicksCat.map((p) => p.id));
const afterVisibility = summary(places.filter((p) => afterIds.has(p.id)));

if (places.length !== before.total) throw new Error("place count changed!");
if (JSON.stringify(beforeVisibility) !== JSON.stringify(afterVisibility))
  throw new Error("marker visibility profile changed for the 186!");
if (places.some((p) => p.category === "MUSE Picks"))
  throw new Error("MUSE Picks category not fully retired!");

fs.writeFileSync(PLACES_PATH, JSON.stringify(places, null, 2) + "\n");

console.log("enriched flagged places:", enriched);
console.log("re-homed MUSE Picks places:", rehomed, rehomeCounts);
console.log("visibility profile (unchanged):", afterVisibility);
console.log("musePick flags:", places.filter((p) => p.musePick).length, "(unchanged)");
