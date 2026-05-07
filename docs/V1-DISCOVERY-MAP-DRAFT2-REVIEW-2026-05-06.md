# V1 Discovery Map Draft 2 Review

Status: implemented checkpoint review
Date: 2026-05-06

## What Changed

- Added six local NCAC editorial-abstraction placeholder assets.
- Added data-prep image classification using light heuristics.
- Regenerated `places.json` and `DATA-GAPS.md` with image status and placeholder counts.
- Reworked place image rendering so weak/missing imagery uses labeled placeholders.
- Simplified marker grammar toward layer/priority instead of category taxonomy.
- Reworked path display toward stop-sequence emphasis and subtle connector treatment.
- Updated decision/design docs before code.

## Image Results

- Credible image refs: 337
- Missing image placeholders: 671
- Weak image placeholders: 68

Placeholder types used:

- `food-stay-gathering`: 221
- `gallery-studio`: 248
- `historic-place`: 162
- `maker-shop`: 16
- `performance-event-venue`: 71
- `public-art`: 21

Watercolor/category art and logo-ish sources no longer render as real place proof.

## Verification

- Data generation completed successfully.
- JavaScript syntax check passed.
- Python compile check passed.
- Browser desktop check passed.
- Browser mobile check passed.
- Placeholder asset fetch passed.
- Events mode shows event detail.
- Paths mode shows numbered stop markers.
- Console: no errors observed.

## Remaining Risks

- The generated placeholder PNGs are large; acceptable for alpha, but should be optimized before public deployment.
- Image classification is heuristic, not rights/quality verification.
- Some remote "credible" image refs may still be weak in practice and should be reviewed as stakeholders select featured places.
- Basemap remains CARTO Positron, not a custom NCAC basemap.

## Recommendation

Keep Draft 2 as the current working alpha. Next pass should focus on selected-card craft, placeholder optimization, and featured/path-place image review.
