# Arts Council Discovery Map Context

This context defines the domain language for the Nevada County Arts Council Discovery Map work so product, design, and implementation decisions use the same words.

## Language

**Stakeholder Review Audience**:
Eliza and Diane reviewing whether the Discovery Map direction feels credible, ownable, culturally specific, and worth continuing.
_Avoid_: Public launch audience, generic users

**Public Discovery Audience**:
Locals and visitors using the Discovery Map to find cultural places, events, and routes.
_Avoid_: Stakeholders, tourists as the only audience

**Ordinary Place**:
A visible map-ready cultural place record with basic descriptive and location data.
_Avoid_: Pin, generic listing

**Cultural Anchor**:
A hand-picked place from the already-vetted NCAC cultural asset universe with extra editorial meaning for the current demo/review slice. It does not need to be an active arts venue; the distinction is extra authored treatment, not whether the place is culturally valid.
_Avoid_: Featured pin, top place, ranked place, only arts venues

**Anchor Card**:
The selected-place card treatment for a Cultural Anchor. Its first job is to prove NCAC cultural authority for the Stakeholder Review Audience; its second job is public utility. Data-audit status should not be visible in the public card UI.
_Avoid_: Listing card, data audit card, generic place detail

**Image Proof**:
The visual evidence used in an Anchor Card. Prefer real official or existing V1 images. The Primary Anchor Set should use fully resolved real images for the next review slice; no placeholders in primary Anchor Cards. Labeled placeholders and generated concept images are allowed for supporting stops, gaps, or future-direction mockups, but they must be clearly identified and never presented as documentary place photography.
_Avoid_: Unlabeled generated place photos, pretending placeholders are real documentation

**MUSE Layer**:
The editorial influence and optional story evidence from NCAC's MUSE context. MUSE voice may inform all Anchor Card copy; explicit MUSE claims or badges should appear only where local MUSE data supports a match.
_Avoid_: Claiming every anchor appears in MUSE, using MUSE as generic decoration

**MUSE Evidence Corpus**:
The local, source-linked collection of MUSE issues, articles, pages, text, and images used to ground demo copy, card framing, and future visual references. Once a MUSE page image and OCR text are stored locally, agents may quote and remix that material for this Arts Council prototype; the main risk is confusing or irrelevant sourcing, not permission.
_Avoid_: Treating unsourced MUSE vibes as evidence, using a quote/image without issue-year and page traceability, or connecting an article clip to an unrelated place

**MUSE Page Pair**:
A single MUSE issue page stored as a same-basename image file and OCR text file, labeled by issue year and page number. Page Pairs let agents inspect visuals or text without repeatedly ingesting full PDFs.
_Avoid_: Re-processing whole PDFs for routine evidence lookup, separating page images from their OCR text, unlabeled page captures

**MUSE Issue Manifest**:
The metadata record for one locally ingested MUSE issue, including source URL, PDF URL when available, page count, extraction timestamp, and tool notes. A manifest confirms that all Page Pairs for an issue came from the same source artifact.
_Avoid_: Orphaned page files, undocumented source URLs, mixing pages from different issue versions

**MUSE Article Index**:
The article-level map built from MUSE Page Pairs, connecting article titles, authors, page ranges, mentioned places, themes, and source confidence. It may be drafted by scripts but should carry enough confidence signals for agents to know when evidence is usable without user review.
_Avoid_: Treating guessed article boundaries, fuzzy place matches, or low-quality OCR as confirmed evidence

**MUSE Evidence Confidence**:
The confidence level for using a MUSE source in demo copy or visual framing. High-confidence evidence has a confirmed issue, page number, readable OCR, and a relevant place or theme match; low-confidence evidence is mainly a relevance/accuracy risk.
_Avoid_: Asking for user review when page traceability and relevance are clear, or using weak/fuzzy evidence as if it were a direct match

**Concept Mockup**:
A labeled generated image or visual sketch used to show an unbuilt gap, possible future treatment, or optional direction without committing implementation work.
_Avoid_: Presenting generated concepts as existing prototype features, real place photography, or final design

**Review Gap**:
A visible missing piece or future direction that should be acknowledged during stakeholder review without building a second prototype. Review Gaps may be shown with clearly labeled Concept Mockups when the live prototype cannot yet demonstrate the idea.
_Avoid_: Hiding gaps, overbuilding before review, presenting concept imagery as implemented behavior

**Tonight's Work Phase**:
The current implementation phase for the next review package. Polish the Primary Anchor Set's Anchor Cards first; improve path treatment around the Primary Anchor Set and Supporting Stop Set only if time remains. Anchor Card polish includes both data/copy cleanup and selected-card UI/layout improvements, scoped to the Primary Anchor Set. The stretch goal is screenshot-grade completeness for all six primary Anchor Cards: real image, no placeholder copy, no missing obvious field, clean hierarchy, polished meaning copy, one clear action, and visual consistency.
_Avoid_: Full dataset cleanup, countywide expansion, building every future direction before reviewing the prototype

**Path Stop**:
A cultural place used as a stop inside an authored route.
_Avoid_: Itinerary item, AI trip step

**Path Treatment**:
The authored route context that shows how a Cultural Anchor fits into a cultural day, story, or local pattern. Path Treatment is lightly authored from existing NCAC context for the current prototype, with room for later partner or community authorship where the subject matter calls for it. The first live Path Treatment should prove a cultural thesis, anchor stops, and a reason those stops belong together; it does not need to prove public-launch completeness. It is the next container after Anchor Cards: it can later carry events, MUSE context, and nearby places, but it should first prove that a route is culturally intentional rather than algorithmic.
_Avoid_: Generic trip planning, replacing events/MUSE/nearby places, pretending prototype paths are fully community-authored, claiming the first path is complete for public use

**Makers / Working Artists Path**:
The first proof Path Treatment for the next review slice. It should connect Art Works Gallery, ASiF Studios, and The Curious Forge around the thesis that the Discovery Map can show culture being made, taught, shared, and practiced rather than only attended.
_Avoid_: Treating the path as a complete public itinerary, optimizing for directions before meaning

**Primary Anchor Set**:
The six Cultural Anchors that carry the next GVNC demo: The Center for the Arts, Nevada Theatre, North Star House, Empire Mine, Art Works Gallery, and The Curious Forge.
_Avoid_: Final countywide ranking, exhaustive best-of list

**Supporting Stop Set**:
The four researched places that remain important to paths/layers but do not need equal primary-anchor weight in the next demo: Nevada City Winery, ASiF Studios, Hirschman Trail / Hirschman's Pond, and North Columbia Schoolhouse Cultural Center.
_Avoid_: Rejected places, invalid assets

**Supporting Stop Treatment**:
The subordinate path-first treatment for Supporting Stop Set places. It may include authored copy, path membership, relationship chips, honest placeholder/candidate imagery, and source cleanup notes when useful, but its main job is to enrich Path Treatment or layer context. A selected-place card may explain why the stop appears when clicked, but it must not use the Primary Anchor visual mode, map-anchor marker treatment, startup featured-anchor slot, or copy that implies the stop is part of the Primary Anchor Set.
_Avoid_: Quietly promoting supporting stops to primary anchors, hiding incomplete source/image state, treating hierarchy as a value judgment

**Visible Incompleteness Label**:
A plain public-facing label or note used only when a prototype user can see an incomplete Supporting Stop state, such as a missing source image, placeholder/candidate imagery, or unresolved source-description cleanup. It should explain the visible limitation without exposing internal audit language.
_Avoid_: Confidence scores, P0/P1 priority labels, implementation notes, caveats on complete-enough supporting stops

**GVNC Prototype Scope**:
The current prototype review scope centered on Grass Valley, Nevada City, and immediately relevant Ridge/nearby cultural context rather than the full county. Truckee is outside this scope for the next review slice.
_Avoid_: Countywide launch scope, Truckee/High Sierra proof, Truckee anchors

## Relationships

- The **Stakeholder Review Audience** is the first audience for the next selected-place-card and path-treatment slice.
- The **Public Discovery Audience** remains important, but does not override stakeholder confidence in the next slice.
- A **Cultural Anchor** is an **Ordinary Place** with added editorial meaning. Ordinary Places are still vetted NCAC cultural assets; anchors are not "more real," just more authored for the slice.
- An **Anchor Card** leads with cultural meaning, image proof, and story/path/event relationships before utility links.
- **Image Proof** for the Primary Anchor Set must be real/resolved for the next review slice. Supporting or future-direction imagery may be placeholder/generated if labeled honestly.
- The **MUSE Layer** is voice everywhere and evidence only where supported.
- A **Concept Mockup** can accompany the live prototype and short brief to make gaps or possible future directions visible without building a second prototype.
- A **Review Gap** should be named honestly and can be illustrated with a labeled Concept Mockup when it helps stakeholders react to direction.
- **Tonight's Work Phase** prioritizes Primary Anchor Set Anchor Card polish before path treatment.
- A **Path Stop** may be a **Cultural Anchor** when the route is built from the curated demo spine.
- **Path Treatment** is the next structure after Anchor Cards and can later carry events, MUSE context, and nearby places.
- The **Makers / Working Artists Path** is the first proof Path Treatment for the next review slice.
- The next demo uses the **Primary Anchor Set** for top-weight Anchor Cards and the **Supporting Stop Set** for path/layer context.
- **Supporting Stop Treatment** should make supporting stops context-rich but visually subordinate to Primary Anchor Cards, with path/layer context carrying the main meaning.
- Use a **Visible Incompleteness Label** only where the supporting-stop UI exposes a visible gap.
- The **GVNC Prototype Scope** excludes Truckee/High Sierra anchors from the first anchor-card slice unless explicitly revived.
- Nearby cultural landscape anchors may be included when they strengthen the Grass Valley/Nevada City story, but Truckee anchors stay out of the next review slice.

## Example dialogue

> **Dev:** "Should this selected place card optimize for quick public directions or stakeholder confidence?"
> **Domain expert:** "Stakeholder confidence first. It should still be usable, but the next pass needs Eliza and Diane to feel that NCAC can own this direction."

> **Dev:** "Is Nevada Theatre just another place record?"
> **Domain expert:** "No — in this slice it is a Cultural Anchor. It should explain why the theater matters and how it participates in the authored paths."

## Flagged ambiguities

- "Audience" can mean either **Stakeholder Review Audience** or **Public Discovery Audience**. For the next feature slice, it means **Stakeholder Review Audience** unless explicitly stated otherwise.
- "Anchor" means **Cultural Anchor**, not a generic map marker or automatically ranked popular place.
- "Prototype scope" currently means **GVNC Prototype Scope**. Truckee Tahoe Airport and Clair Tappaan Lodge are out of the first anchor set for this reason.
