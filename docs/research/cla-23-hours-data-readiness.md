# CLA-23 — Hours Data Readiness Assessment

Status: assessment only (no Open Now UI design)
Date: 2026-05-29
Scope: V1 Discovery Map (`website/cultural-map-redesign-stitch-lab/v1-discovery-map/`)
Controlling context: `CONTEXT.md` ("Hours Data", "Directory Record"), `docs/V1-DISCOVERY-MAP-REVIEW-NAVIGATION-SPRINT-PRD-2026-05-25.md`

## 1. V1 Data Inventory

Source inspected: `v1-discovery-map/data/places.json` — a flat JSON **list of 1,415 place records** (verified by load + count).

Complete field inventory (union of all keys, with count of records carrying each field):

| Field | Records | Field | Records |
|---|---|---|---|
| `address` | 1415 | `intent` | 1415 |
| `anchor` | 6 | `lat` / `lng` | 1415 |
| `category` | 1415 | `locationCaveat` | 1415 |
| `coordinateConfidence` | 1415 | `locationReviewStatus` | 1415 |
| `coordinateDecisionId` | 1415 | `markerTier` | 1415 |
| `coordinateProvenance` | 1415 | `musePick` | 1415 |
| `coordinateResolutionNote` | 3 | `name` | 1415 |
| `coordinateSource` | 1415 | `phone` | 1415 |
| `description` | 1415 | `publicMarker` | 1415 |
| `featured` | 1415 | `website` | 1415 |
| `id` | 1415 | `image` (object) | 1415 |
| `inGvncScope` | 1415 | | |

### Confirmation: NO structured hours-like fields exist

Grepped the raw file for `hours`, `open`, `schedule`, `"time"`, weekday/`am-`/`pm`/`closed` tokens:

- **There is no `hours`, `openHours`, `openingHours`, `schedule`, `time`, `dayparts`, or any equivalent structured field anywhere in the record schema.** `"time"` as a key: 0 matches.
- The only hours-shaped strings are **free prose inside `description`** (18 records), e.g.:
  - "...Our hours of operation are Tuesday to Friday 7:00 AM to..." (Wolf Road shop)
  - "We are open year round, and offer basic supplies..." (Cascade Shores store)
  - plus incidental non-hours uses ("Hour Nevada County", "after-hours gathering point").
- 1 hours-word match is in a `name`, 2 in other prose; **none in any machine-readable hours field.**

This exactly matches the PRD's own statement (`V1-DISCOVERY-MAP-REVIEW-NAVIGATION-SPRINT-PRD-2026-05-25.md:63`): *"the current V1 place data has no structured hours fields. Prose descriptions that mention hours are not usable hours data."*

## 2. Plausible Hours Sources and Maintenance Expectations

Per `CONTEXT.md` glossary term **Hours Data** (lines 115–117, relationship line 342):

> "Opening-hours information from prior Google Places enrichment, not from Diana's source inventory. It should stay out of Directory Record Restoration until its freshness and place-matching coverage are audited."

Implications:

- **Not in the canonical source.** The Diana Workbook (the canonical V1 identity source per `CONTEXT.md:23-25`) does **not** supply hours. Hours came from a **prior Google Places enrichment pass** that is not represented in the shipped `places.json`.
- **Provenance/matching risk.** Any restored hours would have to be re-joined to the 1,415 canonical records by name+city. Place identity in V1 is deliberately resolved on `(exact id)` and `(normalized name + city when co-located)`, not id alone (`CONTEXT.md:35-37` Canonical Place) — so a Google Places hours join is a **fuzzy match against a deduped universe**, with real mismatch risk.
- **Freshness risk.** Google Places hours drift (seasonal venues, closures, COVID-era staleness). Displaying them implies a freshness the prototype cannot guarantee — directly the failure mode the glossary warns against ("unaudited hours display").
- **Maintenance expectation.** Hours are the highest-churn field in any local directory. There is currently **no ingestion pipeline, no refresh cadence, and no owner** for hours in this repo. Restoring hours commits the project to ongoing maintenance it has not scoped.

**Conclusion on sourcing:** a plausible source exists (the prior Google Places enrichment), but it is (a) not present in V1 data, (b) un-audited for freshness, and (c) un-audited for match coverage against the canonical place set.

## 3. What "Open" Means Per Category

The schema's category axis (`category`, 11 values) and the visitor-facing `intent` axis (6 Outing Types) both matter. Distribution from the data:

Categories: Walks & Trails (273), Eat, Drink & Stay (263), Historic Places (254), MUSE Picks (193), Cultural Resources (94), Galleries & Studios (77), Fairs & Festivals (68), Public Art (63), Performing Arts (62), Arts Organizations (52), Shops & Makers (16).

Outing Types (`intent`): Historic Places (541), Outdoors (273), Eat, Drink & Stay (263), Galleries & Studios (192), See a Show (130), Shops & Makers (16).

"Open" is **only meaningful for a minority of records**, and means different things:

| Category grouping | Does "open now" mean anything? | Definition of "open" |
|---|---|---|
| **Venues with staffed hours** — Eat, Drink & Stay (263), Shops & Makers (16), Galleries & Studios / Arts Organizations with a storefront (subset of ~129) | Yes | Business is staffed and accepting visitors during posted weekly hours. This is the only group where conventional "Open Now" applies. |
| **Events / Fairs & Festivals** (68) | No — different model | An event is not "open"; it is **scheduled** (has a date/time window). The right concept is *upcoming / happening now*, driven by the events layer, not weekly hours. |
| **Outdoor places** — Walks & Trails (273), Outdoors intent | Mostly no | Trails are typically dawn-to-dusk or 24/7; "open" is better expressed as *seasonal access* or *daylight*, not weekly business hours. |
| **Historic Places** (254 cat / 541 intent) | Usually no | Many are markers, monuments, or sites you view from outside. A subset (museums, tour buildings) have visiting hours; the majority do not. "Open" is misleading for a plaque or a building exterior. |
| **Public Art** (63), **Cultural Resources** (94), **MUSE Picks** (193) | Mostly no | Public art and most cultural-resource/MUSE records are not gated by hours at all. |

**Key finding:** even if hours data were perfect, an "Open Now" concept is **category-conditional**, not universal. Roughly **~300–400 of 1,415 records** (food/drink/shops/some galleries) are the only places where weekly business hours are the correct mental model. For the rest, "open" is either meaningless (markers, public art), a different model (scheduled events), or an access concept (daylight/seasonal for trails).

## 4. Recommended Missing-Hours Behavior

Because hours are absent for ~100% of records today and meaningful for only a minority even when present, the recommended behavior is layered:

1. **Hide the feature entirely while data is absent.** With zero structured hours, there is no "missing hours" per-card state to render — there is simply no hours capability. Do **not** ship an "hours unavailable" placeholder on 1,415 cards; that advertises a gap on every record (an Orientation Failure / "broken-looking" card risk per `CONTEXT.md:128-129`, Unified Place Card).
2. **When hours data later exists, use category-aware fallback copy, not a global badge:**
   - Hours-bearing categories with no data for that record → small **"Hours not available"** note on the card only (never on the marker, never in the list).
   - Outdoor / trail records → category fallback copy such as **"Open seasonally / daylight hours"** rather than a weekly schedule.
   - Historic markers / public art / cultural resources where hours are not meaningful → **no hours affordance at all** (not even "unavailable").
   - Events → route to the events layer's scheduled-time model, never to weekly hours.
3. **Exclude all records from any "Open Now" filter until per-record structured hours exist AND the record is in an hours-bearing category.** A record with no hours must not be silently treated as either open or closed. Never produce a confidently-wrong open/closed claim.
4. **Per glossary, keep hours out of Directory Record Restoration** until freshness + matching are audited (`CONTEXT.md:342`).

## 5. Recommendation

**NEEDS-INGESTION-SPRINT.**

- **READY?** No — there is literally no structured hours field in V1 data (verified: 0/1,415 records).
- **BLOCKED?** Partially — it is blocked on data, but the path forward is concrete (a prior Google Places enrichment source is known to exist).
- **Verdict: NEEDS-INGESTION-SPRINT.** Before any Open Now / hours display work can begin, a dedicated, scoped ingestion + audit pass is required:
  1. Recover the prior Google Places hours enrichment.
  2. Join it to the 1,415 canonical records by normalized name + city (respecting Canonical Place dedup rules), and **report match coverage** (expect partial).
  3. Audit freshness (capture date, flag stale).
  4. Restrict the resulting structured `hours` field to hours-bearing categories only.
  5. Only then revisit Open Now as a feature (separate issue).

Until that sprint runs, hours stays **excluded from the product surface entirely** and **excluded from any Open Now filter**, consistent with the controlling PRD's Out Of Scope list (lines 76–77) and the `CONTEXT.md` Hours Data exclusion.
