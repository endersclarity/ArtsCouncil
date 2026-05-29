# AGENTS.md

Agent configuration for the ArtsCouncil repo. This file points to per-skill
config; it deliberately does **not** narrate the codebase — read the code for that.
(The prior CLAUDE.md/AGENTS.md narrative was quarantined under
`.narrative-quarantine/` because it described a dead version of the app.)

## Intent Layer — start here

**The live app is `website/cultural-map-redesign-stitch-lab/v1-discovery-map/`** — a single
`app.js` (vanilla IIFE) + `review-state.js` + `styles.css` + `index.html`, MapLibre GL JS 4.7.1,
CARTO Positron basemap, flat JSON in `data/`. No backend, no bundler. **Read that folder's own
`AGENTS.md` before editing it** — it documents invariants that fail silently.

**Everything below is NOT the live app — do not treat as ground truth:**
- `website/cultural-map-redesign/` — the dead 86-module "flagship" graveyard.
- `website/arts-hub-v2/` — an abandoned variant (last touched 2026-03).
- `.planning/` — GSD planning for the *"GVNC Cultural District Experience Platform"* (36-module
  flagship vision: AI concierge, trip builder, MUSE editorial, Vercel; analysis dated 2026-02).
  It describes the flagship, not the V1 map. Aspirational history, not the current build.
- `.narrative-quarantine/` — the old CLAUDE.md/AGENTS.md narrative, quarantined for the same reason.

Build your mental model from the live app's code + `CONTEXT.md` (glossary) + `docs/adr/`.
Active worktrees under `.claude/worktrees/` may hold in-flight work on other branches — leave them.

## Agent skills

### Issue tracker

Shaped work (PRDs, vertical-slice issues) lives in **Linear** — project
**"Cultural Asset Map"** in the `ClaudeCode` team — via the Linear MCP tools.
The 49 legacy issues on GitHub (`endersclarity/ArtsCouncil`) are kept as
**read-only history/reference**, not the working tracker. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, default strings, applied as Linear issue **labels**
(created on first use). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` at the repo root, ADRs in `docs/adr/` (created
lazily by `grill-with-docs`). See `docs/agents/domain.md`.
