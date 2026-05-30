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
  };

  const MARKERS = {
    place: "#1a1a2e",
    quiet: "#5d625b",
    red: "#ff2e00",
    paper: "#ffffff",
    ink: "#1a1a2e",
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
  // The QUIET_BASEMAP palette + applyCustomBasemapStyling() below are retained for the
  // legacy Positron quiet base but are NOT applied to the street basemap.
  const STREET_BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

  const QUIET_BASEMAP = {
    standard: {
      background: "#f4f5f1",
      water: "#e1e7e3",
      waterLine: "#d4ddd8",
      landcover: "#eef1ec",
      landuse: "#f0f2ee",
      residential: "#f5f6f3",
      park: "#e7eee5",
      building: "#e7e8e2",
      buildingTop: "#eff0eb",
      roadCaseOpacity: 0.1,
      roadFillOpacity: 0.34,
    },
    twilight: {
      background: "#eff1ed",
      water: "#dbe3de",
      waterLine: "#cfd9d3",
      landcover: "#e8ede7",
      landuse: "#ecefeb",
      residential: "#f1f3f0",
      park: "#dde8dd",
      building: "#dedfd8",
      buildingTop: "#e8e9e4",
      roadCaseOpacity: 0.08,
      roadFillOpacity: 0.22,
    },
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
    "MUSE Picks": "assets/category-placeholders-ncac/muse-picks.png",
    "Performing Arts": "assets/category-placeholders-ncac/performing-arts.png",
    "Public Art": "assets/category-placeholders-ncac/public-art.png",
    "Shops & Makers": "assets/category-placeholders-ncac/shops-makers.png",
    "Walks & Trails": "assets/category-placeholders-ncac/walks-trails.png",
  };

  const OUTING_TYPES = [
    {
      label: "Art",
      matchCategories: ["Arts Organizations", "Creative Services", "Galleries & Studios", "MUSE Picks", "Public Art"],
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
    browseSamplerPlaceIds: [],
    selectedPath: null,
    selectedPlaceId: "",
    selectedEventId: "",
    searchQuery: "",
    localReveal: null,
    localRevealPreviousContext: null,
    isApplyingReviewState: false,
    map: null,
    markerPreviewPopup: null,
    previewPlaceId: "",
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
  };

  // CLA-42: when the OS requests reduced motion, swap MapLibre's animated camera
  // moves (flyTo/fitBounds) for instant ones. CSS handles the rest (see styles.css).
  function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
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
        musePick: Boolean(place.musePick),
        anchor: Boolean(place.anchor),
        markerTier: place.markerTier || "map-ready",
        candidate: place.markerTier === "candidate",
        sampler: state.browseSamplerPlaceIds.includes(place.id),
        currentContext: isCurrentContextPlace(place),
        localReveal: Boolean(state.localReveal?.placeIds?.includes(place.id)),
        nearbyDensity: nearbyDensity,
        denseConstellation: denseConstellation,
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

  // Repaint the hovered dot red (lightweight setFilter, no source rebuild) and
  // refresh smart labels so the previewed place gets a label.
  function refreshHoverState(previousPreviewId) {
    if (state.map && state.map.getLayer("place-hover-ring")) {
      state.map.setFilter("place-hover-ring", [
        "all", ["!", ["has", "point_count"]], ["==", ["get", "id"], state.previewPlaceId || " "],
      ]);
    }
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
    if (!state.activeIntents.size) return state.places;
    const activeOutingTypes = [...state.activeIntents].map(outingTypeFor).filter(Boolean);
    return state.places.filter((place) => activeOutingTypes.some((outingType) => placeMatchesOutingType(place, outingType)));
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
      Number.isFinite(candidate.lng) &&
      Number.isFinite(candidate.lat) &&
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
    return state.mode === "places" && !state.searchQuery.trim() && !state.activeIntents.size;
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
          ${state.activeIntents.size ? `<button class="filter-chip" type="button" id="clear-place-filters">Clear filters</button>` : ""}
        </div>
      `;
      els.placesList.querySelector("#clear-place-filters")?.addEventListener("click", () => {
        state.activeIntents.clear();
        renderFilters();
        setSourceData();
        renderFeaturedAnchor();
        updateReviewUrl();
      });
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

    const events = state.mode === "events" ? state.events.map(eventToFeature) : [];
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
    if (!Number.isFinite(origin.lng) || !Number.isFinite(origin.lat)) return;
    if (!state.localRevealPreviousContext) {
      state.localRevealPreviousContext = {
        searchQuery: state.searchQuery,
        activeIntents: [...state.activeIntents],
        selectedPlaceId: state.selectedPlaceId,
      };
    }
    const places = filteredPlaces()
      .filter((place) => Number.isFinite(place.lng) && Number.isFinite(place.lat))
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
    if (f.musePick) return 4;
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
    if (!state.labelsActive) return;

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
        const musePick = Boolean(place.musePick);
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
          musePick,
          sampler,
          currentContext,
          selected,
          previewed,
          importanceTier: importanceTier({ selected, previewed, isAnchor, featured, musePick, sampler, currentContext }),
          centerDistance,
          nearbyDensity,
          screenPos,
        };
      })
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
  }

  function closeSelectionDrawer() {
    els.selectionDrawer?.classList.remove("open");
    state.selectedPlaceId = "";
    state.selectedEventId = "";
    setDetailCardMode("");
    els.detail.innerHTML = `<p class="empty-title">Select a place</p><p class="empty-copy">Choose another place from the Directory Browser to reopen details.</p>`;
    if (state.map) setSourceData();
    updateReviewUrl();
  }

  function revealDetailCard() {
    openSelectionDrawer();
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
            <span class="outing-browse-title">Browse by outing type</span>
            ${hasActive ? `<button class="outing-done" type="button" data-outing-done>Done</button>` : ""}
          </div>
          <div class="outing-list" role="group" aria-label="Outing types">${rows}</div>
        </div>`;
    } else {
      const pills = activeIntents.map((outingType) => `
        <button class="outing-pill" type="button" data-outing-remove="${escapeHtml(outingType.label)}" aria-label="Remove ${escapeHtml(outingType.label)} filter">
          <span>${escapeHtml(outingType.label)}</span><span class="outing-pill-x" aria-hidden="true">✕</span>
        </button>`).join("");
      els.filters.innerHTML = `
        <div class="outing-active-bar">
          ${pills}
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

  function setDetailCardMode(mode) {
    els.detail.classList.toggle("primary-anchor-card", mode === "primary-anchor");
    els.detail.classList.toggle("supporting-stop-card", mode === "supporting-stop");
    els.detail.classList.toggle("path-detail-card", mode === "path");
  }

  function resolvePlaceImage(place) {
    return V1PlaceData.resolvePlaceImage(place, {
      resolveMedia,
      categoryPlaceholderFor,
      defaultPlaceholder: "assets/placeholders/gallery-studio.webp",
    });
  }

  function renderImage(place, options = {}) {
    const imageLabel = options.imageLabel || options.proofLabel || "";
    const proofLabel = imageLabel ? `<span class="image-proof-label">${escapeHtml(imageLabel)}</span>` : "";
    const resolved = resolvePlaceImage(place);
    if (resolved.isRealImage) {
      return `
        <figure class="place-image-frame">
          ${proofLabel}
          <img class="place-image" src="${escapeHtml(resolved.src)}" alt="${escapeHtml(resolved.alt || place.name)}" width="640" height="360" loading="lazy" decoding="async">
          ${resolved.credit ? `<figcaption>${escapeHtml(resolved.credit)}</figcaption>` : ""}
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

  function directoryRecordMeta(place) {
    const rows = [
      place.address ? ["Address", escapeHtml(place.address)] : null,
      place.phone ? ["Phone", `<a href="tel:${escapeHtml(place.phone.replace(/[^0-9+]/g, ""))}">${escapeHtml(place.phone)}</a>`] : null,
      place.website ? ["Website", `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">Open website</a>`] : null,
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

  function renderLocationCaveat(place) {
    if (!place.locationCaveat) return "";
    return `<p class="location-caveat">${escapeHtml(place.locationCaveat)}</p>`;
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
    setDetailCardMode("");
    if (!place) {
      els.hint.innerHTML = `<p class="hint-title">No places match this Outing Type</p><p>Try another broad outing lane to bring places back onto the map.</p>`;
      els.detail.innerHTML = `<p class="empty-title">No matching places</p><p class="empty-copy">The active filter does not currently match any mapped places.</p>`;
      return;
    }
    els.hint.innerHTML = `<p class="hint-title">Outing Type selected</p><p>${escapeHtml(places.length)} places match ${escapeHtml(filterLabel)}.</p>`;
    els.detail.innerHTML = `
      ${renderImage(place)}
      <div class="anchor-card-heading">
        <p class="detail-eyebrow">First match</p>
        <h2>${escapeHtml(place.name)}</h2>
        <p class="detail-location">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</p>
      </div>
      <p class="empty-copy">Select a point or choose another Outing Type to refine the map.</p>
      <div class="detail-actions"><button type="button" class="anchor-map-action">View on map</button></div>
    `;
    els.detail.querySelector(".anchor-map-action")?.addEventListener("click", () => showPlace(place));
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
    setDetailCardMode("primary-anchor");
    els.hint.innerHTML = `<p class="hint-title">Start here</p><p>${escapeHtml(place.anchor.hook)}</p>`;
    els.detail.innerHTML = `
      ${renderImage(place)}
      <div class="anchor-card-heading">
        <p class="detail-eyebrow">Start here</p>
        ${anchorBadge(place)}
        <h2>${escapeHtml(place.name)}</h2>
        <p class="detail-location">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</p>
      </div>
      ${place.anchorCard ? `<p class="anchor-hook">${escapeHtml(place.anchorCard.hook)}</p>` : ""}
      ${anchorCardMeta(place)}
      <div class="detail-actions"><button type="button" class="anchor-map-action">View on map</button></div>
    `;
    els.detail.querySelector(".anchor-map-action")?.addEventListener("click", () => showPlace(place));
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
    const action = place.website ? `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">${escapeHtml(actionLabel)}</a>` : "";
    const isPrimaryAnchor = Boolean(anchor && place.anchorCard);
    const isSupportingStop = Boolean(!anchor && place.anchorCard);
    setDetailCardMode(isPrimaryAnchor ? "primary-anchor" : isSupportingStop ? "supporting-stop" : "");
    const imageLabel = isSupportingStop && place.image?.status === "candidate"
      ? "Candidate image"
      : isSupportingStop && (!place.image?.src || place.image?.status === "missing")
        ? "Source image pending"
        : "";
    const eventHtml = events.length ? `
      <div class="related-events">
        <p class="section-label">Coming up here</p>
        ${events.map((event) => `
          <div class="event-mini">
            <strong>${escapeHtml(event.title)}</strong>
            <span>${escapeHtml(event.date)} at ${escapeHtml(event.placeName)}</span>
          </div>
        `).join("")}
      </div>
    ` : "";
    els.detail.innerHTML = `
      <button class="selected-place-close" type="button" aria-label="Close selected place">Close</button>
      ${renderImage(place, imageLabel ? { imageLabel } : {})}
      <p class="section-label">Place details</p>
      <div class="${isPrimaryAnchor ? "anchor-card-heading" : "detail-heading"}">
        <p class="detail-eyebrow">${escapeHtml(place.category || "Cultural place")}</p>
        ${anchorBadge(place)}
        <h2>${escapeHtml(place.name)}</h2>
        <p class="detail-location">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</p>
      </div>
      ${place.anchorCard ? `<p class="anchor-hook">${escapeHtml(place.anchorCard.hook)}</p>` : anchor ? `<p class="anchor-hook">${escapeHtml(anchor.hook)}</p>` : ""}
      ${renderLocationCaveat(place)}
      ${anchorCardMeta(place)}
      <p class="detail-description">${escapeHtml(place.anchorCard?.supportingDescription || place.description)}</p>
      ${directoryRecordMeta(place)}
      ${renderSeenInMuse(place)}
      ${action ? `<div class="detail-actions">${action}</div>` : ""}
      ${eventHtml}
    `;
    els.detail.querySelector(".selected-place-close")?.addEventListener("click", closeSelectionDrawer);
    if (isPlaceMapReady(place)) {
      const targetZoom = Math.max(state.map.getZoom(), 13.5);
      if (prefersReducedMotion()) {
        state.map.jumpTo({ center: [place.lng, place.lat], zoom: targetZoom });
      } else {
        state.map.flyTo({ center: [place.lng, place.lat], zoom: targetZoom, speed: 0.8 });
      }
    }
    revealDetailCard();
    updateReviewUrl();
  }

  function showEvent(event) {
    expandDrawer();
    setDetailCardMode("");
    state.selectedEventId = event.id;
    state.selectedPlaceId = "";
    state.selectedPath = null;
    setSourceData();
    const place = placeById(event.placeId);
    els.detail.innerHTML = `
      ${event.image ? `<img class="place-image" src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}" width="640" height="360" loading="lazy" decoding="async">` : ""}
      <p class="detail-eyebrow">Upcoming event</p>
      <h2>${escapeHtml(event.title)}</h2>
      <p>${escapeHtml(event.date)} at ${escapeHtml(event.placeName)}</p>
      <p>${escapeHtml(event.description)}</p>
      <div class="detail-actions">
        ${event.url ? `<a href="${escapeHtml(event.url)}" target="_blank" rel="noopener">Event link</a>` : ""}
        ${place ? `<button class="filter-chip" type="button" id="event-place-jump">Show place</button>` : ""}
      </div>
    `;
    const jump = document.getElementById("event-place-jump");
    if (jump && place) jump.addEventListener("click", () => showPlace(place));
    revealDetailCard();
    updateReviewUrl();
  }

  // Empty Events State (citizen-voiced, never a stale list or process caveat).
  // NOTE: uses .events-empty, NOT .empty-title — styles.css hides any card with
  // .empty-title via `.detail-card:has(.empty-title){display:none}`.
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
    const bounds = path.stops.reduce((acc, stop) => acc.extend([stop.lng, stop.lat]), new maplibregl.LngLatBounds([path.stops[0].lng, path.stops[0].lat], [path.stops[0].lng, path.stops[0].lat]));
    state.map.fitBounds(bounds, { padding: 90, duration: prefersReducedMotion() ? 0 : 800 });
    renderPathPanel(path);
    updateReviewUrl();
  }

  function renderPathPanel(activePath) {
    expandDrawer();
    setDetailCardMode("path");
    const thesis = activePath.thesis || activePath.dek;
    const copy = activePath.copy || "";
    els.detail.innerHTML = `
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
          const role = anchor ? "Primary anchor" : card ? "Supporting stop" : "";
          return `<li><button class="${icon ? "has-path-icon" : "no-path-icon"}${card && !anchor ? " supporting-path-stop" : ""}" type="button" data-place="${escapeHtml(stop.placeId)}">${icon ? `<span class="path-stop-icon">${escapeHtml(icon)}</span>` : ""}<span class="path-stop-copy"><strong>${escapeHtml(stop.name)}</strong><em>${escapeHtml([role, `${stop.category} / ${stop.city}`].filter(Boolean).join(" / "))}</em><small>${escapeHtml(hook)}</small></span></button></li>`;
        }).join("")}
      </ol>
    `;
    els.detail.querySelectorAll("[data-place]").forEach((button) => {
      const place = placeById(button.dataset.place);
      if (place) button.addEventListener("click", () => showPlace(place));
    });
    els.hint.innerHTML = `
      <p class="hint-title">Stop sequence selected</p>
      <p>${escapeHtml(activePath.stops.length)} numbered stops. The markers carry the route; the connector stays quiet.</p>
    `;
  }

  function renderPathChooser() {
    setDetailCardMode("path");
    els.hint.innerHTML = `
      <p class="hint-title">Cultural routes</p>
      <p>Three routes through the county's cultural life. Pick one to start walking.</p>
    `;
    els.detail.innerHTML = `
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
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.mapMode = mode;
    if (mode !== "places") state.selectedPlaceId = "";
    if (mode !== "places") state.searchQuery = "";
    if (mode !== "paths") state.selectedPath = null;
    if (mode !== "events") state.selectedEventId = "";
    if (els.search) els.search.value = state.searchQuery;
    document.querySelectorAll(".mode-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
    clearPathMarkers();
    setMapSourceData("paths", []);
    ["event-hit-target", "event-halo", "event-points"].forEach((layerId) => {
      setMapLayerVisibility(layerId, mode === "events" ? "visible" : "none");
    });
    if (mode === "events") {
      els.hint.innerHTML = `<p class="hint-title">Events on the map</p><p>Upcoming NCAC-feed events appear when the venue matches a visible place.</p>`;
      const first = state.events[0];
      if (first) {
        showEvent(first);
      } else {
        showEventsEmpty();
      }
    } else if (mode === "paths") {
      renderPathChooser();
    } else {
      renderFeaturedAnchor();
    }
    setSourceData();
    updateReviewUrl();
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

  function applyCustomBasemapStyling() {
    if (!state.map) return;

    const urlParams = new URLSearchParams(window.location.search);
    const twilightParam = urlParams.get("twilight");
    const isTwilight = twilightParam === "true";
    document.body.classList.toggle("twilight-mode", isTwilight);

    const palette = isTwilight ? QUIET_BASEMAP.twilight : QUIET_BASEMAP.standard;
    const paintOverrides = [
      { layerId: "background", property: "background-color", value: palette.background },
      { layerId: "water", property: "fill-color", value: palette.water },
      { layerId: "waterway", property: "line-color", value: palette.waterLine },
      { layerId: "landcover", property: "fill-color", value: palette.landcover },
      { layerId: "landuse", property: "fill-color", value: palette.landuse },
      { layerId: "landuse_residential", property: "fill-color", value: palette.residential },
      { layerId: "park_nature_reserve", property: "fill-color", value: palette.park },
      { layerId: "park_national_park", property: "fill-color", value: palette.park },
      { layerId: "building", property: "fill-color", value: palette.building },
      { layerId: "building-top", property: "fill-color", value: palette.buildingTop },
    ];

    paintOverrides.forEach(({ layerId, property, value }) => {
      if (state.map.getLayer(layerId)) state.map.setPaintProperty(layerId, property, value);
    });

    [
      "road_service_case", "road_minor_case", "road_path", "road_service_fill", "road_minor_fill",
      "tunnel_service_case", "tunnel_minor_case", "tunnel_path", "tunnel_service_fill", "tunnel_minor_fill",
      "bridge_service_case", "bridge_minor_case", "bridge_path", "bridge_service_fill", "bridge_minor_fill",
    ].forEach((layerId) => {
      if (!state.map.getLayer(layerId)) return;
      const isCase = layerId.includes("case");
      state.map.setPaintProperty(layerId, "line-opacity", isCase ? palette.roadCaseOpacity : palette.roadFillOpacity);
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
        "circle-opacity": [
          "case",
          ["get", "denseConstellation"], 0.32,
          ["get", "currentContext"], 0.82,
          ["get", "sampler"], 0.78,
          0.72
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
        // and the selected place alike. Selection is signaled by the surrounding red
        // rings (anchor-rings / place-selection-ring / halo) plus a thicker white
        // stroke below — red is reserved for that, not used as a category color.
        "circle-color": CATEGORY_COLOR,
        "circle-opacity": 1,
        "circle-stroke-color": MARKERS.paper,
        "circle-stroke-width": ["case", ["get", "selected"], 3, 1.4],
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
    state.map.addLayer({
      id: "anchor-rings",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["any", ["get", "anchor"], ["get", "featured"]]],
      paint: {
        "circle-radius": ["case", ["get", "selected"], 14, ["get", "anchor"], 12, 10],
        "circle-color": "rgba(255,255,255,0)",
        "circle-stroke-color": MARKERS.red,
        "circle-stroke-width": ["case", ["get", "selected"], 3, 2],
        "circle-opacity": ["case", ["get", "selected"], 1, 0.88],
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
    const [places, events, paths, anchorCards, museEvidence, museSampler] = await Promise.all([
      fetch(DATA.places).then((r) => r.json()),
      fetch(DATA.events).then((r) => r.json()),
      fetch(DATA.paths).then((r) => r.json()),
      fetch(DATA.anchorCards).then((r) => r.json()).catch(() => []),
      fetch(DATA.museEvidence).then((r) => r.json()).catch(() => ({ links: [] })),
      fetch(DATA.museSampler).then((r) => r.json()).catch(() => ({ showcaseSampler: [] })),
    ]);
    state.anchorCards = Array.isArray(anchorCards) ? anchorCards : [];
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
    state.map = new maplibregl.Map({
      container: "map",
      style: STREET_BASEMAP_STYLE,
      center: isMobileViewport() ? MOBILE_INITIAL_MAP_VIEW.center : DESKTOP_INITIAL_MAP_VIEW.center,
      zoom: isMobileViewport() ? MOBILE_INITIAL_MAP_VIEW.zoom : DESKTOP_INITIAL_MAP_VIEW.zoom,
      attributionControl: true,
    });
    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    state.map.on("load", () => {
      hideBasemapPoiLayers();
      addMapLayers();
      setSourceData();
      applyInitialReviewState();
    });

    state.map.on("moveend", updateSmartLabels);
    state.map.on("zoomend", updateSmartLabels);

    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => setMode(tab.dataset.mode));
    });

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
