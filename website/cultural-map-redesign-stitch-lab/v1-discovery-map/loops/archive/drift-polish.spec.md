# Spec — fable-drift.html ("Drift")

The artifact is `fable-drift.html` served at `http://localhost:4173/fable-drift.html?motion=1`
(`?motion=1` forces animation on; the preview browser reports prefers-reduced-motion).
Judge against this document only. Sibling pages for the distinctiveness item:
`fable-best.html` (the Atlas), `fable-best-magazine.html` (the magazine).

## Deterministic items (each PASS/FAIL, with evidence)

D1. Zero console errors on load and through one full interaction pass (drift → pause →
    search → index → route → dossier → home).
D2. With motion on, the broadcast auto-starts after the cold open and advances at least
    3 stops unattended. The progress line restarts on each stop.
D3. Taking the wheel pauses the broadcast: map drag or scroll-zoom, clicking a dot, or
    any HUD button. A toast confirms it. Space resumes.
D4. The dial refilters BOTH the drift pool and the map dots. Night shows only
    Performing Arts and Eat, Drink & Stay dots. A toast reports the pool size.
D5. Pressing `/` opens the search overlay with the input focused. Typing filters live.
    Enter flies to the top hit and deals its poster card. Esc closes.
D6. The index sheet opens, its search box and category pills filter the list, and
    clicking a route row starts an ordered route drift with a "Stop n / m" counter.
D7. The dossier shows a Pin status row reading "Verified", "Approximate", or
    "Directory listing"; shows the location caveat when the record has one; shows
    Website and Directions links when the record has them.
D8. No photo container ever renders as a blank box: every photo slot paints its
    category placeholder underneath the remote image.
D9. Approximate-tier places never render as solid dots — rings only, and only past
    ~zoom 12.4. Verified places are solid ink dots.
D10. With motion off (?motion=0): no auto-drift (play glyph shows ▶), navigation jumps
    instead of flying, no infinite pulse animation.
D11. At ≤880px width: the band drops its photo column and still fits, the dial remains
    reachable (scrollable), search and index overlays are full-width usable.
D12. Keyboard: Space toggles drift, ←/→ step stops, `/` opens search, Esc closes in
    priority order search → dossier → index → pause. None fire while typing in inputs.
D13. Palette discipline in the source: chrome colors only from the canonical set
    (#FF2E00, #1A1A1A, #5E5852, #FAF6EC, #F5F0E8, #D8D0C6, #FFFFFF). The poster
    secondaries (#1E40FF, #00A3A3, #F4569D, #0E9F5B) appear ONLY as full-bleed band
    fields, never on buttons, pills, markers, or text accents. No border-radius
    except circular dots/pulses. The Polymath stack is on all UI text.
D14. One red frame: the red typemark plate is the only red field in the chrome. All
    other red is an active/selected/live signal (dial underline, selection pulse,
    event dots, hover accents).

## Judged items (score 1–5 each; PASS at ≥4. One sentence of rationale each.)

J1. **Poster beauty.** Frozen at any drift stop, the band + map reads like a Diana
    Arbex poster: huge confident type, strict alignment, one field color, breathing room.
J2. **Fun.** The drift, dial, and route-drift make you want to keep watching or grab
    the wheel; motion feels intentional (eased, unhurried), never gimmicky or jittery.
J3. **Its own thing.** Compared against fable-best.html, this page reads as a different
    product concept (broadcast-first vs catalog-first), not a reskin of the same layout.

## Verdict format

Write `loops/drift-polish.verdict.json`:
{ "pass": bool, "deterministic": {"D1": {"pass": bool, "evidence": "…"}, …},
  "judged": {"J1": {"score": n, "why": "…"}, …}, "summary": "…" }
Overall pass = every D passes AND every J ≥ 4.
