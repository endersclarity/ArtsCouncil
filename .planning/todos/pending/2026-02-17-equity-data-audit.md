---
created: 2026-02-17T00:00:00.000Z
title: Equity data audit (Indigenous, Latino/a/x, underserved communities)
area: data
priority: low
files:
  - .planning/roundtable/04-culture-forward.md
  - .planning/roundtable/06-synthesis.md
  - docs/analysis/culture-forward-extraction.md
---

## Problem

Culture Forward Champion scored Pillar 4 (Land, Culture, Stewardship) at 3/10. The platform has:
- Zero Indigenous representation (Washoe Tribe, Nevada City Rancheria Nisenan are key Culture Forward partners)
- Minimal Latino/a/x cultural visibility
- No underserved community focus
- No filters for "Family-Friendly," "Free Events," "Multilingual Spaces"

This is a DATA problem, not a design problem. The platform is built on 2019 ArcGIS data that didn't capture these voices. "The platform can only be as equitable as the data it's built on."

## Solution

Phase 5 (2027) work:

1. **Data audit** — Review 685 assets for representation. Are Indigenous cultural sites, Latino/a/x community spaces, and South County venues adequately surfaced?
2. **Community listening** — Partner with Washoe Tribe, Nevada City Rancheria Nisenan, and Latino/a/x community organizations to identify missing assets
3. **Category evolution** — Add filters for "Family-Friendly," "Free Events," "Youth Programs," "Multilingual Spaces"
4. **Content partnerships** — Co-create content with underserved communities rather than curating from outside

## Progress Log

### 2026-02-18 — Multilingual access (translation layer)

Added JigsawStack translation widget to all 5 active pages (hub, events, directory, itineraries, trip). 163 languages available via bottom-left globe button. Spanish-speaking visitors can now read the full platform in their language on demand. `autoDetectLanguage: true` means users with Spanish browser settings get auto-translated on load.

This addresses the **language access barrier** for the Latino/a/x community gap, but does NOT address the **data representation gap** — there are still few Latino/a/x cultural assets, venues, or events in the underlying dataset. Both layers matter.

Remaining equity work is still Phase 5 (2027): data audit, community listening, category evolution, content partnerships.

---

## References

- Culture Forward: "Persistent access issues affect youth, Latino/a/x, Indigenous, Black, and immigrant communities"
- Culture Forward: "Support historically underinvested communities through visibility and funding" (Pillar 4, Strategy 2)
- Synthesizer: "This is not a feature gap. It's a data problem."
- Culture Forward extraction: Section 2 (Community Research Findings) — 629 survey responses, 12 listening sessions

---

## Roundtable Findings (2026-02-18)

See `.planning/EXECUTION-ORDER.md` for full ranked stack. This is Tier 4 (Deferred, 2027 / Phase 5).

**Confirmed:** This is a community engagement problem, not a code problem. No amount of engineering closes the data representation gap without listening sessions and content partnerships.

**Insurance action (do now, ~30 min):** Write a 1-page talking-points document for when committee asks about Indigenous representation. Standard answer: *"The translation widget addresses language access for 163 languages. Data representation — Indigenous cultural sites, Latino/a/x community spaces — requires community partnerships we're planning for Phase 5 in 2027. We're in conversations with [Washoe Tribe / Nevada City Rancheria Nisenan / Latino/x orgs] about co-creating that content."*

This talking-points doc is a document task, not a development sprint. Write it in `docs/committee/` or `docs/correspondence/` when the opportunity arises.
