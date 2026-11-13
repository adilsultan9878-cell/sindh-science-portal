/* The main site's menu on the separate pages (question paper, teacher's class, Sindh pages, videos …), so the whole
   portal works as one website: the same five main links (bottom bar on phones) and the same "More" menu as js/app.js.
   Labels come from ui-text.js in the language chosen on the site.
   Use: <script src="/js/site-nav.js" data-current="/teachers" defer></script> after ui-text.js. */
(function () {
  'use strict';

  var ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    lesson: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
    game: '<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 11v3M6.5 12.5h3M15 12h.01M17 14h.01"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h16"/>'
  };
  var current = (document.currentScript && document.currentScript.getAttribute('data-current')) || '';
  // students log in first (js/student.js); the teachers' pages (class, school dashboard, question paper) stay open
  try {
    var me = JSON.parse(localStorage.getItem('ssp1.student'));
    var guest = JSON.parse(localStorage.getItem('ssp1.guest')) === true;   // started without internet (js/student.js)
    if (!(me && me.token) && !guest && !/^\/(class|school|paper|parent|stats|staff)(\/|$)/.test(location.pathname)) {
      location.replace('/login?next=' + encodeURIComponent(location.pathname + location.search + location.hash));
      return;
    }
  } catch (e) { /* storage blocked: leave the page open */ }

  // "Science of Sindh" progress: which Sindh pages this child has opened (shown on My progress; js/student.js
  // copies it to the child's account with the rest of the ssp1.* keys)
  var SINDH_PAGES = { '/sindh/': 'sindh', '/lok/': 'lok', '/sindh/mohenjo-daro/': 'mohenjo', '/mausam/': 'mausam', '/sindh/weather/': 'mausam',
    '/sindh/my-sindh/': 'mySindh', '/citizen/': 'citizen', '/league/': 'league' };
  try {
    var here = location.pathname.replace(/index\.html$/, '').replace(/([^/])$/, '$1/'), seenKey = SINDH_PAGES[here];
    if (seenKey) {
      var seen = JSON.parse(localStorage.getItem('ssp1.sindhSeen') || '{}') || {};
      if (!seen[seenKey]) { var d = new Date(); seen[seenKey] = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
      localStorage.setItem('ssp1.sindhSeen', JSON.stringify(seen));
    }
  } catch (e) { /* storage blocked */ }

  function lang() {
    try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return ['sd', 'ur', 'en'].indexOf(l) >= 0 ? l : 'sd'; } catch (e) { return 'sd'; }
  }
  // the signed-in student (account saved by js/student.js)
  function student() {
    try { var s = JSON.parse(localStorage.getItem('ssp1.student')); return s && s.token ? s : null; } catch (e) { return null; }
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function icon(n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[n] + '</svg>'; }
  function draw() {
    var top = document.querySelector('header.top'), UI = window.UI_TEXT;
    if (!top || !UI) return;
    var l = lang(), s = student();
    function t(k) { var o = UI[k]; return o ? (o[l] || o.en) : k; }
    function cur(href) { return href === current || (current && href.indexOf(current) === 0) ? ' aria-current="page"' : ''; }
    var main = [['/', 'home', 'home', 'home'], ['/class-5/science', 'learn', 'tabLearn', 'lesson'], ['/games', 'gamesTitle', 'tabPlay', 'game'],
      ['/watch', 'videosTitle', 'tabWatch', 'video'], [s ? '/progress' : '/login', s ? 'progress' : 'loginTitle', 'tabMe', 'star']];
    var more = [['/ustad/', 'ustadTitle'], ['/competition', 'competition'], ['/progress', 'progress'], ['/glossary', 'glossary'],
      ['/exam/', 'examTitle'], ['/cards/', 'cardsTitle'], ['/sindh/', 'sindhScience']];
    // teachers' and staff pages have their own small menu and no student bar (the staff side starts at /staff/)
    var staffSide = /^\/(class|school|paper|staff|stats)(\/|$)/.test(location.pathname);
    if (!document.querySelector('script[src^="/js/chat-widget.js"]')) { var cw = document.createElement('script'); cw.src = '/js/chat-widget.js?v=20261113e'; cw.defer = true; document.head.appendChild(cw); } // AI Ustad chat bubble
    if (staffSide) {
      main = [['/staff/', 'staffHome'], ['/class/', 'classTitle'], ['/school/', 'schoolTitle'], ['/paper/', 'questionPaper'], ['/stats/', 'statsTitle'], ['/admin', 'staff']];
      more = [['/', 'toStudentSite']];
    }

    var row = top.querySelector('.top-row');
    var menu = top.querySelector('.more-menu');
    if (!menu && row) { menu = document.createElement('details'); menu.className = 'more-menu'; row.appendChild(menu); }
    if (menu) {
      menu.innerHTML = '<summary>' + icon('list') + '<span>' + esc(t('more')) + '</span></summary><div class="more-panel">' + (s && !staffSide ? '<a class="more-me" href="/progress">' + icon('star') + '<span>' + esc(s.name) + '<small>' + esc(t('progress')) + '</small></span></a>' : '') + more.map(function (x) {
        return '<a href="' + x[0] + '"' + cur(x[0]) + '>' + esc(x[0] === '/login' && s ? s.name : t(x[1])) + '</a>';
      }).join('') + (staffSide ? '' : s ? '<a class="more-auth" href="/login#logout">' + esc(t('logoutBtn')) + '</a>' : '<a class="more-auth" href="/login">' + esc(t('loginTitle')) + '</a>') + '</div>';
    }
    var nav = top.querySelector('.site-nav');
    if (!nav) { nav = document.createElement('nav'); nav.className = 'wrap nav site-nav no-print'; top.appendChild(nav); }
    nav.setAttribute('aria-label', t('menu'));
    // the account (name, log in) sits under More, in the corner, not in this row
    nav.innerHTML = (staffSide ? main : main.slice(0, 4)).map(function (x) { return '<a href="' + x[0] + '"' + cur(x[0]) + '>' + esc(t(x[1])) + '</a>'; }).join('');
    var bar = document.querySelector('.tabbar');
    if (!bar) { bar = document.createElement('nav'); bar.className = 'tabbar no-print'; document.body.appendChild(bar); }
    bar.hidden = staffSide;
    document.body.classList.toggle('staff-side', staffSide);
    bar.setAttribute('aria-label', t('menu'));
    bar.innerHTML = staffSide ? '' : main.map(function (x) { return '<a href="' + x[0] + '"' + cur(x[0]) + '>' + icon(x[3]) + '<span>' + esc(t(x[2])) + '</span></a>'; }).join('');

    // the same footer as the main site (footerHTML in js/app.js)
    var foot = document.querySelector('body > footer');
    if (!foot) { foot = document.createElement('footer'); document.body.insertBefore(foot, bar); }
    foot.classList.add('no-print');
    function col(head, links) {
      return '<nav class="foot-col" aria-label="' + esc(head) + '"><h2>' + esc(head) + '</h2>' + links.map(function (x) {
        return '<a href="' + x[0] + '">' + esc(t(x[1])) + '</a>';
      }).join('') + '</nav>';
    }
    foot.innerHTML = '<div class="wrap foot-grid">' +
        '<div class="foot-about"><p class="foot-brand"><svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1e7a3c"/><path d="M9 23C9 13.5 15.5 8 24 8c0 9.5-5.5 15-15 15z" fill="#fff"/></svg><span>' + esc(t('siteName')) + '</span></p>' +
          '<p>' + esc(t('footerFree')) + '</p>' +
          '<p class="foot-tags"><span>' + esc(t('footFree')) + '</span><span>' + esc(t('footLangs')) + '</span><span>' + esc(t('footNoAds')) + '</span></p></div>' +
        col(t('footLearn'), [['/class-5/science', 'learn'], ['/watch', 'videosTitle'], ['/games', 'gamesTitle'], ['/ustad/', 'ustadTitle'], ['/exam/', 'examTitle'], ['/cards/', 'cardsTitle'], ['/book/', 'bookPdf']]) +
        col(t('sindhShelf'), [['/sindh/', 'sindhScience'], ['/lok/', 'lokScience'], ['/sindh/mohenjo-daro/', 'mohenjoLab'], ['/mausam/', 'mausamLab'], ['/citizen/', 'citizenTitle'], ['/league/', 'leagueTitle']]) +
      '</div>' +
      '<div class="wrap foot-base"><p>© 2026 The Professional Educator · EduPulse Nexus · ' + esc(t('pilot')) + '</p>' +
        '<p><a href="/about">' + esc(t('about')) + '</a> · <a href="/verify">' + esc(t('verifyTitle')) + '</a></p></div>';
  }
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.more-menu[open]').forEach(function (d) {
      if (!d.contains(e.target) || e.target.closest('a')) d.removeAttribute('open');
    });
    // the pages switch language themselves; redraw the menu after they have saved the new choice
    if (e.target.closest && e.target.closest('[data-setlang], [data-lang]')) setTimeout(draw, 60);
  });
  draw();
})();
