# Diana Workbook Map Prototype

Question: what does V1 feel like if visible markers only use coordinates from the Diana Workbook?

Status: throwaway prototype. Do not treat as production UI or production data.

Run:

```sh
cd /Users/ender/code/Arts\ Council/cultural-asset-map
python3 website/cultural-map-redesign-stitch-lab/v1-discovery-map/prototypes/diana-workbook-map/build_diana_data.py
python3 -m http.server 4173
```

Open:

`http://localhost:4173/website/cultural-map-redesign-stitch-lab/v1-discovery-map/prototypes/diana-workbook-map/index.html`

Variants:

- `?variant=proof`
- `?variant=civic`
- `?variant=route`

Basemaps:

- `&basemap=streets`
- `&basemap=outdoor`
- `&basemap=satellite`
- `&basemap=voyager`

Verdict:

- Pending user review.
