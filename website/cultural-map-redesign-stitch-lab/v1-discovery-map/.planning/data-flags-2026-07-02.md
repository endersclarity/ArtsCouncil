# Data Quality Audit: 2026-07-02

**DO NOT AUTO-FIX — flags for the owner**

Read-only audit of `data/places.json` (1,351 places) and `data/events.json` (48 events). No data files were modified. Liveness checks are random samples of 60 (seeded, 4 concurrent, 10s timeout, HEAD with GET fallback, browser User-Agent for images).

---

## Executive Summary (Ranked by Visitor Impact)

| # | Finding | Number | Severity |
|---|---------|--------|----------|
| 1 | Dead "real" image URLs (sampled) | 42/60 dead (70%) → **~618 / 883** estimated dead | **High** — hero/card photos silently rotting |
| 2 | Dead/blocked website links (sampled) | 20/60 flagged (33%) → ~277 / 831 estimated; but most flags are 403/429 bot-blocks — **confirmed-hard-dead is much smaller** | Medium |
| 3 | Boilerplate descriptions ("included for alpha review") | **441** / 1,351 (32.6%); empty/missing: **0** | Medium |
| 4 | Location caveats | 476 non-empty (only **13** on map-ready places) | Low |
| 5 | Coordinate hygiene | map-ready missing lat/lng: **0**; outside bbox: **0** | Clean ✓ |
| 6 | Duplicates / events integrity | 0 duplicate names; events 48/48 have lat/lng + valid placeId | Clean ✓ |

---

## 1. Image Liveness — HIGHEST VISITOR IMPACT

**Population**: 883 places with `image.kind == "real"` and a remote `image.src`
(753 on lh3.googleusercontent.com, 52 on upload.wikimedia.org, remainder scattered: squarespace, wixstatic, fbcdn, wsimg, webflow, chamber sites).

**Random sample of 60**: 18 alive, **42 dead — 70.0% dead ratio**.
**Extrapolated**: **~618 of 883 real remote images are dead.**

- 41 of the 42 dead are `lh3.googleusercontent.com` returning **403** (Google Place-Photos URLs that have expired/rotated). This is genuine URL rot, not blanket bot-blocking: other lh3 URLs in the same sample returned 200 with the same request headers.
- 1 timeout: donnersummithistoricalsociety.org.
- Mitigation already in data: 1,345 places carry `image.placeholderSrc`, and 209 places already have an `image.deadSrc` field from a prior remediation pass — so this rot is a known, recurring failure mode. The remaining ~600 stale Google photo URLs need re-fetching from the Places API or replacing with owned assets.

Full dead sample list in Appendix A.

## 2. Website Liveness

**Population**: 831 places with a non-empty `website`. (Data already marks 66 places `websiteStatus: "dead"` from a prior pass.)

**Random sample of 60**: 40 alive, **20 flagged (33.3%)** → naive extrapolation ~277 / 831.

**Important caveat**: this check ran server-side without a browser. Of the 20 flags, 15 are **403/405/429** — typical bot-blocking by sites that are alive in a real browser (kvmr.org, marriott.com, recreation.gov, alltrails.com are certainly live). Confirmed-hard-dead in the sample:

| Place ID | Domain | Code |
|---|---|---|
| truckee-river-regional-park-truckee | www.tdrpd.org | 404 |
| sans-backup-plan-records-nevada-city | `@sans.backup.plan` (malformed URL — an Instagram handle stored as a website) | URLError |
| punk-and-bunny-tattoo-grass-valley | www.punkandbunnytattoo.com | URLError (DNS/conn) |

**Realistic estimate**: hard-dead rate ~5% (3/60) → roughly **~40 truly dead websites**, on top of the 66 already flagged in-data. The 403/429 set needs a browser-based recheck before any pruning. Full flagged list in Appendix B.

## 3. Boilerplate Descriptions

Matched substring: **"included for alpha review"** (case-insensitive). Empty or missing `description`: **0** (counted separately as instructed).

**Total boilerplate: 441 / 1,351 (32.6%)**

| Category | Boilerplate | Category total | % |
|---|---|---|---|
| Walks & Trails | 243 | 270 | 90.0% |
| Eat, Drink & Stay | 84 | 298 | 28.2% |
| Shops & Makers | 65 | 130 | 50.0% |
| Galleries & Studios | 19 | 83 | 22.9% |
| Cultural Resources | 12 | 89 | 13.5% |
| Performing Arts | 12 | 54 | 22.2% |
| Public Art | 3 | 62 | 4.8% |
| Historic Places | 2 | 248 | 0.8% |
| Arts Organizations | 1 | 50 | 2.0% |

Walks & Trails is 90% boilerplate — worst by far; Shops & Makers is half boilerplate.

## 4. markerTier & Coordinate Hygiene — CLEAN

(Corrected: schema keys are `lat` / `lng`.)

| markerTier | Count |
|---|---|
| candidate | 714 |
| map-ready | 483 |
| directory-only | 154 |

- **Map-ready places missing lat/lng: 0.** ✓
- Missing lat/lng overall: 154 — all of them `directory-only` (by design, they don't render on the map).
- **Coordinates outside bbox (38.9..39.7, -121.4..-120.0): 0.** ✓
- Non-empty `locationCaveat`: **476** (e.g., "Map location coming soon", "estimated", audit-downgrade notes). Only **13** of these are on map-ready places — the rest are candidates, so visitor exposure is limited.

## 5. Duplicate Suspects — CLEAN

- Exact-name duplicate groups (case-insensitive): **0**
- Same-name-different-city pairs: **0**

(Prior dedupe passes — see `places.json.bak-before-dedupe-*` — appear to have held.)

## 6. events.json Integrity — CLEAN

| Metric | Count |
|---|---|
| Total events | 48 |
| Missing `lat` or `lng` | 0 |
| Missing `placeId` | 0 |
| `placeId` not found in places.json | 0 |

## Bookkeeping fields already tracking rot (context for the owner)

- `image.deadSrc` present on **209** places (prior image-rot remediation)
- `websiteStatus: "dead"` on **66** places
- `image.status`: credible 1,202 / weak 62 / missing 87

---

# Appendix A — Dead image sample (42 of 60; id + host + code)

All 403s are lh3.googleusercontent.com Place-Photos URLs unless noted.

```
avanguardia-wines-tasting-room-grass-valley        lh3.googleusercontent.com  403
back-in-the-day-grass-valley                       lh3.googleusercontent.com  403
boca-break-ohv-trail                               lh3.googleusercontent.com  403
boca-wye-ohv-trail                                 lh3.googleusercontent.com  403
ca-historical-marker-floriston-bronco-floriston    lh3.googleusercontent.com  403
condon-park-service-roads                          lh3.googleusercontent.com  403
deer-creek-motorcycle-trail                        lh3.googleusercontent.com  403
dog-valley-west-ohv-trail                          lh3.googleusercontent.com  403
donner-summit-historical-society-soda-springs      donnersummithistoricalsociety.org  TimeoutError
donner-summit-tunnel                               lh3.googleusercontent.com  403
east-beach-way-trail                               lh3.googleusercontent.com  403
empire-street-trail                                lh3.googleusercontent.com  403
five-stamp-mill-1893                               lh3.googleusercontent.com  403
flour-garden-bakery-grass-valley                   lh3.googleusercontent.com  403
friar-tucks-restaurant-and-bar-nevada-city         lh3.googleusercontent.com  403
fudenjuce-nevada-city                              lh3.googleusercontent.com  403
grateful-ink-nevada-city                           lh3.googleusercontent.com  403
inner-path-nevada-city                             lh3.googleusercontent.com  403
j-j-jackson-s-nevada-city                          lh3.googleusercontent.com  403
kiya-s-naturals-nevada-city                        lh3.googleusercontent.com  403
memorial-park-trail                                lh3.googleusercontent.com  403
nevada-city-ame-church-site-nevada-city            lh3.googleusercontent.com  403
nevada-irrigation-district                         lh3.googleusercontent.com  403
old-pacific-fruit-packing-shed                     lh3.googleusercontent.com  403
peonies-grass-valley                               lh3.googleusercontent.com  403
pierce-ohv-connector-trail                         lh3.googleusercontent.com  403
pioneer-trail-south                                lh3.googleusercontent.com  403
remedy-garden-nevada-city                          lh3.googleusercontent.com  403
sierra-discovery-trail                             lh3.googleusercontent.com  403
south-yuba-trail                                   lh3.googleusercontent.com  403
summit-swirl-truckee                               lh3.googleusercontent.com  403
sushi-in-the-raw-at-california-organics-nevada-city lh3.googleusercontent.com 403
sweet-spirit-tattoo-nevada-city                    lh3.googleusercontent.com  403
the-band-truckee                                   lh3.googleusercontent.com  403
the-oaks-clubhouse-penn-valley                     lh3.googleusercontent.com  403
the-phoenix-rose-nevada-city                       lh3.googleusercontent.com  403
the-pizza-joint-nevada-city                        lh3.googleusercontent.com  403
tribal-weaver-grass-valley                         lh3.googleusercontent.com  403
truckee-tahoe-theatre-company-truckee              lh3.googleusercontent.com  403
winnie-superette-nevada-city                       lh3.googleusercontent.com  403
wyld-tiger-grass-valley                            lh3.googleusercontent.com  403
yinne-boma-animation-studios-company-nevada-city   lh3.googleusercontent.com  403
```

# Appendix B — Flagged website sample (20 of 60; id + domain + code)

Confirmed-hard-dead marked with **[DEAD]**; 403/405/429 need a browser recheck (likely bot-blocking).

```
truckee-river-regional-park-truckee                www.tdrpd.org               404  [DEAD]
sans-backup-plan-records-nevada-city               @sans.backup.plan           URLError  [DEAD — malformed URL, Instagram handle in website field]
punk-and-bunny-tattoo-grass-valley                 www.punkandbunnytattoo.com  URLError  [DEAD — DNS/conn]
park-and-walk-trail-chicago-park-chicago-park      www.bylt.org                403
cascade-canal-trail-banner-mountain-nevada-city    www.bylt.org                403
holbrooke-hotel-grass-valley                       holbrooke.com               403
kvmr-nevada-city                                   www.kvmr.org                403
elevation-escape-truckee                           elevationescapetahoe.com    403
bicycle-thief-grass-valley                         order.toasttab.com          403
crush-nevada-city                                  crushnevadacity.com         403
nevada-county-library-penn-valley-branch-penn-valley  www.nevadacountyca.gov   403
big-boca-ohv-trail                                 www.alltrails.com           403
springhill-suites-by-marriott-truckee-truckee      marriott.com                403
the-book-seller-grass-valley                       www.thebookseller.biz       403
granite-chief-ski-and-mountain-shop-truckee        granitechief.com            405
boca-reservoir-truckee                             www.recreation.gov          405
the-farmacy-truckee                                tahoefoodhub.org            429
gold-city-guitar-repair-nevada-city                goldcityguitar.com          429
the-ham-stand-nevada-city                          www.thehamstand.com         429
riverside-studios-truckee                          riversideartstudios.com     429
```

---

## Audit Metadata

- **Date**: 2026-07-02
- **Inputs**: `data/places.json` (1,351), `data/events.json` (48) — untouched
- **Method**: Python stdlib only; random samples of 60 (image sample seeded 20260702), ThreadPoolExecutor max 4 workers, 10s timeout, HEAD → GET fallback on 405/501; image checks sent a browser User-Agent
- **Known limitation**: server-side HTTP checks over-flag bot-blocked sites (403/405/429); image 403s on lh3 are distinguishable as real rot because sibling URLs on the same host returned 200
