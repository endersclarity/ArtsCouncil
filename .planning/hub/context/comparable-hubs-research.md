# Comparable Arts & Culture Digital Hubs — Research Synthesis

**Date:** 2026-03-14
**Sources:** Perplexity deep search (10 sites analyzed) + NotebookLM query (Culture Forward + transcript references)

---

## Key Finding

**Almost nobody at NCAC's scale does all three (calendar + map + directory) as a unified hub.** Most small arts orgs do one well, two adequately, and omit the third. NCAC's existing MapLibre implementation with 1,969 assets is already technically more sophisticated than anything comparable orgs have built. The hub we're building would be genuinely ahead of the peer group.

---

## Top 5 Most Relevant Comparables

### 1. West Harlem Arts Alliance — whaanyc.org
**Why it matters:** Closest organizational analog. Small staff, community-service orientation, one hub with events + directory.
- Artist directory ("A-List") — searchable, self-listing
- Arts calendar for discovering and posting events
- All three live in one hub for the district
- **Takeaway:** Proves the concept works at small scale. Simple CMS, no custom tech.

### 2. Arts Council of Placer County — placerarts.org
**Why it matters:** Adjacent county to Nevada County, very comparable org size and mission.
- County-wide artist and venue directory, free to register
- Central resources page consolidating events, classes, videos, directory
- **Takeaway:** The directory-as-resource-hub pattern is what we're building. They did it without custom development.

### 3. Vermont Arts Council — vermontartscouncil.org/arts-calendar/
**Why it matters:** Best real-world events UX at any scale.
- Statewide crowdsourced events calendar with three views: list, calendar grid, map
- Sidebar filters by category, tag, city, region
- Free public event submission
- **Takeaway:** The filter sidebar + list/grid/map view toggle is the UX reference for our events page.

### 4. Creative Directory Napa Valley — creativedirectorynapavalley.com
**Why it matters:** Best model for the creative business directory component.
- Searchable directory of artists, makers, nonprofits with profile pages
- Browse by category or name
- Separate "opportunities" section (open calls, jobs, grants)
- Free profiles + optional paid upgrade
- **Takeaway:** The free-profile + paid-upgrade model is worth considering for sustainability. The opportunities section maps to Culture Forward Goal 2's artist networking features (post-MVP).

### 5. Paseo Arts District (OKC) — thepaseo.org
**Why it matters:** Best budget-scale analog. Full events + directory on Squarespace.
- Gallery events, workshops, programs calendar
- Business listings as de facto directory
- Monthly "First Friday" as editorial anchor
- **Takeaway:** Proves you can run this on zero custom tech — but also shows the ceiling. Squarespace can't do an interactive map with 1,969 pins. We're already past this.

---

## Additional Comparables

| Site | Scale | What they have | Useful pattern |
|------|-------|---------------|----------------|
| Rockford Area Arts Council (artsforeveryone.com) | Regional | Cultural assets map tied to cultural plan narrative | Framing language connecting map to strategic plan |
| Arts in California Parks (artsincaliforniaparks.org) | State program | Map-list synchronized viewport filtering | Exact MapLibre UX pattern we want |
| Shasta County Arts Council (shastaartscouncil.org) | County | Simple events hub, classes, concerts | Minimal viable footprint for county arts council |
| Paseo Arts District (thepaseo.org) | Neighborhood | Squarespace-based events + directory | Budget ceiling demonstration |

---

## Platforms Referenced in Culture Forward

| Platform | Context | Relevance to MVP |
|----------|---------|-----------------|
| **Trumba** | Current NCAC calendar system | Direct — primary events data source |
| **CitySpark** | Recommended alternative calendar platform with geofencing, category targeting, mobile-friendliness | Post-MVP evaluation — could replace Trumba if features needed |
| **STQRY** | Mobile app platform used by GVNC Cultural District for self-guided tours | Post-MVP — tour/itinerary feature could leverage this |
| **Placer.AI** | Recommended for attendance/participation tracking | Analytics layer, post-launch |
| **Squarespace** | Current NCAC website host | Hosting decision TBD — hub may live standalone on Vercel |

---

## What No One Has (Our Differentiator)

The research confirms these features would make the NCAC hub unique among peer organizations:

1. **Calendar + map integration** — clicking an event surfaces the venue on the map, clicking a map pin shows upcoming events at that venue. Nobody does this at our scale.
2. **1,969-asset interactive MapLibre map** — technically more sophisticated than any comparable org's map (most use embedded ArcGIS iframes)
3. **Curated artisanal-only directory** — "no Jack in the Box" curation philosophy vs. generic chamber directories
4. **Brand-designed Gallery Frame UI** — a distinctive visual identity from Kevin Bird's brand system, not a WordPress theme

---

## Implications for Our Brief

**No changes needed to the brief.** The research validates our approach:
- Events + Map as MVP core is correct — it's what everyone else struggles to unify
- Vanilla HTML/CSS/JS + MapLibre is the right tech choice — peer orgs use WordPress + plugins, we're building something more integrated
- The "coming soon" placeholder approach for Plan a Visit and Stories is fine — no comparable org has itineraries at this scale anyway
- The deferred features list (ticketing, external scraping, artist directory) aligns with what peer orgs built in later phases

**One addition worth considering (post-MVP):** Napa Valley's "opportunities" section (open calls, grants, jobs) maps directly to Culture Forward Goal 2's artist networking features. Could be a lightweight win after launch.
