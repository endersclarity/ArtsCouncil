# Visual verification workflow (CLA-29)

For **visual / UX** issues (map styling, markers, filters, cards, layout) — not
pure data/logic/copy. Solves: neither owner nor agent knows what "done" should
look like until it's built, so results can't be verified against intent.
(Cautionary tale: CLA-19 — "recalibrate the radius" shipped black ink-blobs.)

## The loop

1. **Define the target before building.**
   Generate a "proposed" mockup image with the `chatgpt-image-generator` skill
   (owner's ChatGPT Plus via CDP). Save it to `docs/visual-targets/<issue>/proposed.png`
   and attach it to the Linear issue. This is the agreed visual target the owner
   signs off on *before* code is written.

2. **Capture "before".**
   CDP screenshot of the current live state → `docs/visual-targets/<issue>/before.png`.

3. **Build, then capture "final".**
   CDP screenshot of the real shipped result → `docs/visual-targets/<issue>/final.png`.

4. **Prove it.**
   Generate a single self-contained comparison HTML and share it:

   ```bash
   node scripts/visual-compare.mjs \
     --title "CLA-NN <short title>" \
     --out docs/visual-targets/cla-NN/compare.html \
     --panel "Before=docs/visual-targets/cla-NN/before.png" \
     --panel "Proposed=docs/visual-targets/cla-NN/proposed.png" \
     --panel "Final=docs/visual-targets/cla-NN/final.png"
   ```

   The HTML embeds the images (base64), so it's portable — open locally or
   publish via the `here-now` skill for a shareable link. The owner verifies
   **reality (Final) against the agreed target (Proposed)** in one view.

## Conventions

- Artifacts live in `docs/visual-targets/<issue-key>/` (e.g. `cla-19/`).
- `compare.html` is the acceptance artifact attached to / linked from the issue.
- Panels are flexible: `--panel "Label=path"` any number of times; a missing
  file renders as a labelled placeholder so partial comparisons still build.
- Don't mark a visual issue Done without a Final panel matching the Proposed.

## When to skip

Data pipeline, URL/state logic, copy-only fixes, and anything with no visible
surface. Those are verified by tests / CDP assertions, not mockups.
