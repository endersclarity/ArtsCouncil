# CLA-28 — Candidate markers sit in street-interpolated rows, not on their real building

**Status:** Backlog — decision/plan issue, not yet implemented.
**Session:** 2026-05-29 (design-review loop, owner-flagged on live map).

## Owner observation
On the live map, shops on **Mill Street (Grass Valley)** appear as a tight, evenly-spaced
**vertical column riding the street line** — not on the buildings where they actually sit.
"They are grouped up super tightly on the street where they exist but not over the buildings
they reside."

## Verified on the live map
Zoomed to the Mill St cluster inside the Local Reveal circle: markers form a rigid vertical
line along the road/sidewalk edge, regular spacing, two overlapping at the top. The building
footprints beside them are empty. Same pattern repeats on the next street over (white dots).
Before screenshot attached to the Linear issue ("Before — Mill St street-interpolated row").

## Root-cause analysis (data) — TWO causes mixed together

This is the key refinement over the original issue framing. `places.json` (1,415 rows,
1,097 with coords, 901 distinct) has **137 coordinate-points shared by 2+ places, affecting
344 places**. Those stacks split into two genuinely different problems:

### Cause A — Census street-interpolation (real inaccuracy)
- `us-census-geocoder` = 524 places, "medium" confidence, provenance `candidate`.
- That source returns **address-range interpolated** points along the road centerline —
  rooftop accuracy is not available from it. Distinct shops at distinct addresses land on
  the street at regular intervals.
- Example (Mill St): Ron's Real Records (233A), Marshall's Pasties (203),
  Nevada County Library (207) — each a separate interpolated point on the centerline.
- **Honest fix:** rooftop/parcel geocode for these → makes coordinates *true*.

### Cause B — Genuine co-location (stacking is correct)
- Many "stacks" are real: multiple venues truly share one address / building / park.
- Examples:
  - `211 Broad St` → 5 businesses inside the National Exchange Hotel (Lola, The National
    Bar, The Vault @ Crush, Crush, The Fates).
  - `11228 McCourtney Rd` → 8 *events* hosted at the Nevada County Fairgrounds.
  - `314 West Main St` → Center for the Arts + its guild + Granucci Gallery + open-studio host.
  - `Calanan Park`, `Pioneer Park` → multiple artworks/features within one park.
- **Honest fix:** collapse co-located into one expandable mark — moving these would be *wrong*.

## Why one fix isn't enough
- Rooftop geocode alone won't fix Cause B (co-located venues still pile up).
- Collapse alone won't fix Cause A (the collapsed mark still sits on the road, not the building).
- Real answer is likely **both, sequenced**: collapse co-located (quick front-end visual win)
  + scope a rooftop-geocode pass for the true interpolation cases.

## Coordinate-source distribution (for sizing)
| source | count | confidence |
|---|---|---|
| us-census-geocoder | 524 | medium (the interpolation offenders) |
| diana-workbook-* (lonlat + webmercator) | 439 | authoritative |
| none | 319 | needs-review (no geocode at all) |
| arcgis-cultural-assets-confident-match | 133 | high |
| human-verified (provenance) | 3 | — |

## Decision (initial)
Owner chose **"just update CLA-28, decide later."** Then asked for a `/prototype` to *see*
how accurate a different (rooftop) geocode could get.

---

## PROTOTYPE — rooftop geocode accuracy (2026-05-29)

**Question:** how accurate could we get if we re-geocoded these places with a rooftop/POI
source instead of census street-interpolation?

**Method (throwaway):** `_build_prototype.py` geocoded all 63 Mill St places via **OSM /
Nominatim** (free, 1 req/sec), measured the distance each moved from its current census
coordinate, and `prototype-rooftop-geocode.html` plotted current (red, on street) vs OSM
(green, on building) with correction lines. Served at `http://127.0.0.1:4179/`.

**Result — big accuracy win, with one clear trap:**
- OSM resolved **57 / 63**; **median correction ≈ 20 m** (street → storefront).
- **29 within 20 m, 41 within 50 m** of the building.
- **32 matched a *named business/POI*** (`shop/clothes`, `amenity/restaurant`,
  `shop/jewelry`, …) — i.e. OSM knows the actual storefront, not just the address.
- Examples: Marshall's Pasties 2.3 m, Crystal Empire Gems 4.1 m, GV Public Library 4.6 m.

**THE TRAP (the reason to prototype):** ~16 places jumped **200–6500 m**, ALL tagged
`highway/tertiary`. When OSM can't find the business it falls back to matching *"Mill Street"
the road* and drops a pin at the road's far end. "Moonrise on Mill St. Inn" flew **6.5 km**.
- **Guardrail (codifiable):** accept the OSM result ONLY when `class/type` is a building/POI
  (`shop`, `amenity`, `tourism`, `leisure`, `office`, `place/house`, `historic`). REJECT any
  `highway/*` (road fallback) — keep the existing coord or flag for manual review.
- 6 places returned no result at all (murals, a church, a closed cinema) → manual/skip.

**Verdict:** rooftop (OSM/Nominatim) geocoding is **dramatically more accurate** and free, but
must be **filtered by result type** and verified — not applied blind. This is the evidence
base for CLA-28 Option 2 (rooftop pass), now de-risked with a concrete accept/reject rule.

**Prototype artifacts (throwaway — delete or fold in once acted on):**
`_build_prototype.py`, `_mill_geocoded.json`, `_summary.txt`, `prototype-rooftop-geocode.html`.

## Full county geocode (2026-05-29) — _census_patch.json
Ran `_geocode_all_census.py` over all 524 `us-census-geocoder` places.
**Result: 429 accept / 61 reject-road / 34 reject-other / 0 no-result** (~82% accept).
Accepted shifts: median 37.7m, but **max 10,901m and 66 accepts >100m** — the `highway/*`
filter doesn't catch wrong-but-building-typed matches (same house number on another street,
same-named POI miles off). **Second gate required before applying:** also reject accepts with
`shift_m` over ~150m (keep old coord / flag manual). `_patch_summary.py` prints the
distribution + the >200m list. Safe-to-apply set ≈ `decision=="accept" AND shift_m<=150`.

## Related
CLA-16 (candidate-tier visual distinction), CLA-15 (dataset rebuild), CLA-14 (PRD).
**CLA-27** (basemap "looks bare" styling pass) — owner re-raised the near-blank MapLibre
basemap this session; decided **keep near-blank for now, fix later**, accuracy first.
Current basemap = CARTO Positron repainted via `QUIET_BASEMAP` (`app.js:34-61, :1505`).
