# Description Rewrite Pilot — 2026-07-02

**Status: PROPOSAL — no data files touched. Awaiting owner approval before any sweep.**

Per the standing ruling (no mass rewrites of `data/places.json` without explicit approval), this is a pilot: pattern characterization, a voice guide, and 10 drafted before/afters. Nothing has been written to `data/`.

---

## 1. The boilerplate, characterized

All 441 flagged descriptions are **one template family**:

> `A {subcategory} entry in {city}, included for alpha review while source descriptions are cleaned.`

Real examples, verbatim:

- `hirschman-trail-nevada-city`: "A walks & trails entry in Nevada City, included for alpha review while source descriptions are cleaned."
- `south-pine-cafe-grass-valley`: "A eat, drink & stay entry in Grass Valley, included for alpha review while source descriptions are cleaned." *(note the ungrammatical "A eat" — the template doesn't even a/an correctly)*
- `mountain-arts-collective-truckee`: "A galleries & studios entry in Truckee, included for alpha review while source descriptions are cleaned."
- `truckee-river-regional-park-truckee`: "A walks & trails entry in Truckee, included for alpha review while source descriptions are cleaned."

Template variants by fill-in ({subcategory} × {city}): the biggest single bucket is "walks & trails entry in Nevada County" (213 of 441). Distribution: Walks & Trails 243, Eat/Drink/Stay 84, Shops & Makers 65, Galleries & Studios 19, Cultural Resources 12, Performing Arts 12, rest <10.

**Visitor exposure today:** 35 of the 441 are `map-ready` (render on the map now); the rest are candidates. Also, `app.js:1546` explicitly excludes boilerplate places from the "under-the-radar picks" feature — every rewrite makes a place eligible for that rail.

## 2. Proposed voice guide

Match the register already in `index.html` — short declaratives, concrete nouns, one em-dash aside, visitor-facing warmth, zero hype ("Pick a place to see what makes it worth a visit", "Grass Valley and Nevada City are where the map is densest — the wider county stays in view").

**Rules:**

1. **1–3 sentences, ~80–320 chars.** Existing real descriptions: median 255 chars.
2. **First sentence stands alone** — the rail shows `firstSentence()` only (`app.js:2520`), so the lead must work as a teaser.
3. **Third-person map voice**, not first-person business copy. (Existing scraped descriptions are "we/our" — fine to leave those; new copy is the map speaking.)
4. **Every noun is sourced.** Allowed grounding, in order of preference:
   - **Tier A — place's own website, verified alive this pass** (facts + short quoted phrases; for trails this includes the trail manager's page, e.g. bylt.org).
   - **Tier B — in-repo joins**: MUSE story links (`data/muse-stories.json`), trail geometry presence (`data/trails.json`), record fields (name, category, city, address).
   - **Tier C — record-only floor**: name + category + city/address, plainly stated. Thin is fine; thin and true beats rich and invented.
5. **Never**: hours, prices, menus, events, ratings, "award-winning", historical claims not on the source page, or geography not in the record ("riverside", "downtown", "historic") unless the source page says it.
6. **Provenance field**: each rewrite gets `descriptionSource` extending the existing convention (227 places already carry `{kind:"venue-website", url, fetched}`). Website-grounded rewrites reuse `venue-website` only if quoting their copy; map-voice rewrites get a new kind (proposed: `"map-editorial"`, with `basis: ["website"|"muse"|"record"]`) so the UI's "In their own words" line (`app.js:2080`) never fires falsely.

## 3. Before/after — 10 pilot drafts

**Nothing below is applied.** Each shows grounding tier and source.

### Trails (the 90%-boilerplate category)

**1. Hirschman Trail** — Nevada City · candidate · Tier A (bylt.org, fetched 2026-07-02 via browser)
- Before: "A walks & trails entry in Nevada City, included for alpha review while source descriptions are cleaned."
- After: "A 2.4-mile trail a mile from downtown Nevada City, centered on Hirschman's Pond — five acres of water beneath cliffs carved by 1800s hydraulic mining. The first stretch is built to ADA standards and crosses a 40-foot trestle; dogs on leash."
- Every fact from the Bear Yuba Land Trust trail page (the record's own `website`).

**2. Buttermilk Bend Trail** — Penn Valley · map-ready · Tier B (website dead; MUSE join)
- After: "A walking trail off Pleasant Valley Road in Penn Valley — one of the outings in MUSE's 'Seasons in the GVNC Cultural District.'"

**3. Litton Trail** — Nevada City · map-ready · Tier C (website field is an AllTrails page; blocked/unreadable, treated as ungroundable)
- After: "A walking trail in Nevada City, reached from Via Colina Drive."
- Deliberately thin — this is the honest floor when nothing verifiable exists.

**4. Truckee River Regional Park** — Truckee · map-ready · Tier B (website dead — tdrpd.org 404; 5 MUSE joins)
- After: "Truckee's regional park on Brockway Road — a recurring MUSE stop, from the annual Calendar of Events to 'The Culture of Food in Nevada County.'"

### Venues (Eat, Drink & Stay)

**5. The Outside Inn** — Nevada City · map-ready · Tier A (outsideinn.com, alive)
- After: "A family-owned motel two blocks from downtown Nevada City, with themed rooms and an adventure bent — the office keeps a library of hiking and biking route info, and dogs are welcome in most rooms."

**6. Szabo Vineyards Tasting Room** — Nevada City · map-ready · Tier A (szabovineyards.com, alive)
- After: "Szabo Vineyards' tasting room on Broad Street in Nevada City — 'Californian wine, with Hungarian roots,' in their words."

**7. South Pine Cafe** — Grass Valley · map-ready · Tier B (southpinecafe.com **DNS-dead**, confirmed this pass; MUSE join)
- After: "A cafe on Richardson Street in Grass Valley, featured in MUSE's 'Seasons in the GVNC Cultural District.'"
- ⚠ **Flag**: domain no longer resolves and record already says `websiteStatus: dead` — verify the cafe is still open before shipping any copy.

### Galleries & Studios

**8. Mountain Arts Collective** — Truckee · map-ready · Tier B (site up but in maintenance mode; 3 MUSE joins)
- After: "An artists' collective and gallery on Donner Pass Road in Truckee — a stop in MUSE's '48 Hours in Truckee' and 'In Nevada County, the Arts Are Essential.'"

**9. Athena** — Grass Valley · map-ready · Tier C (no website on record)
- After: "A gallery space at 201 W Main Street in Grass Valley."
- ⚠ **Flag**: zero web presence in the record — candidate for a local-knowledge pass.

### Shops & Makers

**10. Full Circle Press** — candidate · Tier A (full-circle-press.com, alive)
- After: "A letterpress print shop — 'the original social media,' as they put it — printing wedding suites, business cards, and stationery, by appointment."
- ⚠ **Flag**: record says Grass Valley, their own site says Nevada City. City conflict to resolve before this one ships.

## 4. What the pilot surfaced beyond copy

- **Server-side fetches under-count live sites** (matches the 2026-07-02 audit): bylt.org 403s to scripts but loads fine in a real browser — the sweep must fetch through the browser for bot-blocked domains, or fall back to Tier B/C.
- **Aggregator links (AllTrails, Trailforks, recreation.gov) aren't groundable** — treat as no-website (Tier B/C). ~Many trail `website` fields are aggregators.
- **Rewrites double as a liveness pass**: 2 of 10 pilot places surfaced real data flags (South Pine possibly closed; Full Circle Press city conflict). The sweep should emit a flags file, not silently "fix".

## 5. Proposed sweep mechanics (only after approval)

- Priority order: 35 map-ready boilerplate first (visitor-facing today), then Walks & Trails candidates (243), then the rest — batches of ~40.
- Per batch: fetch each place's website (browser fallback where blocked) → draft per voice guide → set `description` + `descriptionSource {kind:"map-editorial", basis, fetched}` → append `data/changelog.json` entry (required by pre-commit hook) → `git pull --rebase` on a clean tree → commit with trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Side outputs: `.planning/description-sweep-flags.md` (closures, conflicts, malformed URLs), never edits beyond `description`/`descriptionSource`.
- Loopified with a verifier: boilerplate count strictly decreasing, no place loses a field, JSON valid, every new description free of the banned-claims list (hours/prices/$ regex + spot-check sample per batch).
- Nightly cron pushes master daily, so each batch lands on the live map within a day of its commit.
