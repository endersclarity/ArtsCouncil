## Architecture finding: this is the unimplemented half of "Canonical Place"

While extracting the place-data module (CLA-37), surfaced a precise framing for this issue:

ADR-0001 dedupes `places.json` **by `id` only**. But the CONTEXT.md glossary defines a **Canonical Place** as collapsing duplicate listings via *exact id **or** normalized name+city when co-located*. The implemented pass only does the first half — which is exactly why name-variant / co-located dupes (Arquils Wine vs. Arquils Winery, the KVMR trio, The Cauldron ×2) survived.

So CLA-36 isn't just cleanup — it's **completing the Canonical Place definition** that ADR-0001's id-only dedup left half-done. Worth flagging the ADR ↔ glossary divergence explicitly when this is worked (per docs/agents/domain.md rule 4).

A detector now exists for the name+city half: `V1PlaceData.findPlaceDataProblems()` emits `canonical-name-collision` entries (run the live app with `?debug=data`). Note there's also a separate `scripts/dedupe_places.py` in the tree from parallel work — reconcile the two before merging.
