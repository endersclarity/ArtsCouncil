---
created: 2026-02-17T00:00:00.000Z
completed: 2026-02-18T00:00:00.000Z
title: "Your Weekly Pulse" — personalized interest-based digest emails
area: product
priority: medium
files:
  - .planning/roundtable/04-culture-forward.md
  - .planning/roundtable/06-synthesis.md
  - docs/analysis/culture-forward-extraction.md
---

## Problem

The platform has 67 education-relevant venues and 128 events (44% of all events) matching workshop/class/learning keywords — but zero discoverability for them. More broadly, users have no way to say "I care about live music" or "I want workshops" and get ongoing notifications. The email capture form collects an address and does nothing with it (Apps Script URL is a placeholder).

The original "Career Pathways / Learn & Create" framing was wrong — stakeholder analysis (Feb 18 team research) showed nobody in the committee room asked for a career portal, it serves a third audience (workforce) that doesn't overlap with visitors or locals, and the Career Pathways Subcommittee isn't engaged with the platform.

## Solution: "Your Weekly Pulse"

Personalized weekly digest emails, written by Gemini in MUSE editorial voice, tailored to subscriber interests. No new pages needed. Education/workshop content becomes one interest category among many.

## What was built (Feb 18, 2026)

**Capture pipeline — COMPLETE:**

- [x] **Expanded email signup** — 6 interest chips (Live Music, Galleries & Studios, Food & Wine, Family & Kids, Workshops & Classes, Outdoor & Trails) added above email form. Form moved from mid-page to footer.
- [x] **Rich colophon** — replaced bare copyright line with brand, nav links (Explore / Events / Itineraries / Directory / My Trip), copyright + physical address (141 E Main St, Nevada City, CA 95959 for future CAN-SPAM).
- [x] **Supabase `subscribers` table** — `email`, `interests[]`, `status`, `unsubscribe_token`, `source`, RLS enabled, anon insert-only policy. Created via Management API (PAT stored in `.env` as `SUPABASE_PAT`).
- [x] **`api/subscribe.js` serverless function** — validates email + interest whitelist, inserts to Supabase, handles duplicates gracefully. Deployed to Vercel, tested end-to-end.
- [x] **Supabase MCP configured** — `mcp-client` config now has correct project ref + PAT. `python mcp_client.py tools supabase` works.

**Files changed:**
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html`
- `website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.css`
- `website/cultural-map-redesign-stitch-lab/index-maplibre-email-capture.js`
- `website/cultural-map-redesign-stitch-lab/api/subscribe.js` (NEW)
- `website/cultural-map-redesign-stitch-lab/vercel.json`
- `.env` (SUPABASE_PAT added)
- `~/.claude/skills/mcp-client/references/mcp-config.json` (supabase entry fixed)

## Remaining / deferred

- [ ] **Weekly cron job** (GitHub Actions) — reads subscribers, filters events by interests, calls Gemini, sends digest via email service
- [ ] **Email sending service** — Resend or SendGrid free tier (deferred — Gmail API possible but overkill for small list)
- [ ] **Event tag enrichment** — `is_educational` flag on events model for better matching
- [ ] **CAN-SPAM unsubscribe** — `api/unsubscribe.js` endpoint using `unsubscribe_token`, one-click link in every email

## Strategic value

- Committee pitch: "We don't just show what's happening — we bring people back weekly with content tailored to their interests. No other small-town DMO does this."
- Culture Forward: Pillar 2 score improves because workshop/education events reach interested subscribers — without building a career portal
- Grant narrative: "Personalized AI-driven cultural programming notifications"
- Sidesteps tourist-vs-local identity tension — both audiences self-select interests

## Research artifacts

Team research session (Feb 18, 3-agent "learn-create-research" team):
- data-auditor: 67 edu venues, 128 edu events (44%), Curious Forge = 21 workshops
- stakeholder-analyst: Career portal wrong audience/timing, nobody asked for it, 2027 at earliest
- site-architect: 80% infrastructure exists, main gaps are subscribers table + email service + cron

---

## Roundtable Findings (2026-02-18)

See `.planning/EXECUTION-ORDER.md` for full ranked stack. This is Tier 4 (Deferred).

**Deferral rationale:** Send mechanism is premature with 5 visitors and an unknown subscriber count. The capture pipeline is already deployed and collecting. Pick this up when the subscriber list justifies the infrastructure investment.

**Revisit trigger:** 50+ subscribers captured. Check Supabase `subscribers` table: `SELECT COUNT(*) FROM subscribers WHERE status = 'active'`.

**If committee asks for proof before then:** A 1-hour sample email mockup (static HTML in MUSE editorial voice, showing what a personalized digest looks like) is sufficient proof-of-concept without building the full send pipeline.
