# Cultural Assets Data Inventory

**Source:** `docs/Cultural Assets - data engineering.numbers` (Diana Arbex, received 2026-03-14)
**Converted to:** `website/arts-hub/data/cultural-assets.json`

## Summary

- **Total assets:** 1,969
- **New additions (marked with "x"):** 494
- **14 active categories** (excludes "Out of Business" and "Sofia notes" sheets)

## Categories

| Category | Count | Description |
|----------|-------|-------------|
| MUSE BD (Business Directory) | 491 | Full Muse business directory — antiques, vintage shops, etc. |
| Artisan Places to Eat, Drink or Stay | 320 | Curated boutique food/drink/lodging ("no Jack in the Box") |
| Walks and Trails | 275 | Trails and walking routes across the county |
| Historic Landmarks | 256 | Historic buildings, sites, markers |
| Artisan Places to Shop | 112 | Curated artisan retail |
| Cultural Resources and Media | 90 | Chambers, bookstores, radio stations, media |
| Arts Organization | 87 | InConcert Sierra, House of Fates, LeGacy Presents, etc. |
| Gallery Studio Museum | 83 | Galleries, artist studios, museums |
| Fairs and Festivals | 68 | Annual events — Celtic Festival, 4th of July, etc. |
| Public Art | 63 | Murals, sculptures, roundabout art |
| Services | 51 | Body art, arts/business services |
| Preservation & Cultural Org | 33 | Land trusts, historical commissions, DAR |
| Performance Spaces / Entertainment | 30 | Center for the Arts, Del Oro, Nevada Theatre, etc. |
| Parking | 10 | Parking lots in GV/NC |

## Data Schema

Each record contains:
- `sheet` — source category tab
- `assetType` — classification within the category
- `name` — venue/asset name
- `address`, `city`, `state`, `zip` — location
- `phone`, `email`, `website` — contact
- `description` — text description
- `lat`, `lng` — coordinates (from `y` and `x` columns)
- `isNew` — boolean, flagged as new addition
- `globalId` — ArcGIS GlobalID

## Notes

- **MUSE BD** appears to overlap with other sheets (Artisan Places to Shop, etc.) — the BD column marks entries that are in the Muse Business Directory specifically
- **Coordinates** — some records (notably newer ones in Arts Organization) are missing lat/lng and will need geocoding
- **"Out of Business" sheet** (46 records) excluded from export — these are closed venues
- Data was maintained in Apple Numbers; the conversion preserves all text fields
