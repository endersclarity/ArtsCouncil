# 01-01 Summary: Design Token Foundation

**Plan**: 01-01-PLAN.md (Replace :root design tokens)
**Status**: OBSOLETE — plan was never meaningfully executed
**Date**: 2026-02-14

## What the Plan Called For

Replace Heritage Neumorphism `:root` tokens with editorial palette tokens in `index-maplibre.css` and `index-maplibre-config.js`.

## What Actually Happened

Token swaps were applied to WIP copies (`index-maplibre-phase1-wip.css`) but produced **no visible change** — the layout structure was the real problem, not the palette. The user abandoned this approach.

**Codex (OpenAI)** later built a complete magazine-style layout from scratch on WIP files. When Codex's WIP was promoted to canonical (commit `b2d7e48`), the base CSS (`index-maplibre.css`) was overwritten entirely with Codex's version, which includes its own editorial palette tokens (`--ink`, `--cream`, `--navy`, `--gold`, `--coral`, `--cyan`). The GSD token swap was discarded.

## Execution Agent

- GSD token swap: Claude Code (attempted, discarded)
- Final CSS: **Codex (OpenAI)** — built independently, not through GSD pipeline

## Artifacts

- Canonical: `website/cultural-map-redesign/index-maplibre.css` (Codex's version)
- Backup: `website/cultural-map-redesign/index-maplibre.BACKUP-pre-phase1.css` (pre-Codex)
- Original plan: still in `01-01-PLAN.md` (not executed)
