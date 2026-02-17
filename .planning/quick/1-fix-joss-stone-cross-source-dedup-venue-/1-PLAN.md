---
phase: quick-joss-stone-dedup
plan: 1
type: execute
wave: 1
depends_on: []
files_modified: [scripts/events/merge_events.py]
autonomous: true
requirements: []

must_haves:
  truths:
    - "Joss Stone concert appears once in events-merged-flat.json (not twice)"
    - "Trumba and KVMR versions are recognized as duplicates"
    - "Venue-aware matching catches title variations with venue names appended"
  artifacts:
    - path: "scripts/events/merge_events.py"
      provides: "Enhanced is_duplicate() function with venue-aware title fallback"
      min_lines: 5
  key_links:
    - from: "merge_events.py"
      to: "is_duplicate() function"
      via: "secondary matching path on line ~265"
      pattern: "venue_score >= 80.*title.*in"
---

<objective>
Fix duplicate event detection to catch venue-aware title variations in cross-source event merging.

Purpose: Joss Stone concert from Trumba ("Joss Stone") and KVMR ("Joss Stone at the Center for the Arts") are at the same venue but not being recognized as duplicates due to title score falling below the 85-point threshold (scores ~66-72).

Output: Updated merge_events.py with secondary venue-aware matching logic.
</objective>

<execution_context>
@C:/Users/ender/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@C:\Users\ender\.claude\projects\ArtsCouncil\scripts\events\merge_events.py
</context>

<tasks>

<task type="auto">
  <name>Add venue-aware title fallback to is_duplicate()</name>
  <files>scripts/events/merge_events.py</files>
  <action>
Modify the `is_duplicate()` function (lines 250-282) to add a secondary matching path:

After the main title_score check on line 264 (`if title_score < dedup_threshold: return False`), add this logic:

```python
# Secondary path: venue-aware matching for title variations
# (e.g., "Joss Stone" vs "Joss Stone at the Center for the Arts")
if title_score < dedup_threshold:
    # Check if venues match first
    venue_a = event_a.get("venue_name", "") or ""
    venue_b = event_b.get("venue_name", "") or ""

    if venue_a.strip() and venue_b.strip():
        norm_venue_a = normalize_venue(venue_a)
        norm_venue_b = normalize_venue(venue_b)

        if norm_venue_a and norm_venue_b:
            venue_score = token_sort_ratio(norm_venue_a, norm_venue_b)
            if venue_score >= venue_threshold:
                # Venues match — check if shorter title is contained in longer
                if min(title_a, title_b, key=len) in max(title_a, title_b, key=len):
                    return True
    return False
```

This allows the function to recognize that "joss stone" (Trumba) and "joss stone center arts" (KVMR) are duplicates when venues match >= 80 points AND the shorter title is fully contained in the longer one.

Rationale: Uses existing normalize_venue() and token_sort_ratio() helpers. Does NOT change default behavior (only triggers if title_score initially fails). Respects venue_threshold parameter already in function signature.
  </action>
  <verify>
Run: `node scripts/build-chat-knowledge-pack.js` (which calls merge_events.py internally) and check that events-merged-flat.json contains only ONE Joss Stone entry instead of two.

Confirm via: `grep -c "Joss Stone" events-merged-flat.json` returns 1 (not 2).
  </verify>
  <done>
is_duplicate() function includes venue-aware fallback path. Joss Stone concert deduplicated. merge_events.py runs without errors. Knowledge pack builds successfully.
  </done>
</task>

</tasks>

<verification>
After modification:
1. Venue score calculation correctly checks "center for the arts" vs "the center for the arts" (normalized) with token_sort_ratio
2. Title containment check ("joss stone" in "joss stone center arts") returns True
3. Duplicate detection triggers, preventing both records from appearing in final events-merged-flat.json
4. No regression: other cross-source events still deduplicate correctly
</verification>

<success_criteria>
- events-merged-flat.json contains exactly ONE Joss Stone entry (currently contains TWO)
- merge_events.py runs without errors
- Knowledge pack builds successfully
- Title alone still drives dedup when titles score >= 85 (original behavior preserved)
- Venue-aware path only activates as fallback when title_score < 85
</success_criteria>

<output>
After completion, update .planning/STATE.md to mark this todo complete.
Commit to git with message: "fix(merge-events): add venue-aware title fallback for cross-source event dedup"
</output>
