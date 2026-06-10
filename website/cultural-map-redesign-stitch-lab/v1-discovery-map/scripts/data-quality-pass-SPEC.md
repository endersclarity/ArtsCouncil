# Spec: Data Quality Pass (Places photo refresh + catalog curation)

Owner approved 2026-06-10: option 1 (Google Places API refresh) + option 2
(curate/demote weak entries). Hold: nothing gets pushed without owner OK.

Current facts (verified 2026-06-10):
- 1,351 places. ~450 descriptions still templated ("included for alpha review")
  with no usable website. 149 placeholder images. ~1,065 images hot-link
  lh3.googleusercontent.com and ~1 in 8 of those URLs is dead (they expire).
- markerTier: map-ready 546 / candidate 497 / directory-only 308.
  publicMarker: true 1,043. musePick: true 466.
- Owner's billing fear is the constraint that shaped Stage 0. No API spend
  happens before the cap exists and the owner has seen the numbers.

## Honesty note (owner should know, decided not to block)

Google's ToS technically wants Places content displayed on a Google map; this
site uses MapLibre + OpenFreeMap. The existing dataset already hot-links Google
photo URLs, so the refresh does not create a new kind of dependency — it
re-fetches fresh URLs for the same content. Flag this in the findings file so
the owner can revisit (e.g., move to community-owned photos over time, which is
the better end state anyway).

## Stages (commit per stage; do NOT push without owner OK)

### Stage 0 — Billing audit + hard cap (STOP for owner before any paid call)
- Check for existing Google Cloud credentials/projects (gcloud CLI, existing
  API keys in the repo's git history or env). Report what exists.
- Determine billing state: which project, is billing enabled, current month
  spend, whether the $200/mo Maps Platform credit applies.
- Set up (or instruct owner through) a budget alert AND an API key restricted
  to Places API with a quota cap sized so worst-case spend ≤ ~$50.
- Estimate the real cost of the full pass (Place Details + Photos for ~1,350
  places) with current pricing and show the arithmetic.
- **STOP HERE**: present findings + cost estimate to the owner and wait for an
  explicit "go" before Stage 1. This is the one deliberate pause in the loop.

### Stage 1 — Pilot (20 places)
- Script: for 20 places spanning the problem classes (broken lh3 image,
  placeholder image, templated description), do Places Text Search/Find Place
  by name+city → Place Details (photos, editorial_summary, website, hours).
- Save raw responses to `scripts/places-refresh/pilot/` (gitignored).
- Verify: photo URLs render, matched place is actually the right venue
  (name+city sanity check), note mismatch rate. If mismatch > 2/20, fix the
  matching strategy before scaling.

### Stage 2 — Full refresh (script, resumable)
- All places needing it: broken/expiring Google image OR placeholder image OR
  templated description. Skip places whose description came from the
  venue-website pass (`descriptionSource.kind == "venue-website"` keeps its
  text forever — venue's own words always outrank Google's).
- Batch with checkpointing (resume after failure), polite rate limiting.
- Capture per place: fresh photo URL(s), editorial_summary if present,
  website if we lacked one, business_status (CLOSED_PERMANENTLY matters!).

### Stage 3 — Merge with provenance
- Images: replace broken/placeholder images with fresh Google photo refs;
  `imageSource: {kind:"google-places", fetched:"YYYY-MM-DD"}`.
- Descriptions: ONLY where still templated AND editorial_summary exists —
  use it with `descriptionSource: {kind:"google-places", fetched}`. Never
  touch venue-website descriptions.
- Websites found for website-less places: add them, and list them in findings
  as candidates for a future self-description scrape.
- business_status CLOSED_PERMANENTLY → findings list, do NOT auto-remove.

### Stage 4 — Curation / demotion (option 2)
- Generate `scripts/demotion-review.md`: every place that after Stage 3 STILL
  has (templated description AND placeholder image AND no website AND no
  upcoming events). Group by markerTier.
- Auto-demote (set `publicMarker: false`) only the clear-cut tier: the above
  AND markerTier == "candidate" AND not musePick AND not anchor/featured.
- Everything else in the review file is owner's call — do not touch.
- Report the before/after public-marker count.

### Stage 5 — Wrap-up
- Verify locally (serve + agent-browser): previously-broken images now render
  on 3 sample cards, a demoted place no longer appears, zero console errors,
  mobile spot check.
- Changelog entry (hook enforces), STATE.md update with closing report
  (including the ToS note and demotion counts), commit.
- Push ONLY if owner has said so since Stage 0; otherwise report and stop.

## Rules

- Never read places.json wholesale into agent context; scripts only.
- All raw API responses gitignored; only merged places.json + findings commit.
- Bump `?v=` cache-bust on any app.js/styles.css change (none expected).
- Each iteration: advance the current stage, report progress + spend-so-far.
- Done when Stage 5 complete or blocked at the Stage 0 gate awaiting owner.
