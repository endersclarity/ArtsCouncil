# Phase 7: Demand Signal Reporting — Complete Documentation Index

**Status:** ✅ Ready for production
**Last updated:** February 18, 2026

---

## Start Here

**New to this phase?** Start with:
1. Read this INDEX (you are here)
2. Read DESIGN-SUMMARY.txt (2-minute overview)
3. Read SAMPLE-REPORT-FEBRUARY-2026.md (see what committee will get)
4. Read REPORTER-HANDOFF.md (understand the design approach)

**Then pick your path:**

---

## By Role

### Committee Members
→ **Read SAMPLE-REPORT-FEBRUARY-2026.md**
- This is what you'll see every month starting April 2026
- Shows format, tone, level of detail
- Real example using POC swarm data

---

### Product / UX Team
→ **Start: SAMPLE-REPORT-FEBRUARY-2026.md**
→ **Then: METRICS-DATASOURCE-MAPPING.md sections 5 & 6** (Demand Signals, Business Engagement)
- Understand what demand signals are visible from data
- See which venues are getting traffic
- Identify gaps (e.g., gallery engagement is low)
- Use recommendations section to guide product roadmap

---

### Data Analysts / Report Operators
→ **Start: COMMITTEE-REPORT-TEMPLATE.md**
→ **Then: METRICS-DATASOURCE-MAPPING.md**
- Learn the template structure (what to fill in each month)
- Understand data sources for every metric
- See calculation formulas

**Monthly workflow:**
1. Extract metrics using METRICS-DATASOURCE-MAPPING (API calls)
2. Fill COMMITTEE-REPORT-TEMPLATE with actual data
3. Follow REPORT-DELIVERY-GUIDE to convert → PDF
4. Archive and distribute

---

### Engineers / Automation Team
→ **Start: REPORT-DELIVERY-GUIDE.md**
→ **Then: METRICS-DATASOURCE-MAPPING.md sections "Automation & Scripts"**
- Implement Pandoc + LaTeX template setup
- Build Node.js data pull script
- Create shell script pipeline
- Schedule cron job for 1st of month

**Implementation order:**
1. Install Pandoc
2. Create LaTeX template
3. Build Node.js data pull script (Umami API + Supabase queries)
4. Create shell script to orchestrate (data pull → markdown → PDF)
5. Test with January data
6. Schedule cron job

---

### Phase 6 Team (Instrumenter)
→ **METRICS-DATASOURCE-MAPPING.md section "Known Measurement Gaps"**
- See which events are not instrumented
- Priority #1: Chatbot deep link clicks (2-3 days to fix)
- Priority #2: Directory page interactions, Itinerary engagement

**Action:** Close the gaps to improve report accuracy for April report.

---

### Phase 6 Team (Pipeline)
→ **METRICS-DATASOURCE-MAPPING.md section "Data Collection"**
- Add `intent` field to chat_logs (enum: dining/events/lodging/trip_planning/other)
- Add `session_id` to all Umami custom events

**Why:** Report needs to classify chatbot queries by topic and link user events into coherent journeys.

---

## Complete File Listing

### Core Deliverables
| File | Purpose | Audience | Size |
|------|---------|----------|------|
| **COMMITTEE-REPORT-TEMPLATE.md** | Monthly report template (fill with actual data each month) | Data analysts, product team | 500 lines |
| **METRICS-DATASOURCE-MAPPING.md** | Technical spec: every metric → API call/formula | Engineers, analysts | 600 lines |
| **SAMPLE-REPORT-FEBRUARY-2026.md** | Real filled-in example (using POC data) | Everyone | 400 lines |
| **REPORT-DELIVERY-GUIDE.md** | How to generate PDF and automate monthly | DevOps, automation | 400 lines |

### Supporting Docs
| File | Purpose | Audience | Size |
|------|---------|----------|------|
| **REPORTER-HANDOFF.md** | Complete handoff summary & design rationale | Team lead, future maintainers | 300 lines |
| **DESIGN-SUMMARY.txt** | Quick visual summary (this document) | Everyone | 300 lines |
| **INDEX.md** | Navigation guide (you are reading this) | Everyone | 150 lines |

### Reference Docs (already existed)
| File | Purpose |
|------|---------|
| **POC-INTERNAL-BRIEF.md** | POC findings, data access setup |
| **BLIND-INTENT-RECONSTRUCTION.md** | How blind analyst reconstructed intent from data |
| **SWARM-POC-RESULTS.md** | Ground truth: what 5 synthetic visitors did |

---

## Key Sections Quick Links

### If you need to understand...

**What metrics are in the report?**
→ COMMITTEE-REPORT-TEMPLATE.md "Key Metrics (Executive Summary)"

**What demand signals does the platform surface?**
→ SAMPLE-REPORT-FEBRUARY-2026.md "What Visitors Wanted"

**Where does each metric come from?**
→ METRICS-DATASOURCE-MAPPING.md (full table with API calls)

**How to convert markdown → PDF?**
→ REPORT-DELIVERY-GUIDE.md (3 options, Pandoc recommended)

**How to automate monthly report generation?**
→ REPORT-DELIVERY-GUIDE.md "Automation: Monthly Report Generation"

**What measurement gaps exist?**
→ METRICS-DATASOURCE-MAPPING.md "Known Measurement Gaps"

**What does the committee actually see?**
→ SAMPLE-REPORT-FEBRUARY-2026.md (full example)

**What instrumentation needs to be added?**
→ METRICS-DATASOURCE-MAPPING.md "Known Measurement Gaps" (for Phase 6)

**What data schema changes are needed?**
→ METRICS-DATASOURCE-MAPPING.md "Data Collection" (for Phase 6 pipeline)

---

## Document Map

```
.planning/phases/07-demand-signal-reporting/
│
├── INDEX.md (THIS FILE)
│   └─ Navigation guide for all documents
│
├── DESIGN-SUMMARY.txt
│   └─ 2-minute visual overview (boxes, timelines, checklists)
│
├── REPORTER-HANDOFF.md
│   └─ Complete handoff summary + design rationale
│
├── COMMITTEE-REPORT-TEMPLATE.md ⭐ CORE
│   └─ Reusable 1-2 page markdown template
│   └─ Fill with actual data each month
│   └─ Fixed structure: metrics, demand signals, business ranking, etc.
│
├── METRICS-DATASOURCE-MAPPING.md ⭐ CORE
│   └─ Technical spec: every metric → exact API call/formula
│   └─ Data sources: Umami endpoints, Supabase queries
│   └─ Automation pseudocode (Node.js)
│   └─ Known gaps & impact analysis
│
├── SAMPLE-REPORT-FEBRUARY-2026.md ⭐ CORE
│   └─ Real filled-in example (using POC swarm data)
│   └─ Proof-of-concept that format works
│   └─ Shows tone, length, detail level
│   └─ Real case study included
│
├── REPORT-DELIVERY-GUIDE.md ⭐ CORE
│   └─ How to generate PDF (3 options)
│   └─ Recommended: Pandoc + LaTeX template
│   └─ Automation setup (Node.js + shell + cron)
│   └─ Committee meeting presentation notes
│   └─ File structure & archiving
│
├── archive/
│   ├─ report-january-2026.pdf (future)
│   ├─ report-february-2026.pdf (first production: April 1)
│   ├─ report-march-2026.pdf
│   └─ ... (12+ months of reports)
│
├── report-january-2026.md (future)
├── report-january-2026.pdf
├── report-february-2026.md (first production)
├── report-february-2026.pdf
│
└─ template.latex (for Pandoc, created by you)

```

---

## Key Decisions (Why Things Are This Way)

1. **Monthly, not real-time reports**
   - Gives time for data aggregation and human review
   - Aligns with committee meeting cadence
   - Allows for narrative context ("here's what happened this month")

2. **1-2 pages, not 10+ pages**
   - Committee won't read a long document
   - Forces prioritization (what matters most?)
   - Still has appendix for details if needed

3. **Business Engagement Ranking is the centerpiece**
   - Committee's #1 question: "Which businesses got traffic?"
   - Direct referrals (outbound clicks) are the strongest signal
   - Dining, events, and lodging are the top categories

4. **Measurement gaps are flagged, not hidden**
   - Transparency about what we can and can't measure
   - Drives Phase 6 instrumentation priorities
   - Sets realistic expectations (we improve each month as gaps close)

5. **Pandoc + LaTeX is the conversion method**
   - Offline (no Vercel dependency)
   - Professional output
   - Fully automatable
   - Easy to brand with Arts Council letterhead

6. **Automation ready from day 1**
   - No manual copy-paste of numbers
   - Node.js script pulls data, fills template
   - Cron job runs 1st of month at 6am
   - PDF ready to send by morning

---

## Implementation Timeline

**THIS WEEK (Feb 18-22):**
- ✅ Report design complete
- ⏳ Team reviews deliverables
- ⏳ Resource assignment for Phase 6 gaps

**NEXT 2 WEEKS (Feb 25 - Mar 11):**
- ⏳ Chatbot deep link tracking implemented (Phase 6)
- ⏳ Chat_logs intent field added (Phase 6)
- ⏳ Session_id added to Umami events (Phase 6)

**MID-MARCH (Mar 12-18):**
- ⏳ Automation pipeline built
- ⏳ First dry run with January data
- ⏳ Pandoc template finalized
- ⏳ Cron job scheduled

**APRIL 1:**
- ⏳ First production report (for March data)
- ⏳ Committee sees new format at April meeting

**MAY ONWARD:**
- ⏳ Monthly reports fully automated

---

## Questions?

**For template/format questions:**
→ Read SAMPLE-REPORT-FEBRUARY-2026.md

**For technical/API questions:**
→ Read METRICS-DATASOURCE-MAPPING.md

**For automation/PDF questions:**
→ Read REPORT-DELIVERY-GUIDE.md

**For design rationale:**
→ Read REPORTER-HANDOFF.md

**For quick overview:**
→ Read DESIGN-SUMMARY.txt

---

## Next Steps (By Role)

**Committee:** Expect first report in April. It's 1-2 pages, focuses on "what did visitors want" and "which businesses got traffic."

**Product team:** Use SAMPLE-REPORT-FEBRUARY-2026.md as input to quarterly roadmap planning.

**Data analyst:** Use COMMITTEE-REPORT-TEMPLATE.md and METRICS-DATASOURCE-MAPPING.md to start monthly reporting workflow.

**DevOps/Automation:** Use REPORT-DELIVERY-GUIDE.md to implement Pandoc + Node.js + cron automation.

**Phase 6 instrumenter:** Close chatbot deep link tracking gap (top priority).

**Phase 6 pipeline:** Add intent field + session_id to data schema.

**Team lead:** Coordinate above work, schedule automation setup for mid-March.

---

**Phase 7 Reporter: COMPLETE & READY FOR PRODUCTION**

All files are in `/Users/ender/.claude/projects/artsCouncil/.planning/phases/07-demand-signal-reporting/`

Committee will see this format starting April 2026.
