# CLA-33 v3 evidence — map-convention place-label disclosure

Captured from the live app (`?contract=cla-33`, deviceScaleFactor 2) after the
Task 0–5 rework. Compare against `../../target/target-replacement-clear-anchored-flow.png`.

| File | State | What to verify |
|---|---|---|
| `01-overview-dots-only.png` | Overview (z12.0, below off-threshold) | Dots only — no place labels. Conventional map doesn't label until a neighborhood is small. |
| `02-focus-labels.png` | Focus (z14.25, Nevada City) | Small importance-ranked labeled set anchored at dots; the anchor (Nevada Theatre) is labeled; no "random at a distance" scatter. |
| `03-hover-reddened-card.png` | Hover | Hovered dot reddened + labeled, with the anchored preview card pointing at the marker. |
| `04-selected-distinct.png` | Selected | Selected place = solid filled red core + red label (categorically distinct from anchors' hollow red rings); neighbors dimmed; drawer open. |

## How it was built (Task 0–5, TDD)
- **Task 0** — Zoom hysteresis band (ON ~13.3 / OFF ~12.7, `state.labelsActive`); no thrash at the boundary.
- **Task 1** — Importance ranking: removed the `nearbyDensity` ASC key (outlier-promotion bug), added `anchorPriority` tiebreak, dropped center-distance bias; high-importance labels may sit over ordinary dots so a dense cluster can't starve the anchor of a slot.
- **Task 2** — Placement stability: `state.lastLabelAnchor` (Mapbox variable-anchor pattern) — try the previous side first; eliminates side-flips on pan (verified 3→0 flips on a large pan).
- **Task 3** — Hover enrichment: labels refresh on `previewPlaceId` change; new `place-hover-ring` reddens the hovered dot.
- **Task 4** — De-overloaded red: selection is a filled red core + red `.map-smart-label.selected`, vs anchors' hollow rings; non-selected labels dimmed; exactly one selected.
- **Task 5** — Strengthened contract (`cla-33-place-label-disclosure.contract.mjs`) asserts all invariants; cache-bust → `cla-33-v3`.

## Gate
Green contract ≠ approval. **Owner must approve these screenshots vs the target before commit / before moving CLA-33 to Done.**
</content>
