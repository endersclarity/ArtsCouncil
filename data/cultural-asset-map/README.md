# Nevada County Arts Cultural Asset Map - Full Data Extract

Scraped from https://www.nevadacountyarts.org/cultural-asset-map on 2026-02-06.

Source: ArcGIS Web Map `604050d4965c4b93b984781f72941d5b` hosted by Nevada County Arts Council.

## Stats

| Layer | Features |
|-------|----------|
| Historic Landmarks | 219 |
| Artisan Places to Eat, Drink and Stay | 94 |
| Arts Organizations | 67 |
| Cultural Resources and Media | 58 |
| Fairs and Festivals | 52 |
| Galleries, Studios, Museums | 52 |
| Walks and Trails | 52 |
| Public Art Inventory | 42 |
| Performance Spaces | 26 |
| Preservation and Cultural Organizations | 24 |
| County Boundary (polygon) | 1 |
| **Total** | **687** |

## Files

| File | Format | Description |
|------|--------|-------------|
| `all_cultural_assets.csv` | CSV | Combined flat file, all 686 point features with layer tag |
| `all_cultural_assets.geojson` | GeoJSON | Combined GeoJSON, all 686 features with `_layer` property |
| `webmap_metadata.json` | JSON | ArcGIS item metadata (title, tags, description, dates) |
| `webmap_definition.json` | JSON | Full map definition (layer configs, basemap, presentation slides) |
| `county_boundary.geojson` | GeoJSON | Nevada County polygon boundary |
| `*.geojson` (10 files) | GeoJSON | Individual layer exports |

## ArcGIS REST Endpoints

All layers are publicly accessible Feature Services. Query pattern:

```
https://services9.arcgis.com/dunJqHWsrgVVzHCy/arcgis/rest/services/{LAYER_NAME}/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson
```

## North Star House Appearances

North Star House / North Star Historic Conservancy appears in **4 layers**:

1. **Performance Spaces** - "10,000 square foot mansion, built in the California Craftsman style in 1905"
2. **Galleries, Studios, Museums** - "rehabilitate and transform the Historic North Star House into a premier cultural event center"
3. **Preservation and Cultural Organizations** - "re-establish the unique, historic North Star House and grounds into a premier cultural event center"
4. **Historic Landmarks** - "1905 structure built for Arthur D. Foote... designed by Julia Morgan"

Related entries: North Star Mine Powerhouse, Hard Rock Gold Mining landmark, Grass Valley Historical District, Idaho-Maryland Mine Site.

## Coordinate System

All coordinates in WGS84 (longitude/latitude) in the GeoJSON files. The original ArcGIS data uses Web Mercator (EPSG:3857).
