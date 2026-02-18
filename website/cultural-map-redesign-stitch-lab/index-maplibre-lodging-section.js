/**
 * CulturalMapLodgingSection — "Plan Your Stay" lodging cards + VRBO CTA
 *
 * Features:
 *  - Populates card images from image_data.json once available.
 *  - Card clicks open the existing detail panel via __culturalMapOpenDetail.
 *  - "Book Direct" buttons on each card link to the hotel's own booking engine.
 *    Holbrooke (SynXis) gets dates pre-filled if the modal has been used.
 *    National Exchange + Harmony Ridge (Guest Reservations) link direct — no URL date support.
 *  - VRBO CTA opens a date-picker modal first; submitting it opens VRBO with
 *    startDate, endDate, adults query params + UTM tracking.
 */
(function() {
  'use strict';

  var FEATURED = [
    'National Exchange Hotel',
    'The Holbrooke Hotel',
    'Harmony Ridge Lodge'
  ];

  var VRBO_BASE = 'https://www.vrbo.com/search?destination=Nevada+County%2C+CA';

  // Booking config per hotel. SynXis supports URL date injection; Guest Reservations does not.
  var BOOKING = {
    'National Exchange Hotel': {
      engine: 'guest-reservations',
      url: 'https://www.guestreservations.com/the-national-exchange-hotel/booking'
    },
    'The Holbrooke Hotel': {
      engine: 'synxis',
      url: 'https://be.synxis.com/?hotel=31398'
    },
    'Harmony Ridge Lodge': {
      engine: 'guest-reservations',
      url: 'https://www.guestreservations.com/harmony-ridge-lodge/booking'
    }
  };

  // Persists dates/guests from the last modal submission so "Book Direct" links
  // can be updated with matching dates.
  var _selectedDates = null;

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function toIso(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function isoToSynxis(iso) {
    // YYYY-MM-DD → MM/DD/YYYY
    var p = iso.split('-');
    return p[1] + '/' + p[2] + '/' + p[0];
  }

  // ─── Image population ─────────────────────────────────────────────────────

  function populateImages() {
    var imageData = window.__culturalMapImageData;
    if (!imageData) {
      var attempts = 0;
      var poll = setInterval(function() {
        imageData = window.__culturalMapImageData;
        attempts++;
        if (imageData || attempts > 20) {
          clearInterval(poll);
          if (imageData) applyImages(imageData);
        }
      }, 250);
      return;
    }
    applyImages(imageData);
  }

  function applyImages(imageData) {
    var cards = document.querySelectorAll('.lodging-card');
    cards.forEach(function(card) {
      var name = card.dataset.assetName;
      var entry = imageData[name];
      if (entry && entry.img) {
        var img = card.querySelector('.lodging-card-img');
        if (img) {
          img.src = entry.img;
          img.alt = entry.alt || name;
        }
      }
    });
  }

  // ─── Card interactions ────────────────────────────────────────────────────

  function bindCardClicks() {
    var cards = document.querySelectorAll('.lodging-card');
    cards.forEach(function(card) {
      // Clicking the card body/image opens the detail panel
      function handleCardActivate(e) {
        // Don't fire if the click was on the "Book Direct" button
        if (e.target && e.target.closest && e.target.closest('.lodging-card-footer')) return;
        var name = card.dataset.assetName;
        var data = window.__culturalMapData;
        if (!data) return;
        var asset = data.find(function(d) { return d.n === name; });
        if (!asset) return;
        var analytics = window.CulturalMapAnalytics;
        if (analytics) analytics.track('lodging:card-click', { name: name, city: asset.c || '' });
        var appOpen = window.__culturalMapOpenDetail;
        if (typeof appOpen === 'function') appOpen(asset);
      }
      card.addEventListener('click', handleCardActivate);
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardActivate(e);
        }
      });
    });
  }

  function bindBookDirectButtons() {
    var btns = document.querySelectorAll('.lodging-card-book-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); // don't bubble to card's detail-panel handler
        var hotelName = btn.dataset.hotel;
        var config = BOOKING[hotelName];
        if (!config) return; // fall through to native href

        var url = buildBookingUrl(config);
        var analytics = window.CulturalMapAnalytics;
        if (analytics) analytics.track('lodging:book-direct', { hotel: hotelName, hasDates: !!_selectedDates });
        window.open(url, '_blank', 'noopener');
        e.preventDefault();
      });
    });
  }

  function buildBookingUrl(config) {
    if (config.engine === 'synxis' && _selectedDates) {
      var sep = config.url.indexOf('?') >= 0 ? '&' : '?';
      return config.url + sep +
        'arrive=' + isoToSynxis(_selectedDates.checkin) +
        '&depart=' + isoToSynxis(_selectedDates.checkout) +
        '&adult=' + _selectedDates.adults;
    }
    return config.url;
  }

  // Update all "Book Direct" links when new dates are saved (Holbrooke only gets real effect)
  function refreshBookDirectLinks() {
    var btns = document.querySelectorAll('.lodging-card-book-btn');
    btns.forEach(function(btn) {
      var hotelName = btn.dataset.hotel;
      var config = BOOKING[hotelName];
      if (!config) return;
      var url = buildBookingUrl(config);
      btn.href = url;
      // Add subtle "dates set" indicator on Holbrooke
      if (config.engine === 'synxis' && _selectedDates) {
        btn.classList.add('lodging-card-book-btn--dated');
      }
    });
  }

  // ─── VRBO CTA → Modal ────────────────────────────────────────────────────

  function bindVrboCta() {
    var btn = document.getElementById('lodgingVrboCta');
    if (!btn) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  }

  // ─── Modal ───────────────────────────────────────────────────────────────

  function openModal() {
    var modal = document.getElementById('lodgingDateModal');
    if (!modal) return;

    // Set default dates: tomorrow → 2 nights out (if fields are empty)
    var today = new Date();
    var checkinDefault = new Date(today);
    checkinDefault.setDate(today.getDate() + 1);
    var checkoutDefault = new Date(today);
    checkoutDefault.setDate(today.getDate() + 3);

    var checkinEl = document.getElementById('lodgingCheckin');
    var checkoutEl = document.getElementById('lodgingCheckout');
    var todayIso = toIso(today);

    if (checkinEl) {
      checkinEl.min = todayIso;
      if (!checkinEl.value) checkinEl.value = toIso(checkinDefault);
    }
    if (checkoutEl) {
      if (!checkoutEl.value) checkoutEl.value = toIso(checkoutDefault);
    }

    modal.hidden = false;
    modal.removeAttribute('hidden');
    document.body.classList.add('lodging-modal-open');

    var analytics = window.CulturalMapAnalytics;
    if (analytics) analytics.track('lodging:modal-open', {});

    // Focus first input
    if (checkinEl) setTimeout(function() { checkinEl.focus(); }, 60);
  }

  function closeModal() {
    var modal = document.getElementById('lodgingDateModal');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('lodging-modal-open');
    // Return focus to the CTA that opened it
    var btn = document.getElementById('lodgingVrboCta');
    if (btn) btn.focus();
  }

  function bindModal() {
    // Close button
    var closeBtn = document.getElementById('lodgingModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Backdrop click
    var backdrop = document.getElementById('lodgingModalBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var modal = document.getElementById('lodgingDateModal');
        if (modal && !modal.hidden) closeModal();
      }
    });

    // Guest counter
    var countEl = document.getElementById('lodgingAdults');
    var dec = document.getElementById('lodgingGuestDec');
    var inc = document.getElementById('lodgingGuestInc');
    var count = 2;

    function updateCount(n) {
      count = Math.max(1, Math.min(16, n));
      if (countEl) countEl.textContent = count;
      if (dec) dec.disabled = count <= 1;
      if (inc) inc.disabled = count >= 16;
    }
    if (dec) dec.addEventListener('click', function() { updateCount(count - 1); });
    if (inc) inc.addEventListener('click', function() { updateCount(count + 1); });

    // Search / submit
    var searchBtn = document.getElementById('lodgingModalSearch');
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        var checkinEl = document.getElementById('lodgingCheckin');
        var checkoutEl = document.getElementById('lodgingCheckout');
        var checkin = checkinEl ? checkinEl.value : '';
        var checkout = checkoutEl ? checkoutEl.value : '';

        // Validation
        if (!checkin || !checkout) {
          if (checkinEl && !checkin) { checkinEl.focus(); checkinEl.reportValidity && checkinEl.reportValidity(); }
          else if (checkoutEl) { checkoutEl.focus(); checkoutEl.reportValidity && checkoutEl.reportValidity(); }
          return;
        }
        if (checkout <= checkin) {
          if (checkoutEl) { checkoutEl.focus(); }
          return;
        }

        // Save for hotel "Book Direct" links
        _selectedDates = { checkin: checkin, checkout: checkout, adults: count };
        refreshBookDirectLinks();

        // Build VRBO URL
        var url = VRBO_BASE +
          '&startDate=' + checkin +
          '&endDate=' + checkout +
          '&adults=' + count;

        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          url = analytics.tagOutboundUrl(url, 'lodging-vrbo');
          analytics.track('outbound:lodging-vrbo', {
            url: VRBO_BASE,
            checkin: checkin,
            checkout: checkout,
            adults: count
          });
        }

        window.open(url, '_blank', 'noopener');
        closeModal();
      });
    }

    // Checkin change: push checkout min forward
    var checkinEl = document.getElementById('lodgingCheckin');
    var checkoutEl = document.getElementById('lodgingCheckout');
    if (checkinEl && checkoutEl) {
      checkinEl.addEventListener('change', function() {
        var newMin = checkinEl.value;
        if (newMin) {
          checkoutEl.min = newMin;
          if (checkoutEl.value && checkoutEl.value <= newMin) {
            // Auto-advance checkout by 1 night
            var d = new Date(newMin + 'T12:00:00');
            d.setDate(d.getDate() + 1);
            checkoutEl.value = toIso(d);
          }
        }
      });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    populateImages();
    bindCardClicks();
    bindBookDirectButtons();
    bindVrboCta();
    bindModal();
  }

  window.CulturalMapLodgingSection = {
    init: init,
    _selectedDates: _selectedDates
  };
})();
