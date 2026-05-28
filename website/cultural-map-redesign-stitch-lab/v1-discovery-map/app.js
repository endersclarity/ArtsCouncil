(function () {
  "use strict";

  const DATA = {
    places: "data/places.json",
    events: "data/events.json?v=event-copy-fix",
    paths: "data/paths.json",
    anchorCards: "data/anchor_cards.json",
    museEvidence: "data/muse_evidence_links.json",
    museSampler: "data/muse_grounded_sampler.json",
  };

  const MARKERS = {
    place: "#141414",
    quiet: "#5d625b",
    red: "#ff2e00",
    paper: "#ffffff",
    ink: "#141414",
  };

  const MOBILE_INITIAL_MAP_VIEW = {
    center: [-121.04, 39.16],
    zoom: 11.0,
  };

  const DESKTOP_INITIAL_MAP_VIEW = {
    center: [-121.04, 39.24],
    zoom: 10.7,
  };

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
    pathMarkers: [],
    anchorMarkers: [],
    smartLabels: [],
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

  function isPlaceMapReady(place) {
    return place?.publicMarker !== false && Number.isFinite(place?.lng) && Number.isFinite(place?.lat);
  }

  function placeToFeature(place) {
    const anchor = place.anchor || {};
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
        anchorIcon: ANCHOR_ICON_TEXT[anchor.iconKey] || "",
        sampler: state.browseSamplerPlaceIds.includes(place.id),
        currentContext: isCurrentContextPlace(place),
        localReveal: Boolean(state.localReveal?.placeIds?.includes(place.id)),
        selected: place.id === state.selectedPlaceId,
      },
    };
  }

  function placeKindLabel(place) {
    if (place.anchor) return "Cultural anchor";
    if (place.anchorCard) return "Supporting stop";
    if (place.musePick) return "MUSE pick";
    return "Directory record";
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
    const place = state.places.find((item) => item.id === id);
    if (!place) return;
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
  }

  function hideMarkerPreview() {
    state.markerPreviewPopup?.remove();
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

  function filteredPlaces() {
    if (!state.activeIntents.size) return state.places;
    return state.places.filter((place) => state.activeIntents.has(place.intent));
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
    return [place.name, place.category, place.city, place.intent].filter(Boolean).join(" ").toLowerCase();
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
    return state.activeIntents.has(place.intent);
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
      els.count.textContent = `${state.events.length} mapped events`;
    } else if (state.mode === "paths") {
      els.count.textContent = `${state.paths.length} curated paths`;
    } else {
      els.count.textContent = `${filteredPlaces().length} visible places`;
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
    if (place.anchor && place.anchorCard) return "Primary anchor";
    if (!place.anchor && place.anchorCard) return "Supporting stop";
    if (place.musePick) return "MUSE pick";
    return "Place";
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
          <span>${escapeHtml(places.length)} places near this spot</span>
          <button class="local-reveal-back" type="button" id="local-reveal-back">Back to browse</button>
        </div>
      ` : `
        <div class="places-list-summary">
          <span>${isStartingView ? "Places to explore" : `${escapeHtml(places.length)} ${query ? "matching" : "listed"} of ${escapeHtml(visibleCount)} visible places`}</span>
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
      ${isStartingView && !isLocalReveal ? `<p class="places-list-more">Search places to browse the full directory.</p>` : ""}
      ${!isStartingView && !isLocalReveal && places.length > limit ? `<p class="places-list-more">Showing first ${escapeHtml(limit)}. Use search to narrow the list.</p>` : ""}
    `;
    els.placesList.querySelector("#local-reveal-back")?.addEventListener("click", clearLocalReveal);
    els.placesList.querySelectorAll("[data-place]").forEach((button) => {
      const place = state.places.find((item) => item.id === button.dataset.place);
      if (place) button.addEventListener("click", () => showPlace(place));
    });
  }

  function setSourceData() {
    const places = filteredPlaces().filter(isPlaceMapReady).map(placeToFeature);
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
    renderAnchorMarkers();
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

  function clearAnchorMarkers() {
    state.anchorMarkers.forEach((marker) => marker.remove());
    state.anchorMarkers = [];
  }

  function updateAnchorMarkerVisibility() {
    if (!state.map) return;
    const visible = state.mode !== "events" && state.map.getZoom() >= 10.4;
    state.anchorMarkers.forEach((marker) => {
      const el = marker.getElement();
      if (el) el.style.visibility = visible ? "visible" : "hidden";
    });
  }

  function clearSmartLabels() {
    state.smartLabels.forEach((marker) => marker.remove());
    state.smartLabels = [];
  }

  function updateSmartLabels() {
    clearSmartLabels();
    if (!state.map || state.mode !== "places" || !state.map.getLayer("place-points")) return;

    const bounds = state.map.getBounds();
    const visiblePlaces = [];
    const anchorPlaces = filteredPlaces().filter((place) => place.anchor && isPlaceMapReady(place) && bounds.contains([place.lng, place.lat]));

    anchorPlaces.forEach((place) => {
      visiblePlaces.push({
        id: place.id,
        name: place.name,
        lng: place.lng,
        lat: place.lat,
        isAnchor: true,
        musePick: place.musePick,
      });
    });

    if (!visiblePlaces.length || visiblePlaces.length > 16) return;

    visiblePlaces.sort((a, b) => {
      if (a.isAnchor && !b.isAnchor) return -1;
      if (!a.isAnchor && b.isAnchor) return 1;
      if (a.musePick && !b.musePick) return -1;
      if (!a.musePick && b.musePick) return 1;
      return 0;
    });

    const occupiedBoxes = visiblePlaces.map((place) => {
      const screenPos = state.map.project([place.lng, place.lat]);
      const markerSize = place.isAnchor ? 36 : 16;
      return {
        minX: screenPos.x - markerSize / 2 - 4,
        maxX: screenPos.x + markerSize / 2 + 4,
        minY: screenPos.y - markerSize / 2 - 4,
        maxY: screenPos.y + markerSize / 2 + 4,
      };
    });

    visiblePlaces.forEach((place) => {
      const screenPos = state.map.project([place.lng, place.lat]);
      const labelW = Math.min(220, place.name.length * 6.2 + 16);
      const labelH = 24;
      const markerOffset = place.isAnchor ? 20 : 10;
      const candidates = [
        {
          minX: screenPos.x + markerOffset,
          maxX: screenPos.x + markerOffset + labelW,
          minY: screenPos.y - labelH / 2,
          maxY: screenPos.y + labelH / 2,
          offsetX: markerOffset + labelW / 2,
          offsetY: 0,
          posClass: "pos-right",
        },
        {
          minX: screenPos.x - markerOffset - labelW,
          maxX: screenPos.x - markerOffset,
          minY: screenPos.y - labelH / 2,
          maxY: screenPos.y + labelH / 2,
          offsetX: -markerOffset - labelW / 2,
          offsetY: 0,
          posClass: "pos-left",
        },
        {
          minX: screenPos.x - labelW / 2,
          maxX: screenPos.x + labelW / 2,
          minY: screenPos.y - markerOffset - labelH,
          maxY: screenPos.y - markerOffset,
          offsetX: 0,
          offsetY: -markerOffset - labelH / 2,
          posClass: "pos-top",
        },
      ];

      const bestCandidate = candidates.find((candidate) => {
        return !occupiedBoxes.some((box) => (
          candidate.minX < box.maxX &&
          candidate.maxX > box.minX &&
          candidate.minY < box.maxY &&
          candidate.maxY > box.minY
        ));
      });
      if (!bestCandidate) return;

      occupiedBoxes.push(bestCandidate);
      const el = document.createElement("button");
      el.type = "button";
      el.className = `map-smart-label ${place.isAnchor ? "anchor-label-pin" : ""} ${bestCandidate.posClass}`;
      el.textContent = place.name;
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        const selected = state.places.find((item) => item.id === place.id);
        if (selected) showPlace(selected);
      });

      const marker = new maplibregl.Marker({
        element: el,
        offset: [bestCandidate.offsetX, bestCandidate.offsetY],
      })
        .setLngLat([place.lng, place.lat])
        .addTo(state.map);
      state.smartLabels.push(marker);
    });
  }

  function renderAnchorMarkers() {
    clearAnchorMarkers();
    if (!state.map || state.mode === "events") return;

    filteredPlaces()
      .filter(isPlaceMapReady)
      .filter((place) => place.anchor)
      .forEach((place) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = `anchor-marker${place.id === state.selectedPlaceId ? " selected" : ""}`;
        el.dataset.place = place.id;
        el.innerHTML = `
          <span class="anchor-ring">
            <span class="anchor-dot">${escapeHtml(anchorIconText(place.anchor))}</span>
          </span>
        `;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          showPlace(place);
        });
        const marker = new maplibregl.Marker({ element: el, offset: anchorMarkerOffset(place) })
          .setLngLat([place.lng, place.lat])
          .addTo(state.map);
        marker.getElement().setAttribute("aria-label", `${place.name} - ${place.anchor.label}`);
        marker.getElement().dataset.place = place.id;
        state.anchorMarkers.push(marker);
      });

    updateAnchorMarkerVisibility();
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
    const intents = [...new Set(state.places.map((place) => place.intent))].sort();
    els.filters.innerHTML = intents.map((intent) => {
      const active = state.activeIntents.has(intent) ? " active" : "";
      return `<button class="filter-chip${active}" type="button" data-intent="${escapeHtml(intent)}">${escapeHtml(intent)}</button>`;
    }).join("");
    els.filters.querySelectorAll(".filter-chip").forEach((button) => {
      button.addEventListener("click", () => {
        state.localReveal = null;
        state.localRevealPreviousContext = null;
        const intent = button.dataset.intent;
        if (state.activeIntents.has(intent)) state.activeIntents.delete(intent);
        else state.activeIntents.add(intent);
        const visibleIds = new Set(filteredPlaces().map((place) => place.id));
        if (state.selectedPlaceId && !visibleIds.has(state.selectedPlaceId)) state.selectedPlaceId = "";
        renderFilters();
        if (!state.selectedPlaceId) renderFeaturedAnchor();
        setSourceData();
        updateReviewUrl();
      });
    });
  }

  function setDetailCardMode(mode) {
    els.detail.classList.toggle("primary-anchor-card", mode === "primary-anchor");
    els.detail.classList.toggle("supporting-stop-card", mode === "supporting-stop");
    els.detail.classList.toggle("path-detail-card", mode === "path");
  }

  function renderImage(place, options = {}) {
    const imageLabel = options.imageLabel || options.proofLabel || "";
    const proofLabel = imageLabel ? `<span class="image-proof-label">${escapeHtml(imageLabel)}</span>` : "";
    if (place.image && place.image.kind === "real" && place.image.src) {
      const src = resolveMedia(place.image.src);
      return `
        <figure class="place-image-frame">
          ${proofLabel}
          <img class="place-image" src="${escapeHtml(src)}" alt="${escapeHtml(place.image.alt || place.name)}">
          ${place.image.credit ? `<figcaption>${escapeHtml(place.image.credit)}</figcaption>` : ""}
        </figure>
      `;
    }
    const explicitPlaceholder = place.image?.kind === "placeholder" ? "" : place.image?.src || place.image?.placeholderSrc;
    const categoryPlaceholder = categoryPlaceholderFor(place.category);
    const src = resolveMedia(explicitPlaceholder || categoryPlaceholder || "assets/placeholders/gallery-studio.webp");
    const alt = explicitPlaceholder
      ? place.image?.alt || `Non-documentary placeholder image for ${place.name}`
      : `NCAC category placeholder for ${place.category || place.name}`;
    return `
      <div class="placeholder-image-wrap">
        ${proofLabel}
        <img class="place-image placeholder-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">
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

  function anchorMarkerOffset(place) {
    const offsets = {
      "the-center-for-the-arts-grass-valley": [-18, -18],
      "art-works-gallery-grass-valley": [18, 18],
      "empire-mine-grass-valley": [18, -14],
      "north-star-house-grass-valley": [-18, 18],
    };
    return offsets[place.id] || [0, 0];
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
    const isSupportingStop = !place.anchor && Boolean(card);
    return `
      <div class="anchor-card-meta" aria-label="Cultural context">
        ${card.whyItMatters ? `<p><strong>${isSupportingStop ? "How this stop supports the path" : "Why this place matters"}</strong><span>${escapeHtml(card.whyItMatters)}</span></p>` : ""}
        ${card.visibleIncompleteLabel ? `<p class="visible-incomplete-note"><strong>Visible gap</strong><span>${escapeHtml(card.visibleIncompleteLabel)}</span></p>` : ""}
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
      <dl class="directory-record-meta" aria-label="Directory record details">
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

  function museArticleContext(article) {
    const issue = article.issue || (article.issue_year ? `MUSE ${article.issue_year}` : "");
    const pageStart = article.page_start;
    const pageEnd = article.page_end;
    const pages = pageStart && pageEnd && pageStart !== pageEnd
      ? `pp. ${pageStart}-${pageEnd}`
      : pageStart
        ? `p. ${pageStart}`
        : "";
    return [issue, pages].filter(Boolean).join(", ");
  }

  function renderSeenInMuse(place) {
    const links = state.museEvidenceByPlace.get(place.id) || [];
    if (!links.length) return "";
    const visibleLinks = links.slice(0, 3);
    return `
      <div class="seen-in-muse" aria-label="Seen in MUSE">
        <p class="section-label">Seen in MUSE</p>
        <div class="seen-in-muse-list">
          ${visibleLinks.map((link) => {
            const article = link.article || {};
            const confidence = link.source_confidence?.level ? `${link.source_confidence.level} confidence` : "Direct place match";
            const context = museArticleContext(article);
            return `
              <article class="seen-in-muse-item">
                <strong>${escapeHtml(article.title || "MUSE article")}</strong>
                ${context ? `<span>${escapeHtml(context)}</span>` : ""}
                <small>${escapeHtml(confidence)} / direct place evidence</small>
              </article>
            `;
          }).join("")}
        </div>
        ${links.length > visibleLinks.length ? `<p class="seen-in-muse-more">${escapeHtml(links.length - visibleLinks.length)} more direct MUSE mentions</p>` : ""}
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
      els.hint.innerHTML = `<p class="hint-title">No places match this filter</p><p>Try another cultural interest to bring places back onto the map.</p>`;
      els.detail.innerHTML = `<p class="empty-title">No matching places</p><p class="empty-copy">The active filter does not currently match any mapped places.</p>`;
      return;
    }
    els.hint.innerHTML = `<p class="hint-title">Filtered map</p><p>${escapeHtml(places.length)} visible places match ${escapeHtml(filterLabel)}.</p>`;
    els.detail.innerHTML = `
      ${renderImage(place, { proofLabel: "Image proof" })}
      <div class="anchor-card-heading">
        <p class="detail-eyebrow">First matching place</p>
        <h2>${escapeHtml(place.name)}</h2>
        <p class="detail-location">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</p>
      </div>
      <p class="empty-copy">Select a point or choose another filter to refine the visible places.</p>
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
      els.detail.innerHTML = `<p class="empty-title">Select a place</p><p class="empty-copy">The detail card will show image proof, short context, source category, and related events when available.</p>`;
      return;
    }
    setDetailCardMode("primary-anchor");
    els.hint.innerHTML = `<p class="hint-title">Featured cultural anchor</p><p>${escapeHtml(place.anchor.hook)}</p>`;
    els.detail.innerHTML = `
      ${renderImage(place, { proofLabel: "Image proof" })}
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
    const events = relatedEvents(place.id);
    const anchor = place.anchor || null;
    const actionLabel = place.anchorCard?.primaryAction || "Visit site";
    const action = place.website ? `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">${escapeHtml(actionLabel)}</a>` : "";
    const isPrimaryAnchor = Boolean(anchor && place.anchorCard);
    const isSupportingStop = Boolean(!anchor && place.anchorCard);
    setDetailCardMode(isPrimaryAnchor ? "primary-anchor" : isSupportingStop ? "supporting-stop" : "");
    const imageLabel = isPrimaryAnchor
      ? "Image proof"
      : isSupportingStop && place.image?.status === "candidate"
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
      <div class="${isPrimaryAnchor ? "anchor-card-heading" : "detail-heading"}">
        <p class="detail-eyebrow">${anchor ? "Cultural anchor" : place.anchorCard ? "Supporting stop" : place.musePick ? "MUSE pick" : "Cultural place"}</p>
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
      state.map.flyTo({ center: [place.lng, place.lat], zoom: Math.max(state.map.getZoom(), 13.5), speed: 0.8 });
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
    const place = state.places.find((item) => item.id === event.placeId);
    els.detail.innerHTML = `
      ${event.image ? `<img class="place-image" src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}">` : ""}
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
        const place = state.places.find((item) => item.id === stop.placeId);
        if (place) showPlace(place);
      });
      const marker = new maplibregl.Marker({ element: el }).setLngLat([stop.lng, stop.lat]).addTo(state.map);
      marker.getElement().setAttribute("aria-label", `Stop ${index + 1}: ${stop.name}`);
      state.pathMarkers.push(marker);
    });
    const bounds = path.stops.reduce((acc, stop) => acc.extend([stop.lng, stop.lat]), new maplibregl.LngLatBounds([path.stops[0].lng, path.stops[0].lat], [path.stops[0].lng, path.stops[0].lat]));
    state.map.fitBounds(bounds, { padding: 90, duration: 800 });
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
        <p class="detail-eyebrow">Curated path</p>
        <h2>${escapeHtml(activePath.title)}</h2>
        <p class="path-thesis">${escapeHtml(thesis)}</p>
        ${copy ? `<p class="path-copy">${escapeHtml(copy)}</p>` : ""}
      </div>
      <ol class="path-stop-list">
        ${activePath.stops.map((stop) => {
          const place = state.places.find((item) => item.id === stop.placeId);
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
      const place = state.places.find((item) => item.id === button.dataset.place);
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
      <p class="hint-title">MUSE-current paths</p>
      <p>Three fixed routes demonstrate how cultural discovery can be curated on the map.</p>
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
    setMapLayerVisibility("event-points", mode === "events" ? "visible" : "none");
    setMapLayerVisibility("event-halo", mode === "events" ? "visible" : "none");
    if (mode === "events") {
      els.hint.innerHTML = `<p class="hint-title">Events on the map</p><p>Upcoming NCAC-feed events appear when the venue matches a visible place.</p>`;
      const first = state.events[0];
      if (first) showEvent(first);
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
    const validIntents = new Set(state.places.map((place) => place.intent));
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

  function addMapLayers() {
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
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 7, 2.8, 11, 3.6, 14, 3.8],
        "circle-color": MARKERS.ink,
        "circle-opacity": [
          "case",
          ["get", "currentContext"], 0.68,
          ["get", "sampler"], 0.64,
          0.5
        ],
        "circle-stroke-color": MARKERS.paper,
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 7, 0, 12, 0.55],
      },
    });
    state.map.addLayer({
      id: "place-points",
      type: "circle",
      source: "places",
      filter: ["any", ["get", "selected"], ["get", "anchor"], ["get", "musePick"], ["get", "sampler"], ["get", "currentContext"]],
      paint: {
        "circle-radius": [
          "case",
          ["get", "selected"], 8,
          ["get", "anchor"], 5.5,
          ["get", "sampler"], 4.8,
          4.2
        ],
        "circle-color": [
          "case",
          ["get", "selected"], MARKERS.paper,
          ["get", "anchor"], MARKERS.paper,
          ["get", "musePick"], MARKERS.paper,
          ["get", "sampler"], MARKERS.paper,
          MARKERS.place
        ],
        "circle-opacity": ["case", ["get", "selected"], 1, 0.72],
        "circle-stroke-color": [
          "case",
          ["get", "selected"], MARKERS.red,
          ["get", "localReveal"], MARKERS.red,
          ["get", "musePick"], MARKERS.paper,
          ["get", "sampler"], MARKERS.red,
          MARKERS.paper
        ],
        "circle-stroke-width": ["case", ["get", "selected"], 3, ["get", "localReveal"], 1.8, ["get", "sampler"], 1.4, 0.9],
      },
    });
    state.map.addLayer({
      id: "anchor-rings",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["get", "anchor"]],
      paint: {
        "circle-radius": ["case", ["get", "selected"], 13, 11],
        "circle-color": "rgba(255,255,255,0)",
        "circle-stroke-color": MARKERS.red,
        "circle-stroke-width": ["case", ["get", "selected"], 2.6, 1.7],
        "circle-opacity": 0.96,
      },
    });
    state.map.addLayer({
      id: "anchor-icons",
      type: "symbol",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["get", "anchor"]],
      layout: {
        "text-field": ["get", "anchorIcon"],
        "text-font": ["Open Sans Bold"],
        "text-size": 9,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": MARKERS.ink,
        "text-halo-color": MARKERS.paper,
        "text-halo-width": 1,
      },
    });

    state.map.addSource("events", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    state.map.addLayer({
      id: "event-halo",
      type: "circle",
      source: "events",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": 15,
        "circle-color": "rgba(255,46,0,0.18)",
      },
    });
    state.map.addLayer({
      id: "event-points",
      type: "circle",
      source: "events",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": 7,
        "circle-color": MARKERS.red,
        "circle-stroke-color": MARKERS.ink,
        "circle-stroke-width": 1.5,
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
        "line-opacity": 0.2,
        "line-dasharray": [1, 4],
      },
    });

    const showPlaceFromFeature = (event) => {
      hideMarkerPreview();
      const id = event.features[0].properties.id;
      const place = state.places.find((item) => item.id === id);
      if (place) showPlace(place);
    };
    const startLocalRevealFromFeature = (event) => {
      startLocalReveal(event.lngLat);
    };
    const localRevealDensityFeatures = (point, radius = 16) => {
      const hitBox = [
        [point.x - radius, point.y - radius],
        [point.x + radius, point.y + radius],
      ];
      return state.map.queryRenderedFeatures(hitBox, { layers: ["place-density"] });
    };
    const mapClickHasDirectSelection = (point) => {
      return state.map.queryRenderedFeatures(point, {
        layers: ["place-points", "anchor-rings", "anchor-icons", "event-points"],
      }).length > 0;
    };
    const startLocalRevealFromMapClick = (event) => {
      if (state.mode !== "places") return;
      if (mapClickHasDirectSelection(event.point)) return;
      if (!localRevealDensityFeatures(event.point).length) return;
      startLocalReveal(event.lngLat);
    };
    state.map.on("click", "place-density", startLocalRevealFromFeature);
    state.map.on("click", "place-points", showPlaceFromFeature);
    state.map.on("click", "anchor-rings", showPlaceFromFeature);
    state.map.on("click", "anchor-icons", showPlaceFromFeature);
    state.map.on("click", "event-points", (event) => {
      const id = event.features[0].properties.id;
      const eventItem = state.events.find((item) => item.id === id);
      if (eventItem) showEvent(eventItem);
    });
    state.map.on("click", (event) => {
      startLocalRevealFromMapClick(event);
    });
    ["place-points", "anchor-rings", "anchor-icons"].forEach((layer) => {
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
    ["event-points"].forEach((layer) => {
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
    state.events = events;
    state.paths = paths;

    renderFilters();
    state.map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: isMobileViewport() ? MOBILE_INITIAL_MAP_VIEW.center : DESKTOP_INITIAL_MAP_VIEW.center,
      zoom: isMobileViewport() ? MOBILE_INITIAL_MAP_VIEW.zoom : DESKTOP_INITIAL_MAP_VIEW.zoom,
      attributionControl: true,
    });
    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    state.map.on("load", () => {
      applyCustomBasemapStyling();
      addMapLayers();
      setSourceData();
      applyInitialReviewState();
    });

    state.map.on("zoom", updateAnchorMarkerVisibility);
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
    els.detail.innerHTML = `<p class="empty-title">Unable to load alpha data</p><p class="empty-copy">${escapeHtml(error.message)}</p>`;
  });
})();
