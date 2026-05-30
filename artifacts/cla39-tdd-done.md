## Copy sweep — actually implemented (TDD), this time verified

Done via `/tdd` (8 vertical red→green slices) in the LIVE folder
`website/cultural-map-redesign-stitch-lab/v1-discovery-map/`. New contract:
`tests/test_v1_citizen_voice_contract.js` (passes).

### Shipped
- **Eyebrows / popups / list badges** → always the place **category**. Removed
  `Cultural anchor` / `Supporting stop` / `MUSE pick` / `Directory record` from
  `placeKindLabel`, `placeReviewLabel`, and the detail eyebrow. (Path-stop role
  labels survive ONLY inside an active Path's numbered stop list.)
- **`Why this place matters` → `What you'll find here`** (anchorCardMeta header).
- **`Image proof` stamp removed** from real photos (3 sites). Kept `Candidate image`
  / `Source image pending` honesty labels (owner decision).
- **Softened**: `Featured cultural anchor`→`Start here`, `Curated path`→`Walk this
  route`, `First matching place`→`First match`, aria `Cultural context`→`About this
  place`, `Visible gap`→`Good to know`.
- **Data prose rewritten** in `data/anchor_cards.json`: all 10 `whyItMatters` + 4
  `supportingDescription` now describe the place/visit — no MUSE/map/route/path/
  gateway/evidence/review tokens. `visibleIncompleteLabel`s de-jargoned
  ("Photo coming soon").
- **Cache-bust** `app.js?v=cla-37-v1 → cla-42-v1` (the stale tag that masked earlier
  edits — this is why the owner kept seeing old copy).

### Verification
- `test_v1_citizen_voice_contract.js` green; comprehensive grep of served `app.js`
  + `anchor_cards.json` shows **zero** banned tokens.
- Live server (run.ps1 :4178) serves the fixed assets under the fresh cache tag.
- Updated `test_v1_seen_in_muse_contract.js` + `test_v1_public_beta_copy_contract.js`
  to assert the NEW citizen-voiced MUSE credit instead of the removed confidence ledger.

### Honest caveats
- The JS suite has **16 PRE-EXISTING failures** unrelated to this work (data drift:
  place count 1351 vs 1415, category-placeholder maps, anchor-identity set, MUSE
  evidence links). Proven pre-existing by stashing my edits → same 16 red on HEAD.
  My changes added **zero** new failures (pass count rose 17→18). These belong in a
  separate data-reconciliation issue.
- **Open / not done:** `anchorLabel` badges (e.g. "Grass Valley performance anchor")
  still contain the word "anchor" on cards — flagged for a follow-up citizen-voice pass.
- `importanceTier` MUSE rank boost untouched (invisible to citizens).
