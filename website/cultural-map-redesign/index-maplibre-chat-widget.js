(function() {
  'use strict';

  var chatController = window.CulturalMapChatController || {};

  var isOpenState = false;
  var fabEl = null;
  var panelEl = null;

  var CHAT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' +
    '</svg>';

  function init() {
    injectFAB();
    injectPanel();

    // Escape key handler
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpenState) {
        close();
      }
    });

    // Init controller
    if (chatController.init) {
      chatController.init();
    }
  }

  function injectFAB() {
    fabEl = document.createElement('button');
    fabEl.className = 'chat-fab';
    fabEl.setAttribute('aria-label', 'Open chat');
    fabEl.setAttribute('title', 'Ask the Local Concierge');
    fabEl.innerHTML = CHAT_SVG;
    fabEl.addEventListener('click', toggle);
    document.body.appendChild(fabEl);
  }

  function injectPanel() {
    panelEl = document.createElement('div');
    panelEl.className = 'chat-panel';
    panelEl.id = 'chatPanel';
    panelEl.innerHTML =
      '<div class="chat-header">' +
        '<h3>Local Concierge</h3>' +
        '<button class="chat-header__close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="chat-privacy">Queries are logged anonymously to improve local services.</div>' +
      '<div class="chat-messages" id="chatMessages"></div>' +
      '<form class="chat-input-form" id="chatForm" autocomplete="off">' +
        '<input type="text" id="chatInput" class="chat-input" placeholder="Ask about Nevada County..." maxlength="500" />' +
        '<button type="submit" id="chatSendBtn" class="chat-send-btn">Send</button>' +
      '</form>';

    document.body.appendChild(panelEl);

    // Close button handler
    var closeBtn = panelEl.querySelector('.chat-header__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }
  }

  function toggle() {
    if (isOpenState) {
      close();
    } else {
      open();
    }
  }

  function open() {
    if (!panelEl || !fabEl) return;

    isOpenState = true;
    panelEl.classList.add('chat-panel--open');
    fabEl.classList.add('chat-fab--hidden');
    document.body.classList.add('chat-open');

    // GSAP animation if available
    if (window.gsap) {
      gsap.fromTo(panelEl,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    // Focus input
    var input = document.getElementById('chatInput');
    if (input) {
      setTimeout(function() { input.focus(); }, 100);
    }
  }

  function close() {
    if (!panelEl || !fabEl) return;

    isOpenState = false;

    if (window.gsap) {
      gsap.to(panelEl, {
        y: 20, opacity: 0, duration: 0.2, ease: 'power2.in',
        onComplete: function() {
          panelEl.classList.remove('chat-panel--open');
          gsap.set(panelEl, { clearProps: 'all' });
        }
      });
    } else {
      panelEl.classList.remove('chat-panel--open');
    }

    fabEl.classList.remove('chat-fab--hidden');
    document.body.classList.remove('chat-open');
  }

  function isOpen() {
    return isOpenState;
  }

  window.CulturalMapChatWidget = {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
    isOpen: isOpen
  };

})();
