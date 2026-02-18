# Phase 8: AI Trip Builder - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Dream board + AI-powered itinerary planning: users collect places and events via bookmark icons across all surfaces, converse with the concierge to organize them into structured trip plans, and get a rendered itinerary with dynamic map route, calendar export, and shareable URL. Reuses existing itinerary rendering and map route infrastructure.

Brainstorm design docs (`.planning/brainstorm/trip-builder/`) cover architecture, UX flows, editorial design, and competitive analysis. This context captures user decisions that resolve open questions from those docs.

</domain>

<decisions>
## Implementation Decisions

### What gets bookmarked
- Both **venues AND events** are bookmarkable (resolves open question #1 from UX flows doc)
- Events carry date/time context — chatbot can factor event schedules into itinerary timing
- Stale events (past date) should be handled gracefully in the dream board (visual indicator or auto-archive)

### Chatbot planning depth
- **One-shot plans via style cards** preferred over multi-turn Q&A conversation
- Quick-action cards ("1-day plan", "2-day plan", "Just organize my list") let users skip the interview and go straight to itinerary generation
- The back-and-forth Q&A is available but not the default path — users who want to customize can type naturally
- "Make it mine" from curated itineraries should copy stops into dream board for modification

### Trip page map integration
- **YES — inline map on trip.html** showing dream board pins and itinerary route
- Dynamic route rendering on the interactive map, same treatment as curated routes (numbered stop markers, route line, flyTo camera)
- The existing `activateItineraryOnMap()` + `resolveItineraryStops()` pipeline handles this — schema-identical trip objects render identically to curated itineraries
- This is the "wow factor" feature — ad-hoc route creation from chatbot output rendered live on the map

### Dream board card interaction
- Dream board cards **SHOULD open detail panel** when clicked (overrides brainstorm UX doc recommendation of dead-end cards)
- Remove button (X) still intercepts with `e.stopPropagation()` — card click = detail, X click = remove

### Unplanned items zone
- Simple list with small thumbnails — minimal treatment
- No elaborate "swap in" UI — just a visible list of what didn't make the cut
- Users can ask the chatbot to include them if they want

### Claude's Discretion
- Onboarding and empty state messaging — surface during planning
- First-use discoverability approach (text labels vs icon-only)
- Dream board item limit thresholds (20 soft / 30 hard from brainstorm docs is fine as starting point)
- Toast notification design and timing
- Badge count animation details
- Exact responsive breakpoints for trip page layout

</decisions>

<specifics>
## Specific Ideas

- User excited about dynamic map route rendering from chatbot output — "being able to ad-hoc create a route on the map the same way curated routes work, but on demand? That would be fucking crazy"
- One-shot style cards are the preferred entry point — reduce friction to get a plan fast
- Unplanned items should be visually lightweight — thumbnails in a list, not elaborate cards
- The brainstorm team's 4 docs (`.planning/brainstorm/trip-builder/`) are comprehensive and should be treated as the primary design reference — this context captures only the decisions that override or resolve their open questions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-ai-trip-builder*
*Context gathered: 2026-02-17*
