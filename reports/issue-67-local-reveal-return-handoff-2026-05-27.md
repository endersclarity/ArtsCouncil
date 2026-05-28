# Return Handoff: Issue #67 Local Reveal

Date: 2026-05-27

## Status

Issue #67 is implemented as a Local Reveal Directory Browser update.

Dense map-area intent now updates the Directory Browser to a nearby-place list with a clear origin and Back action. The map also carries a subtle active-area cue through the `local-reveal-area` source/layer. This stays out of the selected-place drawer path.

## What Changed

- Added explicit `localReveal` state and previous-context restoration in `app.js`.
- Added nearby-place ranking from the clicked map location.
- Added the Local Reveal list state in the Directory Browser:
  - `12 places near this spot`
  - `Back to browse`
  - nearby place rows
- Added a subtle `local-reveal-area` map cue.
- Added a map-level area hit test using `queryRenderedFeatures` around `place-density`, so dense-area clicks do not require exact tiny-dot hits.
- Added Local Reveal styles.
- Added a focused contract test for Local Reveal behavior.

## Verification

Commands run:

```bash
node --check website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js
node tests/test_v1_local_reveal_contract.js
node tests/test_v1_browse_starting_view_contract.js
node tests/test_v1_constellation_disclosure_contract.js
node tests/test_v1_mobile_map_legibility_contract.js
node tests/test_v1_selected_directory_card_contract.js
```

All passed.

Rendered browser check:

- Dense map-area event produced `12 places near this spot`.
- Local Reveal showed 12 nearby rows.
- Back restored the prior `Places to explore` Browse Starting View.

Screenshot:

- `reports/issue-67-local-reveal-desktop-2026-05-27.png`

Debug cleanup:

```bash
rg -n "DEBUG-LR|LOCAL_REVEAL_DEBUG|LOCAL_REVEAL_QUERY|debugLocalReveal|recordLocalRevealDebug" website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js tests
```

No output.

## Scope Boundaries

This is #67 only.

Not included:

- #68 Selection Drawer / selected-place card drawer work.
- #69 coordinate caveat UI.
- Full #70 copy cleanup.
- Deployment.

## Files In This Slice

- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/app.js`
- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css`
- `tests/test_v1_local_reveal_contract.js`
- `reports/issue-67-local-reveal-desktop-2026-05-27.png`
- `reports/issue-67-local-reveal-return-handoff-2026-05-27.md`

## Notes For Next Work

#68 can proceed next, but treat `app.js` and `styles.css` as recently touched by #67. Selection Drawer work should build on the existing `showPlace` / selected-place path without repurposing Local Reveal state.
