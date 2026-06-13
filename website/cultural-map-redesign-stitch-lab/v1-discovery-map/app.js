(function () {
  "use strict";

  // Contract/debug seam: when ?contract=cla-33 is set, updateSmartLabels()
  // publishes its in-view candidate ranking to window.__smartLabelDebug so the
  // CLA-33 contract can assert map-convention invariants (importance ranking,
  // stability) that are not otherwise observable from the DOM.
  const CONTRACT_MODE = new URLSearchParams(window.location.search).get("contract") === "cla-33";

  const DATA = {
    places: "data/places.json",
    events: "data/events.json?v=cla-43-events",
    paths: "data/paths.json",
    anchorCards: "data/anchor_cards.json",
    museEvidence: "data/muse_evidence_links.json",
    museSampler: "data/muse_grounded_sampler.json",
    museStories: "data/muse-stories.json",
  };

  const MARKERS = {
    // Canonical NCAC ink (#1A1A1A) — was a navy drift (#1a1a2e).
    place: "#1a1a1a",
    quiet: "#5d625b",
    red: "#ff2e00",
    paper: "#ffffff",
    ink: "#1a1a1a",
    // Muted plum = "event coming up" (cla-76 red ruling). The legend swatch in
    // styles.css (.legend-dot.halo) hand-copies this hue — change both together.
    plum: "#54466b",
    plumHalo: "rgba(84,70,107,0.16)",
  };
  // CLA-34: color place dots by outing group (derived from category). The mapping
  // and the MapLibre match expression live in marker-category-color.js (unit-tested,
  // loaded before this script). Fall back to the flat dark fill if it's unavailable.
  const CATEGORY_COLOR =
    (typeof window !== "undefined" &&
      window.MarkerCategoryColor &&
      window.MarkerCategoryColor.CATEGORY_COLOR_EXPRESSION) ||
    MARKERS.place;
  const CONSTELLATION_DENSITY_RADIUS_MILES = 0.01;
  const DENSE_CONSTELLATION_MIN_PLACES = 8;

  const MOBILE_INITIAL_MAP_VIEW = {
    center: [-121.04, 39.16],
    zoom: 11.0,
  };

  const DESKTOP_INITIAL_MAP_VIEW = {
    center: [-121.04, 39.24],
    zoom: 10.7,
  };

  // CLA-27: active basemap is the OpenFreeMap "Liberty" street style (free, no API key).
  const STREET_BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

  // Warmth pass 4 (cla-65): the stock Liberty palette (cool greys, saturated
  // greens, blue water, orange motorways) reads stock-Google next to the brand's
  // warm paper surfaces. WARM_BASEMAP retints every tile layer at runtime via
  // setPaintProperty after style load (NOT a CSS canvas filter — that muddies
  // water and labels). Direction owner-validated 2026-06-11 with a live
  // saturate(.45)+sepia(.22) experiment. All values are plain color strings, so
  // no paint-expression validity risk; layers are matched from the loaded
  // style's own layer list by source-layer + id pattern, never hardcoded blind.
  const WARM_BASEMAP = {
    background: "#f2ecdc", // paper-warm ground, a step deeper than --paper so panels still lift
    water: "#a9b6b3", // single muted slate for lakes, rivers, and waterway lines
    parkFill: "#e2e3c9", // warm paper-sage range for everything green
    parkOutline: "#cdd0ae",
    wood: "#dcdec4",
    grass: "#e7e7cd",
    wetland: "#e4e7d2",
    ice: "#f0eee2",
    sand: "#eee5cb",
    residential: "#efe8d6",
    landuse: "#e9e5d0",
    building: "#e6decb",
    buildingOutline: "#d8cdb6",
    aeroway: "#ece6d4",
    rail: "#cfc5b2",
    roadCasing: "#dcd3c0", // quiet warm neutrals; ink hierarchy comes from value steps
    majorCasing: "#c8bba1",
    motorway: "#ebdab6",
    trunkPrimary: "#f1e8d0",
    secondaryTertiary: "#f8f3e5",
    minor: "#fbf8ee",
    path: "#d8d0c6",
    boundary: "#b5ab9b",
    placeLabel: "#3e3a33", // town names: near-ink, still the loudest tile text
    roadLabel: "#8a8174", // street names: muted so app content stays the loud layer
    waterLabel: "#5e7378",
    labelHalo: "#faf6ec",
  };

  const ANCHOR_ICON_TEXT = {
    stage: "ST",
    book: "BK",
    gallery: "GA",
    maker: "MK",
    historic: "HI",
    "food-drink": "FD",
  };

  const CATEGORY_PLACEHOLDER_IMAGES = {
    "Arts Organizations": "assets/category-placeholders-ncac/arts-organizations.png",
    "Creative Services": "assets/category-placeholders-ncac/arts-organizations.png",
    "Cultural Resources": "assets/category-placeholders-ncac/cultural-resources.png",
    "Eat, Drink & Stay": "assets/category-placeholders-ncac/eat-drink-stay.png",
    "Fairs & Festivals": "assets/category-placeholders-ncac/fairs-festivals.png",
    "Galleries & Studios": "assets/category-placeholders-ncac/galleries-studios.png",
    "Historic Places": "assets/category-placeholders-ncac/historic-places.png",
    "Performing Arts": "assets/category-placeholders-ncac/performing-arts.png",
    "Public Art": "assets/category-placeholders-ncac/public-art.png",
    "Shops & Makers": "assets/category-placeholders-ncac/shops-makers.png",
    "Walks & Trails": "assets/category-placeholders-ncac/walks-trails.png",
  };

  const OUTING_TYPES = [
    {
      label: "Art",
      matchCategories: ["Arts Organizations", "Creative Services", "Galleries & Studios", "Public Art"],
      matchIntents: ["Galleries & Studios"],
    },
    {
      label: "Music & Performance",
      matchCategories: ["Performing Arts"],
      matchIntents: ["See a Show"],
    },
    {
      label: "History",
      matchCategories: ["Cultural Resources", "Historic Places"],
      matchIntents: ["Historic Places"],
    },
    {
      label: "Local Shops",
      matchCategories: ["Eat, Drink & Stay", "Shops & Makers"],
      matchIntents: ["Eat, Drink & Stay", "Shops & Makers"],
    },
    {
      label: "Outdoors",
      matchCategories: ["Walks & Trails"],
      matchIntents: ["Outdoors"],
    },
    {
      label: "Events",
      matchCategories: ["Fairs & Festivals"],
      matchEventVenues: true,
    },
    {
      label: "Family-Friendly",
      matchCategories: ["Cultural Resources", "Fairs & Festivals", "Public Art", "Walks & Trails"],
    },
  ];

  const state = {
    mode: "places",
    activeIntents: new Set(),
    places: [],
    events: [],
    paths: [],
    anchorCards: [],
    museEvidenceByPlace: new Map(),
    museStories: [],
    browseSamplerPlaceIds: [],
    selectedPath: null,
    selectedPlaceId: "",
    selectedEventId: "",
    // Flight sequence counter (drift mining, 2026-06-12): a new selection
    // flight invalidates the previous one's moveend, so a superseded flight
    // never deals a stale card on arrival.
    flightSeq: 0,
    eventLens: "all",
    // "Featured in MUSE" (owner ruling 2026-06-11): membership is derived at
    // runtime from muse-stories.json exact placeIds — a place is featured only
    // if a real article links it. Directory listing alone never qualifies.
    featuredInMuseOnly: false,
    museFeaturedIds: new Set(),
    surprisePlaceIds: [],
    searchQuery: "",
    localReveal: null,
    localRevealPreviousContext: null,
    isApplyingReviewState: false,
    map: null,
    markerPreviewPopup: null,
    previewPlaceId: "",
    // Discovery Rail (ADR 0002, variant B). railFocusPlaceId carries the
    // Rail Follow marker highlight through the same hover-ring filter seam
    // as previewPlaceId — no new paint expressions, no new layers.
    railItems: [],
    railFilter: "all",
    railFocusPlaceId: "",
    railLastFollowIndex: -1,
    railSuppressFollow: false,
    pathMarkers: [],
    smartLabels: [],
    labelsActive: false,
    lastLabelAnchor: {},
  };

  const els = {
    count: document.getElementById("visible-count"),
    filters: document.getElementById("filters"),
    detail: document.getElementById("detail-card"),
    selectionDrawer: document.getElementById("selection-drawer"),
    hint: document.getElementById("featured-hint"),
    search: document.getElementById("place-search"),
    placesList: document.getElementById("places-list"),
    rail: document.getElementById("discovery-rail"),
    railTrack: document.getElementById("rail-track"),
    railResetChip: document.getElementById("rail-reset-chip"),
    railArrowPrev: document.getElementById("rail-arrow-prev"),
    railArrowNext: document.getElementById("rail-arrow-next"),
  };

  // CLA-42: when the OS requests reduced motion, swap MapLibre's animated camera
  // moves (flyTo/fitBounds) for instant ones. CSS handles the rest (see styles.css).
  function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
  }

  // Coordinate validity for mixed items (events, rail cards, reveal origins).
  // Places that should appear on the map go through isPlaceMapReady instead,
  // which also honors the publicMarker opt-out.
  function hasCoords(item) {
    return Number.isFinite(item?.lng) && Number.isFinite(item?.lat);
  }

  // Selection flight (drift mining, owner zoom ruling): street level so cross
  // streets resolve; Math.max never zooms OUT a user already deeper. Brisk
  // high-arc profile from fable-drift's steered hops. Shared by place and
  // event selection; onArrival fires on touchdown unless a newer flight has
  // superseded this one (flightSeq guard). Reduced motion lands instantly.
  const SELECTION_FLIGHT = { speed: 1.7, curve: 1.35, maxDuration: 2600 };
  function flyToSelection(center, onArrival) {
    const seq = ++state.flightSeq;
    const targetZoom = Math.max(state.map.getZoom(), 16);
    if (prefersReducedMotion()) {
      state.map.jumpTo({ center, zoom: targetZoom });
      onArrival();
    } else {
      state.map.flyTo({ center, zoom: targetZoom, ...SELECTION_FLIGHT, essential: true });
      state.map.once("moveend", () => { if (seq === state.flightSeq) onArrival(); });
    }
  }

  // Frame a set of located points (surprise picks, story members, path stops):
  // shared padding and reduced-motion handling; callers override per framing
  // (e.g. maxZoom) through options.
  function fitToPoints(points, options = {}) {
    if (!points.length || !state.map) return;
    const bounds = points.reduce(
      (box, point) => box.extend([point.lng, point.lat]),
      new maplibregl.LngLatBounds([points[0].lng, points[0].lat], [points[0].lng, points[0].lat]),
    );
    state.map.fitBounds(bounds, { padding: 90, duration: prefersReducedMotion() ? 0 : 800, ...options });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function resolveMedia(src) {
    if (!src) return "";
    if (/^https?:\/\//.test(src)) return src;
    if (src.startsWith("assets/")) return src;
    if (src.startsWith("../")) return src;
    return `../${src}`;
  }

  function categoryPlaceholderFor(category) {
    return CATEGORY_PLACEHOLDER_IMAGES[category] || "";
  }

  // Indexed place lookup; falls back to a linear scan before the index is built.
  function placeById(id) {
    if (state.placeIndex) return V1PlaceData.placeById(state.placeIndex, id);
    return state.places.find((item) => item.id === id);
  }

  function isPlaceMapReady(place) {
    return place?.publicMarker !== false && Number.isFinite(place?.lng) && Number.isFinite(place?.lat);
  }

  function placeToFeature(place, nearbyDensity = 1) {
    const denseConstellation = nearbyDensity >= DENSE_CONSTELLATION_MIN_PLACES;
    return {
      type: "Feature",
      id: place.id,
      geometry: { type: "Point", coordinates: [place.lng, place.lat] },
      properties: {
        id: place.id,
        name: place.name,
        city: place.city,
        category: place.category,
        intent: place.intent,
        featured: Boolean(place.featured),
        featuredInMuse: state.museFeaturedIds.has(place.id),
        anchor: Boolean(place.anchor),
        markerTier: place.markerTier || "map-ready",
        candidate: place.markerTier === "candidate",
        sampler: state.browseSamplerPlaceIds.includes(place.id),
        currentContext: isCurrentContextPlace(place),
        localReveal: Boolean(state.localReveal?.placeIds?.includes(place.id)),
        nearbyDensity: nearbyDensity,
        denseConstellation: denseConstellation,
        hasEvent: Boolean(state.eventPlaceIds?.has(place.id)),
        surprise: state.surprisePlaceIds.includes(place.id),
        selected: place.id === state.selectedPlaceId,
      },
    };
  }

  function placeKindLabel(place) {
    return place.category || "Cultural place";
  }

  function markerPreviewHtml(place) {
    const location = [place.category, place.city || "Nevada County"].filter(Boolean).join(" / ");
    return `
      <div class="marker-preview" role="status">
        <p class="marker-preview-kicker">${escapeHtml(placeKindLabel(place))}</p>
        <strong>${escapeHtml(place.name)}</strong>
        <span>${escapeHtml(location)}</span>
        ${place.address ? `<small>${escapeHtml(place.address)}</small>` : ""}
      </div>
    `;
  }

  function showMarkerPreview(event) {
    if (!event.features?.length) return;
    const id = event.features[0].properties.id;
    const place = placeById(id);
    if (!place) return;
    const previousPreviewId = state.previewPlaceId;
    state.previewPlaceId = place.id;
    if (!state.markerPreviewPopup) {
      state.markerPreviewPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "marker-preview-popup",
        offset: 12,
      });
    }
    state.markerPreviewPopup
      .setLngLat(event.features[0].geometry.coordinates)
      .setHTML(markerPreviewHtml(place))
      .addTo(state.map);
    // Refresh labels so the hovered place is always labeled (it's cap-exempt as
    // `previewed`) and its dot takes the hover/red state. The popup tail already
    // anchors the card at the marker.
    refreshHoverState(previousPreviewId);
  }

  function hideMarkerPreview() {
    const previousPreviewId = state.previewPlaceId;
    state.previewPlaceId = "";
    state.markerPreviewPopup?.remove();
    refreshHoverState(previousPreviewId);
  }

  // The hover ring is the existing lightweight highlight seam (setFilter, no
  // source rebuild). It now serves two states: marker hover (previewPlaceId)
  // and Rail Follow focus (railFocusPlaceId). The filter stays a plain
  // top-level expression - no zoom-in-case anywhere near marker paint.
  function applyHoverRingFilter() {
    if (!state.map || !state.map.getLayer("place-hover-ring")) return;
    state.map.setFilter("place-hover-ring", [
      "all", ["!", ["has", "point_count"]],
      ["any",
        ["==", ["get", "id"], state.previewPlaceId || " "],
        ["==", ["get", "id"], state.railFocusPlaceId || " "],
      ],
    ]);
  }

  // Repaint the hovered dot red (lightweight setFilter, no source rebuild) and
  // refresh smart labels so the previewed place gets a label.
  function refreshHoverState(previousPreviewId) {
    applyHoverRingFilter();
    if (previousPreviewId !== state.previewPlaceId) updateSmartLabels();
  }

  // Local-time YYYY-MM-DD. Used to enforce the Event Freshness Guarantee:
  // events with date < today are never shown, so "Upcoming event" is true by
  // construction. See V1-DISCOVERY-MAP-DECISION-LOG.md Events ruling 2026-05-30.
  function todayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function upcomingEvents(events) {
    const today = todayISO();
    return (Array.isArray(events) ? events : []).filter(
      (event) => typeof event.date === "string" && event.date >= today,
    );
  }

  // Flow-upgrade Stage 4: events-only time lens. There is NO hours data for
  // places, so "Open Now" is deliberately absent — the lens only ever narrows
  // the (already future-only) event list. Lenses: today | weekend | week | all.
  function localISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function eventLensRange(lens) {
    const now = new Date();
    const today = todayISO();
    if (lens === "today") return [today, today];
    if (lens === "week") {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      return [today, localISO(end)];
    }
    if (lens === "weekend") {
      // The coming Sat–Sun; if today already is the weekend, start today.
      const day = now.getDay(); // 0 Sun … 6 Sat
      const start = new Date(now);
      if (day >= 1 && day <= 5) start.setDate(start.getDate() + (6 - day));
      const end = new Date(start);
      end.setDate(end.getDate() + (start.getDay() === 0 ? 0 : 1));
      return [localISO(start), localISO(end)];
    }
    return null; // all upcoming
  }

  function lensFilteredEvents() {
    const range = eventLensRange(state.eventLens);
    if (!range) return state.events;
    return state.events.filter((event) => event.date >= range[0] && event.date <= range[1]);
  }

  function eventToFeature(event) {
    return {
      type: "Feature",
      id: event.id,
      geometry: { type: "Point", coordinates: [event.lng, event.lat] },
      properties: {
        id: event.id,
        title: event.title,
        date: event.date,
        placeId: event.placeId,
        placeName: event.placeName,
        selected: event.id === state.selectedEventId,
      },
    };
  }

  function applyAnchorCards(places, anchorCards) {
    const cardsById = new Map((anchorCards || []).map((card) => [card.placeId, card]));
    return (places || []).map((place) => {
      const card = cardsById.get(place.id);
      if (!card) {
        const { anchor, anchorCard, ...rest } = place;
        return rest;
      }
      const nextPlace = {
        ...place,
        anchorCard: card,
      };
      if (card.image && card.image.src) {
        nextPlace.image = card.image;
      }
      if (card.website) {
        nextPlace.website = card.website;
      }
      if (card.promoteAsAnchor) {
        nextPlace.anchor = {
          label: card.anchorLabel,
          hook: card.hook,
          iconKey: card.iconKey,
          priority: card.priority,
          pathIds: place.anchor?.pathIds || [],
          tier: card.recommendedTier,
          badge: card.demoBadge,
        };
      } else {
        delete nextPlace.anchor;
      }
      return nextPlace;
    });
  }

  function outingTypeFor(label) {
    return OUTING_TYPES.find((outingType) => outingType.label === label);
  }

  function eventVenuePlaceIds() {
    return new Set(state.events.map((event) => event.placeId).filter(Boolean));
  }

  function placeMatchesOutingType(place, outingType) {
    if (!place || !outingType) return false;
    if (outingType.matchCategories?.includes(place.category)) return true;
    if (outingType.matchIntents?.includes(place.intent)) return true;
    if (outingType.matchEventVenues && eventVenuePlaceIds().has(place.id)) return true;
    return false;
  }

  function outingTypesForPlace(place) {
    return OUTING_TYPES.filter((outingType) => placeMatchesOutingType(place, outingType));
  }

  function filteredPlaces() {
    // "Featured in MUSE" ANDs with the outing-type filters (PRD §9 Q2).
    const base = state.featuredInMuseOnly ? state.places.filter((place) => state.museFeaturedIds.has(place.id)) : state.places;
    if (!state.activeIntents.size) return base;
    const activeOutingTypes = [...state.activeIntents].map(outingTypeFor).filter(Boolean);
    return base.filter((place) => activeOutingTypes.some((outingType) => placeMatchesOutingType(place, outingType)));
  }

  function distanceMiles(a, b) {
    const toRad = (value) => value * Math.PI / 180;
    const earthRadiusMiles = 3958.8;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
  }

  function nearbyPlaceCount(origin, places, radiusMiles) {
    return places.filter((candidate) => (
      hasCoords(candidate) &&
      distanceMiles(origin, { lng: candidate.lng, lat: candidate.lat }) <= radiusMiles
    )).length;
  }

  function nearbyPlaceDensity(place, places) {
    return nearbyPlaceCount(
      { lng: place.lng, lat: place.lat },
      places,
      CONSTELLATION_DENSITY_RADIUS_MILES
    );
  }

  function localRevealPlaces() {
    if (!state.localReveal) return [];
    const placesById = new Map(state.places.map((place) => [place.id, place]));
    return state.localReveal.placeIds.map((id) => placesById.get(id)).filter(Boolean);
  }

  function localRevealAreaFeature() {
    if (!state.localReveal) return null;
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [state.localReveal.lng, state.localReveal.lat],
      },
      properties: {
        count: state.localReveal.placeIds.length,
      },
    };
  }

  function setLocalRevealSourceData() {
    const source = state.map?.getSource("local-reveal-area");
    if (!source) return;
    const feature = localRevealAreaFeature();
    source.setData({
      type: "FeatureCollection",
      features: feature ? [feature] : [],
    });
  }

  function searchableText(place) {
    const outingTypeLabels = outingTypesForPlace(place).map((outingType) => outingType.label);
    return [place.name, place.category, place.city, place.intent, ...outingTypeLabels].filter(Boolean).join(" ").toLowerCase();
  }

  function isBrowseStartingView() {
    return state.mode === "places" && !state.searchQuery.trim() && !state.activeIntents.size && !state.featuredInMuseOnly;
  }

  function isMobileViewport() {
    return window.innerWidth < 700;
  }

  function browseStartingPlaces() {
    if (!isBrowseStartingView() || !state.browseSamplerPlaceIds.length) return filteredPlaces();
    const placesById = new Map(state.places.map((place) => [place.id, place]));
    return state.browseSamplerPlaceIds.map((id) => placesById.get(id)).filter(Boolean);
  }

  function isCurrentContextPlace(place) {
    if (place.id === state.selectedPlaceId) return true;
    if (state.localReveal?.placeIds?.includes(place.id)) return true;
    if (isBrowseStartingView()) return state.browseSamplerPlaceIds.includes(place.id);
    const query = state.searchQuery.trim().toLowerCase();
    if (query) return searchableText(place).includes(query);
    const activeOutingTypes = [...state.activeIntents].map(outingTypeFor).filter(Boolean);
    return activeOutingTypes.some((outingType) => placeMatchesOutingType(place, outingType));
  }

  function listedPlaces() {
    if (state.localReveal) return localRevealPlaces();
    const query = state.searchQuery.trim().toLowerCase();
    const places = filteredPlaces();
    if (!query) return browseStartingPlaces();
    return places.filter((place) => searchableText(place).includes(query));
  }

  function updateCount() {
    if (state.mode === "events") {
      const n = state.events.length;
      els.count.textContent = n === 1 ? "1 upcoming event" : `${n} upcoming events`;
    } else if (state.mode === "paths") {
      els.count.textContent = `${state.paths.length} curated paths`;
    } else {
      els.count.textContent = `${filteredPlaces().length} places to explore`;
    }
  }

  function currentReviewState() {
    return {
      mode: state.mode,
      intents: [...state.activeIntents],
      place: state.mode === "places" ? state.selectedPlaceId : "",
      path: state.mode === "paths" && state.selectedPath ? state.selectedPath.id : "",
      event: state.mode === "events" ? state.selectedEventId : "",
    };
  }

  function updateReviewUrl() {
    if (state.isApplyingReviewState || !window.V1ReviewState || !window.history?.replaceState) return;
    const nextSearch = window.V1ReviewState.apply(window.location.search, currentReviewState());
    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }

  function placeReviewLabel(place) {
    return place.category || "Place";
  }

  function renderPlacesList() {
    syncBrowseChrome();
    if (!els.placesList) return;
    const query = state.searchQuery.trim();
    const places = listedPlaces();
    const visibleCount = filteredPlaces().length;
    const limit = 60;
    if (state.mode !== "places") {
      els.placesList.innerHTML = "";
      return;
    }
    if (!places.length) {
      els.placesList.innerHTML = `
        <div class="places-list-empty">
          <p>No places match ${query ? `"${escapeHtml(query)}"` : "this filter"}.</p>
          ${state.activeIntents.size || state.featuredInMuseOnly ? `<button class="filter-chip" type="button" id="clear-place-filters">Clear filters</button>` : ""}
        </div>
      `;
      // Mode is already places here — delegate to the shared reset so search
      // and local reveal clear too, exactly like the rail reset chip.
      els.placesList.querySelector("#clear-place-filters")?.addEventListener("click", resetToBrowseStartingView);
      return;
    }
    const shown = places.slice(0, limit);
    const isStartingView = isBrowseStartingView();
    const isLocalReveal = Boolean(state.localReveal);
    els.placesList.innerHTML = `
      ${isLocalReveal ? `
        <div class="local-reveal-summary">
          <span>Show places in this area</span>
          <small>${escapeHtml(places.length)} places near this spot</small>
          <button class="local-reveal-back" type="button" id="local-reveal-back">Back to browse</button>
        </div>
      ` : `
        <div class="places-list-summary">
          <span>${isStartingView ? "Places to explore" : `${escapeHtml(places.length)} ${query ? "matching" : "listed"} of ${escapeHtml(visibleCount)} places on the map`}</span>
        </div>
      `}
      <div class="places-list-items">
        ${shown.map((place) => `
          <button class="place-list-item${place.id === state.selectedPlaceId ? " active" : ""}${isLocalReveal ? " local-reveal-item" : ""}" type="button" data-place="${escapeHtml(place.id)}" aria-current="${place.id === state.selectedPlaceId ? "true" : "false"}">
            <span class="place-list-title">${escapeHtml(place.name)}</span>
            <span class="place-list-meta">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</span>
            <span class="place-list-badge">${escapeHtml(placeReviewLabel(place))}</span>
          </button>
        `).join("")}
      </div>
      ${isStartingView && !isLocalReveal ? `<p class="places-list-more">Choose an Outing Type or search places to browse the full directory.</p>` : ""}
      ${!isStartingView && !isLocalReveal && places.length > limit ? `<p class="places-list-more">Showing first ${escapeHtml(limit)}. Use search to narrow the list.</p>` : ""}
    `;
    els.placesList.querySelector("#local-reveal-back")?.addEventListener("click", clearLocalReveal);
    els.placesList.querySelectorAll("[data-place]").forEach((button) => {
      const place = placeById(button.dataset.place);
      if (place) button.addEventListener("click", () => showPlace(place));
    });
  }

  function setSourceData() {
    const mapReadyPlaces = filteredPlaces().filter(isPlaceMapReady);
    const places = mapReadyPlaces.map((place) => placeToFeature(place, nearbyPlaceDensity(place, mapReadyPlaces)));
    const placeSource = state.map.getSource("places");
    if (placeSource) {
      placeSource.setData({ type: "FeatureCollection", features: places });
    }
    setLocalRevealSourceData();

    const events = state.mode === "events" ? lensFilteredEvents().map(eventToFeature) : [];
    const eventSource = state.map.getSource("events");
    if (eventSource) {
      eventSource.setData({ type: "FeatureCollection", features: events });
    }
    updateCount();
    renderPlacesList();
    updateSmartLabels();
  }

  function setMapSourceData(sourceId, features) {
    const source = state.map.getSource(sourceId);
    if (source) source.setData({ type: "FeatureCollection", features });
  }

  function startLocalReveal(lngLat) {
    if (!lngLat) return;
    const origin = { lng: Number(lngLat.lng), lat: Number(lngLat.lat) };
    if (!hasCoords(origin)) return;
    if (!state.localRevealPreviousContext) {
      state.localRevealPreviousContext = {
        searchQuery: state.searchQuery,
        activeIntents: [...state.activeIntents],
        selectedPlaceId: state.selectedPlaceId,
      };
    }
    const places = filteredPlaces()
      .filter(hasCoords)
      .map((place) => ({
        place,
        distance: distanceMiles(origin, { lng: place.lng, lat: place.lat }),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 12)
      .map(({ place }) => place);
    state.mode = "places";
    state.localReveal = {
      lng: origin.lng,
      lat: origin.lat,
      placeIds: places.map((place) => place.id),
    };
    state.selectedPlaceId = "";
    state.selectedEventId = "";
    hideMarkerPreview();
    setSourceData();
    updateReviewUrl();
  }

  function clearLocalReveal() {
    const previous = state.localRevealPreviousContext;
    state.localReveal = null;
    state.localRevealPreviousContext = null;
    if (previous) {
      state.searchQuery = previous.searchQuery;
      state.activeIntents = new Set(previous.activeIntents);
      state.selectedPlaceId = previous.selectedPlaceId;
      if (els.search) els.search.value = previous.searchQuery;
      renderFilters();
    }
    setSourceData();
    if (!state.selectedPlaceId) renderFeaturedAnchor();
    updateReviewUrl();
  }

  function setMapLayerVisibility(layerId, visibility) {
    if (state.map.getLayer(layerId)) {
      state.map.setLayoutProperty(layerId, "visibility", visibility);
    }
  }

  function clearSmartLabels() {
    state.smartLabels.forEach((marker) => marker.remove());
    state.smartLabels = [];
  }

  // Importance tier (lower = more important) — pure authored/interaction
  // signals, no density. Density is a collision/spacing input only, never a
  // promotion signal (removing density-as-ranking is the CLA-33 core fix).
  function importanceTier(f) {
    if (f.selected) return 0;
    if (f.previewed) return 1;
    if (f.isAnchor) return 2;
    if (f.featured) return 3;
    if (f.featuredInMuse) return 4;
    if (f.sampler || f.currentContext) return 5;
    return 6;
  }

  // Rank purely by authored/interaction importance — no density, no
  // center-distance (the zoom regime already scopes to the local neighborhood).
  // Anchors break ties by their authored priority; everything else is stable by
  // name then id so the labeled set doesn't churn between rebuilds.
  function compareImportance(a, b) {
    if (a.importanceTier !== b.importanceTier) return a.importanceTier - b.importanceTier;
    if (a.isAnchor && b.isAnchor && a.anchorPriority !== b.anchorPriority) {
      return a.anchorPriority - b.anchorPriority;
    }
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) return byName;
    return String(a.id).localeCompare(String(b.id));
  }

  function updateSmartLabels() {
    clearSmartLabels();
    if (!state.map || state.mode !== "places" || !state.map.getLayer("place-points")) return;

    // Zoom regime with hysteresis: labels turn ON at the on-threshold and turn
    // OFF only once we drop below the off-threshold, so small zoom nudges around
    // the boundary don't thrash labels on and off. Below the band the map is
    // dots-only — conventional maps don't label until a neighborhood is small.
    const LABEL_ZOOM_ON = 13.3;
    const LABEL_ZOOM_OFF = 12.7;
    const zoom = state.map.getZoom();
    if (state.labelsActive) {
      if (zoom < LABEL_ZOOM_OFF) state.labelsActive = false;
    } else if (zoom >= LABEL_ZOOM_ON) {
      state.labelsActive = true;
    }
    // Flow-upgrade Stage 1: below the label band, anchors/featured (and the
    // selected/previewed place) STAY labeled so county zoom shows named
    // cultural anchors instead of anonymous dots ("First 30 Seconds" board).
    const anchorsOnly = !state.labelsActive;

    const bounds = state.map.getBounds();
    const mapCanvas = state.map.getCanvas();
    const viewportCenter = {
      x: mapCanvas.clientWidth / 2,
      y: mapCanvas.clientHeight / 2,
    };
    const mapReadyPlaces = filteredPlaces().filter(isPlaceMapReady);
    const visiblePlaces = mapReadyPlaces
      .filter((place) => isPlaceMapReady(place) && bounds.contains([place.lng, place.lat]))
      .map((place) => {
        const screenPos = state.map.project([place.lng, place.lat]);
        const centerDistance = Math.hypot(screenPos.x - viewportCenter.x, screenPos.y - viewportCenter.y);
        const nearbyDensity = nearbyPlaceDensity(place, mapReadyPlaces);
        const isAnchor = Boolean(place.anchor);
        const featured = Boolean(place.featured);
        const featuredInMuse = state.museFeaturedIds.has(place.id);
        const selected = place.id === state.selectedPlaceId;
        const previewed = place.id === state.previewPlaceId;
        const sampler = state.browseSamplerPlaceIds.includes(place.id);
        const currentContext = isCurrentContextPlace(place);
        return {
          id: place.id,
          name: place.name,
          lng: place.lng,
          lat: place.lat,
          isAnchor,
          anchorPriority: (isAnchor && Number.isFinite(place.anchor.priority)) ? place.anchor.priority : 99,
          featured,
          featuredInMuse,
          sampler,
          currentContext,
          selected,
          previewed,
          importanceTier: importanceTier({ selected, previewed, isAnchor, featured, featuredInMuse, sampler, currentContext }),
          centerDistance,
          nearbyDensity,
          screenPos,
        };
      })
      .filter((place) => !anchorsOnly || place.importanceTier <= 3)
      .sort(compareImportance)
      .slice(0, 72);

    if (!visiblePlaces.length) return;

    const occupiedBoxes = visiblePlaces.map((place) => {
      const markerSize = place.isAnchor ? 36 : 16;
      return {
        id: place.id,
        kind: "marker",
        tier: place.importanceTier,
        minX: place.screenPos.x - markerSize / 2 - 4,
        maxX: place.screenPos.x + markerSize / 2 + 4,
        minY: place.screenPos.y - markerSize / 2 - 4,
        maxY: place.screenPos.y + markerSize / 2 + 4,
      };
    });

    const labeledIds = new Set();
    let labelCount = 0;
    visiblePlaces.forEach((place) => {
      if (labelCount >= 18 && !place.selected && !place.previewed) return;
      const labelW = Math.min(220, place.name.length * 6.2 + 16);
      const labelH = 24;
      const markerOffset = place.isAnchor ? 20 : 10;
      const candidates = [
        {
          minX: place.screenPos.x + markerOffset,
          maxX: place.screenPos.x + markerOffset + labelW,
          minY: place.screenPos.y - labelH / 2,
          maxY: place.screenPos.y + labelH / 2,
          offsetX: markerOffset + labelW / 2,
          offsetY: 0,
          posClass: "pos-right",
        },
        {
          minX: place.screenPos.x - markerOffset - labelW,
          maxX: place.screenPos.x - markerOffset,
          minY: place.screenPos.y - labelH / 2,
          maxY: place.screenPos.y + labelH / 2,
          offsetX: -markerOffset - labelW / 2,
          offsetY: 0,
          posClass: "pos-left",
        },
        {
          minX: place.screenPos.x - labelW / 2,
          maxX: place.screenPos.x + labelW / 2,
          minY: place.screenPos.y - markerOffset - labelH,
          maxY: place.screenPos.y - markerOffset,
          offsetX: 0,
          offsetY: -markerOffset - labelH / 2,
          posClass: "pos-top",
        },
      ];

      // Stability (Mapbox text-variable-anchor pattern): try the anchor side
      // this place used last rebuild before the fixed candidate order, so a
      // label only switches sides when its previous side now genuinely collides
      // — no flip-flopping as you pan/zoom across boundaries.
      const cachedPos = state.lastLabelAnchor[place.id];
      const orderedCandidates = cachedPos
        ? [...candidates].sort((a, b) => (b.posClass === cachedPos) - (a.posClass === cachedPos))
        : candidates;

      const important = place.importanceTier <= 2;
      const bestCandidate = orderedCandidates.find((candidate) => {
        return !occupiedBoxes.some((box) => {
          if (box.id === place.id) return false;
          // A high-importance label (selected/previewed/anchor) may sit over an
          // ordinary dot marker so a dense cluster can't starve it of a slot; it
          // still avoids other labels and other important markers.
          if (important && box.kind === "marker" && box.tier > 2) return false;
          return (
            candidate.minX < box.maxX &&
            candidate.maxX > box.minX &&
            candidate.minY < box.maxY &&
            candidate.maxY > box.minY
          );
        });
      });
      if (!bestCandidate) return;

      occupiedBoxes.push({ ...bestCandidate, id: `label:${place.id}`, kind: "label", tier: place.importanceTier });
      place.posClass = bestCandidate.posClass;
      state.lastLabelAnchor[place.id] = bestCandidate.posClass;
      labelCount += 1;
      const el = document.createElement("button");
      el.type = "button";
      const stateClass = [
        place.selected ? "selected" : "",
        place.previewed && !place.selected ? "previewed" : "",
        // Dim non-selected labels when a selection exists so the selection reads
        // (alpha only — no layout change).
        state.selectedPlaceId && !place.selected ? "dimmed" : "",
      ].filter(Boolean).join(" ");
      el.className = `map-smart-label ${place.isAnchor ? "anchor-label-pin" : ""} ${bestCandidate.posClass} ${stateClass}`.trim();
      el.textContent = place.name;
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        const selected = placeById(place.id);
        if (selected) showPlace(selected);
      });

      const marker = new maplibregl.Marker({
        element: el,
        offset: [bestCandidate.offsetX, bestCandidate.offsetY],
      })
        .setLngLat([place.lng, place.lat])
        .addTo(state.map);
      state.smartLabels.push(marker);
      labeledIds.add(place.id);
    });

    if (CONTRACT_MODE) {
      window.__smartLabelDebug = {
        zoom,
        labelsActive: state.labelsActive,
        previewPlaceId: state.previewPlaceId,
        selectedPlaceId: state.selectedPlaceId,
        candidates: visiblePlaces.map((p, index) => ({
          id: p.id,
          name: p.name,
          lng: p.lng,
          lat: p.lat,
          rank: index,
          importanceTier: p.importanceTier,
          anchorPriority: p.anchorPriority,
          nearbyDensity: p.nearbyDensity,
          labeled: labeledIds.has(p.id),
          posClass: p.posClass || null,
        })),
      };
    }
  }

  function expandDrawer() {
    const controlPanel = document.querySelector(".control-panel");
    if (controlPanel) controlPanel.classList.remove("collapsed");
  }

  function openSelectionDrawer() {
    els.selectionDrawer?.classList.add("open");
    // Each selection starts at the top of the card — never inherit the
    // previous place's scroll position.
    if (els.selectionDrawer) els.selectionDrawer.scrollTop = 0;
  }

  // The mode tabs reflect what the visitor is LOOKING AT (critique P2-9): an
  // event card opened from the rail lights the Events tab even though the
  // browse mode underneath is unchanged; closing the card restores the truth.
  function syncModeTabs(kind) {
    const active = kind || state.mode;
    document.querySelectorAll(".mode-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === active));
  }

  function closeSelectionDrawer() {
    els.selectionDrawer?.classList.remove("open");
    state.selectedPlaceId = "";
    state.selectedEventId = "";
    setDetailCardMode("");
    syncModeTabs();
    els.detail.innerHTML = `<p class="empty-title">Select a place</p><p class="empty-copy">Choose another place from the Directory Browser to reopen details.</p>`;
    if (state.map) setSourceData();
    updateReviewUrl();
  }

  function revealDetailCard() {
    openSelectionDrawer();
  }

  // "Featured in MUSE" chip (owner ruling 2026-06-11): filters to places with
  // at least one exact MUSE article link (muse-stories.json). The old
  // directory-derived "MUSE Picks" flag is retired — provenance, not a badge.
  function featuredInMuseChip() {
    const count = state.places.filter((place) => state.museFeaturedIds.has(place.id)).length;
    return `<button class="featured-muse-chip${state.featuredInMuseOnly ? " active" : ""}" type="button" data-featured-muse aria-pressed="${state.featuredInMuseOnly ? "true" : "false"}">Featured in MUSE <span class="featured-muse-chip-count">${escapeHtml(count)}</span></button>`;
  }

  function renderFilters() {
    // CLA-20: lead with an Outing Type browse list (a way in); once a lane is
    // chosen, collapse to a compact active-filter bar. The full list re-opens
    // via "Change". The list is always shown when nothing is selected.
    const activeIntents = OUTING_TYPES.filter((outingType) => state.activeIntents.has(outingType.label));
    const hasActive = activeIntents.length > 0;
    const listOpen = state.filterListOpen || !hasActive;
    const countFor = (outingType) => state.places.filter((place) => placeMatchesOutingType(place, outingType)).length;

    if (listOpen) {
      const rows = OUTING_TYPES.map((outingType) => {
        const active = state.activeIntents.has(outingType.label);
        return `<button class="outing-row${active ? " active" : ""}" type="button" data-outing-type="${escapeHtml(outingType.label)}" aria-pressed="${active ? "true" : "false"}">
          <span class="outing-row-label">${escapeHtml(outingType.label)}</span>
          <span class="outing-row-count">${escapeHtml(countFor(outingType))}</span>
          <span class="outing-row-cue" aria-hidden="true">${active ? "✓" : "›"}</span>
        </button>`;
      }).join("");
      els.filters.innerHTML = `
        <div class="outing-browse">
          <div class="outing-browse-head">
            <span class="outing-browse-title">What are you in the mood for?</span>
            ${hasActive ? `<button class="outing-done" type="button" data-outing-done>Done</button>` : ""}
          </div>
          ${featuredInMuseChip()}
          <div class="outing-list" role="group" aria-label="Outing types">${rows}</div>
          <button class="surprise-button" type="button" data-surprise>Surprise me nearby</button>
          <button class="surprise-button story-lens-button" type="button" data-muse-stories>Stories from MUSE</button>
        </div>`;
    } else {
      const pills = activeIntents.map((outingType) => `
        <button class="outing-pill" type="button" data-outing-remove="${escapeHtml(outingType.label)}" aria-label="Remove ${escapeHtml(outingType.label)} filter">
          <span>${escapeHtml(outingType.label)}</span><span class="outing-pill-x" aria-hidden="true">✕</span>
        </button>`).join("");
      els.filters.innerHTML = `
        <div class="outing-active-bar">
          ${pills}
          ${featuredInMuseChip()}
          <button class="outing-change" type="button" data-outing-change aria-expanded="false">Change ▾</button>
        </div>`;
    }

    const refreshAfterChange = () => {
      const visibleIds = new Set(filteredPlaces().map((place) => place.id));
      if (state.selectedPlaceId && !visibleIds.has(state.selectedPlaceId)) state.selectedPlaceId = "";
      renderFilters();
      if (!state.selectedPlaceId) renderFeaturedAnchor();
      setSourceData();
      updateReviewUrl();
    };
    const toggleIntent = (intent) => {
      if (!intent) return;
      state.localReveal = null;
      state.localRevealPreviousContext = null;
      if (state.activeIntents.has(intent)) state.activeIntents.delete(intent);
      else state.activeIntents.add(intent);
      // Collapse to the compact bar once a lane is chosen; reopen the list when empty.
      state.filterListOpen = state.activeIntents.size === 0;
      refreshAfterChange();
    };

    els.filters.querySelector("[data-featured-muse]")?.addEventListener("click", () => {
      state.featuredInMuseOnly = !state.featuredInMuseOnly;
      refreshAfterChange();
    });
    els.filters.querySelector("[data-surprise]")?.addEventListener("click", renderSurprise);
    els.filters.querySelector("[data-muse-stories]")?.addEventListener("click", renderStoryList);
    els.filters.querySelectorAll(".outing-row").forEach((button) => {
      button.addEventListener("click", () => toggleIntent(button.dataset.outingType));
    });
    els.filters.querySelectorAll("[data-outing-remove]").forEach((button) => {
      button.addEventListener("click", () => toggleIntent(button.dataset.outingRemove));
    });
    const changeButton = els.filters.querySelector("[data-outing-change]");
    if (changeButton) changeButton.addEventListener("click", () => { state.filterListOpen = true; renderFilters(); });
    const doneButton = els.filters.querySelector("[data-outing-done]");
    if (doneButton) doneButton.addEventListener("click", () => { state.filterListOpen = false; renderFilters(); });
  }

  // Events mode replaces the Outing Type browse list with a date-sorted,
  // browsable list of upcoming events (the map diamonds alone are not a
  // discovery surface).
  function renderEventsList() {
    const events = lensFilteredEvents().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    // Stage 4 time lens: events-only chips (no "Open Now" — no hours data).
    const lenses = [
      ["today", "Today"],
      ["weekend", "This weekend"],
      ["week", "Next 7 days"],
      ["all", "All upcoming"],
    ];
    const chips = lenses.map(([key, label]) => `
      <button class="time-lens-chip${state.eventLens === key ? " active" : ""}" type="button" data-event-lens="${key}" aria-pressed="${state.eventLens === key ? "true" : "false"}">${label}</button>`).join("");
    const rows = events.map((event) => `
      <button class="event-list-row${state.selectedEventId === event.id ? " active" : ""}" type="button" data-event-id="${escapeHtml(event.id)}">
        <span class="event-list-date">${escapeHtml(event.date)}</span>
        <span class="event-list-copy"><strong>${escapeHtml(event.title)}</strong><em>${escapeHtml(event.placeName || "")}</em></span>
      </button>`).join("");
    els.filters.innerHTML = `
      <div class="outing-browse">
        <div class="time-lens-row" role="group" aria-label="When">${chips}</div>
        <div class="outing-browse-head">
          <span class="outing-browse-title">${events.length ? `Events (${escapeHtml(events.length)})` : "No events in this window"}</span>
        </div>
        <div class="events-browse-list" role="list" aria-label="Upcoming events">${rows}</div>
      </div>`;
    els.filters.querySelectorAll("[data-event-lens]").forEach((button) => {
      button.addEventListener("click", () => {
        state.eventLens = button.dataset.eventLens;
        state.selectedEventId = "";
        renderEventsList();
        setSourceData();
      });
    });
    els.filters.querySelectorAll(".event-list-row").forEach((button) => {
      button.addEventListener("click", () => {
        const event = state.events.find((item) => item.id === button.dataset.eventId);
        if (event) {
          showEvent(event);
          renderEventsList();
        }
      });
    });
  }

  function setDetailCardMode(mode) {
    els.detail.classList.toggle("place-feature-card", mode === "place");
    els.detail.classList.toggle("path-detail-card", mode === "path");
    els.detail.classList.toggle("event-feature-card", mode === "event");
  }

  function resolvePlaceImage(place) {
    return V1PlaceData.resolvePlaceImage(place, {
      resolveMedia,
      categoryPlaceholderFor,
      defaultPlaceholder: "assets/placeholders/gallery-studio.webp",
    });
  }

  // ONE image-fallback mechanism (warmth-fixes C2): markup builders emit
  // data-img-fallback="placeholder|remove|event|poster" (plus a data-fallback
  // src where a stand-in image exists) and this single delegated capture-phase
  // listener handles every broken image. No JS-in-HTML onerror strings.
  function handleImageFallback(errorEvent) {
    const img = errorEvent.target;
    if (!(img instanceof HTMLImageElement)) return;
    const mode = img.dataset.imgFallback;
    if (!mode) return;
    delete img.dataset.imgFallback; // each image gets exactly one fallback attempt
    if (mode === "remove") {
      // Hint feature image: the copy block stands alone without it.
      img.remove();
      return;
    }
    if (mode === "placeholder") {
      // Place photo (renderImage): swap to the category placeholder. The
      // photographer credit belongs to the failed photo, not the stand-in, so
      // it goes; the name/city caption bar stays; the standard "not yet
      // sourced" label appears (CSS lifts it above the caption bar).
      img.src = img.dataset.fallback || "assets/placeholders/gallery-studio.webp";
      img.classList.add("placeholder-image");
      img.alt = "NCAC category placeholder image";
      const figure = img.closest("figure");
      if (!figure) return;
      figure.querySelector(".place-photo-caption small")?.remove();
      figure.querySelector("figcaption:not(.place-photo-caption)")?.remove(); // corner credit chip
      if (!figure.querySelector(".placeholder-label")) {
        const label = document.createElement("span");
        label.className = "placeholder-label";
        label.textContent = "Photo not yet sourced";
        figure.appendChild(label);
      }
      return;
    }
    if (mode === "event") {
      // Event photo: keep the figure — its figcaption names the venue/city —
      // and swap the image for the venue's category placeholder.
      img.src = img.dataset.fallback || "assets/placeholders/gallery-studio.webp";
      img.classList.add("placeholder-image");
      img.alt = "";
      return;
    }
    if (mode === "poster") {
      // Rail card: a dead image becomes the designed imageless poster card
      // instead of a bare paper card.
      const card = img.closest(".rail-card");
      img.remove();
      if (!card || card.classList.contains("rail-card-poster")) return;
      const type = (card.className.match(/rail-card-(event|place|story|path)/) || [])[1] || "event";
      const index = Number(card.dataset.railIndex) || 0;
      railPosterClasses(type, index).forEach((cls) => card.classList.add(cls));
    }
  }
  document.addEventListener("error", handleImageFallback, true);

  function renderImage(place, options = {}) {
    const imageLabel = options.imageLabel || options.proofLabel || "";
    const proofLabel = imageLabel ? `<span class="image-proof-label">${escapeHtml(imageLabel)}</span>` : "";
    const resolved = resolvePlaceImage(place);
    if (resolved.isRealImage) {
      // Warmth-pass 2 (mockup B): when a caption is supplied the photo carries
      // a full-width ink caption bar (name/city), with the credit tucked in
      // small; otherwise the old corner credit chip renders.
      const caption = options.caption
        ? `<figcaption class="place-photo-caption"><span>${escapeHtml(options.caption)}</span>${resolved.credit ? `<small>${escapeHtml(resolved.credit)}</small>` : ""}</figcaption>`
        : resolved.credit ? `<figcaption>${escapeHtml(resolved.credit)}</figcaption>` : "";
      return `
        <figure class="place-image-frame">
          ${proofLabel}
          <img class="place-image" src="${escapeHtml(resolved.src)}" alt="${escapeHtml(resolved.alt || place.name)}" width="640" height="360" loading="lazy" decoding="async" data-fallback="${escapeHtml(categoryPlaceholderFor(place.category) || "assets/placeholders/gallery-studio.webp")}" data-img-fallback="placeholder">
          ${caption}
        </figure>
      `;
    }
    const explicitPlaceholder = place.image?.kind === "placeholder" ? "" : place.image?.src || place.image?.placeholderSrc;
    const alt = explicitPlaceholder
      ? place.image?.alt || `Non-documentary placeholder image for ${place.name}`
      : `NCAC category placeholder for ${place.category || place.name}`;
    return `
      <div class="placeholder-image-wrap">
        ${proofLabel}
        <img class="place-image placeholder-image" src="${escapeHtml(resolved.src)}" alt="${escapeHtml(alt)}" width="640" height="360" loading="lazy" decoding="async">
        <span class="placeholder-label">Photo not yet sourced</span>
      </div>
    `;
  }

  function relatedEvents(placeId) {
    return state.events.filter((event) => event.placeId === placeId).slice(0, 3);
  }

  // Flow-upgrade Stage 5 ("Hidden Gems" board, honest version): a handful of
  // random under-the-radar places that have REAL descriptions. The "reason to
  // go" line is the venue's own first sentence — never generated copy.
  function surpriseEligiblePlaces() {
    return state.places.filter((place) =>
      isPlaceMapReady(place) &&
      !place.anchor &&
      !place.featured &&
      place.description &&
      !place.description.includes("included for alpha review"),
    );
  }

  function firstSentence(text) {
    const match = String(text || "").match(/^.*?[.!?](?=\s|$)/);
    const sentence = match ? match[0] : String(text || "");
    if (sentence.length <= 160) return sentence;
    // Truncate on a word boundary with an ellipsis — never mid-word
    // ("Retro-coo", critique P2-10).
    const cut = sentence.slice(0, 160);
    return cut.slice(0, Math.max(cut.lastIndexOf(" "), 120)).trimEnd() + "…";
  }

  // Some venue feeds prefix event copy with SHOUTING boilerplate
  // ("GET YOUR TICKETS Soul Brass Band is…"). Display-only normalization —
  // the source data in data/events.json stays untouched. Place descriptions
  // are NOT run through this: all-caps there can be the venue's own brand
  // voice ("DRINK COFFEE DO STUFF") — those offenders are logged in
  // data/source-text-review.md for a human pass instead.
  function displayEventDescription(text) {
    return String(text || "").replace(/^GET YOUR TICKETS\s+/, "");
  }

  function rollSurprise() {
    let eligible = surpriseEligiblePlaces();
    // "Nearby" must mean nearby: rank by distance to the current map view and
    // draw from the closest ~30 so Nevada City doesn't surprise you with Truckee.
    const center = state.map?.getCenter?.();
    if (center) {
      eligible = eligible
        .map((place) => ({
          place,
          dist: Math.hypot((place.lng - center.lng) * Math.cos((center.lat * Math.PI) / 180), place.lat - center.lat),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 30)
        .map((item) => item.place);
    }
    // Prefer places with a real photo, then top up from the rest.
    const withImage = eligible.filter((place) => place.image?.kind === "real");
    const pool = withImage.length >= 4 ? withImage : eligible;
    const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    state.surprisePlaceIds = picks.map((place) => place.id);
    return picks;
  }

  function renderSurprise() {
    const picks = rollSurprise();
    state.selectedPlaceId = "";
    setSourceData();
    setDetailCardMode("");
    if (!picks.length) return;
    // Critique P1-7: show the picks you just rolled — fit the camera to their
    // rings instead of leaving it parked on the previous selection.
    fitToPoints(picks.filter(hasCoords), { maxZoom: 15 });
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close surprises">Close</button>
      <p class="section-label">Surprise me nearby</p>
      <p class="empty-copy">Four stops near the current view that you might have missed — ringed on the map, described in their own words.</p>
      <div class="surprise-list">
        ${picks.map((place) => `
          <button class="place-nearby-link" type="button" data-nearby-place="${escapeHtml(place.id)}">
            <strong>${escapeHtml(place.name)}</strong>
            <span>${escapeHtml([place.category, place.city].filter(Boolean).join(" / "))}</span>
            <em>${escapeHtml(firstSentence(place.description))}</em>
          </button>
        `).join("")}
      </div>
      <div class="detail-actions"><button type="button" class="surprise-reroll">Surprise me again</button></div>
    `;
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", () => {
      state.surprisePlaceIds = [];
      setSourceData();
      closeSelectionDrawer();
    });
    els.detail.querySelector(".surprise-reroll")?.addEventListener("click", renderSurprise);
    els.detail.querySelectorAll("[data-nearby-place]").forEach((button) => {
      button.addEventListener("click", () => {
        const place = placeById(button.dataset.nearbyPlace);
        if (place) showPlace(place);
      });
    });
    revealDetailCard();
  }

  // MUSE Story Lens ("MUSE Story Lens" board): browse the map through real
  // MUSE Magazine articles. Stories come from exact, direct-evidence matches
  // only (data/muse-stories.json) — never theme/fuzzy guesses.
  // Published e-magazine flip-books (nevadacountyarts.org/muse); #page/N is
  // Heyzine's page deep-link. Print vs flip-book numbering may drift a page.
  const MUSE_ISSUE_URLS = {
    2024: "https://heyzine.com/flip-book/4d7f1d311e.html",
    2025: "https://heyzine.com/flip-book/MUSE",
    2026: "https://heyzine.com/flip-book/MUSE26",
  };

  function museArticleUrl(story) {
    const base = MUSE_ISSUE_URLS[story.issueYear];
    if (!base) return "";
    const page = story.pages?.[0];
    return page ? `${base}#page/${page}` : base;
  }
  function storiesForPlace(placeId) {
    return state.museStories.filter((story) => story.placeIds.includes(placeId));
  }

  function renderStoryList() {
    state.selectedPlaceId = "";
    state.surprisePlaceIds = [];
    setSourceData();
    setDetailCardMode("");
    if (!state.museStories.length) return;
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close stories">Close</button>
      <p class="section-label">Stories from MUSE</p>
      <p class="empty-copy">Real articles from MUSE, the Arts Council's magazine — pick one to see everywhere it touches the map.</p>
      <div class="story-list">
        ${state.museStories.map((story) => `
          <button class="story-row" type="button" data-muse-story="${escapeHtml(story.id)}">
            <strong>${escapeHtml(story.title)}</strong>
            <span>${escapeHtml(story.issue)} · ${escapeHtml(story.placeIds.length)} places</span>
          </button>
        `).join("")}
      </div>
    `;
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", closeSelectionDrawer);
    els.detail.querySelectorAll("[data-muse-story]").forEach((button) => {
      button.addEventListener("click", () => {
        const story = state.museStories.find((item) => item.id === button.dataset.museStory);
        if (story) renderStory(story);
      });
    });
    revealDetailCard();
  }

  function renderStory(story) {
    const members = story.placeIds.map((id) => placeById(id)).filter((place) => place && place.lat && place.lng);
    if (!members.length) return;
    state.selectedPlaceId = "";
    // Reuse the surprise ring layer to mark every place the story touches.
    state.surprisePlaceIds = members.map((place) => place.id);
    setSourceData();
    setDetailCardMode("");
    fitToPoints(members, { maxZoom: 15 });
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close story">Close</button>
      <p class="section-label">From the pages of MUSE</p>
      <h2 class="story-title">${escapeHtml(story.title)}</h2>
      <p class="story-issue">${escapeHtml(story.issue)}${story.pages?.[0] ? ` · pages ${escapeHtml(story.pages[0])}–${escapeHtml(story.pages[1] || story.pages[0])}` : ""}</p>
      ${museArticleUrl(story) ? `<a class="story-read-link" href="${escapeHtml(museArticleUrl(story))}" target="_blank" rel="noopener">Read the article in MUSE ›</a>` : ""}
      <p class="empty-copy">This article mentions ${escapeHtml(members.length)} places on the map.</p>
      <div class="surprise-list">
        ${members.map((place) => `
          <button class="place-nearby-link" type="button" data-nearby-place="${escapeHtml(place.id)}">
            <strong>${escapeHtml(place.name)}</strong>
            <span>${escapeHtml([place.category, place.city].filter(Boolean).join(" / "))}</span>
          </button>
        `).join("")}
      </div>
      <div class="detail-actions"><button type="button" class="story-back">All stories</button></div>
    `;
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", () => {
      state.surprisePlaceIds = [];
      setSourceData();
      closeSelectionDrawer();
    });
    els.detail.querySelector(".story-back")?.addEventListener("click", renderStoryList);
    els.detail.querySelectorAll("[data-nearby-place]").forEach((button) => {
      button.addEventListener("click", () => {
        const place = placeById(button.dataset.nearbyPlace);
        if (place) showPlace(place);
      });
    });
    revealDetailCard();
  }

  // Flow-upgrade Stage 3 ("Place Pulse" board): the selected place is the
  // connective surface, so the card needs to know which authored paths a place
  // belongs to and what sits nearby.
  function pathsForPlace(placeId) {
    return state.paths.filter((path) => (path.stops || []).some((stop) => stop.placeId === placeId));
  }

  function nearbyPlaces(place, limit = 3) {
    if (!isPlaceMapReady(place)) return [];
    return state.places
      .filter((other) => other.id !== place.id && isPlaceMapReady(other))
      .map((other) => ({
        place: other,
        // Equirectangular approximation — plenty for "what's a short walk away".
        dist: Math.hypot(
          (other.lng - place.lng) * Math.cos((place.lat * Math.PI) / 180),
          other.lat - place.lat,
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit)
      .map((entry) => entry.place);
  }

  function anchorIconText(anchor) {
    return ANCHOR_ICON_TEXT[anchor?.iconKey] || "NC";
  }

  function anchorBadge(place) {
    const card = place.anchorCard || null;
    if (!place.anchor && !card) return "";
    const label = card?.anchorLabel || place.anchor.label;
    const icon = card ? ANCHOR_ICON_TEXT[card.iconKey] || anchorIconText(place.anchor) : anchorIconText(place.anchor);
    const badge = place.anchor?.badge || card?.demoBadge || "";
    return `
      <p class="anchor-label${place.anchor ? "" : " route-stop-label"}">
        <span class="anchor-token">${escapeHtml(icon)}</span>
        <span class="anchor-label-copy">${escapeHtml(label)}</span>
        ${badge ? `<span class="anchor-demo-badge">${escapeHtml(badge)}</span>` : ""}
      </p>
    `;
  }

  function anchorCardMeta(place) {
    const card = place.anchorCard;
    if (!card) return "";
    const pathLabel = card.pathMembership ? card.pathMembership.split(";")[0].trim() : "";
    const chips = [pathLabel, ...(card.themeTags || [])].filter(Boolean).slice(0, 4);
    return `
      <div class="anchor-card-meta" aria-label="About this place">
        ${card.whyItMatters ? `<p><strong>What you'll find here</strong><span>${escapeHtml(card.whyItMatters)}</span></p>` : ""}
        ${card.visibleIncompleteLabel ? `<p class="visible-incomplete-note"><strong>Good to know</strong><span>${escapeHtml(card.visibleIncompleteLabel)}</span></p>` : ""}
        ${chips.length ? `<div class="anchor-context-chips" aria-label="Anchor relationships">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}</div>` : ""}
      </div>
    `;
  }

  // MUSE Business Directory flip-book deep link. Same mechanism as
  // museArticleUrl(): Heyzine's #page/N. Per-issue page offsets between the
  // printed page number (stored as musePage by the reconciliation pass) and
  // the flip-book's page index — 0 for all three issues today (the flip-books
  // are page-faithful exports of the print PDFs; same one-page drift caveat
  // as the Story Lens applies).
  const MUSE_DIRECTORY_PAGE_OFFSETS = { 2024: 0, 2025: 0, 2026: 0 };

  function museDirectoryUrl(place) {
    const latestIssue = Array.isArray(place.museIssues) && place.museIssues.length
      ? place.museIssues[place.museIssues.length - 1]
      : null;
    const base = latestIssue ? MUSE_ISSUE_URLS[latestIssue] : "";
    if (!base) return "";
    const page = Number(place.musePage) + (MUSE_DIRECTORY_PAGE_OFFSETS[latestIssue] || 0);
    return Number.isFinite(page) && page > 0 ? `${base}#page/${page}` : base;
  }

  // Card badge for the MUSE directory layer (PRD §4.3/§4.4): honest issue
  // year (latest appearance), the directory's own category label riding
  // along (never replacing the map category), and the flip-book deep link.
  function museDirectoryBadge(place) {
    if (!Array.isArray(place.museIssues) || !place.museIssues.length) return "";
    const latestIssue = place.museIssues[place.museIssues.length - 1];
    const url = museDirectoryUrl(place);
    const label = `Listed in the MUSE ${latestIssue} directory`;
    return `
      <div class="muse-directory-badge" aria-label="MUSE Business Directory listing">
        ${url
          ? `<a class="muse-directory-badge-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} ›</a>`
          : `<span class="muse-directory-badge-link">${escapeHtml(label)}</span>`}
        ${place.museCategory ? `<span class="muse-directory-category">${escapeHtml(place.museCategory)}</span>` : ""}
      </div>
    `;
  }

  // "Featured in MUSE" card badge (owner ruling 2026-06-11): earned only by an
  // exact article link in muse-stories.json; opens the story on the map (the
  // story card carries the flip-book link to the article itself).
  function featuredInMuseBadge(place) {
    const stories = storiesForPlace(place.id);
    if (!stories.length) return "";
    const story = stories[0];
    return `
      <div class="featured-muse-badge" aria-label="Featured in MUSE Magazine">
        <button class="featured-muse-badge-link" type="button" data-place-story="${escapeHtml(story.id)}">Featured in MUSE — ${escapeHtml(story.title)} ›</button>
      </div>
    `;
  }

  function directoryRecordMeta(place) {
    const rows = [
      place.address ? ["Address", escapeHtml(place.address)] : null,
      place.phone ? ["Phone", `<a href="tel:${escapeHtml(place.phone.replace(/[^0-9+]/g, ""))}">${escapeHtml(place.phone)}</a>`] : null,
      place.website && place.websiteStatus !== "dead" ? ["Website", `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">Open website</a>`] : null,
    ].filter(Boolean);
    if (!rows.length) return "";
    return `
      <dl class="directory-record-meta" aria-label="Place details">
        ${rows.map(([label, value]) => `
          <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${value}</dd>
          </div>
        `).join("")}
      </dl>
    `;
  }

  // Location caveats arrive in data-audit voice ("Tier downgraded by audit:
  // 155m from exact address geocode") — provenance for the data team, not
  // visitor copy. Translate to plain language here; the audit detail stays in
  // the data where it belongs.
  function locationCaveatCopy(caveat) {
    if (/coming soon/i.test(caveat)) return caveat;
    return "Map pin is approximate — double-check the address before you go.";
  }

  function renderLocationCaveat(place) {
    if (!place.locationCaveat) return "";
    return `<p class="location-caveat">${escapeHtml(locationCaveatCopy(place.locationCaveat))}</p>`;
  }

  function buildDirectMuseEvidenceByPlace(evidence) {
    const links = Array.isArray(evidence?.links) ? evidence.links : [];
    return links.reduce((byPlace, link) => {
      if (
        link.target_type !== "place" ||
        link.match_type !== "exact" ||
        link.is_direct_evidence !== true ||
        !link.target_id ||
        !link.article
      ) {
        return byPlace;
      }
      const placeLinks = byPlace.get(link.target_id) || [];
      placeLinks.push(link);
      byPlace.set(link.target_id, placeLinks);
      return byPlace;
    }, new Map());
  }

  function renderSeenInMuse(place) {
    const links = state.museEvidenceByPlace.get(place.id) || [];
    if (!links.length) return "";
    const visibleLinks = links.slice(0, 3);
    return `
      <div class="seen-in-muse" aria-label="In the pages of MUSE Magazine">
        <p class="section-label">In the pages of MUSE Magazine</p>
        <div class="seen-in-muse-list">
          ${visibleLinks.map((link) => {
            const article = link.article || {};
            const issue = article.issue || (article.issue_year ? `MUSE ${article.issue_year}` : "");
            const story = state.museStories.find((item) => item.id === article.id);
            if (story) {
              return `
                <button class="seen-in-muse-item seen-in-muse-story" type="button" data-place-story="${escapeHtml(story.id)}">
                  <strong>${escapeHtml(article.title || "MUSE Magazine")}</strong>
                  ${issue ? `<span>${escapeHtml(issue)}</span>` : ""}
                  <em>See this story on the map ›</em>
                </button>
              `;
            }
            return `
              <article class="seen-in-muse-item">
                <strong>${escapeHtml(article.title || "MUSE Magazine")}</strong>
                ${issue ? `<span>${escapeHtml(issue)}</span>` : ""}
              </article>
            `;
          }).join("")}
        </div>
        ${links.length > visibleLinks.length ? `<p class="seen-in-muse-more">${escapeHtml(links.length - visibleLinks.length)} more in MUSE</p>` : ""}
      </div>
    `;
  }

  function featuredAnchor() {
    const places = state.activeIntents.size ? filteredPlaces() : state.places;
    return places
      .filter((place) => place.anchor)
      .sort((a, b) => (a.anchor.priority || 99) - (b.anchor.priority || 99))[0];
  }

  function renderFilteredPlaceSummary() {
    const places = filteredPlaces();
    const place = places[0];
    const filterLabel = [...state.activeIntents].sort().join(", ");
    if (!place) {
      setDetailCardMode("");
      els.hint.innerHTML = `<p class="hint-title">No places match this Outing Type</p><p>Try another broad outing lane to bring places back onto the map.</p>`;
      els.detail.innerHTML = `<p class="empty-title">No matching places</p><p class="empty-copy">The active filter does not currently match any mapped places.</p>`;
      return;
    }
    els.hint.innerHTML = `<p class="hint-title">Outing Type selected</p><p>${escapeHtml(places.length)} places match ${escapeHtml(filterLabel)}.</p>`;
    // The first match rides the same place-feature card language showPlace
    // uses (photo + caption, meta column, title block) — no orphaned
    // anchor-card markup.
    setDetailCardMode("place");
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close selected place">Close</button>
      ${renderImage(place, { caption: [place.name, place.city].filter(Boolean).join(", ") })}
      <div class="place-feature-body">
        <p class="place-feature-flag">First match</p>
        <div class="place-feature-head">
          <div class="place-meta-block">
            <span class="place-meta-primary">${escapeHtml(place.category || "Cultural place")}</span>
            <span class="place-meta-secondary">${escapeHtml(place.city || "Nevada County")}</span>
          </div>
          <div class="place-feature-title">
            <h2>${escapeHtml(place.name)}</h2>
          </div>
        </div>
        <p class="detail-description">Select a point or choose another Outing Type to refine the map.</p>
        <div class="detail-actions"><button type="button" class="anchor-map-action">View on map</button></div>
      </div>
    `;
    els.detail.querySelector(".anchor-map-action")?.addEventListener("click", () => showPlace(place));
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", closeSelectionDrawer);
  }

  function renderFeaturedAnchor() {
    const place = featuredAnchor();
    if (!place) {
      if (state.activeIntents.size) {
        renderFilteredPlaceSummary();
        return;
      }
      setDetailCardMode("");
      els.hint.innerHTML = `<p class="hint-title">Start in the cultural district</p><p>Grass Valley and Nevada City are centered first, with the wider county still visible as context.</p>`;
      els.detail.innerHTML = `<p class="empty-title">Select a place</p><p class="empty-copy">Pick a place to see what makes it worth a visit.</p>`;
      return;
    }
    setDetailCardMode("place");
    // Flow-upgrade Stage 2 ("First 30 Seconds" board): the panel opens with a
    // visual host card for the top anchor — photo, its hook, and a direct way
    // in — instead of a text-only hint.
    const hintImage = resolvePlaceImage(place).src || categoryPlaceholderFor(place.category);
    els.hint.innerHTML = `
      <div class="hint-feature">
        ${hintImage ? `<img class="hint-feature-img" src="${escapeHtml(hintImage)}" alt="${escapeHtml(place.name)}" loading="lazy" data-img-fallback="remove">` : ""}
        <div class="hint-feature-copy">
          <p class="hint-title">Start here</p>
          <p class="hint-feature-name">${escapeHtml(place.name)}</p>
          <p>${escapeHtml(place.anchor.hook)}</p>
          <button type="button" class="hint-feature-action">View place</button>
        </div>
      </div>`;
    els.hint.querySelector(".hint-feature-action")?.addEventListener("click", () => showPlace(place));
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close selected place">Close</button>
      ${renderImage(place, { caption: [place.name, place.city].filter(Boolean).join(", ") })}
      <div class="place-feature-body">
        <p class="place-feature-flag">Start here</p>
        <div class="place-feature-head">
          <div class="place-meta-block">
            <span class="place-meta-primary">${escapeHtml(place.category || "Cultural place")}</span>
            <span class="place-meta-secondary">${escapeHtml(place.city || "Nevada County")}</span>
          </div>
          <div class="place-feature-title">
            ${anchorBadge(place)}
            <h2>${escapeHtml(place.name)}</h2>
            ${place.anchorCard ? `<p class="anchor-hook">${escapeHtml(place.anchorCard.hook)}</p>` : ""}
          </div>
        </div>
        ${anchorCardMeta(place)}
        <div class="detail-actions"><button type="button" class="anchor-map-action">View on map</button></div>
      </div>
    `;
    els.detail.querySelector(".anchor-map-action")?.addEventListener("click", () => showPlace(place));
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", closeSelectionDrawer);
  }

  function showPlace(place) {
    expandDrawer();
    state.selectedPlaceId = place.id;
    state.selectedEventId = "";
    setSourceData();
    updateSmartLabels();
    const events = relatedEvents(place.id);
    const anchor = place.anchor || null;
    const actionLabel = place.anchorCard?.primaryAction || "Visit site";
    const action = place.website && place.websiteStatus !== "dead" ? `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">${escapeHtml(actionLabel)}</a>` : "";
    const isPrimaryAnchor = Boolean(anchor && place.anchorCard);
    const isSupportingStop = Boolean(!anchor && place.anchorCard);
    // Warmth-pass 2 ("warm magazine page", mockup B): every place — anchor or
    // not — gets the same calm paper feature card. The old primary-anchor /
    // supporting-stop card chrome (red top borders, gradients) is retired.
    setDetailCardMode("place");
    syncModeTabs("places");
    const imageLabel = isSupportingStop && place.image?.status === "candidate"
      ? "Candidate image"
      : isSupportingStop && (!place.image?.src || place.image?.status === "missing")
        ? "Source image pending"
        : "";
    const eventHtml = events.length ? `
      <div class="related-events">
        <p class="section-label">Coming up here</p>
        ${events.map((event) => `
          <button class="event-mini" type="button" data-related-event="${escapeHtml(event.id)}">
            <strong>${escapeHtml(event.title)}</strong>
            <span>${escapeHtml(event.date)} at ${escapeHtml(event.placeName)}</span>
          </button>
        `).join("")}
      </div>
    ` : "";
    const placePaths = pathsForPlace(place.id);
    const pathHtml = placePaths.length ? `
      <div class="place-paths">
        <p class="section-label">Part of a path</p>
        ${placePaths.map((path) => `
          <button class="place-path-link" type="button" data-place-path="${escapeHtml(path.id)}">${escapeHtml(path.title)}</button>
        `).join("")}
      </div>
    ` : "";
    const nearby = nearbyPlaces(place);
    const nearbyHtml = nearby.length ? `
      <div class="place-nearby">
        <p class="section-label">Nearby</p>
        ${nearby.map((other) => `
          <button class="place-nearby-link" type="button" data-nearby-place="${escapeHtml(other.id)}">
            <strong>${escapeHtml(other.name)}</strong>
            <span>${escapeHtml(other.category || "")}</span>
          </button>
        `).join("")}
      </div>
    ` : "";
    const provenance = place.descriptionSource?.kind === "venue-website"
      ? `<p class="description-provenance">In their own words — from <a href="${escapeHtml(place.descriptionSource.url)}" target="_blank" rel="noopener">their website</a></p>`
      : "";
    const hook = place.anchorCard?.hook || anchor?.hook || "";
    // The card is dealt on touchdown (moveend), not at departure — content
    // appearing as the camera lands is most of the perceived flight quality.
    const dealCard = () => {
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close selected place">Close</button>
      ${renderImage(place, { caption: [place.name, place.city].filter(Boolean).join(", "), ...(imageLabel ? { imageLabel } : {}) })}
      <div class="place-feature-body">
        <div class="place-feature-head">
          <div class="place-meta-block">
            <span class="place-meta-primary">${escapeHtml(place.category || "Cultural place")}</span>
            <span class="place-meta-secondary">${escapeHtml(place.city || "Nevada County")}</span>
          </div>
          <div class="place-feature-title">
            ${anchorBadge(place)}
            <h2>${escapeHtml(place.name)}</h2>
            ${hook ? `<p class="anchor-hook">${escapeHtml(hook)}</p>` : ""}
          </div>
        </div>
        ${renderLocationCaveat(place)}
        ${anchorCardMeta(place)}
        <p class="detail-description">${escapeHtml(place.anchorCard?.supportingDescription || place.description)}</p>
        ${provenance}
        ${featuredInMuseBadge(place)}
        ${museDirectoryBadge(place)}
        ${directoryRecordMeta(place)}
        ${action ? `<div class="detail-actions">${action}</div>` : ""}
        ${eventHtml}
        ${renderSeenInMuse(place)}
        ${pathHtml}
        ${nearbyHtml}
      </div>
    `;
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", closeSelectionDrawer);
    els.detail.querySelectorAll("[data-related-event]").forEach((button) => {
      button.addEventListener("click", () => {
        const event = state.events.find((item) => item.id === button.dataset.relatedEvent);
        if (event) showEvent(event);
      });
    });
    els.detail.querySelectorAll("[data-place-path]").forEach((button) => {
      button.addEventListener("click", () => {
        const path = state.paths.find((item) => item.id === button.dataset.placePath);
        if (path) {
          setMode("paths");
          showPath(path);
        }
      });
    });
    els.detail.querySelectorAll("[data-nearby-place]").forEach((button) => {
      button.addEventListener("click", () => {
        const other = placeById(button.dataset.nearbyPlace);
        if (other) showPlace(other);
      });
    });
    els.detail.querySelectorAll("[data-place-story]").forEach((button) => {
      button.addEventListener("click", () => {
        const story = state.museStories.find((item) => item.id === button.dataset.placeStory);
        if (story) renderStory(story);
      });
    });
    revealDetailCard();
    };
    if (isPlaceMapReady(place)) {
      flyToSelection([place.lng, place.lat], dealCard);
    } else {
      dealCard();
    }
    updateReviewUrl();
  }

  // Warmth-pass 1 ("charcoal feature", mockup A): the event detail is a dark
  // editorial surface — ink card, white knockout title, red weighted kicker
  // for the date ("Tonight" / "Fri, Jun 12"), photo with an ink caption bar
  // carrying venue + city, red primary action, muted-outline secondary.
  function showEvent(event) {
    expandDrawer();
    setDetailCardMode("event");
    syncModeTabs("events");
    state.selectedEventId = event.id;
    state.selectedPlaceId = "";
    state.selectedPath = null;
    setSourceData();
    const place = placeById(event.placeId);
    const venueLine = [event.placeName, event.city].filter(Boolean).join(", ");
    const kicker = event.date === todayISO() ? "Tonight" : niceEventDate(event.date);
    const blurb = displayEventDescription(event.description);
    // Same media resolution as the rail (buildRailItems), so relative paths
    // load identically on both surfaces; on a 404 the delegated fallback swaps
    // in the venue's category placeholder and the figcaption keeps naming the
    // venue/city — the card never loses its venue.
    const eventImage = resolveMedia(event.image || "");
    const eventFallback = categoryPlaceholderFor(place?.category) || "assets/placeholders/gallery-studio.webp";
    // Same deal-on-touchdown pattern as showPlace: the event card appears as
    // the camera lands on the venue, never while it is still in flight.
    const dealCard = () => {
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close selected event">Close</button>
      ${eventImage ? `
        <figure class="event-feature-photo">
          <img class="place-image" src="${escapeHtml(eventImage)}" alt="${escapeHtml(event.title)}" width="640" height="360" loading="lazy" decoding="async" data-fallback="${escapeHtml(eventFallback)}" data-img-fallback="event">
          ${venueLine ? `<figcaption>${escapeHtml(venueLine)}</figcaption>` : ""}
        </figure>` : ""}
      <div class="event-feature-body">
        <p class="event-feature-kicker">${escapeHtml(kicker)}</p>
        <h2>${escapeHtml(event.title)}</h2>
        ${!eventImage && venueLine ? `<p class="event-feature-venue">${escapeHtml(venueLine)}</p>` : ""}
        ${blurb ? `<p class="event-feature-blurb">${escapeHtml(blurb)}</p>` : ""}
        <div class="detail-actions event-feature-actions">
          ${event.url ? `<a href="${escapeHtml(event.url)}" target="_blank" rel="noopener">Event details</a>` : ""}
          ${place ? `<button type="button" id="event-place-jump">Show place</button>` : ""}
        </div>
        ${renderBeforeOrAfter(place)}
      </div>
    `;
    const jump = document.getElementById("event-place-jump");
    if (jump && place) jump.addEventListener("click", () => showPlace(place));
    els.detail.querySelectorAll("[data-nearby-place]").forEach((button) => {
      button.addEventListener("click", () => {
        const other = placeById(button.dataset.nearbyPlace);
        if (other) showPlace(other);
      });
    });
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", () => {
      closeSelectionDrawer();
      if (state.mode === "events") renderEventsList();
    });
    revealDetailCard();
    };
    // Critique P2-8: picking an event must also show WHERE it is — fly to the
    // venue at street level, exactly like selecting a place.
    if (place && hasCoords(place) && state.map) {
      flyToSelection([place.lng, place.lat], dealCard);
    } else {
      dealCard();
    }
    updateReviewUrl();
  }

  // Empty Events State (citizen-voiced, never a stale list or process caveat).
  // NOTE: uses .events-empty, NOT .empty-title — styles.css hides any card with
  // .empty-title via `.detail-card:has(.empty-title){display:none}`.
  // Flow-upgrade Stage 5 ("Make It A Night", honest version): the closest
  // eat/drink/shop stops to the event's venue, by plain distance. No curation
  // data exists, so this is labeled "Before or after" and nothing grander.
  function renderBeforeOrAfter(place) {
    if (!place) return "";
    const stops = state.places
      .filter((other) =>
        other.id !== place.id &&
        isPlaceMapReady(other) &&
        ["Eat, Drink & Stay", "Shops & Makers"].includes(other.category))
      .map((other) => ({
        place: other,
        dist: Math.hypot(
          (other.lng - place.lng) * Math.cos((place.lat * Math.PI) / 180),
          other.lat - place.lat,
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
      .map((entry) => entry.place);
    if (!stops.length) return "";
    return `
      <div class="place-nearby">
        <p class="section-label">Before or after</p>
        ${stops.map((other) => `
          <button class="place-nearby-link" type="button" data-nearby-place="${escapeHtml(other.id)}">
            <strong>${escapeHtml(other.name)}</strong>
            <span>${escapeHtml(other.category || "")}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function showEventsEmpty() {
    setDetailCardMode("");
    state.selectedEventId = "";
    state.selectedPlaceId = "";
    state.selectedPath = null;
    setSourceData();
    els.detail.innerHTML = `
      <p class="events-empty-title">No events listed here this week</p>
      <p class="empty-copy events-empty">Check back soon — new happenings appear here as venues add them.</p>
    `;
    revealDetailCard();
    updateReviewUrl();
  }

  function pathFeature(path) {
    return {
      type: "Feature",
      id: path.id,
      geometry: {
        type: "LineString",
        coordinates: path.stops.map((stop) => [stop.lng, stop.lat]),
      },
      properties: { id: path.id, title: path.title },
    };
  }

  function clearPathMarkers() {
    state.pathMarkers.forEach((marker) => marker.remove());
    state.pathMarkers = [];
  }

  function showPath(path) {
    expandDrawer();
    state.selectedPath = path;
    state.selectedPlaceId = "";
    state.selectedEventId = "";
    clearPathMarkers();
    setMapSourceData("paths", [pathFeature(path)]);
    path.stops.forEach((stop, index) => {
      const el = document.createElement("button");
      el.className = "path-number-marker";
      el.textContent = String(index + 1);
      el.addEventListener("click", () => {
        const place = placeById(stop.placeId);
        if (place) showPlace(place);
      });
      const marker = new maplibregl.Marker({ element: el }).setLngLat([stop.lng, stop.lat]).addTo(state.map);
      marker.getElement().setAttribute("aria-label", `Stop ${index + 1}: ${stop.name}`);
      state.pathMarkers.push(marker);
    });
    // Paths keep the un-capped zoom: a tight two-stop walk should fill the view.
    fitToPoints(path.stops);
    renderPathPanel(path);
    updateReviewUrl();
  }

  function renderPathPanel(activePath) {
    expandDrawer();
    setDetailCardMode("path");
    const thesis = activePath.thesis || activePath.dek;
    const copy = activePath.copy || "";
    els.detail.innerHTML = `
      <button class="selected-place-close path-back-action" type="button" aria-label="Back to all routes">‹ All routes</button>
      <div class="path-card-heading">
        <p class="detail-eyebrow">Walk this route</p>
        <h2>${escapeHtml(activePath.title)}</h2>
        <p class="path-thesis">${escapeHtml(thesis)}</p>
        ${copy ? `<p class="path-copy">${escapeHtml(copy)}</p>` : ""}
      </div>
      <ol class="path-stop-list">
        ${activePath.stops.map((stop) => {
          const place = placeById(stop.placeId);
          const anchor = place?.anchor || null;
          const card = place?.anchorCard || null;
          const icon = anchor ? anchorIconText(anchor) : card ? ANCHOR_ICON_TEXT[card.iconKey] || "" : "";
          const hook = anchor?.hook || card?.hook || stop.note;
          const role = anchor ? "Don't miss" : "";
          return `<li><button class="${icon ? "has-path-icon" : "no-path-icon"}${card && !anchor ? " supporting-path-stop" : ""}" type="button" data-place="${escapeHtml(stop.placeId)}">${icon ? `<span class="path-stop-icon">${escapeHtml(icon)}</span>` : ""}<span class="path-stop-copy"><strong>${escapeHtml(stop.name)}</strong><em>${escapeHtml([role, `${stop.category} / ${stop.city}`].filter(Boolean).join(" / "))}</em><small>${escapeHtml(hook)}</small></span></button></li>`;
        }).join("")}
      </ol>
    `;
    els.detail.querySelectorAll("[data-place]").forEach((button) => {
      const place = placeById(button.dataset.place);
      if (place) button.addEventListener("click", () => showPlace(place));
    });
    els.detail.querySelector(".path-back-action")?.addEventListener("click", () => {
      state.selectedPath = null;
      clearPathMarkers();
      setMapSourceData("paths", []);
      renderPathChooser();
      updateReviewUrl();
    });
    revealDetailCard();
    els.hint.innerHTML = `
      <p class="hint-title">Route selected</p>
      <p>${escapeHtml(activePath.stops.length)} numbered stops — walk them in order, or tap any stop to jump ahead.</p>
    `;
  }

  function renderPathChooser() {
    setDetailCardMode("path");
    els.hint.innerHTML = `
      <p class="hint-title">Cultural routes</p>
      <p>Four routes through the county's cultural life. Pick one to start walking.</p>
    `;
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close route list">Close</button>
      <div class="path-list">
        ${state.paths.map((path) => `
          <button class="path-button${state.selectedPath?.id === path.id ? " active" : ""}" type="button" data-path="${escapeHtml(path.id)}">
            <strong>${escapeHtml(path.title)}</strong>
            <span>${escapeHtml(path.dek)}</span>
          </button>
        `).join("")}
      </div>
    `;
    els.detail.querySelectorAll(".path-button").forEach((button) => {
      const path = state.paths.find((item) => item.id === button.dataset.path);
      button.addEventListener("click", () => showPath(path));
    });
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", closeSelectionDrawer);
    // The chooser is the content of Paths mode — opening it is the direct
    // result of the user picking the tab, so revealing the drawer is expected.
    revealDetailCard();
  }

  // ---------------------------------------------------------------------------
  // Discovery Rail (ADR 0002, variant B) — the first-load Browse Starting View
  // in rail form. Sampler doctrine order: upcoming events first (Event
  // Freshness Guarantee — state.events is already today-or-later), then
  // MUSE-Grounded Sampler places, one MUSE story card, one path card,
  // interleaved. Rail Follow ruling: on scroll-settle the map eases to the
  // centered card WITHOUT changing zoom; full fly-and-zoom only on tap. The
  // camera never moves while cards are still moving (debounced settle).
  // ---------------------------------------------------------------------------

  function niceEventDate(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric",
    });
  }

  function buildRailItems() {
    const items = [];
    const today = todayISO();
    const events = [...state.events].sort((a, b) => a.date.localeCompare(b.date));
    const samplerPlaces = state.browseSamplerPlaceIds
      .map(placeById)
      .filter((place) => place && isPlaceMapReady(place));
    const eventCard = (event) => ({
      type: "event",
      // Pass-3 typeset: the banned eyebrow row is gone. The date/recency signal
      // lives in the meta line as a weighted lead word ("Tonight" / "Sat, Jun 13"),
      // not a kicker above every card.
      when: event.date === today ? "Tonight" : niceEventDate(event.date),
      title: event.title,
      meta: event.placeName,
      // Rail cards are teasers: first sentence only. The full description
      // (fees, times, sign-up detail) stays on the event card (critique P2-10).
      desc: firstSentence(displayEventDescription(event.description || "")),
      image: resolveMedia(event.image || ""),
      lat: event.lat,
      lng: event.lng,
      event,
    });
    const placeCard = (place) => ({
      type: "place",
      // Place category moves into the meta line (voice rule: category stays
      // the place card's classifier — just no longer an eyebrow row).
      title: place.name,
      meta: `${placeKindLabel(place)} · ${place.city || "Nevada County"}`,
      desc: firstSentence(place.description || ""),
      image: resolvePlaceImage(place).src || "",
      lat: place.lat,
      lng: place.lng,
      place,
    });
    events.slice(0, 4).forEach((event) => items.push(eventCard(event)));
    samplerPlaces.slice(0, 3).forEach((place) => items.push(placeCard(place)));
    const story = state.museStories[0];
    if (story) {
      const storyPlaces = (story.placeIds || []).map(placeById).filter((place) => place && isPlaceMapReady(place));
      items.push({
        type: "story",
        title: story.title,
        meta: story.issue,
        desc: "See everywhere this story touches the map.",
        image: "",
        lat: storyPlaces[0]?.lat,
        lng: storyPlaces[0]?.lng,
        story,
      });
    }
    const path = state.paths[0];
    if (path?.stops?.length) {
      items.push({
        type: "path",
        title: path.title,
        meta: `A path to walk · ${path.stops.length} stops`,
        desc: path.dek || "",
        image: "",
        lat: path.stops[0].lat,
        lng: path.stops[0].lng,
        path,
      });
    }
    events.slice(4, 8).forEach((event) => items.push(eventCard(event)));
    samplerPlaces.slice(3).forEach((place) => items.push(placeCard(place)));
    return items;
  }

  // Poster fields (brand secondaries) stand in for missing imagery on the
  // campaign-style cards only: events, the MUSE story, the path. Imageless
  // PLACE cards stay quiet paper — they are directory entries, not campaigns.
  const RAIL_POSTER_CYCLE = ["blue", "green", "pink", "teal"];
  // Poster field for a card: the MUSE story is always ink, the path is always
  // teal, everything else cycles the brand secondaries by rail index. Shared
  // by the render-time class pick and the delegated dead-image fallback.
  function railPosterClasses(type, index) {
    const field = type === "story" ? "ink" : type === "path" ? "teal" : RAIL_POSTER_CYCLE[index % RAIL_POSTER_CYCLE.length];
    return ["rail-card-poster", `rail-card-poster-${field}`];
  }
  function railPosterClass(item, index) {
    if (item.image || item.type === "place") return "";
    return ` ${railPosterClasses(item.type, index).join(" ")}`;
  }

  // Rail delineation (P1-6): every card names its kind in one quiet chip, so
  // the mixed editorial run (events / picks / story / path) reads curated.
  // This supersedes the pass-3 "one kicker" rule for the rail surface only —
  // a pill chip, not a typeset eyebrow row.
  const RAIL_CHIP_LABELS = {
    event: "Event",
    place: "Worth a stop",
    story: "From MUSE Magazine",
    path: "A walk to take",
  };

  function railCardHtml(item, index) {
    // Accessible name is title + venue/date only — never the full description
    // essay (screen readers read the whole name per card).
    const accessibleName = `${item.title} — ${item.when ? `${item.when} · ` : ""}${item.meta}`;
    const metaLine = `${item.when ? `<strong class="rail-card-when${item.when === "Tonight" ? " is-tonight" : ""}">${escapeHtml(item.when)}</strong> · ` : ""}${escapeHtml(item.meta)}`;
    const chip = RAIL_CHIP_LABELS[item.type];
    return `
      <button class="rail-card rail-card-${escapeHtml(item.type)}${railPosterClass(item, index)}" type="button" data-rail-index="${index}" aria-label="${escapeHtml(accessibleName)}">
        ${item.image ? `<img class="rail-card-img" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" data-img-fallback="poster">` : ""}
        <span class="rail-card-body">
          ${chip ? `<span class="rail-card-chip rail-card-chip-${escapeHtml(item.type)}">${escapeHtml(chip)}</span>` : ""}
          <span class="rail-card-title">${escapeHtml(item.title)}</span>
          ${item.desc ? `<span class="rail-card-desc">${escapeHtml(item.desc)}</span>` : ""}
          <span class="rail-card-meta">${metaLine}</span>
        </span>
      </button>`;
  }

  // The rail is visible exactly when the Browse Starting View is: Places mode,
  // no search, no Outing Type filter, no Local Reveal. Searching or filtering
  // expands the full Directory Browser and retires the rail until cleared.
  function railVisible() {
    return state.mode === "places" && isBrowseStartingView() && !state.localReveal;
  }

  // The pristine Places starting view: nothing searched, filtered, revealed,
  // selected, or surprise-ringed — the state the rail expects.
  function isPristineBrowseStartingView() {
    return isBrowseStartingView()
      && !state.localReveal
      && !state.selectedPlaceId
      && !state.surprisePlaceIds.length;
  }

  // State half of the reset: clears every refinement that suppresses the rail
  // (search, Outing Type chips, Featured in MUSE, local reveal) plus any lingering
  // selection or surprise/story rings, re-syncs the search input, and closes
  // the selection drawer the same way setMode does — the pristine view never
  // shows a selection. No re-renders here, so callers that immediately run
  // setMode (the mode tabs) get exactly one render pipeline.
  function clearBrowseRefinements() {
    state.searchQuery = "";
    state.activeIntents.clear();
    state.featuredInMuseOnly = false;
    state.localReveal = null;
    state.localRevealPreviousContext = null;
    state.selectedPlaceId = "";
    state.surprisePlaceIds = [];
    if (els.search) els.search.value = "";
    state.filterListOpen = true;
    els.selectionDrawer?.classList.remove("open");
  }

  // Single source of truth for "return to the pristine Places starting view":
  // clears state via clearBrowseRefinements, then re-renders so the rail comes
  // back (markers, labels, list, detail card, and URL all reflect the pristine
  // view). Used by the visible "Show tonight's rail" reset chip and the
  // empty-state "Clear filters" button. Camera/zoom untouched.
  function resetToBrowseStartingView() {
    if (isPristineBrowseStartingView()) {
      // Nothing to clear — skip the re-renders, just keep the rail chrome
      // (body class + reset chip visibility) honest.
      els.selectionDrawer?.classList.remove("open");
      syncBrowseChrome();
      return;
    }
    clearBrowseRefinements();
    renderFilters();
    setSourceData();
    renderFeaturedAnchor();
    updateReviewUrl();
  }

  // One body class drives both halves of the first-load layout: the rail shows
  // and the left panel collapses to a compact search/filter toolbar.
  function syncBrowseChrome() {
    const visible = railVisible();
    document.body.classList.toggle("rail-browse", visible);
    if (!visible) {
      setRailFocus("");
      state.railLastFollowIndex = -1;
    }
    // The reset chip is the one-click path back to the rail: shown only when
    // we're in Places but refinements have retired the rail; hidden whenever the
    // rail is actually visible, and in every non-Places mode.
    if (els.railResetChip) {
      els.railResetChip.hidden = !(state.mode === "places" && !visible);
    }
  }

  function setRailFocus(placeId) {
    if (state.railFocusPlaceId === placeId) return;
    state.railFocusPlaceId = placeId;
    applyHoverRingFilter();
  }

  function markActiveRailCard(activeCard) {
    els.railTrack?.querySelectorAll(".rail-card").forEach((card) => {
      card.classList.toggle("active", card === activeCard);
    });
  }

  // Rail Follow: ease to the centered card's place, highlight its marker, no
  // zoom change. Runs only after scrolling settles, never mid-scroll.
  function handleRailScrollSettle() {
    if (!railVisible() || !state.map || !els.railTrack) return;
    if (state.railSuppressFollow) {
      state.railSuppressFollow = false;
      return;
    }
    const track = els.railTrack;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = null;
    let bestDistance = Infinity;
    track.querySelectorAll(".rail-card").forEach((card) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = card;
      }
    });
    if (!best) return;
    const index = Number(best.dataset.railIndex);
    if (index === state.railLastFollowIndex) return;
    state.railLastFollowIndex = index;
    markActiveRailCard(best);
    const item = state.railItems[index];
    if (!item || !hasCoords(item)) return;
    if (prefersReducedMotion()) {
      state.map.jumpTo({ center: [item.lng, item.lat] });
    } else {
      state.map.easeTo({ center: [item.lng, item.lat], duration: 650 });
    }
    setRailFocus(item.type === "place" ? item.place.id : "");
  }

  // Explicit card tap = the full fly-and-zoom plus the real selection flow.
  function activateRailCard(index, cardEl) {
    const item = state.railItems[index];
    if (!item) return;
    state.railLastFollowIndex = index;
    markActiveRailCard(cardEl);
    if (cardEl && els.railTrack) {
      // Suppress only when centering will actually scroll; an already-centered
      // card fires no scroll event, and a stale flag would eat the next settle.
      const track = els.railTrack;
      const target = Math.max(0, Math.min(
        cardEl.offsetLeft + cardEl.offsetWidth / 2 - track.clientWidth / 2,
        track.scrollWidth - track.clientWidth
      ));
      if (Math.abs(target - track.scrollLeft) > 1) state.railSuppressFollow = true;
      cardEl.scrollIntoView({ inline: "center", block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
    if (item.type === "place") {
      showPlace(item.place);
    } else if (item.type === "event") {
      // showEvent owns the selection flight (street level, card on touchdown).
      showEvent(item.event);
    } else if (item.type === "story") {
      renderStory(item.story);
    } else if (item.type === "path") {
      setMode("paths");
      showPath(item.path);
    }
  }

  // Arrows live only where they help: fine pointers (CSS hides them on touch),
  // and only while the track actually overflows. Ends fade as they're reached.
  function syncRailArrows() {
    const track = els.railTrack;
    if (!track || !els.railArrowPrev || !els.railArrowNext) return;
    const overflowing = track.scrollWidth > track.clientWidth + 1;
    els.railArrowPrev.hidden = !overflowing;
    els.railArrowNext.hidden = !overflowing;
    if (!overflowing) return;
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    els.railArrowPrev.classList.toggle("is-end", track.scrollLeft <= 1);
    els.railArrowNext.classList.toggle("is-end", track.scrollLeft >= maxScroll);
  }

  function renderDiscoveryRail() {
    if (!els.railTrack) return;
    const filter = state.railFilter;
    const visibleItems = state.railItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => filter === "all" || item.type === filter);
    if (els.railTrack.scrollLeft !== 0) {
      // Rebuilding the track resets scroll and fires a settle; that move is
      // ours, not the user's. Flag it before the innerHTML swap clamps scroll.
      state.railSuppressFollow = true;
    }
    if (!visibleItems.length) {
      // Empty Events State pattern: invite a return, never expose machinery.
      const copy = filter === "event"
        ? "No events listed here this week — check back soon."
        : "Nothing to browse here yet — check back soon.";
      els.railTrack.innerHTML = `<div class="rail-empty">${escapeHtml(copy)}</div>`;
    } else {
      els.railTrack.innerHTML = visibleItems.map(({ item, index }) => railCardHtml(item, index)).join("");
    }
    els.railTrack.scrollLeft = 0;
    state.railLastFollowIndex = -1;
    els.railTrack.querySelectorAll("[data-rail-index]").forEach((card) => {
      card.addEventListener("click", () => activateRailCard(Number(card.dataset.railIndex), card));
    });
    syncRailArrows();
  }

  function initDiscoveryRail() {
    if (!els.rail || !els.railTrack) return;
    state.railItems = buildRailItems();
    renderDiscoveryRail();
    // Keyboard path (P2 carry-along): Left/Right arrows walk the rail without
    // leaving the keyboard. Focus moves to the card button itself, so the
    // existing focus ring shows and the card's aria-label is announced for
    // free; Enter/Space then activates it like a click. Tab order untouched.
    els.railTrack.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const cards = Array.from(els.railTrack.querySelectorAll(".rail-card"));
      if (!cards.length) return;
      event.preventDefault();
      const current = cards.indexOf(document.activeElement);
      const next = current === -1
        ? (event.key === "ArrowRight" ? 0 : cards.length - 1)
        : Math.max(0, Math.min(cards.length - 1, current + (event.key === "ArrowRight" ? 1 : -1)));
      const card = cards[next];
      card.focus({ preventScroll: true });
      // Centering scrolls the track; the existing settle handler then runs the
      // Rail Follow (active card + map ease) exactly as it does for touch.
      card.scrollIntoView({ inline: "center", block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
    // Mouse path (P1-6): the OS scrollbar is hidden by design, so a vertical
    // wheel is the only scroll gesture most mouse users will try. Translate it
    // to horizontal travel; trackpads keep their native horizontal swipe
    // (skipped when deltaX dominates).
    els.railTrack.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const track = els.railTrack;
      if (track.scrollWidth <= track.clientWidth) return;
      // deltaMode 1 = lines (Firefox wheel); normalize to ~pixels.
      track.scrollLeft += event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY;
      event.preventDefault();
    }, { passive: false });
    let settleTimer;
    els.railTrack.addEventListener("scroll", () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(handleRailScrollSettle, 180);
      syncRailArrows();
    }, { passive: true });
    [[els.railArrowPrev, -1], [els.railArrowNext, 1]].forEach(([arrow, direction]) => {
      arrow?.addEventListener("click", () => {
        const track = els.railTrack;
        track.scrollBy({
          left: direction * track.clientWidth * 0.8,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      });
    });
    window.addEventListener("resize", syncRailArrows);
    els.rail.querySelectorAll("[data-rail-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.railFilter = chip.dataset.railFilter;
        els.rail.querySelectorAll("[data-rail-filter]").forEach((other) => {
          other.classList.toggle("on", other === chip);
        });
        renderDiscoveryRail();
      });
    });
    syncBrowseChrome();
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.mapMode = mode;
    if (mode !== "places") state.selectedPlaceId = "";
    if (mode !== "places") state.searchQuery = "";
    if (mode !== "paths") state.selectedPath = null;
    if (mode !== "events") state.selectedEventId = "";
    if (els.search) els.search.value = state.searchQuery;
    syncModeTabs(mode);
    // Switching modes always closes the drawer — it must never auto-open
    // without a user selection (on mobile it covers the whole control panel).
    els.selectionDrawer?.classList.remove("open");
    clearPathMarkers();
    setMapSourceData("paths", []);
    ["event-hit-target", "event-halo", "event-points"].forEach((layerId) => {
      setMapLayerVisibility(layerId, mode === "events" ? "visible" : "none");
    });
    const reviewTools = document.getElementById("review-tools");
    if (reviewTools) reviewTools.style.display = mode === "events" ? "none" : "";
    if (mode === "events") {
      if (state.events.length) {
        els.hint.innerHTML = `<p class="hint-title">Events on the map</p><p>Pick an event from the list, or tap a red diamond on the map.</p>`;
        renderEventsList();
      } else {
        els.hint.innerHTML = `<p class="hint-title">No events listed here this week</p><p>Check back soon — new happenings appear here as venues add them.</p>`;
        els.filters.innerHTML = "";
      }
    } else if (mode === "paths") {
      renderFilters();
      renderPathChooser();
    } else {
      renderFilters();
      renderFeaturedAnchor();
    }
    setSourceData();
    ensureModeContentVisible(mode);
    updateReviewUrl();
  }

  // Critique P0-2 ("the stranded viewport"): a story lens or selection can
  // leave the camera over Tahoe or empty forest. On mode change, if none of
  // the new mode's content is in view, bring the camera home to the initial
  // county view — a mode must never open looking at nothing.
  function ensureModeContentVisible(mode) {
    if (!state.map) return;
    const points = mode === "events"
      ? state.events.map((event) => placeById(event.placeId)).filter((place) => place && hasCoords(place))
      : mode === "paths"
        ? state.paths.flatMap((path) => path.stops || []).filter(hasCoords)
        : state.places.filter(isPlaceMapReady);
    if (!points.length) return;
    const bounds = state.map.getBounds();
    if (points.some((point) => bounds.contains([point.lng, point.lat]))) return;
    const view = isMobileViewport() ? MOBILE_INITIAL_MAP_VIEW : DESKTOP_INITIAL_MAP_VIEW;
    if (prefersReducedMotion()) state.map.jumpTo(view);
    else state.map.easeTo({ ...view, duration: 800 });
  }

  function applyInitialReviewState() {
    if (!window.V1ReviewState) {
      renderFeaturedAnchor();
      return;
    }
    const reviewState = window.V1ReviewState.parse(window.location.search);
    const validIntents = new Set(OUTING_TYPES.map((outingType) => outingType.label));
    state.activeIntents = new Set(reviewState.intents.filter((intent) => validIntents.has(intent)));
    state.isApplyingReviewState = true;
    setMode(reviewState.mode || "places");
    if (state.mode === "paths" && reviewState.path) {
      const path = state.paths.find((item) => item.id === reviewState.path);
      if (path) showPath(path);
    } else if (state.mode === "events" && reviewState.event) {
      const event = state.events.find((item) => item.id === reviewState.event);
      if (event) showEvent(event);
    } else if (state.mode === "places" && reviewState.place) {
      const visibleIds = new Set(filteredPlaces().map((place) => place.id));
      const place = state.places.find((item) => item.id === reviewState.place && visibleIds.has(item.id));
      if (place) showPlace(place);
    }
    state.isApplyingReviewState = false;
    updateReviewUrl();
  }

  // Warmth pass 4 (cla-65): retint the Liberty basemap to the brand's warm
  // paper world. Iterates a style's actual layer list and matches by
  // source-layer + id pattern (Liberty ids like road_minor / bridge_motorway_casing /
  // landcover_wood), so a tile-style update can't strand a hardcoded id. Only
  // plain color strings are written — no new expressions, so nothing here can
  // invalidate a layer's paint and silently drop it. App-owned layers (places,
  // events, paths sources) are added after this runs and are never touched.
  //
  // F10 (cla-71): the palette + matching logic lives here once, decoupled from
  // HOW the edits land. `ops.paint(layer, prop, value)` / `ops.layout(...)`
  // either mutate a raw style object before the Map is constructed (happy
  // path: warm first paint, no stock-Liberty flash) or drive
  // setPaintProperty/setLayoutProperty on a live map (degraded path when the
  // style fetch fails). Same values either way — only WHEN they apply differs.
  function warmBasemapEdits(layers, ops) {
    const W = WARM_BASEMAP;
    (layers || []).forEach((layer) => {
      const id = layer.id;
      const sourceLayer = layer["source-layer"] || "";
      const paint = (property, value) => ops.paint(layer, property, value);
      if (layer.type === "background") {
        paint("background-color", W.background);
        return;
      }
      if (layer.type === "fill") {
        if (sourceLayer === "water") paint("fill-color", W.water);
        else if (sourceLayer === "park") {
          paint("fill-color", W.parkFill);
          // Liberty draws a saturated green outline on the park fill itself.
          paint("fill-outline-color", W.parkOutline);
        }
        else if (sourceLayer === "landcover") {
          const tone = id.includes("wood") ? W.wood
            : id.includes("wetland") ? W.wetland
            : id.includes("ice") ? W.ice
            : id.includes("sand") ? W.sand
            : W.grass;
          paint("fill-color", tone);
        } else if (sourceLayer === "landuse") {
          paint("fill-color", id.includes("residential") ? W.residential : W.landuse);
        } else if (sourceLayer === "building") {
          paint("fill-color", W.building);
          paint("fill-outline-color", W.buildingOutline);
        } else if (sourceLayer === "aeroway") {
          paint("fill-color", W.aeroway);
        }
        return;
      }
      if (layer.type === "fill-extrusion" && sourceLayer === "building") {
        paint("fill-extrusion-color", W.building);
        return;
      }
      if (layer.type === "line") {
        if (sourceLayer === "waterway") paint("line-color", W.water);
        else if (sourceLayer === "boundary") paint("line-color", W.boundary);
        else if (sourceLayer === "park") {
          // Park outlines tile the whole county at low zoom; keep them barely-there.
          paint("line-color", W.parkOutline);
          paint("line-opacity", 0.5);
        }
        else if (sourceLayer === "aeroway") paint("line-color", W.roadCasing);
        else if (sourceLayer === "transportation") {
          // Quiet warm road ramp; hierarchy survives as value steps, not hue.
          const tone = /rail/.test(id) ? W.rail
            : /path|pedestrian/.test(id) ? (id.includes("casing") ? W.roadCasing : W.path)
            : /casing/.test(id) ? (/motorway|trunk_primary/.test(id) ? W.majorCasing : W.roadCasing)
            : /motorway/.test(id) ? W.motorway
            : /trunk_primary/.test(id) ? W.trunkPrimary
            : /secondary_tertiary/.test(id) ? W.secondaryTertiary
            : W.minor;
          paint("line-color", tone);
        }
        return;
      }
      if (layer.type === "symbol") {
        // Density cut: footpath names and one-way arrows are tile noise here.
        // (Business POIs are already hidden by hideBasemapPoiLayers.)
        if (id === "highway-name-path" || id.startsWith("road_one_way")) {
          ops.layout(layer, "visibility", "none");
          return;
        }
        if (sourceLayer === "place") {
          paint("text-color", W.placeLabel);
          paint("text-halo-color", W.labelHalo);
        } else if (sourceLayer === "transportation_name" && !id.includes("shield")) {
          paint("text-color", W.roadLabel);
          paint("text-halo-color", W.labelHalo);
        } else if (sourceLayer === "water_name" || sourceLayer === "waterway") {
          paint("text-color", W.waterLabel);
          paint("text-halo-color", W.labelHalo);
        } else if (sourceLayer === "aerodrome_label") {
          paint("text-color", W.roadLabel);
          paint("text-halo-color", W.labelHalo);
        }
      }
    });
  }

  // Happy path: mutate the fetched Liberty style JSON in place, before the
  // Map constructor ever sees it — the first painted frame is already warm.
  function warmStyleObject(style) {
    warmBasemapEdits(style.layers, {
      paint: (layer, property, value) => {
        (layer.paint || (layer.paint = {}))[property] = value;
      },
      layout: (layer, property, value) => {
        (layer.layout || (layer.layout = {}))[property] = value;
      },
    });
    return style;
  }

  // Degraded path (style fetch failed, Map constructed from the URL): retint
  // the live map on "load" — the pre-F10 behavior, kept as the fallback.
  function applyWarmBasemap() {
    if (!state.map) return;
    const map = state.map;
    warmBasemapEdits(map.getStyle().layers, {
      paint: (layer, property, value) => map.setPaintProperty(layer.id, property, value),
      layout: (layer, property, value) => map.setLayoutProperty(layer.id, property, value),
    });
  }

  // CLA-27: the Liberty street basemap ships its own OSM business POIs (source-layer
  // "poi"), which are stale/incomplete. Suppress them so our place dots are the single
  // source of truth. Town/place labels, street names, and highway shields stay visible.
  function hideBasemapPoiLayers() {
    if (!state.map) return;
    (state.map.getStyle().layers || []).forEach((layer) => {
      if (layer.type === "symbol" && layer["source-layer"] === "poi") {
        state.map.setLayoutProperty(layer.id, "visibility", "none");
      }
    });
  }

  function addEventDiamondImage() {
    if (!state.map || state.map.hasImage("event-diamond")) return;
    const size = 48;
    const center = size / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.save();
    context.translate(center, center + 1);
    context.rotate(Math.PI / 4);
    context.shadowColor = "rgba(26,26,46,0.24)";
    context.shadowBlur = 5;
    context.shadowOffsetY = 2;
    context.fillStyle = MARKERS.red;
    context.strokeStyle = MARKERS.paper;
    context.lineWidth = 5;
    context.beginPath();
    context.rect(-10, -10, 20, 20);
    context.fill();
    context.stroke();
    context.shadowColor = "rgba(0,0,0,0)";
    context.strokeStyle = MARKERS.ink;
    context.lineWidth = 1.4;
    context.stroke();
    context.restore();

    state.map.addImage("event-diamond", context.getImageData(0, 0, size, size), { pixelRatio: 2 });
  }

  function addMapLayers() {
    addEventDiamondImage();
    state.map.addSource("local-reveal-area", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    state.map.addLayer({
      id: "local-reveal-area",
      type: "circle",
      source: "local-reveal-area",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 7, 26, 12, 48, 15, 72],
        "circle-color": "rgba(255,46,0,0.12)",
        "circle-stroke-color": MARKERS.red,
        "circle-stroke-width": 2,
        "circle-stroke-opacity": 0.78,
      },
    });

    state.map.addSource("places", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    state.map.addLayer({
      id: "place-density",
      type: "circle",
      source: "places",
      paint: {
        "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          7, ["case", ["get", "denseConstellation"], ["interpolate", ["linear"], ["get", "nearbyDensity"], 8, 5.5, 18, 7.8, 36, 10.8], 3.8],
          11, ["case", ["get", "denseConstellation"], ["interpolate", ["linear"], ["get", "nearbyDensity"], 8, 5.5, 18, 7.8, 36, 10.8], 5],
          14, ["case", ["get", "denseConstellation"], ["interpolate", ["linear"], ["get", "nearbyDensity"], 8, 5.5, 18, 7.8, 36, 10.8], 6]
        ],
        "circle-color": CATEGORY_COLOR,
        // Flow-upgrade Stage 1: ordinary dots stay recessive at county zoom so
        // the labeled anchors carry the first impression; they ramp to full
        // presence as the visitor zooms into a town.
        "circle-opacity": [
          "interpolate", ["linear"], ["zoom"],
          9.75, [
            "case",
            ["any", ["get", "anchor"], ["get", "featured"], ["get", "selected"]], 0.9,
            ["get", "denseConstellation"], 0.1,
            0.22
          ],
          11.75, [
            "case",
            ["get", "denseConstellation"], 0.32,
            ["get", "currentContext"], 0.82,
            ["get", "sampler"], 0.78,
            0.72
          ]
        ],
        "circle-blur": ["case", ["get", "denseConstellation"], 0.18, 0],
        "circle-stroke-color": MARKERS.paper,
        "circle-stroke-width": [
          "interpolate", ["linear"], ["zoom"],
          7, ["case", ["get", "denseConstellation"], 0, 1],
          12, ["case", ["get", "denseConstellation"], 0, 1.4]
        ],
      },
    });
    state.map.addLayer({
      id: "place-selection-halo",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["get", "selected"]],
      paint: {
        "circle-radius": 15,
        "circle-color": "rgba(255,46,0,0.14)",
        "circle-blur": 0.35,
      },
    });
    state.map.addLayer({
      id: "place-points",
      type: "circle",
      source: "places",
      filter: ["any", ["get", "selected"], ["get", "anchor"], ["get", "featured"]],
      paint: {
        "circle-radius": [
          "case",
          ["get", "selected"], 9.5,
          ["get", "anchor"], 8,
          ["get", "featured"], 7.5,
          5.5
        ],
        // CLA-34: fill encodes outing group (category color), for anchors/featured
        // and the selected place alike. Selection is signaled by the red
        // place-selection-ring plus a thicker white stroke below — red means
        // "your pick" and nothing else (anchors wear quiet ink, halos plum).
        "circle-color": CATEGORY_COLOR,
        "circle-opacity": 1,
        "circle-stroke-color": MARKERS.paper,
        "circle-stroke-width": ["case", ["get", "selected"], 3, 1.4],
      },
    });
    // Flow-upgrade Stage 1: places with an upcoming event carry a soft "live"
    // halo in every mode — the map signals now-ness without the visitor having
    // to open Events mode. Plum (the Events group color), NOT red: red means
    // "you selected this" and nothing else (critique P0-1 ruling).
    state.map.addLayer({
      id: "place-live-halo",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["get", "hasEvent"]],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 9, 13, 13],
        "circle-color": MARKERS.plumHalo,
        "circle-blur": 0.45,
        "circle-stroke-color": MARKERS.plum,
        "circle-stroke-width": 1.1,
        "circle-stroke-opacity": 0.55,
      },
    });
    // Flow-upgrade Stage 5: dashed ink rings highlight the current "Surprise
    // me nearby" picks without stealing red from live/selected.
    state.map.addLayer({
      id: "surprise-rings",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["get", "surprise"]],
      paint: {
        "circle-radius": 12,
        "circle-color": "rgba(255,255,255,0)",
        "circle-stroke-color": MARKERS.ink,
        "circle-stroke-width": 2,
        "circle-opacity": 0.9,
      },
    });
    state.map.addLayer({
      id: "place-hover-ring",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "id"], " "]],
      paint: {
        "circle-radius": 11,
        "circle-color": "rgba(255,46,0,0.14)",
        "circle-stroke-color": MARKERS.red,
        "circle-stroke-width": 2,
        "circle-opacity": 1,
      },
    });
    // Critique P0-1 red ruling (2026-06-12): red belongs to the user's click.
    // The curated-anchor Soft Ring is now quiet ink — editorial emphasis reads
    // as size + persistent label + this hairline, never as "did I select that?"
    state.map.addLayer({
      id: "anchor-rings",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["any", ["get", "anchor"], ["get", "featured"]]],
      paint: {
        "circle-radius": ["case", ["get", "anchor"], 12, 10],
        "circle-color": "rgba(255,255,255,0)",
        "circle-stroke-color": MARKERS.ink,
        "circle-stroke-width": 1.4,
        "circle-stroke-opacity": 0.55,
      },
    });
    state.map.addLayer({
      id: "place-selection-ring",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["get", "selected"]],
      paint: {
        "circle-radius": 14,
        "circle-color": "rgba(255,255,255,0)",
        "circle-stroke-color": MARKERS.red,
        "circle-stroke-width": 3.2,
        "circle-opacity": 1,
      },
    });
    state.map.addSource("events", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    state.map.addLayer({
      id: "event-halo",
      type: "circle",
      source: "events",
      layout: { visibility: "none" },
      filter: ["get", "selected"],
      paint: {
        "circle-radius": 16,
        "circle-color": "rgba(26,26,46,0.16)",
        "circle-blur": 0.25,
      },
    });
    state.map.addLayer({
      id: "event-hit-target",
      type: "circle",
      source: "events",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": 22,
        "circle-color": MARKERS.red,
        "circle-opacity": 0,
      },
    });
    state.map.addLayer({
      id: "event-points",
      type: "symbol",
      source: "events",
      layout: {
        visibility: "none",
        "icon-image": "event-diamond",
        "icon-size": ["case", ["get", "selected"], 1.18, 0.92],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });

    state.map.addSource("paths", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    state.map.addLayer({
      id: "path-line",
      type: "line",
      source: "paths",
      paint: {
        "line-color": MARKERS.red,
        "line-width": 1.8,
        "line-opacity": 0.45,
        "line-dasharray": [1, 2.5],
      },
    });

    const showPlaceFromFeature = (event) => {
      hideMarkerPreview();
      const id = event.features[0].properties.id;
      const place = placeById(id);
      if (place) showPlace(place);
    };
    state.map.on("click", "place-density", showPlaceFromFeature);
    state.map.on("click", "place-points", showPlaceFromFeature);
    state.map.on("click", "anchor-rings", showPlaceFromFeature);
    const showEventFromFeature = (event) => {
      const id = event.features?.[0]?.properties?.id;
      const eventItem = state.events.find((item) => item.id === id);
      if (eventItem) showEvent(eventItem);
    };
    state.map.on("click", "event-hit-target", showEventFromFeature);
    state.map.on("click", "event-points", showEventFromFeature);
    ["place-points", "anchor-rings"].forEach((layer) => {
      state.map.on("mouseenter", layer, (event) => {
        state.map.getCanvas().style.cursor = "pointer";
        showMarkerPreview(event);
      });
      state.map.on("mousemove", layer, showMarkerPreview);
      state.map.on("mouseleave", layer, () => {
        state.map.getCanvas().style.cursor = "";
        hideMarkerPreview();
      });
    });
    state.map.on("mouseenter", "place-density", (event) => {
      state.map.getCanvas().style.cursor = "pointer";
      showMarkerPreview(event);
    });
    state.map.on("mousemove", "place-density", showMarkerPreview);
    state.map.on("mouseleave", "place-density", () => {
      state.map.getCanvas().style.cursor = "";
      hideMarkerPreview();
    });
    ["event-hit-target", "event-points"].forEach((layer) => {
      state.map.on("mouseenter", layer, () => { state.map.getCanvas().style.cursor = "pointer"; });
      state.map.on("mouseleave", layer, () => { state.map.getCanvas().style.cursor = ""; });
    });
  }

  async function init() {
    const [places, events, paths, anchorCards, museEvidence, museSampler, museStories, warmStyle] = await Promise.all([
      fetch(DATA.places).then((r) => r.json()),
      fetch(DATA.events).then((r) => r.json()),
      fetch(DATA.paths).then((r) => r.json()),
      fetch(DATA.anchorCards).then((r) => r.json()).catch(() => []),
      fetch(DATA.museEvidence).then((r) => r.json()).catch(() => ({ links: [] })),
      fetch(DATA.museSampler).then((r) => r.json()).catch(() => ({ showcaseSampler: [] })),
      fetch(DATA.museStories).then((r) => r.json()).catch(() => ({ stories: [] })),
      // F10: pre-fetch the Liberty style and retint it BEFORE the Map is
      // constructed, so the first painted frame is already warm paper — no
      // stock-Liberty flash, no ~200-call setPaintProperty burst on load.
      // Any failure degrades to the pre-F10 path: URL style + retint on load.
      fetch(STREET_BASEMAP_STYLE)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`style fetch ${r.status}`))))
        .then((style) => warmStyleObject(style))
        .catch(() => null),
    ]);
    state.anchorCards = Array.isArray(anchorCards) ? anchorCards : [];
    state.museStories = museStories.stories || [];
    // Featured-in-MUSE membership: exact article links only (owner ruling).
    state.museFeaturedIds = new Set(state.museStories.flatMap((story) => story.placeIds || []));
    state.museEvidenceByPlace = buildDirectMuseEvidenceByPlace(museEvidence);
    state.browseSamplerPlaceIds = (museSampler.showcaseSampler || museSampler.recommendedSampler || [])
      .map((place) => place.id)
      .filter(Boolean);
    state.places = applyAnchorCards(places, state.anchorCards);
    // Belt-and-suspenders Event Freshness Guarantee: the transform pre-filters
    // to date>=today, but a same-day boundary or a hand-edited file could still
    // carry a past event. Filtering here makes "Upcoming event" true by
    // construction everywhere state.events is read (markers, count, related).
    state.events = upcomingEvents(events);
    state.eventPlaceIds = new Set(state.events.map((event) => event.placeId).filter(Boolean));
    state.paths = paths;
    state.placeIndex = V1PlaceData.buildPlaceIndex(state.places);

    // Dev-mode data integrity check (Canonical Place collisions, duplicate ids,
    // invalid image kinds, map-ready places missing coordinates). Surfaced as a
    // single grouped warning; never throws, never affects render.
    if (/[?&]debug=data/.test(location.search)) {
      const problems = V1PlaceData.findPlaceDataProblems(state.places);
      if (problems.length) {
        console.warn(`[place-data] ${problems.length} data problems found:`, problems);
      } else {
        console.info("[place-data] no data problems found");
      }
    }

    renderFilters();
    state.basemapPretinted = Boolean(warmStyle);
    if (!state.basemapPretinted) {
      console.warn("[basemap] style fetch failed — constructing from URL, retint deferred to load");
    }
    state.map = new maplibregl.Map({
      container: "map",
      style: warmStyle || STREET_BASEMAP_STYLE,
      center: isMobileViewport() ? MOBILE_INITIAL_MAP_VIEW.center : DESKTOP_INITIAL_MAP_VIEW.center,
      zoom: isMobileViewport() ? MOBILE_INITIAL_MAP_VIEW.zoom : DESKTOP_INITIAL_MAP_VIEW.zoom,
      // Attribution sits bottom-left so the legend (bottom-right) never clips it.
      attributionControl: false,
    });
    // Contract/debug seam: with any ?contract= param the map instance is
    // reachable for the CDP contract suites (marker-hierarchy, CLA-33)
    // without the fragile constructor-wrap init script.
    if (new URLSearchParams(window.location.search).has("contract")) {
      window.__map = state.map;
      // F10 contract seam: lets the verifier confirm the constructor received
      // a pre-tinted style OBJECT (true) vs the degraded URL path (false).
      window.__basemapPretinted = state.basemapPretinted;
    }
    state.map.addControl(new maplibregl.AttributionControl(), "bottom-left");
    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    state.map.on("load", () => {
      // Happy path: the style object was retinted before construction, so the
      // load-time setPaintProperty burst is skipped entirely.
      if (!state.basemapPretinted) applyWarmBasemap();
      hideBasemapPoiLayers();
      addMapLayers();
      setSourceData();
      applyInitialReviewState();
      initDiscoveryRail();
    });

    state.map.on("moveend", updateSmartLabels);
    state.map.on("zoomend", updateSmartLabels);

    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const mode = tab.dataset.mode;
        // Re-entering Places — whether refined-in-place or arriving from
        // another mode — resets to the pristine starting view so the rail
        // returns. Refinements are cleared *before* the single setMode call so
        // the render pipeline (filters, anchor, source data, URL) runs exactly
        // once per click; an already-pristine Places click is a no-op.
        if (mode === "places") {
          if (state.mode === "places" && isPristineBrowseStartingView()) {
            syncBrowseChrome();
            return;
          }
          clearBrowseRefinements();
        }
        setMode(mode);
      });
    });

    els.railResetChip?.addEventListener("click", () => {
      resetToBrowseStartingView();
    });

    const navToggle = document.querySelector(".nav-toggle");
    const siteHeader = document.querySelector(".site-header");
    if (navToggle && siteHeader) {
      navToggle.addEventListener("click", () => {
        const open = siteHeader.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
    }

    els.search?.addEventListener("input", () => {
      state.localReveal = null;
      state.localRevealPreviousContext = null;
      state.searchQuery = els.search.value;
      setLocalRevealSourceData();
      renderPlacesList();
    });

    const drawerToggle = document.getElementById("drawer-toggle");
    const controlPanel = document.querySelector(".control-panel");
    if (drawerToggle && controlPanel) {
      drawerToggle.addEventListener("click", () => {
        controlPanel.classList.toggle("collapsed");
      });
    }
  }

  init().catch((error) => {
    setDetailCardMode("");
    console.error("V1 Discovery Map failed to load data:", error);
    els.detail.innerHTML = `<p class="empty-title">We couldn't load the map data</p><p class="empty-copy">Please refresh the page to try again.</p>`;
  });
})();
