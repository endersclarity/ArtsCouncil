## Problem

The live map data ([v1-discovery-map/data/places.json](website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json), 1,415 records) still contains **duplicate place records**, despite a prior dedupe pass that was believed to have cleared them. Surfaced during the photo-fetch work ([CLA-35](https://linear.app/claudecode/issue/CLA-35)) — both copies of several places independently received photos, wasting effort and (mildly) Places API calls.

## Evidence

Two kinds of duplication:

**1. Exact name collisions — 16 groups (16 extra records)**, e.g.:
- Sierra Theatre Company (Grass Valley)
- Golden Road Radio and Television (Nevada City)
- Inn Town Campground (Nevada City)
- Lucchesi Vineyards Winery (Grass Valley)
- LeGacy Presents, Paul Emery Presents (Nevada City)
- Donner Memorial State Park, Summit Lake Trail, Truckee River Legacy Trail, Clair Tappaan Lodge, Dark Horse Coffee Roasters, Tahoe Music Alive, Truckee Downtown Merchants Association (Truckee/Tahoe cluster)

**2. Near-dups (variant names — NOT caught by exact match)**, e.g.:
- Arquils Wine / Arquils Winery
- KVMR / KVMR 89.5FM / KVMRx-105.7FM
- The Cauldron / The Cauldron @ Loot and Lore
- Yinne Boma Animation Studios Company / Yinnebowma
- Alloro Cucina Italiana / Alloro Ristorante
- Prime Cinemas / Prime Cinemas Del Oro Theatre

So total duplication is **>16** once name variants are included.

## Why the prior dedupe missed them

Likely matched on exact name only. Needs a fuzzier strategy: normalized name + proximity (lat/lng) and/or shared website/phone, plus a review step for name-variant cases that are genuinely the same entity vs. legitimately distinct (e.g. a venue inside a venue).

## Suggested approach

- [ ] Detect: group by normalized name, then by coordinate proximity (~50m) and matching website/phone domain.
- [ ] Classify each candidate group: true dup vs. distinct entity (manual review for variant-name pairs).
- [ ] Merge: keep the richest record (most fields, real photo, best coordinate confidence), fold in any unique data, drop the rest. Preserve `id` stability for anything referenced elsewhere.
- [ ] Re-run a verification pass to confirm count drops and no real entities were lost.

## Notes

- Coordinate with [CLA-35](https://linear.app/claudecode/issue/CLA-35): merging should prefer the copy that already has a real photo.
- Backup before any destructive merge (a full `places.json` backup already exists at `places.json.bak-before-photofetch`).
