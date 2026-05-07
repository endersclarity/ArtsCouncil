# V1 Discovery Map Impeccable Suite

Status: Draft 1 design/UX review
Date: 2026-05-06
Target: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/`

## Summary

The V1 alpha is no longer just design. It is a working MapLibre prototype with real data wiring:

- 1,076 places
- 24 events
- 3 curated paths
- MapLibre canvas, clusters, filters, event mode, path route lines, and numbered path markers

The current weakness is craft, not wiring. Draft 2 should focus on place-proof imagery, selected-place cards, map density, and exact NCAC visual fidelity.

## Critique

Score: 7/10 for alpha proof, 5.5/10 for visual finish.

What works:

- Map-first product shape is correct.
- Red/ink/paper direction is now closer to NCAC than the OpenDesign mock.
- Places, Events, and Paths are understandable.
- Mobile keeps meaningful map area visible above the docked panel.
- Forbidden framing is absent: no Arts Hub, AI trip planner, tourism platform, public correction CTA, or submission flow.

What does not yet work:

- The panel still feels more like an admin/debug control surface than a refined NCAC cultural interface.
- Selected-place card craft is underdeveloped.
- Category colors create visual noise and weaken the single-red NCAC system.
- Image proof is inconsistent. Watercolor/category art and logos must not count as V1 place proof.
- Event detail copy has imported feed punctuation issues.

## Audit

Browser check:

- Console: clean.
- Network: required app/data/font/map requests load.
- MapLibre: loads and renders.
- Places: clusters and point layers load.
- Events: mode switches and event detail appears.
- Paths: route line and numbered markers appear.

Risks:

- External dependencies are CDN-backed: MapLibre, Google Fonts, Typekit, CARTO tiles.
- The basemap is CARTO Positron, not a custom NCAC style.
- The data set is large enough that cluster behavior needs tuning for demo clarity.

## Adapt

Mobile passes basic map-first expectations:

- Header is compact.
- Navigation collapses.
- Map remains visible above the panel.
- Panel docks at bottom.

Mobile risks:

- Panel height can still dominate after detail selection.
- Filter chips wrap into a dense block.
- Detail cards with images may need a more deliberate mobile collapsed state.

## Typeset

Pass:

- Serif drift has been removed.
- Sans stack is aligned with the NCAC/Claude handoff direction.
- Header lockup reads as NCAC-adjacent.

Needs Draft 2:

- Reduce all-caps density.
- Tighten line-height and spacing inside the panel.
- Create clearer scale contrast between hint title, detail title, and metadata.
- Verify the Typekit family against the live site before calling font fidelity complete.

## Layout

Pass:

- Map dominates first load.
- Detail card is hidden until interaction.
- Header no longer consumes too much vertical space.

Needs Draft 2:

- Make the control panel feel less like a data console.
- Consider a lighter filter treatment so the map stays dominant.
- Tune legend placement so it does not compete with controls on small screens.

## Clarify

Copy mostly passes the V1 brief.

Needs Draft 2:

- Replace "Live event layer" with something less technical.
- Clean feed copy punctuation before display.
- Rework empty/detail language so it feels less internal.
- Keep "Internal alpha" visible, but make the rest of the interface feel like the product, not a debugging shell.

## Image Policy

Watercolor category art is not acceptable V1 placeholder imagery.

Image buckets needed:

- real place photo
- logo or weak image
- watercolor/category legacy art
- missing image
- broken URL
- generated placeholder needed

Generated placeholders should be NCAC-compatible, visibly labeled, and category-specific. Suggested first set:

- Historic place
- Gallery or studio
- Performance space
- Public art
- Maker shop
- Event venue

## Draft 2 Targets

1. Add explicit image-gap classification and stop treating watercolor art as place proof.
2. Generate and wire a small labeled placeholder image set.
3. Improve selected-place card design around image proof, concise copy, and practical action.
4. Tune cluster/category color strategy toward NCAC red plus restrained neutrals.
5. Improve panel rhythm, spacing, and type hierarchy.

## Verdict

Keep the current MapLibre implementation. Do not restart from OpenDesign. Draft 2 should be a focused polish and image-system pass.
