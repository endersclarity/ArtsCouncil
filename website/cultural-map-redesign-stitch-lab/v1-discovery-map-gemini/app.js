(function () {
  "use strict";

  const DATA = {
    places: "data/places.json",
    events: "data/events.json",
    paths: "data/paths.json",
  };

  const MARKERS = {
    place: "#2f2b27",
    quiet: "#6c6258",
    red: "#ff2e00",
    paper: "#faf6ec",
    ink: "#1a1a1a",
  };

  const FEATURED_ANCHORS = {
    "Miners Foundry Cultural Center": {
      iconKey: "historic",
      hook: "Historic stone foundry hosting live events.",
      label: "Historic Place"
    },
    "Nevada Theatre": {
      iconKey: "stage",
      hook: "California's oldest original-use theater.",
      label: "Performance Stage"
    },
    "The Center for the Arts": {
      iconKey: "stage",
      hook: "Multi-venue arts center in Grass Valley.",
      label: "Arts Venue"
    },
    "Booktown Books": {
      iconKey: "book",
      hook: "Co-op bookstore with cultural events.",
      label: "Bookstore"
    },
    "Nevada City Winery": {
      iconKey: "food-drink",
      hook: "Art gallery & tasting room in a historic barn.",
      label: "Winery & Gallery"
    },
    "The Stone House": {
      iconKey: "food-drink",
      hook: "Historic stone restaurant and performance venue.",
      label: "Restaurant & Venue"
    },
    "Art Works Gallery": {
      iconKey: "gallery",
      hook: "Artist-owned cooperative gallery in Grass Valley.",
      label: "Art Gallery"
    },
    "C.H.A.M.P. Gallery at City Hall": {
      iconKey: "gallery",
      hook: "Public art gallery inside Nevada City Hall.",
      label: "Public Gallery"
    },
    "ASiF Studios": {
      iconKey: "maker",
      hook: "Community art studios and gallery spaces.",
      label: "Art Studio"
    },
    "The Curious Forge": {
      iconKey: "maker",
      hook: "Makerspace for sculpture, woodwork, and metalwork.",
      label: "Makerspace"
    }
  };

  const ICONS = {
    stage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>`,
    gallery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    maker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    historic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18M5 22V8l7-5 7 5v14M9 22v-6h6v6M12 8v4"/></svg>`,
    "food-drink": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 22H8.8M12 12.2V22M12 12.2a5 5 0 0 0 5-5V3H7v4.2a5 5 0 0 0 5 5ZM7 7h10"/></svg>`
  };

  const state = {
    mode: "places",
    activeIntents: new Set(),
    places: [],
    events: [],
    paths: [],
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
    const isAnchor = place.name in FEATURED_ANCHORS;
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
        isAnchor: isAnchor,
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

  function clearAnchorMarkers() {
    state.anchorMarkers.forEach((marker) => marker.remove());
    state.anchorMarkers = [];
  }

  function updateAnchorMarkerVisibility() {
    if (!state.map) return;
    const zoom = state.map.getZoom();
    const visible = zoom >= 12;
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
    if (!state.map || state.mode !== "places") return;

    const bounds = state.map.getBounds();
    const features = state.map.queryRenderedFeatures({ layers: ["place-points"] });
    const activeAnchorsInBounds = filteredPlaces().filter((place) => {
      return (place.name in FEATURED_ANCHORS) && bounds.contains([place.lng, place.lat]);
    });

    const visiblePlaces = [];

    // 1. Add anchors first
    activeAnchorsInBounds.forEach((place) => {
      visiblePlaces.push({
        id: place.id,
        name: place.name,
        lng: place.lng,
        lat: place.lat,
        isAnchor: true
      });
    });

    // 2. Add other points from place-points
    features.forEach((f) => {
      const placeId = f.properties.id;
      if (visiblePlaces.some((p) => p.id === placeId)) return;

      const place = state.places.find((p) => p.id === placeId);
      if (place) {
        visiblePlaces.push({
          id: place.id,
          name: place.name,
          lng: place.lng,
          lat: place.lat,
          isAnchor: false,
          musePick: place.musePick
        });
      }
    });

    // Hide labels if count > 32
    if (visiblePlaces.length === 0 || visiblePlaces.length > 32) {
      return;
    }

    // Sort: anchors, then muse picks, then regular
    visiblePlaces.sort((a, b) => {
      if (a.isAnchor && !b.isAnchor) return -1;
      if (!a.isAnchor && b.isAnchor) return 1;
      if (a.musePick && !b.musePick) return -1;
      if (!a.musePick && b.musePick) return 1;
      return 0;
    });

    const occupiedBoxes = [];

    // Estimate marker bounding boxes
    visiblePlaces.forEach((p) => {
      const screenPos = state.map.project([p.lng, p.lat]);
      const markerSize = p.isAnchor ? 36 : 16;
      occupiedBoxes.push({
        minX: screenPos.x - markerSize / 2 - 4,
        maxX: screenPos.x + markerSize / 2 + 4,
        minY: screenPos.y - markerSize / 2 - 4,
        maxY: screenPos.y + markerSize / 2 + 4
      });
    });

    visiblePlaces.forEach((p) => {
      const screenPos = state.map.project([p.lng, p.lat]);
      
      const charWidth = 6.2;
      const paddingX = 8;
      const paddingY = 4;
      const labelW = (p.name.length * charWidth) + paddingX * 2;
      const labelH = 16 + paddingY * 2;

      const markerOffset = p.isAnchor ? 20 : 10;
      
      const candidates = [
        {
          minX: screenPos.x + markerOffset,
          maxX: screenPos.x + markerOffset + labelW,
          minY: screenPos.y - labelH / 2,
          maxY: screenPos.y + labelH / 2,
          offsetX: markerOffset + labelW / 2,
          offsetY: 0,
          posClass: "pos-right"
        },
        {
          minX: screenPos.x - markerOffset - labelW,
          maxX: screenPos.x - markerOffset,
          minY: screenPos.y - labelH / 2,
          maxY: screenPos.y + labelH / 2,
          offsetX: -markerOffset - labelW / 2,
          offsetY: 0,
          posClass: "pos-left"
        },
        {
          minX: screenPos.x - labelW / 2,
          maxX: screenPos.x + labelW / 2,
          minY: screenPos.y - markerOffset - labelH,
          maxY: screenPos.y - markerOffset,
          offsetX: 0,
          offsetY: -markerOffset - labelH / 2,
          posClass: "pos-top"
        }
      ];

      let bestCandidate = null;
      for (const cand of candidates) {
        let collision = false;
        for (const box of occupiedBoxes) {
          if (cand.minX < box.maxX && cand.maxX > box.minX &&
              cand.minY < box.maxY && cand.maxY > box.minY) {
            collision = true;
            break;
          }
        }
        if (!collision) {
          bestCandidate = cand;
          break;
        }
      }

      if (bestCandidate) {
        occupiedBoxes.push(bestCandidate);

        const el = document.createElement("button");
        el.type = "button";
        el.className = `map-smart-label ${bestCandidate.posClass}`;
        el.textContent = p.name;
        el.style.pointerEvents = "auto";

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const place = state.places.find((item) => item.id === p.id);
          if (place) showPlace(place);
        });

        const marker = new maplibregl.Marker({
          element: el,
          offset: [bestCandidate.offsetX, bestCandidate.offsetY]
        })
        .setLngLat([p.lng, p.lat])
        .addTo(state.map);

        state.smartLabels.push(marker);
      }
    });
  }

  function renderAnchorMarkers() {
    clearAnchorMarkers();
    if (state.mode === "events") return;

    const activeAnchors = filteredPlaces().filter((place) => place.name in FEATURED_ANCHORS);

    activeAnchors.forEach((place) => {
      const anchorConfig = FEATURED_ANCHORS[place.name];
      const el = document.createElement("button");
      el.type = "button";
      const isSelected = place.id === state.selectedPlaceId;
      el.className = `anchor-marker ${isSelected ? "selected" : ""}`;
      el.setAttribute("aria-label", `${place.name} - ${anchorConfig.label}`);
      
      el.innerHTML = `
        <div class="anchor-ring">
          <div class="anchor-dot">
            ${ICONS[anchorConfig.iconKey]}
          </div>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        showPlace(place);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(state.map);
      
      state.anchorMarkers.push(marker);
    });

    updateAnchorMarkerVisibility();
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

    if (state.map) {
      renderAnchorMarkers();
      updateSmartLabels();
    }
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

  function renderImage(place) {
    if (place.image && place.image.kind === "real" && place.image.src) {
      const src = resolveMedia(place.image.src);
      return `<img class="place-image" src="${escapeHtml(src)}" alt="${escapeHtml(place.image.alt || place.name)}">`;
    }
    const src = resolveMedia(place.image?.src || place.image?.placeholderSrc || "assets/placeholders/gallery-studio.webp");
    return `
      <div class="placeholder-image-wrap">
        <img class="place-image placeholder-image" src="${escapeHtml(src)}" alt="${escapeHtml(place.image?.alt || `Editorial placeholder image for ${place.name}`)}">
        <span class="placeholder-label">Placeholder image</span>
      </div>
    `;
  }

  function relatedEvents(placeId) {
    return state.events.filter((event) => event.placeId === placeId).slice(0, 3);
  }

  function expandDrawer() {
    const controlPanel = document.querySelector(".control-panel");
    if (controlPanel) {
      controlPanel.classList.remove("collapsed");
    }
  }

  function showPlace(place) {
    expandDrawer();
    state.selectedPlaceId = place.id;
    setSourceData();
    const events = relatedEvents(place.id);
    const action = place.website ? `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">Visit site</a>` : "";
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

    const isAnchor = place.name in FEATURED_ANCHORS;
    const anchorConfig = FEATURED_ANCHORS[place.name];
    
    let eyebrow = place.musePick ? "MUSE pick" : "Cultural place";
    let hookHtml = "";

    if (isAnchor) {
      eyebrow = `<span style="display:inline-flex; align-items:center; gap: 5px;">
        <span style="width: 14px; height: 14px; display: inline-flex; align-items:center; justify-content:center;">
          ${ICONS[anchorConfig.iconKey]}
        </span>
        ${anchorConfig.label}
      </span>`;
      hookHtml = `<p class="detail-hook">${escapeHtml(anchorConfig.hook)}</p>`;
    }

    els.detail.innerHTML = `
      ${renderImage(place)}
      <p class="detail-eyebrow">${eyebrow}</p>
      <h2>${escapeHtml(place.name)}</h2>
      <p class="detail-location">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</p>
      ${hookHtml}
      <p class="detail-description">${escapeHtml(place.description)}</p>
      ${action ? `<div class="detail-actions">${action}</div>` : ""}
      ${eventHtml}
    `;
    state.map.flyTo({ center: [place.lng, place.lat], zoom: Math.max(state.map.getZoom(), 13.5), speed: 0.8 });
  }

  function showEvent(event) {
    expandDrawer();
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
    const source = state.map.getSource("paths");
    source.setData({ type: "FeatureCollection", features: [pathFeature(path)] });
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
    els.detail.innerHTML = `
      <div class="path-card-heading">
        <p class="detail-eyebrow">Curated path</p>
        <h2>${escapeHtml(activePath.title)}</h2>
        <p class="detail-description">${escapeHtml(activePath.dek)}</p>
      </div>
      <ol class="path-stop-list">
        ${activePath.stops.map((stop) => {
          const anchor = FEATURED_ANCHORS[stop.name];
          const iconHtml = anchor ? `
            <div class="path-stop-icon-container">
              ${ICONS[anchor.iconKey]}
            </div>
          ` : "";
          const hookHtml = anchor ? `
            <div class="stop-hook-text">${escapeHtml(anchor.hook)}</div>
          ` : "";

          return `
            <li>
              <button type="button" data-place="${escapeHtml(stop.placeId)}">
                ${iconHtml}
                <strong>${escapeHtml(stop.name)}</strong>
                <span>${escapeHtml(stop.category)} / ${escapeHtml(stop.city)}</span>
                ${hookHtml}
              </button>
            </li>
          `;
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

  function renderFirstLoadTeaser() {
    const placeName = "Miners Foundry Cultural Center";
    const place = state.places.find((p) => p.name === placeName);
    if (!place) return;

    const anchorConfig = FEATURED_ANCHORS[placeName];
    const imageSrc = resolveMedia(place.image?.src || place.image?.placeholderSrc || "assets/placeholders/gallery-studio.webp");
    
    els.hint.classList.add("has-teaser");
    els.hint.innerHTML = `
      <p class="teaser-kicker">${escapeHtml(anchorConfig.label)}</p>
      <h3 class="teaser-title">${escapeHtml(place.name)}</h3>
      <p class="teaser-meta">${escapeHtml(place.category)} / ${escapeHtml(place.city)}</p>
      <p class="teaser-hook">${escapeHtml(anchorConfig.hook)}</p>
      <div class="teaser-actions">
        <button type="button" id="teaser-view-map-btn">View on map</button>
      </div>
    `;

    document.getElementById("teaser-view-map-btn").addEventListener("click", () => {
      showPlace(place);
    });
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.mapMode = mode;
    if (mode !== "places") state.selectedPlaceId = "";
    document.querySelectorAll(".mode-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
    clearPathMarkers();
    clearAnchorMarkers();
    state.map.getSource("paths")?.setData({ type: "FeatureCollection", features: [] });
    state.map.setLayoutProperty("event-points", "visibility", mode === "events" ? "visible" : "none");
    state.map.setLayoutProperty("event-halo", "visibility", mode === "events" ? "visible" : "none");
    if (mode === "events") {
      els.hint.classList.remove("has-teaser");
      els.hint.innerHTML = `<p class="hint-title">Events on the map</p><p>Upcoming NCAC-feed events appear when the venue matches a visible place.</p>`;
      const first = state.events[0];
      if (first) showEvent(first);
    } else if (mode === "paths") {
      els.hint.classList.remove("has-teaser");
      renderPathChooser();
    } else {
      els.hint.classList.remove("has-teaser");
      renderFirstLoadTeaser();
      els.detail.innerHTML = `<p class="empty-title">Select a place</p><p class="empty-copy">The detail card will show image proof, short context, source category, and related events when available.</p>`;
    }
    setSourceData();
  }

  function applyCustomBasemapStyling() {
    if (!state.map) return;

    const hour = new Date().getHours();
    const urlParams = new URLSearchParams(window.location.search);
    const forceTwilight = urlParams.get("twilight") === "true";
    const isEvening = forceTwilight || hour >= 18 || hour < 6;

    if (isEvening) {
      document.body.classList.add("twilight-mode");
    } else {
      document.body.classList.remove("twilight-mode");
    }

    const paintOverrides = isEvening ? [
      { layerId: "background", property: "background-color", value: "#ecdcb9" },
      { layerId: "water", property: "fill-color", value: "#ccbca0" },
      { layerId: "waterway", property: "line-color", value: "#ccbca0" },
      { layerId: "landcover", property: "fill-color", value: "#dfceaa" },
      { layerId: "landuse", property: "fill-color", value: "#dfceaa" },
      { layerId: "landuse_residential", property: "fill-color", value: "#d9c7a2" },
      { layerId: "park_nature_reserve", property: "fill-color", value: "#d4c193" },
      { layerId: "park_national_park", property: "fill-color", value: "#d4c193" },
      { layerId: "building", property: "fill-color", value: "#ccbca0" },
      { layerId: "building-top", property: "fill-color", value: "#d4c193" }
    ] : [
      { layerId: "background", property: "background-color", value: "#faf6ec" },
      { layerId: "water", property: "fill-color", value: "#e2ded4" },
      { layerId: "waterway", property: "line-color", value: "#e2ded4" },
      { layerId: "landcover", property: "fill-color", value: "#f4f0e2" },
      { layerId: "landuse", property: "fill-color", value: "#f4f0e2" },
      { layerId: "landuse_residential", property: "fill-color", value: "#f3ede0" },
      { layerId: "park_nature_reserve", property: "fill-color", value: "#efeada" },
      { layerId: "park_national_park", property: "fill-color", value: "#efeada" },
      { layerId: "building", property: "fill-color", value: "#ebe6d8" },
      { layerId: "building-top", property: "fill-color", value: "#ede8da" }
    ];

    paintOverrides.forEach(({ layerId, property, value }) => {
      if (state.map.getLayer(layerId)) {
        state.map.setPaintProperty(layerId, property, value);
      }
    });

    const minorRoadLayers = [
      "road_service_case", "road_minor_case", "road_path", "road_service_fill", "road_minor_fill",
      "tunnel_service_case", "tunnel_minor_case", "tunnel_path", "tunnel_service_fill", "tunnel_minor_fill",
      "bridge_service_case", "bridge_minor_case", "bridge_path", "bridge_service_fill", "bridge_minor_fill"
    ];

    minorRoadLayers.forEach((layerId) => {
      if (state.map.getLayer(layerId)) {
        if (layerId.includes("case")) {
          state.map.setPaintProperty(layerId, "line-opacity", isEvening ? 0.04 : 0.08);
        } else {
          state.map.setPaintProperty(layerId, "line-opacity", isEvening ? 0.08 : 0.15);
        }
      }
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
      filter: ["all", ["!", ["has", "point_count"]], ["!", ["get", "isAnchor"]]],
      paint: {
        "circle-radius": [
          "case",
          ["get", "selected"], 8,
          ["get", "featured"], 6,
          4.5
        ],
        "circle-color": [
          "case",
          ["get", "selected"], MARKERS.paper,
          ["get", "musePick"], MARKERS.red,
          ["get", "featured"], MARKERS.red,
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
    state.map.on("click", "place-points", (event) => {
      const id = event.features[0].properties.id;
      const place = state.places.find((item) => item.id === id);
      if (place) showPlace(place);
    });
    state.map.on("click", "event-points", (event) => {
      const id = event.features[0].properties.id;
      const eventItem = state.events.find((item) => item.id === id);
      if (eventItem) showEvent(eventItem);
    });
    ["place-points", "place-clusters", "event-points"].forEach((layer) => {
      state.map.on("mouseenter", layer, () => { state.map.getCanvas().style.cursor = "pointer"; });
      state.map.on("mouseleave", layer, () => { state.map.getCanvas().style.cursor = ""; });
    });
  }

  async function init() {
    const [places, events, paths] = await Promise.all([
      fetch(DATA.places).then((r) => r.json()),
      fetch(DATA.events).then((r) => r.json()),
      fetch(DATA.paths).then((r) => r.json()),
    ]);
    state.places = places;
    state.events = events;
    state.paths = paths;

    renderFilters();
    state.map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-121.04, 39.24],
      zoom: 10.7,
      attributionControl: true,
    });
    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    state.map.on("load", () => {
      applyCustomBasemapStyling();
      addMapLayers();
      setSourceData();
      renderFirstLoadTeaser();
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
    els.detail.innerHTML = `<p class="empty-title">Unable to load alpha data</p><p class="empty-copy">${escapeHtml(error.message)}</p>`;
  });
})();
