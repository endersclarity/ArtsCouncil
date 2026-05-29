// retierTrust — re-derive a place's trust tier from its coordinate provenance,
// overriding the dataset's mislabeled `locationReviewStatus` (which marks every
// geocoded row "Map-Ready" regardless of how the coordinate was obtained).
//
// Honest tiers (per CONTEXT.md):
//  - Map-Ready Place      — Diana-workbook or ArcGIS-confident coordinate. Trusted.
//  - Coordinate Candidate — census-geocoded from an address. Plausible but estimated.
//  - Directory-Only Place — no usable coordinate. Listed, not mapped.
//
// A place with no finite coordinate is Directory-Only no matter what its source
// claims (publicMarker:false), matching the render gate in app.js (isPlaceMapReady).

const CANDIDATE_CAVEAT = "Map location not confirmed - estimated";
const DIRECTORY_CAVEAT = "Map location coming soon";

function provenanceOf(source) {
  if (typeof source === "string" && source.startsWith("diana-workbook")) return "diana";
  if (source === "arcgis-cultural-assets-confident-match") return "arcgis-confident";
  if (source === "us-census-geocoder") return "candidate";
  return "none";
}

function hasCoords(place) {
  return Number.isFinite(place?.lat) && Number.isFinite(place?.lng);
}

export function retierTrust(place) {
  const out = { ...place };
  const provenance = hasCoords(place) ? provenanceOf(place.coordinateSource) : "none";

  if (provenance === "diana" || provenance === "arcgis-confident") {
    out.coordinateProvenance = provenance;
    out.markerTier = "map-ready";
    out.locationReviewStatus = "Map-Ready";
    out.publicMarker = true;
    out.locationCaveat = ""; // trusted coordinate — no routine caveat
  } else if (provenance === "candidate") {
    out.coordinateProvenance = "candidate";
    out.markerTier = "candidate";
    out.locationReviewStatus = "Coordinate Candidate";
    out.publicMarker = true;
    out.locationCaveat = CANDIDATE_CAVEAT;
  } else {
    out.coordinateProvenance = "none";
    out.markerTier = "directory-only";
    out.locationReviewStatus = "Needs Location Review";
    out.publicMarker = false;
    out.locationCaveat = DIRECTORY_CAVEAT;
  }

  return out;
}
