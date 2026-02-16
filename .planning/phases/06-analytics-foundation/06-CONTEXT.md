# Phase 6: Analytics Foundation - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Instrument all user interactions on the cultural map so the committee can see what visitors care about and prove referral value to local businesses. Covers: analytics provider setup, event tracking for 12+ interaction types, UTM-tagged outbound links, dedup throttle, and shared dashboard access.

</domain>

<decisions>
## Implementation Decisions

### Analytics provider
- **Umami Cloud (free Hobby plan)** — 0$/mo, 100k events/mo, up to 3 sites, 6-month data retention
- Cookieless, GDPR/CCPA compliant by design — no consent banner needed
- Script loads on every page, always (no opt-in required)
- Initial site: `cultural-map-redesign-stitch-lab.vercel.app` (can swap domains freely later)
- Sign up at umami.is, create site, get tracking script snippet

### Event taxonomy
- Claude's discretion on naming convention and grouping structure
- Claude's discretion on how to balance venue-level referral proof vs aggregate demand signals (optimize for both)
- Track zero-result searches as a flagged event (`zero_results: true` property) — demand signal for unmet content
- Chat interactions stay in Supabase only — no redundant tracking in Umami (Supabase already logs session, query, intent, assets)

### UTM & outbound strategy
- UTM source: `exploregvnc` — this is what shows up in venues' Google Analytics as referral source
- Very important to committee — "we sent you 47 visitors last month" is a key selling point
- Claude's discretion on UTM campaign naming (context-based vs single)
- Claude's discretion on which outbound types to track (website, phone, directions)

### Dashboard & access
- Committee members (2-3 people: Kaelen, Diana, possibly Eliza) need dashboard access
- Claude's discretion on detail level shown (executive overview vs full event detail)
- Umami free tier supports limited team seats — check if 2-3 fits or if shared link is needed as fallback

### Claude's Discretion
- Event naming convention (flat vs grouped by feature area)
- Event taxonomy structure (how to organize 12+ interaction types)
- UTM campaign naming strategy
- Which outbound action types to track
- Dashboard detail level for committee view
- Provider-agnostic analytics module design (wrapper pattern)
- Dedup throttle implementation (500ms or similar)

</decisions>

<specifics>
## Specific Ideas

- Committee wants to tell individual businesses "we sent you X visitors" — UTM tracking is the proof mechanism
- Umami can swap sites freely (add/remove within 3-site limit) — no lock-in to current domain
- Zero-result search tracking is explicitly desired as demand signal data
- Chat analytics intentionally excluded from Umami to avoid Supabase duplication

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-analytics-foundation*
*Context gathered: 2026-02-16*
