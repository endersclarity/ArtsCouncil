// dedupePlaces — collapse duplicate listings of the same place (same `id`) into
// one canonical record. Diana cross-lists the same place across category sheets,
// so a single place can appear as 2-4 rows with the same id.
//
// Merge rule:
//  - The winning row supplies the coordinate + provenance fields. The winner is the
//    row with the highest coordinateConfidence; ties broken by enrichment richness
//    (anchor > musePick > real image > longest description), then by
//    coordinateDecisionId ascending so re-runs are deterministic.
//  - Enrichment is UNIONED across every collapsed listing: musePick is OR'd, an
//    anchor is kept if any listing has one, the best image wins, and the first
//    non-empty address/phone/website/description is preserved.

const CONFIDENCE_RANK = {
  authoritative: 3,
  high: 2,
  medium: 1,
  "needs-review": 0,
};

// Two coordinates closer than this are treated as the same place; beyond it,
// same-tier listings that disagree are a genuine conflict needing human review.
const COLOCATION_THRESHOLD_MILES = 0.03; // ~48 m

function rank(row) {
  return CONFIDENCE_RANK[row?.coordinateConfidence] ?? -1;
}

export function hasCoords(row) {
  return Number.isFinite(row?.lat) && Number.isFinite(row?.lng);
}

export function haversineMiles(a, b) {
  const R = 3958.8;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// A conflict exists when ≥2 listings at the winning tier carry coordinates that
// disagree beyond the co-location threshold. (Lower-tier divergence is not a
// conflict — that coordinate is discarded in favor of the winner's.)
function hasCoordinateConflict(group, winner) {
  const peers = group.filter(
    (r) => hasCoords(r) && rank(r) === rank(winner)
  );
  for (let i = 0; i < peers.length; i++) {
    for (let j = i + 1; j < peers.length; j++) {
      if (haversineMiles(peers[i], peers[j]) > COLOCATION_THRESHOLD_MILES) {
        return true;
      }
    }
  }
  return false;
}

function isRealImage(image) {
  return image != null && image.kind === "real";
}

// Order within a confidence tier: richer enrichment first, then stable id tie-break.
function enrichmentScore(row) {
  return (
    (row.anchor ? 8 : 0) +
    (row.musePick === true ? 4 : 0) +
    (isRealImage(row.image) ? 2 : 0)
  );
}

function pickWinner(group) {
  return [...group].sort((a, b) => {
    const r = rank(b) - rank(a);
    if (r !== 0) return r;
    const e = enrichmentScore(b) - enrichmentScore(a);
    if (e !== 0) return e;
    const da = (a.description || "").length;
    const db = (b.description || "").length;
    if (db !== da) return db - da;
    return String(a.coordinateDecisionId).localeCompare(String(b.coordinateDecisionId));
  })[0];
}

function firstNonEmpty(group, key) {
  for (const row of group) {
    const v = row[key];
    if (v != null && String(v).trim() !== "") return v;
  }
  return undefined;
}

// Merge a group of listings that represent the same place into one record.
// Exported so canonicalize (same-place-different-slug) can reuse the exact rule.
export function mergePlaceGroup(group) {
  const winner = pickWinner(group);
  const merged = { ...winner };

  // Union enrichment across all listings (not just the winner).
  merged.musePick = group.some((r) => r.musePick === true);

  const anchored = group.find((r) => r.anchor != null);
  if (anchored) merged.anchor = anchored.anchor;

  const realImage = group.find((r) => isRealImage(r.image));
  if (realImage) merged.image = realImage.image;

  for (const key of ["description", "address", "phone", "website"]) {
    const v = firstNonEmpty(group, key);
    if (v !== undefined) merged[key] = v;
  }

  if (hasCoordinateConflict(group, winner)) merged.coordinateConflict = true;

  return merged;
}

export function dedupePlaces(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.id)) groups.set(row.id, []);
    groups.get(row.id).push(row);
  }
  return [...groups.values()].map(mergePlaceGroup);
}
