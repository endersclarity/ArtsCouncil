(function () {
  "use strict";

  const PATHS = {
    places: "../data.json",
    events: "../events.json",
    editorials: "../muse_editorials.json",
  };

  const CATEGORY_DISPLAY = {
    "Historic Landmarks": "Landmarks",
    "Eat, Drink & Stay": "Eat / Drink / Stay",
    "Arts Organizations": "Arts Orgs",
    "Cultural Resources": "Cultural",
    "Galleries & Museums": "Galleries / Museums",
    "Fairs & Festivals": "Fairs / Festivals",
    "Walks & Trails": "Walks / Trails",
    "Public Art": "Public Art",
    "Performing Arts": "Performing Arts",
    "Preservation": "Preservation",
  };

  function safeText(value, fallback) {
    if (typeof value === "string" && value.trim()) return value.trim();
    return fallback;
  }

  function toDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatEventDate(iso) {
    const date = toDate(iso);
    if (!date) return "Date TBD";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatEventTime(iso) {
    const date = toDate(iso);
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load " + path + " (" + response.status + ")");
    }
    return response.json();
  }

  function countCategories(places) {
    const map = new Map();
    places.forEach((place) => {
      const label = safeText(place && place.l, "Uncategorized");
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  function pickPlaces(places, limit) {
    const seen = new Set();
    const picked = [];
    for (const place of places) {
      const name = safeText(place && place.n, "");
      const city = safeText(place && place.c, "");
      const key = name.toLowerCase();
      if (!name || seen.has(key)) continue;
      seen.add(key);
      picked.push({
        name,
        city: city || "Nevada County",
        category: safeText(place && place.l, "Uncategorized"),
      });
      if (picked.length >= limit) break;
    }
    return picked;
  }

  function pickEvents(events, limit) {
    const now = new Date();
    return events
      .map((event) => {
        const start = toDate(event && event.start_iso);
        return {
          title: safeText(event && event.title, "Upcoming Event"),
          venue: safeText(event && event.venue_name, "Venue TBD"),
          city: safeText(event && event.venue_city, "Nevada County"),
          startIso: event && event.start_iso,
          start,
        };
      })
      .filter((event) => event.start && event.start >= new Date(now.getTime() - 24 * 60 * 60 * 1000))
      .sort((a, b) => a.start - b.start)
      .slice(0, limit);
  }

  function pickEditorials(editorials, limit) {
    return editorials.slice(0, limit).map((item) => ({
      title: safeText(item && item.title, "Story"),
      eyebrow: safeText(item && item.eyebrow, "MUSE"),
      author: safeText(item && item.author, "Nevada County Arts Council"),
    }));
  }

  function renderContextPanel(model) {
    const section = document.createElement("section");
    section.id = "stitch-live-context";
    section.className =
      "mx-6 my-10 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/90 shadow-xl";

    const categoriesHtml = model.categories
      .slice(0, 8)
      .map((entry) => {
        const label = CATEGORY_DISPLAY[entry.label] || entry.label;
        return (
          '<span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold">' +
          '<span class="text-[10px] opacity-70">' +
          entry.count +
          "</span>" +
          label +
          "</span>"
        );
      })
      .join("");

    const placesHtml = model.places
      .map(
        (place) =>
          '<li class="py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">' +
          '<div class="font-semibold text-sm text-slate-900 dark:text-slate-100">' +
          place.name +
          "</div>" +
          '<div class="text-xs text-slate-500 dark:text-slate-400">' +
          place.city +
          " • " +
          (CATEGORY_DISPLAY[place.category] || place.category) +
          "</div>" +
          "</li>"
      )
      .join("");

    const eventsHtml = model.events
      .map(
        (event) =>
          '<li class="py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">' +
          '<div class="font-semibold text-sm text-slate-900 dark:text-slate-100">' +
          event.title +
          "</div>" +
          '<div class="text-xs text-slate-500 dark:text-slate-400">' +
          formatEventDate(event.startIso) +
          (event.startIso ? " • " + formatEventTime(event.startIso) : "") +
          " • " +
          event.venue +
          ", " +
          event.city +
          "</div>" +
          "</li>"
      )
      .join("");

    const editorialsHtml = model.editorials
      .map(
        (item) =>
          '<li class="py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">' +
          '<div class="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">' +
          item.eyebrow +
          "</div>" +
          '<div class="font-semibold text-sm text-slate-900 dark:text-slate-100">' +
          item.title +
          "</div>" +
          '<div class="text-xs text-slate-500 dark:text-slate-400">By ' +
          item.author +
          "</div>" +
          "</li>"
      )
      .join("");

    section.innerHTML =
      '<div class="flex items-start justify-between gap-3 mb-4">' +
      '<div>' +
      '<div class="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Live Project Context</div>' +
      '<h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">Real Data Snapshot for Review</h3>' +
      '<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Pulled from data.json, events.json, and muse_editorials.json. This makes Stitch mockups easier to evaluate against the actual map product.</p>' +
      "</div>" +
      '<a href="../index-maplibre-hero-intent.html" class="text-xs font-semibold text-primary underline whitespace-nowrap">Open Live Map</a>' +
      "</div>" +
      '<div class="mb-4 flex flex-wrap gap-2">' +
      categoriesHtml +
      "</div>" +
      '<div class="grid gap-4 md:grid-cols-3">' +
      '<div><div class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Featured Places</div><ul>' +
      placesHtml +
      "</ul></div>" +
      '<div><div class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Upcoming Events</div><ul>' +
      eventsHtml +
      "</ul></div>" +
      '<div><div class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">MUSE Editorial Stories</div><ul>' +
      editorialsHtml +
      "</ul></div>" +
      "</div>";

    const host =
      document.querySelector("main") ||
      document.querySelector("body");
    host.appendChild(section);
  }

  function renderError(error) {
    const section = document.createElement("section");
    section.className =
      "mx-6 my-10 p-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm";
    section.textContent =
      "Could not load live project context (" +
      error.message +
      ").";
    (document.querySelector("main") || document.body).appendChild(section);
  }

  async function init() {
    try {
      const [places, events, editorials] = await Promise.all([
        loadJson(PATHS.places),
        loadJson(PATHS.events),
        loadJson(PATHS.editorials),
      ]);

      if (!Array.isArray(places) || !Array.isArray(events) || !Array.isArray(editorials)) {
        throw new Error("Unexpected JSON format");
      }

      const model = {
        categories: countCategories(places),
        places: pickPlaces(places, 4),
        events: pickEvents(events, 4),
        editorials: pickEditorials(editorials, 4),
      };

      renderContextPanel(model);
    } catch (error) {
      renderError(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

