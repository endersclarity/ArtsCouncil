# Description sweep — data flags (not fixed by the sweep)

Surfaced while rewriting boilerplate descriptions. The sweep only touches
`description` + `descriptionSource`; everything here needs a separate data pass.

## From the pilot (2026-07-02)

- **south-pine-cafe-grass-valley** — southpinecafe.com DNS-dead, record already `websiteStatus: dead`. Shipped copy states only record facts + MUSE join, but verify the cafe still operates.
- **full-circle-press-grass-valley** — record says Grass Valley; full-circle-press.com says Nevada City. Shipped copy names no city; resolve the city field.
- **athena-grass-valley** — zero web presence on record; candidate for a local-knowledge pass.

## From the trails sweep (2026-07-03)

- Name typos carried in records (descriptions avoid restating them): `preiffer-trail` (likely Pfeiffer), `illinios-crossing-trail`, `lower-union-hill-connecctor-trail`, `rood-zcenter-connerctor-path`, `fave-lakes-basin-trail` (BYLT match: Five Lakes Basin), `lonely-meadow-trail` (BYLT: Loney Meadows), `dascomb-trail` (BYLT: Dascombe), `lindsay-lake-trail` (BYLT: Lindsey), `boca-too-ohv-trail`, `memorial-park-trail` / `sandridge-lake-trail` (lowercase names).
- **sawtooth-trailhead-truckee** — record website points to the WRONG Sawtooth (NPS page for Mineral King, Sequoia NP). Copy written Tier C; fix the URL.
- **bear-river-historic-bridge-grass-valley** — the namesake 1908 bridge was demolished in 1963 (per the record's Wikipedia link); worth confirming what a visitor actually finds at 20010 Colfax Hwy.
- **fs.usda.gov/r05/tahoe/recreation** used as a generic website on several trail records — not trail-specific, treated as ungroundable.

## From the Eat/Drink/Stay sweep (2026-07-03)

Full per-record detail in `.planning/sweep-batches/eds-flags-{1,2,3}.md`. Headlines:

- **broad-street-inn-nevada-city / alta-sierra-village-inn-grass-valley** — address collision: both records carry 11858 Tammy Way; Broad Street Inn's own site says 517 W Broad St, Nevada City.
- **clair-tappaan-lodge-truckee** — site says Norden, CA (record: Truckee); record address has a typo ("19940Donner").
- **tahoe-star-hotel-truckee** — record website is the Stardust Lodge, South Lake Tahoe: likely wrong business.
- **farmstead-cheeses-and-wines-grass-valley** — farmstead.biz is a different (Alameda/Oakland) business.
- **martis-valley-lodge-truckee** — site redirects to hilton.com; appears to be a Hilton property now.
- **grass-valley-provisions-grass-valley** — cannabis dispensary categorized under Eat, Drink & Stay.
- **arquils-winery-nevada-city** — site says the winemaker is relocating to the UK; verify still operating.
- **the-olive-groove-grass-valley** — record 126 Mill St vs site 128 Mill Street.
- Malformed website fields: `everwild-wines` ("https://@everwildwines"), `long-s-bottle-shop`, `the-outpost`, `la-bamba`, `uncorked-truckee`, `sticks-market-truckee` ("https://FB: /sticksmarket").

## From the remaining-categories sweep (2026-07-03)

Full per-record detail in `.planning/sweep-batches/rest-flags-{1,2,3}.md`. Headlines:

- Category mismatches: `the-cauldron-loot-and-lore` (Performing Arts → apothecary shop), `ron-s-real-records` (record store as Performing Arts), `grass-valley-museum` (museum as Galleries & Studios), `toad-hall-books` (bookstore, aggregator URL).
- Possible wrong-business websites: `soulcrafts-nevada-city` (ofearthandsalt.com), `yabobo-nevada-city` (asylumdown.com), `knco-star-94-1-fm` (name/site mismatch).
- `bespoke-and-atelier-truckee` — redirects to ateliertruckee.myshopify.com; businesses may have merged.
- `bobbiemoon-video` — empty record (no city/address/website).
- `juniper-boutique-truckee` — website field contains a street address, not a URL.
