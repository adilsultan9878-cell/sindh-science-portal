/* Small shared helpers for the separate pages (/exam/, /cards/, /stats/): language, text, safe HTML, the book's
   chapters (database first, then the files in /data, then the main site's last copy on this device), and the
   chapter progress the main site keeps on the phone. Load after config.js and ui-text.js. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var LANGS = ['sd', 'ur', 'en'], RTL = { sd: true, ur: true, en: false };

  function load(k, d) { try { var v = localStorage.getItem('ssp1.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('ssp1.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  var state = { lang: LANGS.indexOf(load('lang', 'sd')) >= 0 ? load('lang', 'sd') : 'sd' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(o) { return o == null ? '' : typeof o === 'object' ? (o[state.lang] != null && o[state.lang] !== '' ? o[state.lang] : (o.ur || o.en || '')) : String(o); }
  // text from the page's own table first, then the shared site texts (js/ui-text.js)
  function text(table, k, vars) {
    var o = (table && table[k]) || (window.UI_TEXT || {})[k], s = o ? L(o) : k;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, n) { return vars[n] != null ? vars[n] : m; });
    return s;
  }

  function applyLang(titleText) {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = RTL[state.lang] ? 'rtl' : 'ltr';
    if (titleText) document.title = titleText + ' | ' + text(null, 'siteName');
    var sn = document.getElementById('site-name'); if (sn) sn.textContent = text(null, 'siteName');
    [].forEach.call(document.querySelectorAll('[data-setlang]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === state.lang)); });
  }
  // calls redraw() after the reader picks another language
  function onLang(redraw) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-setlang]');
      if (!b) return;
      var l = b.getAttribute('data-setlang');
      if (LANGS.indexOf(l) < 0 || l === state.lang) return;
      state.lang = l; save('lang', l); redraw();
    });
  }

  function getJSON(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }); }
  function rpc(fn, args) {
    if (!CFG) return Promise.reject(new Error('no config'));
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(args || {})
    }).then(function (r) { if (!r.ok) throw new Error(fn + ' ' + r.status); return r.json(); });
  }
  var chaptersPromise = null;
  function chapters() {
    if (chaptersPromise) return chaptersPromise;
    var catalog = getJSON('/data/catalog.json').catch(function () { return null; });
    function ids(c) {
      var cls = c && (c.classes || []).filter(function (x) { return x.id === '5'; })[0];
      var s = cls && (cls.subjects || []).filter(function (x) { return x.id === 'science'; })[0];
      return s && s.chapters || [];
    }
    chaptersPromise = rpc('public_subject', { p_class: '5', p_subject: 'science' }).then(function (rows) {
      if (!Array.isArray(rows) || !rows.length) throw new Error('empty');
      return rows;
    }).catch(function () {
      return catalog.then(function (c) {
        return Promise.all(ids(c).map(function (id) { return getJSON('/data/class-5/science/' + id + '.json').catch(function () { return null; }); }));
      }).then(function (rows) { rows = (rows || []).filter(Boolean); if (!rows.length) throw new Error('no files'); return rows; });
    }).catch(function () {
      var saved = load('content.5/science', null);
      if (Array.isArray(saved) && saved.length) return saved;
      throw new Error('no chapters');
    }).then(function (rows) {
      return catalog.then(function (c) {
        var order = ids(c);
        rows = rows.filter(function (ch) { return ch && ch.id && ch.title; });
        rows.sort(function (a, b) {
          var ia = order.indexOf(a.id), ib = order.indexOf(b.id);
          return (ia < 0 ? 1000 + (+a.number || 0) : ia) - (ib < 0 ? 1000 + (+b.number || 0) : ib);
        });
        rows.forEach(function (ch, i) { ch._n = ch.number || i + 1; ch._key = '5/science/' + ch.id; });
        return rows;
      });
    });
    return chaptersPromise;
  }
  function chapterUrl(ch, tab) { return '/class-5/science/' + ch.id + (tab ? '/' + tab : ''); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  window.Kit = { state: state, esc: esc, L: L, text: text, applyLang: applyLang, onLang: onLang, chapters: chapters, chapterUrl: chapterUrl,
    rpc: rpc, load: load, save: save, shuffle: shuffle, today: today };
})();
