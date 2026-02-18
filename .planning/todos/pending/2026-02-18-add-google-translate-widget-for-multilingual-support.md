---
created: 2026-02-18T07:12:36.176Z
title: Add Google Translate widget for multilingual support
area: ux
files:
  - website/cultural-map-redesign-stitch-lab/index-maplibre-hero-intent-stitch-frontend-design-pass.html
---

## Problem

The platform has zero multilingual support. The equity data audit todo flags Latino/a/x community visibility as a gap, and the source data never captured Spanish-language communities. A language switcher is the minimum viable step toward accessibility for Spanish-speaking visitors in Nevada County.

## Solution

Drop a Google Translate widget via script tag. ~30 minutes of work. Recommended approach:

1. Add Google Translate script to the main HTML `<head>`
2. Add a `<div id="google_translate_element">` in the nav/header area
3. Initialize via `googleTranslateElementInit()` callback
4. Style the widget to match the editorial aesthetic (hide Google branding as much as Google's ToS allows)

This is a stopgap — not a real i18n solution. Real options for future consideration:
- **Weglot** (~$99-200/mo): SaaS proxy, auto-translates, Vercel integration, handles content updates automatically — best option if budget exists
- **Proper i18n**: Extract all strings to `strings.en.json` + `strings.es.json`, swap on `?lang=es` — major refactor of 36+ modules, not worth it without a framework

For now, the widget gets "we have Spanish" without a second deployment or ongoing maintenance burden.
