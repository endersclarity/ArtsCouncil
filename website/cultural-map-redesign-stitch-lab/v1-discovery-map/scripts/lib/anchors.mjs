// reconcileAnchors — make sure every Primary Anchor ships on a trusted coordinate.
//
// Per ADR-0001 (revised after the Phase-0 verification spike), this is a SOFT pass:
// it does not fail the build. It does two things:
//  1. Known adoptions: where an anchor card points at a census record that has a
//     Diana twin of the same physical place under a different id, it adopts the
//     twin's trusted coordinate onto the anchor record (the twin is preserved).
//  2. Warnings: any anchor whose record is missing, or still on a candidate/none
//     coordinate after adoption, is reported as a warning for human follow-up.
//
// The coordinate fields copied during an adoption.
const COORD_FIELDS = [
  "lat",
  "lng",
  "coordinateSource",
  "coordinateConfidence",
  "coordinateDecisionId",
  "coordinateProvenance",
  "markerTier",
  "locationReviewStatus",
  "locationCaveat",
];

// Anchor placeId -> the id of its trusted twin whose coordinate should be adopted.
const KNOWN_TWIN_ADOPTIONS = {
  "art-works-gallery-grass-valley": "art-works-gallery-co-op-grass-valley",
};

const TRUSTED = new Set(["diana", "arcgis-confident", "human-verified"]);

export function reconcileAnchors(rows, anchorCards) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const warnings = [];

  for (const card of anchorCards) {
    const anchorId = card.placeId;
    const record = byId.get(anchorId);

    if (!record) {
      warnings.push({ placeId: anchorId, reason: "anchor has no place record" });
      continue;
    }

    // 1. Known twin adoption.
    const twinId = KNOWN_TWIN_ADOPTIONS[anchorId];
    if (twinId && !TRUSTED.has(record.coordinateProvenance)) {
      const twin = byId.get(twinId);
      if (twin && TRUSTED.has(twin.coordinateProvenance)) {
        for (const f of COORD_FIELDS) {
          if (twin[f] !== undefined) record[f] = twin[f];
        }
      }
    }

    // 2. Warn if still not on a trusted coordinate.
    if (!TRUSTED.has(record.coordinateProvenance)) {
      warnings.push({
        placeId: anchorId,
        reason: `anchor on '${record.coordinateProvenance}' coordinate (not Diana/ArcGIS)`,
      });
    }
  }

  return { rows, warnings };
}
