(function () {
  "use strict";

  const DATA = {
    places: "data/places.json",
    events: "data/events.json",
    paths: "data/paths.json",
    anchorCards: "data/anchor_cards.json",
  };

  const MARKERS = {
    place: "#2f2b27",
    quiet: "#6c6258",
    red: "#ff2e00",
    paper: "#faf6ec",
    ink: "#1a1a1a",
  };

  const ANCHOR_ICON_TEXT = {
    stage: "ST",
    book: "BK",
    gallery: "GA",
    maker: "MK",
    historic: "HI",
    "food-drink": "FD",
  };

  const state = {
    mode: "places",
    activeIntents: new Set(),
    places: [],
    events: [],
    paths: [],
    anchorCards: [],
    selectedPath: null,
    selectedPlaceId: "",
    map: null,
    pathMarkers: [],
    anchorMarkers: [],
    smartLabels: [],
  };

  const els = {
    count: document.getElementById("visible-count"),
    filters: document.getElementById("filters"),
    detail: document.getElementById("detail-card"),
    hint: document.getElementById("featured-hint"),
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
        selected: place.id === state.selectedPlaceId,
      },
    };
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

  function updateCount() {
    if (state.mode === "events") {
      els.count.textContent = `${state.events.length} mapped events`;
    } else if (state.mode === "paths") {
      els.count.textContent = `${state.paths.length} curated paths`;
    } else {
      els.count.textContent = `${filteredPlaces().length} visible places`;
    }
  }

  function setSourceData() {
    const places = filteredPlaces().map(placeToFeature);
    const placeSource = state.map.getSource("places");
    if (placeSource) {
      placeSource.setData({ type: "FeatureCollection", features: places });
    }

    const events = state.mode === "events" ? state.events.map(eventToFeature) : [];
    const eventSource = state.map.getSource("events");
    if (eventSource) {
      eventSource.setData({ type: "FeatureCollection", features: events });
    }
    updateCount();
    renderAnchorMarkers();
    updateSmartLabels();
  }

  function setMapSourceData(sourceId, features) {
    const source = state.map.getSource(sourceId);
    if (source) source.setData({ type: "FeatureCollection", features });
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
    const anchorPlaces = filteredPlaces().filter((place) => place.anchor && bounds.contains([place.lng, place.lat]));

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

  function renderFilters() {
    const intents = [...new Set(state.places.map((place) => place.intent))].sort();
    els.filters.innerHTML = intents.map((intent) => {
      const active = state.activeIntents.has(intent) ? " active" : "";
      return `<button class="filter-chip${active}" type="button" data-intent="${escapeHtml(intent)}">${escapeHtml(intent)}</button>`;
    }).join("");
    els.filters.querySelectorAll(".filter-chip").forEach((button) => {
      button.addEventListener("click", () => {
        const intent = button.dataset.intent;
        if (state.activeIntents.has(intent)) state.activeIntents.delete(intent);
        else state.activeIntents.add(intent);
        renderFilters();
        setSourceData();
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
    const src = resolveMedia(place.image?.src || place.image?.placeholderSrc || "assets/placeholders/gallery-studio.webp");
    return `
      <div class="placeholder-image-wrap">
        ${proofLabel}
        <img class="place-image placeholder-image" src="${escapeHtml(src)}" alt="${escapeHtml(place.image?.alt || `Editorial placeholder image for ${place.name}`)}">
        <span class="placeholder-label">Placeholder image</span>
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

  function featuredAnchor() {
    return state.places
      .filter((place) => place.anchor)
      .sort((a, b) => (a.anchor.priority || 99) - (b.anchor.priority || 99))[0];
  }

  function renderFeaturedAnchor() {
    const place = featuredAnchor();
    if (!place) {
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
        : isSupportingStop && !place.image?.src
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
      ${renderImage(place, imageLabel ? { imageLabel } : {})}
      <div class="${isPrimaryAnchor ? "anchor-card-heading" : "detail-heading"}">
        <p class="detail-eyebrow">${anchor ? "Cultural anchor" : place.anchorCard ? "Supporting stop" : place.musePick ? "MUSE pick" : "Cultural place"}</p>
        ${anchorBadge(place)}
        <h2>${escapeHtml(place.name)}</h2>
        <p class="detail-location">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</p>
      </div>
      ${place.anchorCard ? `<p class="anchor-hook">${escapeHtml(place.anchorCard.hook)}</p>` : anchor ? `<p class="anchor-hook">${escapeHtml(anchor.hook)}</p>` : ""}
      ${anchorCardMeta(place)}
      <p class="detail-description">${escapeHtml(place.anchorCard?.supportingDescription || place.description)}</p>
      ${action ? `<div class="detail-actions">${action}</div>` : ""}
      ${eventHtml}
    `;
    state.map.flyTo({ center: [place.lng, place.lat], zoom: Math.max(state.map.getZoom(), 13.5), speed: 0.8 });
  }

  function showEvent(event) {
    expandDrawer();
    setDetailCardMode("");
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
  }

  function applyCustomBasemapStyling() {
    if (!state.map) return;

    const urlParams = new URLSearchParams(window.location.search);
    const twilightParam = urlParams.get("twilight");
    const isTwilight = twilightParam === "true";
    document.body.classList.toggle("twilight-mode", isTwilight);

    const paintOverrides = isTwilight ? [
      { layerId: "background", property: "background-color", value: "#ecdcb9" },
      { layerId: "water", property: "fill-color", value: "#ccbca0" },
      { layerId: "waterway", property: "line-color", value: "#ccbca0" },
      { layerId: "landcover", property: "fill-color", value: "#dfceaa" },
      { layerId: "landuse", property: "fill-color", value: "#dfceaa" },
      { layerId: "landuse_residential", property: "fill-color", value: "#d9c7a2" },
      { layerId: "park_nature_reserve", property: "fill-color", value: "#d4c193" },
      { layerId: "park_national_park", property: "fill-color", value: "#d4c193" },
      { layerId: "building", property: "fill-color", value: "#ccbca0" },
      { layerId: "building-top", property: "fill-color", value: "#d4c193" },
    ] : [
      { layerId: "background", property: "background-color", value: "#f4efe4" },
      { layerId: "water", property: "fill-color", value: "#cbd4d1" },
      { layerId: "waterway", property: "line-color", value: "#bfcac7" },
      { layerId: "landcover", property: "fill-color", value: "#e0d6bd" },
      { layerId: "landuse", property: "fill-color", value: "#e8ddc6" },
      { layerId: "landuse_residential", property: "fill-color", value: "#ece2d1" },
      { layerId: "park_nature_reserve", property: "fill-color", value: "#d9cfaa" },
      { layerId: "park_national_park", property: "fill-color", value: "#d9cfaa" },
      { layerId: "building", property: "fill-color", value: "#d9cdb8" },
      { layerId: "building-top", property: "fill-color", value: "#e1d5bf" },
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
      state.map.setPaintProperty(layerId, "line-opacity", isTwilight ? (isCase ? 0.05 : 0.1) : (isCase ? 0.18 : 0.34));
    });
  }

  function addMapLayers() {
    state.map.addSource("places", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 42,
    });
    state.map.addLayer({
      id: "place-clusters",
      type: "circle",
      source: "places",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#faf6ec",
        "circle-stroke-color": "#8c8177",
        "circle-stroke-width": ["step", ["get", "point_count"], 1.25, 100, 1.6],
        "circle-radius": ["step", ["get", "point_count"], 15, 30, 20, 100, 27],
        "circle-opacity": 0.94,
      },
    });
    state.map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "places",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Open Sans Bold"],
        "text-size": 12,
      },
      paint: { "text-color": "#1a1a1a" },
    });
    state.map.addLayer({
      id: "place-points",
      type: "circle",
      source: "places",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": [
          "case",
          ["get", "selected"], 8,
          ["get", "anchor"], 5.5,
          4.5
        ],
        "circle-color": [
          "case",
          ["get", "selected"], MARKERS.paper,
          ["get", "anchor"], MARKERS.paper,
          ["get", "musePick"], MARKERS.red,
          MARKERS.place
        ],
        "circle-opacity": ["case", ["get", "selected"], 1, 0.88],
        "circle-stroke-color": [
          "case",
          ["get", "selected"], MARKERS.red,
          "#faf6ec"
        ],
        "circle-stroke-width": ["case", ["get", "selected"], 3, 1.25],
      },
    });
    state.map.addLayer({
      id: "anchor-rings",
      type: "circle",
      source: "places",
      filter: ["all", ["!", ["has", "point_count"]], ["get", "anchor"]],
      paint: {
        "circle-radius": ["case", ["get", "selected"], 13, 11],
        "circle-color": "rgba(250,246,236,0)",
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
        "circle-color": "rgba(255,46,0,0.16)",
      },
    });
    state.map.addLayer({
      id: "event-points",
      type: "circle",
      source: "events",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": 7,
        "circle-color": "#ff2e00",
        "circle-stroke-color": "#1a1a1a",
        "circle-stroke-width": 1.5,
      },
    });

    state.map.addSource("paths", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    state.map.addLayer({
      id: "path-line",
      type: "line",
      source: "paths",
      paint: {
        "line-color": "#ff2e00",
        "line-width": 1,
        "line-opacity": 0.06,
        "line-dasharray": [1, 4],
      },
    });

    state.map.on("click", "place-clusters", (event) => {
      const features = state.map.queryRenderedFeatures(event.point, { layers: ["place-clusters"] });
      const clusterId = features[0].properties.cluster_id;
      state.map.getSource("places").getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        state.map.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });
    const showPlaceFromFeature = (event) => {
      const id = event.features[0].properties.id;
      const place = state.places.find((item) => item.id === id);
      if (place) showPlace(place);
    };
    state.map.on("click", "place-points", showPlaceFromFeature);
    state.map.on("click", "anchor-rings", showPlaceFromFeature);
    state.map.on("click", "anchor-icons", showPlaceFromFeature);
    state.map.on("click", "event-points", (event) => {
      const id = event.features[0].properties.id;
      const eventItem = state.events.find((item) => item.id === id);
      if (eventItem) showEvent(eventItem);
    });
    ["place-points", "place-clusters", "anchor-rings", "anchor-icons", "event-points"].forEach((layer) => {
      state.map.on("mouseenter", layer, () => { state.map.getCanvas().style.cursor = "pointer"; });
      state.map.on("mouseleave", layer, () => { state.map.getCanvas().style.cursor = ""; });
    });
  }

  async function init() {
    const [places, events, paths, anchorCards] = await Promise.all([
      fetch(DATA.places).then((r) => r.json()),
      fetch(DATA.events).then((r) => r.json()),
      fetch(DATA.paths).then((r) => r.json()),
      fetch(DATA.anchorCards).then((r) => r.json()).catch(() => []),
    ]);
    state.anchorCards = Array.isArray(anchorCards) ? anchorCards : [];
    state.places = applyAnchorCards(places, state.anchorCards);
    state.events = events;
    state.paths = paths;

    renderFilters();
    state.map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: window.innerWidth < 700 ? [-121.04, 39.18] : [-121.04, 39.24],
      zoom: window.innerWidth < 700 ? 8.8 : 10.7,
      attributionControl: true,
    });
    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    state.map.on("load", () => {
      applyCustomBasemapStyling();
      addMapLayers();
      setSourceData();
      renderFeaturedAnchor();
    });

    state.map.on("zoom", updateAnchorMarkerVisibility);
    state.map.on("moveend", updateSmartLabels);
    state.map.on("zoomend", updateSmartLabels);

    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => setMode(tab.dataset.mode));
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
