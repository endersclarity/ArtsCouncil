# V1 Discovery Map Draft 3.1 Dogfood Fixes

Status: implemented checkpoint review
Date: 2026-05-06

## Source

Based on `dogfood-output/draft3-agent-browser/report.md`.

## Fixes

- Added accessible labels to numbered path marker buttons, for example `Stop 1: Booktown Books`.
- Compressed selected path card spacing so stop buttons appear sooner in the control panel.
- Kept path stop buttons in the detail card and preserved marker click behavior.

## Verification Targets

- Path marker accessible names are specific, not repeated generic map marker labels.
- At least the first path stop is visible after selecting a path on a desktop review viewport.
- Clicking a path marker still opens the matching place card.
- Mobile keeps no horizontal overflow, one MapLibre canvas, and visible core controls.

## Scope Guard

No changes to data model, path definitions, product framing, map architecture, public workflows, directions, save/share, correction CTA, or trip planning.
