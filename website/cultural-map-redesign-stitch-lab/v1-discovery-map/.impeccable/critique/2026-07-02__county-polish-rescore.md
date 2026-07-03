---
target: v1-discovery-map county-polish re-score (fresh independent critique)
total_score: 31
p0_count: 0
p1_count: 2
timestamp: 2026-07-02
slug: cultural-map-redesign-stitch-lab-v1-discovery-map
---
# Critique: v1-discovery-map county-polish re-score (2026-07-02, live at localhost:4180)

## Score: 31/40 (Good, upper-mid band — up from 26 on the 2026-07-02 pass-1 score, 21 on 2026-06-12)
Heuristics: status 3, real-world 3, control 4, consistency 3, error-prevention 3, recognition 3, flexibility 3, minimalist 3, recovery 3, help 3.

Judged fresh in real Chrome (hidden-tab rescue rig), desktop 1448x688. Exercised: first paint; all four mode tabs; mood chips + search (with and without an active chip); list selection and map-dot selection (synthetic canvas click on a real rendered feature); rail chips + rail card activation; trail filters (Difficulty=Easy) + trail selection; the County view chip; one full Drift cycle (start → stops 1→4 → drag to take the wheel → resume → Escape). Brand tokens verified live: `--ncac-red` resolves `#ff2500`, ink `#000000`, paper/surface `#ffffff`, Polymath variable font confirmed loaded on body and headings, poster-frame cards throughout, red reserved for selection/frames/links. Zero application console errors across the whole session (the only warning was caused by my own style-swap rig).

## Environmental caveats (not scored)
- Hidden tab at ~0 fps with rAF shimmed to 33ms timeouts: motion smoothness, GSAP entrance quality, Drift flight/orbit character, and stop pacing were NOT judged (stops advanced 1→3→4 in ~18s under throttled timers; real cadence unknown).
- Rescue rig replaced the basemap with OpenFreeMap Liberty: basemap tint/warmth and the always-on OSM path-context layer's visual weight not judged.
- Rail/detail images frequently painted late or blank in screenshots, then resolved (verified via `img.complete`/naturalWidth: real files loaded). First-paint image impressions not judged. One transient artifact in this class: the Air Aligned detail card briefly showed a "via Google" photographer credit while the branded placeholder was the actual rendered image; steady state showed placeholder + "Photo not yet sourced" and no credit. Flagged as transition-ordering, not steady-state mislabeling.
- Mobile could not be rendered (resize is a no-op on hidden windows). Judged from CSS only: 880px (hamburger sheet, bottom-docked panel with drawer handle, horizontal chip scroll, legend wrap) and 520px (alpha pill dropped, `100svh` stage) breakpoints exist, plus `pointer: coarse` and two `prefers-reduced-motion` blocks. Unverified live.
- CDP screenshot timeouts occurred after mode-tab clicks (renderer throttling); state was re-verified via DOM each time.

## Anti-patterns
Not slop. This is a confident, brand-native system now. The pass-1 meeting-stoppers are gone: trail cards carry real facts (difficulty/length/surface/uses/rules) instead of pipeline boilerplate; Trails mode paints its geometry on entry; the trail facet dropdowns are clean canonical vocabularies; a County view chip exists and works; the Drift bar is a full-width bottom bar whose controls stay visible with a card open. Remaining hits are copy-register (ISO dates, all-caps microlabels vs the brand's own rule) and content-shape (recurrence flooding), not visual slop.

## Priority issues (most damaging first)
- [P1] **One recurring event floods both marquee surfaces.** "In the Night Dimension…" occupies 4 of 19 rail cards (positions 1, 4, 10, 12 — twice in the first four on screen) and 5+ consecutive rows of the 48-row events list (07-02 through 07-06). The event card itself already knows how to collapse ("Also Jul 3, Jul 4, Jul 5 +10 more") — the rail and list don't use that knowledge. A first-time visitor's first impression of "what's happening" is one exhibition repeated; the county looks quieter than it is. (Rail: `.rail-card` census total=19, nightDimensionCount=4. List: Events mode, All upcoming.)
- [P1] **Search silently ANDs with the active mood chip and returns misleadingly small result sets.** With "Art ×" active, typing the search box's own example ("theatre") returns 3 results — Nevada Theatre, the county's flagship, is silently absent (it's Historic Places). Clearing the chip returns 8. The count line says "3 matching of 195 places on the map" but nothing says "within Art," and the chip sits in a different visual group above "Search places." Same silent-exclusion class as pass-1's trail-facet P1: wrong mental model guaranteed for anyone who trusts the search. (Repro: Places → chip "Art" → search "theatre".)
- [P2] **The "All routes" back button overlaps the route title on path cards.** On "Makers / Working Artists," the button sits on top of the title's last word ("…Working Arti⟨sts⟩" clipped under "‹ ALL ROUTES") at 1448px. The trail card has the same crowding pattern with CLOSE ("Alan Thiesen Trail" ends flush under the button). Core Paths flow, first screen. (Screenshots ss_42806dpc3, ss_2932sob0k.)
- [P2] **"Presented by Nevada County Arts Council" renders on third-party event cards.** The presenter bar appears on a Wonder Docent exhibition and (by pattern) Karaoke at Grass Valley Brewing. The brand guide defines the frame/presenter device as marking "a program presented by NCAC" — stamping it on mirrored Trumba events misattributes ownership, and it's exactly the kind of line an arts-council stakeholder will stop on. "Listed by" / "From the NCAC calendar" would be honest; blanket "Presented by" is not.
- [P2] **Events list speaks database, not brand.** Raw ISO dates ("2026-07-02") head every visitor-facing list row while the cards themselves format beautifully ("Tonight / 11am—6pm," "Fri, Jul 3"). One surface away from the brand's own date rules (3-letter day/month, no ISO). Carried over from pass 1, unchanged.
- [P2] **Mode state still desyncs in two places.** (a) Trails is missing from URL sync — with Trails active and a trail selected, the URL still says `mode=places`; a shared link restores the wrong mode. (b) In Paths, tapping a stop flips the active tab to Places while the panel still shows "Route selected" and the URL stays `mode=paths` — three signals, two stories. (Entity-based tab sync is otherwise consistent: event cards correctly light Events.)
- [P2] **The legend is one static strip in every mode, and its anchor slot collides with overlays.** Trails mode still shows "Event / Route / Glow · event coming up" and nothing about trail lines or trailheads; with the rail open the strip floats mid-map; with a detail card open the County view chip is half-hidden behind the card (readable as "…view"). Right-edge overlays (legend, chip, card, zoom) are competing for the same corner without a stacking contract.
- [P3] Undecoded two-letter anchor monograms ("GA", "MK") on path stops and drift/place kickers — decoded copy exists elsewhere ("Creative maker anchor") but the codes leak. Carried from pass 1.
- [P3] List rows say the category twice ("Arts Organizations / Grass Valley" then "ARTS ORGANIZATIONS" as a tag); detail cards offer both "Open website" and a red "Visit site" button for the same URL. Redundancy on every row/card.
- [P3] All-caps microlabels everywhere ("WHAT ARE YOU IN THE MOOD FOR?", "SEARCH PLACES", "ADDRESS", "NEARBY", "BEFORE OR AFTER", "ON DRIFT", rail program tabs) against the guide's explicit no-all-caps rule (emphasis = bold or size). A deliberate system, but it's the brand's own stated line.
- [P3] First paint has ~8px of page scroll (docH 696 vs 688 viewport) that disappears once the rail retires; featured map labels truncate mid-word against the panel edge ("…right House", "…on Augustus Sargent Homest…"); Drift's live region lags the displayed stop by one ("Now at Center for the Arts, stop 6" while the bar shows stop 7); "195 listed of 195 places on the map" sits above "Showing first 60. Use search to narrow the list."
- [P3] Drift is 42 stops long with cross-county jumps (stop 6 Grass Valley → stop 7 Truckee) and no sense of progress beyond "n / 42"; nothing explains what Drift is before you press it (carried from pass 1).

## Personas
Jordan (weekend visitor): first paint is a real scene — poster rail, labeled anchors, a working legend. Types the suggested "theatre" while the Art chip is on and never learns the Nevada Theatre exists. Scrolls the rail: the same pink-cloud poster four times. Local parent: taps Wonder Circle, gets a flight, a flyer, "BEFORE OR AFTER" suggestions — the best path in the app, again. Diana (arts council): trail cards now look like a product; her new stop-the-meeting line is the presenter bar — "we don't present the brewery's karaoke night." Casey (30-second skeptic): presses ▶ Drift, the county starts touring itself with a clean HUD, drags the map and gets "Paused — you have the wheel," resumes, hits Esc — the whole loop just works now.

## Strengths
- Every pass-1 P0/P1 verified fixed live: trail cards carry sourced facts and rules ("Foot and bike only. Dogs on leash."), Trails paints geometry on entry (faint network + trailheads), facet dropdowns are clean enumerations (Easy/Moderate/Difficult; Gravel/Natural Earth/Paved), the County view chip returns the camera from anywhere, and Drift's controls stay visible and aria-labeled (Resume drift / Next stop / End drift).
- Brand execution is verified, not aspirational: `#ff2500` in tokens and selection, cool white/black/gray ground, Polymath loaded, Card=Poster anatomy on rail cards (program tab, framed key image, meta bar), red-field knockout event cards, red links. The map stage itself stays quiet and unframed, exactly per the decided direction.
- Filter → focus loop is excellent: choosing "Art" retires the rail, filters the map to the cohort, opens a "Start here" anchor card, updates the URL (`intent=Art`), and reports "195 listed of 195 places on the map."
- Honesty affordances: "Map pin is approximate — double-check the address before you go"; the branded "Photo not yet sourced" placeholder is designed, labeled, and on-palette.
- Drift's state machine (tour → "Paused — you have the wheel" → resume → Escape exit) is coherent, discoverable in the moment, and announced to assistive tech via a live region.
- Deep links work for places, events, and paths (`place=`, `event=`, `path=` all restore).

## Questions
- Recurrence: should the rail/list collapse a recurring event to one card with "Nightly through Jul 16" (the card already computes "+10 more")? Who decides the collapse key — feed or UI?
- Search scope: when a mood chip is active, should search widen to all places (chip becomes a highlight) or stay a filter but say "within Art — search all 1,351"? Either is defensible; silence isn't.
- Presenter bar: is there a data bit distinguishing NCAC-presented programs from mirrored calendar events, so "Presented by" can be earned rather than universal?
- Drift: is 42 stops the intent, or should Drift tour a curated ~dozen anchors (the chip copy says "cultural anchors") with the long tail left to browsing?

## Data flags (do not fix in UI — flag to data owner)
- "The Lyric Rose Rose Theatre Company" — duplicated word in the name field (surfaces in search results).
- Trumba recurrence: the same event arrives as N separate records with identical art and no grouping key (drives both P1 flood surfaces).
- Trails Town facet offers Alta Sierra, Chicago Park, Nevada City, Penn Valley, Smartsville, Truckee — no Grass Valley; several trails carry the fallback town "Nevada County." Verify whether GV genuinely has zero mapped trails or town tags are missing.
- Drift stop 7 is "Schaffer's Mill Golf & Lake Club — Eat, Drink & Stay": a golf club as a "cultural anchor" dilutes the tour's claim; curation list may need a pass.
- Event feed prose ships typos and rule-breakers verbatim: "August 16th., Wonder Docent…", "16th"/"20th" ordinals, title drift "Those We Meet" vs "Those You Meet" within one record.
- Air Aligned Aerial Arts Academy: description is an unterminated fragment ("…as young as 18 months through adult"); record carries a photographer credit ("Tresa Honaker, via Google") while its usable photo is absent — credit-without-photo is what enabled the transient credit/placeholder mismatch.
- Metal Flower sculpture's Google photo shows the ASIF gallery interior, not the sculpture (credit: "Artists' Studio in the Foothills (ASIF) Art Center & Gallery, via Google").
