# Return Handoff: MUSE-Grounded Sampler

Date: 2026-05-26

## Active Goal Status

Complete. The shaped goal was pursued in `/Users/ender/code/Arts Council/cultural-asset-map`.

No UI wiring was done. No coordinate/geocoding pass was reopened. Dirty worktree changes that predated this work were preserved.

## Files Changed or Created

Created:

- `scripts/build-muse-grounded-sampler.js`
- `tests/test_muse_grounded_sampler_contract.js`
- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_grounded_sampler.json`
- `reports/muse-grounded-sampler-summary.json`
- `reports/muse-grounded-sampler-return-handoff-2026-05-26.md`

Pre-existing dirty worktree files were left alone.

## Commands Run

```sh
node scripts/build-muse-grounded-sampler.js
node tests/test_muse_grounded_sampler_contract.js
node tests/test_v1_selected_directory_card_contract.js
node tests/test_v1_coordinate_sanity_pass_contract.js
git status --short
```

## Counts

- MUSE Article Index articles: `50`
- Evidence links total: `1126`
- Direct MUSE place evidence links: `348`
- Direct MUSE place candidates considered: `166`
- Fuzzy place links excluded as qualifiers: `414`
- Theme links excluded as qualifiers: `364`
- Qualified map-ready direct candidates: `139`
- Excluded direct candidates: `27`
- Final recommended sampler size: `12`

Coordinate status split among direct candidates:

- Map-Ready: `139`
- Needs Location Review: `23`
- No coordinate decision: `4`

Recommended sampler split:

- Cities: Nevada City `3`, Grass Valley `3`, Truckee `3`, Penn Valley `3`
- Categories: MUSE Picks `1`, Historic Places `2`, Performing Arts `2`, Galleries & Studios `2`, Arts Organizations `1`, Walks & Trails `2`, Eat, Drink & Stay `2`

## Candidate Sampler Places

1. Nevada County Arts Council
   - City/category: Nevada City / MUSE Picks
   - Direct articles: `22`
   - Evidence sample: `2024`, pp. `2-3`, "Land and Peoples Acknowledgement", matched on `Nevada County Arts Council`

2. Nevada Theatre
   - City/category: Nevada City / Historic Places
   - Direct articles: `12`
   - Evidence sample: `2024`, pp. `10-15`, "In Nevada County, the Arts Are Essential", matched on `Nevada Theatre`

3. The Center for the Arts
   - City/category: Grass Valley / Performing Arts
   - Direct articles: `11`
   - Evidence sample: `2024`, pp. `2-3`, "Land and Peoples Acknowledgement", matched on `Center for the Arts`

4. Miners Foundry
   - City/category: Nevada City / Historic Places
   - Direct articles: `8`
   - Evidence sample: `2024`, pp. `20-25`, "Calendar of Events 2024", matched on `Miners Foundry`

5. The Granucci Gallery
   - City/category: Grass Valley / Galleries & Studios
   - Direct articles: `7`
   - Evidence sample: `2024`, pp. `20-25`, "Calendar of Events 2024", matched on `The Granucci Gallery`

6. InConcert Sierra
   - City/category: Grass Valley / Performing Arts
   - Direct articles: `6`
   - Evidence sample: `2024`, pp. `16-19`, "Culture Connection: Local Arts News for 2024", matched on `InConcert Sierra`

7. Truckee Arts Alliance
   - City/category: Truckee / Arts Organizations
   - Direct articles: `6`
   - Evidence sample: `2024`, p. `7`, "Get Involved", matched on `Truckee Arts Alliance`

8. Truckee Tahoe Airport
   - City/category: Truckee / Galleries & Studios
   - Direct articles: `6`
   - Evidence sample: `2024`, pp. `16-19`, "Culture Connection: Local Arts News for 2024", matched on `Truckee Tahoe Airport`

9. Truckee River Regional Park
   - City/category: Truckee / Walks & Trails
   - Direct articles: `5`
   - Evidence sample: `2024`, pp. `20-25`, "Calendar of Events 2024", matched on `Truckee River Regional Park`

10. Blue Cow Deli
    - City/category: Penn Valley / Eat, Drink & Stay
    - Direct articles: `1`
    - Evidence sample: `2025`, pp. `26-28`, "Seasons in the GVNC Cultural District", matched on `Blue Cow Deli`

11. Buttermilk Bend Trail
    - City/category: Penn Valley / Walks & Trails
    - Direct articles: `1`
    - Evidence sample: `2025`, pp. `26-28`, "Seasons in the GVNC Cultural District", matched on `Buttermilk Bend Trail`

12. Gray Pine Winery
    - City/category: Penn Valley / Eat, Drink & Stay
    - Direct articles: `1`
    - Evidence sample: `2026`, pp. `50-53`, "New Gold in Nevada County", matched on `Gray Pine Winery`

Full evidence for all recommended and qualified candidates is in:

- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_grounded_sampler.json`
- `reports/muse-grounded-sampler-summary.json`

## Caveats

- The MUSE Article Index is seeded and semiautomatic. This is not an exhaustive claim about all MUSE coverage.
- Fuzzy place links and theme-only links were counted, but not used as qualifying evidence.
- Coordinate status was joined from the existing coordinate sanity pass. No new geocoding was performed.
- The recommended sampler uses a deterministic greedy diversity rule: direct article/link score first, then max `3` per city and max `2` per category before relaxing only if needed.
- Some high-scoring evidence comes from broad MUSE articles such as acknowledgements, editor letters, or calendars. That is direct place evidence, but final Browse copy may want a more editorial-feeling subset.

## Recommendation

Ready to become the first Browse Starting View input candidate, pending product review of editorial mix and UI copy.

Use `muse_grounded_sampler.json` as the data source for a next UI pass. Do not wire it blindly as final editorial truth; treat it as the first auditable MUSE-grounded input.

