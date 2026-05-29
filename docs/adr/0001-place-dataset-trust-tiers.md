# ADR-0001: Place dataset is a deterministic dedup + trust-tier pass, not a workbook regen

Date: 2026-05-28
Status: Accepted
Context skill: grill-with-docs (CLA-15)

## Context

`website/cultural-map-redesign-stitch-lab/v1-discovery-map/data/places.json` has **1,959 rows
/ 1,425 distinct `id`s**. An early reading called this "~4.4× inflation over Diana's 444" —
that was **wrong**, and correcting it is the point of this ADR. The **Diana Workbook** itself
has **1,959 name-bearing rows** across ~13 category sheets; `places.json` is a near 1:1 mirror
of that full roster, not an inflation of it. "444" is only the subset of Diana rows that had
coordinates typed into the spreadsheet — the parser (`build_trusted_data.py:132`) skips the
other **1,515** name/address-only rows.

Two real problems, not inflation:
1. **Diana cross-lists places across category sheets** (e.g. a gallery in both "Gallery Studio
   Museum" and "MUSE BD"; "MUSE BD" is 491 rows with zero coordinates — a cross-reference
   sheet). Same name+city → same `id`, so 1,959 listings collapse to **1,425 distinct places**
   (1,088 on shared coordinates is the visible symptom).
2. **~67% of the roster shipped with no real coordinate**, then got filled with census guesses
   or left blank — and mislabeled `"Map-Ready"`.

Investigating the data (not the docs) revealed it is **already provenance-tagged** with a
clean coordinate-decision pipeline. Every row carries `coordinateSource`,
`coordinateConfidence`, and `locationReviewStatus`. The four tiers sum to the full roster
(444 + 197 + 962 + 356 = 1,959):

| `coordinateSource`                        | rows (raw) | confidence    | glossary term                 |
| ----------------------------------------- | ---------- | ------------- | ----------------------------- |
| `diana-workbook-lonlat` + `-webmercator`  | 444        | authoritative | Diana Workbook (canonical)    |
| `arcgis-cultural-assets-confident-match`  | 197        | high          | Confident Coordinate Match    |
| `us-census-geocoder`                      | 962        | medium        | Coordinate Candidate          |
| `none`                                    | 356        | needs-review  | Needs Location Review         |

The duplication is the defect: the same `id` appears on multiple workbook source sheets
(e.g. *The Center for the Arts* on both "arts organization" and "muse bd" sheets). After
dedup by `id` the inventory is 1,425 unique places: 438 Diana · 134 ArcGIS · 534 Census ·
319 none.

Two glossary cross-references failed against this data:
1. **Map-Ready mislabel.** `places.json` marks all 962 census places `locationReviewStatus:
   "Map-Ready"`. CONTEXT.md defines **Map-Ready Place** as *verified or intentionally
   generalized* — "approximate or suspect coordinates should not appear as normal public
   markers." Census estimates are neither.
2. **Anchor trust.** 2 of the 6 **Primary Anchor Set** places (*The Center for the Arts*,
   *Art Works Gallery*) resolve to `us-census-geocoder` coordinates. *Art Works Gallery* even
   has a Diana-coordinate twin under a different `id` (`art-works-gallery-co-op-grass-valley`).

## Decision

1. **The dataset build is a deterministic dedup + retier pass over the existing
   provenance-tagged inventory — NOT a regeneration from the raw workbook.** Regenerating from
   `build_diana_data.py` would emit only the 444 raw Diana rows and discard the ArcGIS
   Confident Coordinate Match layer (which the glossary explicitly endorses) and all
   editorial enrichment. The provenance pipeline that produced `places.json` is the asset;
   the duplication is the bug.

2. **Dedup key is `id`.** One record per `id`. Merge rule: keep the row with the highest
   confidence tier (`authoritative` > `high` > `medium` > `needs-review`); among ties prefer
   the enrichment-bearing row (`anchor`, `musePick:true`, real `image`); union enrichment
   fields across the collapsed rows.

3. **Marker trust tiers, aligned to the glossary:**
   - **Map-Ready Place** (normal public marker) = `authoritative` (Diana) + `high` (ArcGIS
     confident) only. ~572 places.
   - **Coordinate Candidate** = `medium` (census). Retiered OUT of "Map-Ready"; shown with a
     quieter, visually distinct **Candidate Marker Treatment** during the Coordinate Review
     Pass, never auto-promoted, never the first-load/anchor spine.
   - **Needs Location Review** = `needs-review` (no coordinate). **Directory-Only**, no marker
     (already handled by `publicMarker:false` / "Map location coming soon").

4. **GVNC Prototype Scope is a visibility tag, not deletion.** Out-of-scope cities (Truckee
   et al.) stay in the dataset as selectable/enrichable records but are excluded from
   first-load map visibility and the sampler.

5. **The six Primary Anchors must resolve to a verified (Diana/ArcGIS) coordinate.** Reconcile
   the *Art Works Gallery* twin ids onto the Diana-coordinate record; source/verify a
   coordinate for *The Center for the Arts* (known address 314 W Main St) to lift it off the
   census estimate. Anchors are the stakeholder centerpiece and may not ship on suspect coords.

## Consequences

- The marker pile and the trust failure both resolve at the data layer; marker restyling
  (CLA-18) and density recalibration (CLA-19) become meaningful only after this pass.
- "Trusted public markers" drop from a claimed 1,603 Map-Ready to ~572 honest ones. The map
  will look sparser but truthful — consistent with the **Stakeholder-Ready Discovery Map**
  posture.
- The show-vs-demote treatment of the 534 Candidates is a live product decision tracked in
  CLA-16; this ADR fixes only that they are *not* Map-Ready and *not* the default spine.
- The transform is reproducible and table-testable, so the dataset cannot silently re-inflate.

## Alternatives considered

- **Regenerate from the workbook (the PRD title's literal reading).** Rejected: discards the
  ArcGIS confident layer and enrichment; throws away working provenance.
- **Keep all 1,959, just collapse coordinates visually.** Rejected: leaves duplicate records
  and the Map-Ready mislabel in place; treats a data-integrity bug as a rendering tweak.
- **Delete the 962 Census + 356 none entirely (hard shrink to ~572).** Rejected: the glossary
  wants Candidates kept and flagged, and Directory-Only places kept findable, not erased.
