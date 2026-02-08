# Design Critique: The Culture of Gold Country (Phase 3 Review)

**Date:** 2026-02-07
**Reviewed:** Full site at `index-maplibre.html` after Phase 3 "Quiet Graphics" rebrand + watercolor integration
**Method:** `impeccable:critique` + `frontend-design` anti-pattern analysis

---

## Anti-Patterns Verdict: MIXED

The hero is AI slop. The rest of the site has genuine character but is undermined by specific patterns. **The map section is the best thing on the page** — real functionality, beautiful Landscape basemap, and the corridor/experience cards show genuine editorial thinking.

### AI Tells Found:
1. **Hero metrics row** (685 / 10 / 12) — quintessential AI landing page pattern
2. **Hero 50/50 split** — text-left, clip-art-right is default AI composition
3. **Explore list** — plain text rows with tiny colored dots, a database dump
4. **Category card grid** — 2-column uniform cards, standard AI dashboard pattern
5. **Watercolor clip art scattered as decoration** — faint images at corners without compositional intent

### What Doesn't Look AI-Generated:
- Corridor/experience cards with colored dots and stop counts — feel authored
- Map with Landscape basemap and 3D terrain — genuinely beautiful
- Filter pills with category dots — well-crafted
- Intro prose — clearly human-written
- "from MUSE '26" corridor branding — specific, intentional, real

---

## Priority Issues (Ordered by Impact)

### 1. The Hero Actively Hurts the Site
The hero is the weakest section. Cream background with scattered watercolor clip art and vanity metrics. Visitors form the "template landing page" impression before reaching the map.

**Recommended fixes (pick one):**
- **(A) Map-as-hero**: Full-viewport map with cinematic fly-in, title overlay, "Start Exploring" CTA. The terrain IS the hero image.
- **(B) Full-bleed title**: Magazine-style. Just the title, massive, centered, quatrefoil badge as subtle watermark. No stats, no illustrations, no split grid.
- **(C) Bring back dark but better**: Remove stats row, bigger title, badge as sole illustration at subtle opacity. Dark-to-cream bookend was actually a good editorial choice.

### 2. The Explore List Is a Spreadsheet
Plain text rows — name, city, tiny colored dot. No images, descriptions, or visual hierarchy. Takes ~40% of page real estate, provides least value.

**Fix:** Transform into rich cards (2-3 column grid with category watercolor, name, city, description, color bar) — or simplify to compact search-only tool that complements the map.

### 3. Category Cards Are Generic
2x5 grid of identical cards with 38x38px watercolor thumbnails. Beautiful illustrations trapped in tiny boxes. Looks like a SaaS metrics dashboard.

**Fix:** Asymmetric masonry layout with 2-3 featured categories larger, or horizontal strips with watercolor bleeding left.

### 4. Cream-on-Cream Has No Rhythm
Hero (cream) → Intro (cream) → Map header (barely different parchment) → Explore (cream) → Footer (dark). One continuous tone, sections blur together.

**Fix:** Alternating visual treatments — full-bleed image dividers, tinted sections, watercolor wash strips, full-bleed map with no header padding.

### 5. Colophon/Footer Is an Afterthought
Dark bar with tiny text. A cultural project deserves proper closing — credits, attribution, CTA.

---

## What's Working Well

1. **The map itself is exceptional.** 3D terrain, warm basemap, colored markers, corridor routes — the real deliverable.
2. **The intro prose is strong.** "This is not a county that treats culture as decoration. It is the infrastructure." — confident, specific.
3. **The corridor/experience system is smart UX.** Separating corridors from experiences, MUSE branding — real information architecture.

---

## Strategic Questions

- What if the page started AT the map? Title overlay on terrain, scroll for context.
- What if category cards were the navigation, not filter pills?
- Is the explore list earning its real estate?
- What's the ONE screenshot to pitch to the Arts Council board? Build the hero around that.
- What would a one-screen experience look like? Map full-viewport, sidebar for filtering, corridors as overlay.

---

## Phase 3.5 Action Items

Based on this critique, Phase 3.5 should address:
1. Hero redesign (pick approach A, B, or C above)
2. Explore list overhaul (rich cards or compact search)
3. Category card redesign (break the uniform grid)
4. Visual rhythm between sections
5. Colophon upgrade
