# CLA-33 Place Label Disclosure — Interaction Spec

Status: accepted direction (supersedes the rejected `80fa371` build and the `revised-flow` evidence).
Owner decision basis: target = `target/target-replacement-clear-anchored-flow.png`; focus driver = **viewport center**; hover = **enrich on top**.

This is the concrete interaction spec the rejection note required before any further implementation.

## Model: one priority cascade, resolved every frame

**Place Label Disclosure** is a single ranked label set, collision-checked once, with every label visibly bound to its own dot. It is NOT three independent label sources. Same map state in → same labels out.

Priority, highest first (higher tier wins contested space and is never collided away):

1. **Selected** — the chosen place. Red dot, red label, detail drawer open. Exactly one at a time.
2. **Hovered (preview)** — the place under the pointer. Red/raised dot, label, and a card that points at that marker. Transient.
3. **Center-of-viewport** — the small set of dots nearest the screen center get labeled. This is the resting "what's here?" answer. Follows the map on pan/zoom.
4. **Authored-importance backdrop** — Cultural Anchors / MUSE picks / featured places labeled at close zoom as a stable backdrop, even with no cursor and not near center.
5. **Ordinary fill** — remaining non-colliding slots, capped small, stable name order.

Touch / no-pointer: tier 2 and 3-by-cursor degrade; tiers 1, 3-by-center, 4, 5 still apply (center is cursor-free by design).

## Hard rules (from CONTEXT.md + rejection)

- Every label is **bound to its dot**: a category-colored dot sits in the label unit and/or a short leader connects label to marker. No free-floating pills.
- The **dense blob stays dots** — it does not spread/spiderfy (that was Local Reveal; killed on purpose). Per **Constellation Disclosure**, density reading as density is the truth. Disambiguating 30 co-located places is the **Directory Browser**'s job.
- Blank map clicks never enter Local Reveal and never rewrite the Directory Browser.
- Marker click selects that place only.
- **Exactly one** selected ring on screen. The selected dot, its label, and the drawer must be unmistakably the same place.

## Reading the target image (read before building)

The target (`target/target-replacement-clear-anchored-flow.png`) defines the **interaction language** — dot-bound labels, hover anchored to its marker, single-selection identity chain — **NOT literal density or color.** It was generated on a fantasy dataset: the Focus panel shows ~6 comfortably-spaced, category-colored places. Real downtown Nevada City is ~30 overlapping monochrome dots. Match the language; reconcile density through the close-zoom threshold below. Do NOT chase the mockup's calm by adding colors or spreading the blob.

Resolved tuning decisions (autonomous grill):

- **Close-zoom threshold:** labels turn on at **~13.5 zoom** (was 11.75), aligned with the select fly-to zoom. Below that = dots only. This is the primary knob that makes real density read like the target — at 13.5 the centered neighborhood is genuinely small.
- **Color: deferred.** Dots stay **monochrome** for CLA-33. The target's category colors are net-new and collide with the 12-category NCAC taxonomy (vs the mockup's 5) — that is CLA-32 (marker normalization) territory. Bind label↔dot with **proximity + leader line + shared hover/selected red state**, not color. Do not add category colors in this ticket.
- **Label direction:** prefer **right of the dot** (the target's ordered look); demote to left/top only on collision.
- **Center-focus depends on the threshold:** viewport-center only makes sense at/above ~13.5 zoom. Do not lower the threshold without re-examining center-focus (at wide zoom, center can land between towns).

## What changes vs the current build

| Concern | Current (IS) | This spec (SHOULD) |
|---|---|---|
| Spatial driver | density-ascending (labels outliers), center is last tiebreak | center-distance primary after tiers 1-2-4 |
| Cap | 18 spread across viewport | ~8-10 clustered near center + backdrop anchors |
| Dot binding | offset pill, no connector, no color | colored dot in unit + leader to marker |
| Hover | separate card, labels don't refresh, no anchor | previewed dot reddens, label added, card points at marker |
| Selection | two red rings possible | exactly one ring; label + drawer color-tied |
