---
phase: quick-joss-stone-dedup
plan: 1
status: complete
started: 2026-02-17T22:57:00Z
completed: 2026-02-17T23:00:00Z
---

## Summary

Added venue-aware title fallback to `is_duplicate()` in `scripts/events/merge_events.py`.

### What Changed

- **File:** `scripts/events/merge_events.py` (lines 264-276)
- **Change:** When title fuzzy score falls below the dedup threshold (85), a secondary check now fires:
  1. Both events must have non-empty venue names
  2. Venues must match at or above `venue_threshold` (default 70)
  3. The shorter normalized title must be fully contained in the longer one
  4. If all three conditions pass, events are treated as duplicates

### Results

- Joss Stone: "Joss Stone" (Trumba) and "Joss Stone at the Center for the Arts" (KVMR) now correctly deduplicated
- Band Beyond Description: "Band Beyond Description - Bobby Weir Tribute...The Sequel" (Crazy Horse) and "Band Beyond Description: Bob Weir Tribute, the Sequel" (KVMR) also caught
- Total dedup: 21 (was 20), total events: 294 (was 295)
- No regressions — all previous dedup pairs still caught

### Verification

```
grep "Joss Stone" output → 1 entry (was 2)
merge_events.py runs clean, zero errors
```
