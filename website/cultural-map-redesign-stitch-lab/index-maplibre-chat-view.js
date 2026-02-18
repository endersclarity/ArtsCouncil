(function() {
  'use strict';

  var messagesContainer = null;
  var tripCssInjected = false;

  // Trip planning style cards — shown when dream board has items
  var TRIP_STYLE_CARDS = [
    {
      icon: '\uD83D\uDCC5', // calendar emoji
      label: '1-Day Plan',
      plan: '1day',
      prompt: 'Plan me a 1-day trip using my saved places'
    },
    {
      icon: '\uD83D\uDDD3\uFE0F', // spiral calendar emoji
      label: '2-Day Plan',
      plan: '2day',
      prompt: 'Plan me a 2-day trip using my saved places'
    },
    {
      icon: '\u2728', // sparkles emoji
      label: 'Just Organize My List',
      plan: 'organize',
      prompt: 'Organize all my saved places into a logical trip plan'
    }
  ];

  var STYLE_CARDS = [
    {
      icon: '🧭',
      title: 'Weekend Getaway',
      hint: '2 days of galleries, food, and music',
      prompt: 'Plan a 2-day weekend in Nevada County. Include downtown galleries in Nevada City, a great dinner spot in Grass Valley, and a morning coffee recommendation. Mention specific places by name.'
    },
    {
      icon: '🎨',
      title: 'Arts & Culture Day',
      hint: 'One packed day of local creativity',
      prompt: 'I have one day to experience the best arts and culture in Nevada County. What galleries, studios, and performances should I see? Include specific venue names and neighborhoods.'
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Family Adventure',
      hint: 'Kid-friendly and easy to navigate',
      prompt: 'Plan a family-friendly day in Nevada County with kids. Include outdoor activities, kid-friendly restaurants, and things to do in Grass Valley and Nevada City. Name specific places.'
    },
    {
      icon: '🍽️',
      title: 'Foodie Tour',
      hint: 'Coffee, lunch, dinner, and treats',
      prompt: "I'm a food lover visiting Nevada County. Map out my perfect day of eating - breakfast, lunch, dinner, and coffee. Name specific restaurants and cafes in Grass Valley and Nevada City."
    },
    {
      icon: '📸',
      title: 'Photo Walk',
      hint: 'Scenic shots + artsy stops',
      prompt: 'Design a half-day photo walk in Nevada County with scenic views, murals, and historic architecture. Include specific places in walking order.'
    },
    {
      icon: '🌙',
      title: 'Date Night',
      hint: 'Dinner, drinks, and live vibe',
      prompt: 'Create a date night itinerary in Nevada County with dinner, live music, and a late-night stop. Include specific place names and timing.'
    }
  ];

  function getContainer() {
    if (!messagesContainer) {
      messagesContainer = document.getElementById('chatMessages');
    }
    return messagesContainer;
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function scrollToBottom() {
    var c = getContainer();
    if (c) {
      c.scrollTop = c.scrollHeight;
    }
  }

  function clearWelcomeState() {
    var c = getContainer();
    if (!c) return;
    var nodes = c.querySelectorAll('.chat-welcome');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].remove();
    }
  }

  function renderStyleCards() {
    return '<div class="chat-style-cards">' + STYLE_CARDS.map(function(card) {
      return '<button type="button" class="chat-style-card" data-chat-style-prompt="' + escapeHTML(card.prompt) + '">' +
        '<div class="chat-style-card-icon">' + card.icon + '</div>' +
        '<div class="chat-style-card-title">' + escapeHTML(card.title) + '</div>' +
        '<div class="chat-style-card-hint">' + escapeHTML(card.hint) + '</div>' +
      '</button>';
    }).join('') + '</div>';
  }

  function wireStyleCardActions(scope) {
    var cards = scope.querySelectorAll('[data-chat-style-prompt]');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function(event) {
        var prompt = event.currentTarget.getAttribute('data-chat-style-prompt') || '';
        if (!prompt) return;
        clearWelcomeState();
        if (window.CulturalMapChatController && typeof window.CulturalMapChatController.submitPrompt === 'function') {
          window.CulturalMapChatController.submitPrompt(prompt);
        }
      });
    }
  }

  /**
   * Render trip planning style cards (shown when dream board has items).
   */
  function renderTripStyleCards() {
    return '<div class="chat-trip-cards">' +
      '<div class="chat-trip-cards-label">Plan your saved places:</div>' +
      TRIP_STYLE_CARDS.map(function(card) {
        return '<button type="button" class="chat-trip-card" data-trip-plan="' + escapeHTML(card.plan) + '" data-trip-prompt="' + escapeHTML(card.prompt) + '">' +
          '<span class="chat-trip-card-icon">' + card.icon + '</span>' +
          '<span class="chat-trip-card-label">' + escapeHTML(card.label) + '</span>' +
          '</button>';
      }).join('') +
      '</div>';
  }

  /**
   * Wire click handlers for trip planning style cards.
   */
  function wireTripCardActions(scope) {
    var cards = scope.querySelectorAll('[data-trip-plan]');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function(event) {
        var prompt = event.currentTarget.getAttribute('data-trip-prompt') || '';
        if (!prompt) return;
        clearWelcomeState();
        if (window.CulturalMapChatController && typeof window.CulturalMapChatController.submitPrompt === 'function') {
          window.CulturalMapChatController.submitPrompt(prompt);
        }
      });
    }
  }

  /**
   * Inject CSS for chat itinerary card and trip style cards (once).
   */
  function injectTripCSS() {
    if (tripCssInjected) return;
    tripCssInjected = true;
    var style = document.createElement('style');
    style.textContent =
      /* Trip planning style cards */
      '.chat-trip-cards { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 0 4px; }' +
      '.chat-trip-cards-label { width: 100%; font-size: 0.75rem; color: #8a8278; margin-bottom: 2px; font-family: "DM Sans", sans-serif; }' +
      '.chat-trip-card { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #c8943e; border-radius: 8px; padding: 6px 12px; cursor: pointer; background: transparent; font-family: "DM Sans", sans-serif; font-size: 0.8rem; color: #1a1612; transition: background 0.15s, box-shadow 0.15s; }' +
      '.chat-trip-card:hover { background: #f5f0e8; box-shadow: 0 1px 4px rgba(200,148,62,0.18); }' +
      '.chat-trip-card-icon { font-size: 1rem; }' +
      '.chat-trip-card-label { font-weight: 500; }' +
      /* Itinerary card rendered in chat bubble */
      '.chat-itin-card { border-left: 3px solid #c8943e; background: #f5f0e8; padding: 12px; border-radius: 8px; margin: 8px 0; }' +
      '.chat-itin-title { font-family: "Playfair Display", serif; font-size: 1rem; font-weight: 700; color: #1a1612; margin-bottom: 4px; }' +
      '.chat-itin-meta { font-family: "DM Sans", sans-serif; font-size: 0.78rem; color: #8a8278; margin-bottom: 8px; }' +
      '.chat-itin-days { margin-bottom: 8px; }' +
      '.chat-itin-day { font-family: "DM Sans", sans-serif; font-size: 0.8rem; color: #1a1612; padding: 2px 0; }' +
      '.chat-itin-cta { display: inline-block; font-family: "DM Sans", sans-serif; font-size: 0.82rem; color: #c8943e; text-decoration: none; font-weight: 600; margin-top: 4px; }' +
      '.chat-itin-cta:hover { text-decoration: underline; }' +
      /* Error fallback */
      '.chat-itin-error { font-style: italic; color: #8a8278; padding: 8px 0; font-family: "DM Sans", sans-serif; font-size: 0.85rem; }';
    document.head.appendChild(style);
  }

  function renderWelcome() {
    injectTripCSS();
    var c = getContainer();
    if (!c) return;
    c.innerHTML = '';
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot chat-welcome';
    div.innerHTML = '<div class="chat-msg__content">' +
      'Hi! I\'m your Nevada County concierge. Ask me about restaurants, galleries, events, hiking trails, or anything to do around here.' +
      '</div>';
    c.appendChild(div);

    // Show trip planning style cards if dream board has items
    var dreamboardCount = 0;
    if (window.CulturalMapDreamboardModel && typeof window.CulturalMapDreamboardModel.getItemCount === 'function') {
      dreamboardCount = window.CulturalMapDreamboardModel.getItemCount();
    }
    if (dreamboardCount > 0) {
      var tripCardsWrap = document.createElement('div');
      tripCardsWrap.className = 'chat-welcome';
      tripCardsWrap.innerHTML = renderTripStyleCards();
      c.appendChild(tripCardsWrap);
      wireTripCardActions(tripCardsWrap);
    }

    var cardsWrap = document.createElement('div');
    cardsWrap.className = 'chat-welcome';
    cardsWrap.innerHTML = renderStyleCards();
    c.appendChild(cardsWrap);
    wireStyleCardActions(cardsWrap);

    scrollToBottom();
  }

  function renderUserMessage(text) {
    clearWelcomeState();
    var c = getContainer();
    if (!c) return;
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--user';
    div.innerHTML = '<div class="chat-msg__content">' + escapeHTML(text) + '</div>';
    c.appendChild(div);
    scrollToBottom();
  }

  function renderBotMessage(html) {
    clearWelcomeState();
    var c = getContainer();
    if (!c) return;
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot';
    div.innerHTML = '<div class="chat-msg__content">' + html + '</div>';
    c.appendChild(div);

    // Wire asset link click handlers
    var links = div.querySelectorAll('.chat-asset-link');
    for (var i = 0; i < links.length; i++) {
      (function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          var payload = {
            pid: link.getAttribute('data-pid'),
            name: link.getAttribute('data-asset-name')
          };
          if (window.CulturalMapDeepLinkBridge && window.CulturalMapDeepLinkBridge.navigate) {
            window.CulturalMapDeepLinkBridge.navigate(payload);
          } else if (window.CulturalMapChatController && window.CulturalMapChatController.handleAssetClick) {
            window.CulturalMapChatController.handleAssetClick(payload.pid, payload.name);
          }
        });
      })(links[i]);
    }

    scrollToBottom();
  }

  function renderTypingIndicator() {
    var c = getContainer();
    if (!c) return null;
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot chat-typing-wrapper';
    div.innerHTML = '<div class="chat-msg__content chat-typing">' +
      '<span class="chat-typing__dot"></span>' +
      '<span class="chat-typing__dot"></span>' +
      '<span class="chat-typing__dot"></span>' +
      '</div>';
    c.appendChild(div);
    scrollToBottom();
    return div;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function renderError(message) {
    var c = getContainer();
    if (!c) return;
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot chat-msg--error';
    div.innerHTML = '<div class="chat-msg__content">' + escapeHTML(message) + '</div>';
    c.appendChild(div);
    scrollToBottom();
  }

  window.CulturalMapChatView = {
    renderWelcome: renderWelcome,
    renderUserMessage: renderUserMessage,
    renderBotMessage: renderBotMessage,
    renderTypingIndicator: renderTypingIndicator,
    removeTypingIndicator: removeTypingIndicator,
    renderError: renderError
  };

})();
