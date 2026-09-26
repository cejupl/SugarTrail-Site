/*
 * The page Dexcom returns to after you approve the connection. Its only job
 * is to hand the authorisation code back to the app and get out of the way.
 *
 * The code is never displayed and never stored here: it is put straight into
 * the app's own URL scheme. Values from the query string are written with
 * textContent, never as markup.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var code = params.get('code');
  var state = params.get('state');
  var error = params.get('error');
  var detail = params.get('error_description');

  var views = {
    working: document.getElementById('working'),
    denied: document.getElementById('denied'),
    idle: document.getElementById('idle'),
  };

  function show(name) {
    Object.keys(views).forEach(function (key) {
      if (views[key]) views[key].hidden = key !== name;
    });
  }

  if (error) {
    var message = document.getElementById('denied-detail');
    if (message) {
      message.textContent =
        detail && detail.length < 300
          ? detail
          : 'Dexcom did not grant access. Nothing was connected, and you can try again from the app.';
    }
    show('denied');
    return;
  }

  if (!code) {
    show('idle');
    return;
  }

  show('working');

  var deep =
    'sugartrail://dexcom/callback?code=' +
    encodeURIComponent(code) +
    (state ? '&state=' + encodeURIComponent(state) : '');

  var open = document.getElementById('open-app');
  if (open) open.setAttribute('href', deep);

  /* Hand off immediately; the button below stays for anyone the jump misses. */
  window.location.replace(deep);
})();
