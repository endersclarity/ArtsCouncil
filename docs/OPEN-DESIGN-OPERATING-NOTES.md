# OpenDesign Operating Notes

Status: internal working note
Date: 2026-05-06
Project: NCAC V1 Discovery Map

## What OpenDesign Is

OpenDesign is a local design shell. It runs a web UI plus a local daemon, then delegates generation to an installed code-agent CLI such as Claude Code, Codex, or Gemini.

It does not replace the project repo. It creates design artifacts in its own local project folders, then useful outputs can be reviewed, copied, or adapted back into this repo.

Local invocation:

```sh
open-design --port 7456 --no-open
```

Local UI:

```text
http://127.0.0.1:7456
```

Project storage:

```text
/Users/ender/code/open-design/.od/projects/<projectId>/
```

## Core Concepts

### Mode

Mode defines the kind of artifact being made.

- `Prototype`: one editable screen or small flow. Best fit for NCAC map UI directions.
- `Deck`: multi-slide HTML presentation.
- `Template`: fast path from an existing curated template.
- `Design System`: generates a `DESIGN.md` that other modes can consume.

For NCAC V1, default to `Prototype`.

### Skill

A skill defines the artifact shape and workflow. It is a `SKILL.md` plus optional assets/references.

Most relevant skills:

- `web-prototype`: high-fidelity desktop web prototype; best default for first-screen map directions.
- `wireframe-sketch`: intentionally loose low-fi wireframe; useful only if we want structure before visual design.
- `critique`: produces a 5-dimension design review report.
- `tweaks`: surfaces adjustable design parameters after a direction exists.
- `design-brief`: generates a reusable design-system-style brief, but it is probably too generic for NCAC unless heavily constrained.

### Design System

A design system is a `DESIGN.md` in a 9-section format: visual theme, color, typography, components, layout, depth, rules, responsive behavior, and agent prompt guide.

OpenDesign ships many generic and product-inspired design systems. For NCAC, do not pick a generic system as source of truth. The source of truth should be a project-specific NCAC design packet built from:

- Diana's NCAC brand guide.
- The live NCAC/Squarespace site.
- The V1 Discovery Map brief.
- The Claude Design handoff, as reference only.

### Fidelity

Fidelity is the level of visual finish requested for the artifact.

- `Wireframe`: structure first. Looks intentionally unfinished. Good for layout decisions, IA, and interaction placement.
- `High fidelity`: finished-looking visual direction. Uses real hierarchy, color, typography, spacing, and component styling.

In OpenDesign, fidelity is metadata injected into the prompt. It guides the agent, but the selected skill matters more. `wireframe-sketch` will stay low-fi even if the UI says high fidelity; `web-prototype` is the right high-fidelity path.

For NCAC V1, use `High fidelity` when testing visual directions. Use `Wireframe` only if we are stuck on layout.

## Agent Choice

Verified available in this environment:

- Claude Code
- Codex CLI
- Gemini CLI

Recommended first choice inside OpenDesign: Claude Code.

Reason: OpenDesign's adapter docs treat Claude Code as the reference implementation, with stronger native skill loading and targeted edit behavior. Codex is available and usable, but OpenDesign's docs describe Codex as more likely to regenerate whole files during refinement.

Use Codex from this repo as reviewer/operator: start OD, prepare inputs, inspect screenshots, critique outputs, and bring useful artifacts back into project docs or preview code.

## Recommended NCAC Workflow

1. Prepare a compact OpenDesign input packet in this repo.
2. Start OpenDesign locally.
3. Create a `Prototype` project.
4. Select `web-prototype`.
5. Select `High fidelity`.
6. Use Claude Code as the local CLI agent.
7. Feed the packet and ask for three first-screen visual directions.
8. Review outputs against the V1 Discovery Map success rubric.
9. Use `critique` or this Codex session to score the directions.
10. Keep promising artifacts as references; do not promote OD output directly into canonical implementation without review.

## Success Rubric For First OD Pass

The output should make us say: this feels like the Arts Council's cultural map, not a generic map product.

Checks:

- Map dominates the first screen.
- NCAC red, white, charcoal, Polymath/live-site feel is obvious.
- No Arts Hub, platform, AI trip planner, tourism-board, or public-launch framing.
- Places feel primary.
- Events feel secondary and light.
- Paths feel curated, fixed, and editorial, not dynamic trip planning.
- Real imagery is treated as place proof, not decoration.
- Detail cards are compact and desire-first.
- The experience feels approval-stage polished, not overloaded.

## What To Avoid

- Asking OpenDesign to build the full app in one run.
- Starting from a generic design system such as Apple, Airbnb, Linear, or Editorial without first translating NCAC constraints.
- Letting the Broadsheet Claude Design direction revive feed-first/event-first framing.
- Treating AI-generated images as real place proof.
- Pulling OD artifacts into canonical frontend code without a separate implementation review.

## Open Questions

- Should the first OD pass be three static first-screen directions or one clickable map shell?
- Should we import the Claude Design ZIP into OD as reference, or start fresh with a packet and link the handoff separately?
- Do we want to create a project-specific NCAC `DESIGN.md` before OD generation, or is the packet enough for the first run?
