# Source text review — SHOUTING strings in place data

Logged during the 2026-06-11 polish pass (impeccable pass 4). Event descriptions
prefixed with "GET YOUR TICKETS " are normalized at render time in `app.js`
(`displayEventDescription`) — the source JSON is untouched.

Place descriptions are NOT auto-normalized, because all-caps there can be the
venue's own brand voice. These two need a human judgment call:

| Place | Issue | Suggested fix |
|---|---|---|
| Drink Coffee Do Stuff (`data/places.json`) | Description opens with the brand name in caps: "DRINK COFFEE DO STUFF is a specialty coffee company…" | Probably fine — caps are the brand's own styling. Leave, or retype as "Drink Coffee Do Stuff" if it reads as shouting in the detail panel. |
| Zumo Wine (`data/places.json`) | The ENTIRE description is uppercase: "ZUMO WINE IS A SMALL WINERY BASED IN NORTHERN CALIFORNIA. IT WAS STARTED IN 2018. ALL OF OUR WINES ARE MADE WITH ORG…" | Hand-retype in sentence case (auto sentence-casing would mangle proper nouns like Northern California). |

## Resolution — 2026-06-11 (warmth pass 5)

- **Zumo Wine:** hand-retyped in sentence case in `data/places.json`
  ("Zumo Wine is a small winery based in Northern California. …").
- **Drink Coffee Do Stuff:** left as-is — the caps opener is the brand's own
  styling, per the lean above.
