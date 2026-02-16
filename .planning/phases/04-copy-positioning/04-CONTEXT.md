# Phase 4: Copy & Positioning - Context

**Gathered:** 2026-02-16
**Updated:** 2026-02-16 (post-writers' room)
**Status:** Ready for execution

<domain>
## Phase Boundary

Rewrite all user-facing text so the platform reads as the Experience Planning Committee's editorial-quality digital tool. Downtown/culture-forward positioning. Nature as supporting color only. Voice derived from MUSE magazine analysis. Full rewrite of every surface: hero, categories, itineraries, editorials, colophon, labels.

</domain>

<decisions>
## Implementation Decisions (Settled by Writers' Room)

### Hero headline — LOCKED
- Cover tag: "Nevada County Cultural District"
- Headline: "The Creative Life"
- Sub-line: "Grass Valley - Nevada City - Truckee - the Sierra foothills"
- Geographic context line with drive times from Sacramento, SF, Reno (outside editorial voice)
- SEO title tag: real keywords (galleries, events, dining, Sierra Foothills) — no dev artifacts

### Voice — two registers, LOCKED
- **Editorial register** for narrative surfaces: MUSE cards, itinerary narratives, experience descriptions, colophon. Name-first, second-person, earned adjectives, em-dash color, short punchy closers.
- **Functional register** for utility surfaces: tabs, filters, search, map controls, event listings. Plain nouns, no verbs, no invitations.
- **Chatbot register**: functional — like a knowledgeable local giving quick recs. NOT editorial. No narrative arcs, no em-dash color.
- 10 voice rules codified in writers-room/editor-assessment.md (Section 4)

### Terminology — LOCKED
- "Places" everywhere user-facing. Zero instances of "cultural asset(s)."
- Map panel title: "Interactive Map" or "Map" — not "Cultural Asset Map"
- Config JS default: "places" not "assets"
- "Cultural District" appears exactly once in cover tag, once in colophon. Nowhere in conversational copy, headlines, or navigation.
- Tab labels: plain nouns ("Categories," "Events," "Routes")
- Search placeholder: "Search places"

### Edition tagline — LOCKED
- "Issue 03 | 2026" (mirrors MUSE format). "Culture - Discovery - 2026" is dead.

### Colophon — LOCKED
- "Created by" Experience Planning Committee (not "Crafted for")
- Credit committee, MUSE, Arts Council
- Specific count ("687 places")
- No "last updated" date

### MUSE section framing — LOCKED
- Add one-line context for visitors who don't know MUSE: "From MUSE, the Cultural District's print journal" or similar

### Platform name — LOCKED
- "Explore Nevada County" — user approved, keeping as-is
- Rename options documented in writers-room/platform-name-decision.md for reference only

### Narrative rewrites — LOCKED RULES
- Every stop narrative: place name first, then sensory/characterizing hook
- Second-person address, active voice throughout
- No generic tourism cliches (hidden gem, must-see, bucket list, best-kept secret, nestled, escape the ordinary)
- No generic transitions (Settle into, Wind down with, Stretch your legs)
- Every narrative passes specificity test: could not describe any other town in America
- Nature as supporting color, never the lead
- Truckee: acknowledged where already present, not expanded

</decisions>

<specifics>
## Writers' Room Source Documents

- `writers-room/editor-assessment.md` — The definitive copy direction. All executor decisions flow from this.
- `writers-room/muse-advocate.md` — MUSE voice champion perspective
- `writers-room/committee-advocate.md` — Institutional/committee perspective
- `writers-room/tourist-advocate.md` — First-time visitor perspective
- `writers-room/local-advocate.md` — Resident/regular user perspective
- `04-RESEARCH.md` — MUSE voice extraction, copy surface inventory

</specifics>

<deferred>
## Deferred Ideas

- Platform rename (committee decision for Diana/Eliza — not a copy executor decision)
- "Recently added" badges for directory entries (feature, not copy — noted by local advocate)
- Seasonal rotating callout on homepage (feature scope, not phase 4)
- Truckee scope decision: is this GV-NC platform that acknowledges Truckee, or full Nevada County? (committee decision)
- Accessibility pass on MUSE voice complexity for non-native speakers (future phase)

</deferred>

---

*Phase: 04-copy-positioning*
*Context gathered: 2026-02-16*
*Updated post-writers' room: 2026-02-16*
