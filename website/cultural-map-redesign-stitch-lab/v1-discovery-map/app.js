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

  function showPlace(place) {
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
    els.detail.innerHTML = `
      ${renderImage(place)}
      <p class="detail-eyebrow">${place.musePick ? "MUSE pick" : "Cultural place"}</p>
      <h2>${escapeHtml(place.name)}</h2>
      <p class="detail-location">${escapeHtml(place.category)} / ${escapeHtml(place.city || "Nevada County")}</p>
      <p class="detail-description">${escapeHtml(place.description)}</p>
      ${action ? `<div class="detail-actions">${action}</div>` : ""}
      ${eventHtml}
    `;
    state.map.flyTo({ center: [place.lng, place.lat], zoom: Math.max(state.map.getZoom(), 13.5), speed: 0.8 });
  }

  function showEvent(event) {
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
        ${activePath.stops.map((stop) => `<li><button type="button" data-place="${escapeHtml(stop.placeId)}"><strong>${escapeHtml(stop.name)}</strong><span>${escapeHtml(stop.category)} / ${escapeHtml(stop.city)}</span></button></li>`).join("")}
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

  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.mapMode = mode;
    if (mode !== "places") state.selectedPlaceId = "";
    document.querySelectorAll(".mode-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
    clearPathMarkers();
    state.map.getSource("paths")?.setData({ type: "FeatureCollection", features: [] });
    state.map.setLayoutProperty("event-points", "visibility", mode === "events" ? "visible" : "none");
    state.map.setLayoutProperty("event-halo", "visibility", mode === "events" ? "visible" : "none");
    if (mode === "events") {
      els.hint.innerHTML = `<p class="hint-title">Events on the map</p><p>Upcoming NCAC-feed events appear when the venue matches a visible place.</p>`;
      const first = state.events[0];
      if (first) showEvent(first);
    } else if (mode === "paths") {
      renderPathChooser();
    } else {
      els.hint.innerHTML = `<p class="hint-title">Start in the cultural district</p><p>Grass Valley and Nevada City are centered first, with the wider county still visible as context.</p>`;
      els.detail.innerHTML = `<p class="empty-title">Select a place</p><p class="empty-copy">The detail card will show image proof, short context, source category, and related events when available.</p>`;
    }
    setSourceData();
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
      addMapLayers();
      setSourceData();
    });

    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => setMode(tab.dataset.mode));
    });
  }

  init().catch((error) => {
    els.detail.innerHTML = `<p class="empty-title">Unable to load alpha data</p><p class="empty-copy">${escapeHtml(error.message)}</p>`;
  });
})();
