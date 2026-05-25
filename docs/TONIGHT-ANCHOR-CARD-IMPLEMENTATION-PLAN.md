# Tonight Anchor Card Implementation Plan

Status: working plan
Date: 2026-05-24

## Goal

Make the V1 Discovery Map demo feel intentional by polishing the six Primary Anchor Set cards to screenshot-grade completeness.

This is a GVNC prototype slice. Truckee is out of scope.

## Primary Anchor Set

Build/polish these as the top-weight Anchor Cards:

- The Center for the Arts
- Nevada Theatre
- North Star House
- Empire Mine
- Art Works Gallery
- The Curious Forge

Supporting stops remain useful but do not need equal primary-card weight tonight:

- Nevada City Winery
- ASiF Studios
- Hirschman Trail / Hirschman's Pond
- North Columbia Schoolhouse Cultural Center

## Definition Of Done

Each primary Anchor Card should have:

- real/resolved image, no placeholder
- clean title, category, and anchor label hierarchy
- concise hook
- polished "why this place matters" copy
- useful relationship chips where already supported by data
- one clear action, usually visit site or view on map
- no internal audit language
- no visible confidence, P0/P1, demo tier, or implementation-priority language
- consistent visual treatment across all six

## Implementation Order

1. Inspect the current V1 app state.
   - Confirm canonical app path: `website/cultural-map-redesign-stitch-lab/v1-discovery-map`.
   - Confirm where `anchor_cards.json` is read and rendered.
   - Confirm current selected-card markup/classes in `app.js` and `styles.css`.

2. Reconcile data.
   - Use `docs/anchor-cards/anchor-copy-and-evidence.csv` as the source for anchor copy/rationale.
   - Update `data/anchor_cards.json` for the six primary anchors first.
   - Ensure primary anchors have resolved image data.
   - Keep support-stop metadata intact unless needed for card relationships.

3. Polish selected-card UI.
   - Make primary Anchor Cards visually distinct from ordinary place cards.
   - Lead with image proof and cultural hook.
   - Keep utility actions secondary.
   - Remove or hide internal-facing metadata.

4. Verify in browser.
   - Desktop: each of six primary cards looks complete and screenshot-grade.
   - Mobile: selected card remains readable and does not overflow.
   - Console: no new errors.
   - Map interaction: clicking each primary anchor opens the right card.

5. If time remains, improve path treatment.
   - Show the 6+4 relationship more clearly in paths.
   - Improve path stop cards only after primary Anchor Cards pass verification.

## Tomorrow Package

After implementation, prepare:

- live prototype as proof object
- short brief explaining the anchor-card strategy
- labeled image-generation concept mockups only for remaining gaps or optional future directions

Do not decide concept mockups until after reviewing what the implemented prototype actually shows.

## Source References

- `CONTEXT.md`
- `docs/anchor-cards/anchor-copy-and-evidence.csv`
- `docs/anchor-cards/v1-anchor-card-draft.csv`
- `docs/anchor-cards/anchor-photo-candidates.csv`
- `docs/CULTURAL-ANCHOR-SET-PROPOSAL.md`
- `website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/anchor_cards.json`
