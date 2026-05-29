# CLA-32 - Marker normalization

Linear: https://linear.app/claudecode/issue/CLA-32/map-markers-confusing-colors-legend-doesnt-match-marker-meanings

## Owner observation

Current markers are visually over-encoded and fail review. They appear to mix place/event type, coordinate trust, editorial/anchor state, density, and interaction state into tiny dots.

Decision direction: keep persistent map markers simple. Type and selected/featured state can be visible on the map; coordinate trust/provenance belongs in detail UI unless a coordinate is too uncertain to show.

## Evidence

- `before-current-marker-state.png` - current live app marker state captured from the in-app browser on 2026-05-29.
- `target-v1-approved-original.png` - first generated target, preserved for comparison.
- `target-perplexity-pushback.png` - generated variant incorporating external cartography/UX critique.
- `target-definition-of-done.png` - current definition-of-done target image for this issue.
- `comparison-target-vs-perplexity-pushback.png` - side-by-side comparison of the first target and current target.

## Definition of done

The implementation should make the live map feel materially like `target-definition-of-done.png`:

- Normal places use one calm marker style.
- Events are distinct by shape and color, not just color.
- Featured/anchor markers are larger and emphasized without category letters.
- The selected marker has one clear selected state using size/ring/elevation.
- Coordinate trust/provenance is not encoded as a persistent map marker style.
- Marker density is calm and scannable, not a field of competing dot semantics.
