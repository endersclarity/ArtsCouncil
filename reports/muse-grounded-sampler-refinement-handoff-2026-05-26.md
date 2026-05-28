# Return Handoff: Refined MUSE-Grounded Showcase Sampler

Date: 2026-05-26

## Status

Complete. The sampler generator now separates the broader direct MUSE evidence pool from the first-load showcase sampler.

No UI wiring was done. No coordinate/geocoding work was reopened. Coordinate status is joined only from the existing coordinate sanity pass.

## Files Changed or Created

Modified:

- `scripts/build-muse-grounded-sampler.js`
- `tests/test_muse_grounded_sampler_contract.js`
- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/muse_grounded_sampler.json`
- `reports/muse-grounded-sampler-summary.json`

Created:

- `reports/muse-grounded-sampler-refinement-handoff-2026-05-26.md`

## Commands Run

```sh
node scripts/build-muse-grounded-sampler.js
node tests/test_muse_grounded_sampler_contract.js
node tests/test_v1_selected_directory_card_contract.js
node tests/test_v1_coordinate_sanity_pass_contract.js
```

## Counts Before / After

Before refinement:

- Direct MUSE place candidates considered: `166`
- Map-ready direct candidates: `139`
- Prior generated sampler size: `12`
- Prior first sampler included outside-scope places from Truckee and Penn Valley.
- Prior first sampler allowed non-editorial direct mentions to count toward place strength.

After refinement:

- Direct MUSE place candidates considered: `166`
- Direct evidence links total: `348`
- Editorial direct evidence links: `294`
- Non-editorial direct evidence links: `54`
- GV/NC showcase-scope direct candidates: `99`
- GV/NC candidates with editorial direct evidence: `95`
- Qualified showcase candidates after coordinate join: `85`
- Excluded direct candidates from first showcase sampler: `81`
- Final showcase sampler size: `12`

Coordinate status split across all direct candidates:

- Map-Ready: `139`
- Needs Location Review: `23`
- No coordinate decision: `4`

First showcase sampler split:

- Cities: Nevada City `6`, Grass Valley `6`
- Categories: MUSE Picks `2`, Historic Places `2`, Performing Arts `3`, Galleries & Studios `2`, Eat, Drink & Stay `1`, Arts Organizations `2`

## Excluded Categories / Counts

Direct evidence category counts:

- Editorial: `294`
- Calendar: `33`
- Administrative: `9`
- Get Involved: `6`
- Editor Letter: `4`
- Acknowledgement: `2`

First showcase exclusion reasons:

- Needs Location Review: `9`
- Needs Location Review; Outside Showcase Sampler Scope: `14`
- Outside Showcase Sampler Scope: `50`
- No coordinate decision; Outside Showcase Sampler Scope: `3`
- No coordinate decision: `1`
- No Editorial Direct MUSE Evidence: `4`

Fuzzy/theme-only exclusions:

- Fuzzy place links excluded as qualifiers: `414`
- Theme links excluded as qualifiers: `364`

## Final GV/NC Showcase Sampler Candidates

1. Nevada County Arts Council
   - Nevada City / MUSE Picks
   - Editorial direct articles: `17`
   - Evidence: `2024`, pp. `10-15`, "In Nevada County, the Arts Are Essential", matched on `Nevada County Arts Council`

2. Nevada Theatre
   - Nevada City / Historic Places
   - Editorial direct articles: `10`
   - Evidence: `2024`, pp. `10-15`, "In Nevada County, the Arts Are Essential", matched on `Nevada Theatre`

3. The Center for the Arts
   - Grass Valley / Performing Arts
   - Editorial direct articles: `8`
   - Evidence: `2024`, pp. `10-15`, "In Nevada County, the Arts Are Essential", matched on `Center for the Arts`

4. Miners Foundry
   - Nevada City / Historic Places
   - Editorial direct articles: `6`
   - Evidence: `2024`, pp. `28-31`, "48 Hours in GVNC: Exploring Culture & Art", matched on `Miners Foundry`

5. Seven Stars Gallery
   - Nevada City / Galleries & Studios
   - Editorial direct articles: `6`
   - Evidence: `2024`, pp. `28-31`, "48 Hours in GVNC: Exploring Culture & Art", matched on `Seven Stars Gallery`

6. Nevada City Winery
   - Nevada City / Eat, Drink & Stay
   - Editorial direct articles: `6`
   - Evidence: `2024`, pp. `28-31`, "48 Hours in GVNC: Exploring Culture & Art", matched on `Nevada City Winery`

7. The Granucci Gallery
   - Grass Valley / Galleries & Studios
   - Editorial direct articles: `5`
   - Evidence: `2024`, pp. `28-31`, "48 Hours in GVNC: Exploring Culture & Art", matched on `The Granucci Gallery`

8. Nevada City Film Festival
   - Nevada City / Arts Organizations
   - Editorial direct articles: `4`
   - Evidence: `2024`, pp. `36-37`, "A Filmmaking Tradition", matched on `Nevada City Film Festival`

9. InConcert Sierra
   - Grass Valley / Performing Arts
   - Editorial direct articles: `4`
   - Evidence: `2024`, pp. `16-19`, "Culture Connection: Local Arts News for 2024", matched on `InConcert Sierra`

10. Nevada County Fair
    - Grass Valley / Arts Organizations
    - Editorial direct articles: `4`
    - Evidence: `2024`, pp. `44-45`, "Arts in Education", matched on `Nevada County Fair`

11. Make Local Habit
    - Grass Valley / MUSE Picks
    - Editorial direct articles: `3`
    - Evidence: `2024`, pp. `28-31`, "48 Hours in GVNC: Exploring Culture & Art", matched on `Make Local Habit`

12. Nevada County Fairgrounds
    - Grass Valley / Performing Arts
    - Editorial direct articles: `2`
    - Evidence: `2026`, pp. `10-27`, "Culture Connection: Local Arts News for 2026", matched on `Nevada County Fairgrounds`

## Data Shape

`muse_grounded_sampler.json` now includes:

- `directMuseCandidates`: all broader direct MUSE candidates for future card enrichment.
- `qualifiedCandidates`: all map-ready direct MUSE candidates under the old broad qualification.
- `showcaseQualifiedCandidates`: GV/NC, map-ready, editorial-direct candidates.
- `showcaseSampler` and `recommendedSampler`: the current first-load showcase candidate set.
- `directEvidenceCategoryCounts` and `showcaseExclusionReasonSplit` for auditability.

## Caveats

- The MUSE Article Index is seeded and semiautomatic, not exhaustive.
- "Culture Connection: Local Arts News" is treated as editorial/contextual, not calendar-only.
- Non-editorial direct mentions are preserved, but do not qualify first-load showcase inclusion.
- Truckee, Penn Valley, and other outside-scope candidates remain available for future MUSE-backed card enrichment.
- The sampler is data-ready, not UI-wired.

## Recommendation

Ready to inform the Browse Starting View prototype/UI pass, pending product review of editorial mix and implicit MUSE copy.

