## Completed — photo coverage 33% → 89%

Full run finished (2026-05-29). Final tally across all runs:

- **~800 new real photos** added (test 5 + batch 77 + full run 715)
- **0 errors** across 1,585 API calls
- **Coverage: 463 → 1,260 real (33% → 89%)**; placeholders 952 → **155**

The remaining **155 placeholders** are exhausted from Google's side — 132 places have a Google listing with no photo, 23 have no listing at all (small nonprofits, presses, trail/landmark entries). No further automated gains available via Places API.

### Cost (within free tier)
- Place Details Photos calls this month: ~797 → under the **1,000** free cap (SKU `DCD1-FE97-8C71`).
- Text Search Pro calls: ~980 → under the **5,000** free cap (SKU `4FDA-34B1-A910`).
- Expected bill: **$0**. ⚠️ Do not re-run the full set again this calendar month (would exceed the 1,000 free photo cap). Resumable later via `--resume`.

Data is live in `places.json`. Backup retained at `places.json.bak-before-photofetch`.

### Open follow-ups (not blocking close)
- Set a $5 Cloud Billing budget alert on ArtsCouncil.
- Tighten the API key to Places-only (currently 3 APIs).
- De-dupe records — tracked separately in CLA-36.
