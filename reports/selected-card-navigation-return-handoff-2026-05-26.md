# Return Handoff: Selected Place Card Navigation Prototype

Date: 2026-05-26

## Prototype Path

`/Users/ender/code/Arts Council/cultural-asset-map/website/cultural-map-redesign-stitch-lab/v1-discovery-map/prototypes/selected-card-navigation/`

Static route only. No production wiring. No source data changes.

## Local URLs

Local server used:

`http://127.0.0.1:4174/`

Variant URLs:

- Replace With Back Trail: `http://127.0.0.1:4174/v1-discovery-map/prototypes/selected-card-navigation/?variant=replace&place=center`
- Split Stack: `http://127.0.0.1:4174/v1-discovery-map/prototypes/selected-card-navigation/?variant=split&place=center`
- Card Drawer With Context Rail: `http://127.0.0.1:4174/v1-discovery-map/prototypes/selected-card-navigation/?variant=drawer&place=center`
- Breadcrumb Tabs: `http://127.0.0.1:4174/v1-discovery-map/prototypes/selected-card-navigation/?variant=tabs&place=center`

## Screenshots

- `/Users/ender/code/Arts Council/cultural-asset-map/reports/selected-card-navigation-replace.png`
- `/Users/ender/code/Arts Council/cultural-asset-map/reports/selected-card-navigation-split.png`
- `/Users/ender/code/Arts Council/cultural-asset-map/reports/selected-card-navigation-drawer.png`
- `/Users/ender/code/Arts Council/cultural-asset-map/reports/selected-card-navigation-tabs.png`

## Variant Notes

### Replace With Back Trail

The left Directory Browser becomes a selected-place focused panel. Search, categories, and the list temporarily collapse away. A compact prior browse trail remains above the Unified Place Card, and a direct back action restores the sense of return path.

Best for: maximum focus on the selected place.

Risk: strongest chance of feeling like the browser disappeared, especially if the back action is missed.

### Split Stack

The left column stays as the Directory Browser on top and the Unified Place Card below. The selected Directory Card remains visible in list context while the detail card occupies the lower half.

Best for: preserving exact browsing context.

Risk: cramped on shorter screens; both browser and card compete for vertical space.

### Card Drawer With Context Rail

The Directory Browser stays intact. The Unified Place Card opens as a horizontal drawer over the map, with a dedicated context rail showing return path, current filter, and selected marker relationship.

Best for: balancing place focus, map context, and browser continuity.

Risk: drawer height and content density need careful responsive rules.

### Breadcrumb Tabs

The selected card appears at right with a small tab strip: Place, Directory, Map. Breadcrumbs sit inside the card so the user can mentally switch between the object, the list they came from, and the map state.

Best for: users who understand tabbed navigation.

Risk: tabs may imply separate full modes that do not really exist yet.

## Recommendation

Recommend **Card Drawer With Context Rail** as the direction to carry forward.

It keeps the Directory Browser stable, preserves Directory Map Coordination, and gives the Unified Place Card enough room to feel intentional. The context rail does the important job: it tells the user where they came from without forcing all browsing controls to remain visually dominant.

Secondary candidate: **Split Stack** if the team values always-visible list context over map breathing room.

## Unresolved Design Questions

- Should the return path restore scroll position inside the Directory Browser, or is preserving filter plus selected card enough?
- Should the context rail always show, or collapse after the user has navigated through multiple selected places?
- Should map caveats such as `Map location not confirmed - estimated` live inside the card body, the map marker, or both?
- When selecting a second place from the drawer state, should the drawer update in place or briefly re-anchor attention to the Directory Browser?
- On mobile, should the Unified Place Card become a bottom sheet or replace the Directory Browser entirely?

## Possible CONTEXT.md Term Updates After Direction Choice

Do not update terms yet. If the user chooses Card Drawer With Context Rail, consider adding:

- **Context Rail**: a compact companion area inside the selected-place presentation that preserves prior browse context, current filter, and map selection state.
- **Selection Drawer**: a Unified Place Card presentation that opens over the map while the Directory Browser remains available.

If the user chooses Replace With Back Trail, consider tightening **Selected Directory Card** to include the expected back-trail behavior.

If the user chooses Split Stack, consider adding a note under **Directory Browser** that the browser may remain partially visible while the Unified Place Card occupies the lower column.
