# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Drive people to downtowns, local businesses, performance venues, and cultural spaces through an editorial-quality interactive experience that feels like MUSE magazine.
**Current focus:** Demo-critical todo sprint — Tonight filter, deep link bookmarks, analytics mockup. Deadline Wed Feb 18 noon.

## Current Position

Phase: Post-01.1 — demo-critical todo sprint
Plan: N/A (between phases)
Status: All planned phases (01.1 through 06.1) COMPLETE. 15 todos pending, 4 research briefs ready.
Last activity: 2026-02-17 -- Quick task 2: Tonight filter chip added to events section.

Progress: [██████████████████░░] 90% overall

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
- Total plans completed: 19 (Phase 2: 3, Phase 2.1: 2, Phase 2.2: 3, Phase 3: 2, Phase 4: 3, Phase 5: 2, Phase 6: 1, Phase 6.1: 1, Phase 3.1: 2 — Phase 1 plans obsolete)
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

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: KVMR + GVDA Event Source Ingestion (URGENT) — Mardi Gras and other major events missing from all 3 existing sources. KVMR iCal + GVDA Trumba JSON add broadest community coverage before Wed demo.
- Phase 06.1 inserted after Phase 6: Deep Analytics Instrumentation (URGENT) — Phase 6 covers basic interaction tracking but misses scroll depth, marker clicks, detail dwell time, itinerary engagement, and outbound click attribution. Adding these before Wednesday demo so first real traffic produces a rich story.
- Phase 03.1 inserted after Phase 3: Content Architecture & Demo Curation (URGENT) — Site has all plumbing (events, itineraries, chat, analytics) but content architecture and curation not demo-ready. Need to define single-page progressive disclosure vs. multi-page, curate featured content showing aggregation value (Stardust Station, Local Adventure Mama gaps), and structure demo experience for Wednesday committee presentation.
- Phase 02.2 inserted after Phase 02.1: Live Music & Venue Event Ingestion — Nevada County's live music scene is invisible on the site. 4 venues missing from asset data entirely (Bodhi Hive, Stardust Station, The Unchurch, The Fern), 2 existing venues have almost no events flowing (Crazy Horse, Golden Era). Ol' Republic permanently closed. Research via Perplexity identified 3 tiers: iCal (Crazy Horse), HTML scraping (Golden Era, Bodhi Hive, The Fern), community submission form (Stardust Station, The Unchurch). Also creates Live Music category/tag system and absorbs 4 related event todos.

### Pending Todos

15 todos from stakeholder roundtable analysis (`.planning/todos/pending/`).

#### Pre-Research Available

4 research briefs in `.planning/todo-research/`:
- `events-ux-brief.md` — Tonight filter (HIGH, 30min), Joss Stone dedup (LOW, 10min), event images (ALREADY DONE)
- `navigation-brief.md` — Deep link bookmarks (CRITICAL, verify-only), localStorage favorites (MEDIUM, 3-4hr), homepage reorder (MEDIUM, 1hr)
- `demo-prep-brief.md` — Analytics mockup report (HIGH, new HTML page), visual consistency sweep (LOW, 25 lines), itinerary "Show on Map" UX (LOW, 35 lines)
- `content-arch-brief.md` — Split-pane directory (LOW, defer to Phase 07), trip builder (HIGH, defer to Phase 08)

These briefs are GSD RESEARCH.md format — consume directly when running /gsd:plan-phase.

### Ad-Hoc Research

Research artifacts outside the phase directory structure. Consult these when planning related work:

| Directory | Contents | When to consult |
|-----------|----------|-----------------|
| `.planning/todo-research/events-ux-brief.md` | Tonight filter spec, Joss Stone dedup root cause, event images (already done) | Planning any events module work |
| `.planning/todo-research/navigation-brief.md` | 25+ demo deep link URLs, favorites module design, homepage reorder spec | Planning navigation/deep link/favorites work |
| `.planning/todo-research/demo-prep-brief.md` | Analytics mockup data points, CSS conflict audit, itinerary "Show on Map" spec | Planning analytics mockup or itinerary UX |
| `.planning/todo-research/content-arch-brief.md` | Split-pane directory design, trip builder data model + architecture | Planning explore redesign or trip builder (Phase 07-08) |
| `.planning/todo-research/audit-*.md` | GSD process audit: expectations, actual state, recommendations | Understanding organizational decisions |
| `.planning/roundtable/` | 6-part stakeholder roundtable simulation (tourist, local, committee, editor, advocate, synthesis) | Understanding committee priorities and demo strategy |
| `.planning/analysis/` | UX audit, tech feasibility, competitive gap, demo strategy, prioritized action plan | Understanding pre-01.1 design decisions |

#### Demo-Critical (Wave 2 — before Feb 18)
1. Deep link bookmark cheat sheet (verify + document, no code)
2. "Tonight" prominent filter (4 files, ~22 lines)
3. Analytics mockup report (new standalone HTML, ~350 lines)

#### Quick Wins (Wave 3)
4. Joss Stone dedup (1 file, ~5 lines in merge_events.py)
5. Homepage section reorder (HTML-only, move map section up)
6. Visual consistency sweep (CSS cleanup, ~25 lines)

#### Feature Development (Wave 4)
7. localStorage favorites (new module + 5 file touches, ~260 lines)
8. Itinerary "Show on Map" UX (2 files, ~35 lines)
9. Event images tag expansion (1 file, ~8 lines — cosmetic only)

#### Deferred (Wave 5 — post-demo)
10. Split-pane directory → Phase 07 (2-3 sessions)
11. In-house trip builder → Phase 08 (4-6 sessions)

#### Parked (documented, no action)
- Two-mode architecture, Equity data audit, Career pathways, VRBO integration, MindTrip gap analysis

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

Last session: 2026-02-17
Stopped at: Quick task 2 complete. Tonight filter chip added. 14 todos remaining.
Resume with: /gsd:progress (shows accurate state) or /gsd:check-todos (shows prioritized backlog)
Key artifacts: .planning/todo-research/ (4 research briefs + 3 audit docs)
