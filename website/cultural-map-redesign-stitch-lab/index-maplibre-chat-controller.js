(function() {
  'use strict';

  var chatView = window.CulturalMapChatView || {};

  var MAX_MESSAGES = 10; // 5 turns (user + model)
  var MAX_INPUT_LENGTH = 500;

  var state = {
    messages: [],
    isLoading: false,
    sessionHash: ''
  };

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

    // Call API
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: state.messages,
        sessionHash: state.sessionHash
      })
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
      var responseText = data.response || data.text || '';
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
    var assetName = name || pid || '';

    // Try deep link hash approach (works with existing detail panel system)
    if (assetName) {
      window.location.hash = '#place=' + encodeURIComponent(assetName);
    }

    // Close chat panel to reveal detail panel
    if (window.CulturalMapChatWidget && window.CulturalMapChatWidget.close) {
      window.CulturalMapChatWidget.close();
    }
  }

  window.CulturalMapChatController = {
    init: init,
    handleSubmit: handleSubmit,
    handleAssetClick: handleAssetClick,
    parseResponse: parseResponse
  };

})();
