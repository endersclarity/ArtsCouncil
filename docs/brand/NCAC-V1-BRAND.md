# NCAC V1 Brand — Canonical Spec

> **Source of truth.** This file is written page-by-page from the real 43-page Nevada County
> Arts & Culture *Brand Guide* (`docs/brand/NCAC-Style-Guide.pdf`). Every page is rendered at
> 150dpi and named by topic in `docs/brand/style-guide-pages/` — see the [Page index](#page-index)
> at the bottom. Where any older repo doc disagrees, **this file and the PDF win.**
>
> It replaces the earlier condensation (same path, May 2026), which was derived from a now-deleted
> 31-page `NCAC_brand-compressed.pdf` and carried provable errors. Corrections are listed first.

---

## What the old spec got wrong (corrected here)

| # | Old spec said | The guide actually says | Page |
|---|---|---|---|
| 1 | Red is `#FF2E00` | Red is **`#FF2500`** ("Nevada County Red") | 8 |
| 2 | Neutrals are warm: cream `#FAF6EC`, charcoal `#1A1A1A`, brown-gray `#5E5852` | Neutrals are cool: **White `#FFFFFF`, Black `#000000` for all text, Gray `#F7F7F7`** | 8 |
| 3 | Secondaries are "blue, green, teal, pink" (no hexes) | Five named: **blue `#109AFF`, green `#00CD2D`, yellow `#FFCC00`, orange `#FF7705`, pink `#FF0090`** (no teal; adds yellow + orange) | 8 |
| 4 | Secondaries = flat full-bleed poster fields | Secondaries = **gradient sprays** used when no key art exists, and key-art color | 13 |
| 5 | "One frame per composition. Not on every card." | "Establish a framing graphical device to use **universally**." The deck frames every slide; every poster, IG slide, and website card is framed. | 3, 9, 10, 26, 38 |
| 6 | Red is "structural, not decorative; never garnish; single red used with restraint" | Red is the "accent color, **graphic framing device, link color, and background flood** when appropriate" | 8 |
| 7 | "No illustrated/painterly imagery; clean documentary only" | The flagship key art (*Sunrise to Sunset*) is a **stylized illustration**. Photo or illustration both fine — "the color comes from the art." | 9, 22 |

A note on the red value: page 8 prints **HEX `#FF2500`** but its RGB line reads "255, 35, 0," which is
actually `#FF2300`. The rendered logo box on the cover and closing pages is `#FF2500` (RGB 255, 37, 0).
**Adopt `#FF2500`** — it is the labeled hex and the value the logo renders. The 2/255 green difference
is imperceptible; the printed RGB is a guide typo.

---

## The brand in one sentence

Nevada County Arts & Culture is a **branded house**: one red (`#FF2500`), set in **Polymath**, on a
**white/black/gray** ground, organized by a **grid**, and signed by a **red frame** that wraps nearly
every composition. Color enters only through the art.

---

## Decided direction for the V1 map (2026-06-12)

Chosen from a three-way prototype (`brand-adoption-prototype.html`, variant B):

- **Adopt the guide's cool neutrals.** White `#FFFFFF` surfaces, black `#000000` text, gray `#F7F7F7`
  backgrounds. The warm cream/charcoal system is retired. The basemap retunes to cool to match.
- **Red is `#FF2500`** everywhere — accent, frame, links.
- **The frame is the card/poster device, not a map chrome.** Rail and detail cards render as framed
  posters (Card = Poster). The **map itself stays unframed and quiet** — no red border, no program
  tab around the map stage. (Variant A wrapped the map in the frame; rejected as too loud.)
- **Links are red; key images get rounded corners.**

This is the target state impeccable should drive the sandbox toward.

---

## Color (page 8)

### Core palette — universal

| Token | Hex | RGB | Role (verbatim from the guide) |
|---|---|---|---|
| Nevada County Red | **`#FF2500`** | 255, 37, 0 | "Signature of the brand. Accent color, graphic framing device, link color, and background flood when appropriate." |
| Black | `#000000` | 0, 0, 0 | All text. |
| White | `#FFFFFF` | 255, 255, 255 | Cards, fields, knockout space inside the red field. |
| Gray | `#F7F7F7` | 247, 247, 247 | Background color in select applications. |

> "This core palette of red, black and white is universal and intended to pair with any key art,
> where a multitude of colors are present. The 'color' comes from the art."

CMYK (for print): Red `0,95,100,0` · Black `75,68,67,90` · White `0,0,0,0` · Gray `2,1,1,0`.

### Secondary palette (page 8, shown not prosed)

Five bright hues, displayed as a strip with **no accompanying rule**. Their job is revealed on page 13:
they are the source colors for **gradient sprays**, and they appear in key art.

| Color | Hex | RGB |
|---|---|---|
| Blue | `#109AFF` | 16, 164, 255 |
| Green | `#00CD2D` | 0, 205, 45 |
| Yellow | `#FFCC00` | 255, 204, 0 |
| Orange | `#FF7705` | 255, 119, 5 |
| Pink | `#FF0090` | 255, 0, 144 |

**Not a UI palette.** The functional system is red + black + white + gray. Secondaries are campaign
expression (sprays, art), never buttons, tabs, chart series, or category chrome.

---

## Typography (page 7)

**Polymath** is the brand font — a geometric sans after Paul Renner's Futura, chosen for "simplified
forms, legibility, and arts-related history." It ships in two cuts:

- **Polymath Display** — large headlines only.
- **Polymath** (text cut) — subheads **and** body.

Discipline (page 3, tactic 3; page 11): **two to three type sizes max per expression.** Keep titles
large; supporting copy stays one size. Hierarchy comes from size jump + weight + the grid, not from
many sizes. For emphasis use **bold or a size change — never all caps** (page 17).

Programs and cultural districts are all typeset in **Polymath Display Semibold, titlecase** (page 14).

Stack already live via Typekit:
```
--font-brand: "polymath-variable-2th9nk", "DM Sans", "Inter", system-ui, sans-serif;
```

---

## Logo (pages 6, 12, 20, 43)

- **Primary:** white wordmark in a **red box** (`#FF2500`).
- **Alternate:** the non-box wordmark (red on white, or white knockout), "meant to be used in
  conjunction with the red frame." When the frame is already present, the box is redundant.
- **Avatars** (page 12): a **red square** or **red circle** with the white wordmark, for social
  accounts. Facebook uses the circle; the box works as a square avatar.
- The wordmark is always two lines: "Nevada County / Arts & Culture."

---

## The frame — the signature device (pages 3, 9, 10, 26)

> "The frame is a graphic device that indicates a program is presented by NCAC. With use, it becomes
> another recognizable signifier of the brand." (page 9)

This is the brand's handshake, and tactic 5 is explicit: **use it universally.** It is not a
once-per-composition flourish.

- **Color:** red, black, or white — "the frame adapts to various sizes, and can be red, black, or
  white" (page 10). Red is the default; black/white are used when red would fight the art (e.g. the
  black-framed "More art upstairs" wayfinding poster, page 35).
- **Adaptable** (page 26): the same frame stretches across every aspect ratio — portrait poster,
  tall story, square, banner. The frame and its two fixtures stay constant; the interior reflows.
- **Two fixtures** baked into the frame:
  - a **program tab** knocked into the **top edge** (red field, white type) naming the program or
    presenter — e.g. "Art at the Airport," "Artist Spotlight," "Mini Grants," "Truckee Thursdays";
  - a **presenter bar** along the **bottom edge** carrying the NCAC wordmark (left) and the cultural
    district / partners (right).

### Composition / poster anatomy (pages 11, 24, 25)

A framed composition, top to bottom:

1. **Program tab** — top edge, red, white type.
2. **Title** — large, Polymath Display; **black on white** or **white on red**; may also be **red on
   white** (e.g. "Truckee Art Walk," "Congratulations to the 2025 recipients").
3. **Subhead** *(optional)* — directly under the title (e.g. "Ceramicist," "Fine art photographer,"
   "8-Week Career Intensive").
4. **Dates & location** — two short columns, single size, bold; aligned to the grid.
5. **Key image** — inset, **rounded corners**. Photo or illustration.
6. **Presenter bar** — NCAC wordmark + cultural district + partner logos.
7. **CTA** *(optional)* — a QR code in the presenter bar.

Everything aligns to a column-and-baseline **grid** (page 25).

### Two field treatments

- **White interior, red frame** — black (or red) type, inset rounded key image. The default
  ("Sunrise to Sunset," "Artist Accelerator," "Christo Paddock").
- **Full red field, knockout** — the whole interior floods red; type is white. Used for punchy,
  art-free announcements ("Creative Capital," "Mini-Grants Announced!," "Upcoming Artist Calls").
  Black type on red also appears ("Truckee Art Walk").

### Gradient sprays (pages 13, 27, 28, 30, 37)

> "At times when an attention-grabbing element is needed and there is no key art available, utilize
> color gradient sprays. These add color while allowing for legibility of text on top." (page 13)

Soft multi-stop gradients built from the **secondary palette** fill the frame interior as a stand-in
for key art; type sits on top in black. The "Donate Today" and "Creatives Meet up" posters show the
same layout rendered across blue, green, yellow/orange, and pink sprays.

---

## Key art / imagery (pages 9, 22, 32)

- "The color comes from the art." The core palette is deliberately neutral so any key art — a
  geometric landscape painting, a documentary photo, a vintage poster — can supply the color.
- Inset key images have **rounded corners**.
- In a carousel, a slide may be a **full-bleed unframed image** (page 32, the night-sky photo)
  between framed slides. The frame is per-slide, not mandatory on image-only slides.

---

## Copy rules

- **Titlecase for programs** (page 14): "The Business of Art," not "THE BUSINESS OF ART."
- **No all caps** (page 17). Emphasize with bold or size.
- **Italics** (page 16): "italicize major works. But nothing else needs it. Simplify." Don't italicize
  quotes or notes.
- **Date formats** (page 15):
  - 3-letter day and month — "Thu, Mar 12."
  - am/pm once — "5—7pm."
  - **Em dash** for ranges — "5—7pm," "Sep 12—Feb 17."
  - Spell out the month inside a sentence.
  - "/" when date and time share a line — "Fri, Sep 19 / 4:30pm."
  - No "st" / "th" — "1," not "1st."
- Simplify language; enforce clear hierarchy at all times (pages 2, 3, 11).
- Trackable **QR codes** for printed calls-to-action (page 3, tactic 8).

---

## Website application (pages 38, 39, 40) — most relevant to this app

The brand's own site is the closest thing the guide gives to a digital spec:

- A thin **red frame strip** runs along the **top** of every page (the frame device, applied to web).
- **Header:** red logo box top-left; horizontal nav "About / Events / Programs / Resources /
  Contribute."
- **Hero:** large centered black headline in Polymath Display ("Art moves mountains") with a **red
  link** beneath ("Become a member →").
- **Links are red** (`#FF2500`) — "Read more," "Become a member," "Apply" (page 8 calls red the link
  color; the mockups confirm).
- **Cards ARE posters.** The "Happening Now" row renders each event as its **framed poster
  composition** — program tab, title, key image, presenter bar — not as a generic content card. This
  is the "Card = Poster" pattern.
- **District / nav tiles** are framed: one as a **full red field** ("Grass Valley–Nevada City Cultural
  District →"), one as a **red-framed white tile** ("Truckee Cultural District →").
- **Buttons** use the frame: "Apply→" is a **red-outlined rectangle** with black type (page 40).
- **Team / instructor grids:** photo, **bold name**, role line, short bio.

---

## Map marker semantics (V1 Discovery Map) — project domain, not the guide

The guide is a print/social/web brand; it says nothing about maps. The marker system is this project's
own and is governed by these rules (reconciled to the corrected palette):

- **Red is reserved for the active / selected state.** Selected = red ring + thicker white stroke.
  Categories are **not** color-coded with red.
- Hierarchy by **size + zoom step**, not hue. Featured/anchor places read first; ordinary places are
  quiet dots until hovered or selected.
- The current category palette is a 6-group muted-ink set (`marker-category-color.js`), chosen so red
  stays reserved and the map avoids a rainbow. It does **not** use the brand secondaries — an
  intentional restraint, not a brand mandate. If categories ever need brand color, the five
  secondaries are the on-brand source.
- **Owner ruling (cla-76):** the red used on markers is the owner's pick and **stays**. Marker
  semantics are separate from card/frame decoration. (Correcting the red *value* to `#FF2500`
  everywhere is a separate, brand-consistency question for the owner.)

### Engineering invariant (ours, not the guide's — keep through any port)

- MapLibre silently **drops a layer** when a paint expression is invalid; `zoom` may only be a
  top-level input to `step` / `interpolate`. Validate paint expressions before committing, and bump
  the `?v=` cache-bust on every CSS/JS change (pre-commit hook enforces it; docs-only commits may set
  `SKIP_CHANGELOG=1`).

---

## Deltas from the current live site (actionable)

Grounded in `styles.css`, `app.js`, `marker-category-color.js` as of this writing. Findings only —
no code changed here.

1. **Red value is wrong everywhere.** `styles.css:13` `--ncac-red: #ff2e00` → **`#FF2500`**; also the
   derived `--ncac-red-soft` / `--ncac-red-ring` rgba use `255,46,0` → `255,37,0`. `app.js:24`
   `MARKERS.red: "#ff2e00"` → `#FF2500`. Same wrong red in the `fable-*.html` experiments and any
   favicon/spec copy. (Marker red *semantic* stays per cla-76; the *hex* should still correct for
   brand consistency — owner's call.)

2. **Neutral system has drifted warm — the biggest visual gap.** Site ships cream + charcoal:
   `--paper #FAF6EC`, `--surface #FAF6EC`, `--paper-warm #F5F0E8`, `--ink #1A1A1A`,
   `--ink-soft #5E5852`, `--line #D8D0C6`. The guide is cool and flat: **white `#FFFFFF` surfaces,
   black `#000000` text, gray `#F7F7F7` backgrounds.** The whole warm palette is Gold-Country residue.
   **Decided 2026-06-12: adopt the guide's white/black/gray** (prototype variant B). The basemap
   (`app.js:64-91`) is tuned to the cream ground and retunes to cool with it.

3. **Secondary palette is wrong and incomplete.** Old token notes say "blue/green/teal/pink." Correct
   to the five guide hues (blue `#109AFF`, green `#00CD2D`, yellow `#FFCC00`, orange `#FF7705`, pink
   `#FF0090`) and reclassify them as **gradient-spray / key-art colors**, not UI.

4. **"One frame per composition" is dead.** The guide frames everything. Treat the red frame as a
   **repeatable poster/card device**, not a single hero signature. (Owner already overruled the
   one-frame rule.) **Decided 2026-06-12 (variant B): the frame lives on cards/posters and the header
   strip — the map stage itself stays unframed and quiet, no red border or tab around it.**

5. **Adopt "Card = Poster."** Rail and detail cards should move toward the framed-poster composition
   (program tab + title + rounded key image + presenter/meta bar) the brand's own website uses, rather
   than generic content cards.

6. **Red may be a background flood and a link color.** Full red fields with white knockout are
   on-brand; red links are on-brand (verify the site's links resolve to `#FF2500`). The old "restraint
   only / never decorative" framing was too strict.

7. **Key-image rounded corners.** Inset images in cards/detail should use rounded corners to match
   every poster in the guide.

8. **Type ramp.** Confirm large headings use **Polymath Display** and body/subheads use the text cut,
   with only 2–3 sizes per surface. Programs/district names in **Polymath Display Semibold, titlecase**.

9. **Imagery rule reversed.** The old "no illustrated/painterly art" ban is wrong — illustrated key art
   is the guide's flagship. Allow photo *or* illustration; let the art carry the color.

10. **Copy/format enforcement.** Apply the date formats, titlecase, no-all-caps, and italics-only-for-
    major-works rules to any generated card or detail text.

---

## Owner rulings that bind this work

- **Frames may be decoration, applied uniformly.** One-frame-per-composition is dead; the selection
  differentiates, not frame scarcity. (memory: `framing-device-ruling`)
- **Marker red is the owner's pick and stays** (cla-76); marker semantics ≠ card/frame decoration.
- Scope is the **assets map only** (memory: `scope-assets-map-only`).
- Never push without explicit in-the-moment consent; never touch port 8013.

---

## Page index

Rendered at 150dpi in `docs/brand/style-guide-pages/`:

| # | File | Topic |
|---|---|---|
| 1 | `01-cover-wordmark-red.png` | Cover: white wordmark on red |
| 2 | `02-core-aims.png` | Core aims (hierarchy, reduce complexity, legibility, scalable systems) |
| 3 | `03-tactics.png` | 9 tactics (typemarks, one accent, **universal frame**, grid, dates, QR) |
| 4 | `04-assets-dropbox-link.png` | Dropbox link for logos + fonts |
| 5 | `05-section-divider-brand-guide.png` | Section divider: "Brand Guide" |
| 6 | `06-logomarks-box-vs-alternate.png` | Primary red-box logo vs alternate non-box |
| 7 | `07-typography-polymath.png` | Polymath / Polymath Display |
| 8 | `08-color-palette.png` | **Color truth: red `#FF2500`, neutrals, secondaries** |
| 9 | `09-frame-concept-three-layers.png` | Frame = frame + type-on-grid + key art |
| 10 | `10-frame-adapts-sizes-and-colors.png` | Frame adapts to sizes; red/black/white |
| 11 | `11-layout-poster-anatomy.png` | Poster anatomy (tab, title, dates, key image, presenter) |
| 12 | `12-avatars-social.png` | Square / circle red avatars |
| 13 | `13-gradient-sprays.png` | Gradient sprays from the secondaries |
| 14 | `14-programs-cultural-districts-typemark.png` | Branded house: Polymath Display Semibold, titlecase |
| 15 | `15-date-formats.png` | Date format rules |
| 16 | `16-italics-rule.png` | Italics only for major works |
| 17 | `17-avoid-all-caps.png` | No all caps; bold/size for emphasis |
| 18 | `18-section-divider-examples.png` | Section divider: "Examples" |
| 19 | `19-business-card-red-mockup.png` | Red business card in hand |
| 20 | `20-logomark-lockups.png` | Red-on-white + white-on-red lockups |
| 21 | `21-tote-and-business-card.png` | Tote bag + contact card |
| 22 | `22-poster-sunrise-to-sunset-window-cling.png` | "Sunrise to Sunset" white-interior poster in situ |
| 23 | `23-poster-creative-capital-red-field.png` | "Creative Capital" full-red-field knockout |
| 24 | `24-layout-hierarchy-annotated.png` | Annotated anatomy (adds subhead, CTA) |
| 25 | `25-grid-overlay-sunrise-to-sunset.png` | Grid overlay |
| 26 | `26-adaptable-frame-aspect-ratios.png` | Empty frame at four aspect ratios |
| 27 | `27-poster-creatives-meetup-gradient.png` | "Creatives Meet up" gradient poster |
| 28 | `28-poster-donate-today-gradient.png` | "Donate Today" gradient poster |
| 29 | `29-posters-truckee-art-walk-and-artist-accelerator.png` | Red-field date list + white-interior accelerator |
| 30 | `30-donate-today-gradient-variants.png` | Three gradient-spray variants |
| 31 | `31-instagram-mini-grants-carousel.png` | Mini Grants IG carousel (red title slides) |
| 32 | `32-instagram-artist-spotlight-carousel.png` | Artist Spotlight carousel (framed + full-bleed slides) |
| 33 | `33-instagram-artist-calls-carousel.png` | Artist Calls carousel (image + deadline caption bar) |
| 34 | `34-a-frame-creative-capitol-sign.png` | A-frame sidewalk sign |
| 35 | `35-exhibition-comms-system-overview.png` | "Culture in Focus" full system; black-frame wayfinding |
| 36 | `36-posters-title-color-black-or-red.png` | Title color flexes black or red; varied tabs |
| 37 | `37-creatives-meetup-gradient-color-variants.png` | Four secondary-color spray variants |
| 38 | `38-website-homepage.png` | **Website: red top frame, nav, centered hero, red links, cards=posters** |
| 39 | `39-website-about-and-team.png` | Website About + district tiles + team grid |
| 40 | `40-website-program-detail-apply.png` | Program detail; red-framed "Apply" button |
| 41 | `41-facebook-page.png` | Facebook page (red circle avatar) |
| 42 | `42-business-card-two-sided.png` | Two-sided business card |
| 43 | `43-closing-logo.png` | Closing: red-box logo |
