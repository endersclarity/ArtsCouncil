# Return Handoff: Mobile Map Legibility Before #67

Date: 2026-05-27

## Scope

Tiny repair after #66. This did not implement #67 Local Reveal, #68 Selection Drawer, #69 coordinate caveats, or full #70 copy cleanup.

## What Changed

- Added a focused mobile map legibility contract.
- Gave mobile first load its own initial map view so the Grass Valley/Nevada City corridor lands above the drawer.
- Increased first-load density dot visibility slightly while preserving the #66 constellation model.
- Reduced the mobile primary-anchor drawer height so more map remains visible.
- Added mobile-only map context labels for Grass Valley and Nevada City; they are hidden on desktop.

## Verification

- `node tests/test_v1_mobile_map_legibility_contract.js`
- `node tests/test_v1_browse_starting_view_contract.js`
- `node tests/test_v1_constellation_disclosure_contract.js`
- Mobile rendered check: `/Users/ender/code/Arts Council/cultural-asset-map/reports/issue-mobile-map-legibility-mobile-2026-05-27.png`
- Desktop sanity check: `/Users/ender/code/Arts Council/cultural-asset-map/reports/issue-mobile-map-legibility-desktop-2026-05-27.png`
- Browser render probe reported `errorCount: 0` for both mobile and desktop.

## Result

Mobile first viewport now shows visible constellation marks and named map context above the drawer on initial load. Desktop #66 constellation view remains visually sane, with mobile context labels hidden.

## Remains

#67 can proceed next. This slice did not add dense-map click behavior, selection drawer work, coordinate caveats, or broader copy cleanup.
