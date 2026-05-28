# Selected Card Decision Flow Prototype

Question: which selected-place flow should move forward after Perplexity validation?

Variants:

- `?variant=drawer`: Directory Browser and map stay stable; Unified Place Card opens as drawer with compact Context Rail.
- `?variant=baseline`: conventional persistent detail panel baseline.
- `?variant=preview`: two-step preview before full Unified Place Card.

Current read:

- Drawer + Context Rail remains the best expression of the desired public map feeling.
- Baseline should be the control pattern for production comparison.
- Preview is promising if the Unified Place Card feels too heavy as the immediate first click.

Run:

`python3 -m http.server 4174` from `website/cultural-map-redesign-stitch-lab`, then open:

`http://127.0.0.1:4174/v1-discovery-map/prototypes/selected-card-decision-flow/?variant=drawer`
