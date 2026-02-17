(function() {
  'use strict';

  var messagesContainer = null;
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

  function renderWelcome() {
    var c = getContainer();
    if (!c) return;
    c.innerHTML = '';
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot chat-welcome';
    div.innerHTML = '<div class="chat-msg__content">' +
      'Hi! I\'m your Nevada County concierge. Ask me about restaurants, galleries, events, hiking trails, or anything to do around here.' +
      '</div>';
    c.appendChild(div);

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
