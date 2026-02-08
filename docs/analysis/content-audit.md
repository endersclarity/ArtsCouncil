# Content and Information Architecture Audit

**Audit Date:** 2026-02-08
**Auditor:** Content Analyst (cultural-map-analysis team)
**Dataset:** `website/cultural-map-redesign/data.json` (685 POIs)
**Framework:** Perplexity content richness criteria + FEATURES.md graceful failure requirements

## Executive Summary

This audit evaluates content quality and completeness across 685 cultural assets in Nevada County's interactive map. Key findings:

- **Overall completeness:** Core fields (name, location) are nearly complete, but supplementary fields (hours, phone, website) show significant gaps
- **Category disparity:** Commercial/active venues (Eat/Drink/Stay: 100% phone) vastly outperform passive sites (Historic Landmarks: 0% phone/website)
- **Description quality:** Strong overall (89% have descriptions, average 250 chars), but 74 POIs lack any description
- **Cultural storytelling:** Only 42% of descriptions contain explicit cultural/historical keywords — many POIs are listed as "places" without narrative context
- **Data sparseness:** 168 POIs (24.5%) are missing 3+ critical fields, creating poor user experiences for discovery

**Critical gap:** The dataset supports basic wayfinding ("where is it?") but struggles with cultural storytelling ("why does it matter?") and real-time discovery ("can I visit now?"). This undermines the stated project goal: "spontaneous cultural engagement."

## Methodology

### Sampling Strategy

**Stratified random sampling** to ensure representation across all 10 categories:
- Target: 30 POIs (4.4% of total)
- Method: Random selection within each category, proportional to category size
- Minimum: 2 POIs per category to capture outliers
- Tool: Python `random.sample()` with seed for reproducibility

**Rationale:** Simple random sampling would oversample Historic Landmarks (219/685 = 32%) and undersample Performance Spaces (26/685 = 3.8%). Stratified approach ensures each category's data quality is assessed.

### Fields Audited

Based on Perplexity framework "Content richness" criteria:

- **`n` (name):** Required for all POIs
- **`a` (address):** Required for wayfinding
- **`c` (city):** Helps with geographic filtering
- **`d` (description):** Enables cultural storytelling (Perplexity: "narratives, local voices")
- **`p` (phone):** Contact for hours verification, reservations
- **`w` (website):** Deep link for details, tickets, events
- **`h` (hours):** Enables "Open Now" filter (Phase 1 deliverable per STATE.md)
- **`pid` (Google Place ID):** Required for Google Places API integration

### Quality Criteria

1. **Field completeness:** Presence vs absence of data
2. **Description richness:** Character count distribution (short <50, medium 50-200, long 200+)
3. **Cultural keywords:** Presence of heritage/historical language (see keyword list below)
4. **Category consistency:** Within-category field completion patterns
5. **Graceful failure:** Can UI handle missing data without breaking? (per FEATURES.md)

## Dataset Overview

### Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| Historic Landmarks | 219 | 32.0% |
| Eat, Drink & Stay | 94 | 13.7% |
| Arts Organizations | 67 | 9.8% |
| Cultural Resources | 58 | 8.5% |
| Galleries & Museums | 52 | 7.6% |
| Walks & Trails | 52 | 7.6% |
| Fairs & Festivals | 51 | 7.4% |
| Public Art | 42 | 6.1% |
| Performance Spaces | 26 | 3.8% |
| Preservation & Culture | 24 | 3.5% |
| **Total** | **685** | **100.0%** |

**Observation:** Dataset is heavily weighted toward Historic Landmarks (1/3 of all POIs). This reflects the county's Gold Rush heritage but may skew user experience toward historical tourism vs contemporary cultural engagement.

## Field Completeness Analysis

### Overall Dataset Statistics

| Field | Complete | Missing | % Complete |
|-------|----------|---------|-----------|
| **n** (name) | 685 | 0 | 100.0% |
| **a** (address) | 678 | 7 | 99.0% |
| **pid** (Place ID) | 652 | 33 | 95.2% |
| **d** (description) | 611 | 74 | 89.2% |
| **c** (city) | 466 | 219 | 68.0% |
| **h** (hours) | 401 | 284 | 58.5% |
| **w** (website) | 395 | 290 | 57.7% |
| **p** (phone) | 357 | 328 | 52.1% |

**Key findings:**

1. **Core wayfinding data is strong:** 99% have addresses, 100% have names. Users can locate POIs on a map.

2. **Hours coverage is moderate (58.5%):** Per STATE.md, 401/685 POIs have hours data from Google Places API. This means **42% of POIs cannot support "Open Now" filter** — a Phase 1 deliverable.

3. **Contact info is weak:** Only 52% have phone numbers, 58% have websites. Users cannot easily verify details or book visits for ~40% of venues.

4. **City field gaps:** 32% of POIs lack city names. This breaks geographic filters (e.g., "Show me cultural sites in Truckee").

5. **Place ID coverage:** 95% have Google Place IDs, enabling API lookups. The 5% without PIDs are likely user-submitted or non-commercial sites (trails, monuments).

### Completeness by Category

| Category | Description | Phone | Website | Hours |
|----------|-------------|-------|---------|-------|
| **Eat, Drink & Stay** | 97.9% | 100.0% | 97.9% | 70.2% |
| **Fairs & Festivals** | 98.0% | 98.0% | 98.0% | 64.7% |
| **Galleries & Museums** | 98.1% | 98.1% | 94.2% | 67.3% |
| **Preservation & Culture** | 100.0% | 95.8% | 100.0% | 58.3% |
| **Arts Organizations** | 92.5% | 92.5% | 95.5% | 61.2% |
| **Performance Spaces** | 88.5% | 100.0% | 100.0% | 50.0% |
| **Cultural Resources** | 86.2% | 87.9% | 93.1% | 74.1% |
| **Public Art** | 95.2% | 0.0% | 0.0% | 83.3% |
| **Historic Landmarks** | 100.0% | 0.0% | 0.0% | 45.2% |
| **Walks & Trails** | 0.0% | 0.0% | 69.2% | 42.3% |

**Patterns identified:**

1. **Commercial venues have rich data:** Restaurants, festivals, galleries have 95%+ completion across all fields. These are businesses with active online presence and Google My Business listings.

2. **Historic Landmarks have zero contact info:** 100% have descriptions (narrative content), but 0% have phone/website. These are often historical markers or sites without operating entities.

3. **Public Art has polarized data:** 95% descriptions, 83% hours (hours = "always accessible"), but 0% phone/website. Makes sense — murals don't have business listings.

4. **Walks & Trails are description-deserts:** 0% have descriptions. Users see a name and location but no context (difficulty, length, highlights). Critical UX gap.

5. **Hours data varies widely:** Cultural Resources (74%) vs Performance Spaces (50%). Likely reflects business model — educational venues have consistent hours, theaters have event-based schedules.

### Implications for Real-Time Discovery

From STATE.md, the goal is "spontaneous cultural engagement" via "Open Now" filter. But:

- **284 POIs (42%) lack hours data** → Cannot display open/closed status
- **Walks & Trails (42% hours) and Historic Landmarks (45% hours)** → Half of outdoor/historical sites won't support time-based filtering
- **Public Art (83% hours)** → High coverage, likely flagged as "always accessible"

**Recommendation:** Phase 1 should prioritize venues where "open/closed" is meaningful (galleries, restaurants, museums) and gracefully degrade for sites where hours are N/A (trails, monuments). See "Graceful Failure Assessment" below.

## Stratified Sample Analysis (30 POIs)

### Sample Distribution

| Category | Sampled | Total | % Sampled |
|----------|---------|-------|-----------|
| Eat, Drink & Stay | 3 | 94 | 3.2% |
| Arts Organizations | 3 | 67 | 4.5% |
| Cultural Resources | 3 | 58 | 5.2% |
| Fairs & Festivals | 3 | 51 | 5.9% |
| Galleries & Museums | 3 | 52 | 5.8% |
| Historic Landmarks | 3 | 219 | 1.4% |
| Performance Spaces | 3 | 26 | 11.5% |
| Preservation & Culture | 3 | 24 | 12.5% |
| Public Art | 3 | 42 | 7.1% |
| Walks & Trails | 3 | 52 | 5.8% |
| **Total** | **30** | **685** | **4.4%** |

### Sample Quality Observations

**High-quality examples:**
- **Sergio's Caffe** (Eat, Drink & Stay): Rich 150-char description about owner's culinary background, phone, website, no hours
- **Naggiar Vineyards** (Eat, Drink & Stay): "Surprising gem" description, full contact info, hours included
- **CATS Theatre** (Arts Organizations): Mission-statement description, full contact, hours
- **North Star Historic Conservancy** (Preservation & Culture): Clear mission ("re establish unique, historic North Star House"), full data

**Medium-quality examples:**
- **Sierra BrewFest** (Fairs & Festivals): Short description ("unlimited microbrew tasting experience"), full contact/hours
- **Truckee Rodeo** (Fairs & Festivals): Mission statement, full contact, no hours (seasonal event)
- **Utopian Stone** (Galleries & Museums): Rich historical context ("founded in 1974 by G. [founder]"), full data

**Low-quality examples:**
- **Malakoff Diggins State Historic Park** (Walks & Trails): **EMPTY DESCRIPTION**, no phone, no website, no hours — user has zero context beyond the name
- **Spaulding Reservoir** (Walks & Trails): **EMPTY DESCRIPTION**, website only, no hours
- **Truckee River Legacy Trail** (Walks & Trails): **EMPTY DESCRIPTION**, website only, no hours
- **Hard Rock Gold Mining** (Historic Landmarks): Description present ("Within a one-mile radius more than..."), but no phone, no website (historical marker)
- **Metal Bike** (Public Art): Minimal description ("Justin Self, Fusion CraftWorks" — artist attribution only), no phone/website, has hours

**Pattern:** Walks & Trails and Public Art systematically lack narrative content. Users cannot distinguish between a casual stroll and a challenging hike, or between a sculpture and a mural installation.

## Description Quality Analysis

### Length Distribution

- **POIs with descriptions:** 611/685 (89.2%)
- **Average description length:** 250.3 characters
- **Short descriptions (<50 chars):** 14 POIs (2.3% of described)
- **Medium descriptions (50-200 chars):** 124 POIs (20.3%)
- **Long descriptions (200+ chars):** 473 POIs (77.4%)

**Interpretation:** Most POIs (77%) have rich, paragraph-length descriptions. This is unusually high quality for user-generated cultural data. Likely reflects the Arts Council's editorial standards when importing from ArcGIS.

**Concern:** The 74 POIs with NO description are concentrated in Walks & Trails (52 missing, 100% of category). This creates a two-tier user experience.

### Content Examples (from sample)

**Excellent cultural storytelling:**
> "On this site donated by Anna Pusheck the German Evangelical Lutheran St. Paul congregation built their first church in 1911..." — **St. Paul Lutheran Church Site**

> "This building completed December 18, 1872, was the law office for three generations..." — **Searls Law Office**

> "The Conservancy is working to re establish the unique, historic North Star House..." — **North Star Historic Conservancy**

**Adequate but generic:**
> "Enjoy a local culinary adventure by tasting your way through the Purveyors Pantry..." — **Purveyors Pantry**

> "An eclectic mix of cutting edge performances from around the world" — **Nugget Fringe Theater Festival**

**Minimal (artist attribution only):**
> "Artist: Andrea Eiermann." — **North San Juan Post Office Mural**

> "Justin Self, Fusion CraftWorks" — **Metal Bike**

**Missing entirely:**
> [No description] — **Malakoff Diggins State Historic Park**, **Spaulding Reservoir**, **Truckee River Legacy Trail**

**Observation:** Public Art descriptions often stop at artist attribution. Users learn "who made it" but not "what it depicts" or "why it's here." Missed opportunity for cultural narrative.

## Cultural Storytelling Assessment

### Keyword Analysis

**Cultural/historical keywords tested:**
`historic`, `heritage`, `gold rush`, `mining`, `pioneer`, `native`, `cultural`, `traditional`, `arts`, `community`, `founded`, `established`

**Results:**
- **POIs with cultural keywords:** 287/685 (41.9%)
- **POIs without cultural keywords:** 398/685 (58.1%)

**Interpretation:** Less than half of POIs explicitly position themselves within cultural or historical narratives. This suggests:

1. **Many descriptions are operational, not cultural:** "We offer pottery classes" vs "Rooted in the region's ceramic arts tradition..."
2. **Walks & Trails lack context entirely:** 0% descriptions = 0% cultural keywords
3. **Recent vs historical bias:** Contemporary venues (restaurants, galleries) may lack historical framing even when in historic buildings

### Examples of Strong Cultural Framing

> "Hard Rock Gold Mining 1850-1957. Within a one-mile radius of this spot more than $100,000,000 in Gold was removed by hard rock mining methods..." — **Hard Rock Gold Mining** (Historic Landmark)

> "The North Columbia Schoolhouse Cultural Center gives the rural San Juan Ridge community access to..." — **North Columbia Schoolhouse** (Performance Space)

> "To preserve the spiritual, medical, and cultural traditions of the Himalayan and Buddhist peoples." — **Ngakmang Foundation** (Preservation & Culture)

### Examples of Weak Cultural Framing

> "We offer Pottery, Candle Making, Paint & Sips, Wood Signs, DIY Bags and Pillows..." — **The Artist Workshop** (Gallery/Museum) — Reads like a price list, not a cultural venue

> "Sample over 60 microbrews and craft beers..." — **Sierra BrewFest** (Fair/Festival) — Functional description, no mention of regional brewing culture or heritage

> [Empty] — **All Walks & Trails** — Zero cultural or ecological context for outdoor spaces

**Recommendation:** Content enrichment phase should add:
1. **Trail difficulty/length/highlights** for Walks & Trails
2. **Cultural significance statements** for Public Art (beyond artist names)
3. **Historical context layers** for contemporary venues in historic districts (e.g., "Located in Nevada City's Victorian downtown, established 1849")

## Missing Data Patterns

### High-Sparseness POIs

**Definition:** POIs missing 3+ critical fields (`d`, `w`, `p`, `h`)

**Count:** 168/685 (24.5%) are sparse

**Top sparse categories:**
1. **Historic Landmarks:** 99 of 219 (45.2%) are sparse — mostly lack phone/website (historical markers)
2. **Walks & Trails:** 52 of 52 (100%) are sparse — lack descriptions + contact info
3. **Public Art:** 28 of 42 (66.7%) are sparse — lack phone/website (artworks have no "business" entity)

**Examples:**
- **Mooney Flat Hotel** (Historic Landmark): Has name, address, description, hours; missing phone/website
- **Grass Valley Library Royce Branch** (Cultural Resource): Missing 3/4 fields — surprising for an active public library
- **Athena** (Gallery/Museum): Missing 3/4 fields — likely closed or data entry error

**Not all sparseness is problematic:**
- **Trails without phone numbers** → Expected (no front desk to call)
- **Historical markers without websites** → Expected (passive sites)
- **Public art without hours** → Problem (should show "always accessible")

**Problematic sparseness:**
- **Active cultural venues missing websites** → Users cannot verify events, hours, admission
- **Libraries/community resources missing basic contact** → Data quality issue, not category constraint

## Graceful Failure Assessment

Per FEATURES.md: *"Graceful failure states: 'Hours unavailable' is better than broken UI. Not all 687 venues will have hours data. Show placeholder text, don't break the experience."*

### Current Data Supports Graceful Failure

**284 POIs (42%) lack hours.** UI must handle:

1. **Null hours for active venues** → Display "Hours not available" + link to website/phone
2. **Null hours for passive sites** → Display "Open to the public" (trails, monuments)
3. **Null hours for event-based venues** → Display "Check website for schedule" (theaters, festivals)

**Design implications:**

| Category | Expected Behavior When Hours Missing |
|----------|-------------------------------------|
| Eat, Drink & Stay | Show "Hours not available - Call to confirm" (critical data gap) |
| Galleries & Museums | Show "Hours not available - Visit website" (critical gap) |
| Performance Spaces | Show "Event-based schedule - Check website" (expected) |
| Fairs & Festivals | Show "Seasonal hours - Check website" (expected) |
| Historic Landmarks | Show "Viewable anytime" or "Daylight hours" (reasonable default) |
| Public Art | Show "Accessible 24/7" (reasonable default) |
| Walks & Trails | Show "Open dawn to dusk" or link to park hours (reasonable default) |

**Recommendation:** Implement category-aware placeholder text. Don't show "Hours unavailable" for a mural — show "Publicly accessible."

### Missing Website/Phone Creates Dead Ends

When hours are missing AND website is missing AND phone is missing (e.g., most Historic Landmarks), users have no recourse. They see:
- Name
- Address
- Description
- **[No way to verify details or learn more]**

**Mitigation strategies:**
1. **Link to Google Maps listing** using `pid` → Users can see Google reviews, photos, user-submitted hours
2. **"Suggest an edit" link** → Crowdsource data improvements via Google Maps
3. **City/County tourism website fallback** → Link to general Nevada County heritage resources

## Recommendations

### Immediate (Phase 1: Open Now Filter)

1. **Prioritize hours for time-sensitive venues:** Focus "Open Now" filter on categories where hours matter (Eat/Drink/Stay, Galleries, Performance Spaces). Exclude or visually separate categories where hours are N/A (Public Art, Trails).

2. **Implement category-aware placeholders:** Don't show "Hours unavailable" for public art. Show "Accessible anytime" or similar.

3. **Link to Google Maps for missing data:** 95% of POIs have Place IDs. When website/phone/hours are missing, add "View on Google Maps" link for crowdsourced details.

4. **Test hours data accuracy:** Validate Google Places API results for 20-30 sample venues. STATE.md flags this as a concern: "Google Places API hours data quality needs validation."

### Near-Term (Content Enrichment)

5. **Enrich Walks & Trails descriptions:** 52 POIs have zero descriptions. Add basic trail info:
   - Length (e.g., "2.5 mile loop")
   - Difficulty (easy/moderate/strenuous)
   - Highlights (e.g., "Scenic overlooks of the Yuba River")
   - Source: AllTrails API, USFS trail data, or manual curation

6. **Expand Public Art descriptions:** Move beyond artist names. Add:
   - Medium (mural, sculpture, installation)
   - Subject matter (abstract, figurative, historical)
   - Commission context (e.g., "Commissioned by Nevada City Arts Council, 2015")

7. **Add historical context to contemporary venues:** Many galleries, restaurants, and shops occupy historic buildings. Add single-sentence historical notes (e.g., "Housed in the 1862 Foundry Building, part of Nevada City's Gold Rush downtown").

8. **Audit and fix missing city fields:** 219 POIs (32%) lack city names. This breaks geographic filters. Source from Google Places API or manually verify.

### Long-Term (Cultural Narrative Layers)

9. **Tag POIs with cultural themes:** Create cross-category tags (e.g., "Gold Rush Heritage," "Indigenous Culture," "Arts & Crafts Movement," "Farm-to-Table Movement") and apply to POIs. Enables thematic filtering beyond categories.

10. **Author curated experience narratives:** Expand on the Gold Rush Heritage Trail model. Add editorial connector text between POIs that tells a cohesive story. Current data supports this (287 POIs have cultural keywords) but UI doesn't surface thematic connections.

11. **Integrate intangible heritage:** Per Perplexity framework, "intangible heritage (stories, community narratives, local voices)" is key to cultural maps. Consider:
    - Oral history clips for Historic Landmarks
    - Artist interview videos for Public Art
    - Community event stories for Cultural Resources

12. **Partner with Arts Council for data maintenance:** 24.5% of POIs are sparse. Establish quarterly data review process with Arts Council staff to update hours, add descriptions, verify closures.

## Appendix: Field Definitions

From CLAUDE.md:

| Field | Full Name | Description |
|-------|-----------|-------------|
| `n` | Name | POI title (100% complete) |
| `l` | Layer/Category | One of 10 categories (100% complete) |
| `a` | Address | Street address (99% complete) |
| `c` | City | City name (68% complete) |
| `d` | Description | Narrative text (89% complete) |
| `p` | Phone | Contact phone (52% complete) |
| `w` | Website | URL (58% complete) |
| `h` | Hours | Operating hours (59% complete) |
| `x` | Longitude | Coordinate (100% complete) |
| `y` | Latitude | Coordinate (100% complete) |
| `pid` | Place ID | Google Place ID (95% complete) |

## Appendix: Data Sources

- **Primary dataset:** `website/cultural-map-redesign/data.json` (generated 2026-02-08)
- **Audit script:** `.tmp/audit_script.py` (Python 3.12)
- **Sample size:** 30 POIs (stratified random sample)
- **Total POIs:** 685 across 10 categories
- **Source:** Nevada County Arts Council ArcGIS map (webmap ID `604050d4965c4b93b984781f72941d5b`)

---

**Next Steps:**
1. Share findings with team lead
2. Integrate recommendations into Phase 1 execution plan
3. Prioritize hours validation and graceful failure UI implementation
4. Schedule content enrichment sprint for Walks & Trails category (highest impact / lowest effort)
