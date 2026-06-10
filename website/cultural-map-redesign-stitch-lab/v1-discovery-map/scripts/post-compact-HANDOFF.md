# Handoff: post-compact state (written 2026-06-10, end of the big cleanup day)

**To:** this session after /compact. Read this, then .planning/STATE.md. Don't
re-derive anything below; it's all verified.

## Where things stand

- Live site: https://v1-discovery-map.vercel.app — push to master = publish
  (ALWAYS get owner consent before pushing; he grants it same-day when asked).
- Working dir: website/cultural-map-redesign-stitch-lab/v1-discovery-map.
- Local server http://127.0.0.1:8013 + agent-browser session "grill" for checks.
- Cache-bust discipline: bump ?v= in index.html on every app.js/styles.css
  change. Current: cla-52-muse-read-links.
- Pre-commit hook: every v1-source commit needs a data/changelog.json entry
  (plain language, for the Arts Council). SKIP_CHANGELOG=1 for pure docs.
- places.json ~2MB: scripts only, NEVER read wholesale. place.image is an
  OBJECT; use resolvePlaceImage(). app.js has a null byte — use `grep -a`.

## UNPUSHED commits (everything else is live)

ceb7c81 vision-realignment handoff doc
7a89d23 MUSE Story Lens + surprise-nearby distance fix
61ab427 story lens -> published MUSE e-magazine links
Owner has SEEN none of these on the live site yet. Ask before pushing.

## What got built today (all committed)

1. Free image pass + data-cleanliness loop (PUSHED): 266 self-hosted venue
   photos, 209 dead Google links -> honest placeholders, website link-rot
   audit (65 dead retired, 13 fixed), 8 new own-words descriptions, parcel
   coordinate pass (2 fixed, 15 downgraded), scripts/audit-everything.py
   health runner (documented in README — run monthly).
2. MUSE Story Lens (UNPUSHED): "Stories from MUSE" button -> 33 real articles
   (exact direct-evidence links only; 167 places) -> map highlights + place
   list + "Read the article in MUSE ›" deep link into the official Heyzine
   flip-books (2024: heyzine.com/flip-book/4d7f1d311e.html, 2025: /MUSE,
   2026: /MUSE26, #page/N anchors). Data: data/muse-stories.json, built by
   scripts/build-muse-stories.py. Place cards link back via "See this story
   on the map". Owner reaction pending — he said "if it really sucks, we'll
   look to design principles based on reference images."
3. Claim Your Listing concept board (PUSHED): Flow 07 in
   docs/flow-proposal-gallery.html. Deliberately NOT built — Arts Council
   governance decision.

## Easy next steps (in rough value order)

1. Owner reviews story lens locally (8013) -> push the 3 commits with consent.
2. Owner may fire the vision-realignment audit session: kickoff prompt reads
   .planning/handoff-vision-realignment-2026-06-10.md (read-only direction
   audit against the April 24 brief + transcripts). Its findings may redirect
   feature work — don't build big things before it reports.
3. Heyzine page-anchor sanity: print page numbers vs flip-book spreads may be
   off by one — owner should click 2-3 "Read the article" links and confirm
   they land on/near the right page. Adjust offset in museArticleUrl() if not.
4. Surprise-me: verify the nearby fix feels right while browsing (picks from
   ~30 closest to map center now).
5. Review files awaiting the owner: scripts/demotion-review.md (2 places),
   scripts/website-review.md (55 borderline sites), broad-street-inn
   coordinate contradiction.

## How to get reapprised after compact

- .planning/STATE.md — top sections cover today's passes.
- Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md — the product north
  star ("discovery-first cultural map... a little human curation"; NOT a
  tourism platform / Arts Hub / AI itinerary builder).
- scripts/audit-everything.py — run it for current data health in one page.
- git log --oneline -15 — today's narrative is all there.
