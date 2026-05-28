# Repeat Entry Diagnosis - 2026-05-28

## Scope

Checked repeat display patterns in:

- `website/cultural-map-redesign/data.json`
- `website/cultural-map-redesign/events-merged.json`
- source event feeds used by `scripts/events/merge_events.py`

## Summary

- `data.json` has 25 repeated normalized asset names.
- `data.json` has 99 repeated Google Place ID groups, covering 294 rows.
- `events-merged.json` has 33 repeated venue names across 201 event rows.
- Golden Era is not duplicated as an asset. It has 1 asset row and 8 event rows.
- Golden Era's only repeated event title is `JIM BRATT x2`.

## Pattern

There are two separate causes.

1. Asset duplicates: the same place is present multiple times under different categories. Example: `Elixart Herbal Lounge & Gallery` appears as `Eat, Drink & Stay`, `Galleries & Museums`, and `Performance Spaces`.
2. Event venue repeats: the event list shows one row per event occurrence, so active venues repeat. Example: `Golden Era Lounge` appears 8 times because there are 8 Golden Era events.

Some repeats are likely intentional multi-category entries. Others are likely bad duplicates or branch/location ambiguity.

The bigger issue is not exact-name duplication. It is repeated `pid` values: many different asset names share the same Google Place ID. This makes the site feel like "everything has more than one entry" because the data model treats one place as many cards: venue, event series, mural, monument, organization, festival, trail, and historic marker.

## Repeated Google Place ID Groups

1. 15 | Nevada County Fair / Nevada County Fairgrounds Foundation Inc. / 4th of July Celebration Fireworks / Blue Marble Jubilee / Country Christmas Craft Fair / Cruzin' in the Pines Car Show / Earth's Treasures Gem & Mineral Show / Fathers Day Bluegrass Festival / Grass Valley Old West Antique Show / Sierra BrewFest / Strawberry Music Festival / Idaho Maryland Core Sample / Nevada County Fairgrounds | ChIJ2VyDstdvm4AR_lbs6r0XGfU
2. 9 | LeGacy Productions / Nevada City Film Festival / The Upstart Theater Company / Community Asian Theatre of the Sierra (CATS) / Wild & Scenic Environmental Film Festival / Nevada Theatre / Nevada Theatre Commission | ChIJuzmHQSR7m4AR4OFD5xqVttc
3. 9 | Nevada City Rotary Club / The Childrens' Festival / Memorial Grove Nevada City / Isabel Hefelfinger Wagon Shed / Pioneer Emigrant Trail (II) / Pioneer Park Bandshell / Fountain sculpture at Pioneer Park / Mural at Pioneer Park swimming pool / Pioneer Park | ChIJQ56N2XR6m4ARLLYEGk-i_9A
4. 7 | Miners Foundry Cultural Center / Artisans Festival / Nevada City Craft Fair / Miners Foundry / English and New Salmon Mine Stamp Mill / Nevada County Cultural Preservation Trust | ChIJu1ZmXHB6m4ARNXdM6WBO8T4
5. 7 | Mt. Elisha Stephens / Schallenberger Cabin Site / Donner Party - Graves Cabin Site / Donner Memorial State Park / Murphy Cabin / Donner or Pioneer Monument | ChIJo2Nmnendm4ARj481jtREXpI
6. 7 | Nevada Union Art Guild / Nevada Union Theatrical Society / Nevada Union High School / Nevada Union High School Library / Nevada City High School Site / Miner statue -- Nevada Union High School / Mining Artifact sculpture -- Nevada Union High School | ChIJ36qRZpJxm4ARfwz8wiJ9nrY
7. 6 | Calanan Park Monitor / Calanan Park Drill Core / Nevada City Downtown Historic DIstrict / Calanan Park / Calanan Park -- Metal sculpture / Calanan Park -- old mining core, hydro monitor | ChIJAa_vnXF6m4ARrVk7E5NGwBo
8. 6 | Mothers Day Springtime Event at Empire Mine / Empire Mine / Empire Mine Park Association / Empire Mine: Memorial Park Trail / Empire Mine: Osborne-Hill Trails / Empire Mine: Union Hill Trail Area | ChIJ77uYn65xm4ARmdUtw4vVkwk
9. 6 | Yuba Lit / Grass Valley Downtown Association / Caroline Mead Hanson House / Grass Valley Historical District / City of Grass Valley Historical Commission / "New Dawn" Mural | ChIJVbfixDtwm4ARFkgxSqf33hA
10. 5 | Center for the Arts / Nevada County Performing Arts Guild / Fall Colors Open Studio Tour  (host:Center for the Arts) / Center for the Arts Gallery | ChIJt2PNaTxwm4ARu524zpcVxWs
11. 5 | Narrow Gauge Railroad Museum / Nevada County Narrow Gauge Railroad (I) / Railroad and Transportation Museum / Nevada County Narrow Gauge RR (II) / Narrow Gauge Trail | ChIJUZ71gEdwm4ARVvA4FHJ_VmU
12. 5 | North Bloomfield Mining & Gravel  Co. / Saint Columncille's Catholic Church / Malakoff Diggins Clampicnic Area / Malakoff Diggins --North Bloomfield Historic District / Malakoff Diggins State Historic Park | ChIJsw9N8y1_m4ARhUzwgK87bLU
13. 5 | OLLI Orchestra / Sierra College Liberal Arts Departments / Sierra College / Sierra Poetry Festival / Roundabout by Sierra College | ChIJofQoD3Jwm4ARaqMkOgCnp1E
14. 5 | World War I Memorial, Grass Valley / World War II & Korean War Memorial / Memorial Park GV / Marines Memorial / Pioneers Memorial | ChIJe6nYSkhwm4ARBgAnOqabiR4
15. 4 | City Council / Constitution Day Parade / Nevada City Hall / 400 Broad Street | ChIJkwh6TnB6m4ARlbn-Ij1Anwk
16. 4 | Lake Wildwood Music Club / Lake Wildwood Theatre / Lake Wildwood Womens' Chorus / Anthony House Site | ChIJi8AR1f1mm4ARILtXpT5t7KU
17. 4 | National Exchange Hotel / Victorian Christmas / Ladies of the Evening | ChIJV3AToHF6m4ARs4uxSrm8sjM
18. 4 | North Star House / North Star Historic Conservancy | ChIJw293JCpwm4ARw33E2UPCd3s
19. 4 | Onstage Live (by Arts for the Schools) / Truckee Public Arts Commission / Summer Music Series / Community Arts Center | ChIJNZroScDfm4AR-iGfLEKFXkQ
20. 4 | Penn Valley Community Rodeo Association / Penn Valley Chamber of Commerce / Penn Valley Community Foundation / Paintings at Penn Valley Chamber of Commerce | ChIJwa6O3LFom4ARDQQ48RxKY5E
21. 4 | Veterans Memorial Flagstaffs, Grass Valley / Vietnam War Memorials, Grass Valley / The Auditorium Building / Grass Valley Veterans Memorial Hall | ChIJ7fLIYTdwm4ARha2QijIzw3g
22. 3 | Chief Truckee / Stampede Circle of Stones / Truckee River Regional Park | ChIJMTo9CZPfm4ARgMr1m6DcmuY
23. 3 | Cooper’s Ale Works / Baruh House / Weiss-Hieronimus Brewery Cellar | ChIJy02CIPl7m4ARJsq9Ln5IIxs
24. 3 | Emma Nevada House / Englebright House / Nathaniel P. Brown House | ChIJpXcp-G96m4AR3nLp9OMAuCs
25. 3 | First Transcontinental Railroad--Truckee / Theodore Dehone Judah / Truckee Flag Pole | ChIJmwuSWczfm4ARwXlO4-6c1ow
26. 3 | Friends of Nevada County Libraries / Madelyn Helling Library / Madelyn Helling Library - sculpture | ChIJ20oStmd6m4ARGergKh9o_MA
27. 3 | Haute Trash an Artists Collaborative / Art Works Gallery Co-op / Mural | ChIJPR2GCDxwm4ARH8qX5uTZz1U
28. 3 | Music in the Mountains / Music in the Mountains Sierra Brewfest / Music in the Mountains Summer Fest | ChIJyR1x7qJxm4ARdus-OaErxdY
29. 3 | North Columbia Schoolhouse Cultural Center / Columbia Hill School | ChIJoepxfil8m4ARpomosiYMY-k
30. 3 | Robinson Plaza / Robinson Plaza -- Mining sculptures: Pelton Water Wheel and Five Stamp Mill / Robinson Plaza -- Metal sculpture | ChIJv6iIDAB7m4ARYpDGyot--ow
31. 3 | The Prospector / The Union Newspaper | ChIJJclp-GBwm4ARwZqhG7oXZH0
32. 3 | Truckee Downtown Merchants Association / Craw Thaw Music Festival / Truckee Thursdays | ChIJOZQGksDfm4ARC8_A0WcFkIQ
33. 3 | Washington Hotel and Site / Brimskill Building / Kohler Building | ChIJmwP4WH6Em4AR2eG2kxQjMmQ
34. 3 | Wild Eye Pub / Empire House | ChIJPYHswy9wm4ARjOU4c0Gjq_I
35. 2 | "El Dragon"  bike rack / West End Beach | ChIJb5UHznvnm4ARKPHmNRkLaGs
36. 2 | Activities & Improvement Center / "Life Cycle of the Monarch" mural project | ChIJWdRtNZdim4ARm39LR2j_HTk
37. 2 | Alta Sierra Biblical Gardens | ChIJMQBwD3dym4ARjVEmdJ_bLP8
38. 2 | Ananda Crystal Hermitage Gardens / Ananda Village: Crystal Hermitage Gardens | ChIJAwb5Txp9m4ARFdZWxSE9jCg
39. 2 | Art & Soul / Riverside Studios | ChIJeTeJ9cDfm4ARVEKTllGyoDM
40. 2 | Art Obsessions / Old Capitol Building | ChIJ7SL_iJzfm4ARbSo9eWrB1PQ
41. 2 | Art Truckee | ChIJc3c2nhffm4ARmKsx_q3Xzjc
42. 2 | Artists Studio in the Foothills (ASIF) / Metal Flower sculpture at As-If Studios | ChIJ2664FFlwm4ARuFlYod91T1M
43. 2 | Banner Mountain Artisans / Nevada City Summer Nights | ChIJsWULeGF6m4ARZDlanp4GR1E
44. 2 | Bear Yuba Land Trust / Rambler Trail: Clover Valley Preserve | ChIJad1p5GZwm4ARm6k-laCZ0m8
45. 2 | Boca Dam - Newlands Reclamation Project / Boca Brewery | ChIJq0XKoB5fmYARIauiQDFaRew
46. 2 | California WorldFest / Celtic Festival | ChIJ8Thb6Shwm4ARo5RsWg_trJE
47. 2 | Charles Marsh House / Martin Luther Marsh House | ChIJVWavMit7m4ARfsb6oG5KNOI
48. 2 | China Wall at Donner Summit / Clinton Narrow Gauge Railroad | ChIJLxSdBu_nm4AR4weKdTxJ3tA
49. 2 | Community Collaborative of Tahoe Truckee / Tahoe Truckee Community Foundation | ChIJUeMAZMvfm4ARkRLCDGc5cGc
50. 2 | Emigrant Trail on Coldstream Road / Coldstream Trailhead | ChIJlbDXQnXdm4ARvDCL5T-45g8
51. 2 | Firehouse No.1 / Nevada City Firehouse No. 1 | ChIJG4mtkXF6m4ARmuG6et5Qcp0
52. 2 | Five-Stamp Mill 1893 / Ten Stamp Mill | ChIJnRvdRgB7m4AR2gc2v-nXOyo
53. 2 | Foothills Celebration / Foothills Event Center | ChIJGwqzDkNwm4AR4M9NgFZ-m6U
54. 2 | Foxhound Expresso / Three Forks Bakery & Brewing Co. | ChIJCwB9vXF6m4AReGtrqsF78d0
55. 2 | Grass Valley Brewing Company / Washington Brewery | ChIJ8-97yz5wm4AR-wgJjp62-pU
56. 2 | Grass Valley Farmers Market / Nevada County Certified Growers Market | ChIJhYRVX9Zxm4ARNV97aP34yxQ
57. 2 | Grass Valley Library Royce Branch / Grass Valley Public Library (Josiah Royce Library) | ChIJ4ba5xjtwm4ARhYdSoVpTmsg
58. 2 | Hardy Books / Harmony Books | ChIJ10JDr3F6m4AR3FS2wQvREvI
59. 2 | Holidays at the Empire Mine / Miners Picnic | ChIJ7e1HZrJxm4ARubGusL17ws0
60. 2 | Hydraulic Gate Valve / Alpha and Omega Hydraulic | ChIJoQrd3buEm4ARlxOyDSzrsz8
61. 2 | Joseph Research Cabin / Truckee Donner Historical Society | ChIJlU7A4S_em4ARpNmCGcU6f_Y
62. 2 | KVMR / KYRR 93.3 FM | ChIJf9j3QnB6m4ARazZYgbmz8-M
63. 2 | Lucchesi Vineyards Tasting Room | ChIJAwWx6Ttwm4ARy-bvhhGYYs0
64. 2 | Lucchesi Vineyards Winery / Lucchesi Vineyards & Winery | ChIJg_aU8Dtwm4AREdzdGP1FBgI
65. 2 | Mountain Arts Collective / "Mountain Flowers" sculpture | ChIJq-_qkcDfm4ARrrBqFE2c6vY
66. 2 | Nevada City Chamber of Commerce / Famous Marching Presidents Inc. | ChIJHedjhHF6m4ARRsA-KSKg1eY
67. 2 | Nevada City Classic Café / The Nevada City Classic Café | ChIJV6iUo3F6m4ARrRhmKzAXFw0
68. 2 | Nevada City Rancheria of the Nisenan Tribe / California Heritage Indigenous Research Project | ChIJYRaB9Mp7m4ARzM9rjgwh_pA
69. 2 | Nevada County Arts Council / First Friday Art Walk | ChIJ4xGrXIFwm4AR8iBwRp3SGzc
70. 2 | Nevada County Digital Media Center / Nevada County Television/Digital Media Ctr | ChIJHZbkioZwm4ARYm1KEYJCOQI
71. 2 | Nevada County Narrow Gauge (III) / Hydraulic Mining | ChIJGSFY7XZ6m4ARDebBD6aNf-k
72. 2 | North Star Power House & Pelton Wheel Museum / North Star Mine Powerhouse and Nevada County Traction Company | ChIJT3izay5wm4AR_Wdu59N4xMk
73. 2 | Off Broadstreet Theatre | ChIJn493t3F6m4ARmvhamCAoJwc
74. 2 | Old Bear River Bridge / Bear River Historic Bridge | ChIJ4_NbAMZ0m4ARS8IWNJIHOWo
75. 2 | Old Jail Museum / Truckee Jail | ChIJD3F0xsDfm4ARaxL0O4oCHUg
76. 2 | Old Pacific Fruit Packing Shed / Park and Walk Trail: Chicago Park | ChIJazr--ZJ0m4ARd-AE_0HIs6A
77. 2 | Pine Street Crossing at Nevada City / Litton Trail | ChIJA4Hs0WJ6m4ARyvkTsIwfy28
78. 2 | Quest Theaterworks / Sierra Stages Community Theater | ChIJQYk483Z6m4ARwIkquLIM2Jo
79. 2 | Sculpture - Western Gateway Park / Western Gateway Park | ChIJ1_z1ZaBom4ARkdFJ6wjQw4Y
80. 2 | Searls Historical Library / Searls Historical Library  (NC Historical Society) | ChIJneUS_YNwm4ARKWss_gtDXhg
81. 2 | Secession Days / Rough and Ready Toll House | ChIJrclZNZBlm4ARMMr3leeg9oA
82. 2 | Sierra College Tahoe Truckee / Truckee Tahoe Community Chorus  Sierra College Campus | ChIJ7VSlfLXfm4ARpgydqgf6jEQ
83. 2 | Sierra Knolls Winery / Sierra Starr Vineyard & Winery (Winery) | ChIJP9ruUsNvm4ARcwk_e5DSHGs
84. 2 | Sierra Starr Vineyard & Winery (Store) / Starr Winery Tasting Room | ChIJFeMeGDxwm4ARrU-maIH6RXM
85. 2 | Sierra Theaters | ChIJJ4iGeWBwm4ARgaDkreTlcnA
86. 2 | St. Joseph Cultural Center / Historic Mount St. Mary’s Preservation Committee | ChIJpTUV1zpwm4ARF-gWi6I2rZY
87. 2 | Tahoe Regional Arts Foundation / Truckee Arts Alliance | ChIJUWbCWOTfm4ARmUUjwOpQTYE
88. 2 | The Curious Forge | ChIJY9h-quFwm4ARhk92VljzzEo
89. 2 | The Holbrooke Hotel / Holbrooke Hotel | ChIJK9-2FDxwm4ARCrwNaepIUd4
90. 2 | Truckee Community Theater | ChIJyUrCScDfm4ARE0W46sJE9J4
91. 2 | Truckee High School Bands / Donner Emigrant Trail | ChIJ-UomjDDem4ARW_NhfX0K17w
92. 2 | Truckee Railroad Museum / Truckee Donner Railroad Society | ChIJv8jhkMDfm4AR4vP_kewzaPk
93. 2 | Truckee Rodeo / McIver Arena | ChIJt2MOOpLfm4ARIZFj96i4O8o
94. 2 | Truckee Roundhouse Makerspace / Truckee Round House Site | ChIJCc7nWixgmYAROgW5I3LD-6g
95. 2 | Truckee Tahoe Community Television / Truckee Tahoe Community Television (TTCTV) | ChIJ-UomjDDem4ARbrGYKfKuFxU
96. 2 | Walking Tour of Historic Grass Valley: self guided and guided / Walking Tour of Nevada City Trees | ChIJnwcLJiF7m4ARxdCLh_2NlCY
97. 2 | Wells Fargo Building Site Nevada City / Wells Fargo Building, North San Juan | ChIJaVAqcNljm4ARlvigFF2XCtQ
98. 2 | Wolf Post Office / The Old Post Office | ChIJJaCXKTlwm4ARRN6OEOqkjH8
99. 2 | Word after Word Books | ChIJXbW4wcDfm4AR_k1CK858vLc

## Repeated Asset Names

1. 3 | Elixart Herbal Lounge & Gallery | #25 Eat, Drink & Stay / #281 Galleries & Museums / #546 Performance Spaces
2. 3 | North Star House | #299 Galleries & Museums / #340 Historic Landmarks / #555 Performance Spaces
3. 2 | Alta Sierra Biblical Gardens | #95 Arts Organizations / #634 Walks & Trails
4. 2 | Art Truckee | #272 Galleries & Museums / #541 Performance Spaces
5. 2 | Avanguardia Winery | #4 Eat, Drink & Stay / #5 Eat, Drink & Stay
6. 2 | Center for the Arts | #99 Arts Organizations / #542 Performance Spaces
7. 2 | Donner Memorial State Park | #510 Historic Landmarks / #644 Walks & Trails
8. 2 | Lucchesi Vineyards Tasting Room | #42 Eat, Drink & Stay / #293 Galleries & Museums
9. 2 | Miners Foundry Cultural Center | #115 Arts Organizations / #551 Performance Spaces
10. 2 | National Exchange Hotel | #49 Eat, Drink & Stay / #431 Historic Landmarks
11. 2 | Nevada City Film Festival | #119 Arts Organizations / #248 Fairs & Festivals
12. 2 | Nevada County Fair | #122 Arts Organizations / #251 Fairs & Festivals
13. 2 | Nevada County Fairgrounds | #552 Performance Spaces / #661 Walks & Trails
14. 2 | Nevada County Gem & Mineral Society | #124 Arts Organizations / #579 Preservation & Culture
15. 2 | Nevada Theatre | #428 Historic Landmarks / #553 Performance Spaces
16. 2 | North Columbia Schoolhouse Cultural Center | #128 Arts Organizations / #554 Performance Spaces
17. 2 | Off Broadstreet Theatre | #129 Arts Organizations / #556 Performance Spaces
18. 2 | Sierra Theaters | #144 Arts Organizations / #563 Performance Spaces
19. 2 | South Pine Cafe | #68 Eat, Drink & Stay / #69 Eat, Drink & Stay
20. 2 | The Curious Forge | #148 Arts Organizations / #311 Galleries & Museums
21. 2 | The Pour House | #80 Eat, Drink & Stay / #81 Eat, Drink & Stay
22. 2 | The Union Newspaper | #210 Cultural Resources / #395 Historic Landmarks
23. 2 | Truckee Community Theater | #152 Arts Organizations / #565 Performance Spaces
24. 2 | Wild Eye Pub | #93 Eat, Drink & Stay / #317 Galleries & Museums
25. 2 | Word after Word Books | #215 Cultural Resources / #566 Performance Spaces

## Repeated Event Venues

1. 17 | Grass Valley Library | Art Club x2; Baby Storytime x2; Build, Make, Play x2; Intermediate/Advanced English Conversation Group x2; Literary Yarns x2; Stay and Play x2; Teen-led Dungeons & Dragons Meet Up x2
2. 15 | Truckee Library | English Conversation Group x4; Lego Club x2
3. 15 | Unknown venue | Spring Street Swing Out x2; STEAM Exploration Saturdays x2
4. 10 | Eric Rood Center | Mobilize | Art Inspiring Activism with Wild & Scenic Film Festival Exhibition x10
5. 9 | Madelyn Helling Library | Paws to Read x2; Qigong x2; Storytime x2; Sudoku for Seniors x2
6. 9 | The Curious Forge | none
7. 8 | Crazy Horse Saloon & Grill | Magoo **SOLD OUT** x2; Trivia Night x2
8. 8 | Golden Era Lounge | JIM BRATT x2
9. 7 | CTC Classroom | Tech Drop In x2; Ukulele for the People x2
10. 4 | Axis Gallery | "Dreamscapes in Bloom": a Collaborative Exhibition at Axis Gallery x2; "The Winters Where Catfish Sings": Exhibition by Sokthea Chan at Axis Gallery x2
11. 4 | First Baptist Church | Decendants: The Musical x4
12. 4 | Main Reading Room | Chess Club x2; Community Yoga x2
13. 4 | Miners Foundry | none
14. 4 | Nevada Theatre | none
15. 4 | Penn Valley Library | Baby Storytime x2; LEGO Club x2
16. 4 | Study Nook | English Language Class x4
17. 3 | Alibi Ale Works - Truckee | none
18. 3 | Gene Albaugh Community Room | Dungeons and Dragons Club x2
19. 3 | Nevada City Odd Fellows Seven Stars Gallery | "Emerging Perspectives": N.U. Student Art Exhibition at Seven Stars Gallery x3
20. 3 | Wild Eye Pub | none
21. 2 | Bear River Library | Paws to Read x2
22. 2 | Bear River Library Community Room | LEGO Club x2
23. 2 | Crazy Horse Saloon | none
24. 2 | Inner Path, 200 Commercial Street, Nevada City | Geometric Yoga for Self-healing x2
25. 2 | Kidzone Museum | STEAM Exploration Saturdays x2
26. 2 | Mcknight crossing shopping center | Cars and coffee grass valley x2
27. 2 | Meeting Room | none
28. 2 | Miners Foundry Cultural Center | African Drum and Dance of Nevada County x2
29. 2 | Oddfellows Hall | Motion Theater x2
30. 2 | Seven Stars Gallery 210 Spring Street | Nevada City Odd Fellows Open Mic x2
31. 2 | Siren Song Fleece Works at Lucchesi Vineyards | none
32. 2 | The Center for the Arts | none
33. 2 | Vela Massage Retreat 763B South Auburn Street Grass Valley CA 95945 | Phoenix Nights Ladies Only Sauna x2

## Likely Fix Shapes

- Assets: collapse same-place, same-address rows into one canonical asset with multi-category metadata.
- Events: keep event rows separate, but change UI to group by venue or collapse recurring titles when the user is scanning venues.
- Data pipeline: treat `Unknown venue` and address-as-venue cases as ingestion quality failures.
