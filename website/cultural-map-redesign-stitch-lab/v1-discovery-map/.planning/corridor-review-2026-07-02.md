# Review: story-of-the-corridor.html (Task #4)

Date: 2026-07-02. Reviewer: source-level only (no browser). Subject: 757-line standalone
scroll-story page, built 2026-06-13, never committed (`git log --all -- story-of-the-corridor.html`
returns nothing — fully untracked).

## Verdict: COMMIT-AFTER-FIXES

The page is well-built and honors its scope guard (standalone, no map contact, GSAP confined to
this file). It is not shippable as-is because three of its five stat callouts are now factually
wrong — the underlying data has moved on three weeks of nightly refreshes since the page was
written, and stale counts on a page about "an honest field guide" undercut the page's own thesis.
Everything else is fixable-later polish, not a blocker.

---

## Fixes needed (ranked)

1. **Stale/wrong stat numbers (blocker — factual, undercuts the page's credibility claim).**
   Compared each stat against the live data files:

   | Stat on page | Line | Claims | Actual (data as of 2026-07-02) | Verdict |
   |---|---|---|---|---|
   | Cultural places | 373 | 1,351 | 1,351 (`data/places.json`, 1351 records) | correct |
   | Mapped & ready | 374 | 1,195 | **1,034** (`locationReviewStatus:"Map-Ready"` count) | **wrong, -161** |
   | Outing types | 375 | 10 | 10 distinct `category` values | correct |
   | Live events mapped | 474 | 55 | **48** (`data/events.json` record count) | **wrong** |
   | Trails matched | 551 | 159 | 159 (`data/trails.json` geometry-sidecar entries) | correct |
   | Walks & trails listed | 552 | 270 | 270 (`category:"Walks & Trails"` places) | correct |

   Root cause: `data/places.json` and `data/events.json` have been refreshed by nightly/periodic
   jobs since 2026-06-13 (events.json alone has 3 refresh commits in the last 3 days — most
   recently `e049b17` "chore(data): refresh events... " 2026-07-02). The page hardcodes stats as
   static text instead of reading `data/*.json` at load time, so it silently drifted.
   **Fix, ranked by cost:**
   a. Cheapest: update the two wrong numbers by hand before commit (1,195→1,034; 55→48) and accept
      they'll drift again on the next data refresh — acceptable for a one-off marketing artifact,
      not for something that stays live long-term.
   b. Better: have the stat spans read counts from `data/places.json` / `data/events.json` via a
      small inline `fetch` at load (mirrors what `index.html`/`app.js` already do to load `DATA.*`),
      so the count-up animation always shows the true current numbers. Low effort given
      `app.js` already has the loading pattern to copy.

2. **Typography deviates from brand (should-fix, not blocking).** The page loads Google Fonts
   `Instrument Serif` + `DM Sans` (lines 12, 30-31). The live app (`styles.css:1-9,55-57`)
   self-hosts and uses **Polymath** (`polymath-variable-2th9nk`) as both `--font-brand` and
   `--font-body`, per NCAC-V1-BRAND.md's explicit rule (Polymath Display for headlines, Polymath
   text cut for body/subheads). This page never touches Polymath. Visually distinctive and
   internally consistent (see brand-compliance notes below) but it is a genuine typeface miss
   against the guide, not just a "different but on-brand" choice. Worth a conscious owner call:
   accept as an intentional editorial/marketing departure (scroll-story pages often get more
   typographic license), or swap in Polymath to match the rest of the site family.

3. **Cosmetic: `<meta name="theme-color">` says `#ffffff` (line 8) but `<body>` background is
   `var(--ink)` = `#000000`** (line 40-41). Minor — affects mobile browser chrome tinting only,
   should be `#000000` to match the actual first-paint background.

None of the above touch the functional map, satisfying the plan's core constraint.

---

## Brand-compliance notes

- **Token set:** the page defines its own `:root` tokens (lines 15-32) rather than importing
  `styles.css`. They resolve to the *correct, current* live values: `--red:#ff2500`,
  `--ink:#000000`, `--paper:#ffffff` — matching `styles.css:17,20,22` exactly (not the old
  warm-neutral system the brand doc flags as corrected-away). Internally consistent: every dark
  section correctly inverts foam/deep aliases so text and ink and paper never collide. No
  contradiction found between the page's own tokens.
- **Red usage** matches the brand's "accent, framing device, link color, background flood"
  language (NCAC-V1-BRAND.md, Color section): red used for eyebrows, stat numbers, the CTA button
  fill, the trail line, quote emphasis — never as a category/chrome color. Consistent with the
  "red = active/selected, one honest meaning" ruling embedded in the page's own quote section.
  No rainbow, no misuse.
- **No frame device.** The brand guide calls the red frame the signature, near-universal device
  (poster tab/frame/presenter-bar anatomy). This page uses zero frames — it's built entirely as
  a full-bleed scroll narrative, closer to the guide's "full-bleed unframed slide in a carousel"
  allowance (page 32) than the poster pattern. Given this is explicitly *not* a poster/card
  (it's a distinct long-form page type the guide doesn't cover), this reads as a reasonable
  extrapolation rather than a violation — but it's worth naming since "Card = Poster" is called
  out as the site's general direction elsewhere.
- **Copy rules:** no ALL CAPS found (uses letter-spacing + uppercase CSS transform on labels,
  not literal caps in source — fine either way per the guide's actual complaint, which is about
  visual shouting). Titlecase used correctly for named itineraries ("Living Like a Local," "Makers
  & Working Artists," etc.). No em-dash/date-format issues (page carries no calendar dates).
  Quote section is genuinely italicized only for the one emphasized word ("red"), consistent with
  "italicize major works, nothing else."
- **Secondary palette:** untouched — only red/black/white/paper-warm gray used, exactly as the
  guide specifies ("Not a UI palette... never buttons, tabs, category chrome"). Correct.

---

## Craft checks

- **Choreography is real**, not decorative CSS-only: GSAP 3.12.2 + ScrollTrigger loaded from
  cdnjs (lines 659-660), driving a genuine sequenced timeline — hero word-stagger reveal,
  per-chapter SVG fade/scale/draw-path reveals keyed to scroll position, animated stat count-up,
  parallax on illustration SVGs, custom cursor with lerp-follow, mouse-tracked spotlight layer on
  dark sections, and a scroll-scrubbed progress bar. This is more ambitious than typical
  scroll-storyteller output and matches the plan's "GSAP belongs on marketing UI" intent well.
- **Reduced-motion is handled at two levels**, correctly layered:
  - JS gate: `const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;` wraps
    the entire GSAP block (`if (!reduceMotion) { ... }`, line 703) — no animation registers at all
    when the user has the OS preference set. The scroll progress bar (a scrub, not a decorative
    animation) is deliberately left outside that gate (lines 800-804), which is a defensible call.
  - CSS fallback: `@media (prefers-reduced-motion: reduce)` (lines 285-290) forces
    `animation-duration`/`transition-duration` to ~0 and snaps hero text to its final
    opacity/position — a real fallback, not just a duration override, since it also unsets the
    `translateY(34px)` starting transform that would otherwise be visible without JS running the
    tween.
  - Gap: the custom cursor (`.cursor-ring`/`.cursor-dot`, lines 665-682) and the mousemove
    spotlight tracker are **not** gated by `reduceMotion` — they always attach mousemove listeners
    and move DOM elements every frame regardless of the OS preference. This is a real but minor
    motion-sensitivity gap (continuous mouse-follow motion, not a one-shot transition) — worth a
    follow-up fix, not a blocker, since `@media (pointer: fine)` already hides it on touch devices
    and it's inert (`display:none`) until the media query allows it.
- **Images:** the page contains **zero raster `<img>`/background-image references** — every
  illustration is inline, hand-authored SVG (path data written directly in the HTML). There are
  no file paths to break. The only external refs are Google Fonts preconnects, GSAP/ScrollTrigger
  from cdnjs, and the two internal links (below) — all confirmed reachable/real. No dead asset
  references exist to find.
- **No TODO/lorem/placeholder residue** anywhere in the file (grepped for TODO, FIXME, lorem
  ipsum, XXX, TBD, placeholder text — zero hits). Copy reads as finished, specific prose
  throughout (place names, itinerary names, etc., not filler).
- **Data claims spot-checked** — see the stat table above; 4 of 6 correct, 2 stale (detailed above).

---

## Links / CTAs

| Element | Line | Target | Exists? |
|---|---|---|---|
| Topline brand mark | 299 | `https://www.nevadacountyarts.org/` | external, not verified (assumed live per other pages linking it) |
| Topline "Open the map" | 300 | `index.html` | **yes**, same directory |
| Finale CTA "Open the Cultural Map" | 649 | `index.html` | **yes** |
| Finale footer NCAC link | 654 | `https://www.nevadacountyarts.org/` | external, same as above |
| Finale footer "Contribute to the map" | 655 | `contribute.html` | **yes**, same directory |

All internal targets exist. No dead links found. One orphan-page note: nothing in `index.html`,
`contribute.html`, or `changelog.html` currently links *to* `story-of-the-corridor.html` — by
design for a standalone marketing page (plan explicitly scopes it as "never touches the functional
map"), but worth the owner deciding whether it should get a discoverable link from somewhere
(e.g. the topline or footer of `index.html`) once committed, or stay a share-only URL.

---

## Defer list — needs a live browser to judge

- Actual visual read of the GSAP choreography timing/easing (stagger feel, whether the
  `back.out(1.7)` scale-ins read as tasteful vs. bouncy, parallax speed).
- Custom cursor and spotlight-layer behavior/perf on a real pointer device.
- Scroll-scrub progress bar smoothness (`scrub: 0.3`) at real frame rates.
- `mix-blend-mode: difference` on `.topline`/cursor legibility against every actual chapter
  background (should invert correctly given ink/paper duotone, but only a real render confirms).
- Mobile/touch behavior at the 820px breakpoint (`chapter-inner` collapses to single column;
  `reverse` class flips to `column-reverse` only inside `.chapter.dark` per line 276 — the
  `.chapter.light .reverse` case isn't separately handled, worth a live check on chapter 1/3/5
  which are `.light` and don't use `.reverse` anyway, so likely moot, but confirm no light+reverse
  chapter exists — it doesn't, all `.reverse` usages are on `.chapter.dark`, lines 412, 512).
- Actual GSAP/font CDN load reliability (cdnjs GSAP 3.12.2, Google Fonts) in whatever network the
  page is actually served from.
- Whether the stat count-up animation reads correctly once numbers are corrected (fix #1).
