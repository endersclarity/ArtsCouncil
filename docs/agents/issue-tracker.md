# Issue tracker: Linear

Issues and PRDs for this repo live in **Linear**, not GitHub. Use the Linear MCP
tools (`plugin:linear:linear`) for all operations.

- **Workspace / team:** `ClaudeCode` (key `CLA`)
- **Project:** `Cultural Asset Map` (id `6272c540-82b8-4887-b7b2-04122cb88813`)
  — put every new issue in this project.

## Conventions

- **Create an issue:** `save_issue` with `title`, `description` (Markdown — use
  real newlines, not `\n`), `team: "ClaudeCode"`, `project: "Cultural Asset Map"`.
  Omit `id` to create.
- **Update an issue:** `save_issue` *with* `id`.
- **Read an issue:** `get_issue` (add `list_comments` for discussion).
- **List issues:** `list_issues` with `team: "ClaudeCode"` and/or
  `project: "Cultural Asset Map"`, plus `state`/`label`/`assignee` filters.
- **Comment:** `save_comment` with the issue `id`.
- **Apply labels:** pass `labels` to `save_issue` (label names or ids). Create new
  labels with `create_issue_label` when a triage role label doesn't exist yet.
- **Statuses available:** Backlog, Todo, In Progress, In Review, Done, Canceled,
  Duplicate. Set via the `state` field on `save_issue`.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the `Cultural Asset Map` project (`save_issue`, no `id`).

## When a skill says "fetch the relevant ticket"

`get_issue` by id/identifier (e.g. `CLA-42`), plus `list_comments`.

## GitHub (read-only reference)

The repo's GitHub Issues (`endersclarity/ArtsCouncil`, 49 issues of prior map work)
are kept only as historical reference. Read them with `gh issue view <n>` when you
need context on what was attempted before. **Do not create or triage new work
there** — new work goes to Linear.

## Linear (planned-future note)

This is the Linear setup the user flagged earlier as "a fresh window" task — now
done. Linear is the single working tracker for the Pocock engineering spine.
