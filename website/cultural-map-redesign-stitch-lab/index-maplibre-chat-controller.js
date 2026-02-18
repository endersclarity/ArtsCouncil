(function() {
  'use strict';

  var chatView = window.CulturalMapChatView || {};

  var MAX_MESSAGES = 10; // 5 turns (user + model)
  var MAX_INPUT_LENGTH = 500;
  var USER_TRIPS_KEY = 'ncac-user-trips';

  var state = {
    messages: [],
    isLoading: false,
    sessionHash: ''
  };

  // -----------------------------------------------------------------
  // {{ITINERARY}} block parser
  // -----------------------------------------------------------------

  /**
   * Parse the raw content inside an {{ITINERARY|...}} block into an
   * itinerary-schema-compatible trip object.
   * Returns null if parsing fails or produces no valid days/stops.
   */
  function parseItineraryBlock(rawContent) {
    if (!rawContent) return null;
    // Strip markdown code fences if Gemini wrapped them
    var cleaned = rawContent.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
    var lines = cleaned.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    if (lines.length < 2) return null;

    // First line is header: "Trip Title|N-day"
    var header = lines[0].split('|');
    var trip = {
      id: 'usr-' + Math.floor(Date.now() / 1000),
      title: (header[0] || 'My Trip').trim(),
      subtitle: '',
      duration: (header[1] || '1-day').trim(),
      season: 'year-round',
      heroImage: '',
      description: '',
      created: Date.now(),
      modified: Date.now(),
      theme: { accent: '#c8943e', routeColor: '#7a9e7e', background: '#f5f0e8' },
      days: []
    };

    var currentDay = null;
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf('DAY|') === 0 || line.indexOf('DAY |') === 0) {
        var dayParts = line.split('|');
        currentDay = {
          label: (dayParts[1] || ('Day ' + (trip.days.length + 1))).trim(),
          stops: []
        };
        trip.days.push(currentDay);
      } else if ((line.indexOf('STOP|') === 0 || line.indexOf('STOP |') === 0) && currentDay) {
        var parts = line.split('|');
        currentDay.stops.push({
          asset: (parts[1] || '').trim(),
          time: (parts[2] || '09:00').trim(),
          duration: parseInt(parts[3], 10) || 60,
          narrative: (parts.slice(4).join('|') || '').trim(),
          tip: ''
        });
      }
      // Skip unparseable lines silently (lenient parser)
    }

    // Recalculate duration from actual day count
    if (trip.days.length > 0) {
      trip.duration = trip.days.length + '-day';
    }

    // Validate: at least 1 day with 1 stop
    var hasStops = trip.days.some(function(d) { return d.stops.length > 0; });
    return hasStops ? trip : null;
  }

  /**
   * Build a compact itinerary summary card to render inside the chat bubble.
   */
  function buildItineraryChatCard(trip) {
    var totalStops = 0;
    var daysHtml = '';
    for (var i = 0; i < trip.days.length; i++) {
      var day = trip.days[i];
      totalStops += day.stops.length;
      daysHtml += '<div class="chat-itin-day">' +
        '<strong>' + escapeHTMLBasic(day.label) + '</strong> &mdash; ' +
        day.stops.length + ' stop' + (day.stops.length !== 1 ? 's' : '') +
        '</div>';
    }

    return '<div class="chat-itin-card" data-trip-id="' + escapeAttr(trip.id) + '">' +
      '<div class="chat-itin-title">' + escapeHTMLBasic(trip.title) + '</div>' +
      '<div class="chat-itin-meta">' + escapeHTMLBasic(trip.duration) + ' &middot; ' + totalStops + ' stops</div>' +
      '<div class="chat-itin-days">' + daysHtml + '</div>' +
      '<a href="trip.html" class="chat-itin-cta">View &amp; Edit on Trip Page &rarr;</a>' +
      '</div>';
  }

  /**
   * Save a parsed trip to localStorage (fallback if TripBuilderModel not yet loaded).
   */
  function saveUserTrip(trip) {
    // Prefer the tripbuilder model if available (from plan 08-02)
    if (window.CulturalMapTripBuilderModel && typeof window.CulturalMapTripBuilderModel.saveTrip === 'function') {
      window.CulturalMapTripBuilderModel.saveTrip(trip);
      return;
    }
    // Fallback: save directly to localStorage
    try {
      var raw = localStorage.getItem(USER_TRIPS_KEY);
      var store = raw ? JSON.parse(raw) : null;
      if (!store || !store.version) {
        store = { version: 1, trips: [] };
      }
      if (!Array.isArray(store.trips)) store.trips = [];
      // Deduplicate by id
      store.trips = store.trips.filter(function(t) { return t.id !== trip.id; });
      store.trips.unshift(trip);
      // Cap at 20 trips
      if (store.trips.length > 20) store.trips = store.trips.slice(0, 20);
      localStorage.setItem(USER_TRIPS_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('[Chat] Failed to save trip:', e);
    }
  }

  /**
   * Build dream board payload for the API request.
   */
  function getDreamBoardPayload() {
    if (!window.CulturalMapDreamboardModel) return null;
    var model = window.CulturalMapDreamboardModel;
    var places = typeof model.getPlaces === 'function' ? model.getPlaces() : [];
    var events = typeof model.getEvents === 'function' ? model.getEvents() : [];
    var names = places.map(function(p) { return p.asset; });
    var eventNames = events.map(function(e) {
      return e.venue ? e.venue + ' (' + e.title + ')' : e.title;
    });
    var combined = names.concat(eventNames);
    return combined.length > 0 ? combined : null;
  }

  function generateSessionHash() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxx-xxxx-xxxx'.replace(/x/g, function() {
      return Math.floor(Math.random() * 16).toString(16);
    });
  }

  function init() {
    // Retrieve or generate session hash
    try {
      state.sessionHash = localStorage.getItem('chat_session_hash');
      if (!state.sessionHash) {
        state.sessionHash = generateSessionHash();
        localStorage.setItem('chat_session_hash', state.sessionHash);
      }
    } catch (e) {
      state.sessionHash = generateSessionHash();
    }

    // Wire form submit
    var form = document.getElementById('chatForm');
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    // Render welcome message
    if (chatView.renderWelcome) {
      chatView.renderWelcome();
    }

    // Handle ?chat=trip deep link parameter
    handleChatDeepLink();
  }

  /**
   * Check for ?chat=trip URL parameter and auto-open chat in trip planning mode.
   */
  function handleChatDeepLink() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('chat') !== 'trip') return;
      var planType = params.get('plan');

      // Auto-open chat panel after a brief delay (let DOM settle)
      setTimeout(function() {
        if (window.CulturalMapChatWidget && typeof window.CulturalMapChatWidget.open === 'function') {
          window.CulturalMapChatWidget.open();
        }

        // Auto-send trip planning prompt based on plan type
        var promptMap = {
          '1day': 'Plan me a 1-day trip using my saved places',
          '2day': 'Plan me a 2-day trip using my saved places',
          'organize': 'Organize all my saved places into a logical trip plan'
        };

        if (planType && promptMap[planType]) {
          setTimeout(function() {
            submitPrompt(promptMap[planType]);
          }, 300);
        }
        // If just ?chat=trip with no plan param, chat opens with welcome + trip cards visible
      }, 200);
    } catch (e) {
      // Ignore deep link errors silently
    }
  }

  function hasMessages() {
    return state.messages.length > 0;
  }

  function sanitizeInput(text) {
    // Strip HTML tags
    var clean = text.replace(/<[^>]*>/g, '');
    // Strip javascript: protocol
    clean = clean.replace(/javascript\s*:/gi, '');
    // Strip on-event handlers
    clean = clean.replace(/on\w+\s*=/gi, '');
    return clean.trim();
  }

  function handleSubmit(e) {
    if (e) e.preventDefault();

    if (state.isLoading) return;

    var input = document.getElementById('chatInput');
    if (!input) return;

    var rawText = input.value.trim();
    if (!rawText) return;

    // Enforce max length
    if (rawText.length > MAX_INPUT_LENGTH) {
      rawText = rawText.substring(0, MAX_INPUT_LENGTH);
    }

    var sanitized = sanitizeInput(rawText);
    if (!sanitized) return;

    // Render user message
    if (chatView.renderUserMessage) {
      chatView.renderUserMessage(sanitized);
    }

    // Clear input
    input.value = '';

    // Add to conversation history
    state.messages.push({ role: 'user', content: sanitized });

    // Trim to last N messages
    if (state.messages.length > MAX_MESSAGES) {
      state.messages = state.messages.slice(state.messages.length - MAX_MESSAGES);
    }

    // UI loading state
    state.isLoading = true;
    var sendBtn = document.getElementById('chatSendBtn');
    if (sendBtn) sendBtn.disabled = true;

    var typingEl = chatView.renderTypingIndicator ? chatView.renderTypingIndicator() : null;

    // Build API payload with optional dream board context
    var apiPayload = {
      messages: state.messages,
      sessionHash: state.sessionHash
    };
    var dreamBoardNames = getDreamBoardPayload();
    if (dreamBoardNames) {
      apiPayload.dreamBoard = dreamBoardNames;
    }

    // Call API
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload)
    })
    .then(function(res) {
      if (res.status === 429) {
        throw { status: 429 };
      }
      if (!res.ok) {
        throw { status: res.status };
      }
      return res.json();
    })
    .then(function(data) {
      var responseText = data.reply || data.response || data.text || '';
      var html = parseResponse(responseText);

      if (chatView.renderBotMessage) {
        chatView.renderBotMessage(html);
      }

      // Add to history
      state.messages.push({ role: 'model', content: responseText });
      if (state.messages.length > MAX_MESSAGES) {
        state.messages = state.messages.slice(state.messages.length - MAX_MESSAGES);
      }
    })
    .catch(function(err) {
      console.error('[Chat] request failed:', err);
      var msg = 'Sorry, something went wrong. Please try again.';
      if (err && err.status === 429) {
        msg = "You're asking too fast! Please wait a moment.";
      }
      if (chatView.renderError) {
        chatView.renderError(msg);
      }
    })
    .finally(function() {
      if (typingEl && chatView.removeTypingIndicator) {
        chatView.removeTypingIndicator(typingEl);
      }
      state.isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
    });
  }

  function submitPrompt(prompt) {
    var input = document.getElementById('chatInput');
    if (!input) return;
    input.value = String(prompt || '').trim();
    handleSubmit();
  }

  function parseResponse(text) {
    if (!text) return '';

    var html = text;

    // Convert [[Asset Name|slug-or-pid]] to clickable links
    html = html.replace(/\[\[([^|^\]]+)\|([^\]]+)\]\]/g, function(match, name, pid) {
      return '<a href="#" class="chat-asset-link" data-asset-name="' +
        escapeAttr(name) + '" data-pid="' + escapeAttr(pid) + '">' +
        escapeHTMLBasic(name) + '</a>';
    });

    // Also handle [[Asset Name]] without pid
    html = html.replace(/\[\[([^\]]+)\]\]/g, function(match, name) {
      return '<a href="#" class="chat-asset-link" data-asset-name="' +
        escapeAttr(name) + '" data-pid="' + escapeAttr(name) + '">' +
        escapeHTMLBasic(name) + '</a>';
    });

    // Convert {{MUSE|article-id|quote text}} to citation blocks
    html = html.replace(/\{\{MUSE\|([^|]+)\|([^}]+)\}\}/g, function(match, articleId, quote) {
      return '<div class="chat-muse-cite">' +
        '<span class="chat-muse-label">Featured in MUSE Issue 3</span> ' +
        '<span class="chat-muse-quote">&ldquo;' + escapeHTMLBasic(quote) + '&rdquo;</span> ' +
        '<a href="https://heyzine.com/flip-book/87a3c8db0f.html" target="_blank" rel="noopener" class="chat-muse-link">Read in MUSE &rarr;</a>' +
        '</div>';
    });

    // Handle {{ITINERARY}} blocks — parse, save trip, render card
    var itinRegex = /\{\{\s*ITINERARY\s*\|([^}]*(?:\n[^}]*)*)\}\}/;
    var itinMatch = html.match(itinRegex);
    if (itinMatch) {
      var rawBlock = itinMatch[1];
      var trip = parseItineraryBlock(rawBlock);
      if (trip) {
        // Save trip to localStorage
        saveUserTrip(trip);
        // Track itinerary generation
        var analytics = window.CulturalMapAnalytics;
        if (analytics) {
          var totalStops = 0;
          for (var si = 0; si < trip.days.length; si++) totalStops += trip.days[si].stops.length;
          analytics.track('trip:itinerary-generated', {
            title: (trip.title || '').substring(0, 100),
            stops: totalStops,
            days: trip.days.length
          });
        }
        // Replace the {{ITINERARY}} block with a rendered card
        var cardHTML = buildItineraryChatCard(trip);
        html = html.replace(itinRegex, cardHTML);
      } else {
        // Parsing failed — show fallback message
        html = html.replace(itinRegex,
          '<div class="chat-itin-error">' +
          'I had trouble formatting that itinerary. Let me try again &mdash; could you rephrase your request?' +
          '</div>');
      }
    }

    // Convert **text** to bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function escapeHTMLBasic(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function handleAssetClick(pid, name) {
    var assetPid = String(pid || '').trim();
    var assetName = String(name || '').trim();
    var bridgeResult = null;

    if (window.CulturalMapDeepLinkBridge && typeof window.CulturalMapDeepLinkBridge.navigate === 'function') {
      bridgeResult = window.CulturalMapDeepLinkBridge.navigate({
        pid: assetPid,
        name: assetName
      });
    }

    if ((!bridgeResult || bridgeResult.ok !== true) &&
        window.CulturalMapDeepLink &&
        typeof window.CulturalMapDeepLink.navigateFromChatAsset === 'function') {
      bridgeResult = window.CulturalMapDeepLink.navigateFromChatAsset({
        pid: assetPid,
        name: assetName
      });
    }

    // Fallback when bridge is unavailable or cannot resolve: push query state and trigger router.
    if ((!bridgeResult || bridgeResult.ok !== true) && (assetPid || assetName)) {
      var fallbackPid = assetPid || assetName;
      var params = new URLSearchParams(window.location.search || '');
      params.set('pid', fallbackPid);
      params.delete('idx');
      params.delete('muse');
      params.delete('event');
      history.pushState(null, '', window.location.pathname + '?' + params.toString() + (window.location.hash || ''));
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    // Close chat panel to reveal detail panel
    if (window.CulturalMapChatWidget && window.CulturalMapChatWidget.close) {
      window.CulturalMapChatWidget.close();
    }
  }

  window.CulturalMapChatController = {
    init: init,
    handleSubmit: handleSubmit,
    submitPrompt: submitPrompt,
    hasMessages: hasMessages,
    handleAssetClick: handleAssetClick,
    parseResponse: parseResponse,
    parseItineraryBlock: parseItineraryBlock
  };

})();
