# Gap-closure plan — submission intake + the 371 location-review backlog

Date: 2026-06-12. Source of the gaps: comparison against the incumbent NCAC ArcGIS
map (`webmap 604050d4965c4b93b984781f72941d5b`, 686 features, 0 photos).

Incumbency is explicitly **not** a gap we care about. Two real gaps remain:

1. **No public intake.** The old map has a submission form; ours has none.
2. **A third of our data is in the back room.** 1,351 places total, but only 875 are
   map-ready. 371 are "Needs Location Review."

Ground truth (all measured from source, not memory):
- `data/places.json`: 1,351 records · 1,041 public · 875 map-ready · 1,007 real photos.
- Stack: static site on Vercel, `cleanUrls`, **no backend, no `package.json`, no `api/`**.
- Existing tooling: `scripts/audit-coords-census.py` (Census batch geocode + 150m flag),
  `audit-coords-parcel.py`, `apply-coord-corrections.py`, with report JSONs. Reuse these.

---

## Workstream A — Submission form

### What the incumbent actually collects (verbatim, for parity)
Generic Squarespace contact form, 20 fields:
- First Name*, Last Name*, Your email address*, [phone], Preferred contact (Email / Telephone)
- Submission type (radio): **Correction to existing data** / **New Cultural Asset**
- **Message*** — one free-text box where the submitter dumps all asset details
- How did you hear about us?
- **Name of Cultural Asset**, then a full postal Address widget (line1/line2/city/state/zip/country)

Weaknesses we beat for free: no category field, no photo, asset detail buried in one
textarea, no link to our schema.

### A0. Build backend-agnostic — NCAC picks the transport, not us
Where submissions are stored is NCAC's infrastructure decision (who owns the data,
who maintains it, who gets notified). We do **not** block on it. Build the form so all
submit logic sits behind one swappable function:

    async function submitForm(payload) { /* one place to change the target */ }

Zero-infrastructure default: a structured `mailto:` to NCAC's map contact (Eliza Tudor is
already listed on their form), so a real submission works the day the page ships. Swapping
to a backend later is a one-function change:

| Later choice (NCAC's) | What changes |
|---|---|
| Supabase | `submitForm` POSTs to a `map_submissions` table (anon insert-only RLS) |
| Vercel serverless | `submitForm` POSTs to `api/submit` (emails + stores) |
| Third-party | point the form `action` at their endpoint |

Photo upload needs a real store, so v1 ships as "paste an image link"; the upload field
turns on once a backend exists.

**For NCAC (relay this):** *"We recommend a Supabase table — it gives you a private review
queue and feeds the map directly. A serverless function that emails each submission also
works. Either is about a day's work; just tell us which fits your stack and who should
receive submissions."*

### A1. Field schema (structured, mapped to our place record)
Improve on their form by mapping every field to `places.json`:

| Form field | Required | → place field |
|---|---|---|
| Submission type: New / Correction | yes | routing only |
| (if Correction) Existing place name | — | match to `id` at review |
| Name of cultural asset | yes | `name` |
| Category (select: our 10) | yes | `category` |
| Street address | — | `address` |
| City (select: Grass Valley, Nevada City, Truckee, …) | yes | `city` |
| Website | — | `website` |
| Phone | — | `phone` |
| Short description (≤ 280 chars) | — | `description` |
| Photo (optional upload) | — | `image` (their form has none — our map is image-rich) |
| Submitter name / email* / phone / preferred contact | email yes | review metadata only |

The 10 categories, verbatim from our data: Arts Organizations, Performing Arts,
Galleries & Studios, Fairs & Festivals, Cultural Resources, Historic Places,
Shops & Makers, Eat, Drink & Stay, Public Art, Walks & Trails.

### A2. Page + brand
- New page `contribute.html` (or `submit.html`). Header nav already reserves a
  **Contribute** slot — wire it there.
- Reuse `styles.css` tokens only: #FF2500 accent, cool-neutral surfaces, DM Sans / Inter,
  Card=Poster framing for the form panel. No new design language.
- Single column, generous labels, inline validation, success state styled as a poster card.

### A3. Store
Supabase table `map_submissions`: all A1 fields + `submission_type`, `status`
(pending/approved/rejected), `created_at`. RLS: anon can INSERT only.

### A4. Review → merge loop (mirror the coord pipeline)
1. Submissions queue in Supabase.
2. Reviewer approves/rejects (Supabase dashboard now; a tiny internal `review.html` later).
3. A `scripts/merge-submissions.py` writes approved rows into `places.json` with
   `locationReviewStatus: "Needs Location Review"` and `coordinateSource: "community"`,
   so new entries flow straight into Workstream B.

### A5. Hardening
Honeypot + time-trap, email format check, server-side length caps, explicit consent
checkbox, full keyboard/ARIA pass, throttle by IP if serverless.

### Acceptance
On-brand `contribute.html` live; a real submission lands in `map_submissions`;
approved row merges into `places.json` and renders.

---

## Workstream B — Shrink the 371 "Needs Location Review"

This is **not** 371 missing pins. It splits three ways:

| Tier | Count | What they are | Approach | Realistic yield |
|---|---|---|---|---|
| B1 | 63 | Have lat/lng; audit flagged a discrepancy (e.g. "210m from geocode") | Re-run `audit-coords-census.py` + parcel check; auto-promote anything within parcel/threshold | ~50 → map-ready quickly |
| B2 | ~130 | Have a street address (non-trail) | Census/parcel geocode (scripts exist) **cross-checked against the incumbent's 686 coords** by name/address; PO-box / mailing-only orgs stay directory-only **by design** | ~90 → map-ready |
| B3 | 233 | Walks & Trails | A trail is a line, not a point — needs a real source | see below |

### The verification oracle
The incumbent's 686 features carry independently-sourced coordinates. For every place
that exists in both datasets (match on name + address/city), their coordinate is a
**second opinion** on ours. Agreement within ~50m = verified; disagreement = the
manual short-list. This turns "the old map" into our free QA layer. Build
`scripts/cross-check-arcgis.py` to pull their layers (public REST) and diff.

### B3 — trails (233): sourced, not hopeless
A trail is a line, not a point, so it needs a trails dataset — and the data exists, free.
Verified by live probing on 2026-06-12:

- **Bear Yuba Land Trust — CONFIRMED public + queryable (2026-06-12).** Their Trails
  Portal (Web Experience, `access: public`) pulls hosted feature services on
  `services6.arcgis.com/wuk3UeLQ401hBhEO`: **`BYLT_Other_Trails_v9` = 342 trails** and
  **`Parking_Lots_v5` = 74 trailhead parking points**. The 74 trailheads are ready-made
  representative coordinates — they solve the "line not a point" problem outright. Layer
  name "Other_Trails" implies a primary trails layer too, so 342 is a floor. Local
  (Grass Valley); best source for curated foot trails.
- **OpenStreetMap (Overpass API) — CONFIRMED.** Full-county pull = 3,012 named ways;
  **140 of our 233 match by name (60%)**, free, no login. ODbL (attribution + share-alike).
  Same base layer AllTrails is built on.
- **USFS Tahoe National Forest:** ~23 unmatched Boca/OHV routes are federal land. USFS
  publishes Trails + MVUM as open GIS. Authoritative for the OHV cluster.
- **CA State Parks GIS:** South Yuba River SP, Empire Mine SP (Independence, Hirschman area).
- **Residue:** a handful of private/niche (Ananda gardens, Kenny Ranch) → owner contact
  or directory-only.

**AllTrails: no.** No public API, DataDome bot-blocking, ToS forbids scraping. They hoard
user GPS traces layered on OSM. Don't build on them; go to the same wells directly.

**Coverage verdict:** BYLT (342 + 74 trailheads) ∪ OSM (140) covers essentially all 233
local trails with real geometry; USFS mops up the OHV cluster. Trails are reclassified from
"hard part" to **integration work**.

Licensing (a to-do, not a blocker): OSM = ODbL attribution + share-alike; BYLT = request
written OK + attribution (fellow local nonprofit, easy); USFS / State Parks = public domain.

Build: `scripts/fetch-bylt-trails.py` + `scripts/fetch-osm-trails.py` → name/locale match
to the 233 → attach trailhead point (and line geometry where wanted) → promote to map-ready.

### Realistic outcome
Clearing B1 + B2 without touching trails moves map-ready from **875 → ~1,015**, pushing
us further past their 686 — with photos they don't have. Trails are a separate decision.

### Acceptance
`coord-audit-report.json` + `cross-check-arcgis.py` regenerated; B1/B2 promotions
applied via `apply-coord-corrections.py`; map-ready count up by ≥120; a written
trail-data decision recorded.

---

## Sequencing
1. **A (form)** first — self-contained, visible win, and its output feeds B.
2. **B1** (cheap re-promotion) alongside A.
3. **B2 + the ArcGIS cross-check** — the data-quality core.
4. **B3 trails** — only after a source decision.

## Status
Form frontend is **unblocked** — it ships with a `mailto:` default and a one-function
backend swap, so it needs no NCAC decision to build. The storage choice is NCAC's, made
later without touching the form UI. Workstream B needs no external input except the
trails-source call in B3.
