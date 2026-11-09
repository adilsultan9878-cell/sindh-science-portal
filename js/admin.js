/* Staff panel: sign in, chapters, question bank, leaderboard moderation, badges, users and statistics.
   It talks to the Supabase REST API directly; who may do what is enforced by the database itself
   (row-level security + triggers), so this page only decides what to show. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG;
  var LANGS = ['sd', 'ur', 'en'];
  var LANG_LABEL = { sd: 'Sindhi', ur: 'Urdu', en: 'English' };
  var STATUS_LABEL = { draft: 'Draft', review: 'In review', published: 'Published' };
  var ROLE_LABEL = { pending: 'No access (waiting)', editor: 'Editor', reviewer: 'Reviewer', admin: 'Admin' };
  var SESSION_KEY = 'ssp-staff-session';

  var main = document.getElementById('main');
  var session = readSession();
  var me = null;
  var catalog = null;
  var chapterCache = null;

  /* ---------- small helpers ---------- */

  function readSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
  function saveSession(s) {
    session = s;
    try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Build a DOM element: h('button', { class: 'btn', onclick: fn, text: 'Save' }, [children])
  function h(tag, props, kids) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'value') e.value = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(text, onclick, cls) { return h('button', { type: 'button', class: 'btn small ' + (cls || 'ghost'), text: text, onclick: onclick }); }
  function pill(status) { return '<span class="pill ' + esc(status) + '">' + esc(STATUS_LABEL[status] || ROLE_LABEL[status] || status) + '</span>'; }
  function txt(o, l) { return o && typeof o === 'object' ? (o[l || 'en'] || o.en || '') : (o || ''); }
  function when(iso) { return iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : ''; }
  function eq(v) { return 'eq.' + encodeURIComponent(v); }
  function canPublish() { return me && (me.role === 'reviewer' || me.role === 'admin'); }
  function isAdmin() { return me && me.role === 'admin'; }
  function page(title, intro) {
    main.innerHTML = '<h1>' + esc(title) + '</h1>' + (intro ? '<p class="muted">' + esc(intro) + '</p>' : '');
    document.title = title + ' | Staff Panel';
  }
  function fail(e) {
    console.error(e);
    main.appendChild(h('p', { class: 'msg bad', text: '⚠️ ' + (e && e.message ? e.message : e) }));
  }
  function siteUrl(key) { var p = key.split('/'); return '/class-' + p[0] + '/' + p[1] + '/' + p[2]; }

  /* ---------- Supabase auth + REST ---------- */

  async function authFetch(method, path, body) {
    var headers = { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' };
    if (session && path.indexOf('token?') !== 0) headers.Authorization = 'Bearer ' + session.access_token;
    var r = await fetch(CFG.supabaseUrl + '/auth/v1/' + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined });
    var data = await r.json().catch(function () { return {}; });
    if (!r.ok) throw new Error(data.msg || data.error_description || data.message || ('Error ' + r.status));
    return data;
  }
  function keepSession(d) {
    saveSession({
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: d.expires_at ? +d.expires_at : Math.floor(Date.now() / 1000) + (+d.expires_in || 3600)
    });
  }
  async function refreshIfNeeded() {
    if (!session || session.expires_at - Date.now() / 1000 > 60) return;
    try { keepSession(await authFetch('POST', 'token?grant_type=refresh_token', { refresh_token: session.refresh_token })); }
    catch (e) { saveSession(null); throw new Error('Your session ended. Please sign in again.'); }
  }
  async function db(method, path, body, prefer) {
    await refreshIfNeeded();
    var headers = { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' };
    if (session) headers.Authorization = 'Bearer ' + session.access_token;
    if (prefer) headers.Prefer = prefer;
    var r = await fetch(CFG.supabaseUrl + '/rest/v1/' + path, { method: method, headers: headers, body: body == null ? undefined : JSON.stringify(body) });
    var text = await r.text();
    var data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (r.status === 401) { saveSession(null); route(); throw new Error('Please sign in again.'); }
    if (!r.ok) throw new Error((data && (data.message || data.hint)) || ('Error ' + r.status));
    return data;
  }
  function get(path) { return db('GET', path); }
  function insert(table, row) { return db('POST', table, row, 'return=representation'); }
  function update(table, filter, row) { return db('PATCH', table + '?' + filter, row, 'return=representation'); }
  function remove(table, filter) { return db('DELETE', table + '?' + filter); }
  function rpc(fn, args) { return db('POST', 'rpc/' + fn, args || {}); }

  async function loadCatalog() {
    if (!catalog) catalog = await (await fetch('/data/catalog.json')).json();
    return catalog;
  }
  async function chapterList(force) {
    if (!chapterCache || force) {
      chapterCache = await get('chapters?select=id,class_id,subject_id,chapter_id,number,status,updated_at,title:data->title,lesson:data->lesson&order=class_id.asc,subject_id.asc,number.asc');
    }
    return chapterCache;
  }
  function chapterTitle(key) {
    var c = (chapterCache || []).filter(function (x) { return x.id === key; })[0];
    return c ? c.number + '. ' + txt(c.title) : key;
  }

  /* ---------- form builder (all three languages side by side) ---------- */

  function field(spec, control, getter) {
    return {
      el: h('div', { class: 'fb-field' }, [
        spec.label ? h('label', { class: 'fb-label', text: spec.label }) : null,
        spec.help ? h('p', { class: 'fb-help', text: spec.help }) : null,
        control
      ]),
      get: getter
    };
  }
  function langBoxes(spec, v, multi, lines) {
    v = v || {};
    var boxes = {};
    var grid = h('div', { class: 'fb-three' }, LANGS.map(function (l) {
      var ctl = multi ? h('textarea', { rows: lines ? 6 : 3 }) : h('input', { type: 'text' });
      ctl.setAttribute('lang', l);
      ctl.setAttribute('dir', l === 'en' ? 'ltr' : 'rtl');
      var val = v[l];
      ctl.value = Array.isArray(val) ? val.join('\n') : (val == null ? '' : val);
      boxes[l] = ctl;
      return h('label', null, [LANG_LABEL[l], ctl]);
    }));
    return field(spec, grid, function () {
      var out = {};
      LANGS.forEach(function (l) {
        var s = boxes[l].value;
        out[l] = lines ? s.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) : s.trim();
        if (spec.required && !out[l].length) throw new Error((spec.label || spec.k) + ': the ' + LANG_LABEL[l] + ' text is empty.');
      });
      return out;
    });
  }
  var FB = {
    text: function (spec, v) {
      var i = h('input', { type: 'text', placeholder: spec.placeholder });
      i.value = v == null ? '' : v;
      if (spec.readonly) i.readOnly = true;
      return field(spec, i, function () {
        var s = i.value.trim();
        if (spec.required && !s) throw new Error((spec.label || spec.k) + ' is required.');
        if (s && spec.pattern && !spec.pattern.test(s)) throw new Error((spec.label || spec.k) + ': ' + spec.patternHelp);
        return s;
      });
    },
    number: function (spec, v) {
      var i = h('input', { type: 'number', min: spec.min, max: spec.max });
      i.value = v == null ? (spec.def == null ? '' : spec.def) : v;
      return field(spec, i, function () { var n = parseInt(i.value, 10); return isNaN(n) ? (spec.def || 0) : n; });
    },
    select: function (spec, v) {
      var s = h('select', null, spec.options.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
      s.value = v == null ? spec.options[0][0] : String(v);
      if (spec.onchange) s.addEventListener('change', function () { spec.onchange(s.value); });
      return field(spec, s, function () { return s.value; });
    },
    bool: function (spec, v) {
      var s = h('select', null, [h('option', { value: 'true', text: 'True' }), h('option', { value: 'false', text: 'False' })]);
      s.value = v === false ? 'false' : 'true';
      return field(spec, s, function () { return s.value === 'true'; });
    },
    text3: function (spec, v) { return langBoxes(spec, v, false, false); },
    area3: function (spec, v) { return langBoxes(spec, v, true, false); },
    lines3: function (spec, v) { return langBoxes(spec, v, true, true); },
    json: function (spec, v) {
      var ta = h('textarea', { class: 'code', spellcheck: 'false' });
      ta.value = v == null ? '' : JSON.stringify(v, null, 2);
      return field(spec, ta, function () {
        var s = ta.value.trim();
        if (!s) return null;
        try { return JSON.parse(s); } catch (e) { throw new Error((spec.label || spec.k) + ': not valid JSON (' + e.message + ').'); }
      });
    },
    group: function (spec, v) {
      v = v || {};
      var parts = spec.fields.map(function (f) { return { f: f, b: build(f, f.flat ? v : v[f.k]) }; });
      var box = h(spec.collapsible ? 'details' : 'div', { class: 'fb-group', open: spec.open || !spec.collapsible },
        [spec.label ? h(spec.collapsible ? 'summary' : 'div', { class: 'fb-title', text: spec.label }) : null]
          .concat(spec.help ? [h('p', { class: 'fb-help', text: spec.help })] : [])
          .concat(parts.map(function (p) { return p.b.el; })));
      return {
        el: box,
        get: function () {
          var o = spec.keepExtra ? JSON.parse(JSON.stringify(v)) : {};
          parts.forEach(function (p) {
            var val = p.b.get();
            if (p.f.flat) Object.assign(o, val); else o[p.f.k] = val;
          });
          return o;
        }
      };
    },
    list: function (spec, v) {
      var items = [], holder = h('div');
      function redraw() {
        holder.innerHTML = '';
        items.forEach(function (r, i) {
          r.num.textContent = (spec.itemName || 'Item') + ' ' + (i + 1);
          holder.appendChild(r.el);
        });
      }
      function add(val) {
        var rec = { b: build(spec.item, val), num: h('span') };
        function move(d) {
          var i = items.indexOf(rec), j = i + d;
          if (j < 0 || j >= items.length) return;
          items.splice(i, 1); items.splice(j, 0, rec); redraw();
        }
        rec.el = h('div', { class: 'fb-list-item' }, [
          h('div', { class: 'fb-item-bar' }, [rec.num, h('span', null, [
            btn('↑', function () { move(-1); }), btn('↓', function () { move(1); }),
            btn('✕ Remove', function () {
              if (confirm('Remove ' + rec.num.textContent + '?')) { items.splice(items.indexOf(rec), 1); redraw(); }
            }, 'ghost danger')
          ])]),
          rec.b.el
        ]);
        items.push(rec);
        redraw();
      }
      (v || []).forEach(add);
      var addBtn = btn('+ Add ' + (spec.itemName || 'item').toLowerCase(), function () { add(spec.blank ? spec.blank() : undefined); });
      return field(spec, h('div', null, [holder, addBtn]), function () {
        var out = items.map(function (r) { return r.b.get(); });
        if (spec.min && out.length < spec.min) throw new Error((spec.label || spec.k) + ': add at least ' + spec.min + '.');
        return out;
      });
    }
  };
  function build(spec, v) { return FB[spec.t](spec, v); }

  var DIAGRAM_TYPES = [['none', 'No diagram'], ['tree', 'Tree chart (boxes)'], ['plant', 'Plant'], ['digestive', 'Digestive system'],
    ['watercycle', 'Water cycle'], ['circuit', 'Electric circuit'], ['solar', 'Solar system']];

  var CHAPTER_SPEC = { t: 'group', keepExtra: true, fields: [
    { t: 'group', flat: true, label: 'Basic details', fields: [
      { k: 'number', t: 'number', label: 'Chapter number', min: 1, def: 1 },
      { k: 'icon', t: 'text', label: 'Icon (one emoji)', placeholder: '🌱' },
      { k: 'title', t: 'text3', label: 'Chapter title', required: true },
      { k: 'summary', t: 'area3', label: 'Short summary (shown in the chapter list)' }
    ] },
    { k: 'badge', t: 'group', label: 'Badge for scoring 80% or more', collapsible: true, fields: [
      { k: 'id', t: 'text', label: 'Badge id', placeholder: 'plant_expert', pattern: /^[a-z0-9_]+$/, patternHelp: 'use small letters, numbers and _ only.' },
      { k: 'icon', t: 'text', label: 'Badge icon (emoji)' },
      { k: 'name', t: 'text3', label: 'Badge name' }
    ] },
    { k: 'lesson', t: 'list', label: 'Lesson sections', itemName: 'Section', min: 1,
      blank: function () { return { id: 's' + (Date.now() % 1000) }; },
      item: { t: 'group', fields: [
        { k: 'id', t: 'text', label: 'Section id', required: true, help: 'Short id such as s1, s2. Quiz questions point to it as their topic.' },
        { k: 'title', t: 'text3', label: 'Section title', required: true },
        { k: 'body', t: 'lines3', label: 'Text', help: 'One paragraph per line. Start a line with "- " for a bullet point. Put key words in **double stars** to highlight them.' }
      ] } },
    { k: 'glossary', t: 'list', label: 'Key words (glossary)', itemName: 'Word', item: { t: 'text3' } },
    { k: 'diagram', t: 'group', label: 'Clickable diagram', collapsible: true, fields: [
      { k: 'type', t: 'select', label: 'Picture', options: DIAGRAM_TYPES,
        help: 'Ready-made pictures use fixed part ids — plant: root, stem, leaf, flower, fruit · digestive: mouth, foodpipe, stomach, smallint, largeint · water cycle: sun, evaporation, condensation, precipitation, collection · circuit: battery, wire, switch, bulb · solar: sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune.' },
      { k: 'parts', t: 'list', label: 'Parts', itemName: 'Part', item: { t: 'group', fields: [
        { k: 'id', t: 'text', label: 'Part id', required: true },
        { k: 'label', t: 'text3', label: 'Name' },
        { k: 'info', t: 'area3', label: 'What it does' }
      ] } },
      { k: 'tree', t: 'json', label: 'Tree layout (only for "Tree chart")', help: 'Example: {"id":"living","children":[{"id":"plants"},{"id":"animals"}]} — every id must be a part above.' }
    ] },
    { k: 'games', t: 'list', label: 'Games', itemName: 'Game', item: { t: 'group', fields: [
      { k: 'type', t: 'select', label: 'Game type', options: [['sort', 'Sort into boxes (uses Boxes + Items)'], ['memory', 'Memory cards (uses Pairs)'], ['match', 'Word match (uses Pairs)']] },
      { k: 'title', t: 'text3', label: 'Game title' },
      { k: 'bins', t: 'list', label: 'Boxes (sort game)', itemName: 'Box', item: { t: 'group', fields: [
        { k: 'id', t: 'text', label: 'Box id', required: true }, { k: 'name', t: 'text3', label: 'Box name' }] } },
      { k: 'items', t: 'list', label: 'Items (sort game)', itemName: 'Item', item: { t: 'group', fields: [
        { k: 'emoji', t: 'text', label: 'Emoji (optional)' }, { k: 'text', t: 'text3', label: 'Item name' }, { k: 'bin', t: 'text', label: 'Correct box id', required: true }] } },
      { k: 'pairs', t: 'list', label: 'Pairs (memory and match games)', itemName: 'Pair', item: { t: 'group', fields: [
        { k: 'a', t: 'text3', label: 'Word' }, { k: 'b', t: 'text3', label: 'Its partner' }] } }
    ] } },
    { k: 'experiment', t: 'group', label: 'Home experiment', collapsible: true, fields: [
      { k: 'title', t: 'text3', label: 'Title' },
      { k: 'materials', t: 'list', label: 'Things needed', itemName: 'Thing', item: { t: 'text3' } },
      { k: 'steps', t: 'list', label: 'Steps', itemName: 'Step', item: { t: 'text3' } },
      { k: 'learn', t: 'area3', label: 'What did we learn?' },
      { k: 'safety', t: 'area3', label: 'Safety note' }
    ] },
    { k: 'worksheet', t: 'group', label: 'Printable worksheet', collapsible: true, fields: [
      { k: 'blanks', t: 'list', label: 'A. Fill in the blanks', itemName: 'Blank', help: 'Write ____ (four underscores) where the blank goes, once in each language.', item: { t: 'group', fields: [
        { k: 'text', t: 'text3', label: 'Sentence' }, { k: 'answer', t: 'text3', label: 'Answer (also shown in the word box)' }] } },
      { k: 'tf', t: 'list', label: 'B. True or false', itemName: 'Statement', item: { t: 'group', fields: [
        { k: 'text', t: 'text3', label: 'Statement' }, { k: 'answer', t: 'bool', label: 'Answer' }] } },
      { k: 'match', t: 'list', label: 'C. Match the columns', itemName: 'Pair', item: { t: 'group', fields: [
        { k: 'a', t: 'text3', label: 'Column A' }, { k: 'b', t: 'text3', label: 'Column B (correct partner)' }] } },
      { k: 'short', t: 'list', label: 'D. Short questions', itemName: 'Question', item: { t: 'group', fields: [
        { k: 'q', t: 'text3', label: 'Question' }, { k: 'a', t: 'area3', label: 'Model answer (teachers only)' }] } },
      { k: 'draw', t: 'area3', label: 'E. Draw and label' }
    ] }
  ] };

  /* ---------- frame & routing ---------- */

  function renderNav() {
    var links = [['#chapters', 'Chapters'], ['#questions', 'Question bank'], ['#leaderboard', 'Leaderboard'], ['#badges', 'Badges'], ['#stats', 'Statistics']];
    if (isAdmin()) links.push(['#users', 'Users']);
    links.push(['#password', 'Change password'], ['/', 'View website']);
    var cur = location.hash.split('/')[0] || '#chapters';
    document.getElementById('anav').innerHTML = links.map(function (l) {
      return '<a href="' + l[0] + '"' + (l[0] === cur ? ' aria-current="page"' : '') + (l[0] === '/' ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l[1]) + '</a>';
    }).join('');
    var who = document.getElementById('who');
    who.innerHTML = esc(me.email || '') + ' · ' + pill(me.role) + ' ';
    who.appendChild(btn('Sign out', signOut));
  }
  async function signOut() {
    try { await authFetch('POST', 'logout'); } catch (e) { /* already signed out */ }
    saveSession(null);
    me = null;
    location.hash = '';
    route();
  }

  async function route() {
    var hp = new URLSearchParams(location.hash.slice(1));
    if (hp.get('access_token')) {          // coming back from a confirmation or password-reset email
      keepSession({ access_token: hp.get('access_token'), refresh_token: hp.get('refresh_token'), expires_in: hp.get('expires_in') });
      history.replaceState(null, '', location.pathname + (hp.get('type') === 'recovery' ? '#password' : '#chapters'));
    } else if (hp.get('error_description')) {
      history.replaceState(null, '', location.pathname);
      return viewLogin(hp.get('error_description'));
    }
    if (!session) return viewLogin();
    try {
      var u = await authFetch('GET', 'user');
      var rows = await get('profiles?select=id,email,role&id=' + eq(u.id));
      me = rows[0] || { id: u.id, email: u.email, role: 'pending' };
      me.email = me.email || u.email;
    } catch (e) {
      saveSession(null);
      return viewLogin(e.message);
    }
    if (me.role === 'pending') return viewPending();
    renderNav();
    var parts = location.hash.slice(1).split('/');
    var name = parts[0] || 'chapters', arg = decodeURIComponent(parts.slice(1).join('/'));
    var views = { chapters: viewChapters, chapter: viewChapterEdit, questions: viewQuestions, question: viewQuestionEdit,
      leaderboard: viewLeaderboard, badges: viewBadges, badge: viewBadgeEdit, stats: viewStats, users: viewUsers, password: viewPassword };
    try { await (views[name] || viewChapters)(arg); } catch (e) { fail(e); }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- sign in / sign up ---------- */

  function viewLogin(message, mode) {
    mode = mode || 'signin';
    document.getElementById('anav').innerHTML = '';
    document.getElementById('who').innerHTML = '';
    document.title = 'Staff sign in | Sindh Science Learning Portal';
    var titles = { signin: 'Staff sign in', signup: 'Create a staff account', reset: 'Reset your password' };
    var email = h('input', { type: 'email', autocomplete: 'email', required: true });
    var pw = h('input', { type: 'password', autocomplete: mode === 'signup' ? 'new-password' : 'current-password', minlength: '8', required: true });
    var msg = h('p', { class: 'msg' + (message ? ' bad' : ''), text: message || '' });
    var submit = h('button', { class: 'btn big', type: 'submit', text: mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link' });
    var form = h('form', { class: 'card auth-box' }, [
      h('h1', { text: titles[mode] }),
      mode === 'signup' ? h('p', { class: 'muted', text: 'For admins, reviewers and content editors only. Students do not need an account. A new account can do nothing until an admin gives it a role (the very first account becomes the admin).' }) : null,
      h('label', { class: 'field' }, [h('span', { text: 'Email' }), email]),
      mode !== 'reset' ? h('label', { class: 'field' }, [h('span', { text: 'Password (at least 8 characters)' }), pw]) : null,
      submit, msg,
      h('p', null, [
        mode !== 'signin' ? h('a', { href: '#', text: 'Back to sign in', onclick: function (e) { e.preventDefault(); viewLogin('', 'signin'); } }) : null,
        mode === 'signin' ? h('a', { href: '#', text: 'Create a staff account', onclick: function (e) { e.preventDefault(); viewLogin('', 'signup'); } }) : null,
        mode === 'signin' ? ' · ' : null,
        mode === 'signin' ? h('a', { href: '#', text: 'Forgot password?', onclick: function (e) { e.preventDefault(); viewLogin('', 'reset'); } }) : null
      ])
    ]);
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      submit.disabled = true;
      msg.className = 'msg'; msg.textContent = 'Please wait…';
      var back = encodeURIComponent(location.origin + '/admin');
      try {
        if (mode === 'signin') {
          keepSession(await authFetch('POST', 'token?grant_type=password', { email: email.value.trim(), password: pw.value }));
          location.hash = '#chapters';
          await route();
          return;
        }
        if (mode === 'signup') {
          var d = await authFetch('POST', 'signup?redirect_to=' + back, { email: email.value.trim(), password: pw.value });
          if (d.access_token) { keepSession(d); return route(); }
          msg.className = 'msg ok';
          msg.textContent = 'Account created. Ask an admin to give you a role on the Users page — that also confirms your email — then come back here and sign in. (If a confirmation email arrives, you may open it instead.)';
        } else {
          await authFetch('POST', 'recover?redirect_to=' + back, { email: email.value.trim() });
          msg.className = 'msg ok';
          msg.textContent = 'If this email has an account, a reset link is on its way. Open it, then choose a new password.';
        }
      } catch (err) {
        msg.className = 'msg bad';
        var m = err.message;
        if (mode === 'signin' && /invalid login/i.test(m)) m = 'Wrong email or password. If you do not have an account yet, use "Create a staff account" below.';
        else if (mode === 'signin' && /not confirmed/i.test(m)) m = 'This account is not confirmed yet. Ask an admin to give you a role on the Users page — that confirms it.';
        msg.textContent = m;
      }
      submit.disabled = false;
    });
    main.innerHTML = '';
    main.appendChild(form);
  }

  function viewPending() {
    document.getElementById('anav').innerHTML = '';
    var who = document.getElementById('who');
    who.textContent = me.email + ' ';
    who.appendChild(btn('Sign out', signOut));
    page('Waiting for approval');
    main.appendChild(h('div', { class: 'card' }, [
      h('p', { text: 'Your account (' + me.email + ') was created. An admin must give it a role — Editor, Reviewer or Admin — before you can use the staff panel.' }),
      h('p', { class: 'muted', text: 'Editors write and edit drafts. Reviewers also check and publish. Admins also manage users.' }),
      btn('Check again', function () { route(); }, '')
    ]));
  }

  async function viewPassword() {
    page('Change password', 'Choose a new password of at least 8 characters.');
    var a = h('input', { type: 'password', autocomplete: 'new-password', minlength: '8' });
    var b = h('input', { type: 'password', autocomplete: 'new-password', minlength: '8' });
    var msg = h('p', { class: 'msg' });
    var form = h('form', { class: 'card auth-box' }, [
      h('label', { class: 'field' }, [h('span', { text: 'New password' }), a]),
      h('label', { class: 'field' }, [h('span', { text: 'Type it again' }), b]),
      h('button', { class: 'btn', type: 'submit', text: 'Save new password' }), msg
    ]);
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (a.value.length < 8) { msg.className = 'msg bad'; msg.textContent = 'Use at least 8 characters.'; return; }
      if (a.value !== b.value) { msg.className = 'msg bad'; msg.textContent = 'The two passwords are different.'; return; }
      try {
        await authFetch('PUT', 'user', { password: a.value });
        msg.className = 'msg ok'; msg.textContent = '✔ Password changed.';
        a.value = b.value = '';
      } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
    });
    main.appendChild(form);
  }

  /* ---------- chapters ---------- */

  async function setStatus(table, id, status, done) {
    try { await update(table, 'id=' + eq(id), { status: status }); chapterCache = null; done(); }
    catch (e) { alert(e.message); }
  }
  function statusButtons(table, row, done) {
    var out = [];
    if (row.status === 'published') {
      if (canPublish()) out.push(btn('Unpublish', function () { setStatus(table, row.id, 'draft', done); }));
    } else {
      if (row.status === 'draft') out.push(btn('Send to review', function () { setStatus(table, row.id, 'review', done); }));
      if (row.status === 'review') out.push(btn('Back to draft', function () { setStatus(table, row.id, 'draft', done); }));
      if (canPublish()) out.push(btn('Publish', function () { setStatus(table, row.id, 'published', done); }, ''));
    }
    return out;
  }

  async function viewChapters() {
    page('Chapters', 'Every chapter has a lesson, diagram, games, experiment and worksheet in all three languages. Only published chapters appear on the website.');
    var bar = h('div', { class: 'toolbar' }, [h('a', { class: 'btn', href: '#chapter/new', text: '+ New chapter' })]);
    main.appendChild(bar);
    var rows = await chapterList(true);
    var table = h('table', { class: 'table' });
    table.innerHTML = '<thead><tr><th>#</th><th>Chapter</th><th>Class / subject</th><th>Status</th><th>Last change</th><th>Actions</th></tr></thead>';
    var tbody = h('tbody');
    rows.forEach(function (r) {
      var tr = h('tr', { html: '<td>' + r.number + '</td><td><strong>' + esc(txt(r.title)) + '</strong><span class="rtl">' + esc(txt(r.title, 'sd')) + '</span></td>' +
        '<td>' + esc(r.class_id) + ' / ' + esc(r.subject_id) + '</td><td>' + pill(r.status) + '</td><td>' + esc(when(r.updated_at)) + '</td>' });
      var td = h('td');
      td.appendChild(h('a', { class: 'btn small', href: '#chapter/' + r.id, text: 'Edit' }));
      td.appendChild(h('a', { class: 'btn small ghost', href: '#questions/' + r.id, text: 'Questions' }));
      statusButtons('chapters', r, viewChapters).forEach(function (b) { td.appendChild(b); });
      if (r.status === 'published') td.appendChild(h('a', { class: 'btn small ghost', href: siteUrl(r.id), target: '_blank', rel: 'noopener', text: 'View' }));
      if (isAdmin()) td.appendChild(btn('Delete', async function () {
        if (!confirm('Delete "' + txt(r.title) + '" and all its questions? This cannot be undone.')) return;
        try { await remove('chapters', 'id=' + eq(r.id)); viewChapters(); } catch (e) { alert(e.message); }
      }, 'ghost danger'));
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    main.appendChild(rows.length ? h('div', { class: 'table-wrap' }, [table]) : h('p', { text: 'No chapters yet.' }));
  }

  async function viewChapterEdit(key) {
    var isNew = key === 'new' || !key;
    var cat = await loadCatalog();
    var row = isNew ? { status: 'draft', class_id: '5', subject_id: 'science', data: { number: 1, lesson: [{ id: 's1' }], glossary: [], games: [], diagram: { type: 'none' } } }
      : (await get('chapters?select=*&id=' + eq(key)))[0];
    if (!row) { page('Chapter not found'); return; }
    page(isNew ? 'New chapter' : 'Edit chapter: ' + txt(row.data.title), 'Fill each text in Sindhi, Urdu and English. Questions are edited in the Question bank.');

    var idBox;
    var clsSel, subjSel, slug;
    if (isNew) {
      clsSel = h('select', null, cat.classes.map(function (c) { return h('option', { value: c.id, text: txt(c.name) }); }));
      subjSel = h('select');
      var fillSubjects = function () {
        var c = cat.classes.filter(function (x) { return x.id === clsSel.value; })[0];
        subjSel.innerHTML = '';
        (c.subjects.length ? c.subjects : [{ id: 'science', name: { en: 'Science' } }]).forEach(function (s) { subjSel.appendChild(h('option', { value: s.id, text: txt(s.name) })); });
      };
      clsSel.addEventListener('change', fillSubjects);
      fillSubjects();
      slug = h('input', { type: 'text', placeholder: 'e.g. light-and-sound' });
      idBox = h('div', { class: 'fb-group' }, [
        h('div', { class: 'fb-title', text: 'Where this chapter belongs' }),
        h('div', { class: 'fb-field' }, [h('label', { class: 'fb-label', text: 'Class' }), clsSel]),
        h('div', { class: 'fb-field' }, [h('label', { class: 'fb-label', text: 'Subject' }), subjSel]),
        h('div', { class: 'fb-field' }, [h('label', { class: 'fb-label', text: 'Chapter id (used in the web address)' }),
          h('p', { class: 'fb-help', text: 'Small English letters, numbers and dashes only. It cannot be changed later.' }), slug])
      ]);
    } else {
      idBox = h('p', { class: 'muted', html: 'ID: <code>' + esc(row.id) + '</code> · Status: ' + pill(row.status) + ' · Last change: ' + esc(when(row.updated_at)) });
    }
    var doc = JSON.parse(JSON.stringify(row.data));
    if (!doc.diagram) doc.diagram = { type: 'none' };
    delete doc.quiz;
    var form = build(CHAPTER_SPEC, doc);
    main.appendChild(idBox);
    main.appendChild(form.el);

    var locked = row.status === 'published' && !canPublish();
    var msg = h('span', { class: 'msg' });
    async function save(status) {
      var data;
      try { data = form.get(); } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; return; }
      if (!data.diagram || data.diagram.type === 'none') delete data.diagram;
      else if (data.diagram.type !== 'tree') delete data.diagram.tree;
      data.games = (data.games || []).map(function (g) {
        if (g.type === 'sort') delete g.pairs; else { delete g.bins; delete g.items; }
        return g;
      });
      var ids = data.lesson.map(function (s) { return s.id; });
      if (ids.some(function (x, i) { return ids.indexOf(x) !== i; })) { msg.className = 'msg bad'; msg.textContent = 'Two lesson sections have the same id.'; return; }
      var body = { number: data.number || 1, data: data, status: status || row.status };
      try {
        if (isNew) {
          var cid = slug.value.trim();
          if (!/^[a-z0-9-]+$/.test(cid)) throw new Error('Chapter id: use small English letters, numbers and dashes only.');
          data.id = cid;
          body.id = clsSel.value + '/' + subjSel.value + '/' + cid;
          body.class_id = clsSel.value; body.subject_id = subjSel.value; body.chapter_id = cid;
          await insert('chapters', body);
          chapterCache = null;
          location.hash = '#chapter/' + body.id;
          return;
        }
        data.id = row.chapter_id;
        var saved = await update('chapters', 'id=' + eq(row.id), body);
        row = saved[0] || row;
        chapterCache = null;
        msg.className = 'msg ok';
        msg.innerHTML = '✔ Saved · ' + pill(row.status);
      } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
    }
    var bar = h('div', { class: 'sticky-bar' });
    if (locked) {
      bar.appendChild(h('span', { class: 'msg bad', text: 'This chapter is published. Only a reviewer or admin can change it.' }));
    } else {
      bar.appendChild(btn('Save', function () { save(); }, ''));
      if (row.status !== 'published') bar.appendChild(btn('Save and send to review', function () { save('review'); }));
      if (canPublish()) bar.appendChild(btn(row.status === 'published' ? 'Save (stays published)' : 'Save and publish', function () { save('published'); }));
    }
    if (!isNew) bar.appendChild(h('a', { class: 'btn small ghost', href: '#questions/' + row.id, text: 'Questions of this chapter' }));
    bar.appendChild(msg);
    main.appendChild(bar);
  }

  /* ---------- question bank ---------- */

  async function viewQuestions(chapterKey) {
    page('Question bank', 'MCQ, true/false and matching questions. Each question holds its Sindhi, Urdu and English versions together.');
    var chs = await chapterList();
    var all = await get('questions?select=id,chapter_key,type,topic,difficulty,status,sort,data&order=chapter_key.asc,sort.asc,id.asc');
    var fChapter = h('select', null, [h('option', { value: '', text: 'All chapters' })].concat(chs.map(function (c) { return h('option', { value: c.id, text: c.number + '. ' + txt(c.title) }); })));
    fChapter.value = chapterKey || '';
    var fType = h('select', null, [['', 'All types'], ['mcq', 'MCQ'], ['tf', 'True / false'], ['match', 'Matching']].map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
    var fDiff = h('select', null, [['', 'All levels'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']].map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
    var fStatus = h('select', null, [['', 'Any status'], ['draft', 'Draft'], ['review', 'In review'], ['published', 'Published']].map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
    var fText = h('input', { type: 'search', placeholder: 'Search text (any language)' });
    var newBtn = h('a', { class: 'btn', text: '+ New question' });
    var count = h('span', { class: 'muted' });
    main.appendChild(h('div', { class: 'toolbar' }, [newBtn, fChapter, fType, fDiff, fStatus, fText, count]));
    var wrapBox = h('div', { class: 'table-wrap' });
    main.appendChild(wrapBox);

    function draw() {
      newBtn.href = '#question/new' + (fChapter.value ? '@' + fChapter.value : '');
      var q = fText.value.trim().toLowerCase();
      var rows = all.filter(function (r) {
        return (!fChapter.value || r.chapter_key === fChapter.value) && (!fType.value || r.type === fType.value) &&
          (!fDiff.value || r.difficulty === fDiff.value) && (!fStatus.value || r.status === fStatus.value) &&
          (!q || JSON.stringify(r.data).toLowerCase().indexOf(q) >= 0 || r.id.toLowerCase().indexOf(q) >= 0);
      });
      count.textContent = 'Showing ' + rows.length + ' of ' + all.length;
      var table = h('table', { class: 'table', html: '<thead><tr><th>Question</th><th>Chapter</th><th>Type</th><th>Level</th><th>Status</th><th>Actions</th></tr></thead>' });
      var tbody = h('tbody');
      rows.forEach(function (r) {
        var tr = h('tr', { html: '<td class="q-cell"><strong>' + esc(txt(r.data.q)) + '</strong><span class="rtl">' + esc(txt(r.data.q, 'sd')) + '</span><small class="muted">' + esc(r.id) + ' · topic ' + esc(r.topic || '-') + '</small></td>' +
          '<td>' + esc(chapterTitle(r.chapter_key)) + '</td><td>' + esc(r.type) + '</td><td>' + esc(r.difficulty) + '</td><td>' + pill(r.status) + '</td>' });
        var td = h('td');
        td.appendChild(h('a', { class: 'btn small', href: '#question/' + encodeURIComponent(r.id), text: 'Edit' }));
        statusButtons('questions', r, function () { route(); }).forEach(function (b) { td.appendChild(b); });
        if (canPublish()) td.appendChild(btn('Delete', async function () {
          if (!confirm('Delete question ' + r.id + '?')) return;
          try { await remove('questions', 'id=' + eq(r.id)); all = all.filter(function (x) { return x !== r; }); draw(); } catch (e) { alert(e.message); }
        }, 'ghost danger'));
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrapBox.innerHTML = '';
      wrapBox.appendChild(rows.length ? table : h('p', { text: 'No questions match.' }));
    }
    [fChapter, fType, fDiff, fStatus].forEach(function (s) { s.addEventListener('change', draw); });
    fText.addEventListener('input', draw);
    draw();
  }

  async function viewQuestionEdit(arg) {
    var chs = await chapterList(true);
    if (!chs.length) { page('Add a chapter first'); return; }
    var isNew = arg.indexOf('new') === 0;
    var row = isNew
      ? { id: '', chapter_key: arg.split('@')[1] || chs[0].id, type: 'mcq', topic: 's1', difficulty: 'medium', status: 'draft', sort: 0, data: { q: {}, options: [{}, {}, {}, {}], answer: 0 } }
      : (await get('questions?select=*&id=' + eq(arg)))[0];
    if (!row) { page('Question not found'); return; }
    page(isNew ? 'New question' : 'Edit question ' + row.id);

    var chSel = h('select', null, chs.map(function (c) { return h('option', { value: c.id, text: c.number + '. ' + txt(c.title) }); }));
    chSel.value = row.chapter_key;
    var idIn = h('input', { type: 'text' });
    idIn.value = row.id;
    if (!isNew) idIn.readOnly = true;
    var typeSel = h('select', null, [['mcq', 'Multiple choice (MCQ)'], ['tf', 'True / false'], ['match', 'Matching']].map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
    typeSel.value = row.type;
    var topicSel = h('select');
    function fillTopics() {
      var c = chs.filter(function (x) { return x.id === chSel.value; })[0];
      topicSel.innerHTML = '';
      ((c && c.lesson) || []).forEach(function (s) { topicSel.appendChild(h('option', { value: s.id, text: s.id + ' — ' + txt(s.title) })); });
      topicSel.value = row.topic;
      if (isNew && !idIn.value) idIn.value = chSel.value.split('/')[2] + '-' + Date.now().toString(36);
    }
    chSel.addEventListener('change', function () { if (isNew) idIn.value = ''; fillTopics(); });
    fillTopics();
    var diffSel = h('select', null, ['easy', 'medium', 'hard'].map(function (d) { return h('option', { value: d, text: d }); }));
    diffSel.value = row.difficulty;
    var sortIn = h('input', { type: 'number', min: '0' });
    sortIn.value = row.sort;

    var qText = build({ t: 'area3', label: 'Question', required: true }, row.data.q);
    var opts = build({ t: 'list', label: 'Options', itemName: 'Option', min: 2, item: { t: 'text3', label: 'Option text', required: true } }, row.data.options || [{}, {}, {}, {}]);
    var right = h('input', { type: 'number', min: '1' });
    right.value = row.type === 'mcq' ? (row.data.answer || 0) + 1 : 1;
    var tf = build({ t: 'bool', label: 'Correct answer' }, row.type === 'tf' ? row.data.answer : true);
    var pairs = build({ t: 'list', label: 'Pairs (left side and its correct right side)', itemName: 'Pair', min: 2, item: { t: 'group', fields: [
      { k: 'left', t: 'text3', label: 'Left', required: true }, { k: 'right', t: 'text3', label: 'Right (correct match)', required: true }] } }, row.data.pairs || [{}, {}, {}, {}]);

    var mcqBox = h('div', { class: 'fb-group' }, [opts.el, h('div', { class: 'fb-field' }, [h('label', { class: 'fb-label', text: 'Correct option number (1 = first option)' }), right])]);
    var tfBox = h('div', { class: 'fb-group' }, [tf.el]);
    var matchBox = h('div', { class: 'fb-group' }, [pairs.el]);
    function showType() {
      mcqBox.hidden = typeSel.value !== 'mcq';
      tfBox.hidden = typeSel.value !== 'tf';
      matchBox.hidden = typeSel.value !== 'match';
    }
    typeSel.addEventListener('change', showType);
    showType();

    function line(label, ctl, help) {
      return h('div', { class: 'fb-field' }, [h('label', { class: 'fb-label', text: label }), help ? h('p', { class: 'fb-help', text: help }) : null, ctl]);
    }
    main.appendChild(h('div', { class: 'fb-group' }, [
      line('Chapter', chSel), line('Question id', idIn, isNew ? 'Filled in for you; you may change it before the first save.' : null),
      line('Type', typeSel), line('Topic (lesson section the question tests)', topicSel), line('Difficulty', diffSel),
      line('Order in the quiz (smaller comes first)', sortIn)
    ]));
    if (!isNew) main.appendChild(h('p', { class: 'muted', html: 'Status: ' + pill(row.status) + ' · Last change: ' + esc(when(row.updated_at)) }));
    main.appendChild(qText.el);
    main.appendChild(mcqBox);
    main.appendChild(tfBox);
    main.appendChild(matchBox);

    var msg = h('span', { class: 'msg' });
    async function save(status) {
      var body;
      try {
        var data = { q: qText.get() };
        if (typeSel.value === 'mcq') {
          data.options = opts.get();
          var n = parseInt(right.value, 10);
          if (!(n >= 1 && n <= data.options.length)) throw new Error('Correct option must be between 1 and ' + data.options.length + '.');
          data.answer = n - 1;
        } else if (typeSel.value === 'tf') {
          data.answer = tf.get();
        } else {
          data.pairs = pairs.get();
        }
        var id = idIn.value.trim();
        if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error('Question id: use letters, numbers, - and _ only.');
        body = { chapter_key: chSel.value, type: typeSel.value, topic: topicSel.value || null, difficulty: diffSel.value,
          sort: parseInt(sortIn.value, 10) || 0, data: data, status: status || row.status };
        if (isNew) {
          body.id = id;
          await insert('questions', body);
          location.hash = '#question/' + encodeURIComponent(id);
          return;
        }
        var saved = await update('questions', 'id=' + eq(row.id), body);
        row = saved[0] || row;
        msg.className = 'msg ok';
        msg.innerHTML = '✔ Saved · ' + pill(row.status);
      } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
    }
    var bar = h('div', { class: 'sticky-bar' });
    if (row.status === 'published' && !canPublish()) {
      bar.appendChild(h('span', { class: 'msg bad', text: 'This question is published. Only a reviewer or admin can change it.' }));
    } else {
      bar.appendChild(btn('Save', function () { save(); }, ''));
      if (row.status !== 'published') bar.appendChild(btn('Save and send to review', function () { save('review'); }));
      if (canPublish()) bar.appendChild(btn(row.status === 'published' ? 'Save (stays published)' : 'Save and publish', function () { save('published'); }));
    }
    bar.appendChild(h('a', { class: 'btn small ghost', href: '#questions/' + chSel.value, text: 'Back to the list' }));
    bar.appendChild(msg);
    main.appendChild(bar);
  }

  /* ---------- leaderboard moderation ---------- */

  async function viewLeaderboard() {
    page('Leaderboard', 'Competition scores from all students. Hide any nickname that is rude or looks like a real full name.');
    var rows = await get('leaderboard?select=*&order=created_at.desc&limit=300');
    var table = h('table', { class: 'table', html: '<thead><tr><th>When</th><th>Nickname</th><th>Score</th><th>Time</th><th>City</th><th>Shown</th><th>Actions</th></tr></thead>' });
    var tbody = h('tbody');
    rows.forEach(function (r) {
      var tr = h('tr', { html: '<td>' + esc(when(r.created_at)) + '</td><td>' + esc(r.nickname) + '</td><td>' + r.score + ' / ' + r.total + '</td><td>' +
        Math.floor(r.secs / 60) + ':' + String(r.secs % 60).padStart(2, '0') + '</td><td>' + esc(r.city || '—') + '</td><td>' + (r.hidden ? pill('draft').replace('Draft', 'Hidden') : pill('published').replace('Published', 'Visible')) + '</td>' });
      var td = h('td');
      td.appendChild(btn(r.hidden ? 'Show' : 'Hide', async function () {
        try { await update('leaderboard', 'id=eq.' + r.id, { hidden: !r.hidden }); viewLeaderboard(); } catch (e) { alert(e.message); }
      }));
      if (isAdmin()) td.appendChild(btn('Delete', async function () {
        if (!confirm('Delete this score?')) return;
        try { await remove('leaderboard', 'id=eq.' + r.id); viewLeaderboard(); } catch (e) { alert(e.message); }
      }, 'ghost danger'));
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    main.appendChild(rows.length ? h('div', { class: 'table-wrap' }, [table]) : h('p', { text: 'No scores yet.' }));
  }

  /* ---------- badges ---------- */

  // How a badge is earned. The website checks these on the student's own device.
  var BADGE_RULES = [
    ['quizzes', 'Finish this many chapter quizzes'],
    ['perfect', 'Score at least this % in any chapter quiz'],
    ['all_quizzes', 'Finish the quiz of every chapter (number not used)'],
    ['games', 'Finish this many games'],
    ['all_games', 'Finish a game in every chapter (number not used)'],
    ['streak', 'Answer the daily question this many days in a row'],
    ['competitions', 'Finish this many competitions'],
    ['points', 'Collect this many points']
  ];
  function ruleText(b) {
    var r = BADGE_RULES.filter(function (x) { return x[0] === b.rule; })[0];
    return r ? r[1].replace(' (number not used)', '').replace('this many', b.goal).replace('this %', b.goal + '%') : b.rule;
  }

  async function viewBadges() {
    page('Badges', 'General badges students earn on the website. Each chapter also has its own badge for scoring 80% or more; edit that one in the chapter.');
    var rows = await get('badges?select=*&order=sort.asc,id.asc');
    if (isAdmin()) main.appendChild(h('p', null, [h('a', { class: 'btn small', href: '#badge/new', text: '+ New badge' })]));
    var table = h('table', { class: 'table', html: '<thead><tr><th></th><th>Name</th><th>How to earn it</th><th>Shown</th><th></th></tr></thead>' });
    var tbody = h('tbody');
    rows.forEach(function (b) {
      var tr = h('tr', { html: '<td style="font-size:1.6rem">' + esc(b.icon) + '</td><td>' + esc(txt(b.name)) + '<br><small class="muted" lang="ur">' + esc(txt(b.name, 'ur')) + '</small></td>' +
        '<td>' + esc(ruleText(b)) + '</td><td>' + (b.active ? pill('published').replace('Published', 'On') : pill('draft').replace('Draft', 'Off')) + '</td>' });
      tr.appendChild(h('td', null, [h('a', { class: 'btn small ghost', href: '#badge/' + encodeURIComponent(b.id), text: isAdmin() ? 'Edit' : 'View' })]));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    main.appendChild(h('div', { class: 'table-wrap' }, [table]));
    if (!isAdmin()) main.appendChild(h('p', { class: 'muted', text: 'Only admins can change badges.' }));
  }

  async function viewBadgeEdit(id) {
    var isNew = id === 'new';
    var row = isNew ? { id: '', icon: '🏅', name: {}, descr: {}, rule: 'points', goal: 100, sort: 10, active: true }
      : (await get('badges?select=*&id=' + eq(id)))[0];
    if (!row) { page('Badge not found'); return; }
    page(isNew ? 'New badge' : 'Badge: ' + txt(row.name), 'Students see the name and the "how to earn it" text on their progress page, in their own language.');
    var spec = { t: 'group', fields: [
      { k: 'id', t: 'text', label: 'Badge id', required: true, readonly: !isNew, placeholder: 'points_100',
        pattern: /^[a-z0-9_]+$/, patternHelp: 'use small letters, numbers and _ only.', help: isNew ? 'Cannot be changed after the first save.' : null },
      { k: 'icon', t: 'text', label: 'Icon (one emoji)', required: true },
      { k: 'name', t: 'text3', label: 'Badge name', required: true },
      { k: 'descr', t: 'text3', label: 'How to earn it (shown to students)', required: true },
      { k: 'rule', t: 'select', label: 'Earned when the student…', options: BADGE_RULES },
      { k: 'goal', t: 'number', label: 'Number for the rule above', min: 1, def: 1 },
      { k: 'sort', t: 'number', label: 'Order on the page (smaller comes first)', min: 0, def: 0 },
      { k: 'active', t: 'bool', label: 'Shown on the website' }
    ] };
    var form = build(spec, row);
    main.appendChild(form.el);
    var msg = h('span', { class: 'msg' });
    var bar = h('div', { class: 'sticky-bar' });
    if (isAdmin()) {
      bar.appendChild(btn('Save', async function () {
        try {
          var body = form.get();
          body.goal = Math.max(1, body.goal);
          if (isNew) {
            await insert('badges', body);
            location.hash = '#badge/' + encodeURIComponent(body.id);
            return;
          }
          delete body.id;
          row = (await update('badges', 'id=' + eq(row.id), body))[0] || row;
          msg.className = 'msg ok'; msg.textContent = '✔ Saved. Students see the change the next time they open the website.';
        } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
      }, ''));
      if (!isNew) bar.appendChild(btn('Delete', async function () {
        if (!confirm('Delete this badge? Students who already earned it will no longer see it. To hide it for now, set "Shown on the website" to False instead.')) return;
        try { await remove('badges', 'id=' + eq(row.id)); location.hash = '#badges'; } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
      }, 'ghost danger'));
    } else {
      bar.appendChild(h('span', { class: 'msg', text: 'Only admins can change badges.' }));
    }
    bar.appendChild(h('a', { class: 'btn small ghost', href: '#badges', text: 'Back to the list' }));
    bar.appendChild(msg);
    main.appendChild(bar);
  }

  /* ---------- users ---------- */

  async function viewUsers() {
    if (!isAdmin()) { page('Admins only'); return; }
    page('Users', 'Editors write drafts and send them to review. Reviewers also publish. Admins also manage users. "No access" accounts cannot do anything.');
    var rows = await rpc('staff_list');
    var table = h('table', { class: 'table', html: '<thead><tr><th>Email</th><th>Joined</th><th>Email confirmed</th><th>Last sign-in</th><th>Role</th><th></th></tr></thead>' });
    var tbody = h('tbody');
    rows.forEach(function (r) {
      var sel = h('select', null, Object.keys(ROLE_LABEL).map(function (k) { return h('option', { value: k, text: ROLE_LABEL[k] }); }));
      sel.value = r.role;
      if (r.id === me.id) sel.disabled = true;
      var msg = h('span', { class: 'msg' });
      var tr = h('tr', { html: '<td>' + esc(r.email) + (r.id === me.id ? ' <small class="muted">(you)</small>' : '') + '</td><td>' + esc(when(r.created_at)) + '</td>' +
        '<td>' + (r.confirmed ? '✔' : '<span class="pill pending">Not yet</span>') + '</td><td>' + esc(when(r.last_sign_in_at) || '—') + '</td>' });
      tr.appendChild(h('td', null, [sel]));
      tr.appendChild(h('td', null, [r.id === me.id ? null : btn('Save role', async function () {
        try { await rpc('set_staff_role', { p_user: r.id, p_role: sel.value }); msg.className = 'msg ok'; msg.textContent = '✔ Saved'; }
        catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
      }), msg]));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    main.appendChild(h('div', { class: 'table-wrap' }, [table]));
    main.appendChild(h('p', { class: 'muted', text: 'New staff create their own account at this same page ("Create a staff account"), then you give them a role here. Giving a role also confirms their email, so they can sign in even if the confirmation email never arrived.' }));
  }

  /* ---------- statistics ---------- */

  async function viewStats() {
    page('Statistics', 'Anonymous counts only: no names and no device ids are stored.');
    var chs = await chapterList();
    var s = await rpc('admin_stats');
    var tot = s.totals || {};
    function tile(n, label) { return '<div class="card stat"><span class="stat-num">' + (n || 0) + '</span><span>' + esc(label) + '</span></div>'; }
    main.insertAdjacentHTML('beforeend', '<div class="stat-grid">' +
      tile(tot.visit, 'Visits') + tile(tot.quiz, 'Chapter quizzes taken') + tile(tot.worksheet, 'Worksheets printed') +
      tile(tot.game, 'Games finished') + tile(s.competitions && s.competitions.count, 'Competitions') +
      tile(s.competitions && s.competitions.avg != null ? s.competitions.avg + '%' : '—', 'Average competition score') + '</div>');

    var langs = s.langs || {}, totalVisits = LANGS.reduce(function (a, l) { return a + (langs[l] || 0); }, 0);
    main.insertAdjacentHTML('beforeend', '<h2>Language of visits</h2>' + LANGS.map(function (l) {
      var pct = totalVisits ? Math.round(100 * (langs[l] || 0) / totalVisits) : 0;
      return '<div class="hbar"><span>' + LANG_LABEL[l] + '</span><div class="bar"><span style="width:' + pct + '%"></span></div><span>' + pct + '% (' + (langs[l] || 0) + ')</span></div>';
    }).join(''));

    var per = (s.chapters || []).slice().sort(function (a, b) { return (b.quizzes + b.worksheets) - (a.quizzes + a.worksheets); });
    main.insertAdjacentHTML('beforeend', '<h2>By chapter</h2>' + (per.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Chapter</th><th>Quizzes</th><th>Average score</th><th>Worksheets printed</th><th>Games finished</th></tr></thead><tbody>' +
      per.map(function (c) {
        return '<tr><td>' + esc(chapterTitle(c.chapter)) + '</td><td>' + c.quizzes + '</td><td>' + (c.avg == null ? '—' : c.avg + '%') + '</td><td>' + c.worksheets + '</td><td>' + c.games + '</td></tr>';
      }).join('') + '</tbody></table></div>' : '<p>No activity yet.</p>'));

    var days = s.days || [], max = days.reduce(function (a, d) { return Math.max(a, d.visits); }, 0);
    main.insertAdjacentHTML('beforeend', '<h2>Visits in the last 14 days</h2>' + (days.length ? days.map(function (d) {
      return '<div class="hbar"><span>' + esc(d.day) + '</span><div class="bar"><span style="width:' + (max ? Math.round(100 * d.visits / max) : 0) + '%"></span></div><span>' + d.visits + '</span></div>';
    }).join('') : '<p>No visits yet.</p>'));
  }

  route();
})();
