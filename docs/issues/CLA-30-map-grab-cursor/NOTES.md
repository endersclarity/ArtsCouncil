# CLA-30 — Map pan cursor is the low-res Windows OS "grab" hand

Linear: https://linear.app/claudecode/issue/CLA-30/map-pan-cursor-is-the-low-res-windows-os-grab-hand
Parent PRD: CLA-14 · Priority: Low · Labels: ready-for-agent, Bug

## Observation (owner, 2026-05-29)
Hovering the map area shows a strange, low-res, pixelated white hand cursor. See
`before-pixelated-grab-cursor.png` (cursor circled, upper-right of map).

## Root cause (read & confirmed in code, `app.js:1455-1481`)
- The app only sets `cursor: "pointer"` on marker `mouseenter` (layers:
  `place-points`, `anchor-rings`, `place-density`, `event-points`) and clears it
  on `mouseleave`. No custom drag cursor anywhere (grep of css/js/html confirmed).
- The pixelated hand is MapLibre's default
  `.maplibregl-canvas-container.maplibregl-interactive { cursor: grab }`, which on
  Windows falls back to the OS bitmap open-hand. System cursor, not a designed
  asset, resolution-dependent.

## Agreed visual target (owner, 2026-05-29)
Crisp high-res SVG **grab** (open hand) → **grabbing** (closed fist) while
dragging. Marker finger-pointer unchanged. CSS-only override in `styles.css` via
inline SVG `data:` URI cursor, `grab`/`grabbing` as keyword fallback. No new image
files committed.

## Proof
- before: `before-pixelated-grab-cursor.png` ✅ (also attached to Linear)
- proposed: `proposed-grab-grabbing-comparison.png` ✅ (Codex; also attached to Linear)
- after (visual): **pending MANUAL ShareX capture by owner** — browser screenshots do
  NOT capture the OS cursor, so an automated after-screenshot is impossible. Owner: hover
  the map (and click-drag for the grabbing state) and grab a ShareX shot like the before,
  save as `after-grab-cursor.png` here, then attach to Linear.
- after (computed-style evidence, live @ 4178, 2026-05-29): ✅
  `getComputedStyle('.maplibregl-canvas-container').cursor` =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/20…") 11 8, grab`
  (isSvg=true, ends with `grab` fallback, and the `:active` grabbing SVG rule is loaded).

## Implementation (TDD, 2026-05-29)
- Test (RED→GREEN): `app/tests/test_v1_map_cursor_contract.js` — asserts `styles.css`
  defines a custom inline-SVG `cursor` on `.maplibregl-canvas-container.maplibregl-interactive`
  (grab) and `…:active` (grabbing), each with the keyword as fallback. **PASS.**
  Run: `node tests/test_v1_map_cursor_contract.js`.
- Change: appended ~14 lines to
  `website/cultural-map-redesign-stitch-lab/v1-discovery-map/styles.css` — two rules with
  inline SVG `data:` URI cursors (white fill, #333 ~1.4px stroke, soft feDropShadow):
  grab = open hand (hotspot 11 8), grabbing (`:active`) = closed fist (hotspot 13 14).
  No new image files. `app.js` marker `cursor: pointer` untouched (still wins on marker hover).
- Codex collision check: `git status` clean on `styles.css` before edit — no collision.

## Status
Implemented + tested + live-verified, 2026-05-29. Remaining: owner's manual ShareX
after-shot for the visual proof. Not committed; Linear not changed by the implementing fork.

## Image-gen prompt sent to Codex (2026-05-29)
Before/after comparison: current pixelated Windows grab-hand vs. proposed crisp
open-hand (grab) + closed-fist (grabbing), white fill / thin dark-gray outline /
soft shadow, on a swatch of the beige basemap.
