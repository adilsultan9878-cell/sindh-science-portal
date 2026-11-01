/* The main site's menu on the separate pages (question paper, teacher's class, video guides), so the whole
   portal works as one website. Labels come from ui-text.js in the language chosen on the site.
   Use: <script src="/js/site-nav.js" data-current="/teachers" defer></script> after ui-text.js. */
(function () {
  'use strict';

  var LINKS = [['/', 'home'], ['/class-5/science', 'learn'], ['/watch', 'videosTitle'], ['/games', 'gamesTitle'], ['/competition', 'competition'],
    ['/progress', 'progress'], ['/glossary', 'glossary'], ['/teachers', 'teachers'], ['/search', 'search']];
  var current = (document.currentScript && document.currentScript.getAttribute('data-current')) || '';

  function lang() {
    try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return ['sd', 'ur', 'en'].indexOf(l) >= 0 ? l : 'sd'; } catch (e) { return 'sd'; }
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function draw() {
    var top = document.querySelector('header.top'), UI = window.UI_TEXT;
    if (!top || !UI) return;
    var l = lang(), nav = top.querySelector('.site-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'wrap nav site-nav no-print';
      top.appendChild(nav);
    }
    nav.setAttribute('aria-label', (UI.menu && UI.menu[l]) || 'Menu');
    nav.innerHTML = LINKS.map(function (x) {
      var s = UI[x[1]], text = s ? (s[l] || s.en) : x[1];
      return '<a href="' + x[0] + '"' + (x[0] === current ? ' aria-current="page"' : '') + '>' + esc(text) + '</a>';
    }).join('');
  }
  // the pages switch language themselves; redraw the menu after they have saved the new choice
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-setlang], [data-lang]')) setTimeout(draw, 60);
  });
  draw();
})();
