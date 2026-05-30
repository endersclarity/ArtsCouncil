# Arts Council Discovery Map Context

This context defines the domain language for the Nevada County Arts Council Discovery Map work so product, design, and implementation decisions use the same words.

## Language

**Stakeholder Review Audience**:
Eliza and Diane reviewing whether the Discovery Map direction feels credible, ownable, culturally specific, and worth continuing.
_Avoid_: Public launch audience, generic users

**Public Discovery Audience**:
Locals and visitors using the Discovery Map to find cultural places, events, and routes.
_Avoid_: Stakeholders, tourists as the only audience

**Stakeholder-Ready Discovery Map**:
The prototype posture for Eliza and Diane review: still a limited review build behind the scenes, but presented in the visible UI as a coherent NCAC product direction. The interface should not expose internal process labels such as alpha, internal, prototype, demo, review, or audit language. Caveats belong in the accompanying conversation or external review note, not in the product surface.
_Avoid_: Internal alpha, visible prototype caveats, process labels, QA-facing framing

**Public Beta Surface**:
The visible Discovery Map experience should speak and behave like a real public beta even when the link is privately shared for stakeholder review. The review purpose belongs in docs, notes, or conversation. **Scope correction (owner ruling, 2026-05-30): the public will never see this surface — the link only ever goes to Eliza and Diane.** So the doctrine is now about *voice*, not a distribution claim: card, hint, empty-state, and all body copy stay citizen-voiced (judged as a citizen would), but the **nav badge carries one honest lifecycle label, "Internal preview build,"** rather than the prior "Public beta" (which claimed a public that does not exist). This single nav label is the sanctioned exception; the process-label ban still holds everywhere below the nav chrome. (Supersedes the 2026-05-29 "Public beta badge is intended" ruling.)
_Avoid_: Stakeholder proof copy, homework-rubric language, apologetic prototype framing, process labels anywhere except the single "Internal preview build" nav badge (no alpha/review/demo/audit, and no process language in card/hint/body copy)

**Invitation Copy**:
The rule for all placeholder, empty-state, and hint copy: invite the citizen to act, never narrate the machinery. A placeholder says what the citizen can do or discover ("Pick a place to see its story, photos, and what's happening there"), never what the UI will render ("The detail card will show image proof, source category…") and never the rationale for a design decision ("…centered first, with the wider county still visible as context"). The test: does the sentence make a visitor want to tap something, or is the site explaining itself? If it explains, cut it or flip it to an invitation. Use citizen words (story, photos, what's happening) not internal terms (image proof, source category, directory record). (Owner ruling, 2026-05-29.)
_Avoid_: Narrating UI behavior, justifying framing decisions, slide-caption feature pitches ("demonstrates how X can be curated"), internal terms in citizen copy

**Diana Workbook**:
The Arts Council source workbook supplied by Diana Arbex for V1 data engineering, represented in canonical source work as `diana-workbook.xlsx` and `diana-workbook.numbers`. It is the canonical name for this artifact in conversation and documentation.
_Avoid_: Source of truth, magical source, spreadsheet, workbook, Diana dataset

**ArcGIS Cultural Asset Export**:
The older Arts Council ArcGIS cultural asset map export used as the most explainable coordinate fallback when matched confidently to Diana Workbook rows. It is a coordinate reference, not the full V1 identity source.
_Avoid_: Old data dump, 686 file, source of truth, full V1 dataset

**Arts Hub Coordinate Bridge**:
The derived coordinate reference from the Arts Hub V2 asset data, preserved only as quarantined reference in V1 canonical source work. It is a bridge, not a source authority for place identity or public marker coordinates.
_Avoid_: Diana coordinates, source of truth, canonical location data

**Canonical Place**:
The single record that represents one real-world place, after all of its duplicate listings are collapsed. The Diana Workbook cross-lists the same place across category sheets, and slug variants of one name (e.g. "The Center for the Arts" vs "Center for the Arts", "McGee's" vs "McGees") can produce several listings for one place. Place identity is therefore resolved on (1) exact id and (2) normalized name + city when the listings are co-located — not on id alone. Anchor/path-referenced ids are preserved as the surviving id so references never orphan.
_Avoid_: Listing, row, id (as a synonym for place), duplicate pin, one-row-one-place

**Ordinary Place**:
A visible map-ready cultural place record with basic descriptive and location data.
_Avoid_: Pin, generic listing

**Map-Ready Place**:
A place whose visible marker can be trusted at address or destination level, either because the coordinate has been verified or because it is intentionally generalized and clearly treated that way. Approximate or suspect coordinates should not appear as normal public markers.
_Avoid_: Best-guess marker, unverified coordinate, map-ready by default

**Review Marker**:
A marker that can be drawn in an internal review map because it has a coordinate and provenance, even if the coordinate has not been accepted as fully map-ready. Review Markers keep the map usable for evaluation without erasing the difference between Diana, ArcGIS, and Coordinate Candidate sources.
_Avoid_: Map-ready marker, trusted public marker, final marker

**Constellation Disclosure**:
The preferred density treatment for broad or medium map views: restrained place dots remain visible as a spatial pattern, with denser constellations allowed to appear as larger soft aggregate marks instead of default numbered cluster bubbles.
_Avoid_: Number-only cluster, category-mix cluster, area taxonomy bubble

**Marker Hierarchy**:
The meaning carried by marker visual differences. Marker Hierarchy should communicate density, interaction state, authored importance, and route sequence; it should not turn visitor categories or Outing Types into tiny marker icons. Authored importance may use a restrained Soft Ring treatment when a place has anchor, MUSE, or path significance.
_Avoid_: Category icon soup, initials-as-category, filter legend as marker system

**Place Label Disclosure**:
The zoom-sensitive map treatment that reveals enough place identity to understand nearby dots without requiring a separate reveal mode or changing the Directory Browser.
_Avoid_: Blank-click reveal, marker-click directory rewrite, all-label clutter, category icon soup

**Local Reveal**:
The on-demand interaction for a dense group of constellation dots, showing nearby places only after explicit user intent. A blank map click is not enough intent; it should not change the Directory Browser or enter a reveal mode. Clicking a place marker should select that place, not silently replace the Directory Browser with nearby places.
_Avoid_: Always-visible cluster bubble, fake neighborhood bucket, auto-expanded pin soup, blank-click directory change, marker-click directory rewrite

**Local Reveal Directory Update**:
The Local Reveal behavior where an explicit nearby/search-this-area action updates the Directory Browser to nearby places instead of opening a cramped map popover list.
_Avoid_: Popover-first dense list, hidden map-only reveal, contextless cluster expansion, surprise directory replacement

**Confident Coordinate Match**:
A coordinate fallback match where the Diana Workbook row and ArcGIS Cultural Asset Export row have the same normalized name, same normalized city, no contradicting address signal, valid Nevada County coordinates, no excluded category, and no duplicate candidate for that normalized name. Name-only matches are not confident enough for public markers.
_Avoid_: Name-only match, single-candidate guess, fuzzy coordinate match

**Needs Location Review**:
A place that may belong in the Discovery Map but does not yet have a coordinate trustworthy enough for a normal public marker. It should be withheld from the public map or shown only in an explicit data-quality/audit treatment.
_Avoid_: Hidden failure, approximate marker, public placeholder pin

**Directory-Only Place**:
A real directory place that can be listed and opened without a normal map marker because it lacks a map-ready coordinate. Its UI treatment should make the missing marker state legible so users do not read it as a broken map interaction.
_Avoid_: Broken marker, hidden place, rejected place, failed listing

**Map Location Coming Soon**:
The public-facing status for a Directory-Only Place that lacks a normal marker. Selecting the place should open its record without moving the map.
_Avoid_: Needs Location Review, no coordinates, error state, map failure

**Map Location Not Confirmed - Estimated**:
The selected-card location status for a Coordinate Candidate shown during review. It indicates the marker is address-estimated rather than confirmed by Diana Workbook or ArcGIS confident fallback.
_Avoid_: Census candidate, low-confidence marker, untrusted pin, backend status

**Coordinate Candidate**:
A free-geocoded or otherwise inferred coordinate that may be usable for a map pass but is not Diana Workbook or ArcGIS Cultural Asset Export authority. It should carry hidden provenance/review labeling until accepted by a stronger confidence rule or user review.
_Avoid_: Trusted coordinate, Diana coordinate, ArcGIS fallback, public marker authority

**Candidate Marker Treatment**:
A review-mode marker treatment that visually distinguishes Coordinate Candidate locations from Diana Workbook coordinates and ArcGIS confident fallbacks. It is a private review aid, not a public trust badge.
_Avoid_: Normal marker, public warning marker, trusted pin, confidence score

**Coordinate Provenance Card Note**:
A review-mode note inside the selected place card that names where the displayed coordinate came from, such as Diana Workbook, ArcGIS fallback, or Coordinate Candidate. It lets the map markers stay close to the intended final visual form while still making trust visible during review.
_Avoid_: Public trust badge, marker-only provenance, implementation debug dump

**Coordinate Review Pass**:
An internal map review pass where coordinate provenance is made visible enough to judge trust quickly without resolving every location rule upfront.
_Avoid_: Final coordinate policy, public beta promise, permanent approval workflow

**Address-Bearing Place**:
A place record with enough street-address information to attempt a location lookup beyond city- or name-level inference.
_Avoid_: Name-only place, city-only place, loosely geocodable place

**Directory Record**:
The practical inventory treatment for an Ordinary Place, exposing source-backed public details such as description, place type, city, address, phone, website, and image state where available. A Directory Record is not lesser cultural content; it is the baseline treatment every mapped place deserves before any authored MUSE or anchor layer is added. "Directory record" is an internal term and must never appear as a citizen-facing label: the card eyebrow names **what the place is** (its category, e.g. "Gallery & Studio"), never "Directory record." (Owner ruling, 2026-05-29.)
_Avoid_: "Directory record" as a visible eyebrow/label, thin leftover listing, placeholder-only card, uncurated dump

**Place-Kind Eyebrow**:
The short label at the top of a Selected Directory Card, marker popup, and list badge. It **always** states the place's category (e.g. "Performing Arts") so a citizen learns what kind of place it is — the anchor/supporting-stop/MUSE-pick/directory-record buckets were removed from every eyebrow, popup, and badge (owner ruling, 2026-05-30, implemented CLA-39). The **only** place a path role (Primary anchor / Supporting stop) still shows is the numbered stop list *inside an active Path*, where it describes the stop's role in that route. The anchor card's "what you'll find here" prose (`whyItMatters`) and `supportingDescription` must be citizen-voiced — about the place and the visit, never about MUSE, the map, routes, vetting, or evidence. Verified by `tests/test_v1_citizen_voice_contract.js`.
_Avoid_: anchor/stop/MUSE-pick/directory-record as an eyebrow or badge, justification prose in card data, internal taxonomy as a visible label
_Open_: `anchorLabel` badges (e.g. "Grass Valley performance anchor") still render via `anchorBadge()` and contain the word "anchor" — flagged for a future citizen-voice pass.

**Email Data**:
Contact email information from the source inventory. It is intentionally excluded from first-pass Directory Record Restoration because coverage is sparse and the public/private contact boundary needs a separate decision.
_Avoid_: Public-by-default email, personal contact leak, low-coverage contact field

**Hours Data**:
Opening-hours information from prior Google Places enrichment, not from Diana's source inventory. It should stay out of Directory Record Restoration until its freshness and place-matching coverage are audited.
_Avoid_: Diana-source hours, casual Open Now data, unaudited hours display

**Marker Preview**:
The lightweight hover treatment for every visible Ordinary Place marker, showing enough source-backed identity to help someone decide whether to click. A Marker Preview should never be reserved only for anchors or featured places.
_Avoid_: Decorative marker, silent dot, anchor-only hover

**Selected Directory Card**:
The clicked-place card for an Ordinary Place, showing all public source-backed inventory fields currently available for that place before any optional anchor, path, or MUSE treatment is layered on top. Every marker on the map should be able to open a Selected Directory Card.
_Avoid_: Empty click state, teaser-only card, anchor-or-nothing card

**Unified Place Card**:
The shared selected-card shell for directory places, whether or not a place has MUSE evidence, anchor treatment, or location caveats. Optional sections may enrich the card, but the base layout should not split places into visibly lesser classes.
_Avoid_: MUSE-only card model, two-tier directory, broken-looking ordinary cards

**Selection Drawer**:
The desktop presentation for a Unified Place Card, opening as a readable layer while the Directory Browser and map remain stable.
_Avoid_: Replacing the whole browser, modal dead end, separate detail page

**Context Rail**:
A rejected/older prototype term for adding explicit browse-memory furniture beside a selected place. On desktop, the Directory Browser itself should remain visible and carry that memory; the selected-place drawer should not add a separate context panel.
_Avoid_: Secondary nav, breadcrumb theater, explanatory side panel

**Immediate Browse Origin**:
The compact label for the browsing mode or list a selected place came from. It is only needed when the browsing surface is partly hidden, such as in a mobile bottom sheet.
_Avoid_: Long breadcrumb trail, fake folder hierarchy, redundant desktop return UI

**Mobile Context Strip**:
The compact strip inside the selected-place bottom sheet that shows prior browse context and an explicit return or close action when the Directory Browser is not fully visible.
_Avoid_: Desktop rail squeezed into mobile, hidden back behavior, full secondary nav

**Directory Browser**:
The left-column browsing surface for finding and selecting places before deeper place information appears. It should orient users to the inventory without trying to carry the full story or selected-place detail state itself.
_Avoid_: Editorial landing panel, audit table, undifferentiated list

**Public Browse Label**:
A user-facing category or filter label written for scanning and curiosity rather than mirroring source workbook taxonomy. It may be mapped from internal source categories without exposing those source terms directly.
_Avoid_: Workbook category, data label, institutional taxonomy

**Outing Type**:
A broad public browse lane that helps someone choose what kind of cultural outing they want, such as art, music and performance, history, local shops, outdoors, events, or family-friendly options. Outing Types are not source categories; they are visitor-facing entry points that may map to several internal place types.
_Avoid_: Workbook taxonomy, rigid ontology, one-to-one source category

**Browse Label Set**:
The small first-pass group of Public Browse Labels used to make the directory scannable. It should be broad enough to avoid clutter while still helping users understand the kinds of places in the map.
_Avoid_: Full source taxonomy, dozens of filters, final ontology

**Browse Starting View**:
The initial Directory Browser state before a user searches or filters. It should communicate the map's range with representative places, controls, and counts rather than defaulting to a raw alphabetical slice.
_Avoid_: First ten alphabetical records, empty menu screen, full dump

**County Sampler**:
The default Browse Starting View pattern that uses a small, mixed set of representative places to show the range of the county before the user searches, filters, or browses by map area.
_Avoid_: Top ten list, alphabetical sample, nearby-only opening

**Demo Sampler Set**:
A hand-picked first-pass County Sampler used to make the demo feel intentional before a durable algorithmic sampler exists.
_Avoid_: Permanent ranking, final featured list, random sample

**MUSE-Grounded Sampler**:
A Demo Sampler Set chosen from places with direct MUSE place evidence so the Browse Starting View feels editorially grounded rather than random. Fuzzy theme links may support later copy, but should not by themselves qualify a place for the sampler.
_Avoid_: MUSE vibes, fuzzy-only sampler, arbitrary featured places

**Editorial Direct MUSE Evidence**:
Direct MUSE place evidence from article, story, or contextual editorial material rather than administrative, acknowledgement, get-involved, editor-letter, or calendar mentions.
_Avoid_: Calendar-only evidence, acknowledgement-only evidence, fuzzy theme evidence, administrative mention

**Showcase Sampler Scope**:
The first-load sampler boundary for the current showcase, constrained to GVNC Prototype Scope even when direct MUSE evidence exists elsewhere in the county.
_Avoid_: Countywide opening sampler, Truckee-first showcase, excluding non-GVNC records from enrichment

**Implicit MUSE Grounding**:
The use of direct MUSE evidence to shape what appears in the Browse Starting View without labeling the initial directory section as a MUSE feature.
_Avoid_: MUSE-branded opening section, unexplained random sampling, magazine archive mode

**Near Current Map**:
A Directory Browser mode that prioritizes places inside or near the current map viewport after the user has spatial context. It is a useful browsing feature, not the default first-load orientation.
_Avoid_: Default opening list, hidden ranking, only way to browse

**Show Places In This Area**:
The intentional user action that refreshes the Directory Browser around the current map viewport. It prevents the list from changing unexpectedly while the user pans or zooms.
_Avoid_: Auto-updating directory, invisible viewport filter, map-driven list surprise

**Cultural Anchor**:
A hand-picked place from the already-vetted NCAC cultural asset universe with extra editorial meaning for the current demo/review slice. It does not need to be an active arts venue; the distinction is extra authored treatment, not whether the place is culturally valid.
_Avoid_: Featured pin, top place, ranked place, only arts venues

**Anchor Card**:
The selected-place card treatment for a Cultural Anchor. Its job is to make the place compelling to a **citizen** — richer hook, image, and context than an ordinary card. The reviewer judges that citizen-facing card as a citizen would; the card does not carry copy whose purpose is to "prove authority" to a reviewer. Data-audit status and any vetting/provenance language must not be visible in the card UI. (Owner ruling, 2026-05-29: superseded the prior "first job is to prove NCAC cultural authority for the Stakeholder Review Audience" framing — that was justification-voice, see the Audience entry under Flagged ambiguities.)
_Avoid_: Proof-of-authority copy, listing card, data audit card, generic place detail

**Image Proof**:
The visual evidence used in an Anchor Card. Prefer real official or existing V1 images. The Primary Anchor Set should use fully resolved real images for the next review slice; no placeholders in primary Anchor Cards. Labeled placeholders and generated concept images are allowed for supporting stops, gaps, or future-direction mockups, but they must be clearly identified and never presented as documentary place photography.
_Avoid_: Unlabeled generated place photos, pretending placeholders are real documentation

**MUSE Layer**:
The editorial influence and optional story evidence from NCAC's MUSE context. MUSE voice may inform all Anchor Card copy; explicit MUSE claims or badges should appear only where local MUSE data supports a match.
_Avoid_: Claiming every anchor appears in MUSE, using MUSE as generic decoration

**Seen in MUSE**:
A citizen-facing **credential** on a place's card when the MUSE Article Index has a direct place_id match: it flatters the place ("In the pages of MUSE Magazine," with article title and issue), it does not prove the place to a reviewer. The verb is deliberately **"In the pages of," not "Featured in"** — the match data is an exact name/address hit on a page, which may be a listing or mention, not a feature; "featured" would overclaim to the two reviewers who know what MUSE actually published (the-fool catch, 2026-05-30). It must NOT render provenance or vetting internals — no confidence levels ("high confidence"), no "direct place evidence," no match-type, no page-citation footnotes. Those are **MUSE Evidence Confidence** signals, which are author-facing only (they gate whether an agent may use a source) and never appear on the surface. The aspirational form is a short pull-quote linked to the article; that needs editorial quote text + a link target that the shipped data does not yet contain, so until that data exists the surface shows the plain badge only. (Owner ruling, 2026-05-29: the current "Seen in MUSE" confidence ledger is the canonical example of justification-voice leaking to the citizen — strip it to a badge.)
_Avoid_: Confidence scores on the surface, "direct place evidence" / match-type language, page-citation footnotes, fuzzy MUSE badge, theme-only place claim, unsourced MUSE flourish

**MUSE-Backed Card Enrichment**:
Visible selected-card content drawn from direct MUSE place evidence. It should appear only when the base Directory Record is clean enough to carry the enrichment without making the card feel broken or thin.
_Avoid_: MUSE decoration, enrichment on broken cards, fuzzy-only place evidence

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

**Orientation Failure**:
The Discovery Map failure mode where users cannot quickly tell where they are, what they are looking at, why a place matters, what changed after interaction, or what to do next.
_Avoid_: Mere visual polish issue, map-only problem, user confusion as user fault

**Directory Map Coordination**:
The expectation that the Directory Browser and map camera/marker state should reinforce the same current browsing context. The left panel and map should not feel like independent surfaces showing unrelated things.
_Avoid_: Stapled-together list and map, unrelated default map extent, silent context mismatch

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

**Living Event Layer**:
The V1 event treatment: a light layer of current events drawn from the live NCAC event pipeline, shown only at visible places. It is fed by the real ingestion pipeline (re-wired into V1), not a hand-maintained snapshot. Its promise is *currency at anchor places*, not exhaustive county calendar coverage.
_Avoid_: Hand-picked frozen demo set, full events calendar/sidebar, raw firehose dump, stale snapshot presented as current

**Event Freshness Guarantee**:
The structural rule that V1 never shows a past event as upcoming. Events are filtered to today-or-later before render, so the "Upcoming event" label is always true by construction. Freshness is enforced by filtering, never by a visible "as of <date>" caveat (which would be banned process voice below the nav chrome).
_Avoid_: "as of <date>" caveat on the surface, trusting a label without filtering, showing past events with a freshness disclaimer

**Empty Events State**:
The citizen-voiced state shown when no current events match visible places. It invites the citizen to return ("No events listed here this week — check back soon") rather than exposing a stale list, a broken-feed message, or a process/QA caveat.
_Avoid_: Stale list as fallback, "feed unavailable" error, process-label caveat, silent empty Events mode

## Relationships

- The **Stakeholder Review Audience** is the first audience for the next selected-place-card and path-treatment slice.
- The visible product surface should behave like a **Stakeholder-Ready Discovery Map**: limited in scope, but not visibly labeled as internal, alpha, prototype, demo, review, or audit tooling.
- A **Stakeholder-Ready Discovery Map** uses a **Public Beta Surface**: privately reviewed does not mean visibly provisional.
- **Diana Workbook** is the canonical name for the Arts Council data-engineering workbook; do not call it "the source of truth" without naming what kind of truth is meant.
- **ArcGIS Cultural Asset Export** is the preferred coordinate fallback for Diana Workbook rows that lack coordinates, when there is a **Confident Coordinate Match**.
- **Arts Hub Coordinate Bridge** is quarantined reference and should not supply default public marker coordinates.
- Broad and medium map views should prefer **Constellation Disclosure** with **Local Reveal** over default number-only clusters.
- **Local Reveal** should use **Local Reveal Directory Update** as the primary disclosure path, with the left panel carrying the nearby-place list.
- A **Coordinate Candidate** may appear in working map data, but it is not the same as a Diana coordinate or **Confident Coordinate Match** until explicitly accepted.
- A **Coordinate Candidate** may be used as a discrepancy signal against a Diana Workbook coordinate, but it does not override the Diana coordinate by default.
- A **Candidate Marker Treatment** may distinguish Coordinate Candidates during private review, but should not appear as a public trust badge by default.
- A **Coordinate Provenance Card Note** is preferred over radically different public marker styling when the prototype needs to feel close to the intended final map.
- Coordinate provenance should appear after place selection, not as always-visible directory-row metadata.
- A **Coordinate Candidate** should use **Map Location Not Confirmed - Estimated** language in the selected card.
- Selected-card location notes should appear only when a location is estimated or missing; Diana Workbook and ArcGIS confident fallback coordinates do not need routine provenance text in the public card.
- A **Coordinate Review Pass** can rely on visual marker differentiation without defining a permanent candidate approval workflow.
- A **Review Marker** can appear in a coordinate review prototype before it becomes a **Map-Ready Place**.
- A coordinate review prototype should default to showing all **Review Markers**, with provenance made visible through the selected card rather than by hiding Coordinate Candidates by default.
- Free geocoding should be attempted for **Address-Bearing Place** records, not for name-only or city-only records.
- A place can be a **Directory-Only Place** without being a **Map-Ready Place**; missing coordinates should remove normal marker behavior, not remove the place from the directory.
- A selected **Directory-Only Place** should use **Map Location Coming Soon** language and should not trigger map zooming or panning.
- The directory can include both **Review Marker** places and **Directory-Only Place** records; the map layer should not define the full place inventory.
- Every visible marker for an **Ordinary Place** should represent a **Map-Ready Place**; if its coordinate cannot be trusted, it becomes **Needs Location Review** and may still appear as a **Directory-Only Place**.
- The **Public Discovery Audience** remains important, but does not override stakeholder confidence in the next slice.
- Every **Ordinary Place** should have a **Directory Record** treatment before any place-specific editorial layer is considered.
- Every visible Ordinary Place marker should have a **Marker Preview** on hover and open a **Selected Directory Card** on click.
- Place selection should use a **Unified Place Card** with optional enrichment sections rather than separate card models for MUSE and non-MUSE places.
- On desktop, the **Unified Place Card** should use a **Selection Drawer** while the **Directory Browser**, map, and selected marker remain coordinated; the visible Directory Browser is the return path.
- Desktop selected-place flow should not add a separate **Context Rail** or explanatory return panel.
- On mobile, the selected-place bottom sheet should use a **Mobile Context Strip** because the Directory Browser is not fully visible.
- The left column should primarily behave as a **Directory Browser**; richer place information belongs after selection.
- Directory filters should use **Public Browse Label** language rather than exposing source workbook categories directly.
- The first **Browse Label Set** should be broad and small rather than exhaustive.
- The **Browse Starting View** should use representative places and orientation controls rather than a raw alphabetical opening list.
- The default **Browse Starting View** should use a **County Sampler**; **Near Current Map** should remain available as a browsing mode after first orientation.
- The first **County Sampler** may use a **Demo Sampler Set** rather than a permanent algorithmic sampler.
- The preferred **Demo Sampler Set** is a **MUSE-Grounded Sampler** based on direct MUSE place evidence, not fuzzy-only theme evidence.
- The first visible **MUSE-Grounded Sampler** should use **Editorial Direct MUSE Evidence**, not administrative or calendar-only direct mentions.
- The current **MUSE-Grounded Sampler** should honor **Showcase Sampler Scope**; Truckee places can still receive MUSE-backed card enrichment when selected, but should not anchor the first-load showcase.
- The refined **MUSE-Grounded Sampler** is accepted as the first **Browse Starting View** input; Census-sourced sampler entries should use estimated-location card language when selected.
- The first Browse Starting View should use **Implicit MUSE Grounding**; direct MUSE evidence shapes the sampler, but the opening section should not present itself as a MUSE feature by default.
- The first Browse Starting View repair should not over-prioritize routes or events before the place browsing experience is clear.
- **Near Current Map** should refresh through **Show Places In This Area**, not by silently auto-updating the directory on every pan or zoom.
- **Directory Map Coordination** should govern first load: the Browse Starting View and the map should reflect the same browsing context.
- **Email Data** is excluded from first-pass **Directory Record** restoration until the public contact boundary is separately decided.
- **Hours Data** is excluded from first-pass **Directory Record** restoration until a separate readiness audit approves it.
- A **Cultural Anchor** is an **Ordinary Place** with added editorial meaning. Ordinary Places are still vetted NCAC cultural assets; anchors are not "more real," just more authored for the slice.
- A **Cultural Anchor** adds authored meaning to a **Directory Record**; it does not replace the practical inventory facts.
- An **Anchor Card** leads with cultural meaning, image proof, and story/path/event relationships before utility links.
- **Image Proof** for the Primary Anchor Set must be real/resolved for the next review slice. Supporting or future-direction imagery may be placeholder/generated if labeled honestly.
- The **MUSE Layer** is voice everywhere and evidence only where supported.
- A **Seen in MUSE** section belongs on a **Directory Record** only when the MUSE Article Index has a direct place_id match.
- A **Seen in MUSE** section may explain why a sampled place was included, but the selected card should still lead with the place itself rather than the article.
- **MUSE-Backed Card Enrichment** can apply beyond **Showcase Sampler Scope**, but should wait until the base **Directory Record** is clean enough to support it.
- A **Concept Mockup** can accompany the live prototype and short brief to make gaps or possible future directions visible without building a second prototype.
- A **Review Gap** should be named honestly and can be illustrated with a labeled Concept Mockup when it helps stakeholders react to direction.
- **Orientation Failure** is a root product risk for the current V1 Discovery Map; trust and curiosity both degrade when users cannot form a stable mental model of the map, directory, and selected place state.
- **Tonight's Work Phase** prioritizes Primary Anchor Set Anchor Card polish before path treatment.
- A **Path Stop** may be a **Cultural Anchor** when the route is built from the curated demo spine.
- **Path Treatment** is the next structure after Anchor Cards and can later carry events, MUSE context, and nearby places.
- The **Makers / Working Artists Path** is the first proof Path Treatment for the next review slice.
- The next demo uses the **Primary Anchor Set** for top-weight Anchor Cards and the **Supporting Stop Set** for path/layer context.
- **Supporting Stop Treatment** should make supporting stops context-rich but visually subordinate to Primary Anchor Cards, with path/layer context carrying the main meaning.
- Use a **Visible Incompleteness Label** only where the supporting-stop UI exposes a visible gap.
- The **GVNC Prototype Scope** excludes Truckee/High Sierra anchors from the first anchor-card slice unless explicitly revived.
- Nearby cultural landscape anchors may be included when they strengthen the Grass Valley/Nevada City story, but Truckee anchors stay out of the next review slice.

- The **Living Event Layer** is fed by the live event pipeline re-wired into V1, not a hand-picked frozen set; it shows events only at visible places.
- The **Living Event Layer** must honor the **Event Freshness Guarantee**; when nothing current matches, it shows the **Empty Events State** rather than a stale list.
- An **Orientation Failure** includes showing a past event as "Upcoming"; the **Event Freshness Guarantee** exists to prevent it.

## Example dialogue

> **Dev:** "Should this selected place card optimize for quick public directions or stakeholder confidence?"
> **Domain expert:** "Stakeholder confidence first. It should still be usable, but the next pass needs Eliza and Diane to feel that NCAC can own this direction."

> **Dev:** "Is Nevada Theatre just another place record?"
> **Domain expert:** "No — in this slice it is a Cultural Anchor. It should explain why the theater matters and how it participates in the authored paths."

## Flagged ambiguities

- "Audience" splits by purpose. The **reviewer** (Stakeholder Review Audience) is who *judges* the build; the **citizen** (Public Discovery Audience) is who the **visible copy speaks to**. These are never the same voice. The reviewer evaluates the surface *as a citizen would* — they do not get their own on-surface sentences. So for any decision about visible copy, "Audience" means **Public Discovery Audience**, full stop. "Audience = Stakeholder Review Audience" applies only to what gets reviewed and how it is judged, never to the words on the page. (Owner ruling, 2026-05-29.)
- "Anchor" means **Cultural Anchor**, not a generic map marker or automatically ranked popular place.
- "Prototype scope" currently means **GVNC Prototype Scope**. Truckee Tahoe Airport and Clair Tappaan Lodge are out of the first anchor set for this reason.
