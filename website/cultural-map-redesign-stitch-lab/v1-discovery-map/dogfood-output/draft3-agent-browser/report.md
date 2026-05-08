# Dogfood Report: V1 Discovery Map Draft 3

Date: 2026-05-06
Target: http://127.0.0.1:7463/
Tool: agent-browser 0.25.4
Session: ncac-draft3-dogfood

## Summary

- Agent-browser connected to the local V1 app successfully.
- Initial desktop and mobile map loads rendered a MapLibre canvas and interactive controls.
- Places, Paths, and Events controls were visible through accessibility snapshots.
- No console/error output was observed during the tested flows.

## Evidence

- `screenshots/initial-annotated.png`
- `screenshots/after-paths-click.png`
- `screenshots/path-selected-snapshot.png`
- `screenshots/place-card-current.png`
- `screenshots/mobile-initial.png`

## Checks Performed

- Opened local app and waited for network idle.
- Captured annotated initial desktop screenshot.
- Captured accessibility snapshot with refs.
- Opened Paths mode.
- Selected `Living Like a Local`.
- Confirmed four path marker buttons and four stop-list buttons exist in the accessibility tree.
- Clicked a visible path marker and confirmed selected card changed to `Booktown Books`.
- Opened Events mode and confirmed an event detail card exists with `Event link` and `Show place`.
- Opened mobile viewport at 390x844 and confirmed `scrollWidth === innerWidth`, `canvas === 1`, and `1076 visible places`.

## Issues

### ISSUE-001: Path stop list sits below the desktop panel fold

Severity: low
Category: UX

On a 1280x720-ish desktop viewport, selecting `Living Like a Local` shows the path heading and intro, but the actual stop-list buttons are below the visible portion of the left panel. The accessibility tree contains the stops, and the map markers are visible, but the panel does not immediately show the clickable stop list.

Evidence:

- `screenshots/path-selected-snapshot.png`

Repro:

1. Open `http://127.0.0.1:7463/`.
2. Click `Paths`.
3. Click `Living Like a Local`.
4. Observe the panel: the stop sequence copy is visible, but the stop-list buttons are below the fold.

Expected:

The first one or two path stops should be visible immediately after selecting a path, or the panel should make the scroll affordance more obvious.

Actual:

The selected path state looks complete at first glance, but the interactive stop list is hidden below the panel fold.

### ISSUE-002: Path marker buttons have generic accessible names

Severity: low
Category: Accessibility / UX

After selecting a path, the numbered map stop markers appear in the accessibility tree as repeated `Map marker` buttons. Sighted users see numbered markers, but assistive tech and automation cannot distinguish which stop each marker represents.

Evidence:

- `screenshots/path-selected-snapshot.png`

Repro:

1. Open `http://127.0.0.1:7463/`.
2. Click `Paths`.
3. Click `Living Like a Local`.
4. Inspect the accessibility tree.

Expected:

Each marker should have a meaningful label, for example `Stop 1: Booktown Books`.

Actual:

Each marker is exposed as `Map marker`.

## Non-Issues / Passes

- Agent-browser connected and controlled the browser successfully.
- Mobile 390px viewport had no horizontal overflow.
- MapLibre rendered one canvas on desktop and mobile.
- The mobile panel kept core modes and filters visible.
- Events mode produced an event detail card.
- The selected path marker click changed the detail card to `Booktown Books`.

## Recommendation

Agent-browser is usable for this project. Use it for future dogfood passes, especially mobile viewport checks, accessibility-tree checks, and repro-evidence capture. Before stakeholder review, fix the two low-severity path affordance/accessibility issues.
