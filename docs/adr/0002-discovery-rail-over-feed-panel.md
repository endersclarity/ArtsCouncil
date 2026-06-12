# 0002 — Discovery Rail over feed panel for the first-load discovery surface

**Status:** Implemented (sandbox slice, branch `sandbox/rail-and-muse`, 2026-06-10 — awaiting
Eliza/Diana review and owner merge decision; owner picked variant B from the
`v1-discovery-map/prototypes/discovery-feed-variants.2026-06-10.html` prototype, kept as a
dated artifact with A and C as labeled Concept Mockups)

## Context

The April 24 product brief (`Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md`, the controlling
requirements document) calls for "a discovery feed or panel — visible list/card layer for events and
places so users aren't forced to hunt through pins." The current build opens as a map with a
toolbox panel: browsing requires intent. Three structurally different prototypes were built:
(A) feed column left / map right, (B) map-first with a bottom snap-scrolling card rail that the map
follows, (C) feed-only reader with an on-demand map panel.

## Decision

Implement **B: the Discovery Rail** — the map stays the hero; a horizontal card rail (events,
places, one MUSE story, one path) is the first-load browsing surface. Map movement is constrained
to **Rail Follow** (ease-without-zoom on scroll-settle; fly-and-zoom only on tap). The existing
left panel collapses to a search/filter toolbar on first load and expands into the full Directory
Browser on demand.

## Why B and not A or C

- April 24 Session 2 feedback is entirely map-as-experience ("modern, colorful, reflect real
  streets"); A demotes the map, C removes it.
- Diana's one recorded design note is to *simplify* chrome ("not so in people's face," Feb 18);
  B adds the least.
- B is the brief's mobile layout ("map/feed toggle, bottom drawer cards") applied everywhere —
  one pattern, no second panel architecture.
- B is the smallest visible delta from the build Eliza and Diana will review, serving the brief's
  "react to the experience before we define any larger system" contract.

## Consequences

- The rail inherits the Browse Starting View doctrine (County Sampler, Implicit MUSE Grounding,
  Event Freshness Guarantee, GVNC Showcase Sampler Scope) — it is not a new content policy.
- Marker highlight for the active card must go through the existing feature-state seam (AGENTS.md
  invariant: no nested-`zoom` paint expressions; verify via the marker-hierarchy CDP contract).
- Mode tabs survive this slice; rail chips filter the stream. Tab consolidation is deferred until
  after Council feedback.
- This is built as a reviewable slice for the Eliza/Diana session, with A and C kept as labeled
  Concept Mockups for contrast. If they prefer A or C, the rail is one module to swap, not an
  architecture to unwind.

## Prototype disposal

`prototypes/discovery-feed-variants.html` answered its question (B won) and should be deleted or
left as a dated artifact once the rail lands; do not extend it.
