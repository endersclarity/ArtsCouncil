# Draft 4: Visitor Pull / Cultural Story Layer

## Summary

Move the V1 Discovery Map from "working alpha with dots" to "authored cultural discovery demo." Keep the same scope and MapLibre architecture, but add a small editorial layer that gives visitors something to notice, click, and feel. Draft 4 centers on 8-12 Featured Anchors with restrained icons, image-led cards, and short cultural hooks.

## Key Changes

- Add a curated anchor layer:
  - Create 10 pure-editorial anchors from known demo/path/cultural records: `Miners Foundry Cultural Center`, `Nevada Theatre`, `The Center for the Arts`, `Booktown Books`, `Nevada City Winery`, `The Stone House`, `Art Works Gallery`, `C.H.A.M.P. Gallery at City Hall`, `ASiF Studios`, `The Curious Forge`.
  - Store anchor metadata in data prep, not ad hoc UI copy: anchor label, short hook, icon key, priority, and optional path association.
  - Keep all 1,076 places visible, but make anchors the authored story layer.

- Add anchor-only icon grammar:
  - Use icons only for featured anchors and path stops.
  - Do not add icons to every place.
  - Use a small icon set: `stage`, `book`, `gallery`, `maker`, `historic`, `food-drink`.
  - Render anchors as restrained icon + ring markers; regular places stay quiet dots.

- Improve first-load visitor pull:
  - Replace the generic first hint with one image-led featured anchor.
  - Include short editorial hook, category/city, and a clear "View on map" action.
  - Use real image when available; use existing labeled editorial placeholder when needed.

- Strengthen cards and paths:
  - Selected anchor cards show image, icon/label, hook, description, category/city, and one practical action.
  - Path panels show stop icons and stronger editorial hooks, not just functional stop lists.
  - Keep events secondary and unchanged except where related events appear on anchor/place cards.

- Keep docs current:
  - Add Draft 4 decisions to `docs/V1-DISCOVERY-MAP-DECISION-LOG.md`.
  - Update `DESIGN.md` with anchor-only icon grammar and first-load featured-anchor rule.
  - Add a Draft 4 review note after QA.

## Test Plan

- Data checks:
  - Regenerate data.
  - Confirm all 10 anchors resolve to visible place records.
  - Confirm anchors include icon key, hook, priority, image state, and valid coordinates.
  - Confirm placeholder anchors remain visibly labeled.

- Browser checks:
  - First load shows an image-led featured anchor.
  - Anchor markers render with icon + ring.
  - Regular places remain quiet dots.
  - Clicking an anchor opens an image-led card with hook and one action.
  - Paths still show numbered stops and clickable stop list.
  - Places, Events, and Paths modes still work.
  - Mobile has no horizontal overflow and keeps map-first layout.
  - Console has no errors.

- Impeccable/dogfood checks:
  - Verify the map feels more authored and less like generic GIS.
  - Verify no category rainbow, icon soup, Arts Hub framing, AI trip planner framing, public correction CTA, save/share, or directions.
  - Run dogfood after implementation and fix any high-signal findings before committing.

## Assumptions

- Draft 4 is still V1 Discovery Map alpha, not a new product scope.
- Editorial importance beats data readiness, but image honesty remains mandatory.
- Icons support cultural anchors only; they are not a full taxonomy system.
- Use existing generated placeholders where needed. Do not create a large new AI image set in Draft 4.
- Default visual choice: quieter NCAC-native clarity over novelty.
