(function() {
  'use strict';

  var STORAGE_KEY = 'ncac-user-trips';

  /**
   * Read and parse the user trips store from localStorage.
   * Returns a safe default if missing or corrupt.
   */
  function getStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var store = raw ? JSON.parse(raw) : null;
      if (!store || !store.version) return { version: 1, trips: [], activeTrip: null };
      if (!Array.isArray(store.trips)) store.trips = [];
      return store;
    } catch (e) {
      return { version: 1, trips: [], activeTrip: null };
    }
  }

  /**
   * Persist the trips store to localStorage.
   */
  function saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('[TripBuilder] Failed to save:', e);
    }
  }

  /**
   * Create a new trip with a given title.
   * Sets it as the active trip. Returns the new trip object.
   * @param {string} title
   * @returns {Object} trip
   */
  function createTrip(title) {
    var store = getStore();
    var trip = {
      id: 'usr-' + Math.floor(Date.now() / 1000),
      title: title || 'My Trip',
      subtitle: '',
      duration: '1-day',
      season: 'year-round',
      heroImage: '',
      description: '',
      created: Date.now(),
      modified: Date.now(),
      theme: {
        accent: '#c8943e',
        routeColor: '#7a9e7e',
        background: '#f5f0e8'
      },
      days: []
    };
    store.trips.push(trip);
    store.activeTrip = trip.id;
    saveStore(store);
    return trip;
  }

  /**
   * Get the active trip object, or null if none.
   * @returns {Object|null}
   */
  function getActiveTrip() {
    var store = getStore();
    if (!store.activeTrip) return null;
    for (var i = 0; i < store.trips.length; i++) {
      if (store.trips[i].id === store.activeTrip) return store.trips[i];
    }
    return null;
  }

  /**
   * Set the active trip by id.
   * @param {string} tripId
   */
  function setActiveTrip(tripId) {
    var store = getStore();
    store.activeTrip = tripId;
    saveStore(store);
  }

  /**
   * Get all trips (shallow copy of array).
   * @returns {Array}
   */
  function getAllTrips() {
    return getStore().trips.slice();
  }

  /**
   * Delete a trip by id. Sets activeTrip to first remaining or null.
   * @param {string} tripId
   */
  function deleteTrip(tripId) {
    var store = getStore();
    store.trips = store.trips.filter(function(t) { return t.id !== tripId; });
    if (store.activeTrip === tripId) {
      store.activeTrip = store.trips.length > 0 ? store.trips[0].id : null;
    }
    saveStore(store);
  }

  /**
   * Rename a trip.
   * @param {string} tripId
   * @param {string} newTitle
   */
  function renameTrip(tripId, newTitle) {
    var store = getStore();
    for (var i = 0; i < store.trips.length; i++) {
      if (store.trips[i].id === tripId) {
        store.trips[i].title = newTitle;
        store.trips[i].modified = Date.now();
        break;
      }
    }
    saveStore(store);
  }

  /**
   * Upsert a trip into the store by id match. Updates modified timestamp.
   * @param {Object} trip
   */
  function saveTrip(trip) {
    if (!trip || !trip.id) return;
    var store = getStore();
    var found = false;
    for (var i = 0; i < store.trips.length; i++) {
      if (store.trips[i].id === trip.id) {
        trip.modified = Date.now();
        store.trips[i] = trip;
        found = true;
        break;
      }
    }
    if (!found) {
      trip.modified = Date.now();
      store.trips.push(trip);
    }
    saveStore(store);
  }

  /**
   * Compress a trip to a URL-safe base64 string using single-letter keys.
   * Returns null if the encoded string exceeds 1800 characters.
   * @param {Object} trip
   * @returns {string|null}
   */
  function encodeForUrl(trip) {
    if (!trip) return null;
    try {
      var compact = {
        t: trip.title || '',
        d: (trip.days || []).map(function(day) {
          return {
            l: day.label || '',
            s: (day.stops || []).map(function(stop) {
              return {
                a: stop.asset || '',
                m: stop.time || '09:00',
                r: stop.duration || 60
              };
            })
          };
        })
      };
      var json = JSON.stringify(compact);
      var encoded = btoa(unescape(encodeURIComponent(json)));
      if (encoded.length > 1800) return null;
      return encoded;
    } catch (e) {
      console.warn('[TripBuilder] URL encode failed:', e);
      return null;
    }
  }

  /**
   * Decode a base64 URL string back into a full trip object.
   * @param {string} encoded
   * @returns {Object|null}
   */
  function decodeFromUrl(encoded) {
    if (!encoded) return null;
    try {
      var json = decodeURIComponent(escape(atob(encoded)));
      var compact = JSON.parse(json);
      var trip = {
        id: 'usr-' + Math.floor(Date.now() / 1000),
        title: compact.t || 'Shared Trip',
        subtitle: '',
        duration: '1-day',
        season: 'year-round',
        heroImage: '',
        description: '',
        created: Date.now(),
        modified: Date.now(),
        theme: {
          accent: '#c8943e',
          routeColor: '#7a9e7e',
          background: '#f5f0e8'
        },
        days: (compact.d || []).map(function(day) {
          return {
            label: day.l || '',
            stops: (day.s || []).map(function(stop) {
              return {
                asset: stop.a || '',
                time: stop.m || '09:00',
                duration: stop.r || 60,
                narrative: '',
                tip: ''
              };
            })
          };
        })
      };
      if (trip.days.length > 0) {
        trip.duration = trip.days.length + '-day';
      }
      return trip;
    } catch (e) {
      console.warn('[TripBuilder] URL decode failed:', e);
      return null;
    }
  }

  window.CulturalMapTripBuilderModel = {
    getStore: getStore,
    createTrip: createTrip,
    getActiveTrip: getActiveTrip,
    setActiveTrip: setActiveTrip,
    getAllTrips: getAllTrips,
    deleteTrip: deleteTrip,
    renameTrip: renameTrip,
    saveTrip: saveTrip,
    encodeForUrl: encodeForUrl,
    decodeFromUrl: decodeFromUrl
  };
})();
