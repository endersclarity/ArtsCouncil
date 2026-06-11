# PRD: MUSE Business Directory Layer

**Date:** 2026-06-10
**Product:** v1-discovery-map (NCAC cultural map, https://v1-discovery-map.vercel.app)
**Status:** Draft — for owner review, then Council demo
**Owner:** Kaelen

## 1. The ask and its provenance

- **March 13 (Eliza, live transcript):** "Muse has a business directory which is
  phenomenal. And we ultimately have always wanted that to become… an additional
  layer within the Cultural asset map." Strongest standing ask on record.
- **April 24 (governing direction record):** keeps it, but generically —
  "integrating local cultural assets, events calendar, business directory."
  No MUSE name, no detail.
- **Rule this PRD follows:** build the layer; ship it under a neutral name
  ("Directory" / "MUSE Picks" toggle defaulted off or demo-only); let Eliza
  re-attach the MUSE name in the feedback session. The April-24-only scope rule
  means the MUSE branding is a proposal, not a delivered ask.

## 2. The vision in one sentence

The map becomes the living, navigable version of the MUSE magazine's printed
business directory: MUSE's curation, the map's geography.

## 3. What already exists (no new data collection needed)

| Asset | Where | State |
|---|---|---|
| OCR of all 3 MUSE issues incl. directory pages | `docs/muse-corpus/{2024,2025,2026}/pages/*.txt` | Done; directory pages read cleanly (name, category, address, phone, website per listing) |
| Cross-reference flags | `data/places.json`, `musePick: true` on **466 / 1,351** places | Done but **never audited** |
| "MUSE Picks" as a category | 186 places whose *only* home is the MUSE Picks category | Anomaly — see §5 |
| Flip-book deep links | Story Lens, `museArticleUrl()` in app.js | Shipped; reusable for directory pages |

Flag distribution by category: MUSE Picks 186, Eat/Drink & Stay 151,
Galleries & Studios 44, Performing Arts 43, Cultural Resources 22,
Shops & Makers 16, Historic Places 3, Arts Organizations 1.

## 4. Scope

In scope (all presentation inside the existing single-page map — assets-map-only
scope holds):

1. **Reconciliation pass (prerequisite, data-only).** Parse the 2026 directory
   pages from the OCR into a structured listing set (name, MUSE category,
   address, phone, website, page number). Reconcile against the 466 flags:
   - Listings that matched no place → candidate adds or match fixes.
   - Flagged places absent from the 2026 directory → stale; demote or annotate
     with the issue year they came from.
   - Output: `scripts/muse-directory-reconcile.md` (human review doc) +
     corrected flags. Nothing ships under any MUSE label until this passes.
2. **Directory toggle.** A filter that limits the map to flagged places.
   Neutral label pending Council blessing.
3. **Card badge.** Small mark on every flagged place's card: "Listed in the
   MUSE 2026 directory" (+ issue year).
4. **MUSE category ride-along.** Show the directory's own label
   ("Coffee / Roastery", "Salumeria / Deli") on flagged cards. Store as
   `museCategory` with provenance, do NOT overwrite map categories.
5. **Flip-book deep link.** Badge links to the listing's directory page in the
   Heyzine flip-book, same mechanism as Story Lens article links.

Out of scope: hub pages, separate directory page/view, Trumba/events work,
self-serve listing claims, anything beyond the map (per 2026-06-10 scope
reduction).

## 5. The MUSE-Picks-as-category problem

186 places have "MUSE Picks" as their *category*. A provenance bucket is
masquerading as a kind of place; once the layer exists as a toggle, the
category is redundant and confusing (a toggle and a category showing different
subsets of the same idea). Resolution, as part of the reconciliation pass:

- Re-home each of the 186 into a real category using the MUSE directory's own
  label as the guide (e.g. "Coffee / Roastery" → Eat, Drink & Stay).
- Keep `musePick: true` + new `museCategory` on all of them.
- Retire the "MUSE Picks" category once empty. Renderer change + cache-bust.

## 6. Non-goals / guardrails

- No MUSE branding shipped publicly before Eliza blesses it. Demo-ready ≠ live.
- No new AI-generated content; the directory's own words only, with provenance
  (matches Eliza's "validated data, no hallucinations" principle).
- Don't grow the map from directory adds without a curation decision —
  unmatched listings go in the review doc, not straight into places.json.
- Lodging caution still applies: directory lodging listings don't override the
  open Eat/Drink/Stay curation question.

## 7. Demo framing (the point of all this)

The layer is the opener for the overdue feedback session: "You said you always
wanted the MUSE directory as a layer on the map. Here it is — every listing
from the 2026 issue, mapped, with its directory page one click away. Tell us
what to call it." Bring the audit's Q1 ask table.

## 8. Sequencing and rough effort

1. Reconciliation pass — 1 session (scripted parse + review doc; human review
   of mismatches is owner work).
2. Category re-home of the 186 — same session, after review sign-off.
3. Toggle + badge + museCategory display + flip-book link — 1 session
   (app.js + styles.css, cache-bust, changelog entry, agent-browser verify
   on 8013).
4. Demo, then naming/branding per Council.

## 9. Grill decisions (self-answered 2026-06-10, owner may override)

The PRD was grilled question-by-question against the codebase. Each answer
below is the recommended resolution, adopted as the working decision.

**Q1. "No MUSE branding before blessing" — is that even the status quo?**
No. "MUSE Picks" is already a *public category* on the live site (placeholder
icon at `assets/category-placeholders-ncac/muse-picks.png`, mapped into the
"Arts" outing type), and the Story Lens ships MUSE-branded article links.
**Decision:** the guardrail applies to *new* branding only. The toggle ships
under the already-public name "MUSE Picks"; "MUSE Directory" as a named layer
waits for Eliza. §6 amended in spirit accordingly.

**Q2. What UI mechanism is the toggle?** The app already has a chip pattern
(time-lens chips in Events mode, app.js ~line 1038). **Decision:** a
"MUSE Picks only" chip in Places mode filtering on the `musePick` flag,
AND-composed with the existing outing-type/mood filters. No new mode, no new
category.

**Q3. What happens visually to the 186 when their category is retired?**
Breakdown today: 175 markerTier=candidate + publicMarker=true (they render),
10 directory-only + publicMarker=false (hidden), 1 map-ready. The `candidate`
flag is computed in app.js (line 235) but never consumed, so re-homing
changes no marker visibility. **Decision:** re-home is safe; keep each
place's markerTier/publicMarker untouched. The 10 directory-only places stay
hidden until coordinates are proven.

**Q4. How does the reconciliation match OCR listings to places?**
183 of the 186 have websites. **Decision:** match on normalized website
domain first, then normalized name + city. Ambiguous or no-match listings go
to the review doc, never auto-resolved.

**Q5. Where does the flip-book link get its page?** The Story Lens
`museArticleUrl()` mechanism is reusable; the parse must capture the print
page number per listing (`musePage`), and the same per-issue page-offset risk
applies. **Decision:** store `musePage` + `museIssue` per listing during the
parse; reuse the existing URL builder with the directory's offset.

**Q6. 2024/2025 listings that dropped out of 2026?** **Decision:** store
`museIssues` as a list of years. Badge text uses the latest year. Places
appearing only in older issues keep the flag but the badge says so honestly
("MUSE 2024 directory"); nothing silently unflagged. Owner can cull later.

**Q7. 2026 listings with no matching place?** **Decision:** review doc only,
queued for the Diana curation session. No auto-adds (PRD §6 holds).

**Q8. Ship live or keep as local demo?** Push = publish on this repo.
**Decision:** ship live. The "MUSE Picks" language is already public; the
chip only exposes data that's already on the site. The *demo* moment for the
Council is the framing in §7, not a hidden build. Owner consent still required
before any push, per standing rule.

**Q9. Data shape added by the reconciliation pass?** Per flagged place:
`museCategory` (directory's own label), `museIssues` (years list),
`musePage` (latest issue's page), provenance untouched elsewhere. Map
categories never overwritten (§4.4 holds).

## 10. Remaining owner calls

Most open questions were resolved in §9 (overridable). Still genuinely yours:

- Sign off on the reconciliation review doc before any flag corrections land.
- The push itself (push = publish; consent per standing rule).
- When and how the Council demo happens (§7).
