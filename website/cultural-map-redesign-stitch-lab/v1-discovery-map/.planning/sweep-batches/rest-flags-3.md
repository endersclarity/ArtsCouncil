# rest-slice-3 data flags (2026-07-03)

- liberty-bell-smart-home-truckee — category "Performing Arts" looks wrong: name/website (lbsmarthome.com, 403 on fetch) indicate a smart-home technology business, not a performing arts venue. Possible wrong-business record or miscategorization.
- nevada-county-arts-council-and-truckee-cultural-district-truckee — category "Shops & Makers" is wrong (should be Arts Organizations); website field contains two URLs in one string ("https://nevadacountyarts.org, truckeeculturaldistrict.org").
- cornerstone-bakery-and-kitchen-truckee — a bakery listed under Shops & Makers on a cultural map; website field is a malformed Instagram handle ("https://@truckeecornerstonebakery").
- mix-decor-design-nevada-city — website field malformed ("https://@mix_nevadacity"), an Instagram handle, marked dead.
- marilyn-s-catwalk-truckee / unique-boutique-truckee — same malformed "https://@handle" website pattern, marked dead.
- art-truckee-truckee — website states address 9950 Donner Pass Rd; record has 9940 Donner Pass Rd (also flagged "Needs Location Review").
- heart-and-home-grass-valley — website is a gograssvalley.com aggregator/tourism page, not the business's own site; treated as no groundable website.
- sierra-rose-alpacas-grass-valley, crush-nevada-city, native-wren-grass-valley, liberty-bell-smart-home-truckee — sites returned HTTP 403 to fetches (likely bot-blocking, not dead); dropped to Tier C.
- kiya-s-naturals-nevada-city, the-earth-store-nevada-city, lola-and-jack-grass-valley, good-anya-plant-shop-truckee — sites live but returned no readable content (JS-rendered); dropped to Tier C.
- kyrr-93-3-fm-nevada-city — only website is a dead Angelfire page; station's current existence unverified.
- nevada-union-high-school-library-grass-valley — website dead; status "Needs Location Review" stands.
- grateful-ink-nevada-city — "tattoo studio" inferred from the Instagram location-page title in the website field; no groundable site.
- truckee-tahoe-airport-truckee — category "Galleries & Studios" is a stretch for an airport, though the Art at the Airport program supports its inclusion.
