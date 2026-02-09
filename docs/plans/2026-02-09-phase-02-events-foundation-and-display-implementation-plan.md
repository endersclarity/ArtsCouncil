# Phase 02: Events Foundation + Map/List Display (Vertical Slice)

## Goal
Ship a demo-ready events feature that proves:
- Events can be curated now from imperfect venue data
- Events can be linked to map assets and surfaced in UI
- The architecture is ready for hybrid scaling (live feeds later)

## Scope (This Slice)
1. Add canonical curated events data for next 14 days.
2. Add schema validation script for events data quality.
3. Add deterministic event-index builder with venue matching + stats.
4. Integrate events into `index-maplibre.html`:
   - `Events (14d)` filter pill in map status controls
   - event-aware tooltip + detail panel
   - `Upcoming Events` block below map with chips (`All`, `Weekend`, `14d`)
   - event card click focuses map venue + opens detail panel
5. Keep unmatched events visible in list-only mode.

## Data Contracts
Canonical file:
- `website/cultural-map-redesign/events.json`

Derived index:
- `website/cultural-map-redesign/events.index.json`

Required event fields:
- `event_id`, `title`, `start_iso`, `end_iso`, `timezone`, `venue_name`, `source_type`

Optional fields:
- `venue_city`, `venue_pid`, `ticket_url`, `tags`, `source_ref`, `last_verified_at`

## Matching Strategy
Priority order:
1. `venue_pid` match to asset `pid`
2. normalized `venue_name|venue_city` fallback

Deterministic tie-break:
- category priority (favor event-relevant categories), then lowest asset index

Index output includes:
- `matched_asset_idx` (or `null`)
- `match_method` (`pid`, `name_city`, `none`)
- aggregate stats: total, matched, unmatched, matched_by_pid, matched_by_name_city

## UI/Behavior Decisions
- `Events (14d)` combines with category + `Open now` via logical AND.
- Event count is exposed in map tooltip and detail panel.
- `Upcoming Events` section uses canonical events and supports chips:
  - `All` (all upcoming records in file)
  - `Weekend` (Sat/Sun only)
  - `14d` (within next 14 days)
- Unmatched events render with an `Unmapped` badge and no map fly-to action.

## Validation
1. Run event schema validator.
2. Run index builder and verify deterministic stats output.
3. JS syntax check on inline script.
4. Browser smoke:
   - map loads without console errors
   - `Events (14d)` pill filters map assets
   - event cards open detail/fly-to for matched venues
   - unmatched events remain list-visible.

## Out of Scope
- Automated live feed ingestion adapters
- Recurrence expansion engine
- Event submission CMS/editor UI
