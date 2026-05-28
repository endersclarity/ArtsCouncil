const variants = {
  drawer: "Drawer + Context Rail",
  baseline: "Persistent Detail Baseline",
  preview: "Two-Step Preview"
};

const places = [
  {
    id: "center",
    name: "The Center for the Arts",
    type: "Performing arts",
    town: "Grass Valley",
    pos: [58, 36],
    intro: "A high-recognition venue anchoring performances, talks, and community gatherings.",
    muse: "Seen in MUSE coverage of live music momentum and downtown cultural nights.",
    reason: "Strong first-click test: it has a clear map marker, venue identity, and MUSE thread."
  },
  {
    id: "artworks",
    name: "Art Works Gallery",
    type: "Gallery and studio",
    town: "Grass Valley",
    pos: [52, 49],
    intro: "Artist-run gallery with a browsing-friendly downtown presence.",
    muse: "Useful for a gallery browsing trail and local maker context.",
    reason: "Tests a quieter place that still needs the Directory Browser trail."
  },
  {
    id: "nevada-theatre",
    name: "Nevada Theatre",
    type: "Historic performance",
    town: "Nevada City",
    pos: [68, 63],
    intro: "Historic stage connecting performance, civic memory, and Nevada City movement.",
    muse: "A bridge between historic-place browsing and current arts programming.",
    reason: "Tests cross-category navigation without restarting the directory scan."
  }
];

const params = new URLSearchParams(window.location.search);
let variant = variants[params.get("variant")] ? params.get("variant") : "drawer";
let selectedId = params.get("place") || "center";

const app = document.getElementById("app");
const list = document.getElementById("place-list");
const pins = document.getElementById("pins");
const detail = document.getElementById("detail");
const sampler = document.getElementById("sampler-state");

function selected() {
  return places.find((place) => place.id === selectedId) || places[0];
}

function setState(nextPlace) {
  selectedId = nextPlace;
  render();
}

function syncUrl() {
  const next = new URL(window.location.href);
  next.searchParams.set("variant", variant);
  next.searchParams.set("place", selectedId);
  window.history.replaceState({}, "", next);
}

function renderSampler(place) {
  sampler.innerHTML = `
    <p class="label">Preserved browse state</p>
    <div class="crumbs">
      <span class="crumb">MUSE picks</span>
      <span class="crumb">${place.type}</span>
      <span class="crumb">${place.town}</span>
    </div>
    <p>Same filter, same scroll, same selected marker.</p>
  `;
}

function renderList() {
  list.innerHTML = places.map((place) => `
    <button class="place-card ${place.id === selectedId ? "selected" : ""}" data-place="${place.id}" type="button">
      <strong>${place.name}</strong>
      <span>${place.intro}</span>
      <span class="tags">
        <span class="tag">${place.type}</span>
        <span class="tag">${place.town}</span>
      </span>
    </button>
  `).join("");

  list.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => setState(button.dataset.place));
  });
}

function renderPins() {
  pins.innerHTML = places.map((place) => `
    <button class="pin ${place.id === selectedId ? "selected" : ""}" data-place="${place.id}" type="button" style="left:${place.pos[0]}%;top:${place.pos[1]}%;" aria-label="${place.name}"></button>
  `).join("");

  pins.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => setState(button.dataset.place));
  });
}

function fullCard(place, compact = false) {
  return `
    <article class="unified-card">
      <p class="label">Unified Place Card</p>
      <h2>${place.name}</h2>
      <div class="tags">
        <span class="tag">${place.type}</span>
        <span class="tag">${place.town}</span>
        <span class="tag">Seen in MUSE</span>
      </div>
      <p>${place.intro}</p>
      ${compact ? "" : `<div class="seen"><p class="label">Seen in MUSE</p><p>${place.muse}</p></div>`}
      <button class="primary" type="button">Back to Directory Browser</button>
    </article>
  `;
}

function contextRail(place) {
  return `
    <aside class="context-rail" aria-label="Context Rail">
      <p class="label">Context Rail</p>
      <div class="crumbs">
        <span class="crumb">MUSE picks</span>
        <span class="crumb">${place.type}</span>
        <span class="crumb">${place.town}</span>
      </div>
      <ol>
        <li>Directory Browser stays available.</li>
        <li>Map marker remains selected.</li>
        <li>Return keeps filter and scroll.</li>
      </ol>
    </aside>
  `;
}

function renderDetail(place) {
  if (variant === "baseline") {
    detail.innerHTML = `<div class="detail-inner">${fullCard(place)}${contextRail(place)}</div>`;
    return;
  }

  if (variant === "preview") {
    detail.innerHTML = `
      <div class="detail-inner">
        <article class="preview-card">
          <p class="label">Selection preview</p>
          <h2>${place.name}</h2>
          <p>${place.intro}</p>
          <div class="tags"><span class="tag">${place.town}</span><span class="tag">Seen in MUSE</span></div>
          <button class="primary" type="button" id="expand-card">Open Unified Place Card</button>
        </article>
      </div>
    `;
    document.getElementById("expand-card").addEventListener("click", () => {
      detail.innerHTML = `<div class="detail-inner">${fullCard(place)}${contextRail(place)}</div>`;
    });
    return;
  }

  detail.innerHTML = `<div class="detail-inner">${fullCard(place)}${contextRail(place)}</div>`;
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
  const place = selected();
  app.className = `shell variant-${variant}`;
  renderSampler(place);
  renderList();
  renderPins();
  renderDetail(place);
  renderVariantBar();
  syncUrl();
}

render();
