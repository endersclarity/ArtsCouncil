---
target: v1-discovery-map county-polish pass 1 re-score (fresh independent critique)
total_score: 26
p0_count: 1
p1_count: 4
timestamp: 2026-07-02
slug: cultural-map-redesign-stitch-lab-v1-discovery-map
---
# Critique: v1-discovery-map county-polish pass 1 (2026-07-02, live at localhost:4180, master @ a03719c era)

## Score: 26/40 (Good, mid-band — up from 21 on 2026-06-12)
Heuristics: status 3, real-world 2, control 3, consistency 2, error-prevention 2, recognition 3, flexibility 3, minimalist 3, recovery 2, help 3.

Judged fresh in real Chrome (hidden-tab rescue rig), desktop ~1448x688. All four modes, filter, search, list + map-dot selection, rail chips + card, full Drift loop (start → 2+ stops → wheel-take → resume → Esc), changelog. Brand tokens verified live: `--ncac-red` resolves `#ff2500`, Polymath on h1 and body, poster-frame cards, "Tonight / 6—9pm" date format on cards. Zero console errors in the tracked window.

## Environmental caveats (not scored)
- Tab was hidden (0-fps): motion smoothness, Drift flight/orbit quality, and stop pacing were NOT judged (stops advanced 1→4 fast under throttled timers; real pacing unknown).
- Rescue rig replaced the basemap style with Liberty: basemap tint/warmth not judged. The always-on OSM path-context layer was absent from the layer stack after my forced setStyle — could not distinguish app bug from rig artifact; not scored either way.
- Mobile ~390px could not be rendered (window resize is a no-op on a hidden window). Mobile judged only by CSS inspection: breakpoints at 880/520px, hamburger, `pointer: coarse` 44px bumps, and two `prefers-reduced-motion` blocks all exist in styles.css but are unverified live.
- Rail images stalled blank at first paint — hidden-tab lazyload artifact; all 20 loaded when forced eager. Not a product bug; do not chase.

## Anti-patterns
Not slop. Craft high; explanation register vastly improved since June. Legend now explains the red system on-map. Remaining detector hits are copy-register (internal pipeline language on trail cards) and data hygiene leaking into UI (trail filter dropdowns), not visual slop.

## Priority issues (most damaging first)
- [P0] **Trail cards ship internal/contradictory pipeline copy.** Selecting "Alan Thiesen Trail" traces the full route on the map, yet the card says "**Map location coming soon**" directly above "**A walks & trails entry in Alta Sierra, included for alpha review while source descriptions are cleaned.**" — the app contradicts its own map and narrates its data pipeline to the visitor, plus a "PHOTO NOT YET SOURCED" tag over a half-card empty white block. Same class as June's P0 #3 (internal QA copy), still shipping on the newest surface. (Trail drawer, Alan Thiesen Trail; boilerplate confirmed in data — see Data flags; app.js:1546 already knows how to detect the "alpha review" string but the card renders it anyway.)
- [P1] **Trails mode first paint is an empty map.** Tab says "159 trails," panel says "Trails on the map," but zero geometry, trailheads, or markers render until a list pick (trail-lines source has 0 features on entry; screenshot shows blank basemap over GV↔NC). A first-time visitor sees a promise and a blank stage.
- [P1] **Stranded viewport persists; still no reset affordance.** After the trail flight (z16 Alta Sierra), switching to Places keeps the camera on a residential street: "1351 places to explore" over zero visible dots, no "back to county" control anywhere (searched for reset/fit/overview buttons — none). Selections now fly the camera (good), but nothing recovers a wandered one. June's P0 #2, half-fixed.
- [P1] **Trail filters expose raw dirty data with silent-exclusion semantics.** Surface dropdown offers "Natural earth," "Natural Earth," "Natural Earth, Gravel," "**Natural Eath**" (typo), "Paved," "Paved, Natural Earth"; Use/access offers combo strings ("Hiking" vs "Hiking, biking" as separate options). Picking "Hiking" silently excludes hiking-and-biking trails; picking either "Natural earth" excludes its case-twin. Wrong result sets guaranteed.
- [P1] **Drift bar controls are occluded by the selection drawer at short viewports.** At 1448x688, the touchdown card overlaps the bar's "4 / 42 ▶ →" cluster; during pause only ✕ is visible — the resume control the "you have the wheel" state depends on is hidden behind the card (screenshot: paused state, Center for the Arts). Buttons have proper aria-labels (Resume drift / Next stop / End drift) but you can't see them.
- [P2] Mode tab lights up "Events" after clicking an event rail card while the panel below stays Places content ("1351 places to explore", mood chips) and body mode stays `places` — tab state, panel content, and internal mode disagree three ways.
- [P2] Raw ISO dates ("2026-07-02") repeated down the visitor-facing events list and on changelog entries; the cards themselves format "Tonight / 6—9pm" correctly — one surface speaks brand, the other speaks database. Recurrence also floods the list (same "In the Night Dimension" on 07-02/03/04 fills three consecutive rows) and the rail (identical poster twice in the first four cards).
- [P2] Stale search text persists across filter changes: search "miners foundry," select the result, add mood "Art" → list warns "No places match 'miners foundry'" while the map shows 195 art dots. Clear filters exists (good) but the state that requires it shouldn't compound silently.
- [P2] Legend is one static strip in every mode: Events/Route symbols shown in Places mode, nothing about trails, stop numbers, or surprise-pick rings in the modes that use them; "Ringed & named · featured" collides with surprise-me's "ringed on the map" reuse of rings.
- [P2] Trails mode is missing from URL sync — body enters `mode=trails` while the URL rewrites to `mode=places` (places/events/paths all sync correctly); a shared Trails link restores Places.
- [P3] ST/FD/HI anchor codes appear undecoded in the path stop list (decoded properly on drift/place cards as "performance anchor" etc.); stops 3/4 markers stack at route-fit zoom; "Drift" chip is unexplained until pressed (the changelog explains it beautifully — the feature itself never does); all-caps microlabels ("WHAT ARE YOU IN THE MOOD FOR?", "BEFORE OR AFTER", tag chips) vs the brand's no-all-caps rule; italics used for business self-descriptions vs italics-for-major-works-only; mood row "Events 74" vs Events tab "48 upcoming" — two unexplained event counts; desktop tap targets 29–38px (coarse-pointer 44px bump exists in CSS, unverified live).

## Personas
Jordan (visiting for a weekend): first paint is genuinely good now — legend names the red ring, rail posters look like a scene. Clicks Trails to plan a hike: blank map, then a filter offering "Natural earth" and "Natural Eath" as different worlds. Local parent: taps the Wonder Circle card, gets a real flight and a real card — best path in the app. Diana (arts council): the trail card saying "included for alpha review while source descriptions are cleaned" in front of a partner is the new meeting-stopper; the traced route under "Map location coming soon" is the second. Casey (30-second skeptic): presses ▶ Drift, map starts flying itself, card lands — "okay, that's cool" — then scrolls, gets "Paused — you have the wheel," and can't find the resume button under the card.

## Strengths
- June's worst wounds are closed: the legend explains all three reds on-map; event list selection flies the camera and opens a poster drawer; surprise-me picks are "near the current view... ringed on the map" and actually are; Events/Paths panel copy is visitor-voice instruction ("tap a red diamond on the map").
- Brand execution is tight and verified: #ff2500 everywhere, Polymath both cuts, Card=Poster anatomy on rail/drawer/event cards (program tab, caption bar, presenter logo box on trail cards), red reserved for selection + event diamonds, "Tonight / 6—9pm" em-dash format.
- Drift's state design (en-route / "Paused — you have the wheel" / resume / Esc-flatten-return) is coherent, aria-labeled, and exits clean (pitch back to 0, rail returns).
- Path picker and route cards are editorially excellent ("the places locals actually point visitors toward"); Empire Mine drift card carries a real Wikimedia attribution.
- Search gives live status ("1 matching of 1351 places on the map") and honest empty states with a recovery button.

## Questions
- Trails: is the contract "browse 159 trails on a map" or "browse a list that borrows the map as a preview pane"? The tab promises the first, ships the second.
- Who owns the camera between features? Every selection flies it, nothing ever returns it — where does "home" live (a compass chip? re-fit on mode switch)?
- Is the drift bar a peer of the drawer or subordinate? Right now they fight for the same bottom-right corner and the drawer wins.

## Data flags (do not fix — flag to data owner)
- `data/places.json`: "Natural Eath" typo ×3 (surfaces verbatim in the Trails Surface filter); case-duplicate surface values ("Natural earth" vs "Natural Earth"); combo-string use/access values that defeat faceting.
- Trail place records carry boilerplate descriptions "A walks & trails entry in <town>, included for alpha review while source descriptions are cleaned" — rendered verbatim on trail cards.
- Trail place records with traced OSM geometry still carry `locationCaveat: "Map location coming soon"` (contract test pins this for directory-only places, but it fires on trails whose lines are drawn).
- "Calanan Park -- old mining core, ..." — name field contains an ASCII double-hyphen editorial gloss; leaks into map label chips mid-truncated.
- "The Old Post Office" description: "This building Is known as the Old Post Office." (capital "Is", circular). "Pete's Pizza": "Family Owned And Operated!" (title-case every word).
- Events feed recurrence: the same Trumba event repeats as separate consecutive rows/cards with identical art (dedupe/collapse is a UI call, but the feed provides no grouping key hint).
