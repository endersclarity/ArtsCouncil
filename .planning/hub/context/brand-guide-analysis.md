# NCAC Brand Guide Analysis

**Source:** `docs/NCAC_brand-compressed.pdf` (31 pages, primarily visual)
**Extracted:** 2026-03-14

---

## 1. Color Palette

The brand guide establishes a deliberately minimal color system. The core directive is: **"Establish a single accent color. And own it."**

### Primary Colors

| Role | Hex | RGB | Description |
|------|-----|-----|-------------|
| **Accent / Brand Red** | `#FF2400` | rgb(255, 36, 0) | Scarlet red. The single ownable accent color. Used for the logo background, framing device, highlight text, CTAs, and all brand touchpoints. This is not a standard red — it leans toward vermillion/scarlet with a slight orange warmth. |
| **Text / Dark** | `#3F3F3F` | rgb(63, 63, 63) | Dark charcoal gray. Used for all body text and headings in the brand deck. Not pure black — intentionally softened. |
| **Background / White** | `#FFFFFF` | rgb(255, 255, 255) | Clean white. The default canvas. |

### Secondary / Contextual Colors

The brand guide does **not** define a secondary palette. However, several design applications reveal contextual color usage:

- **Gradient blobs** (Creatives Meetup posters): Orange-to-pink-to-magenta gradients are used as "key art" backgrounds — these are expressive, event-specific, not part of the core palette
- **Photography** provides all additional color — the system is intentionally two-tone (red + charcoal on white) with imagery doing the heavy lifting for visual richness
- The red-on-white poster variant and the full-red-background variant are both valid treatments

### Web Implementation Notes

```css
:root {
  --ncac-red: #FF2400;          /* Primary accent — links, CTAs, borders, active states */
  --ncac-charcoal: #3F3F3F;     /* Body text, headings */
  --ncac-white: #FFFFFF;        /* Canvas / background */
  --ncac-red-hover: #E02000;    /* Suggested darker hover state (not in guide) */
  --ncac-red-light: #FFF0ED;   /* Suggested light tint for subtle backgrounds (not in guide) */
}
```

---

## 2. Typography

### Font Family: Polymath

The brand uses the **Polymath** typeface family exclusively. Two weights/variants appear:

| Variant | Usage | Sizes in guide |
|---------|-------|----------------|
| **PolymathDisp-Bold** | Display headings, section titles, logo typemark | 60pt, 84pt |
| **PolymathText-Bold** | Body copy, list items, supporting text | 30pt |

### Typographic Rules

1. **Typemark-based identity** — no pictorial logo, just the words "Nevada County Arts & Culture" set in Polymath
2. **Same typography across all marks** — parent org and sub-brands all use Polymath to eliminate "logo soup"
3. **Two to three type sizes max** per expression to reduce visual noise
4. **Clear type and message hierarchy at all times**

### Typographic Characteristics

- Polymath is a **geometric sans-serif** with distinctive rounded terminals (visible in the "a", "e", "C" letterforms)
- The display weight is **very bold** with tight letter spacing
- Text is set with generous line height
- The typeface has a warm, approachable quality — not clinical or corporate

### Web Font Fallback Strategy

Polymath is a commercial/custom typeface. For web implementation:

```css
/* If Polymath is available as a web font */
font-family: 'Polymath', 'Polymath Display', sans-serif;

/* Closest Google Fonts alternatives (if licensing is an issue):
   - Nunito (rounded geometric sans, similar warmth)
   - Quicksand (rounded terminals, geometric)
   - Rubik (geometric, slightly rounded)
   None are exact matches — Polymath's bold is distinctively chunky */
```

---

## 3. Logo / Typemark

### Form

The logo is a **typemark** (wordmark), not a symbol. It reads:

```
Nevada County
Arts & Culture
```

Set in **PolymathDisp-Bold**, stacked two lines, center-aligned.

### Logo Variants

| Variant | Description |
|---------|-------------|
| **Red background, white text** | Primary. Used on business cards, tote bags, social avatars. The red rectangle/square contains the typemark. |
| **White background, red text** | Secondary. Used when the red bg treatment is impractical. |
| **Red circle, white text** | Avatar variant for social media profile pictures. |
| **Red square, white text** | Avatar variant (alternative to circle). |

### Logo Placement Rules (from layout hierarchy)

- Logo appears at **bottom-left** of all framed materials as "Presenter"
- Sized small relative to the headline — it brands without dominating
- Partner logos appear at bottom-right when co-presenting

### Key Constraint

There is **no icon or symbol** — the typemark IS the logo. This means the website should not invent a favicon icon that doesn't exist in the brand system. Use the red square with white "NCAC" abbreviation or the full typemark cropped, consistent with the avatar treatments shown.

---

## 4. Visual Style Direction

### The Framing Device

The most important visual element in the system is the **red border frame**:

- A **red (#FF2400) rectangular border** that wraps content
- Acts as a universal container — every poster, social card, and print piece uses it
- The frame is **adaptable**: it can include or exclude a bottom bar for presenter/partner logos
- Inside the frame: white space, black typography, and a single key image
- The frame has a **program heading pill** at the top (e.g., "Art at the Airport", "Artist Spotlight", "Creatives Meetup") — small red text on a red bg bar

### Photography Style

- **Documentary / authentic** — real people in real settings (artists at work, community gatherings)
- **Black and white** photography is used for formal portraits (Artist Accelerator instructor photos, team bios)
- **Color photography** for event imagery, art reproductions, landscape/place imagery
- Images are placed within the grid, often with **rounded corners** on the image container
- No heavy filtering or stylization — the photography should feel genuine and local

### Illustration / Key Art

- **Abstract gradient blobs** (orange/pink/magenta/green) are used as "key art" for specific programs like Creatives Meetup
- These gradients are **not** part of the core brand — they serve as event-specific visual energy
- The guide also shows **landscape illustration** (the "Sunrise to Sunset" mountain scene) as an example of artwork-as-key-art
- The system accommodates both photography and illustration as the "key image" within the frame

### Overall Aesthetic

- **Swiss modernist** influence: grid-based, type-forward, systematic
- **Bold and confident** — very large display type, strong color blocking
- **Warm and approachable** — the rounded Polymath typeface softens the modernist rigor
- **Reductive** — the entire system runs on red + charcoal + white + one image

---

## 5. Brand Voice / Tone

The brand guide is primarily visual, but the voice is evident from the content shown:

### Positioning Statement

NCAC positions itself as **curator / connector / steward** of the arts ecosystem.

### Tone Characteristics

- **Confident and direct** — "Art moves mountains" (website hero), "Donate Today", "Apply"
- **Community-oriented** — "Support the future of our creative ecosystem"
- **Action-driven** — CTAs are bold and imperative: "Become a member", "Read more", "Apply"
- **Not bureaucratic** — despite being a government-adjacent arts council, the tone is warm and galvanizing
- **Inclusive** — "The arts need you now more than ever!"

### Content Hierarchy (from layout system)

1. **Program heading** (small, categorical — e.g., "Art at the Airport")
2. **Title** (massive, attention-grabbing — e.g., "Sunrise to Sunset")
3. **Subhead** (supporting context)
4. **Dates and location** (practical details)
5. **Key image** (the visual payload)
6. **Presenter** (NCAC logo, small)
7. **CTA** (QR code or action button)

---

## 6. Sub-Brand Relationships

### Architecture: Unified Typemark System

All sub-brands use the **same Polymath typeface** in the same style. The parent brand and sub-brands are distinguished only by name, not by different logos or typefaces.

| Entity | Typemark Text | Logo Shape |
|--------|--------------|------------|
| **Nevada County Arts & Culture** | "Nevada County / Arts & Culture" | Red rectangle or circle |
| **Truckee Cultural District** | "Truckee / Cultural District" | Red rectangle or circle |
| **GVNC Cultural District** | "GVNC / Cultural District" | Red rectangle or circle (GV-NC = Grass Valley-Nevada City) |
| **Truckee Arts Alliance** | "Truckee Arts Alliance" | Uses the same frame system |

### Program Sub-Brands

These are not separate logos — they appear as **program heading labels** within the framing device:

- Art at the Airport
- Art in Public Spaces
- Artist Spotlight
- Artist Accelerator (The Business of Art)
- Mini Grants
- Creatives Meetup
- Culture in Focus (exhibitions)

### Co-Branding Rules

- NCAC logo goes bottom-left ("Presenter")
- Partner/district logo goes bottom-right ("Partners")
- Both use the same red-on-white treatment within the frame's bottom bar

---

## 7. UI / Web Design Guidance

### Website Mockup (Page 24)

The brand guide includes a website mockup showing:

**Navigation:**
- Top-left: NCAC typemark in red rectangle
- Nav items: About, Events, Programs, Resources, Contribute
- Clean horizontal nav bar with thin bottom border

**Hero Section:**
- Large serif-italic headline: "Art moves mountains" (note: this uses a different typeface than Polymath — appears to be a serif/italic for editorial warmth)
- Red CTA link: "Become a member" with arrow
- Generous white space

**Content Cards ("Happening Now"):**
- Two-column card layout
- Each card uses the **framing device** (red border) containing the event poster
- Below each card: event title, details, "Read more" link in red
- The cards literally embed the branded poster designs as images

**Sidebar (visible on desktop):**
- Muse magazine feature
- "Our Programs" section with small cards
- "Community Calendar" section
- Newsletter signup

**Inner Pages (Pages 25-26):**
- About page: clean typographic layout, generous margins
- Team page: photo + name + title + bio in a structured grid
- Artist Accelerator page: strong headline, "Apply" CTA in red-bordered button, two-column layout for details
- Schedule and instructor sections with clear hierarchy

### Web-Specific Patterns

| Element | Treatment |
|---------|-----------|
| **Links** | Red (#FF2400) with arrow indicator |
| **Buttons / CTAs** | Red border rectangle with text inside, or solid red with white text |
| **Cards** | White background with red border frame (the brand framing device) |
| **Section headings** | Small red text label (like the program heading pill) |
| **Body text** | Dark charcoal (#3F3F3F), generous line height |
| **Images** | Rounded corners within content areas |
| **Layout** | Grid-based, generous white space, max two-three visual weights per section |

---

## 8. Implementation Recommendations for Arts Hub Website

### Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #FF2400;
  --color-primary-hover: #CC1D00;
  --color-text: #3F3F3F;
  --color-text-light: #6B6B6B;
  --color-background: #FFFFFF;
  --color-background-subtle: #F7F7F7;
  --color-border: #E5E5E5;
  --color-frame: #FF2400;  /* The signature framing device */

  /* Typography */
  --font-display: 'Polymath Display', 'Nunito', sans-serif;
  --font-text: 'Polymath Text', 'Nunito', sans-serif;
  --font-editorial: Georgia, 'Times New Roman', serif;  /* For "Art moves mountains" style headlines */

  /* Type Scale (two-three sizes max per section) */
  --text-hero: clamp(2.5rem, 5vw, 4rem);
  --text-heading: clamp(1.5rem, 3vw, 2.5rem);
  --text-body: 1rem;
  --text-small: 0.875rem;
  --text-label: 0.75rem;

  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 3rem;
  --space-xl: 5rem;

  /* Frame */
  --frame-width: 3px;
  --frame-radius: 0;  /* The frame is sharp-cornered */
  --image-radius: 8px;  /* Images within content get rounded corners */
}
```

### Key Design Patterns to Implement

1. **The Red Frame** — The most distinctive brand element. Use as card borders, section containers, and modal frames. A 3px solid `#FF2400` border creates the signature look.

2. **Program Label Pill** — Small label at the top of framed content (red background, white text, uppercase or small). Maps to category/tag UI in the hub.

3. **Presenter Bar** — Bottom of framed content shows NCAC logo left, partner logo right. On the website, this becomes a footer strip on cards.

4. **Type Hierarchy Discipline** — Never more than three font sizes visible in any section. Headlines are massive, body is readable, labels are small. Nothing in between.

5. **Red Links with Arrows** — All text links in red with a right-arrow indicator. Example: "Read more ->" or "Become a member ->"

6. **White Space as a Feature** — The guide uses extremely generous margins and padding. The website should breathe. Do not fill every pixel.

7. **Grid Layout** — The underlying structure is a strict grid (visible on page 11). Content aligns to columns with consistent gutters.

8. **Card = Poster** — Event/content cards on the website should resemble the poster designs: red frame, program label at top, bold title, key image, details, presenter bar at bottom.

### What NOT to Do

- Do not introduce additional brand colors (no blues, greens, purples in the UI chrome)
- Do not use multiple typefaces for UI elements — Polymath for everything
- Do not create pictorial icons for the logo — it is typemark-only
- Do not use drop shadows, gradients, or rounded corners on the framing device (only on images within it)
- Do not clutter — the system's power is in its restraint
- Do not use the gradient blob artwork as a general-purpose background — those are reserved for specific programs (Creatives Meetup)

### Accessibility Considerations

- `#FF2400` on white fails WCAG AA for small text (contrast ratio ~3.9:1). For body text links, consider using the darker charcoal or adding an underline. Reserve red text for large headings and interactive elements where the size compensates.
- `#3F3F3F` on white passes WCAG AA (contrast ratio ~7.5:1) — safe for all body text.
- The red-background-white-text treatment (logo, banners) passes AA for large text.

---

## Summary

The NCAC brand is a **typographic modernist system** built on extreme simplicity: one red, one gray, one typeface, one framing device. Its strength is recognizability through consistency. Every output — poster, social card, business card, website — is immediately identifiable as NCAC through the red frame + bold Polymath type combination. The Arts Hub website should embed this system at its core while using white space and photography to provide the visual richness that the deliberately minimal palette cannot carry on its own.
