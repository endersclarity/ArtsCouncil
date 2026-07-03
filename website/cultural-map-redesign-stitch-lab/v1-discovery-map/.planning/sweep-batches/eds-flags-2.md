# EDS slice 2 — data flags (2026-07-03)

- broad-street-inn-nevada-city: record address "11858 Tammy Way" conflicts with the inn's own site, which lists 517 West Broad Street, Nevada City — record address looks wrong (copied from Alta Sierra Village Inn?).
- alta-sierra-village-inn-grass-valley: same address "11858 Tammy Way" as the Broad Street Inn record — duplicate/collision. Website is a room77.com aggregator listing, not a business site (treated as no website).
- avanguardia-wines-tasting-room-grass-valley: site returns HTTP 403 to fetchers (likely bot-blocked, not dead). Dropped to Tier C.
- the-place-on-south-pine-nevada-city: site returns HTTP 401 (password-protected/staging?). Dropped to Tier C.
- sopa-thai-cuisine-nevada-city: res-menu.com URL returns HTTP 403. Dropped to Tier C.
- carrington-s-fine-wines-nevada-city: domain serves a Squarespace certificate mismatch (site misconfigured/possibly lapsed). Dropped to Tier B via MUSE.
- winnie-superette-nevada-city: site loads but homepage has no readable content ("Home (updated)" title only); about pages 404. Dropped to Tier B via MUSE.
- siam-cuisine-truckee: site loads but renders only the word "Store" — effectively contentless. Dropped to Tier C.
- donner-creek-brewing-truckee: site fetches return empty content (JS-only render?). Dropped to Tier C.
- everwild-wines: no city, no address, website field is a malformed handle "https://@everwildwines" (marked dead). Needs location + real URL before it can be mapped.
- iron-door-speakeasy-grass-valley: website is an Instagram URL (not groundable per rules). Tier C.
- clarky-s-bbq-smoke-and-more-penn-valley: website is a Facebook URL (not groundable per rules). Tier C.
- grass-valley-provisions-grass-valley: business is a cannabis dispensary — may not belong in the Eat/Drink/Stay category.
