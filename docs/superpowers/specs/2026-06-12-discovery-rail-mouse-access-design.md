# Discovery Rail: mouse access + delineation (cla-78)

Date: 2026-06-12. Owner approved scope and delegated detail choices.
Source: impeccable critique P1-6 (rail reads random; no mouse scroll path).

## Problem

The rail track hides the OS scrollbar by design and its cards are buttons,
so a mouse user has no way to scroll it: the wheel scrolls vertically (a
no-op), there are no arrows, and drag is claimed by the buttons. The rail's
content mix (4 events, 3 sampler places, 1 MUSE story, 1 path, then the
rest) has a deliberate order but nothing on screen names it.

## Design

Three pieces, all in v1-discovery-map (app.js / index.html / styles.css):

1. **Wheel translation.** A `wheel` listener on `.rail-track`
   (`passive: false`) adds `deltaY` to `scrollLeft` when vertical delta
   dominates; horizontal trackpad swipes keep native behavior. `deltaMode 1`
   (Firefox lines) normalizes ×40. No-op when the track doesn't overflow.
   The existing scroll-settle handler keeps running Rail Follow unchanged.

2. **Edge arrows.** Two round paper buttons absolutely positioned at the
   rail's edges, shown only on `pointer: fine` devices and only while the
   track overflows (`[hidden]` managed by `syncRailArrows()` on render,
   scroll, and resize). Click scrolls by 0.8 × visible width, smooth unless
   reduced motion. `.is-end` fades the exhausted direction.

3. **Type chips.** Each card opens with one small pill naming its kind:
   Event / Worth a stop / From MUSE Magazine / A walk to take
   (`RAIL_CHIP_LABELS`). The MUSE story card's old kicker line is removed so
   it isn't labeled twice. This consciously supersedes the pass-3 "one
   kicker" typeset ruling for the rail surface only; a pill chip is not a
   typeset eyebrow row, and delineation was an explicit owner ask.

## Decisions taken under delegation

- Badges over section headers: keeps the editorial-mix order, no layout
  rework, lowest visual weight (owner picked this option).
- Arrows always visible + page-step (owner picked this option).
- Chip text favors visitor voice ("Worth a stop") over taxonomy ("Place").

## Out of scope

The deeper P1-6 rail-vs-map first-impression redesign stays an owner design
call. No changes to rail content order or Rail Follow.

## Verification

Preview on :8016 — wheel event moves scrollLeft; arrows page and fade at
ends; chips render on all four card types; marker contract stays 10/10;
zero console errors.
