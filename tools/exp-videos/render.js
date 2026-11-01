// Render every slide of the experiment videos to 1920x1080 PNGs with headless Chrome.
// Usage: node render.js <site_dir> <work_dir> [chapter ids...]   (no ids = every chapter in data/catalog.json)
// Writes <work_dir>/<id>/stepNN.png and <work_dir>/<id>/steps.json for build.py.
const { launch, sleep } = require('./cdp.js');
const fs = require('fs'), path = require('path');
const [siteArg, workArg, ...only] = process.argv.slice(2);
const site = path.resolve(siteArg), work = path.resolve(workArg);
const content = require('./content.js');
const url = (p) => 'file:///' + path.join(site, p).replace(/\\/g, '/');
const catalog = JSON.parse(fs.readFileSync(path.join(site, 'data/catalog.json'), 'utf8'));
const ids = only.length ? only : catalog.classes.find((c) => c.id === '5').subjects.find((s) => s.id === 'science').chapters;

// Slide list of one chapter: words on screen from the chapter file, narration from content.js.
function slides(id) {
  const ch = JSON.parse(fs.readFileSync(path.join(site, 'data/class-5/science', id + '.json'), 'utf8'));
  const x = ch.experiment, c = content.videos[id];
  if (!c) throw new Error('no narration for ' + id);
  if (c.icons.length !== x.materials.length || c.materials.length !== x.materials.length) throw new Error(id + ': materials do not match the chapter file');
  if (c.steps.length !== x.steps.length) throw new Error(id + ': steps do not match the chapter file');
  const page = {
    head: 'باب ' + ch.number + ' · گھر کا تجربہ', title: x.title.ur, sub: 'باب ' + ch.number + ' · ' + ch.title.ur, pic: url('img/exp/' + id + '.svg'),
    safety: x.safety.ur, materials: x.materials.map((m, i) => [c.icons[i], m.ur]), steps: x.steps.map((s) => s.ur), learn: x.learn.ur
  };
  const list = [{ kind: 'title', say: c.intro }, { kind: 'safety', say: c.safety }];
  c.materials.forEach((say, i) => list.push({ kind: 'materials', hi: i, say }));
  list.push({ kind: 'guess', q: c.guess.q, say: c.guess.say, pause: 2 });
  c.steps.forEach((say, i) => list.push({ kind: 'step', n: i, say }));
  c.result.forEach((say) => list.push({ kind: 'result', say }));
  list.push({ kind: 'end', lines: c.end.lines, say: c.end.say + ' ' + content.closing, pause: 1.5 });
  return { page, list };
}

// Small drawings for things that have no fitting emoji.
const ICONS = {
  cotton: '<svg viewBox="0 0 80 80"><g fill="#90a4ae"><circle cx="26" cy="48" r="17.5"/><circle cx="54" cy="48" r="17.5"/><circle cx="40" cy="32" r="18.5"/><circle cx="40" cy="50" r="17.5"/></g><g fill="#fff"><circle cx="26" cy="48" r="15"/><circle cx="54" cy="48" r="15"/><circle cx="40" cy="32" r="16"/><circle cx="40" cy="50" r="15"/></g><g fill="#eceff1"><circle cx="30" cy="52" r="5"/><circle cx="48" cy="36" r="5"/></g></svg>',
  towel: '<svg viewBox="0 0 80 80"><rect x="10" y="14" width="60" height="48" rx="6" fill="#4fc3f7"/><rect x="10" y="14" width="60" height="12" rx="6" fill="#0288d1"/><path d="M10 50h60" stroke="#fff" stroke-width="4"/><path d="M15 62v8M23 62v8M31 62v8M39 62v8M47 62v8M55 62v8M63 62v8" stroke="#4fc3f7" stroke-width="3"/></svg>',
  plank: '<svg viewBox="0 0 80 80"><g transform="rotate(-18 40 40)"><rect x="4" y="30" width="72" height="20" rx="3" fill="#c49a6c" stroke="#8d6e63" stroke-width="2"/><path d="M10 38h30M30 44h38" stroke="#8d6e63" stroke-width="2"/></g></svg>',
  bottle: '<svg viewBox="0 0 80 80"><rect x="22" y="22" width="36" height="52" rx="8" fill="#e3f2fd" stroke="#90a4ae" stroke-width="3"/><rect x="32" y="12" width="16" height="11" fill="#e3f2fd" stroke="#90a4ae" stroke-width="3"/><rect x="29" y="4" width="22" height="9" rx="2" fill="#43a047"/></svg>',
  soil: '<svg viewBox="0 0 80 80"><path d="M6 68q10-36 34-38q24 2 34 38z" fill="#795548"/><g fill="#5d4037"><circle cx="30" cy="56" r="3"/><circle cx="48" cy="46" r="3"/><circle cx="56" cy="60" r="3"/></g><path d="M38 32q2-10 10-14" stroke="#66bb6a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
  glass: '<svg viewBox="0 0 80 80"><path d="M18 8h44l-5 66h-34z" fill="#e3f2fd" stroke="#90a4ae" stroke-width="3"/></svg>',
  water: '<svg viewBox="0 0 80 80"><path d="M18 8h44l-5 66h-34z" fill="#e3f2fd"/><path d="M20.5 40h39l-2.6 34h-33.8z" fill="#90caf9"/><path d="M18 8h44l-5 66h-34z" fill="none" stroke="#90a4ae" stroke-width="3"/></svg>',
  steel: '<svg viewBox="0 0 80 80"><path d="M16 8h48l-6 66h-36z" fill="#cfd8dc" stroke="#90a4ae" stroke-width="3"/><path d="M25 14l4 54" stroke="#eceff1" stroke-width="5"/></svg>',
  cloth: '<svg viewBox="0 0 80 80"><path d="M12 26h60l-6 34h-60z" fill="#fff59d" stroke="#fbc02d" stroke-width="3"/><path d="M17 38h50M14 49h50" stroke="#fbc02d" stroke-width="2"/></svg>'
};

const html = `<!doctype html><html lang="ur" dir="rtl"><head><meta charset="utf-8">
<style>
@font-face { font-family: Naskh; src: url("${url('fonts/noto-naskh-arabic-arabic-400-normal.woff2')}"); font-weight: 400; }
@font-face { font-family: Naskh; src: url("${url('fonts/noto-naskh-arabic-arabic-700-normal.woff2')}"); font-weight: 700; }
* { box-sizing: border-box; }
html, body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: #fff; color: #1f2a1f;
  font-family: Naskh, "Segoe UI", "Segoe UI Emoji", sans-serif; }
.head { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 28px;
  background: #f1f8f1; border-bottom: 3px solid #cfe5cf; font-size: 22px; color: #1b5e20; font-weight: 700; }
.head small { font-weight: 400; color: #4f5f53; font-size: 20px; }
.stage { position: absolute; top: 64px; bottom: 132px; left: 0; right: 0; padding: 16px 40px; display: flex; align-items: center; justify-content: center; gap: 40px; }
.cap { position: absolute; bottom: 0; left: 0; right: 0; height: 132px; display: flex; align-items: center; justify-content: center;
  padding: 0 48px; background: #ffffff; border-top: 4px solid #2e7d32; font-size: 29px; line-height: 1.7; text-align: center; }
h1 { font-size: 52px; color: #1b5e20; margin: 6px 0 8px; line-height: 1.5; }
h2 { font-size: 38px; color: #1b5e20; margin: 0 0 16px; text-align: center; line-height: 1.5; }
.col { display: flex; flex-direction: column; align-items: center; width: 100%; }
.title-text { flex: 1; }
.tag { display: inline-block; font-size: 24px; padding: 2px 20px; border-radius: 999px; background: #e6f4ea; border: 2px solid #a5d6a7; color: #1b5e20; font-weight: 700; }
.sub { font-size: 28px; color: #4f5f53; margin: 0; }
.pic { width: 560px; border-radius: 14px; border: 2px solid #cfe5cf; background: #fff; display: block; }
.safe { width: 940px; padding: 20px 32px; border: 3px solid #ef6c00; border-radius: 18px; background: #fff8e1; font-size: 34px; line-height: 1.75; text-align: center; }
.adult { margin-top: 22px; font-size: 27px; padding: 6px 28px; border-radius: 999px; background: #e6f4ea; border: 2px solid #2e7d32; color: #1b5e20; font-weight: 700; }
.mats { display: flex; flex-wrap: wrap; gap: 18px; justify-content: center; max-width: 1200px; }
.mat { width: 214px; min-height: 236px; padding: 12px 10px; border: 3px solid #cfe5cf; border-radius: 18px; background: #fff; text-align: center; display: flex; flex-direction: column; align-items: center; }
.mat .e { height: 104px; display: flex; align-items: center; justify-content: center; gap: 2px; direction: ltr; line-height: 1; }
.mat .e svg { width: 86px; height: 86px; }
.mat .e.k2 svg { width: 64px; height: 64px; } .mat .e.k3 svg { width: 52px; height: 52px; }
.mat .n { font-size: 24px; font-weight: 700; color: #1b5e20; line-height: 1.55; margin-top: 6px; }
.mat.on { border-color: #ef6c00; background: #fff8e1; }
.mat.hide { visibility: hidden; }
.q { width: 980px; text-align: center; }
.q .qq { font-size: 46px; font-weight: 700; color: #1b5e20; line-height: 1.6; }
.q .think { margin-top: 10px; font-size: 96px; line-height: 1.2; }
.q .hint { font-size: 27px; color: #4f5f53; }
.stepwrap { display: flex; gap: 30px; align-items: center; width: 100%; height: 100%; }
.now { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.badge { display: flex; align-items: center; gap: 14px; font-size: 28px; color: #1b5e20; font-weight: 700; }
.num { width: 58px; height: 58px; border-radius: 50%; background: #ef6c00; color: #fff; font: 700 32px "Segoe UI", sans-serif; display: flex; align-items: center; justify-content: center; }
.st { font-size: 31px; font-weight: 700; line-height: 1.6; text-align: center; margin: 8px 0 12px; }
.spic { width: 390px; border-radius: 12px; border: 2px solid #cfe5cf; display: block; }
.mini { width: 480px; list-style: none; margin: 0; padding: 0; }
.mini li { display: flex; gap: 10px; align-items: flex-start; font-size: 20px; line-height: 1.55; padding: 5px 12px; margin: 7px 0; border-radius: 12px; background: #f1f8f1; border: 2px solid #cfe5cf; }
.mini li .k { flex: none; width: 28px; height: 28px; margin-top: 3px; border-radius: 50%; background: #cfe5cf; color: #1b5e20; font: 700 16px "Segoe UI", sans-serif; display: flex; align-items: center; justify-content: center; }
.mini li.on { border-color: #ef6c00; background: #fff8e1; font-weight: 700; }
.mini li.on .k { background: #ef6c00; color: #fff; }
.mini li.done { color: #5f6f62; }
.mini li.done .k { background: #2e7d32; color: #fff; }
.res { display: flex; gap: 32px; align-items: center; }
.rpic { width: 470px; border-radius: 14px; border: 2px solid #cfe5cf; display: block; }
.learn { width: 640px; font-size: 27px; line-height: 1.75; padding: 16px 26px; background: #e6f4ea; border: 3px solid #2e7d32; border-radius: 18px; }
.end .l { font-size: 34px; margin: 8px 0; text-align: center; line-height: 1.6; }
.end .adult { margin-top: 14px; }
.end .url { margin-top: 18px; font-size: 30px; direction: ltr; color: #2e7d32; font-weight: 700; font-family: "Segoe UI", sans-serif; }
</style></head>
<body><div class="head"><span>🌿 سندھ سائنس لرننگ پورٹل</span><small id="head"></small></div>
<div class="stage" id="stage"></div><div class="cap" id="cap"><span id="capt"></span></div>
<script>
var ICONS = ${JSON.stringify(ICONS)};
var ADULT = '👨‍👩‍👧 یہ تجربہ ہمیشہ کسی بڑے کے ساتھ کریں';
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function icons(s) {
  var t = s.split(' ');
  return '<div class="e k' + t.length + '" style="font-size:' + [0, 76, 56, 44][t.length] + 'px">' +
    t.map(function (k) { return k.indexOf('svg:') === 0 ? ICONS[k.slice(4)] : '<span>' + k + '</span>'; }).join('') + '</div>';
}
window.show = function (P, s) {
  var st = document.getElementById('stage'), h = '';
  document.getElementById('head').textContent = P.head;
  if (s.kind === 'title') {
    h = '<div class="title-text"><span class="tag">🧪 گھر کا تجربہ</span><h1>' + esc(P.title) + '</h1><p class="sub">' + esc(P.sub) + '</p></div><img class="pic" src="' + P.pic + '">';
  } else if (s.kind === 'safety') {
    h = '<div class="col"><h2>⚠️ احتیاط</h2><div class="safe">' + esc(P.safety) + '</div><div class="adult">' + ADULT + '</div></div>';
  } else if (s.kind === 'materials') {
    h = '<div class="col"><h2>🧺 درکار اشیاء</h2><div class="mats">' + P.materials.map(function (m, i) {
      return '<div class="mat' + (i > s.hi ? ' hide' : i === s.hi ? ' on' : '') + '">' + icons(m[0]) + '<div class="n">' + esc(m[1]) + '</div></div>';
    }).join('') + '</div></div>';
  } else if (s.kind === 'guess') {
    h = '<div class="q"><h2>💭 آپ کے خیال میں کیا ہوگا؟</h2><div class="qq">' + esc(s.q) + '</div><div class="think">🤔</div><div class="hint">پہلے سوچیں، پھر تجربہ کر کے دیکھیں!</div></div>';
  } else if (s.kind === 'step') {
    h = '<div class="stepwrap"><div class="now"><div class="badge"><span class="num">' + (s.n + 1) + '</span><span>مرحلہ ' + (s.n + 1) + '</span></div>' +
      '<p class="st">' + esc(P.steps[s.n]) + '</p><img class="spic" src="' + P.pic + '"></div><ol class="mini">' + P.steps.map(function (t, i) {
        return '<li class="' + (i < s.n ? 'done' : i === s.n ? 'on' : '') + '"><span class="k">' + (i < s.n ? '✓' : i + 1) + '</span><span>' + esc(t) + '</span></li>';
      }).join('') + '</ol></div>';
  } else if (s.kind === 'result') {
    h = '<div class="col"><h2>💡 ہم نے کیا سیکھا؟</h2><div class="res"><div class="learn">' + esc(P.learn) + '</div><img class="rpic" src="' + P.pic + '"></div></div>';
  } else if (s.kind === 'end') {
    h = '<div class="col end"><h2>🎉 شاباش!</h2>' + s.lines.map(function (l) { return '<div class="l">' + esc(l) + '</div>'; }).join('') +
      '<div class="adult">' + ADULT + '</div><div class="url">sindh-science-portal.vercel.app</div></div>';
  }
  st.innerHTML = h;
  // caption: the narration, made smaller only if it would not fit in two or three lines
  var cap = document.getElementById('cap'), t = document.getElementById('capt'), fs = 29;
  t.textContent = s.say; cap.style.fontSize = fs + 'px';
  while (t.offsetHeight > cap.clientHeight - 12 && fs > 20) { fs--; cap.style.fontSize = fs + 'px'; }
  var over = st.scrollHeight > st.clientHeight + 1 || st.scrollWidth > st.clientWidth + 1;
  return { capFont: fs, overflow: over };
};
</script></body></html>`;

(async () => {
  fs.mkdirSync(work, { recursive: true });
  const page = path.join(work, 'slides.html');
  fs.writeFileSync(page, html);
  // Chrome fails to start with a long profile path, so keep it short.
  const pg = await launch({ profile: 'C:\\Users\\adils\\AppData\\Local\\Temp\\expvid\\prof-' + (Date.now() % 100000), port: 9381 });
  try {
    await pg.send('Page.enable');
    await pg.viewport(1280, 720, 1.5, false);
    await pg.goto('file:///' + page.replace(/\\/g, '/'));
    await pg.eval('document.fonts.ready.then(() => true)');
    for (const id of ids) {
      const { page: P, list } = slides(id);
      const dir = path.join(work, id);
      fs.mkdirSync(dir, { recursive: true });
      fs.readdirSync(dir).filter((f) => /^step\d+\.png$/.test(f)).forEach((f) => fs.unlinkSync(path.join(dir, f)));
      const out = [];
      for (let i = 0; i < list.length; i++) {
        const r = await pg.eval('window.show(' + JSON.stringify(P) + ', ' + JSON.stringify(list[i]) + ')');
        await pg.eval('Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))).then(() => document.fonts.ready).then(() => true)');
        await sleep(120);
        if (r.overflow) console.log('  ! ' + id + ' slide ' + i + ' (' + list[i].kind + ') does not fit');
        if (r.capFont < 29) console.log('  caption ' + id + ' slide ' + i + ' at ' + r.capFont + 'px');
        const file = path.join(dir, 'step' + String(i).padStart(2, '0') + '.png');
        await pg.shot(file);
        out.push({ png: file, say: list[i].say, pause: list[i].pause || 0 });
      }
      fs.writeFileSync(path.join(dir, 'steps.json'), JSON.stringify(out, null, 1));
      console.log(id + ': ' + out.length + ' slides');
    }
  } finally { await pg.close(); }
})();
