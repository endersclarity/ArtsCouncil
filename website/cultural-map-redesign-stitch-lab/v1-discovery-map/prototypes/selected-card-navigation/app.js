const variants = {
  replace: "Replace With Back Trail",
  split: "Split Stack",
  drawer: "Card Drawer With Context Rail",
  tabs: "Breadcrumb Tabs"
};

const places = [
  {
    id: "center",
    name: "The Center for the Arts",
    type: "Performing arts",
    town: "Grass Valley",
    position: [58, 36],
    description: "A high-recognition venue anchoring performances, talks, and community gatherings in the cultural district.",
    seen: "Referenced in MUSE coverage of live music momentum and downtown cultural nights.",
    tags: ["Seen in MUSE", "Evening anchor", "Tickets"],
    context: "MUSE picks -> Performance -> Grass Valley",
    why: "Good first click because the map marker, venue identity, and MUSE thread all reinforce each other."
  },
  {
    id: "artworks",
    name: "Art Works Gallery",
    type: "Gallery and studio",
    town: "Grass Valley",
    position: [52, 48],
    description: "Artist-run gallery with a browsing-friendly downtown presence and a strong fit for visitor discovery.",
    seen: "Appears in MUSE-adjacent gallery browsing and local maker context.",
    tags: ["Seen in MUSE", "Open hours", "Walkable"],
    context: "MUSE picks -> Galleries -> Grass Valley",
    why: "Tests a quieter place that still benefits from keeping the sampler trail visible."
  },
  {
    id: "nevada-theatre",
    name: "Nevada Theatre",
    type: "Historic performance",
    town: "Nevada City",
    position: [68, 62],
    description: "A historic stage that connects performance, civic memory, and Nevada City visitor movement.",
    seen: "Useful as a bridge between historic-place browsing and current arts programming.",
    tags: ["Historic", "Performance", "Path stop"],
    context: "MUSE picks -> Historic places -> Nevada City",
    why: "Tests cross-category browsing without making the user restart their directory scan."
  },
  {
    id: "forge",
    name: "The Curious Forge",
    type: "Maker space",
    town: "Nevada City",
    position: [76, 49],
    estimated: true,
    description: "A maker and learning space included to test how caveated map confidence appears inside a normal card.",
    seen: "Maker culture context can support MUSE-Backed Card Enrichment when source evidence is available.",
    tags: ["Makers", "Workshops", "Estimated"],
    context: "MUSE picks -> Shops and makers -> Nevada City",
    why: "Tests the location caveat without turning the whole card into an audit artifact."
  }
];

const params = new URLSearchParams(window.location.search);
let variant = variants[params.get("variant")] ? params.get("variant") : "replace";
let selectedId = params.get("place") || "center";

const app = document.getElementById("app");
const list = document.getElementById("directory-list");
const detail = document.getElementById("detail-region");
const markers = document.getElementById("marker-layer");
const status = document.getElementById("map-status");
const context = document.getElementById("browse-context");

function selectedPlace() {
  return places.find((place) => place.id === selectedId) || places[0];
}

function updateUrl() {
  const next = new URL(window.location.href);
  next.searchParams.set("variant", variant);
  next.searchParams.set("place", selectedId);
  window.history.replaceState({}, "", next);
}

function renderContext(place) {
  context.innerHTML = `
    <p class="context-label">Prior browse context</p>
    <div class="crumb-trail">
      ${place.context.split(" -> ").map((crumb) => `<span class="crumb">${crumb}</span>`).join("")}
    </div>
    <p>Return target: same filter, same scroll area, same selected marker.</p>
  `;
}

function renderList() {
  list.innerHTML = places.map((place) => `
    <button class="directory-card" type="button" data-place="${place.id}" aria-current="${place.id === selectedId ? "true" : "false"}">
      <strong>${place.name}</strong>
      <span>${place.description}</span>
      <span class="directory-meta">
        <span>${place.type}</span>
        <span>${place.town}</span>
      </span>
    </button>
  `).join("");

  list.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.place;
      render();
    });
  });
}

function renderMarkers() {
  markers.innerHTML = places.map((place) => `
    <button
      class="marker ${place.id === selectedId ? "selected" : ""} ${place.estimated ? "estimated" : ""}"
      type="button"
      style="left:${place.position[0]}%; top:${place.position[1]}%;"
      data-place="${place.id}"
      aria-label="${place.name}"
    ></button>
  `).join("");

  markers.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.place;
      render();
    });
  });
}

function cardSections(place) {
  return `
    <div class="card-top">
      <p class="card-label">Unified Place Card</p>
      <h2>${place.name}</h2>
      <div class="tag-row">
        <span class="tag">${place.type}</span>
        <span class="tag">${place.town}</span>
        ${place.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </div>
    <p>${place.description}</p>
    <div class="seen-box">
      <p class="context-label">Seen in MUSE</p>
      <p>${place.seen}</p>
    </div>
    ${place.estimated ? `
      <div class="caveat-box">
        <p class="context-label">Map location not confirmed - estimated</p>
        <p>Shown as a normal place card with a quiet coordinate caveat.</p>
      </div>
    ` : ""}
  `;
}

function contextRail(place) {
  return `
    <div class="context-box">
      <p class="context-label">Return path</p>
      <ul class="context-list">
        <li><b>1</b><span>Back to MUSE-Grounded Sampler.</span></li>
        <li><b>2</b><span>Keep current filter: ${place.context.split(" -> ")[1]}.</span></li>
        <li><b>3</b><span>Marker remains selected in Directory Map Coordination.</span></li>
      </ul>
    </div>
  `;
}

function renderDetail() {
  const place = selectedPlace();
  const backButton = `<button class="back-button" type="button" data-back>Back to Directory Browser</button>`;

  if (variant === "tabs") {
    detail.innerHTML = `
      <div class="tab-strip" role="tablist" aria-label="Breadcrumb Tabs">
        <button class="active" type="button">Place</button>
        <button type="button" data-back>Directory</button>
        <button type="button">Map</button>
      </div>
      <article class="place-card">
        <div class="return-line">${backButton}<span class="crumb">Browse Starting View</span><span class="crumb">${place.town}</span></div>
        ${cardSections(place)}
        ${contextRail(place)}
      </article>
    `;
    return;
  }

  if (variant === "drawer") {
    detail.innerHTML = `
      <article class="place-card">
        <div class="card-main">
          <div class="return-line">${backButton}<span class="crumb">${place.context}</span></div>
          ${cardSections(place)}
        </div>
        ${contextRail(place)}
      </article>
    `;
    return;
  }

  if (variant === "split") {
    detail.innerHTML = `
      <article class="place-card">
        <div class="return-line"><span class="crumb">Selected Directory Card</span><span class="crumb">${place.context}</span></div>
        ${cardSections(place)}
        ${contextRail(place)}
      </article>
    `;
    return;
  }

  detail.innerHTML = `
    <article class="place-card">
      <div class="return-line">${backButton}<span class="crumb">From ${place.context}</span></div>
      ${cardSections(place)}
      ${contextRail(place)}
    </article>
  `;
}

function renderStatus(place) {
  status.innerHTML = `
    <strong>${variants[variant]}</strong>
    <span>${place.name} selected. The map keeps the marker hot while the Directory Browser preserves the browse trail.</span>
  `;
}

function wireBackButtons() {
  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".directory-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderVariantBar() {
  document.querySelectorAll(".variant-bar a").forEach((link) => {
    link.classList.toggle("active", link.dataset.variant === variant);
    const next = new URL(window.location.href);
    next.searchParams.set("variant", link.dataset.variant);
    next.searchParams.set("place", selectedId);
    link.href = `${next.pathname}${next.search}`;
  });
}

function render() {
  const place = selectedPlace();
  app.className = `prototype-shell variant-${variant} has-selection`;
  renderContext(place);
  renderList();
  renderMarkers();
  renderDetail(place);
  renderStatus(place);
  renderVariantBar();
  wireBackButtons();
  updateUrl();
}

render();
