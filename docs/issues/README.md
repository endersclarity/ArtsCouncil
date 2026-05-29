# Issue working folders

One subfolder per Linear issue we actively work, named `CLA-<n>-<short-slug>/`.

This is the local scratch + evidence home for an issue while it's in flight:
observations, before/proposed/final screenshots, prompts sent to Codex, design
notes, and any other document bloat that crops up during the work. Linear stays
the source of truth for status; this folder is the working desk.

## Per-folder convention

- `NOTES.md` — running observations, decisions, root-cause findings, the agreed
  visual target, and links back to the Linear issue.
- `before-*.png` — current/broken state (the "before" proof).
- `proposed-*.png` — Codex/image-gen mockup of the agreed target.
- `after-*.png` — final implemented state (the "after" proof).
- anything else useful (prompts, snippets, exported data).

Matches the CLA-29 workflow: agree a visual target → before/proposed/final proof.
