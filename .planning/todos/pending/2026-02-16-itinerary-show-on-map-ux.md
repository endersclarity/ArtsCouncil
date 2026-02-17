---
created: 2026-02-16T00:00:00.000Z
title: Itinerary "Show on Map" UX is broken
area: itineraries
files: []
---

## Problem

Clicking "Show on Map" zooms the map behind the modal — user has to close the modal to see where it pointed, and even then it's not obvious what happened.

## Solution

The flow should be: click "Show on Map" -> modal collapses/minimizes to reveal the map zoom -> map zooms to stop -> detail panel slides in with full asset info for the selected stop. Need to coordinate modal collapse, map flyTo, and detail panel activation in sequence.

## Research

Research: .planning/todo-research/demo-prep-brief.md (Section 3)
