---
created: 2026-02-16T00:00:00.000Z
title: VRBO "Plan Your Stay" integration
area: research
files: []
---

## Problem

Most DMO/tourism sites have a lodging widget near the footer — date picker that passes search to VRBO/Airbnb. Our site has no lodging integration. MindTrip and other DMO platforms offer this out of the box.

## Research Findings (2026-02-17)

### VRBO Affiliate Program
- **Join via**: Expedia Group affiliate portal, CJ, FlexOffers, or Travelpayouts (free to join)
- **Commission**: ~1.5–6% of booking value (realistically up to 4%), paid after stay completes
- **Cookie**: 7–30 days depending on network
- **Tools**: Search widget (embeddable JS date picker), deep links (destination-specific), banners
- **Best fit for us**: Nevada County skews vacation rentals and cabins → VRBO over Booking.com

### Airbnb — No affiliate program
- Discontinued their public affiliate program. DMOs link out with plain unmonetized links or work with local property managers directly.

### Booking.com (alternative)
- Commission: ~25–40% of Booking.com's cut (~3% effective)
- Cookie: Session-based (stricter)
- Better for hotel inventory; could run alongside VRBO for broader coverage

### What small DMOs actually do
1. Simple "Lodging" page with tracked outbound links by category (Hotels, Vacation Rentals, B&Bs)
2. VRBO search widget pre-filled for the county on a "Plan Your Stay" section
3. Hybrid: direct links to local lodging partners + VRBO/Booking block for "More vacation rentals"
4. Campaign-specific landing pages with date-filtered booking links for events/festivals

## Recommended Implementation
- **Footer section**: "Plan Your Stay" with VRBO search widget pre-filled to "Nevada County, CA"
- **Itinerary integration**: Deep links in itinerary pages ("Book lodging near this route")
- **Hybrid approach**: Respect Arts Council member relationships — list local inns/B&Bs directly, use VRBO for broader vacation rental inventory
- **Low effort start**: Even just a tracked outbound link with UTM params is valuable before full widget

## MindTrip Gap Analysis Reference

See `.planning/todos/pending/2026-02-17-mindtrip-gap-analysis.md` for full competitive feature comparison.
