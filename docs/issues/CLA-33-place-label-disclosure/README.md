# CLA-33 Place Label Disclosure

Linear: https://linear.app/claudecode/issue/CLA-33/shape-zoom-level-place-disclosure-without-local-reveal-mode

## Read

The generated images are not separate options. They describe one flow:

1. Medium zoom: dots only.
2. Close zoom: place names appear where they fit.
3. Hover or click: one place gets detail while the Directory Browser stays stable.

My recommendation is dealer's choice on visual style: use the generated targets as direction, but implement the behavior through the existing V1 map language.

## Current Evidence

- [Current default map](./evidence/current-map-default.png)
- [Current map after map click](./evidence/current-map-after-map-click.png)

The current behavior can enter Local Reveal from a map click: the red reveal circle appears and the Directory Browser changes to "Show places in this area." That is the behavior CLA-33 should remove.

## Target Evidence

- [Target flow](./target/target-flow.png)
- [Target close zoom](./target/target-close-zoom.png)
- [Replacement target: clear anchored disclosure flow](./target/target-replacement-clear-anchored-flow.png)
- Hosted concept page: https://solar-memoir-e37e.here.now/

## Rejection Note

The implemented CLA-33 label behavior through `80fa371` was rejected by the owner on 2026-05-29. Owner read: labels appeared random at a distance, popup/detail treatments were not clearly connected to a specific dot, and the resulting behavior did not match expected map-design conventions. Do not continue from the current implementation as the accepted design direction.

The new target is `target/target-replacement-clear-anchored-flow.png`: labels must appear for an obvious focused area, labels must be visibly tied to their own dots, hover popups must have a clear pointer/anchor to the highlighted marker, and selected detail must preserve that marker-to-card relationship.

## Final Evidence

- [Final default map without reveal](./evidence/final-default-no-reveal.png)
- [Final close zoom labels](./evidence/final-close-zoom-labels.png)
- [Final label click selection](./evidence/final-label-click-selection.png)

## Decisions

- Use **Place Label Disclosure** as the canonical term.
- Close-zoom labels answer "what is this dot?" with place names only.
- Labels may disappear when they would collide or crowd the screen.
- Hover/click can show one-place detail.
- Blank map clicks must not enter Local Reveal or rewrite the Directory Browser.
- Marker clicks select that place only.

## Non-goals

- No browser geolocation / Near Me.
- No category-marker taxonomy.
- No cluster bubbles.
- No all-labels mode.
- No surprise Directory Browser replacement.
