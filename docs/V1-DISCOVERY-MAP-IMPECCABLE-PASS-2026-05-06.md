# V1 Discovery Map Impeccable Pass

Status: draft checkpoint review
Date: 2026-05-06

## Verdict

The corrected draft now matches the V1 brief materially better than the OpenDesign concept pass.

It is a working MapLibre alpha, not a static mock. It uses real places/events/paths JSON, keeps the map as the primary surface, and applies a stricter NCAC red/ink/paper sans system.

## Stack-Up Against V1 Artifacts

- V1 as Discovery Map, not Arts Hub: pass. The interface avoids Arts Hub/platform/AI-trip-planner language.
- Map-first opening: pass. First viewport is dominated by MapLibre; detail content is hidden until interaction.
- NCAC visual constraint: partial pass. Red/ink/paper and sans typography are now aligned with the live-site/Claude handoff direction. Remaining risk is exact live-site font fidelity.
- Places primary, events secondary, paths curated: pass. Places load first; Events is a mode; Paths are fixed overlays with numbered stops and a route line.
- Maintenance-light editorial presentation: pass. The copy is compact and avoids stakeholder-facing correction/submission CTAs.
- Image proof: partial pass. Real event/place imagery still depends on available data; placeholders remain visibly labeled.

## Impeccable Notes

- The heavy OpenDesign serif/cream concept was rejected.
- The UI now uses structural red, not decorative red.
- The panel is still large, but acceptable for alpha because it carries filters and stakeholder-readable controls.
- Mobile is map-first, with the panel docked low enough to show map context.
- The visual direction is closer to "working NCAC product surface" than "pretty direction board."

## Known Gaps

- Exact live NCAC font source still needs confirmation if the Typekit kit changes.
- The basemap is CARTO Positron, not a custom NCAC map style.
- Place data volume creates dense clusters; this is truthful, but next pass should tune zoom/cluster behavior.
- This is still a preview artifact under stitch-lab, not canonical deploy.

## Recommendation

Commit this as Draft 1 of the working V1 MapLibre alpha. Next draft should focus on map styling, cluster density, and selected-place card craft, not another broad visual reset.
