# Issue tracker: Linear (the only tracker)

**Linear is THE issue tracker for this repo. Not GitHub. Never GitHub.** All issues,
PRDs, and shaped work live in Linear. Use the **`linear` CLI** (the `linear-cli` skill)
for every operation — do not use the Linear MCP `save_issue`/`get_issue` tools; this repo
standardises on the CLI.

- **Team:** `ClaudeCode` (key `CLA`)
- **Project:** `Cultural Asset Map` — put every new issue in this project.

## Conventions (use the `linear` CLI)

Prefer file-based flags (`--description-file`, `--body-file`) for any multi-line Markdown —
inline `--description`/`--body` mangle newlines.

- **Create an issue:**
  ```bash
  linear issue create --team CLA --project "Cultural Asset Map" \
    --title "…" --description-file /path/to/desc.md
  ```
- **Update an issue / set status:**
  ```bash
  linear issue update CLA-42 --state "In Progress"
  ```
  Statuses: Backlog, Todo, In Progress, In Review, Done, Canceled, Duplicate.
  **Status timing (owner rule):** move to **In Progress** when you START, **Done** when
  finished — never flip straight to Done at the end.
- **Read an issue:** `linear issue view CLA-42` (add `linear issue comment list CLA-42` for discussion).
- **List issues:** `linear issue list --team CLA --sort manual` (or `--sort priority`).
  If the CLI list returns nothing unexpectedly, fall back to the API:
  ```bash
  linear api '{ issues(first: 100, filter: { team: { key: { eq: "CLA" } } }) { nodes { identifier title state { name } } } }'
  ```
- **Comment:** `linear issue comment add CLA-42 --body-file /path/to/comment.md`
- **Relate / dedupe:** `linear issue relation add CLA-42 related CLA-35`
  (or `… duplicate CLA-100`).
- **Labels:** `linear label list` / `linear label create …`; apply triage-role labels per
  `docs/agents/triage-labels.md`.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the `Cultural Asset Map` project (`linear issue create`, as above).

## When a skill says "fetch the relevant ticket"

`linear issue view <identifier>` (e.g. `CLA-42`), plus `linear issue comment list`.

## GitHub — DEAD. Do not use.

The repo's GitHub Issues (`endersclarity/ArtsCouncil`, 49 legacy issues) are **read-only
historical reference only**. Read an old one with `gh issue view <n>` if you genuinely need
prior context — but **never create, update, triage, or close work on GitHub.** New work goes
to Linear, always. If a skill's default is GitHub, override it: this repo's default is Linear.
