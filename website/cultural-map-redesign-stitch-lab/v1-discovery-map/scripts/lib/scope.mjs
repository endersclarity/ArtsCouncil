// applyScope — tag whether a place sits in the Grass Valley / Nevada City core
// (plus the immediate ridge/nearby towns) so the first-load Discovery Map can
// foreground GVNC. Out-of-area places (Truckee/Tahoe basin, Auburn, etc.) are
// tagged inGvncScope:false but are NEVER removed — they stay for directory use.
//
// Cities are normalized for matching (lowercased, trimmed, common source typos
// folded) so "Grass Vally" and "Grass Valley" both resolve.

const GVNC_CITIES = new Set([
  "grass valley",
  "nevada city",
  "rough and ready",
  "penn valley",
  "cedar ridge",
  "alta sierra",
  "north san juan",
  "chicago park",
  "washington",
  "smartsville",
]);

const CITY_ALIASES = {
  "grass vally": "grass valley", // known source typo
};

function normalizeCity(city) {
  const c = String(city ?? "").trim().toLowerCase();
  return CITY_ALIASES[c] ?? c;
}

export function applyScope(place) {
  return { ...place, inGvncScope: GVNC_CITIES.has(normalizeCity(place.city)) };
}
