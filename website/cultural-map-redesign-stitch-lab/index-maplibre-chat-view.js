(function() {
  'use strict';

  var messagesContainer = null;

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

  function renderWelcome() {
    var c = getContainer();
    if (!c) return;
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot';
    div.innerHTML = '<div class="chat-msg__content">' +
      'Hi! I\'m your Nevada County concierge. Ask me about restaurants, galleries, events, hiking trails, or anything to do around here.' +
      '</div>';
    c.appendChild(div);
    scrollToBottom();
  }

  function renderUserMessage(text) {
    var c = getContainer();
    if (!c) return;
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--user';
    div.innerHTML = '<div class="chat-msg__content">' + escapeHTML(text) + '</div>';
    c.appendChild(div);
    scrollToBottom();
  }

  function renderBotMessage(html) {
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
          var pid = link.getAttribute('data-pid');
          var name = link.getAttribute('data-asset-name');
          if (window.CulturalMapChatController && window.CulturalMapChatController.handleAssetClick) {
            window.CulturalMapChatController.handleAssetClick(pid, name);
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
