const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "docs", "AMNESIAC-PROJECT-BRIEFING.html");

function asset(rel, alt) {
  const file = path.join(root, rel);
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    ext === "webp" ? "image/webp" :
    "image/png";
  const data = fs.readFileSync(file).toString("base64");
  return `<img src="data:${mime};base64,${data}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const slides = [
  {
    kicker: "Project Reorientation",
    title: "The Discovery Map, if you woke up mid-project",
    body: [
      "This is a shareable reset deck for someone who knows the project but has lost the thread and needs to move again without pretending the uncertainty is gone.",
      "Read it as a working map: what exists, what the evidence says, what is still unknown, and what to do next.",
    ],
    image: asset("docs/briefing-assets/generated-discovery-hero.png", "Generated editorial atlas concept for a cultural discovery map"),
    label: "Generated direction image",
  },
  {
    kicker: "The One-Sentence Story",
    title: "From asset inventory to cultural discovery",
    body: [
      "The strongest current direction is not an Arts Hub, not an AI itinerary builder, and not a tourism platform.",
      "It is an approval-stage Discovery Map prototype: places first, events as a living layer, and curated paths as authored cultural routes.",
    ],
    facts: [
      "Canonical folder: website/cultural-map-redesign-stitch-lab/v1-discovery-map",
      "Current data: 1076 places, 24 events, 3 paths",
      "Primary job: stakeholder confidence",
      "Primary proof: cultural authority, not feature completeness",
    ],
  },
  {
    kicker: "Where To Stand",
    title: "The repo gives us firmer ground than the memory does",
    body: [
      "The cleanest current documents agree on one thing: do not restart the whole project and do not chase every old branch of meaning.",
      "Work from the V1 Discovery Map alpha, then prepare a human-readable update that makes the choices and open questions visible.",
    ],
    facts: [
      "PRODUCT.md: V1 is an internal approval-stage MapLibre alpha.",
      "V1 brief: first job is Arts Council stakeholder confidence.",
      "Decision log: V1 shell is the chosen base; older Arts Hub and atlas directions are anti-references unless explicitly revived.",
      "Project orientation: the blocker is decision confidence, not code.",
    ],
  },
  {
    kicker: "Current App Snapshot",
    title: "What exists right now",
    body: [
      "The app is real enough to inspect: a MapLibre alpha with NCAC-styled shell, place anchors, route mode, event mode, placeholder image handling, and generated data.",
      "It is not yet a public product. It is a product argument.",
    ],
    image: asset("docs/briefing-assets/app-current-desktop.png", "Current V1 Discovery Map desktop screenshot"),
    label: "Real screenshot: current V1 app",
  },
  {
    kicker: "Interaction Proof",
    title: "Paths are fixed stories, not dynamic trip planning",
    body: [
      "The current V1 treats paths as curated mapped routes with numbered stops and light narrative.",
      "This keeps the prototype from drifting into a full AI itinerary product.",
    ],
    image: asset("docs/briefing-assets/app-current-path-selected.png", "Current V1 Discovery Map selected path screenshot"),
    label: "Real screenshot: selected path state",
  },
  {
    kicker: "Mobile Reality Check",
    title: "The concept survives the small screen",
    body: [
      "The mobile state matters because the likely real audience is looking for what to do, where to go, and what is nearby.",
      "The current app has a bottom-drawer pattern, visible map, and route controls, but still needs a focused QA pass before being shown widely.",
    ],
    image: asset("docs/briefing-assets/app-current-mobile.png", "Current V1 Discovery Map mobile screenshot"),
    label: "Real screenshot: current mobile view",
  },
  {
    kicker: "Cultural Reference",
    title: "MUSE is an editorial anchor, not just a style reference",
    body: [
      "MUSE positions NCAC as a narrator of local arts and culture, not just a data maintainer.",
      "That matters because the Discovery Map needs cultural authority and place-aware editorial judgment, not generic map UI.",
      "No full local MUSE article screenshot gallery was found; this deck uses the live MUSE page and local MUSE-adjacent assets as context.",
    ],
    image: asset("docs/briefing-assets/ncac-muse-page.png", "Nevada County Arts MUSE page screenshot"),
    label: "Real screenshot: NCAC MUSE page",
  },
  {
    kicker: "Strategic Context",
    title: "Culture Forward is the broader civic frame",
    body: [
      "Culture Forward describes a countywide arts and culture action plan, with goals around cultural life, career pathways, infrastructure, partnerships, land, culture, and stewardship.",
      "The Discovery Map should not try to become the whole plan. It can make one slice visible and useful.",
    ],
    image: asset("docs/briefing-assets/culture-forward-home.png", "Culture Forward website screenshot"),
    label: "Real screenshot: Culture Forward site",
  },
  {
    kicker: "Possible Direction",
    title: "What the next visual layer could feel like",
    body: [
      "Generated images are not evidence. They are imagination scaffolds.",
      "Use them to ask: should the map feel more like an editorial atlas, a civic discovery table, a magazine companion, or a product dashboard?",
    ],
    image: asset("docs/briefing-assets/generated-concept-sheet.png", "Generated four-panel concept sheet for possible discovery map directions"),
    label: "Generated concept sheet",
  },
  {
    kicker: "What This Deck Proves",
    title: "Useful, but not omniscient",
    columns: [
      ["Proven", "A current V1 app exists, it renders, and it contains places, events, and curated paths in a map-first shell."],
      ["Grounded", "The product frame is supported by PRODUCT.md, the V1 brief, the decision log, April 24 synthesis, and live public context."],
      ["Not Yet Proven", "The next recipient, deadline, email promise, PDF details, and stakeholder expectations still need confirmation."],
    ],
  },
  {
    kicker: "Known Unknowns",
    title: "The uncertainty is part of the map",
    body: [
      "Who is the next audience?",
      "Is there a deadline or meeting date?",
      "Is the next deliverable a live prototype, screenshots, a memo, or a deck?",
      "Is AI still expected soon, or intentionally deferred?",
      "How current must event data be for the next review?",
    ],
    aside: "These are not blockers to thinking. They are exactly what a stakeholder update can ask.",
  },
  {
    kicker: "Risk",
    title: "The danger is not lack of code. It is building in the wrong direction.",
    body: [
      "The repo contains many old branches of meaning: Cultural Asset Map, Arts Hub, directory, AI concierge, itinerary builder, calendar, tourism platform, stakeholder demo.",
      "The current orientation resolves this: V1 is a stakeholder-facing Discovery Map alpha. It proves a culture-forward map experience. It does not solve the whole platform.",
    ],
  },
  {
    kicker: "Next Work",
    title: "Three concrete sessions that actually move the project",
    columns: [
      ["1. QA the current V1", "Run locally, check desktop/mobile, console/network, places/events/paths, stale data, broken images, copy mismatches."],
      ["2. Demo-readiness pass", "Tighten first load, anchor cards, event language, path copy, placeholder labels, and mobile drawer polish."],
      ["3. Stakeholder update package", "Prepare screenshots, short explanation, unknowns, and feedback questions. Read email only if recipient/deadline/promise is unclear."],
    ],
  },
  {
    kicker: "Source Map",
    title: "What this briefing is grounded in",
    facts: [
      "docs/PROJECT-ORIENTATION.md",
      "docs/PROJECT-ORIENTATION-EXECUTION-STRATEGY.md",
      "PRODUCT.md",
      "docs/V1-DISCOVERY-MAP-BRIEF.md",
      "docs/V1-DISCOVERY-MAP-DECISION-LOG.md",
      "Transcripts/2026-04-24_product-brief_DISCOVERY-MAP.md",
      "Transcripts/2026-04-24_arts-council-session_GPT-SUMMARY.md",
      "Current app screenshots captured from localhost:8771",
      "NCAC MUSE and Culture Forward screenshots captured from public sites",
      "Generated images created for possible-direction discussion only",
    ],
    aside: "PDFs and email are intentionally not treated as settled evidence in this version until they are pulled into the source map.",
  },
];

function renderSlide(slide, index) {
  const body = slide.body ? `<div class="body">${slide.body.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</div>` : "";
  const facts = slide.facts ? `<ul class="facts">${slide.facts.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>` : "";
  const columns = slide.columns ? `<div class="columns">${slide.columns.map(([h, p]) => `<section><h3>${escapeHtml(h)}</h3><p>${escapeHtml(p)}</p></section>`).join("")}</div>` : "";
  const aside = slide.aside ? `<aside>${escapeHtml(slide.aside)}</aside>` : "";
  const image = slide.image ? `<figure>${slide.image}<figcaption>${escapeHtml(slide.label || "Source image")}</figcaption></figure>` : "";
  return `
    <section class="slide ${slide.image ? "with-image" : "text-only"}" id="slide-${index + 1}">
      <div class="copy">
        <p class="kicker">${escapeHtml(slide.kicker)}</p>
        ${index === 0 ? `<h1>${escapeHtml(slide.title)}</h1>` : `<h2>${escapeHtml(slide.title)}</h2>`}
        ${body}
        ${facts}
        ${columns}
        ${aside}
      </div>
      ${image}
      <span class="page">${String(index + 1).padStart(2, "0")}</span>
    </section>
  `;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Arts Council Discovery Map Reorientation Briefing</title>
<style>
:root {
  --paper: #f7f3ec;
  --ink: #1c1a18;
  --muted: #6d665f;
  --line: #d8d0c6;
  --red: #f03a1d;
  --teal: #2d7772;
  --gold: #b78b43;
  --charcoal: #27231f;
  color-scheme: light;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--paper);
  color: var(--ink);
}
.deck-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 18px;
  background: rgba(247, 243, 236, 0.92);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(14px);
  overflow-x: auto;
}
.deck-nav strong { white-space: nowrap; margin-right: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; }
.deck-nav a {
  flex: 0 0 auto;
  color: var(--ink);
  text-decoration: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  background: #fff8;
}
.slide {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.1fr);
  gap: 36px;
  align-items: center;
  padding: 72px clamp(24px, 5vw, 72px);
  border-bottom: 1px solid var(--line);
  overflow: hidden;
}
.slide::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(240,58,29,.07), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(45,119,114,.10), transparent 30%),
    repeating-linear-gradient(135deg, rgba(28,26,24,.035) 0 1px, transparent 1px 18px);
}
.slide > * { position: relative; }
.text-only {
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
}
.text-only .copy { max-width: 980px; }
.copy { max-width: 720px; }
.kicker {
  margin: 0 0 18px;
  color: var(--red);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .14em;
  font-weight: 800;
}
h1, h2 {
  margin: 0;
  max-width: 920px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(44px, 6vw, 86px);
  line-height: .94;
  font-weight: 650;
  letter-spacing: 0;
}
.body {
  margin-top: 26px;
  display: grid;
  gap: 14px;
  max-width: 760px;
}
.body p, aside, .columns p {
  margin: 0;
  color: var(--charcoal);
  font-size: clamp(18px, 2vw, 26px);
  line-height: 1.35;
}
figure {
  margin: 0;
  align-self: center;
  border: 1px solid color-mix(in srgb, var(--line), #000 8%);
  background: #fff;
  box-shadow: 0 24px 70px rgba(38, 30, 23, .18);
}
figure img {
  display: block;
  width: 100%;
  max-height: 74vh;
  object-fit: cover;
}
figcaption {
  padding: 10px 14px;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.facts {
  margin: 32px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
  list-style: none;
  max-width: 920px;
}
.facts li {
  padding: 14px 16px;
  border-left: 5px solid var(--red);
  background: rgba(255,255,255,.58);
  color: var(--charcoal);
  font-size: clamp(17px, 1.8vw, 24px);
}
.columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 34px;
}
.columns section {
  padding: 22px;
  min-height: 240px;
  background: rgba(255,255,255,.62);
  border: 1px solid var(--line);
}
.columns h3 {
  margin: 0 0 12px;
  font-size: clamp(22px, 2.4vw, 34px);
  line-height: 1.03;
  font-family: Georgia, "Times New Roman", serif;
}
aside {
  margin-top: 30px;
  padding: 20px 24px;
  background: var(--ink);
  color: var(--paper);
  max-width: 760px;
}
.page {
  position: absolute;
  right: 24px;
  bottom: 18px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .16em;
}
@media (max-width: 900px) {
  .slide {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 56px 18px;
  }
  figure img { max-height: 50vh; }
  .columns { grid-template-columns: 1fr; }
}
@media print {
  .deck-nav { display: none; }
  .slide { min-height: 100vh; break-after: page; }
}
</style>
</head>
<body>
<nav class="deck-nav">
  <strong>Discovery Map Briefing</strong>
  ${slides.map((s, i) => `<a href="#slide-${i + 1}">${String(i + 1).padStart(2, "0")}</a>`).join("")}
</nav>
<main>
${slides.map(renderSlide).join("")}
</main>
</body>
</html>`;

fs.writeFileSync(out, html);
console.log(out);
