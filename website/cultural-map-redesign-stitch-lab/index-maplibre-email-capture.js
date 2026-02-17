(function() {
  'use strict';

  // TODO: Replace with actual Apps Script deployment URL before demo.
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/PLACEHOLDER/exec';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(text, isError) {
    var status = document.getElementById('emailCaptureStatus');
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
    status.classList.toggle('is-success', !isError);
  }

  function init() {
    var form = document.getElementById('emailCaptureForm');
    var input = document.getElementById('emailCaptureInput');
    var button = document.getElementById('emailCaptureBtn');
    if (!form || !input || !button) return;

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var email = String(input.value || '').trim();
      if (!EMAIL_RE.test(email)) {
        setStatus('Please enter a valid email address.', true);
        return;
      }

      button.disabled = true;
      button.textContent = 'Subscribing...';
      setStatus('Adding you to the list...', false);

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          timestamp: new Date().toISOString()
        })
      })
        .then(function() {
          setStatus("You're in! Welcome to the loop.", false);
          input.disabled = true;
          button.textContent = 'Subscribed';
        })
        .catch(function() {
          setStatus('Something went wrong. Try again?', true);
          button.disabled = false;
          button.textContent = 'Subscribe';
        });
    });
  }

  window.CulturalMapEmailCapture = {
    init: init
  };
})();

