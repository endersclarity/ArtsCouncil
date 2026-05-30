# The Directory — portable panel slice

How to lift **just** the redesigned control panel ("The Directory") into your real
app, without taking the hero, header, detail card, or marker changes.

This slice is pure presentation: **markup wrapper + CSS**. It does **not** touch
`app.js`. It binds to the `id`s/classes your `app.js` already writes, so there are
no logic, data, marker-layer, or paint-expression changes.

---

## 3 steps

### 1. Add the stylesheet

Copy `directory-slice.css` into your app and link it **after** your existing
stylesheet so its rules win:

```html
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="directory-slice.css">
```

If your app already defines the NCAC `:root` tokens, delete the `--- 1. TOKENS ---`
block at the top of `directory-slice.css` (it's identical to the source).

### 2. Replace your control-panel markup

Swap your current `<aside class="control-panel">…</aside>` inner markup for this.
**Every `id` here is a hook `app.js` writes into — keep them all exactly.** The
only things this redesign *adds* are static wrappers (`.panel-topline`,
`.dir-section`, `.dir-index`); the hooks themselves are unchanged.

```html
<aside class="control-panel" aria-label="Discovery controls">
  <button type="button" class="drawer-toggle" id="drawer-toggle" aria-label="Toggle panel height">
    <span class="drawer-handle-bar"></span>
  </button>

  <div class="panel-topline">
    <div class="panel-masthead">
      <p class="panel-kicker">Nevada County · Arts &amp; Culture</p>
      <p class="panel-typemark">The Directory</p>
    </div>
    <p class="panel-count"><span id="visible-count">Loading</span></p>
  </div>

  <div class="dir-section dir-section--browse">
    <p class="dir-index"><span class="dir-num">01</span>Browse</p>
    <div class="mode-tabs" role="tablist" aria-label="Map mode">
      <button class="mode-tab active" type="button" data-mode="places">Places</button>
      <button class="mode-tab" type="button" data-mode="events">Events</button>
      <button class="mode-tab" type="button" data-mode="paths">Paths</button>
    </div>
  </div>

  <div class="featured-hint" id="featured-hint">
    <p class="hint-title">Start in the cultural district</p>
    <p>Grass Valley and Nevada City are centered first, with the wider county still visible as context.</p>
  </div>

  <div class="dir-section dir-section--filters">
    <p class="dir-index"><span class="dir-num">02</span>Outing type</p>
    <div class="filter-wrap" id="filters" aria-label="Outing Type browse list"></div>
  </div>

  <div class="review-tools" id="review-tools" aria-label="Review navigation">
    <p class="dir-index"><span class="dir-num">03</span>The index</p>
    <h2 class="browse-heading">Places to explore</h2>
    <label class="review-search-label" for="place-search">
      <span>Search places</span>
      <input id="place-search" class="review-search-input" type="search" placeholder="Search places">
    </label>
    <div class="places-list" id="places-list"></div>
  </div>
</aside>
```

### 3. Ensure the font (optional but recommended)

The masthead uses Polymath via Typekit. If your app doesn't already load it, add to `<head>`:

```html
<link rel="preconnect" href="https://use.typekit.net">
<script src="https://use.typekit.net/ik/QpZL-…-K0oCte.js"></script>
<script>try{Typekit.load({async:true});}catch(e){}</script>
```

(Use your real kit URL from the source `index.html`.) Without it, the panel falls
back to `system-ui` — still legible, just not the brand face.

---

## The contract — what `app.js` must already produce

The slice only lands on real content if your app's JS writes into these hooks.
Since this folder is a copy of your app, it already does — but verify nothing was
renamed:

| Hook | Used by | Role |
|---|---|---|
| `#visible-count` | text content | live "N places to explore" count in the masthead |
| `.mode-tab[data-mode]` | click handlers | Places / Events / Paths tabs |
| `#featured-hint` | `innerHTML` rewrite | **styled via CSS only — do NOT put static children inside; app.js overwrites it** |
| `#filters` | `innerHTML` rewrite | outing-type browse list / chips |
| `#review-tools` | container | the "03 The index" section |
| `#place-search` | search input | place search |
| `#places-list` | `innerHTML` rewrite | the places column |
| `#drawer-toggle` | click handler | mobile bottom-sheet collapse |
| `body[data-map-mode="…"]` | set by app.js | drives `02`/`03` visibility (paths hides filters; non-places hides the index) |

If any of those names differ in your real app, either rename in your markup to
match your JS, or rename the selector in `directory-slice.css` to match — they
just have to agree.

---

## Notes / gotchas

- **`#featured-hint` is CSS-only.** `app.js` rewrites its `innerHTML` on every
  state change, so anything hardcoded inside gets wiped. The starter copy above
  is just the pre-init state.
- **Breakpoints.** The slice ships the source's `880px` / `520px` bottom-sheet
  behavior. If your real app uses different breakpoints, change the `@media`
  values in section 11 to match — behavior is unchanged, only the thresholds.
- **Load order matters.** `directory-slice.css` must load *after* your base
  `styles.css` so its consolidated rules override the old panel styles. If you'd
  rather not depend on order, the alternative is to delete the old panel rules
  from your `styles.css` and paste this file's contents in their place.
- **No `app.js` edit.** Nothing in this slice requires a JS change. The MapLibre
  paint-expression invariant is untouched because no paint expression is involved.
