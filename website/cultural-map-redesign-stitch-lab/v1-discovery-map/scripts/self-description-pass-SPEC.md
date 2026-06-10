# Spec: Venue Self-Description Pass (full run)

Goal: replace templated card descriptions ("…included for alpha review") with each
venue's OWN words, scraped from its own website. Pilot proven 2026-06-10 on 20 venues
(method + output format: `data/self-descriptions-pilot.json`).

## Targets

Places in `data/places.json` where BOTH are true:
- `website` starts with `http`
- `description` contains "included for alpha review"

Build the target list once into `scripts/fullpass-venues.json`
(fields: id, name, category, city, website). Expect roughly 400–500.

## Pipeline (loop iterations work through these stages)

1. **Fetch** (script, no LLM): for each target, download homepage + first linked
   "about" page, strip HTML to plain text (5,000 chars/page max), save batches to
   `scripts/fullpass-pages/batch-NNN.json` (25 venues per batch). Reuse the pilot
   fetch code (`scripts/pilot-pages/raw.json` was made the same way). 8 workers,
   15s timeout, record failures with reason. Politeness: one fetch per venue, no
   retries hammering dead hosts.
2. **Extract** (Haiku subagents, ~3–4 in parallel): one subagent per batch file,
   same prompt rules as the pilot — verbatim self-description ≤320 chars, never
   invent, confidence high/medium/low, empty + notes when no usable text. Output:
   `scripts/fullpass-out/batch-NNN.json`.
3. **Spot-check** (main agent): per completed batch, verify 3 random non-empty
   quotes appear in the batch's source text. A batch with a fabricated quote is
   re-run once; if it fails again, mark the batch rejected and move on.
4. **Merge** (script): combine accepted batches into `data/self-descriptions.json`.
   Then update `data/places.json`: for entries with confidence high or medium,
   replace `description` with the self-description and add
   `descriptionSource: {kind:"venue-website", url, fetched:"YYYY-MM-DD"}`.
   Low/empty entries leave the place untouched. Keep a one-line stats summary.
5. **Findings**: collect dead/hijacked/junk website URLs into
   `scripts/fullpass-link-findings.md` (the hijacked Crush site from the pilot
   already belongs on it). Do NOT auto-remove links; that's an owner decision.
6. **Wrap-up**: verify the site locally (serve + agent-browser: open 3 updated
   places, confirm new descriptions render, zero console errors). Add a
   changelog entry to `data/changelog.json` (the pre-commit hook requires it).
   Update `.planning/STATE.md`. Commit. **Do NOT push** — owner reviews first.

## Rules

- Never invent or embellish venue text. Verbatim or near-verbatim only.
- `data/places.json` is ~2MB — never read it wholesale into agent context; use
  scripts (python/jq) for all merging.
- Subagents run on Haiku (`model: haiku`). Keep ≤25 venues per subagent.
- Each loop iteration: advance whichever stage has pending work, then report
  progress (batches fetched / extracted / checked / merged).
- Done when: all batches extracted + checked, merge applied, wrap-up complete.
