# AGENTS.md

Agent configuration for the ArtsCouncil repo. This file points to per-skill
config; it deliberately does **not** narrate the codebase — read the code for that.
(The prior CLAUDE.md/AGENTS.md narrative was quarantined under
`.narrative-quarantine/` because it described a dead version of the app.)

## Branch policy — ONE branch, no exceptions (owner rule, 2026-05-29)

**Do all work on the single current branch. Do NOT create a per-issue branch unless
the owner explicitly asks for one.** Per-issue branches caused finished work (e.g. the
CLA-30 map cursor) to silently not exist on the branch the owner was using — work
appeared to "disappear." It did not; it was stranded on an unmerged sibling branch.

Rules:
- A change the owner approves lands on the current branch immediately. No side branches.
- Never leave approved work on a branch the owner's workspace isn't on.
- If you ever DO branch (only on explicit request), merge it back the same session.
- When the owner asks "where did X go?", suspect an unmerged branch first
  (`git branch -a`, `git log --oneline <branch>..HEAD`), not a regression.

To see/run the live app: **`pwsh -File run.ps1`** (serves the v1 map on port 4178).
"Done" should always be verifiable by the owner in the browser — not just in a commit.

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
  **Exception (owner decision 2026-06-10): `.planning/STATE.md` IS the live cross-session
  journey tracker** — read it on session start, update its Current Position / Last activity /
  Next at session end. Also live: `.planning/hub/` (current product + design direction, incl.
  `design/DESIGN-SOURCE-OF-TRUTH.md`). The *phase plans* remain aspirational history.
- `.narrative-quarantine/` — the old CLAUDE.md/AGENTS.md narrative, quarantined for the same reason.

Build your mental model from the live app's code + `CONTEXT.md` (glossary) + `docs/adr/`.
Active worktrees under `.claude/worktrees/` may hold in-flight work on other branches — leave them.

## Agent skills

### Issue tracker

**Linear is THE tracker — not GitHub, never GitHub.** Shaped work (PRDs, vertical-slice
issues) lives in **Linear** — project **"Cultural Asset Map"** in the `ClaudeCode` team —
via the **`linear` CLI** (the `linear-cli` skill), NOT the MCP tools. The 49 legacy issues
on GitHub (`endersclarity/ArtsCouncil`) are **read-only history only** — never create or
triage new work there. See `docs/agents/issue-tracker.md`.

Linear rules (full detail in the `linear-cli` skill):
- Use the `linear` CLI: `linear issue create --team CLA --project "Cultural Asset Map"`,
  `linear issue update CLA-42 --state …`, `linear issue comment add CLA-42 --body-file …`.
  Prefer `--description-file`/`--body-file` for multi-line Markdown.
- **Status timing:** move an issue to In Progress when you START, Done when finished —
  never flip straight to Done at the end (owner rule, see CLA-27).
- Read first (`linear issue view <id>`) before creating, to avoid duplicates.

### Triage labels

Five canonical triage roles, default strings, applied as Linear issue **labels**
(created on first use). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` at the repo root, ADRs in `docs/adr/` (created
lazily by `grill-with-docs`). See `docs/agents/domain.md`.
