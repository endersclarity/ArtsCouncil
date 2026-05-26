# V1 Discovery Map Review Navigation Sprint PRD

Status: ready to slice  
Date: 2026-05-25  
Source artifact: `website/cultural-map-redesign-stitch-lab/v1-discovery-map/`  
Controlling context: `CONTEXT.md`, `docs/V1-DISCOVERY-MAP-NEXT-REVIEW-PACKAGE-2026-05-25.md`

## Problem Statement

The V1 Discovery Map is ready for stakeholder review, but the current prototype is still harder to inspect, revisit, and discuss than it needs to be. A reviewer can see the map, modes, filters, Primary Anchors, Supporting Stops, paths, and events, but cannot reliably open a URL to a specific review state, scan the current map contents as a list, or jump directly to a known place.

The next sprint should make the review surface easier to navigate without expanding the prototype into a public-launch product.

## Solution

Add a review-navigation layer for the current V1 Discovery Map:

- shareable URL states for mode, visitor-intent filters, selected places, selected paths, and selected events where practical
- a compact places list panel that reflects the current Places map state
- search within the current filtered places list so reviewers can jump to known places
- deferred Near Me/proximity and hours/Open Now data-readiness issues that preserve future utility without entering the first implementation sequence

Frame the sprint for the **Stakeholder Review Audience** first. The features should help Eliza, Diane, staff, and agents inspect and discuss the prototype. They should also lay groundwork for later **Public Discovery Audience** utility, but public-launch behavior is not the controlling goal for this sprint.

## User Stories

1. As a stakeholder reviewer, I want to open a URL directly to a Primary Anchor, so that I can discuss one cultural example without manually finding it on the map.
2. As a stakeholder reviewer, I want to open a URL directly to a curated path, so that I can evaluate the Path Treatment as a complete review object.
3. As a stakeholder reviewer, I want a URL to preserve the active map mode, so that a review link can open directly to Places, Events, or Paths.
4. As a stakeholder reviewer, I want a URL to preserve active visitor-intent filters, so that I can inspect one cultural slice such as Galleries & Studios or Eat, Drink & Stay.
5. As a stakeholder reviewer, I want invalid or stale URL state to fall back gracefully, so that old review links do not break the prototype.
6. As a staff reviewer, I want to copy a useful map state from the browser address bar, so that I can send the exact review context to someone else.
7. As a staff reviewer, I want the map state to update as I click filters, anchors, paths, and events, so that the current URL reflects what I am discussing.
8. As a stakeholder reviewer, I want a compact list of visible places, so that I can scan what the filtered map contains without hunting through markers.
9. As a stakeholder reviewer, I want the list to respect visitor-intent filters, so that it explains the current map count.
10. As a stakeholder reviewer, I want list items to open the same selected-place card as map markers, so that list and map behavior feel like one experience.
11. As a stakeholder reviewer, I want the list to identify Primary Anchors and Supporting Stops, so that the review hierarchy is visible without implying countywide ranking.
12. As a stakeholder reviewer, I want the list to stay compact on desktop and mobile, so that it supports the map instead of replacing it.
13. As a stakeholder reviewer, I want to search by place name, category, city, or visitor intent, so that I can jump to known examples quickly.
14. As a stakeholder reviewer, I want search results to use the same selected-place behavior as the map and list, so that search does not introduce a second detail model.
15. As a stakeholder reviewer, I want empty search results to explain what happened plainly, so that missing data does not feel like a broken map.
16. As a staff reviewer, I want search and filters to compose predictably, so that I can narrow the review surface without losing context.
17. As a future public visitor, I want the groundwork for Near Me behavior to fit the same map/list model, so that proximity can later enhance discovery without creating a separate product mode.
18. As a product steward, I want Open Now excluded until structured hours data exists, so that the prototype does not imply data freshness it cannot support.

## Implementation Decisions

- Treat this as a **review-navigation** sprint, not a public-launch utility sprint.
- Preserve the current V1 product frame: map-first, stakeholder-facing internal alpha, not Arts Hub, not AI trip planner, not public directory replacement.
- Add URL state as a small client-side state layer around the existing mode, filter, selected-place, selected-path, and selected-event interactions.
- Keep URL parameters human-readable where possible, using existing IDs for places, paths, and events.
- Treat deep linking as the foundation slice before list and search, because every later review-navigation feature benefits from stable, shareable state.
- Support curated review objects and simple review state first: `mode`, `place`, `path`, `event`, and `intent`.
- Do not include map camera, zoom, bounds, cluster selection, search query, Near Me coordinates, or drawer/panel pixel state in the first deep-linking slice.
- Unknown URL parameters should degrade to the default review state instead of showing an error.
- The first compact list should cover places only. Events and paths already have mode-specific panels and can be strengthened later if review shows a need.
- The compact list should reflect currently visible/relevant place records rather than becoming a separate full directory product.
- The list should reuse existing place selection behavior and Anchor Card / Supporting Stop treatment.
- Search should operate over the current static V1 data in the browser.
- Search should respect active visitor-intent filters by default, with an empty-state path that lets reviewers clear filters when they want to search all places.
- Search should use existing V1 vocabulary: Ordinary Place, Cultural Anchor, Primary Anchor Set, Supporting Stop Set, Path Treatment, visitor-intent filters.
- Near Me should be documented as a later slice because it changes the product emphasis toward the Public Discovery Audience and requires location permission UX.
- Open Now is out of scope because the current V1 place data has no structured hours fields. Prose descriptions that mention hours are not usable hours data.

## Testing Decisions

- Test behavior through public UI and URL state, not private implementation details.
- Add focused JavaScript checks for URL parsing/serialization if the implementation extracts a small state helper.
- Add browser verification for opening URLs into mode, filter, place, path, and event states where supported.
- Verify places-list and search interactions by confirming selected cards, counts, and map state change as expected.
- Verify invalid URL state falls back without console errors.
- Keep dogfood-style broad QA out of this sprint unless a specific bug appears.

## Out Of Scope

- Open Now filtering or open/closed badges.
- Structured hours ingestion.
- Route optimization, directions, itinerary building, saved places, or My Day.
- Public submission, correction CTA, authentication, user profiles, or ratings.
- Full countywide data cleanup.
- A replacement public directory page or all-layer directory.
- A new visual design direction.
- Analytics instrumentation unless explicitly requested later.

## Further Notes

The recommended issue order is:

1. Deep linking / shareable map states.
2. Compact places list panel for current review state.
3. Search within current filtered places list.
4. Near Me/proximity behavior as a follow-on public-utility slice.
5. Hours/Open Now data readiness as a separate future investigation, not an implementation feature in this sprint.
