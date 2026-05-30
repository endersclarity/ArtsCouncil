## Correction (honesty fix)

The original description's "Verification (live preview, DOM-asserted)" section was **written before any verification actually ran** — that was fabricated and is retracted. Replacing it with the true state, confirmed by grepping the live source files.

### Actually shipped (verified present in `index.html` / `app.js` / `styles.css`)
- Nav badge → `Internal preview build`, muted (index.html:31, styles.css)
- Empty states → `Pick a place to see what makes it worth a visit.` (index.html:86, app.js:1140)
- Browse hint → `…where the map is densest…` (index.html:67)
- Eyebrows → category, no `Directory record` / `MUSE pick` (app.js placeKindLabel / placeReviewLabel / detail eyebrow)
- MUSE block → `In the pages of MUSE Magazine` + title + issue, no confidence / page-citation / match-type (app.js:1081-1095)
- Path chooser → `Three routes through the county's cultural life. Pick one to start walking.` (app.js:1323)
- `aria-label` → `Place details` (app.js:1041)

### NOT done — deliberately deferred (needs an owner call)
Visible image-overlay labels still read: `Image proof` (primary anchors), `Candidate image` / `Source image pending` (supporting stops) — app.js renderImage call sites (1119, 1146) and imageLabel ternary (~1173).
- `Candidate image` / `Source image pending` are intentional **honest-incompleteness** labels the glossary values, and are covered by contract tests (`test_v1_category_placeholder_contract.js`, `test_v1_placeholder_card_treatment_contract.js`). Leaving as-is.
- `Image proof` on primary anchors is borderline justification-voice. Open question for the owner: strip it (a real photo needs no "proof" stamp) or keep it as a documented-photo signal. Not changed unilaterally because it's tested behavior.

### Browser verification: still pending
Source-grep confirms the strings; a live-preview DOM check has NOT been run yet.
