(function() {
  'use strict';

  var SUBSCRIBE_URL = '/api/subscribe';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(text, isError) {
    var status = document.getElementById('emailCaptureStatus');
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
    status.classList.toggle('is-success', !isError);
  }

  function getSelectedInterests() {
    var grid = document.getElementById('interestGrid');
    if (!grid) return [];
    var checked = grid.querySelectorAll('input[name="interest"]:checked');
    var interests = [];
    for (var i = 0; i < checked.length; i++) {
      interests.push(checked[i].value);
    }
    return interests;
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

      var interests = getSelectedInterests();
      button.disabled = true;
      button.textContent = 'Subscribing...';
      setStatus('Adding you to the list...', false);

      fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, interests: interests })
      })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.ok) {
            var msg = interests.length > 0
              ? "You're in! Your first Pulse arrives Wednesday."
              : "You're in! Select some interests above to personalize your digest.";
            setStatus(data.message || msg, false);
            input.disabled = true;
            button.textContent = 'Subscribed';
          } else {
            setStatus(data.error || 'Something went wrong. Try again?', true);
            button.disabled = false;
            button.textContent = 'Subscribe';
          }
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
