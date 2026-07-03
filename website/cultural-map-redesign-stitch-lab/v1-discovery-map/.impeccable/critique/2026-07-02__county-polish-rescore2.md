---
target: v1-discovery-map county-polish re-score 2 (fresh independent critique)
total_score: 32
p0_count: 0
p1_count: 1
timestamp: 2026-07-02
slug: cultural-map-redesign-stitch-lab-v1-discovery-map
---
# Critique: v1-discovery-map county-polish re-score 2 (2026-07-02, live at localhost:4180)

## Score: 32/40 (Good)
Heuristics: status 3, real-world 3, control 3, consistency 3, error-prevention 3, recognition 3, flexibility 4, minimalist 4, recovery 3, help 3.

Judged fresh in real Chrome (hidden-tab rescue rig), desktop 1448x688. Exercised: first paint; all four mode tabs; mood chips + search combined with an active "Art" chip (17-of-195 scoping and the "Show 3 more matches outside your filters" hatch); events list selection AND map-diamond selection (synthetic canvas click on a rendered `event-points` feature); Places map-dot selection; discovery rail — all three chips (Everything 19 cards / Events 8 / Places 9) with a per-chip duplicate census, plus rail-card and poster-card activation; a trail selection (Alan Thiesen Trail, traced geometry + facts card); the County view chip; one full Drift cycle (start → stop 1 Center for the Arts → stop 2 Empire Mine → auto-advance to 3 → wheel-scroll pause "you have the wheel" → resume ▶ (advanced to stop 4) → Escape exit, rail restored). Brand tokens verified live: `--ncac-red` = `#ff2500`, `--ink` `#000000`, `--paper`/`--surface` `#ffffff`, Polymath variable loaded on body; poster gradient spray computed to exact brand secondaries (`rgb(255,119,5)` → `rgb(255,204,0)`). Zero console errors or warnings across the entire session.

## Environmental caveats (not scored)
- Hidden tab at ~0 fps. rAF was shimmed post-load, but GSAP had already captured native rAF — its ticker had to be pumped manually. Entrance animation quality, Drift flight/orbit character, and stop pacing were NOT judged. First-paint rail cards showed frozen at opacity 0.72 in this rig only; with the ticker pumped they resolve to 1.0.
- Rescue rig replaced the basemap style with OpenFreeMap Liberty: basemap tint/warmth and the faint OSM path-context layer's visual weight not judged.
- Lazyloaded images painted late or blank in several screenshots (e.g. Nevada County Arts Council card, Drift stop-1 key image), then resolved; `img.complete`/`naturalWidth` confirmed real files. First-paint image impressions not judged.
- Camera flights crawl at throttled repaint (County view took ~10s of pumped ticks); flight duration/easing not judged.
- Mobile not rendered (resize is a no-op on hidden windows). Judged from CSS only: `max-width: 880px` (nav toggle/sheet, rail + control-panel restack, 22+11 rules) and `520px` (map-stage, mobile map-context labels, 13 rules) breakpoints exist, plus `pointer: coarse` target-size rules and two `prefers-reduced-motion` blocks. Unverified live.
- One CDP screenshot timeout and one extension disconnect mid-session; state re-verified via DOM each time.

## Anti-patterns
Not slop. The system reads brand-native and self-assured: white/black ground, one red, Polymath, Card=Poster anatomy with red program tabs, red-field knockout event cards, quiet unframed map. The two prior marquee P1s are demonstrably fixed: the rail census found **zero duplicate cards under any chip** (recurring events collapse to one card with "Tonight · 14 dates"; the events list header itself says "Events (22 · 48 dates)"), and search under an active mood chip now scopes honestly ("17 matching of 195 places on the map") with an explicit escape hatch ("Show 3 more matches outside your filters"). Event list rows carry human dates ("Jul 2"), not ISO. What remains is register and state-sync debris, plus one factual-attribution problem the brand's own guide makes serious.

## Priority issues (most damaging first)
- [P1] **"Presented by Nevada County Arts Council" renders on third-party events.** The Karaoke – Grass Valley Brewing Co. card (Trumba mirror, "It's Karaoke Night at GVBC with DJ Kenn!") ends with a presenter bar reading "Presented by Nevada County Arts Council." The brand guide defines the frame/presenter device as marking a program "presented by NCAC" — stamping it on a bar's karaoke night misattributes ownership on most of the 48 mirrored events and is a stakeholder meeting-stopper. "From the NCAC calendar" would be honest. (Repro: Events → Karaoke row → scroll card to bottom; verified in card text this session.)
- [P2] **Map-diamond selection leaves a stale highlight in the events list.** Clicking the African Drum & Dance diamond on the map opened the correct card and URL (`event=trumba-195673539`), but `.event-list-row.active` stayed on "In the Night Dimension…" — the list and the card disagree about what's selected. List→map sync works (trail and event list selections highlight correctly); map→list doesn't.
- [P2] **"‹ ALL ROUTES" overlaps long route titles.** On "Makers / Working Artists" the title's last word renders under the button (title rect right edge 1357 vs button left 1259; vertical overlap confirmed; screenshot shows "…Working Arti⟨sts⟩" clipped) at 1448px. Short titles ("Living Like a Local") clear it, so it ships on exactly the routes with the longest names.
- [P2] **The County view chip is buried under every right-side card.** With any detail card, route picker, or path card open, the chip reads as a "…view" sliver; `elementsFromPoint` at its center returns the selection drawer and detail card above it (`pointer-events: auto` on both). The camera-reset control is unreachable at precisely the moments a user is deepest in and most wants out. (Zoom buttons remain as the only visible alternative.)
- [P2] **Mode signals desync in two places.** (a) With Trails active and a trail selected, the URL still says `mode=places` — a shared link restores the wrong mode (places/events/paths all sync correctly). (b) Tapping a route stop flips the active tab to Places while the left panel still shows "Route selected" and the URL stays `mode=paths` — three signals, two stories. The recovery affordance exists but is buried ("Part of a path: Living Like a Local" sits at the bottom of a long place card).
- [P2] **"Show 3 more matches outside your filters" silently deletes the filter.** Clicking it widens the search from "17 of 195" to "20 of 1351" — and the "Art ✕" chip is simply gone (verified absent, `intent=Art` dropped from URL). The user's mood choice is destroyed by a button that reads like a peek, with no "filter cleared" cue and no one-tap way back.
- [P2] **Filter results don't refit the camera.** Returning from a trail in Alta Sierra to Places, applying "Art," and searching "gallery" reports "17 matching … on the map" while the viewport shows zero dots (still parked on the trail neighborhood). Nothing nudges the camera toward the results; the copy "on the map" and the map itself disagree until a result row is clicked.
- [P2] **The design team narrates a visitor surface.** The Makers / Working Artists route description begins "This path shows that the Discovery Map can point to culture being made, taught, shared…" — pitch-deck register addressed to stakeholders, not a visitor being invited on a walk. The other three route blurbs speak to the visitor correctly.
- [P3] Transient empty-detail state says "Choose another place from the **Directory Browser** to reopen details" — internal component jargon; no visible surface is labeled Directory Browser. (Appears briefly while a rail-card selection is in flight.)
- [P3] The legend is one static strip in every mode: in Trails it still reads "Place · color = type … Event … Route" with nothing about trail lines or trailheads; nothing marks the numbered route stops in Paths either.
- [P3] Undecoded two-letter monograms (ST, HI, MK, GA, FD) on path stops and card kickers; the decoded phrasing exists elsewhere ("Creative maker anchor") but the codes still leak.
- [P3] Featured-in-MUSE chip state desync: first click sets `aria-pressed="true"` with no visual active class; the `.active` class only appears on the second click. Screen-reader and sighted users get different answers about whether the filter is on.
- [P3] All-caps microlabels throughout ("WHAT ARE YOU IN THE MOOD FOR?", "SEARCH PLACES", "WALK THIS ROUTE", "WHAT YOU'LL FIND HERE", "ON DRIFT", rail program tabs, top nav) against the guide's explicit no-all-caps rule (emphasis = bold or size). Consistent as a system, but it's the brand's own stated line.
- [P3] Redundancy: trail/place cards stack "Trail info: BYLT" + "WEBSITE Open website" + a red "Visit site" button for the same destination; list rows state the category twice ("Galleries & Studios / Grass Valley" then "GALLERIES & STUDIOS").
- [P3] Empty search state is a dead end: 'No places match "zzzqqq".' — no clear-search action, no "try Events" or nearest-match suggestion.
- [P3] Drift is 42 stops with no sense of shape beyond "n / 42," and nothing explains what Drift is before the chip is pressed.

## Personas
Jordan (weekend visitor): first paint is genuinely inviting — poster rail with real art, labeled anchors, a legend. Filters to Art, types "gallery," gets an honest "17 matching of 195" and a hatch to see 3 more — the best search moment in the app's history. Then taps the hatch and quietly loses the Art mood she'd chosen. Local parent: Events list reads cleanly ("Jul 2 · STEAM Exploration Saturdays · 2 dates"), taps a diamond on the map, gets the right flyer — but the list highlight still points at last night's exhibition. Diana (arts council): the trail card with "Foot and bike only. Dogs on leash." looks like a real product; her stop-the-meeting line is the karaoke card claiming NCAC presents it. Casey (30-second skeptic): presses ▶ Drift, the county tours itself, a scroll grabs the wheel ("Paused — you have the wheel"), ▶ resumes, Esc exits clean. Casey has nothing sarcastic to say, which is the highest score Casey gives.

## Strengths
- **Both prior P1s verified fixed live.** Rail duplicate census: 0 duplicate titles under Everything/Events/Places chips; recurring events collapse to one card ("Tonight · 14 dates") and one list row; the event card computes "Also Jul 3, Jul 4, Jul 5 +10 more."
- **Search + filter scoping is now honest and generous:** count line names the cohort size ("17 matching of 195"), and out-of-filter matches are surfaced instead of silently dropped.
- **Brand execution is verified, not aspirational:** `#ff2500` tokens, cool white/black/gray, Polymath on body, Card=Poster rail anatomy (red program tab, framed key image, meta line), red-field knockout event cards with guide-perfect dates ("Tonight / 11am—6pm", "Tue, Jul 7 / 4—5pm"), gradient sprays built from the exact secondary hexes, red reserved for frames/selection (selected place = red ring + red label; selected trail = red trace). The map stage stays quiet and unframed.
- **Drift's state machine is exemplary:** start → auto-advance → wheel-take on scroll with plain-language status ("Paused — you have the wheel") → resume → Escape, with aria-labels (Pause drift / Next stop / End drift) and an aria-live stop announcer; body state and rail restore cleanly on exit.
- **Trail flow ships real facts:** difficulty/length/surface/uses table, regulation line ("Foot and bike only. Dogs on leash."), BYLT source link, traced OSM geometry, and nearby cultural places stitched to the trailhead.
- **Honesty affordances:** "Map pin is approximate — double-check the address before you go"; photo credits ("via Google") on sourced images.
- **Accessibility groundwork is real:** skip link, 21 `:focus-visible` rules, 2 aria-live regions, single h1, 0 images missing alt, `prefers-reduced-motion` and `pointer: coarse` blocks.
- **Zero console errors** across load and every exercised flow; deep links restore places, events, and paths.

## Questions
- Presenter bar: is there a feed bit that distinguishes NCAC-presented programs from mirrored Trumba events, so "Presented by" can be earned and "From the NCAC calendar" used elsewhere?
- "Show more matches outside your filters": should it *highlight* the extra results while keeping the chip (peek), or is destroying the filter intended? If intended, say so in the moment.
- When a filter or search produces results wholly off-camera, should the map auto-refit to the result extent, or at least offer "Fit results"?
- Who owns the caps question — is the microlabel caps system a deliberate, owner-ruled deviation from the guide's no-all-caps rule, or drift that should be retired?
- Should County view (and the legend) have a reserved corner that cards never cover — i.e., a stacking contract for the right edge?

## Data flags (do not fix in UI — flag to data owner)
- Trumba event prose ships stale and rule-breaking copy verbatim: the "In the Night Dimension" description still advertises the "opening June 20th" reception (past; event shown as Tonight Jul 2), typo "August 16th.,", ordinals ("16th," "20th") against the brand date rules, and internal title drift ("Those We Meet" vs "Those You Meet") within one record.
- Events feed diversity: 4 of the 8 events-rail cards are one venue's "Youth Maker XD Camp Experience" series (Wonder Circle / Glass Fusing / Hand Carving / Silly Sculptures, all The Curious Forge). Distinct events, so no dedupe applies — but one venue owns half the marquee.
- Trails Town facet lists Alta Sierra, Chicago Park, Nevada City, Penn Valley, Smartsville, Truckee — no Grass Valley; several trails carry the county-level fallback ("Betsy Mine Trail — Nevada County"). "Big Boca OHV Tie Trail" has no difficulty or length.
- "Living Like a Local" is copy-labeled "a compact … loop" and "walk them in order," but stops 1–2 are in Grass Valley and 3–4 in Nevada City (~4 mi apart) — the path is a drive with two walkable clusters.
- Drift claims "cultural anchors" and runs 42 stops; the first four are unimpeachable (Center for the Arts, Empire Mine, The Curious Forge, Nevada Theatre) but the tail wasn't audited — curation list worth a pass.
- Nevada Theatre place card lists paths "Living Like a Local" and "Evening Arts Night," while its tag chip says "NEVADA CITY NIGHT-OUT PATH" — one path, two names between tag vocabulary and path titles.
