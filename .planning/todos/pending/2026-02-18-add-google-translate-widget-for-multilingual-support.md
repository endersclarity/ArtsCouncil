---
created: 2026-02-18T07:12:36.176Z
title: Add Google Translate widget for multilingual support
area: ux
files:
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
  - website/cultural-map-redesign-stitch-lab/events.html
  - website/cultural-map-redesign-stitch-lab/directory.html
  - website/cultural-map-redesign-stitch-lab/itineraries.html
  - website/cultural-map-redesign-stitch-lab/trip.html
---

## Problem

The platform has zero explicit multilingual support, creating a barrier for Spanish-speaking visitors in Nevada County. Related to the equity data audit todo (Latino/a/x community visibility gap).

## Research Findings (2026-02-18, via Perplexity)

**Google Translate widget:** Officially discontinued for new sites in 2025. Only available to legacy/nonprofit/gov/academic sites that already have it running. Not viable for new installation.

**LibreTranslate:** Free and open-source, but no drop-in widget — requires self-hosting via Docker + custom JS client. Too much infrastructure overhead.

**DeepL / Lingvanex:** Both paid API only. No free embeddable widget.

**JigsawStack translation widget:** ✅ Best free option.
- Open source (GitHub: jigsawstack/translation-widget)
- Script tag drop-in — one `<script>` from unpkg CDN + one init call
- Free tier: 1M tokens/month, no credit card required
- Handles dynamically JS-rendered content via MutationObserver
- Customizable position, language list, appearance

**Browser-native translation:** Already halfway done.
- All pages already have `<html lang="en">` set correctly
- Chrome/Edge/Safari auto-offer a translation bar when page language differs from browser language
- Spanish-speaking users with `es` browser language already get offered translation automatically
- Zero additional code needed — just user education

## Solution

Two-pronged approach:

### Step 0 (already done): Browser-native baseline
`<html lang="en">` is already set on all pages. Chrome/Edge/Safari users with Spanish browser settings already get the auto-translate bar. No code change needed.

### Step 1: Sign up for JigsawStack (5 min)
1. Go to `jigsawstack.com` — click "Get API Key" (no credit card for free tier)
2. Create account, navigate to dashboard
3. Copy the **public** API key (not secret key — public key is safe to embed in HTML)

### Step 2: Add widget to 5 active pages
Add these two lines before `</body>` in each file:

```html
<!-- Translation widget — JigsawStack free (1M tokens/mo, no CC required) -->
<script src="https://unpkg.com/@jigsawstack/translation-widget@latest/dist/lib.js"></script>
<script>
  TranslationWidget("YOUR_PUBLIC_KEY_HERE", {
    pageLanguage: "en",
    languages: ["es", "zh-CN", "fr", "de", "pt"],
    position: "bottom-left"
  });
</script>
```

**Position must be `bottom-left`** — the chat FAB (AI concierge) lives at bottom-right.

**Files to update:**
- `index-maplibre-hero-intent-stitch-frontend-design-pass.html` (hub)
- `events.html`
- `directory.html`
- `itineraries.html`
- `trip.html`

### Step 3: Optional brand name protection
Add `translate="no"` to elements that should never be translated (venue names on map, brand names):
```html
<span translate="no">Nevada County Arts Council</span>
<span translate="no">MUSE</span>
```
This is optional polish — only needed if translation mangles specific names.

## Gotchas

- MapLibre map canvas (WebGL) won't translate — markers and map labels stay in English. That's fine; the UI chrome is what matters.
- 1M tokens/month is generous for this traffic level. A full-page translation ≈ 10-30K tokens. Monitor usage in JigsawStack dashboard.
- JigsawStack is a startup — if the service disappears, remove the two script lines. No lock-in.
- The AI concierge (Gemini) will still respond in English unless the system prompt is updated for Spanish — that's a separate enhancement.

## Estimated effort

~30 minutes: account creation + pasting 2 script lines into 5 HTML files + commit.
