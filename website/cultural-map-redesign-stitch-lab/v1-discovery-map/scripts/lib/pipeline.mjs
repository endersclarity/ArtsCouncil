// rebuildPlaces — the CLA-15 transform pipeline. Composes the four pure modules
// in order and returns the clean inventory plus a report and anchor warnings.
//
//   1. dedupePlaces        collapse duplicate listings → one record per id
//   2. canonicalizePlaces  collapse same-place-different-slug records (e.g. "The X" vs "X")
//   3. retierTrust         honest tier from coordinate provenance (per survivor)
//   4. applyScope          tag GVNC scope (never deletes)
//   5. applyResolutions    pin human-reviewed coordinates; clear conflict flags
//   6. reconcileAnchors    adopt trusted twin coords onto anchors; warn on the rest
//
// Dedup/canonicalize run first so we only re-tier survivors; both merges rank on
// raw coordinateConfidence, which retierTrust never changes, so the order is safe.
// Resolutions run after re-tier (so they override the auto tier) but BEFORE the
// anchor gate, so reconcileAnchors verifies the final coordinates and only warns
// about anchors no human or twin has fixed.

import { dedupePlaces } from "./dedupe.mjs";
import { canonicalizePlaces } from "./canonicalize.mjs";
import { retierTrust } from "./retier.mjs";
import { applyScope } from "./scope.mjs";
import { reconcileAnchors } from "./anchors.mjs";
import { applyResolutions } from "./resolutions.mjs";

function collectReferencedIds(anchorCards, paths) {
  const ids = new Set(anchorCards.map((c) => c.placeId));
  for (const p of paths) for (const s of p.stops || []) ids.add(s.placeId);
  return ids;
}

function summarize(places, warnings) {
  const count = (pred) => places.filter(pred).length;
  return {
    uniquePlaces: places.length,
    mapReady: count((p) => p.markerTier === "map-ready"),
    candidates: count((p) => p.markerTier === "candidate"),
    directoryOnly: count((p) => p.markerTier === "directory-only"),
    coordinateConflicts: count((p) => p.coordinateConflict === true),
    inGvncScope: count((p) => p.inGvncScope === true),
    anchorWarnings: warnings.length,
  };
}

export function rebuildPlaces(rows, anchorCards = [], paths = []) {
  const referencedIds = collectReferencedIds(anchorCards, paths);
  const deduped = dedupePlaces(rows);
  const canonical = canonicalizePlaces(deduped, { referencedIds });
  const tiered = canonical.map((p) => applyScope(retierTrust(p)));
  const resolved = applyResolutions(tiered);
  const { rows: places, warnings } = reconcileAnchors(resolved, anchorCards);
  return { places, warnings, report: summarize(places, warnings) };
}
