# Handoff: Vision realignment — do we have the correct read on what this thing is?

**From:** v1-discovery-map working session, 2026-06-10
**To:** a fresh session (new pair of eyes, owner will start it with this file)
**Your job:** build a full information inventory of what the Arts Council actually
asked for — from meetings and the docs they produced — and judge whether the
current build matches it. You are an auditor of direction, not a builder.
Do NOT write code. Deliverable is an assessment the owner can react to.

## Why this session exists

The owner (Kaelen) suspects drift. The build has gone deep on data quality and
features, but the last real direction-setting happened months ago, the March
work got tangled in inter-organization politics (county's "Go Nevada County"
tourism platform vs. an independent culture-first site), and the owner is NOT
interested in building a tourism portal. He wants a second opinion on whether
the current product matches what Eliza and Diana actually want, before any
community outreach happens.

## Read these, in this order

1. `Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md` — the distilled
   direction and the most recent. Core sentence: "a discovery-first cultural
   map that feels alive because it combines places, events, filters, and a
   little human curation." Also lists what NOT to say (not an Arts Hub, not an
   AI itinerary builder, not a tourism platform).
2. `Transcripts/2026-04-24_arts-council-session_GPT-SUMMARY.md` — the three
   meetings behind that brief (UX wants, the county-platform drama, curated
   tours, "no AI itineraries — curated, validated content").
3. `.planning/hub/brief.md` — the older MVP spec (March era). Partly
   superseded by the April 24 direction; note where they disagree.
4. `.planning/hub/context/culture-forward-extraction.md` — the Culture Forward
   strategic plan extraction (the Council's formal long-term goals; "hub"
   language lives here — handle with care given the politics).
5. `Transcripts/2026-03-13_arts-council-meeting_CLEAN.txt` and
   `2026-02-18`/`2026-02-06` — full transcripts, read as needed for direct
   quotes from Eliza (director) and Diana (program manager). The March 13 one
   is the meeting that later got routed through the Experience Planning
   Committee; treat its conclusions as politically contaminated, not void.
6. `.planning/STATE.md` — what has actually been built (the live site is
   https://v1-discovery-map.vercel.app, repo auto-deploys from master).

## What the current build IS (so you can compare honestly)

V1 Discovery Map, vanilla JS + MapLibre + flat JSON, 1,351 places (1,041
public markers), live events from 9 sources, 4 authored paths, mood-based
browse, time lens (today/weekend/week), "Surprise me nearby", MUSE story lens
(33 real articles -> mapped places, exact citations only), place cards with
venue-website photos/descriptions ("in their own words" provenance), plain-
language What's New changelog, repeatable data-health scripts. Data quality
has had heavy investment (coordinate audits against Census + county parcels,
photo self-hosting, link-rot pass, honest placeholders).

## Questions the owner wants answered

1. Inventory: across all meetings/docs, what are the explicit asks, who asked,
   and what's the most recent statement of each? (A table or list with dates.)
2. Where does the current build EXCEED the asks (things built nobody asked
   for), and where does it FALL SHORT (asks with nothing behind them)?
3. The politics: given the Go Nevada County conflict, what should this product
   deliberately NOT become, and is anything in the current build drifting that
   direction (e.g., lodging, generic tourism content from the Eat/Drink/Stay
   category)?
4. MUSE: what did they actually want the MUSE relationship to be, and is the
   story lens + business-directory framing the right read?
5. What are the 3 most valuable next moves that are clearly INSIDE what the
   Council asked for?

## Ground rules

- Read-only session. No code, no data edits, no pushes.
- Quote people verbatim with dates when making claims about what they want.
- Distinguish "Eliza/Diana said X" from "a planning doc inferred X" — the
  owner specifically worries that summaries written by earlier sessions may
  have baked in wrong interpretations. Prefer transcripts over derived docs
  when they conflict, and flag every conflict you find.
- The owner is conscious of token burn: read the two April 24 docs fully, the
  brief and extraction fully, but grep/sample the long transcripts rather than
  reading all 8,000 lines unless a specific question demands it.
