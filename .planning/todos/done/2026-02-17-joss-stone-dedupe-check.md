---
created: 2026-02-17T00:00:00.000Z
title: Duplicate event listings (Joss Stone via KVMR + other sources)
area: events
files:
  - scripts/events/merge_events.py
---

## Problem

Joss Stone event showing up as duplicate listings — appears via KVMR source and at least one other source (likely Trumba/Arts Council). The dedup pipeline should be catching cross-source duplicates but isn't for this event.

## Investigation needed

- Check merge_events.py dedup logic — is it matching on title + date + venue or just event_id?
- KVMR events have `kvmr-` prefixed IDs, Trumba has `trumba-` prefixed IDs — if dedup relies on event_id, cross-source dupes will always slip through
- May need fuzzy title matching within same date + venue as a secondary dedup pass
- Check if this is a one-off or a broader pattern across the 295 events

## Research

Research: .planning/todo-research/events-ux-brief.md (Section 2)
