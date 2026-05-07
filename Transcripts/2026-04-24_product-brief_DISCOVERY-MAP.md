---
date: 2026-04-24
session_type: product-brief
project: cultural-asset-map
related: nca-arts-hub
source: synthesis after 3 ChatGPT meeting summaries
---

# 2026-04-24 — Discovery Map Product Brief (synthesis)

The clearest project signal is **not** "Arts Hub," **not** "AI itinerary," **not** "tourism platform."

It is:

> **A discovery-first cultural map that feels alive because it combines places, events, filters, and a little human curation.**

That is the organizing phrase for the next draft.

---

## First Draft Product Direction

Build a **Discovery Map prototype** for Nevada County Arts Council / GVNC Cultural District.

Purpose: help visitors and locals quickly answer:

> "What's happening, where is it, and what else is nearby?"

Single-page interface combining:

1. **A usable map** — not GIS, not a database viewer. Clear, modern street-level map with clustered, intentional markers.
2. **A discovery feed or panel** — visible list/card layer for events and places so users aren't forced to hunt through pins.
3. **Simple filters** — Events, Live Music, Arts, Food/Drink, Places, possibly Lodging later.
4. **Event + place integration** — events and cultural/business assets in same experience, distinct marker/card types.
5. **Light curation** — small "Featured" layer: 3–5 human-built groupings (e.g., "Evening in Nevada City," "Live Music Tonight," "Gallery Walk").
6. **Iteration-first scope** — draft exists to provoke useful feedback, not to finalize the product.

---

## What to Avoid Saying

- ❌ "This is the new Arts Hub." → reopens ownership/platform conflict.
- ❌ "This is an AI-powered itinerary builder." → not asked for, adds trust/maintenance burden.
- ❌ "This will integrate everything." → invites scope creep immediately.

## What to Say Instead

> "Based on the meeting, I'm hearing that the strongest shared need is not a big planning platform, but a simple cultural discovery interface: map, events, places, filters, and a few curated highlights. I'd suggest the first draft be a lightweight Discovery Map prototype, intentionally narrow, so you can react to the experience before we define any larger system."

The phrase **"react to the experience before we define any larger system"** protects from premature architecture conversations.

---

## Practical V1 Shape

### Desktop layout
- Left panel: search, filters, featured groupings, event/place cards.
- Right panel: map.

### Mobile layout
- Top filters, map/feed toggle, bottom drawer cards.

### Data model
```
{
  id,
  name,
  kind: "event" | "place",
  categories: ["live-music", "arts"],
  location: { lat, lng },
  dateTime,
  image,
  description,
  url,
  featuredGroupIds
}
```

### Core interactions
- Filter changes update both feed and map.
- Clicking a card highlights marker.
- Clicking a marker opens card.
- Clicking a featured grouping filters/highlights a curated subset.

That is enough.

---

## Strategic Interpretation

The real tension:

> **They want something richer than a map, but they are not ready to define, govern, or maintain a full platform.**

So the first draft should feel like an **upgrade in experience**, not an **expansion in institutional responsibility**.

Strongest starting point:

> **"A simple discovery layer on top of the cultural asset map."**

Keeps continuity with the contract, avoids dead Arts Hub language, leaves room for future editorial/event layers without promising them now.
