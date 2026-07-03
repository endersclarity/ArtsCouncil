---
target: v1-discovery-map design-taste rescore (register audit round)
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-07-03
slug: cultural-map-redesign-stitch-lab-v1-discovery-map
---
# Critique: v1-discovery-map design-taste rescore (2026-07-03, live at localhost:4180)

## Score: 35/40 (Very good)
Heuristics (/4, same rubric as the 2026-07-02 series; prior total 32):
- Visibility of status **4** — selection sync now holds everywhere exercised: event list rows carry `.active` after a pick, route-stop taps keep the Paths tab + `mode=paths&path=…` URL, trail picks write `mode=trails&place=alan-thiesen-trail-alta-sierra`. Deep links round-trip.
- Match with the real world **3** — "Today / 11am—6pm" replaces the wrong "Tonight" on daytime events (verified on the Night Dimension card); but the Makers route still narrates the product ("This path shows that the Discovery Map can point to culture being made…") and the search count claims a map scope the map doesn't deliver.
- User control & freedom **4** — the out-of-filter hatch now says what it does ("Clear filters to show 5 more matches"), Close/back on every card, "Back to browse" on local reveal.
- Consistency **3** — the Events panel contradicts itself: topline "49 upcoming events" vs list header "Events (22 · 49 dates)" (code: `updateCount` prints `state.events.length` = date occurrences, app.js:815-817). "Events" still names both a mode tab and a rail chip.
- Error prevention **3** — "3 matching of 195 places on the map" still implies the map filters on search; `filteredPlaces()` (app.js:~800) ignores `state.searchQuery`, so the dots don't change. The copy misleads exactly when a user is hunting.
- Recognition over recall **4** — anchor monograms are now decoded at point of use ("MK · Working artist studio stop" inside the stop card), the mood row reads "Events · 74 venues" (finally distinct from the 49-dates tab), legend and hints are plain.
- Flexibility & efficiency **4** — four modes, mood chips × search intersection with honest counts, story-to-map pivots, Surprise me, keyboard focus-visible rules on every interactive class (styles.css:411-418, 45 `:focus-visible` rules).
- Aesthetic & minimalist **4** — the all-caps purge landed: computed-style sweep of every visible text node found uppercase only on the nav "MUSE Magazine" link, the "Internal preview build" pill, the "Start here" flag, and the "Walk this route" kicker — all nav/badge/pill/kicker territory. Zero italic text anywhere; `em` is explicitly reset in five selectors (styles.css:1712, 2402…). Trail spec labels are titlecase, "‹ All routes" is sentence case.
- Error recovery **3** — empty search is still a dead end ('No places match "zzzqqq".' — no clear action, no suggestion); filter-clearing hatch has no undo (though its copy is now honest).
- Help & documentation **3** — mode hints, legend, approximate-pin caveats, photo credits all present; nothing teaches the 22-vs-49 distinction the panel itself trips over.

## How it was judged
Fresh Chrome tab (hidden-tab rig, own tab, repaint pump). Exercised: default view + full text audit; Art mood chip; search "theatre" with Art active (3-of-195, hatch); Events tab, Night Dimension card (waited out the fly-to-touchdown deal — cards render, earlier "no card" was rig latency, not a bug); Paths → Makers route → ASiF stop card; Trails → Alan Thiesen Trail card; Stories from MUSE list + "New Gold in Nevada County" story; Surprise me; empty search; focus styles; console. Brand tokens live: `--ncac-red #ff2500`, Polymath stack on body. Console: zero application errors.

## Environmental caveats (not scored)
- The basemap never reached `map.loaded()` in this hidden tab, so everything gated on the map `load` event — the discovery rail (`initDiscoveryRail`, app.js:4006 inside `map.on("load")`), Drift, and marker layers — could not be judged live this round. Rail/Drift verification carries over from the 2026-07-02 rescore-3 rig run; no code changes were assumed.
- Basemap tint, motion smoothness, GSAP entrances, and real mobile viewport remain out of scope in this rig; mobile judged from CSS only.
- `queryRenderedFeatures` results were not used for any finding (per standing rig caveat).

## Ranked findings

### P0 — none.

### P1 — none.

### P2
- **Events panel contradicts its own arithmetic.** Topline count says "49 upcoming events"; the list header four lines below says "Events (22 · 49 dates)". 49 is date occurrences (`state.events.length`, app.js:815-817), 22 is actual events. Repro: click the Events mode tab. Fix is one string: "22 events · 49 dates".
- **Search still claims a map scope it doesn't have** (persists from rescore 3, verified in code this round). With Art + "theatre" active the list says "3 matching of 195 places on the map", but `setSourceData()` feeds the map from `filteredPlaces()`, which never consults `state.searchQuery` — every dot stays up. Either scope the dots or say "in the list". app.js:905 (copy), ~800 (filter).
- **The Makers route blurb still pitches the product to the visitor** (persists). data/paths.json:50: "This path shows that the Discovery Map can point to culture being made, taught, shared, and practiced, not only culture on a calendar." The other three routes speak to the walker; this one speaks to a stakeholder meeting.

### P3
- **"CANDIDATE IMAGE" badge on the ASiF Studios stop card** (persists) — internal QA vocabulary on a visitor surface; the card already says the honest version in its "Good to know" line. Repro: Paths → Makers / Working Artists → tap ASiF Studios.
- **Empty search is a dead end** (persists): 'No places match "zzzqqq".' with no clear-search button and no suggestion (the clear affordance only appears when filters hide matches).
- **Redundancy set** (persists, reduced): place list rows still state the category twice (meta "Arts Organizations / Grass Valley" + uppercase badge "Arts Organizations"); the trail card still links the same BYLT URL three ways ("Trail info: BYLT", "Open website", "Visit site").
- **Filter-clear hatch has no undo.** The copy is now honest ("Clear filters to show 5 more matches") but the action still discards the mood chips with no one-tap restore.
- **"Featured in MUSE 128" mood row** reads as a place count with no unit while its sibling now says "74 venues" — one row learned the lesson, the other didn't.

## Register audit (the round's special attention)
- **All-caps:** computed `text-transform` + raw-text sweep across default view, mood list, place card, event card, path card, trail card, story panel. Uppercase found only on: nav "MUSE Magazine" link, "Internal preview build" alpha pill, "Start here" feature flag, "Walk this route" kicker, "place-list-badge" category pill. All are nav/badge/pill/kicker chrome — within the reasonable-brand-mark carve-out. The body-copy all-caps of the July 2 pass ("WHAT ARE YOU IN THE MOOD FOR?", red "DIFFICULTY/LENGTH/SURFACE/USES", "ALL ROUTES") is gone.
- **Italics:** zero italic computed styles anywhere exercised; data-borne `<em>` is defensively reset (`.seen-in-muse-item em`, `.event-list-copy em`, etc.). No major-work titles are italicized either — acceptable; the rule is "nothing else," not "always works."
- **Dates:** guide-perfect in UI-composed strings ("Today / 11am—6pm", "Jul 3", "Also Jul 4, Jul 5, Jul 6 +10 more"). Ordinals ("June 20th", "August 16th.,") survive **inside Trumba feed prose** on the Night Dimension card — data flag below, not UI chrome.
- **Titlecase:** program tabs, categories, and headings comply.

## Fixed since rescore 3 (verified, not assumed)
Tonight→Today kicker; trails URL deep-link; route-stop tap keeps Paths mode + URL; hatch copy honesty; mood "Events 74 venues" disambiguation; event list active-state sync after selection; monogram decoding at point of use; top-right collision cluster (Alan Thiesen title x-end 1303 vs Close x 1319; "‹ All routes" x 1293 vs wrapped title x-end 1274; County chip relocated to x 876, clear of the 1100+ drawer); the all-caps purge.

## Data flags (unchanged owners' list)
- Trumba prose ships stale, rule-breaking copy verbatim (Night Dimension: past June 20 reception, "August 16th.," typo, ordinals, "Those We/You Meet" title drift).
- Duplicate venue records "Nevada Theater"/"Nevada Theatre"; "The Lyric Rose Rose Theatre Company" doubled word.

## Verdict
**Score 35/40 · P0: 0 · P1: 0 · Brand-register violations found: NO** — remaining uppercase is confined to nav/badge/pill/kicker chrome, no italics anywhere, titlecase and date formats conform in all UI-composed text (ordinals persist only inside third-party feed prose — flagged to the data owner, not a UI violation).
