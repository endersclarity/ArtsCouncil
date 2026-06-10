# Handoff: Free Image Pass (no Google API, token-frugal)

**From:** 2026-06-10 session (post coordinate-audit adoption, flow-upgrade pass live)
**To:** same session after /compact
**Owner decision:** Google Places API refresh is DEAD — owner refuses the
expiring-URL treadmill. `scripts/data-quality-pass-SPEC.md` Stages 0–3 are
superseded by this plan; its Stage 4 (demotion) survives as Stage C below.
Owner is explicitly conscientious of TOKEN BURN: plans/specs/scripts in agent
context are fine; bulk crawling/ingesting through the model context is NOT.

## Token-burn ground rules (the owner's constraint, honor it)

- All bulk work happens in PYTHON SCRIPTS writing to disk. The agent reads
  only printed summaries (counts, samples of ~10 rows), never raw crawl data.
- NO screenshots for photo selection. NO vision passes over websites.
- Photo choice is deterministic metadata, not judgment: venues self-declare
  their representative image via `og:image` / `twitter:image` meta tags (it's
  what Facebook/Twitter show when the site is shared). That tag IS the venue
  choosing its own photo — same legitimacy story as the self-description pass.
- At most ONE small Haiku batch (text-only: URL + alt + filename strings) if
  ambiguity filtering is needed; expected unnecessary. Spot-check ≤6 images
  visually (agent Read on downloaded files) before merge — that's the entire
  vision budget.

## Current facts

- 1,065 images hot-link lh3.googleusercontent.com; ~1 in 8 dead (expiring).
- 156 places have local/no image; 149 use category placeholders.
- `scripts/fullpass-pages/` already holds fetched homepage+about text for 364
  venues (gitignored), and `scripts/fullpass-venues.json` lists the 452 targets
  with websites. The fetcher pattern to copy is `scripts/fullpass-fetch.py`
  (urllib, 8 workers, 15s timeout) — but og:image needs the RAW HTML head, so
  refetch just the homepage `<head>` (first ~50KB), don't reuse stripped text.
- `place.image` is an OBJECT: `{kind: "real"|"placeholder", src, alt, ...}`.
  Renderer: `resolvePlaceImage()` in place-data.js / app.js `renderImage()`.
- places.json ~2MB — scripts only, never read wholesale into context.
- Pre-commit hook requires a data/changelog.json entry for v1-source commits.
- Site is live; push = publish; owner has been approving pushes same-day.

## Stage A — Dead-image triage (pure script, fixes the visible breakage)

1. Script: HEAD/GET-probe every `lh3.googleusercontent.com` src (8 workers,
   follow redirects, 200 + image content-type = alive). Write
   `scripts/image-audit.json` (gitignored): id, src, status.
2. Merge: for dead URLs set `image.kind = "placeholder"` and stash the dead
   src as `image.deadSrc` (audit trail). Renderer already shows category
   placeholder + "Photo not yet sourced" for kind=placeholder — verify that's
   the actual fallback path before merging.
3. Result: zero broken <img> on the live map. Commit (changelog: plain-language
   "broken photos now show honest placeholders until real ones arrive").

## Stage B — Venue-website photos (og:image harvest)

1. Script: for every place with a website (start with the ones that are
   image-broken or placeholder — don't touch places with healthy real images),
   fetch homepage HTML head, extract in priority order:
   `og:image` → `twitter:image` → largest `<img>` by declared width/height or
   filename hints. Resolve relative URLs. Write `scripts/og-image-harvest.json`.
2. Filter deterministically (no LLM): reject SVG, reject filenames matching
   logo|icon|favicon|badge|banner-text, reject < 400px wide (probe Content-Length
   / image header bytes), reject generic platform assets (wix/squarespace/
   wordpress default-share images — known URL patterns).
3. Download survivors to `assets/venue-photos/<place-id>.jpg` (self-hosted =
   never expires; these are venues' own publicly-chosen share images used to
   represent that venue, with a credit line). Cap file size, re-encode/resize
   to ~1280px with Pillow if available, else store as-is.
4. Spot-check ≤6 downloaded images by Reading them (the whole vision budget).
5. Merge: `image = {kind:"real", src:"assets/venue-photos/<id>.jpg",
   alt:"<name>", credit:"Photo: <venue> website",
   imageSource:{kind:"venue-website", url, fetched}}` — only for places that
   were broken/placeholder. Never overwrite a healthy image.
6. Commit with changelog entry ("photos from the venues' own websites").
   Report: how many of the ~300 broken/placeholder places got real photos.

## Stage C — Curation demotion (from the old spec, unchanged)

After A+B (so photo fixes count in their favor): generate
`scripts/demotion-review.md` for places still having templated description AND
placeholder image AND no website AND no upcoming events, grouped by markerTier.
Auto-demote (`publicMarker: false`) ONLY: markerTier=="candidate" AND not
musePick AND not anchor/featured AND all four gaps. Everything else = owner
review file. Report before/after public counts. Commit + changelog.

## Wrap-up

- Verify with agent-browser on local serve: a previously-broken card shows
  placeholder or new photo, a demoted place is gone, console clean. ~3
  screenshots total.
- STATE.md: results + what remains (community photo drive is the long-term
  photo plan; 127 no-census-match coords; 4 manual coordinate flags).
- Commit per stage; ask owner before pushing (he's been saying yes same-day).

## Why no Google (so nobody relitigates this)

Google Places photo URLs expire by design → permanent refresh treadmill +
ToS gray zone + photos never owned. og:image photos are venue-chosen, can be
self-hosted, never expire, and match the map's "in their own words" identity.
