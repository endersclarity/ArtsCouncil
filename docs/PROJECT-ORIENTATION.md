# Project Orientation

Status: working orientation
Date: 2026-05-23

## Current Plain-Language Story

This project is trying to turn Nevada County Arts Council's cultural data into a useful, credible discovery experience.

The old frame was "Cultural Asset Map": an inventory of cultural places and assets. The current stronger frame is "Discovery Map": a map-first prototype that helps someone understand what is culturally alive nearby through places, events, and curated routes.

The most grounded current direction is:

- Build from the canonical V1 prototype at `website/cultural-map-redesign-stitch-lab/v1-discovery-map`.
- Treat it as an internal approval-stage alpha, not a public launch.
- Use the map itself as the product argument.
- Show places as the primary layer.
- Use events as a lighter layer that makes the map feel alive.
- Use fixed curated paths as authored cultural story routes, not dynamic trip planning.
- Keep stakeholder confidence as the first job.

## Source Map

### Strongest Source Files

- `Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md`
  - Strongest synthesis of the product direction.
  - Says the clearest signal is a "discovery-first cultural map" combining places, events, filters, and human curation.
  - Defines the core question as: "What's happening, where is it, and what else is nearby?"

- `PRODUCT.md`
  - Current product-context statement.
  - Defines V1 as an internal approval-stage MapLibre alpha.
  - Says the map is the product argument.

- `docs/V1-DISCOVERY-MAP-BRIEF.md`
  - Current V1 brief.
  - Says stakeholder confidence is the first job.
  - Defines what is in and out of scope.

- `docs/V1-DISCOVERY-MAP-DECISION-LOG.md`
  - Best source for why the current prototype went in its direction.
  - Records rejected alternatives and branchable decisions.

- `Transcripts/2026-04-24_arts-council-session_GPT-SUMMARY.md`
  - Meeting-summary synthesis across three April 24 sessions.
  - Useful, but it is already summarized material, not raw transcript.

### Older Transcript Sources

These appear to capture earlier exploration and stakeholder context:

- `Transcripts/2026-02-06_arts-council-meeting_CLEAN.txt`
- `Transcripts/2026-02-18_arts-council-meeting_CLEAN.txt`
- `Transcripts/2026-02-18_arts-council-meeting_RAW.txt`
- `Transcripts/2026-03-13_arts-council-meeting_CLEAN.txt`
- `Transcripts/2026-03-13_arts-council-meeting_RAW.txt`

Working read: these establish the drift from "asset map / website / AI tool" toward "alive cultural discovery experience." They also preserve anxieties about branding, county/chamber coordination, data quality, calendars, and maintenance.

### Current Prototype

Canonical prototype:

`website/cultural-map-redesign-stitch-lab/v1-discovery-map`

Current data counts:

- `places.json`: 1076 records
- `events.json`: 24 records
- `paths.json`: 3 records

The old duplicate `v1-discovery-map-gemini` folder has been removed from `master`. Its useful mechanics were selectively reconciled into `v1-discovery-map`.

## Stakeholders And Audiences

### Primary

Arts Council stakeholders deciding whether this direction feels credible, ownable, beautiful, useful, and worth continuing.

Evidence:

- `PRODUCT.md` defines the primary audience as Arts Council stakeholders.
- `docs/V1-DISCOVERY-MAP-BRIEF.md` says the first job is stakeholder confidence.

### Secondary

Visitors and locals who want to find cultural places, events, and curated routes.

Evidence:

- `PRODUCT.md` names visitors and locals as the secondary audience.
- The April 24 product brief asks the map to answer "What's happening, where is it, and what else is nearby?"

### Tertiary

Partner organizations and funders who need to see cultural authority without the project becoming a heavy platform pitch.

Evidence:

- `PRODUCT.md` names partner organizations and funders as a tertiary audience.

## Likely Commitments And Obligations

These are the commitments most supported by the repo evidence:

1. Produce a concrete Discovery Map alpha for stakeholder reaction.
2. Keep the experience narrow enough to avoid premature platform debates.
3. Show places, events, and curated paths working together.
4. Make the visual direction feel NCAC-native, not like generic GIS or a tourism dashboard.
5. Keep incomplete data visible as a known issue, not silently hidden.
6. Label placeholder/generated/substitute imagery honestly.
7. Continue iterating based on stakeholder feedback.

These are plausible but need email or stakeholder confirmation:

1. Any specific deadline.
2. Who gets the next update.
3. Whether this is expected as a live URL, screenshots, deck material, or working prototype.
4. Whether AI features are still desired soon, or intentionally deferred.
5. Whether county/chamber collaboration has changed the political constraints.

## Built Artifacts And What They Are For

### `v1-discovery-map`

Purpose: current forward prototype. Use this for future design and implementation work.

Contains:

- static app shell
- MapLibre app script
- NCAC/restyled CSS
- generated data
- placeholder image assets
- data-prep script
- screenshots and dogfood artifacts

### `PRODUCT.md`

Purpose: short current product context. Use as a quick guardrail.

### `docs/V1-DISCOVERY-MAP-BRIEF.md`

Purpose: richer product brief for V1. Use when deciding whether a feature belongs.

### `docs/V1-DISCOVERY-MAP-DECISION-LOG.md`

Purpose: why current choices were made and what alternatives were rejected. Use before undoing a prior decision.

### `.planning/`

Purpose: historical implementation planning. Useful for archaeology, but many entries refer to older branches, discarded experiments, or superseded implementation directions.

## Decisions Already Made

High-confidence decisions:

- `v1-discovery-map` is canonical.
- `v1-discovery-map-gemini` is no longer the working folder.
- V1 is not a public launch.
- V1 is not Arts Hub.
- V1 is not an AI trip planner.
- V1 should be map-first.
- Places are primary.
- Events are secondary.
- Paths are fixed curated routes.
- Data gaps should be logged.
- Placeholder imagery must be marked honestly.

Lower-confidence / still needs confirmation:

- Exact path themes and final route names.
- How current the event data must be for the next stakeholder review.
- Whether any AI submission/update workflow is still expected in this work cycle.
- How much county/chamber compatibility matters right now.

## Stale Or Noisy Artifacts

Likely stale/noisy:

- Old `website/cultural-map-redesign*` variants outside the current V1 folder.
- Planning phases tied to older canonical paths.
- Earlier AI concierge / itinerary / Arts Hub work unless explicitly revived.
- OpenDesign or Claude Design mockups as implementation source.

Still useful as context:

- Older planning summaries explaining why approaches were discarded.
- Brand/design docs if they match current NCAC constraints.
- Dogfood reports and screenshots for regression clues.

## What Is Actually Blocking Progress

The blocker is not code. The blocker is decision confidence.

There are too many artifacts with overlapping labels:

- Cultural Asset Map
- Discovery Map
- Arts Hub
- AI concierge
- AI itinerary builder
- directory
- events/calendar
- county/chamber platform
- stakeholder demo

The working direction resolves this by saying:

V1 is a stakeholder-facing Discovery Map alpha. It proves a culture-forward map experience. It does not solve the whole platform.

## Recommended Next 3 Work Sessions

### Session 1: Verify The Current V1 Prototype

Goal: know whether `v1-discovery-map` is demo-safe.

Actions:

- Run it locally.
- Check desktop and mobile.
- Check console/network errors.
- Verify places/events/paths interactions.
- Identify obvious stale data, broken images, and copy mismatches.

Output:

- short QA note in `docs/`
- prioritized fix list

### Session 2: Demo Readiness Pass

Goal: make the current prototype stronger without expanding scope.

Likely focus:

- first-load experience
- selected anchor cards
- current/stale events language
- path names and route copy
- placeholder labels
- mobile drawer polish

Output:

- small committed changes to V1
- before/after screenshots

### Session 3: Stakeholder Update Package

Goal: prepare something a human can send or present.

Possible outputs:

- short email/update draft
- screenshot set
- "what this is / is not" one-pager
- questions for stakeholder feedback

Emails should be read before this session if the recipient, promise, or deadline is unclear.

## Open Questions

Need user or email evidence:

1. Who is the next audience for this work?
2. Is there a deadline or meeting date?
3. Is the next deliverable a live prototype, screenshots, narrative memo, or something else?
4. Did anyone explicitly ask for AI itinerary or AI event submission recently?
5. Are county/chamber politics still active constraints, or just background context?
6. Is event data allowed to be stale in a prototype if it is labeled as alpha?

## Evidence Notes

Important source references:

- `Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md:11` frames the project as not Arts Hub, not AI itinerary, not tourism platform.
- `Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md:23` says to build a Discovery Map prototype.
- `Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md:25` defines the core user question.
- `Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md:31` lists map/feed/filter/event/place/curation ingredients.
- `Transcripts/2026-04-24_arts-council-session_GPT-SUMMARY.md:22` says the current cultural asset map was static and lacked UX focus.
- `Transcripts/2026-04-24_arts-council-session_GPT-SUMMARY.md:25` names county/platform coordination tension.
- `PRODUCT.md:9` defines V1 as an internal approval-stage alpha.
- `PRODUCT.md:11` says the map is the product argument.
- `PRODUCT.md:21` defines the product shape.
- `PRODUCT.md:29` lists non-goals.
- `docs/V1-DISCOVERY-MAP-BRIEF.md:9` says the Arts Council is the right narrator of the cultural layer.
- `docs/V1-DISCOVERY-MAP-BRIEF.md:15` says stakeholder confidence is the first job.
- `docs/V1-DISCOVERY-MAP-DECISION-LOG.md:10` records the fresh V1 shell decision.

## Bottom Line

The practical direction is clear enough to work:

Do not restart the whole project. Do not chase every old artifact. Work on the canonical V1 Discovery Map as an approval-stage stakeholder alpha, then prepare a tight stakeholder-facing update.

Before writing feature code, do one QA pass on the current V1 and one email pass only if the next recipient or deadline is unclear.
