# V1 Design Iteration Inventory

Status: living inventory
Date: 2026-05-06
Purpose: track existing design artifacts, old iterations, brand sources, and live-site references before choosing the V1 Discovery Map frontend direction.

## How To Read This

This is evidence, not gospel. Older design work may be useful, stale, misleading, or only good for one small idea. Each entry gets a current read:

- Keep: strong fit for the V1 Discovery Map brief.
- Remix: contains useful pieces, but not the whole direction.
- Reference: useful background or brand evidence.
- Kill: likely off-brief for V1.
- Unknown: needs more inspection.

## North Star From Current Brief

V1 should be a map-first cultural discovery product. It should feel culturally authoritative, Arts Council-owned, visually credible, and maintenance-light. It should not feel like a generic GIS map, a tourism-board calendar, a full Arts Hub, an AI trip planner, or a public launch.

## High-Signal Sources

### V1 Discovery Map Brief

- Path: `cultural-asset-map/docs/V1-DISCOVERY-MAP-BRIEF.md`
- Type: current internal alignment brief
- Read: Keep
- Signal: canonical current direction. Use this to judge all older artifacts.

### Claude Design Handoff

- Path: `claudedesign-handoff/`
- Type: prototype package shown or related to what Arts Council saw on 2026-04-24
- Read: Remix
- Evidence:
  - `claudedesign-handoff/README.md` says 5 variants were explored.
  - The README says 2 keepers were locked: Broadsheet and Frame-First Map.
  - Prototype uses DM Sans / Plus Jakarta Sans, before the Diana brand guide / live site typography was confirmed.
- Useful:
  - Strong editorial confidence.
  - Strong NCAC red / typemark direction.
  - Simple brand system.
  - Broadsheet concept gives “cultural authority.”
  - Frame-first map connects to the brand guide’s red framing device.
- Risk:
  - Broadsheet is feed-first, not the new pure-map-first V1 direction.
  - It can drift into events publication / calendar product.
  - It may under-serve the actual interactive map.

### NCAC Brand Guide

- Paths:
  - `claudedesign-handoff/NCAC_brand-compressed.pdf`
  - `claudedesign-handoff/brand-pages/`
- Type: Diana / Arts Council brand source
- Read: Keep as brand reference
- Evidence seen:
  - Source email: Diana Arbex, "Re: Brief | Experience Planning Committee Meeting", 2026-03-14, attached `NCAC_brand-compressed.pdf` as a rough brand style guide.
  - Local copies of `NCAC_brand-compressed.pdf` match each other and are the same size as the Gmail attachment: 9,515,010 bytes.
  - Embedded PDF fonts: `PolymathDisp-Bold` and `PolymathText-Bold`.
  - Dominant red + white + charcoal.
  - Large typemark-based identity.
  - Core aims include hierarchy, lower visual complexity, legibility, scalable systems.
  - Tactics include same typography across marks, two to three type sizes, single accent color, framing graphical device, grid-based layouts.
- Useful:
  - Supports a more Arts Council-native direction.
  - Supports red frame, strong hierarchy, fewer colors, and clear type.
  - Confirms the product should not look like generic map software.
- Risk:
  - Overusing the red frame can make the interface feel like a poster system rather than a usable map.

### Diana Data Engineering Workbook

- Path: `cultural-asset-map/docs/source-artifacts/Cultural Assets - data engineering.numbers`
- Type: Diana / Arts Council source data workbook
- Read: Reference for data archaeology; not direct production input yet
- Evidence:
  - Source email: Diana Arbex, "Re: Brief | Experience Planning Committee Meeting", 2026-03-14.
  - The email described this as the "new data sheet."
  - Converted locally to XLSX for inspection.
  - Contains 16 sheets, including Historic Landmarks, MUSE BD, Artisan Places to Eat/Drink/Stay, Arts Organization, Cultural Resources and Media, Fairs and Festivals, Gallery/Studio/Museum, Performance Spaces, Artisan Places to Shop, Preservation & Cultural Organization, Services, Public Art, Walks and Trails, Parking, Out of Business, and Sofia notes.
  - Uses cleanup-oriented fields and flags such as New, Deleted as Duplicate, Purple, Out of Business, GlobalID, and notes about what is pending and importing to ESRI.
- Current read:
  - This likely represents a cleaned/working cultural asset inventory around March 2026.
  - It is probably upstream or adjacent to the Arts Hub V2 `cultural-assets.json`, which contains 1,969 assets across similar categories.
  - Treat as source evidence until we intentionally reconcile it against current app data and ArcGIS/live sources.

### Current/Saved Site Screenshot

- Paths:
  - `claudedesign-handoff/handoff/uploads/current-site-fold.png`
  - `claudedesign-handoff/handoff/uploads/current-site-full.png`
- Type: captured current site/map experience from earlier work
- Read: Reference / Remix
- Useful:
  - Shows existing map + right-side event rail model.
  - Shows red brand block and simple nav.
  - Shows event cards with images.
- Risk:
  - Feels closer to a calendar/site navigation surface than a cultural Discovery Map.
  - Pin density is visible, but hierarchy and cultural story are weak.
  - Right rail competes with the map.

### Public Arts Council Cultural Asset Map

- URL: `https://www.nevadacountyarts.org/cultural-asset-map`
- Type: live/public reference
- Read: Reference for surrounding site design; Kill/Remix for current map product
- Evidence:
  - Exact page loaded after an earlier transient Squarespace `503 Service Unavailable` on 2026-05-06.
  - The current asset map experience is not the desired product direction, per user/stakeholder signal.
  - The surrounding live NCAC/Squarespace design language is locked as a constraint.
  - Live page source references Typekit plus Google Fonts, including `Alegreya Sans`, `Source Sans Pro`, and Typekit `polymath-variable-2th9nk`.
- Current read:
  - Use the live site and Diana brand guide as the design rails.
  - Do not preserve the current asset map UX merely because it is live.
  - The V1 Discovery Map should feel native to the current NCAC site while making the map itself much stronger.

## Repo Iterations To Review

### Stitch Lab Variants

- Path: `cultural-asset-map/website/cultural-map-redesign-stitch-lab/`
- Type: many HTML/CSS frontend experiments
- Read: Unknown / likely mixed
- Initial samples:
  - `index-maplibre-hero-mapfirst.html`: conceptually aligned by name, but screenshot shows a page explaining “Start on the map” before the map. This conflicts with the new “pure map first” opening.
  - `index-maplibre-hero-intent-muse-pass.html`: visually broken or incomplete in screenshot; likely not a keeper.
  - `index-maplibre-storyline-wayfinder.html`: contains focus-mode language, but screenshot looked like a shell/incomplete view.
  - `index-maplibre-grandexchange.html`: atmospheric and editorial, but not map-first.
  - `index.html`: “Culture of Gold Country” editorial page. Strong tone, but not V1 map-first.
- Need next:
  - inspect more variants only if names or screenshots suggest V1 fit.
  - avoid getting trapped in obsolete versions.

### Arts Hub V2

- Path: `cultural-asset-map/website/arts-hub-v2/`
- Type: broader multi-page Arts Hub prototype
- Read: likely Remix / Kill for V1 scope
- Useful:
  - story pages may have voice/image/content ideas.
  - may contain event/story structures worth borrowing.
- Risk:
  - “Arts Hub” framing is an explicit V1 non-goal.
  - May over-expand scope.

### Prior Design Docs

- Paths:
  - `cultural-asset-map/docs/plans/2026-02-08-map-focus-and-smart-labels-design.md`
  - `cultural-asset-map/docs/design-decisions/basemap-compare.html`
  - `cultural-asset-map/docs/design-critique-phase3.md`
- Type: prior analysis/design thinking
- Read: Unknown / likely useful for implementation details
- Need next:
  - inspect for map-label, basemap, hierarchy, and usability decisions after visual direction is clearer.

## Early Read

The Claude Design work is not bullshit. It appears to be a legitimate design branch with strong Arts Council brand alignment. But it is not automatically the V1 answer.

Best current read:

- Keep the brand discipline: red, typemark confidence, hierarchy, grid, fewer colors.
- Keep the editorial confidence from Broadsheet.
- Keep the frame-first instinct only where it strengthens map authority.
- Use Polymath / live NCAC typography as the brand source of truth, not DM Sans / Plus Jakarta Sans or Playfair / DM Sans experiments.
- Move away from feed-first/event-first opening.
- Move toward pure map-first with brand/editorial accents.
- Treat old stitch variants as scrap pile until each proves fit against the V1 brief.

## Open Questions

- What exactly did Arts Council like about the Claude Design version: red frame, typography, event energy, map simplification, or overall confidence?
- Which repo iteration is closest to what was actually shown on 2026-04-24?
- Should the next design spec start from Claude Design, from current map code, or from a fresh map-first composition using both as references?
