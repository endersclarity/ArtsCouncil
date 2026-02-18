# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.
**Current focus:** Demo-critical todo sprint — Tonight filter, deep link bookmarks, analytics mockup. Deadline Wed Feb 18 noon.

## Current Position

Phase: 09-directory-page-redesign
Plan: 2 of 4 COMPLETE
Status: Plan 09-02 complete. Directory deep link + history system: pushState/popstate navigation, collapse-before-render bug fix, toast notifications, breadcrumb.
Last activity: 2026-02-18 -- Phase 09 Plan 02: pushState/popstate history, collapseCardImmediate in search/filter, deep link loading state, error toast, breadcrumb.

Progress: [████████████████████] 100% overall (Phase 09 in progress)

## What's Actually Shipped

### Phase 1: Design & Visual Refresh (~60%)
- Magazine-style layout built by **Codex (OpenAI)**, not GSD plans
- GSD plans (01-01, 01-02, 01-03) were token swaps that produced no visible change — OBSOLETE
- Codex's WIP promoted to canonical in commit `b2d7e48`
- Map rendering fixed (commit `48a9486`)
- Missing DOM IDs resolved in Phase 01.1
- Mobile not tested, copy audit incomplete

### Phase 2: Tier 2 Events (100%)
- 3/3 plans executed through GSD pipeline
- LibCal (70 events) + CivicEngage (1 event) + Trumba (49 events) = 120 merged events
- Fuzzy dedup, family classification (26 tagged), source badges, fallback loading
- GitHub Actions daily cron on master
- 17 gate tests passing

### Phase 2.1: KVMR + GVDA Event Source Ingestion (100%)
- 2/2 plans complete
- KVMR iCal ingest: 29 events, NC city whitelist filtering, kvmr- prefixed IDs
- GVDA Trumba JSON ingest: 44 events, HTML location stripping, gvda- prefixed IDs
- 5-source merge pipeline: 176 total events (was 120), 19 GVDA/Trumba duplicates removed
- GitHub Actions daily cron updated with all 5 ingest steps
- Priority order: trumba > gvda > libcal > kvmr > civicengage

### Phase 3: Itineraries (100%)
- 2/2 plans complete
- itineraries.json: 3 curated trip plans (1-day/7 stops, 2-day/13 stops, 3-day/20 stops)
- itinerary-model.js: stop resolution by exact name match, day grouping, map coord extraction
- itinerary-calendar.js: Google Calendar URL generation with Pacific timezone
- itinerary-view.js: hero cards, detail overlay with day tabs, stop cards, mobile scroll-snap
- itinerary-controller.js: activation lifecycle, map route via corridor-map, GSAP animations, deep link
- All 40 stops validated against data.json — zero unresolved references
- Deep link: ?itinerary=perfect-day
- Mutual exclusion with experience/corridor system
- Browser verified: all 9 checks pass, zero console errors

### Phase 5: AI Concierge (100%)
- 2/2 plans complete (05-01: server infra, 05-02: chat UI)
- chat-knowledge-pack.json: 191KB compressed corpus (685 assets, 6 editorials, 3 itineraries, 176 events)
- /api/chat Vercel Serverless Function: Gemini 2.0 Flash proxy with tourism-only system prompt
- Input sanitization, Supabase logging, session-based rate limiting
- package.json with @google/generative-ai + @supabase/supabase-js
- CORS headers in vercel.json for /api/* routes
- Chat widget: FAB button (gold, bottom-right), slide-up panel with GSAP, full-screen mobile overlay
- Chat view: message bubbles, typing indicator, welcome message, error states
- Chat controller: /api/chat fetch, [[asset]] deep links to detail panel, {{MUSE}} citation blocks, session hash, input sanitization
- 3 IIFE modules wired into HTML in dependency order (view -> controller -> widget)

### Phase 6: Analytics Foundation (100%)
- 1/1 plan complete
- CulturalMapAnalytics IIFE wrapper: track() with 500ms dedup throttle, tagOutboundUrl() with UTM injection
- 15+ interaction types instrumented across 6 modules (bindings, detail-controller, detail-view, explore-controller, experience-controller, index-maplibre.js)
- Umami Cloud Hobby plan (privacy-first, no cookies, GDPR-compliant)
- Website ID: 14ecf234-cd96-4e6c-91c2-cc27babc095d
- Share URL: https://cloud.umami.is/share/875bmvTJ7Hd2oLAx (committee access, no login needed)
- Custom events confirmed in dashboard: category:filter, toggle:open-now, toggle:events-14d
- Deployed to Vercel stitch-lab

### Phase 6.1: Deep Analytics Instrumentation (100%)
- 1/1 plan complete
- 7 new event types: marker:click, itinerary:start, itinerary:calendar, itinerary:day-tab, outbound:event-ticket, events:date-filter, events:toggle
- Total tracked event types: 23 across 13 JS modules
- All event ticket URLs UTM-tagged with utm_campaign=event-ticket across 4 render paths
- Committee "clicked through to a business" metric: sum outbound:website + outbound:phone + outbound:directions + outbound:event-ticket
- marker:click at 3 entry points (circle click, mobile label, smart labels)

### Phase 8: AI Trip Builder (100%)
- 4/4 plans complete
- 08-01: Dream board model + bookmark icons on 4 surfaces (detail, directory, map, events), "My Trip" nav with badge, cross-tab sync
- 08-02: trip.html page with two-column layout, multi-trip management, inline MapLibre map, "Make it mine" on curated itineraries, activateUserTrip()
- 08-03: Chatbot trip planning mode with {{ITINERARY}} block parser, dream board context injection, trip style cards, ?chat=trip deep link
- 08-04: Finalized itinerary rendering with resolved stops + calendar export, share trip via URL (base64), deep link for shared trips, 7 analytics events
- Complete pipeline: bookmark -> dream board -> AI concierge -> itinerary -> map route -> share

### Phase 01.1: Demo Visual Polish (100%)
- 3/3 plans complete (01.1-01: hero/top bar, 01.1-02: AI style cards/deep links, 01.1-03: footer/polish)
- Sticky hybrid mast with brand + nav + expandable search + hamburger
- 9-image top photo carousel with auto-rotate + swipe
- Hero rebuilt as ~50vh brand lockup with inline SVG mark
- 6 AI concierge style cards with auto-submit prompts
- Deep-link bridge module for chat + editorial navigation
- Community photo grid + email capture + Apps Script submission
- Functional-zone reveal cleanup (explore/events/map instant render)

### Phase 4: Copy & Positioning (100%)
- 3/3 plans complete (04-01: hub & config, 04-02: itinerary & experience narratives, 04-03: sub-pages & chatbot voice)
- Hub hero: "The Creative Life" headline, edition tagline "Issue 03 | 2026", geographic sub-line
- Cultural Resources renamed to "Community & Learning" (58 venues)
- All user-facing "assets" replaced with "places" across HTML, config, filter model, explore view
- Tab labels simplified: Picks, Events, Routes
- MUSE section reframed with visitor context
- 3 itineraries + 10 experiences rewritten in MUSE editorial voice
- Events/itineraries sub-pages with real SEO title tags
- Chatbot personality: functional register (knowledgeable local), not editorial
- Platform name deferred to committee (documented for Wednesday meeting)
- Full consistency sweep: zero anti-patterns across all target files

### Phase 03.1: Content Architecture & Demo Curation (100%)
- 2/2 plans complete
- Adaptive split layout: content column left, sticky map column right on desktop (>900px)
- IntersectionObserver drives map sizing: hero (45%), editorial (25%), expanded (65%)
- CulturalMapScrollObserver IIFE module with zone transitions and MapLibre resize
- 8 hand-curated demo picks from 5 sources: 2 MUSE, 1 KVMR, 1 GVDA, 1 LibCal, 3 Local assets
- Source badges with per-source colors (gold, teal, rust, blue, deep-green)
- Feature Picks tab wired with click handlers: assets -> detail panel, editorials -> MUSE card, events -> scroll
- Mobile (<900px) falls back to single-column block layout
- events.html: dedicated events page with 176 events, date-grouped list, 5 filter dimensions (text search, date chips, source dropdown, family toggle)
- itineraries.html: dedicated itineraries comparison page with 3-column grid, deep link CTAs to hub
- Hub nav updated with Events + Itineraries links, contextual "See all" links in relevant sections
- Bidirectional navigation between hub and sub-pages

## Performance Metrics

**Velocity:**
- Total plans completed: 23 (Phase 2: 3, Phase 2.1: 2, Phase 2.2: 3, Phase 3: 2, Phase 4: 3, Phase 5: 2, Phase 6: 1, Phase 6.1: 1, Phase 3.1: 2, Phase 8: 4 — Phase 1 plans obsolete)
- Average duration: 3.4min per plan

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Agent |
|-------|-------|-------|----------|-------|
| 1 | 0/3 (obsolete) | N/A | N/A | Codex (OpenAI) built layout outside GSD |
| 2 | 3/3 | 9min | 3min | Claude Code via GSD |
| 2.1 | 2/2 | 5min | 2.5min | Claude Code via GSD |
| 3 | 2/2 | 12min | 6min | Claude Code via GSD |
| 3.1 | 2/2 | 7min | 3.5min | Claude Code via GSD |
| 5 | 2/2 | 6min | 3min | Claude Code via GSD |
| 6 | 1/1 | 15min | 15min | Claude Code via GSD |
| 4 | 3/3 | 9min | 3min | Claude Code via GSD |
| 6.1 | 1/1 | 3min | 3min | Claude Code via GSD |
| 2.2 | 3/3 | 11min | 3.7min | Claude Code via GSD |
| 8 | 4/4 | 27min | 6.75min | Claude Code via GSD |
| Phase 09-directory-page-redesign P02 | 3 | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Recent decisions affecting current work:

- [Phase 1]: GSD plans (token swaps) abandoned — Codex built magazine layout from scratch
- [Phase 1]: Design direction: `mockups/phase1-landscape-mag-overhaul.html` (magazine DNA)
- [Phase 1]: Codex's WIP promoted to canonical (commit `b2d7e48`) — backups exist as `*.BACKUP-pre-phase1.*`
- [Phase 1]: Map rendering bug is pre-existing — affects ALL HTML variants, not just Codex's layout
- [Phase 2]: All decisions preserved (see 02-VERIFICATION.md)
- [Roadmap]: Phase 1 state reconciled 2026-02-15 — summaries rewritten to reflect Codex as actual executor
- [Phase 2.1]: KVMR events with unknown city kept (benefit of the doubt for local events)
- [Phase 2.1]: GVDA datetimes use ZoneInfo directly rather than parsing offset string
- [Phase 2.1]: GVDA eventImage is a dict {url, alt, size}, not a string URL
- [Phase 2.1]: Source priority: trumba > gvda > libcal > kvmr > civicengage (Arts Council always wins dedup)
- [Phase 2.1]: KVMR and GVDA are supplementary sources (continue-on-error in CI)
- [Phase 3]: Itinerary stops use exact case-insensitive name match (not fuzzy .includes()) against data.json
- [Phase 3]: Google Calendar URLs use ctz=America/Los_Angeles with local time (no Z suffix)
- [Phase 3]: Smart quotes (U+2019) in data.json asset names must be preserved in itineraries.json
- [Phase 3]: Itinerary routes reuse corridor-map.js (no duplicate rendering code)
- [Phase 3]: CSS injected from view IIFE rather than separate CSS file
- [Phase 3]: Mutual exclusion: each controller (experience/itinerary) deactivates the other on activation
- [Phase 5]: Gemini 2.0 Flash (not 3.0) — model name matches current SDK availability
- [Phase 5]: Asset descriptions truncated to 40 chars (not 80) to keep knowledge pack under 200KB
- [Phase 5]: MUSE editorials compressed (summary fields only, body dropped) for token budget
- [Phase 5]: Website URLs dropped from asset compression for size budget
- [Phase 5]: No DOMPurify for V1 — parseResponse generates only known-safe HTML patterns
- [Phase 5]: Asset clicks use hash deep links (#place=Name) to trigger existing detail panel
- [Phase 5]: Conversation history capped at 10 messages (5 turns) to control API token usage
- [Phase 6]: Umami Cloud Hobby plan — privacy-first, no cookies, no consent banner needed
- [Phase 6]: Provider-agnostic wrapper (CulturalMapAnalytics) — never call umami.track() directly
- [Phase 6]: Event naming: kebab-case feature:action (category:filter, detail:open, outbound:website)
- [Phase 6]: 500ms dedup throttle on all events, 800ms debounce on search tracking
- [Phase 6]: UTM params: utm_source=exploregvnc, utm_medium=referral on all outbound links
- [Phase 6]: No chat tracking in Umami — stays in Supabase chat_logs only
- [Phase 6]: Share URL for committee: https://cloud.umami.is/share/875bmvTJ7Hd2oLAx
- [Phase 6.1]: UTM tagging at render time, tracking at click time (separation of concerns)
- [Phase 6.1]: marker:click intentionally distinct from detail:open (different funnel stages)
- [Phase 6.1]: Calendar click delegation per-activation since overlay DOM is recreated each time
- [Phase 6.1]: Extended detail-view.js outbound handler for event-ticket rather than separate delegation
- [Phase 3.1]: Map extracted to sticky sibling column rather than staying inside .spread
- [Phase 3.1]: Scroll sentinel pattern: invisible divs with data-map-zone trigger IntersectionObserver zone changes
- [Phase 3.1]: Demo picks hand-curated: 2 MUSE + 1 KVMR + 1 GVDA + 1 LibCal + 3 Local = 8 picks
- [Phase 3.1]: Source badge colors: MUSE gold, KVMR teal, GVDA rust, LibCal blue, Local deep-green
- [Phase 3.1]: MapLibre resize after zone transition (450ms timeout for CSS grid transition)
- [Phase 3.1]: Sub-pages are separate HTML files with inline IIFE JS (no module loading from hub)
- [Phase 3.1]: Events page uses Luxon CDN for timezone-aware date handling
- [Phase 3.1]: Source filter uses source_label (not categories) since events lack unified category taxonomy
- [Phase 3.1]: Itinerary CTAs deep link to hub via ?itinerary=<id> query param
- [Phase 4]: Hero headline: "The Creative Life" with sub-line "Grass Valley - Nevada City - Truckee - the Sierra foothills"
- [Phase 4]: Edition tagline: "Issue 03 | 2026" (mirrors MUSE format)
- [Phase 4]: "Cultural District" permitted in cover tag + colophon only; MUSE editorial quotes preserved
- [Phase 4]: Cultural Resources category renamed to "Community & Learning" (58 venues: libraries, media, schools, chambers)
- [Phase 4]: Tab labels simplified to single nouns: Picks, Events, Routes (Voice Rule 6)
- [Phase 4]: All user-facing "assets" replaced with "places" across HTML, config, filter model, explore view
- [Phase 4]: MUSE section reframed with visitor context: "From MUSE, the Nevada County Arts Council's print journal"
- [Phase 4]: Itinerary titles rewritten culture-forward: "Galleries, Gold Mines & Stage Lights" not "Arts & Nature: A Perfect Day"
- [Phase 4]: Nature experience retitled "State Parks & Trail Networks" with mining-history-forward framing
- [Phase 4]: Experience subtitles use venue-to-venue ranges for specificity (e.g., "Empire Mine to Malakoff Diggins")
- [Phase 4]: Connectors rewritten with street names (Spring, Broad, Mill, Idaho Maryland Rd) not scenic filler
- [Phase 4]: Chatbot uses functional register (knowledgeable local, not editorial) — direct, name-first, concise
- [Phase 4]: Platform name "Explore Nevada County" kept as-is; decision deferred to Diana/Eliza for Wednesday meeting
- [Phase 4]: Sub-page SEO title tags use real keywords (not development artifact text)
- [Phase 2.2]: Crazy Horse venue_name hardcoded (single-venue iCal feed)
- [Phase 2.2]: Squarespace ingest defaults venue_city to Nevada City (all current targets are NC venues)
- [Phase 2.2]: New venue categories: Bodhi Hive/Stardust Station/The Unchurch = Performing Arts, The Fern = Eat, Drink & Stay
- [Phase 2.2]: Parameterized Squarespace script serves multiple venues via --site-url/--source-name CLI args
- [Phase 2.2]: Event tags use keyword regex patterns with source-based defaults for venue sources
- [Phase 2.2]: Venue-specific dedup override: crazyhorse source wins for Crazy Horse Saloon events regardless of general priority
- [Phase 2.2]: Community form events get tag_confidence: manual (user-selected tags preserved as-is)
- [Phase 2.2]: is_family backward compat maintained: derived from family-kids tag, then legacy classifier fills gaps
- [Phase 2.2]: Extended source priority: trumba > gvda > libcal > kvmr > crazyhorse > goldenera > bodhihive > community > civicengage
- [Phase 2.2]: Tag/source filter values use prefix dispatch (tag:live-music, source:kvmr) in shared dropdown with optgroup sections
- [Phase 2.2]: normalizeEventCategoryFilter passes through tag:/source: prefixed values without normalization
- [Phase 2.2]: Community ingest in CI uses temp file for Google credentials (/tmp/gsa.json) with cleanup
- [Phase 8]: Dream board localStorage key: 'ncac-dreamboard', schema: { version: 1, places: [...], events: [...] }
- [Phase 8]: 30-item hard limit across places + events combined
- [Phase 8]: Event bookmarks keyed by title+date combo for dedup
- [Phase 8]: Bookmark button CSS injected via injectCSS() pattern (same as itinerary-view.js)
- [Phase 8]: Undo in toast uses model re-add/re-remove (no localStorage snapshot rollback)
- [Phase 8]: Bookmark delegation: body-level click handlers for .bookmark-btn and .event-bookmark-btn
- [Phase 8]: Trip page uses minimal script set (8 scripts) vs hub's 36+ -- only config, core-utils, dreamboard, tripbuilder, analytics
- [Phase 8]: Inline MapLibre map hidden when dream board empty, shown with gold pins when items exist
- [Phase 8]: "Make it mine" only appears on curated itineraries (id not starting with 'usr-')
- [Phase 8]: Badge CSS duplicated as inline style on subpages since dreamboard-view.js not loaded there
- [Phase 8]: Trip name rename uses prompt() for v1 simplicity (inline editing deferred)
- [Phase 8]: User trips schema: { version: 1, trips: [...], activeTrip: 'usr-...' } in 'ncac-user-trips' localStorage key
- [Phase 8]: URL encoding uses single-letter keys (t/d/s/a/m/r) + base64 with 1800 char safety limit
- [Phase 8]: Dream board context injected into last user message (not system prompt) to preserve Gemini prompt cache
- [Phase 8]: Pipe-delimited {{ITINERARY}} block format for LLM structured output (not JSON, ~15% malformation rate)
- [Phase 8]: Lenient ITINERARY parser: defaults time to 09:00, duration to 60min, skips unparseable lines
- [Phase 8]: saveUserTrip delegates to TripBuilderModel.saveTrip when available, falls back to direct localStorage
- [Phase 8]: Trip planning style cards conditionally shown only when dream board has >0 items
- [Phase 8]: User trip IDs prefixed with 'usr-' to distinguish from curated itineraries
- [Phase 8]: Finalized rendering generates inline HTML (not fixed-position overlay) for trip.html standalone page
- [Phase 8]: Share URL fallback uses textarea+execCommand('copy') for browsers without Clipboard API
- [Phase 8]: Shared trip deep links saved to localStorage immediately on decode for persistence
- [Phase 8]: Map visibility check includes both dream board items and trip stops
- [Phase 8]: ?chat=trip deep link handled by chat-controller.js init (no index-maplibre.js changes needed)
- [Phase 8]: trip.html loads 12 scripts total (was 8): added itinerary-model, itinerary-calendar, itinerary-view, corridor-map + Turf.js CDN
- [Phase 9]: Dark charcoal sidebar (#1f2937) replaced entirely with editorial cream/ink/gold palette — no dark theme preserved
- [Phase 9]: rawDataForEvents (unfiltered) preserved before .filter() so events.index.json matched_asset_idx values align correctly with buildVenueEventIndex() input
- [Phase 9]: Hours pill class names use hours-open/hours-closed/hours-unknown (not BEM hours-pill--open) matching detailView buildDetailMetaHTML output
- [Phase 9]: CulturalMapPhotoCarousel.init() reused for directory hamburger; cloneCategoryGrid() silently no-ops (no #categoryGrid in directory)
- [Phase 09]: history.pushState used for all meaningful directory state transitions — replaceState only for initial seed; ensures back/forward navigates real states
- [Phase 09]: collapseCardImmediate() must be the FIRST call in onSearch() and city filter pill handler — ordering is critical to prevent ghost active state before renderList() destroys DOM
- [Phase 09]: popstate handler registered inside loadData().then() so allData is populated for place-name lookup
- [Phase 09]: map.flyTo() guarded with map.loaded() check — deep links via QR codes may call expandCard() before MapLibre fires load event

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: KVMR + GVDA Event Source Ingestion (URGENT) — Mardi Gras and other major events missing from all 3 existing sources. KVMR iCal + GVDA Trumba JSON add broadest community coverage before Wed demo.
- Phase 06.1 inserted after Phase 6: Deep Analytics Instrumentation (URGENT) — Phase 6 covers basic interaction tracking but misses scroll depth, marker clicks, detail dwell time, itinerary engagement, and outbound click attribution. Adding these before Wednesday demo so first real traffic produces a rich story.
- Phase 03.1 inserted after Phase 3: Content Architecture & Demo Curation (URGENT) — Site has all plumbing (events, itineraries, chat, analytics) but content architecture and curation not demo-ready. Need to define single-page progressive disclosure vs. multi-page, curate featured content showing aggregation value (Stardust Station, Local Adventure Mama gaps), and structure demo experience for Wednesday committee presentation.
- Phase 9 added: Directory Page Polish — 26-item audit from 3-agent team review (UX analyst, visual design critic, functional QA). Covers header rebuild, sidebar redesign, stubbed hours/events features, interaction bugs, mobile UX fixes.
- Phase 02.2 inserted after Phase 02.1: Live Music & Venue Event Ingestion — Nevada County's live music scene is invisible on the site. 4 venues missing from asset data entirely (Bodhi Hive, Stardust Station, The Unchurch, The Fern), 2 existing venues have almost no events flowing (Crazy Horse, Golden Era). Ol' Republic permanently closed. Research via Perplexity identified 3 tiers: iCal (Crazy Horse), HTML scraping (Golden Era, Bodhi Hive, The Fern), community submission form (Stardust Station, The Unchurch). Also creates Live Music category/tag system and absorbs 4 related event todos.

### Pending Todos

9 todos in `.planning/todos/pending/`. Triaged 2026-02-18 (5 moved to done/).

#### Absorbed by Phases (will be addressed during phase execution)

**Phase 7 (Demand Signal Reporting):**
- analytics-mockup-report — demo preview of reporting capability

**Phase 9 (Directory Page Redesign):**
- directory-map-hover-tooltips-missing-on-nearby-markers — directory map bug (PARTIAL: code exists, hover may not fire at zoom 17)
- deduplicate-same-category-entries-in-data-json — data quality: 3 duplicate assets (confirmed: Avanguardia, South Pine, Pour House)
- fix-3-assets-with-incorrect-map-coordinates — data quality: 3 coordinate anomalies (confirmed: Coburn Music, Alan Thiesen Trail, Sawtooth Trailhead)

#### Standalone (Critical Path)
- visual-consistency-sweep — magazine CSS conflicts, blocks polish
- homepage-section-reorder — post-01.1 hierarchy fix (pitch first, tools second)

#### Deferred (Research / Strategic — no current phase)
- two-mode-architecture — strategic architecture decision, post-MVP
- equity-data-audit — community listening required, post-MVP
- career-pathways-section — new content vertical, post-MVP

### Ad-Hoc Research

Research artifacts outside the phase directory structure. Consult these when planning related work:

| Directory | Contents | When to consult |
|-----------|----------|-----------------|
| `.planning/todo-research/events-ux-brief.md` | Tonight filter spec, Joss Stone dedup root cause, event images (already done) | Planning any events module work |
| `.planning/todo-research/navigation-brief.md` | 25+ demo deep link URLs, favorites module design, homepage reorder spec | Planning navigation/deep link/favorites work |
| `.planning/todo-research/demo-prep-brief.md` | Analytics mockup data points, CSS conflict audit, itinerary "Show on Map" spec | Planning analytics mockup or itinerary UX |
| `.planning/todo-research/content-arch-brief.md` | Split-pane directory design, trip builder data model + architecture | Planning Phase 09 (Directory Redesign) or Phase 08 |
| `.planning/brainstorm/trip-builder/` | 4-agent brainstorm: UX flows, technical architecture, competitive analysis, editorial design | Planning Phase 08 (AI Trip Builder) |
| `.planning/todo-research/audit-*.md` | GSD process audit: expectations, actual state, recommendations | Understanding organizational decisions |
| `.planning/roundtable/` | 6-part stakeholder roundtable simulation (tourist, local, committee, editor, advocate, synthesis) | Understanding committee priorities and demo strategy |
| `.planning/analysis/` | UX audit, tech feasibility, competitive gap, demo strategy, prioritized action plan | Understanding pre-01.1 design decisions |

### Blockers/Concerns

- ~~MAP DOES NOT RENDER~~ RESOLVED (commit `48a9486`)
- **Wednesday Feb 18 deadline** — Committee presentation at Gold Miners Inn, 12:00-1:30 PM. Must have working map + events.
- ~~Event coverage gaps~~ RESOLVED (Phase 2.1 adds KVMR + GVDA, 176 total events)
- Phase 5 (AI Concierge): Gemini free tier may not cover projected token usage
- Phase 5 (AI Concierge): data.json needs status/last_verified fields

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Fix Joss Stone cross-source dedup — venue-aware title threshold | 2026-02-17 | d4bd954 | [1-fix-joss-stone-cross-source-dedup-venue-](./quick/1-fix-joss-stone-cross-source-dedup-venue-/) |
| 2 | Tonight filter chip for events — isEventTonight utility + HTML chip | 2026-02-17 | c207486 | [2-tonight-filter](./quick/2-tonight-filter/) |

## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 09-02-PLAN.md (directory deep link + history system: pushState/popstate, toast, breadcrumb).
Resume with: Phase 09 Plan 03: Card redesign (richer card UI, photo treatment, expanded detail layout)
Key artifacts: .planning/phases/09-directory-page-redesign/09-02-SUMMARY.md, website/cultural-map-redesign-stitch-lab/directory.html
