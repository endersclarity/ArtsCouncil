# Project Orientation Execution Strategy

Status: working strategy
Date: 2026-05-23

## Purpose

Create a grounded project orientation map before doing more feature work. The goal is to answer:

- What is this project now?
- What did stakeholders actually ask for?
- What did we agree to do?
- What has already been built?
- What is stale, duplicated, or misleading?
- What should the next concrete work sessions be?

The output should reduce confusion, not add another speculative plan.

## Primary Output

Write `docs/PROJECT-ORIENTATION.md`.

It should be short enough to use, but detailed enough to restart work without rereading every artifact.

Required sections:

- Current plain-language project story
- Source map: transcripts, briefs, planning docs, repo state
- Stakeholders and audiences
- Commitments and likely obligations
- Built artifacts and what each one is for
- Decisions already made
- Open questions
- Stale/noisy artifacts
- Recommended next 3 work sessions
- Evidence references by file path

## Source Order

### Phase 1: Meeting And Transcript Grounding

Read every file in `Transcripts/`.

Extract:

- people and organizations mentioned
- recurring project goals
- explicit decisions
- requested features
- unresolved tensions
- deadlines or implied urgency
- exact language worth preserving

Do not yet judge the implementation. This phase is about what the humans seemed to want.

### Phase 2: Brief And Product Correlation

Read:

- `PRODUCT.md`
- `docs/V1-DISCOVERY-MAP-BRIEF.md`
- `docs/V1-DISCOVERY-MAP-DECISION-LOG.md`
- `Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md`
- `Transcripts/2026-04-24_arts-council-session_GPT-SUMMARY.md`

Compare these against Phase 1:

- What claims are strongly supported by meeting material?
- What looks like later synthesis or inference?
- What is a real decision vs an agent-created interpretation?
- What phrasing should be treated as canonical?

### Phase 3: Planning Artifact Triage

Scan `.planning/` and `docs/` summaries.

Classify artifacts as:

- current and useful
- historical context only
- implementation detail
- likely stale/noisy
- needs stakeholder confirmation

Do not deeply read every plan unless it changes the orientation map.

### Phase 4: Repo State Correlation

Inspect the current canonical prototype:

`website/cultural-map-redesign-stitch-lab/v1-discovery-map`

Answer:

- What exists in code/data?
- What does the prototype currently prove?
- What does it fail to prove?
- Which docs match current code?
- Which docs are now contradicted by code or merged branch history?

### Phase 5: Email Pass, Only If Needed

Use emails after the repo/transcript map exists.

Email review should answer only gaps that local artifacts cannot answer:

- Was a specific deadline promised?
- Did a stakeholder request a specific deliverable?
- What tone or concern is live right now?
- Who needs the next update?

Emails should not replace the source map. They should resolve uncertainty.

## Working Rules

- Separate evidence from interpretation.
- Quote sparingly; cite paths and line numbers when useful.
- Prefer a few strong claims over a long summary.
- Treat agent-created docs as secondary unless supported by transcripts or emails.
- Preserve ambiguity where the sources are ambiguous.
- Do not start implementation while the orientation map is unresolved.

## Completion Criteria

The orientation pass is done when `docs/PROJECT-ORIENTATION.md` lets a fresh agent or human answer:

- what to work on next
- why that work matters
- which source files justify the direction
- what questions still require user or stakeholder judgment

Only then should implementation planning resume.
