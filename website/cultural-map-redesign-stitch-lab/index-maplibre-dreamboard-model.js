(function() {
  'use strict';

  var STORAGE_KEY = 'ncac-dreamboard';

  /**
   * Read and parse the dream board from localStorage.
   * Returns a safe default if missing or corrupt.
   */
  function getStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var store = raw ? JSON.parse(raw) : null;
      if (!store || !store.version) return { version: 1, places: [], events: [] };
      // Ensure arrays exist
      if (!Array.isArray(store.places)) store.places = [];
      if (!Array.isArray(store.events)) store.events = [];
      return store;
    } catch (e) {
      return { version: 1, places: [], events: [] };
    }
  }

  /**
   * Persist the dream board to localStorage.
   */
  function saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('[DreamBoard] Failed to save:', e);
    }
  }

  /**
   * Add a place to the dream board.
   * @param {Object} asset - data.json asset object with .n, .l, .c fields
   * @param {string} [source] - origin surface: 'detail'|'explore'|'map'|'event'
   * @returns {boolean} true if added, false if duplicate or at limit
   */
  function addPlace(asset, source) {
    if (!asset || !asset.n) return false;
    var store = getStore();
    // Deduplicate by asset name (case-insensitive)
    var exists = store.places.some(function(p) {
      return p.asset.toLowerCase() === asset.n.toLowerCase();
    });
    if (exists) return false;
    // Hard limit: 30 items total across places + events
    if (store.places.length + store.events.length >= 30) return false;

    store.places.push({
      asset: asset.n,
      layer: asset.l || '',
      city: asset.c || '',
      addedAt: Date.now(),
      source: source || 'detail'
    });
    saveStore(store);
    return true;
  }

  /**
   * Remove a place by name (case-insensitive match).
   */
  function removePlace(assetName) {
    if (!assetName) return;
    var store = getStore();
    store.places = store.places.filter(function(p) {
      return p.asset.toLowerCase() !== assetName.toLowerCase();
    });
    saveStore(store);
  }

  /**
   * Check if a place is already bookmarked.
   * @returns {boolean}
   */
  function hasPlace(assetName) {
    if (!assetName) return false;
    var store = getStore();
    return store.places.some(function(p) {
      return p.asset.toLowerCase() === assetName.toLowerCase();
    });
  }

  /**
   * Add an event to the dream board.
   * @param {Object} eventObj - { title, venue, date, layer }
   * @returns {boolean} true if added, false if duplicate or at limit
   */
  function addEvent(eventObj) {
    if (!eventObj || !eventObj.title) return false;
    var store = getStore();
    var titleLower = eventObj.title.toLowerCase();
    var dateLower = (eventObj.date || '').toLowerCase();
    // Deduplicate by title+date combo
    var exists = store.events.some(function(ev) {
      return ev.title.toLowerCase() === titleLower && (ev.date || '').toLowerCase() === dateLower;
    });
    if (exists) return false;
    if (store.places.length + store.events.length >= 30) return false;

    store.events.push({
      title: eventObj.title,
      venue: eventObj.venue || '',
      date: eventObj.date || '',
      layer: eventObj.layer || '',
      addedAt: Date.now(),
      source: 'event'
    });
    saveStore(store);
    return true;
  }

  /**
   * Remove an event by title+date match (case-insensitive).
   */
  function removeEvent(title, date) {
    if (!title) return;
    var store = getStore();
    var titleLower = title.toLowerCase();
    var dateLower = (date || '').toLowerCase();
    store.events = store.events.filter(function(ev) {
      return !(ev.title.toLowerCase() === titleLower && (ev.date || '').toLowerCase() === dateLower);
    });
    saveStore(store);
  }

  /**
   * Check if an event is already bookmarked.
   * @returns {boolean}
   */
  function hasEvent(title, date) {
    if (!title) return false;
    var store = getStore();
    var titleLower = title.toLowerCase();
    var dateLower = (date || '').toLowerCase();
    return store.events.some(function(ev) {
      return ev.title.toLowerCase() === titleLower && (ev.date || '').toLowerCase() === dateLower;
    });
  }

  /**
   * Get total bookmark count (places + events).
   */
  function getItemCount() {
    var store = getStore();
    return store.places.length + store.events.length;
  }

  /**
   * Get all bookmarked places (shallow copy).
   */
  function getPlaces() {
    return getStore().places.slice();
  }

  /**
   * Get all bookmarked events (shallow copy).
   */
  function getEvents() {
    return getStore().events.slice();
  }

  /**
   * Clear all bookmarks.
   */
  function clearAll() {
    saveStore({ version: 1, places: [], events: [] });
  }

  window.CulturalMapDreamboardModel = {
    getStore: getStore,
    addPlace: addPlace,
    removePlace: removePlace,
    hasPlace: hasPlace,
    addEvent: addEvent,
    removeEvent: removeEvent,
    hasEvent: hasEvent,
    getItemCount: getItemCount,
    getPlaces: getPlaces,
    getEvents: getEvents,
    clearAll: clearAll
  };
})();
