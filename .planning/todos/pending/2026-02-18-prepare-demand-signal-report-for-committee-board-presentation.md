---
created: 2026-02-18T05:34:32.453Z
title: Prepare demand signal report for committee board presentation
area: demo-prep
priority: high
files:
  - reports/2026-02-demand-report.md
  - reports/2026-02-demand-signals.json
  - scripts/demand-signal-pull.mjs
  - scripts/generate-demand-report.mjs
  - .github/workflows/demand-signal-report.yml
  - .planning/phases/07-demand-signal-reporting/COMMITTEE-REPORT-TEMPLATE.md
  - .planning/phases/07-demand-signal-reporting/SAMPLE-REPORT-FEBRUARY-2026.md
  - .planning/phases/07-demand-signal-reporting/REPORT-DELIVERY-GUIDE.md
  - .planning/phases/07-demand-signal-reporting/PIPELINE-ARCHITECTURE.md
  - .planning/phases/07-demand-signal-reporting/METRICS-DATASOURCE-MAPPING.md
  - .planning/phases/07-demand-signal-reporting/POC-INTERNAL-BRIEF.md
  - .planning/phases/07-demand-signal-reporting/07-01-SUMMARY.md
  - .planning/phases/07-demand-signal-reporting/07-02-SUMMARY.md
  - .planning/roundtable/06-synthesis.md
  - .planning/roundtable/03-org-advocate.md
---

## Problem

Phase 7 (Demand Signal Reporting) just shipped the full pipeline: instrumentation (07-01), data pull + classification (07-02), and committee report generator (07-03). The first real February 2026 report exists at `reports/2026-02-demand-report.md` with live Umami + Supabase data.

But it's raw pipeline output — markdown tables and technical sections. The committee/board needs this turned into something they can actually understand and act on. Questions to answer:

1. **Format:** Do they want a PDF handout? A slide deck? An email summary? A dashboard walkthrough?
2. **Framing:** The data is small right now (5 visitors, 73 events, 5 chat queries) because the site just launched. How do you present early-stage data without it looking underwhelming?
3. **Story:** What's the narrative? "Here's proof the platform generates intelligence no other small-town DMO has" vs. "Here's what visitors are looking for" vs. "Here's which businesses are getting referrals"
4. **Cadence:** Monthly automated reports go out via GitHub Actions. Who receives them? In what form? Does someone need to interpret them or do they stand alone?
5. **Next meeting agenda item:** How to position this in Diana/Eliza's committee meeting flow

## What exists (all the pieces are built)

### Pipeline scripts (zero npm deps, just run them)
- `scripts/demand-signal-pull.mjs` — queries Umami Cloud API + Supabase REST, classifies 7 intent types, scores venue attribution via 4-tier hierarchy, outputs unified JSON
- `scripts/generate-demand-report.mjs` — reads pipeline JSON, outputs markdown committee report
- `.github/workflows/demand-signal-report.yml` — monthly cron (1st of month) + manual trigger

### First real report
- `reports/2026-02-demand-signals.json` — raw pipeline JSON (18KB)
- `reports/2026-02-demand-report.md` — 170-line markdown with all sections filled from live data

### Key findings from February 2026 report
- 5 visitors, 95 page views, 73 engagement events, 9.1% bounce rate
- Odd Fellows Hall #1 referral (200 score, 2 event ticket click-throughs)
- Dining dominates chatbot intent (50%), followed by lodging (25%) and same-day planning (25%)
- 3 visitor intent clusters: trip_researcher (HIGH), tonight_planner (HIGH), casual_browser (LOW)
- Cirino's, Watershed, Holbrooke Hotel — most recommended by AI concierge
- Zero-result searches: none (good sign or low volume)

### Planning docs (context for whoever picks this up)
- `COMMITTEE-REPORT-TEMPLATE.md` — the template structure the report follows
- `SAMPLE-REPORT-FEBRUARY-2026.md` — what a mature report should look like
- `REPORT-DELIVERY-GUIDE.md` — how to deliver reports (PDF conversion, email, etc.)
- `PIPELINE-ARCHITECTURE.md` — technical architecture of the pipeline
- `METRICS-DATASOURCE-MAPPING.md` — which metrics come from which data sources
- `POC-INTERNAL-BRIEF.md` — the proof-of-concept that validated the approach

### Stakeholder input (from roundtable simulation)
- Org advocate: "Analytics is the #1 priority. It transforms the platform from a utility into an intelligence tool."
- Synthesizer: "Show a mockup of a monthly demand signal report. Make it concrete."

## Solution

TBD — depends on committee feedback. Options to consider:

1. **Pandoc PDF** of the markdown report (already supported: `pandoc reports/2026-02-demand-report.md -o report.pdf`)
2. **Executive summary email** — 3-4 bullet points from the report, sent monthly
3. **Dashboard walkthrough** — show the Umami share URL (https://cloud.umami.is/share/875bmvTJ7Hd2oLAx) live in a meeting
4. **Slide deck** — 5-slide summary pulling key charts/tables from the report
5. **"State of the Platform" one-pager** — designed PDF with brand colors, hand-curated narrative

The analytics-mockup-report todo (2026-02-17) is now partially superseded since real data exists. Could merge or close that one.

## Known constraints
- Umami bearer token expires quarterly — needs manual refresh from browser login
- Small sample size (5 visitors) makes percentages misleading — frame as "early signals" not "trends"
- Page view breakdown shows dates not URLs (Umami Cloud API limitation on free tier)
- Venue names in attribution sometimes include full addresses (data normalization needed)
