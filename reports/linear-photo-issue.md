## Problem

Of the **1,415 places** in the live map ([v1-discovery-map/data/places.json](website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json)), only **463 (33%)** had a real photo; the other **952 (67%)** fell back to category placeholders. Worse, ~456 of the 463 existing "real" photos were **automated hotlinks** (Google place photos + scraped org-site URLs) with no provenance record — nobody knew where they came from.

Owner goals (from session 2026-05-29):
- Reduce placeholder prevalence — get as many real hotlinked photos as possible.
- Hotlinks are fine; expiry is acceptable. **Not** localizing images.
- Keep cost at ~$0 — last scrape reportedly required paid Places API access.

## What was done

**Unblocked the Google Places pipeline:**
- The old [scripts/fetch_images.py](scripts/fetch_images.py) used the **legacy** Places API (now disabled on the project) and targeted the dead `cultural-map-redesign/` build.
- Confirmed billing state across keys: the on-disk key had billing disabled; a second key had no Places API enabled.
- On the **ArtsCouncil** Google Cloud project (`gen-lang-client-0649175723`): billing is enabled (Direct billing account), **Places API (New)** enabled, and a fresh Places-restricted API key created. Key stored in [app/.env](.env) as `GOOGLE_PLACES_API_KEY` (gitignored).

**New script:** [scripts/fetch_place_photos.py](scripts/fetch_place_photos.py)
- Uses **Places API (New)**: `places:searchText` + photo-media URL resolution (`skipHttpRedirect=true`), no image download — pure hotlink, matching existing data shape.
- Targets the live `places.json`; rewrites placeholder `image` blocks to `kind:"real"` while keeping placeholder fields as fallback.
- `--limit N`, `--dry-run`, `--no-resume`; bounded list, no retry loops; writes a run report to `scripts/place_photos_report.json`. Backup at `places.json.bak-before-photofetch`.

**Runs so far (2026-05-29):**
- Test (10) → 5 photos. Batch (100) → 77 photos. **Total: 82 new real photos, 0 errors.**
- Hit rate ~77% on the batch (shops/venues have strong Google coverage; tiny nonprofits/presses are the misses).
- API calls to date: ~110 searchText + 82 photo = ~192.

## Cost verification

Google's published free tiers (new Places API): **Text Search Pro = 5,000 free/mo**, **Place Photo = 1,000 free/mo**. Finishing the remaining placeholders this month stays under both caps → **$0 expected**; the binding limit is the 1,000 free photo calls/month. Note: Google exposes **no real-time free-tier counter** — the only authoritative dollar figure is the Billing → Reports page, which lags hours. Recommend a $5 budget alert as a backstop.

## Remaining work

- [ ] Run the remaining ~870 placeholders (≈ +670 photos at the current hit rate → ~75% real coverage). Single calendar month to stay within the free photo cap.
- [ ] Set a $5 Cloud Billing budget alert on ArtsCouncil.
- [ ] Tighten the API key to Places-only (currently 3 APIs).
- [ ] Verify photos render in the live app (`run.ps1`).
- [ ] (Separate) De-dupe place records — several duplicates surfaced (e.g. Arquils Wine/Winery, KVMR ×3, The Cauldron ×2, Yinne Boma/Yinnebowma).
