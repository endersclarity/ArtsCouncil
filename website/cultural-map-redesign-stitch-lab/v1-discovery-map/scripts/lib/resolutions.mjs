// applyResolutions — apply human-reviewed coordinate decisions.
//
// Two cases feed this table:
//  - Conflict resolution: dedupePlaces flags genuinely-divergent same-tier listings
//    with `coordinateConflict: true` rather than silently picking one. When a human
//    reviews the flag and confirms the true location, the answer is recorded here.
//  - Anchor verification: an anchor stuck on a candidate/none coordinate, whose true
//    location a human has confirmed (e.g. via the place's own website or a land-trust
//    trail map), is pinned here so it ships on a trusted coordinate.
//
// In both cases the record is pinned to the verified coordinate, promoted to a
// trusted Map-Ready tier (`coordinateProvenance: "human-verified"`), and any conflict
// flag is cleared. Each entry is keyed by place id: { lat, lng, address?, note }.

export const KNOWN_RESOLUTIONS = {
  // North Star House: three Diana listings disagreed; two agree on 39.1965/-121.0779
  // (confirmed on satellite) and one lonlat row was an outlier the auto-merge picked.
  // Human-confirmed 2026-05-28: the correct address is "12075 Auburn Rd" (not "Old").
  "north-star-house-grass-valley": {
    lat: 39.196523,
    lng: -121.077862,
    address: "12075 Auburn Rd",
    note: "human-confirmed 2026-05-28",
  },

  // ASiF (Artists' Studio in the Foothills): anchor was on a census coordinate. Address
  // "940 Idaho Maryland Rd" verified against asifstudios.com/location + GV Chamber
  // (2026-05-28), so the census geocode is a correct-address geocode — promote it.
  "asif-studios-grass-valley": {
    lat: 39.222542531384,
    lng: -121.051461055927,
    address: "940 Idaho Maryland Rd",
    note: "address web-verified 2026-05-28 (asifstudios.com); census geocode confirmed",
  },

  // Hirschman's Pond: anchor had no coordinate (Directory-Only). Trailhead coordinate
  // from Bear Yuba Land Trust / Nevada City Chamber trail pages (web-verified 2026-05-28).
  "hirschman-s-pond-nevada-city": {
    lat: 39.26844,
    lng: -121.02969,
    note: "trailhead coord, Bear Yuba Land Trust + Nevada City Chamber, web-verified 2026-05-28",
  },
};

export function applyResolutions(places, resolutions = KNOWN_RESOLUTIONS) {
  return places.map((place) => {
    const fix = resolutions[place.id];
    if (!fix) return place;

    const resolved = { ...place };
    resolved.lat = fix.lat;
    resolved.lng = fix.lng;
    if (fix.address != null) resolved.address = fix.address;
    resolved.coordinateProvenance = "human-verified";
    resolved.markerTier = "map-ready";
    resolved.locationReviewStatus = "Map-Ready";
    resolved.publicMarker = true;
    resolved.locationCaveat = "";
    if (fix.note) resolved.coordinateResolutionNote = fix.note;
    delete resolved.coordinateConflict;
    return resolved;
  });
}
