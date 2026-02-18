# Execution Order

Produced by 4-agent strategic roundtable (2026-02-18): strategist (PM), design-lead, tech-lead, devil's advocate.

Context: Committee demo completed Feb 18. Post-demo priority stack oriented toward maintaining momentum, proving ongoing value, and driving the core mission (drive people to downtowns, cultural spaces, businesses).

*Devil's advocate refinements incorporated. Key reversal: chrome/nav is NOT a gating dependency for trip or map work.*

---

## Tier 1: Now (quick wins, no dependencies, do today)

### 1. Homepage sticky nav fix
- **What:** Top nav disappears past MUSE section scroll breakpoint — `position:sticky` inside a grid row context breaks stickiness
- **Effort:** 15 minutes
- **Risk:** Low — isolated CSS change
- **Files:** `index-maplibre-hero-intent-stitch-frontend-design-pass.css`

### 2. Dream board bug — reproduce + fix (UPGRADED to P1)
- **What:** "Save to Trip" button does NOT persist places/venues to `ncac-dreamboard` localStorage. Events save; places/venues broken.
- **Why P1 (devil's revised position):** The bookmark button appears on THREE primary hub surfaces — map detail panel, directory cards, and map tooltips. Every user who interacts with a marker sees it. If "Save to Trip" shows saved but doesn't persist, that's a trust-eroding lie on the main page — not a hidden feature bug.
- **Effort:** 10 min repro check → 15 min fix if hub-page race condition, 1-2 hrs if sub-page delegation issue
- **How to repro:** Open detail panel for a place/venue (NOT an event) from the map or directory, click "Save to Trip," check `ncac-dreamboard` key in localStorage DevTools. If the key is absent or `places: []`, bug is confirmed.
- **Risk:** Low — dreamboard model and bindings are infrastructure that survives any Stitch redesign
- **Files:** `index-maplibre-dreamboard-model.js`, `index-maplibre-detail-view.js`, `index-maplibre-bindings.js`

### 3. Coordinate fixes only — dedup todo CLOSED AS INVALID
- **What:** Fix 3 wrong coordinates: Alan Thiesen Trail (→ Southern CA near Fresno), Sawtooth Trailhead (→ Pacific Ocean), Coburn Music (→ slightly north of county)
- **Verify first:** STATE.md Phase 9-04 may have already fixed Alan Thiesen + Sawtooth. Check `data.json` entries before executing.
- **Effort:** 15 minutes if still needed — pure data edit
- **Risk:** Low
- **DEDUP TODO (#8) CLOSED AS INVALID:** The 3 "duplicates" are multi-location businesses with different addresses and coordinates. Avanguardia Winery (winery + downtown tasting room), South Pine Cafe (Nevada City + Grass Valley), The Pour House (Truckee + Grass Valley). Avanguardia appears twice in `experiences.json` as intentional separate stops in a curated route — deleting would remove real venues AND break an experience. Do not execute. Close todo as invalid.

### 4. Map section quick wins
- **What:** Remove "687 places" text from map header. Remove non-functional "Expand map" button. Remove bottom stats bar ("Built with MapLibre GL JS, Turf.js, GSAP"). Pure HTML deletions.
- **Effort:** 30 minutes — verify expand button removal doesn't throw null querySelector error, then ship
- **Risk:** Zero
- **Files:** `index-maplibre-hero-intent-stitch-frontend-design-pass.html`

### 5. Sub-page nav copy (same session as #4)
- **What:** Copy-paste `.mast-inner` nav shell to events.html, itineraries.html, directory.html, trip.html
- **Why same session:** "New kitchen, old bathroom" problem — raising homepage quality and leaving sub-pages looking worse is actively harmful. After map quick wins ship, sub-pages follow immediately.
- **Effort:** ~1 hour — additive HTML only, no JS changes
- **Risk:** Low — additive only

### 6. Close analytics-mockup-report (#4) — SUPERSEDED
- **What:** Move `2026-02-17-analytics-mockup-report.md` to `todos/done/`
- **Why:** Absorbed into demand signal report (#7 below). One deliverable with "at scale" projection serves both purposes.
- **Effort:** 0 minutes
- **Risk:** None

---

## Tier 2: Next (high value, user input needed)

### 7. Demand signal report — presentation format (#10, absorbs #4)
- **What:** February 2026 pipeline report exists (`reports/2026-02-demand-report.md`) with real Umami + Supabase data. Needs: (a) presentation-ready format, (b) a "projected at scale" section showing what the report looks like at 500 visitors/month. The "at scale" projection absorbs analytics-mockup-report — one deliverable, both purposes.
- **Why next:** Highest committee value. The data is small (5 visitors) but the narrative is powerful: "No other small-town DMO generates this kind of demand intelligence." Early-signal framing + at-scale projection avoids the underwhelm problem.
- **Effort:** 1-2 days depending on format
- **Blocker:** User must decide format: (a) Pandoc PDF of existing markdown, (b) branded one-pager with Stitch design pass, (c) slide deck, (d) email summary. Recommendation: Pandoc PDF first, then branded one-pager.
- **Risk:** Low technical. Frame as "early signals from soft launch" — NOT "our analytics."
- **Files:** `reports/2026-02-demand-report.md`, `scripts/generate-demand-report.mjs`

---

## Tier 3: After (design-heavy, next sprint)

### 8. Trip builder UX fixes (bugs only)
- **What:** Add concierge loading animation (typing dots while awaiting response). Relabel or reroute "Start exploring" CTA — it's a working `<a>` tag pointing to homepage top, this is a feature request not a bug (destination needs to be decided: open concierge? scroll to map? go to directory?). "My Trip" vs named trip naming — UX copy fix.
- **Effort:** 2-4 hours total
- **Risk:** Low — CSS animation + link target change + copy edit
- **Note:** NOT blocked by chrome/nav. These are code-only fixes.
- **Files:** `index-maplibre-chat-controller.js`, `trip.html`

### 9. Trip page visual redesign (Stitch pass)
- **What:** Full Stitch redesign of trip.html — editorial aesthetic, cream/ink/gold palette, section hierarchy. Rework AI concierge style cards (smaller, more editorial). Improve dream board empty state guidance. Loosen itinerary output verbosity (system prompt tuning).
- **Effort:** 1-2 days
- **Risk:** Medium — system prompt changes can affect response quality
- **Note:** NOT blocked by chrome/nav. Trip page gets its own nav shell in Tier 1 (#3). This is visual polish of the page body, not the header.
- **Files:** `trip.html`, `index-maplibre-chat-controller.js`, `api/chat.js`

### 10. Map section redesign remainder
- **What:** Reorder homepage sections (editorial pitch before map tool). Redesign or absorb Routes & Experiences section (into map legend/filter overlay, or compact visual restyle). Add SVG marker icons to legend. Fix directory page hover tooltip wiring at zoom 17.
- **Effort:** 2-3 days
- **Risk:** Medium — moving HTML sections can break scroll sentinels, IntersectionObserver zones, GSAP animations. Test carefully.
- **Note:** NOT blocked by chrome/nav. Map section is on the hub page which already has nav. Directory tooltip fix is isolated JS wiring.
- **Files:** `.html`, `.css`, `index-maplibre-map-render-controller.js`, `index-maplibre-bindings.js`

### 11. CSS token conflict audit (opportunistic during #9/#10)
- **What:** Legacy base styles vs Codex magazine layout tokens (`--cream`, `--ink`, `--gold`). Every `var(--gold)` consumer has a fallback value — blast radius near zero.
- **Why here:** NOT a blocker. Fix opportunistically during other Stitch CSS work — ~5 line change, not scheduled.
- **Footer consistency:** Footer update (mirror top nav) can happen here or alongside #3 sub-page nav work.

---

## Tier 4: Deferred (post-MVP)

### 12. Weekly Pulse email delivery (#5 remainder)
- **What:** Build weekly cron job (GitHub Actions), integrate Resend/SendGrid, implement CAN-SPAM unsubscribe
- **Why deferred:** Capture pipeline deployed. Send mechanism premature with 5 visitors. If committee asks for proof, 1-hour sample email mockup suffices.
- **Revisit when:** 50+ subscribers captured

### 13. Equity data audit (#6) — 2027 / Phase 5
- **Why deferred:** Community engagement problem, not a code problem. Requires listening sessions.
- **Insurance now:** Write a 30-minute 1-page talking-points document in case committee asks about Indigenous representation. "Translation widget addresses language access. Data representation requires community partnerships we're planning for Phase 5."

### 14. Two-mode architecture (#7) — 2027 / Phase 5
- **Why deferred:** Full architecture change, 2-3 weeks engineering. Current site serves primary audience well.

---

## Dependencies Map

```
#1 (sticky nav fix) ──── independent, 15 min, do first
#2 (map quick wins) ─┬── independent, same session
#3 (sub-page nav) ───┘── follows #2 in same session
#4 (data fixes) ──────── independent, verify status first
#5 (close mockup todo) ── 0 effort, anytime
#6 (dream board timebox) ─ independent, 15 min repro check

#7 (demand signal) ──── independent, needs format decision

#8 (trip UX fixes) ──── independent, NOT blocked by nav
#9 (trip visual) ─────── independent, NOT blocked by nav
#10 (map redesign) ───── independent, NOT blocked by nav

#9 and #10 can run in parallel
```

**Key reversal from initial strategist synthesis:** Chrome/nav is NOT a gating dependency for trip page or map redesign.
- Trip page gets its own nav shell in Tier 1 (#3 above)
- Map redesign is on the hub which already has nav
- The false dependency was artificially inflating chrome/nav's priority and making it block 5+ days of other work

**Trip-concierge umbrella split** (devil's advocate challenge, accepted):
- Dream board bug → isolated timebox (#6), not blocking visual redesign
- Trip UX fixes → code-only (#8), ships independently
- Trip visual redesign → Stitch pass (#9), design iteration

---

## Blockers / Open Questions

1. **Format decision (#7 demand signal):** Pandoc PDF (trivial), branded one-pager (1-2 days), slide deck, or email? Recommendation: Pandoc PDF first.

2. **Data fixes (#4) — verify status:** Check `data.json` before executing. Alan Thiesen + Sawtooth may already be fixed per Phase 9-04.

3. **"Start exploring" destination (#8):** The CTA is a working link — it needs a deliberate destination. Options: (a) open concierge with planning prompt, (b) scroll to map section, (c) go to directory.html. User must decide.

4. **Demand signal framing (#7):** With only 5 visitors, frame as "early signals from soft launch — proof the intelligence infrastructure works" not "February analytics."

5. **Next committee touchpoint:** When is the next meeting? Determines urgency of #7 (demand signal format).

---

## Summary Table

| Priority | Todo | Effort | Risk |
|----------|------|--------|------|
| NOW | Homepage sticky nav fix | 15 min | Low |
| NOW | Map quick wins (text/button removal) | 30 min | Zero |
| NOW | Sub-page nav copy | 1 hr | Low |
| NOW | Data fixes (verify first) | 45 min | Low |
| NOW | Close analytics-mockup todo | 0 min | None |
| NOW | Dream board bug timebox | 15 min → 2-4 hrs if confirmed | Low |
| NEXT | Demand signal report + at-scale projection | 1-2 days | Low |
| AFTER | Trip UX fixes (animation, relabels) | 2-4 hrs | Low |
| AFTER | Trip page visual redesign (Stitch) | 1-2 days | Medium |
| AFTER | Map section redesign remainder | 2-3 days | Medium |
| AFTER | CSS token conflict (opportunistic) | 5 lines | Low |
| DEFERRED | Weekly Pulse email delivery | 2-3 days | Low |
| DEFERRED | Equity data audit | Community work | N/A |
| DEFERRED | Two-mode architecture | 2-3 weeks | High |
