# AGENTS.md

Agent configuration for the ArtsCouncil repo. This file points to per-skill
config; it deliberately does **not** narrate the codebase — read the code for that.
(The prior CLAUDE.md/AGENTS.md narrative was quarantined under
`.narrative-quarantine/` because it described a dead version of the app.)

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
