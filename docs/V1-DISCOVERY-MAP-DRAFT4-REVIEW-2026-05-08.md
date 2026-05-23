# V1 Discovery Map Draft 4 Review

## What Changed

- Added 10 authored featured anchors as the visitor-pull layer over the full 1,076-place dataset.
- Added anchor-only icon/ring markers and kept regular places as quiet dots.
- Replaced the generic first-load card with an image-led featured anchor card.
- Added anchor hooks to selected place cards and path stop lists.

## Verification

- Regenerated V1 data with Python 3.12 on Windows.
- Confirmed 10 anchors, 10 featured records, valid icon keys, valid coordinates, and path membership for all anchors.
- Ran `node --check` on the V1 app script.
- Ran `git diff --check`.
- Browser QA on local static server:
  - First load shows Miners Foundry Cultural Center as the featured anchor.
  - `View on map` opens the selected anchor card with hook, site action, and related event.
  - Places, Events, and Paths modes still render.
  - Path stop list shows anchor labels and hooks.
  - Mobile viewport at 390x844 has no horizontal overflow.
  - Console has no errors.

## Remaining Risks

- Several anchors still use labeled editorial placeholders rather than real place photography.
- Anchor icon labels are compact text tokens, not custom pictograms; this avoids new assets/build steps but is less illustrative.
