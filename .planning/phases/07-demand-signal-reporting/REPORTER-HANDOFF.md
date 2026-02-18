# Phase 7 Reporter: Complete Handoff

**Status:** ✅ Task complete. Committee report format fully designed.

**Date:** February 18, 2026
**Reporter:** Claude Code (Haiku 4.5)
**Team:** Phase 7 (Demand Signal Reporting)

---

## What Was Delivered

### 1. COMMITTEE-REPORT-TEMPLATE.md
**Purpose:** Reusable markdown template for monthly reports
**Contents:**
- Executive summary with KPI comparison (month-over-month)
- "What Visitors Wanted" section (demand signals ranked)
- Business Engagement Ranking table
- AI Concierge metrics & insights
- Page traffic breakdown
- Feature usage analysis
- Trends & behavioral patterns
- Actionable recommendations
- Technical notes & measurement gaps

**How to use:** Fill in the bracketed sections with actual data each month. The structure is fixed; the metrics are placeholders.

**Audience:** Non-technical committee members (high school grad reading level assumed).

---

### 2. METRICS-DATASOURCE-MAPPING.md
**Purpose:** Technical reference for data scientists/pipelines engineers
**Contents:**
- Exact API calls for every metric (Umami endpoints, Supabase queries)
- Calculation formulas for derived metrics
- Known data gaps and their impact
- Full automation pseudocode (Node.js)
- Month-over-month comparison logic
- Visitor segmentation/clustering inference

**How to use:** Use this to build the automated data pull pipeline. Every metric in the committee report traces back to an entry in this table.

**Audience:** Technical team building the reporting pipeline.

---

### 3. SAMPLE-REPORT-FEBRUARY-2026.md
**Purpose:** Real, filled-in example report using POC swarm data
**Contents:**
- Demonstrates what the committee will actually see
- Uses all 68 analytics events from 5-visitor swarm as examples
- Shows 3 direct business referrals (Spring Street Swing Out, VRBO, Empire Mine)
- Real case study (Hiker → Art Collector journey)
- Identifies critical measurement gaps (chatbot deep links)
- Provides concrete next-month actions

**How to use:** Use as a template for April/May reports. Shows format + tone + level of detail.

**Audience:** Committee members, product team, stakeholders.

---

### 4. REPORT-DELIVERY-GUIDE.md
**Purpose:** Implementation guide for PDF generation & distribution
**Contents:**
- Three PDF conversion options (Pandoc, markdown-pdf, browser print)
- Recommended approach: Pandoc + LaTeX template
- Automated pipeline setup (Node.js + shell script)
- Cron job scheduling for monthly automation
- Committee meeting presentation notes
- Troubleshooting guide
- File structure & archive strategy

**How to use:** Follow the "Recommended Approach" section to set up Pandoc. Use the Node.js script to automate monthly data pulls. Schedule with cron for 1st of month at 6am.

**Audience:** DevOps/automation engineer, whoever maintains the monthly reporting workflow.

---

## Design Principles

1. **Non-technical committee members are the primary audience.** No jargon. Every metric has a plain-English interpretation.

2. **Data lineage is explicit.** Every number in the report traces back to a specific API call or calculation. See METRICS-DATASOURCE-MAPPING for the chain.

3. **Business impact comes first.** The "Business Engagement Ranking" table is the second section (after metrics). Committee's #1 question is "Which businesses got traffic?"

4. **Measurement gaps are flagged, not hidden.** Report calls out what we can't measure (chatbot deep links, directory interactions, itinerary engagement). This drives Phase 6 priorities.

5. **One-page principle.** Template is designed for 1-2 pages. Executive summary + top 3 demand signals + business ranking fit above the fold.

6. **Actionable recommendations.** Every trend/pattern comes with a specific "What to do about it" recommendation (not just "here are the stats").

---

## Integration Points

### For Phase 6 (Instrumenter)
Read: METRICS-DATASOURCE-MAPPING.md, "Known Measurement Gaps"

**Critical gaps to close:**
1. Chatbot deep link clicks (blocking — we can't measure if AI drives conversions)
2. Directory page interactions
3. Itinerary engagement
4. Session-level ID on all events

Priority: Chatbot deep links first (highest impact).

### For Phase 6 (Pipeline)
Read: METRICS-DATASOURCE-MAPPING.md, "Data Collection" section

**Schema requirements:**
1. Add `intent` field to chat_logs (pre-classified: dining, events, lodging, trip_planning, other)
2. Add `session_id` to all Umami custom events (enables journey reconstruction)

These enable more sophisticated analysis in future months.

### For Committee
Read: SAMPLE-REPORT-FEBRUARY-2026.md

This is what you'll see every month starting in April (for February data). The format is fixed, the metrics change.

---

## Next Steps

### Immediate (This Week)
1. [ ] **Instrumenter:** Review instrumentation gaps in METRICS-DATASOURCE-MAPPING
2. [ ] **Pipeline:** Review schema requirements (intent field, session_id)
3. [ ] **Team lead:** Assign resources to close gaps

### Short-term (Next 2 Weeks)
1. [ ] **Instrumenter:** Implement chatbot deep link tracking (Phase 6 priority #1)
2. [ ] **Pipeline:** Add intent classification to chat_logs
3. [ ] **Pipeline:** Add session_id to Umami events

### Medium-term (February → April)
1. [ ] Build automated data pull script (see REPORT-DELIVERY-GUIDE)
2. [ ] Set up Pandoc + LaTeX template
3. [ ] Test full pipeline with January data
4. [ ] Schedule cron job for monthly automation

### Production (April 1)
- [ ] Generate first monthly report for March 2026 data
- [ ] Committee sees the new format at April meeting
- [ ] Establish feedback loop for refinements

---

## Key Decisions (Don't Revisit)

1. **Report is monthly, not real-time.** Monthly cadence gives time for data aggregation + human review before distribution.

2. **Pandoc + LaTeX is the conversion method.** Offline, professional, automatable. No Vercel dependencies.

3. **"Business Engagement Ranking" is the central table.** This is what the committee cares about most.

4. **Measurement gaps are explicitly called out.** This drives Phase 6 priorities and sets expectations (we can't measure chatbot conversions yet).

5. **One-page principle.** Longer than 2 pages and committee members won't read it. Every word must earn its space.

---

## Files Created

All files are in `.planning/phases/07-demand-signal-reporting/`:

| File | Audience | Purpose |
|------|----------|---------|
| COMMITTEE-REPORT-TEMPLATE.md | Data analysts, product team | Monthly report template |
| METRICS-DATASOURCE-MAPPING.md | Engineers, analysts | Technical data reference |
| SAMPLE-REPORT-FEBRUARY-2026.md | Everyone | Real filled-in example |
| REPORT-DELIVERY-GUIDE.md | DevOps, automation | PDF generation & scheduling |
| REPORTER-HANDOFF.md | Team lead, future maintainers | This document |

---

## Testing / Validation

The design has been validated against:
- ✅ POC swarm data (5 visitors, 68 events) — can the report be filled with real data? YES
- ✅ Committee meeting context (non-technical audience) — is it readable? YES (plain English, minimal jargon)
- ✅ Business stakeholder priorities (which venues got traffic?) — is it answered? YES (Business Engagement Ranking)
- ✅ Technical team needs (where does data come from?) — is it traceable? YES (METRICS-DATASOURCE-MAPPING)

---

## Maintenance & Future Enhancements

### Short-term (Q1 2026)
- Close instrumentation gaps (Phase 6)
- Automate data pull pipeline
- Run first 3 months of reports, gather feedback

### Medium-term (Q2 2026)
- Add session-level journey visualization (who did what, in order)
- Deep dive: "Why did visitors choose dining?" analysis
- Survey: Ask committee what metrics matter most

### Long-term (Q3+ 2026)
- Predictive: "Which new events will convert to tickets?"
- Cohort analysis: "Do visitors who saw events ticket page go on to book VRBO?"
- Personalization: "Which AI response types drive gallery conversions?"

---

## Questions?

**For template/report format:** See COMMITTEE-REPORT-TEMPLATE.md and SAMPLE-REPORT-FEBRUARY-2026.md

**For data sources/calculations:** See METRICS-DATASOURCE-MAPPING.md

**For PDF generation/automation:** See REPORT-DELIVERY-GUIDE.md

**For team coordination:** See messages sent to instrumenter, pipeline, and team-lead

---

**End of handoff.**

Reporter task is complete. Committee report design is ready for production. Phase 7 is unblocked.
