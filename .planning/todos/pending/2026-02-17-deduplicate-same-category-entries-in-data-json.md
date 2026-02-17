---
created: 2026-02-17T23:03:04.225Z
title: Deduplicate same-category entries in data.json
area: data
files:
  - website/cultural-map-redesign-stitch-lab/data.json
  - website/cultural-map-redesign/data.json
---

## Problem

User spotted Avanguardia Winery appearing twice in the "Eat, Drink & Stay" section of `directory.html`. Investigation found 3 assets duplicated within the same category:

- **Avanguardia Winery** — 2x in "Eat, Drink & Stay"
- **South Pine Cafe** — 2x in "Eat, Drink & Stay"
- **The Pour House** — 2x in "Eat, Drink & Stay"

These are data.json quality issues from the original ArcGIS scrape. The 687-asset dataset has 25 duplicate names total, but 22 are intentional cross-category entries (e.g., North Star House in Galleries + Historic + Performance). Only the 3 above are same-name-same-category bugs.

The directory.html page renders all entries from data.json without client-side dedup, so these duplicates show up in the listing.

## Solution

Two options:

**Option A (data fix):** Remove the duplicate entries from data.json directly. Simple but need to identify which of the two entries to keep (check if one has more complete data — phone, website, hours, description).

**Option B (client-side dedup):** Add a dedup step in the directory rendering JS that filters out entries with the same name + same category. Safer since it doesn't modify the source data.

Recommended: Option A — fix the data. These are clearly data entry errors, not intentional. Run a script to find and remove duplicates where name + category match, keeping the entry with the most populated fields.
