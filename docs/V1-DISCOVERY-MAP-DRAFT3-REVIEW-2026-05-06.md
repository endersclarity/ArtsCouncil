# V1 Discovery Map Draft 3 Review

Status: implemented checkpoint review
Date: 2026-05-06

## What Changed

- Polished selected-place cards around image proof, concise description, category/city, and one primary action.
- Added demo-critical data overrides for curated path stops and fixed the missing `ASiF Studios` path stop.
- Added a demo-critical records section to the data gap log.
- Softened cluster styling so red is reserved for active states, events, featured points, and path stops.
- Reduced path connector emphasis and made path stop lists clickable.
- Converted six generated placeholder PNG assets to WebP and updated generated data to reference the smaller files.

## Verification

- Data generation completed successfully.
- JavaScript syntax check passed.
- Python compile check passed.
- Browser desktop check passed.
- MapLibre canvas rendered.
- Places, Events, and Paths modes switched correctly.
- Path mode showed four numbered stops for each curated path.
- Selected cards rendered both real imagery and labeled WebP placeholders.
- Placeholder asset fetch returned `200 OK` with `image/webp`.
- Console: no errors observed.

## Impeccable Review

- Scope stayed map-first and product-register.
- NCAC red/ink/paper discipline held; no category rainbow or icon soup was introduced.
- Card hierarchy now better matches proof + desire before utility.
- Cluster treatment is quieter and less competitive with path/event emphasis.
- Forbidden framing remains absent: no Arts Hub, AI trip planner, tourism platform, correction CTA, public submission, directions, save, or share.

## Remaining Risks

- Several demo-critical path stops still depend on labeled placeholders and need approved real photos later.
- Headless mobile screenshots can capture the map before external tiles paint; the responsive panel itself needs one more real-device/browser glance before stakeholder use.
- The data image classifier remains heuristic and is not a rights or quality audit.

## Recommendation

Keep Draft 3 as the current stakeholder-demo polish checkpoint. The next pass should be a real-photo review for path stops and featured examples, not another broad visual redesign.
