# Map-Focus Layout and Smart Label Strategy

## Goal
Shift the page so the map is the primary interaction surface, reduce pre-map editorial weight, and improve marker discoverability without creating unreadable text overlap.

## Scope
- Keep `index-maplibre.html` as source of truth.
- Preserve existing category and Open Now behavior.
- Reduce content above map to a concise, practical framing.
- Add non-overlapping marker-adjacent labels for lower-density views.
- Keep county boundary visible but non-dominant.

## UX Direction
- Hero is trimmed to a single-purpose line and micro-instructions.
- “How to Use It” replaces long editorial narrative and clarifies map actions.
- Filters remain map-overlay controls with existing behavior.
- Smart labels are only shown when rendered marker density is below a threshold.
- Labels originate visually from markers and are clickable for detail access.
- Mobile stays conservative (no smart-label layer) to avoid clutter and tap conflicts.

## Technical Design
- Replace symbol-based auto labels with an HTML overlay layer anchored to projected marker coordinates.
- During map movement, schedule label recompute with `requestAnimationFrame`.
- For each candidate marker:
  - Project marker to screen space.
  - Try candidate label slots/rings near the marker.
  - Accept first candidate that does not overlap already-placed labels.
- Keep progressive thresholds:
  - `> 32` visible markers: no smart labels.
  - `<= 16`: label all visible.
  - `17-32`: label subset.
- Preserve marker click/hover behavior and panel flow.

## Data and Reliability
- Preserve stable `idx` linkage by mapping `DATA` first and filtering invalid coordinates after index assignment.
- Sanitize county GeoJSON before rendering so malformed rings are ignored.
- Remove unsupported sky-layer insertion to avoid runtime errors in current MapLibre build.

## Validation
- JS syntax check on extracted inline script.
- Browser automation checks for:
  - marker rendering at default view,
  - county layer presence,
  - Open Now toggling counts/metadata,
  - no console errors.
