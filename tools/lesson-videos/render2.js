// Render every step of a lesson video to a 1920x1080 PNG with headless Chrome.
// Usage: node render.js <site_dir> <video_id> <out_dir>
const { launch, sleep } = require('./cdp.js');
const fs = require('fs'), path = require('path');
const [site, id, outArg] = process.argv.slice(2);
const out = path.resolve(outArg);
const video = require('./content2.js')[id];
const chapter = JSON.parse(fs.readFileSync(path.join(site, 'data/class-5/science', video.chapter + '.json'), 'utf8'));
const labels = {};
chapter.diagram.parts.forEach((p) => { labels[p.id] = p.label.ur; });
const url = (p) => 'file:///' + path.join(site, p).replace(/\\/g, '/');

// Fill in "same: true" steps from the step before.
const steps = [];
video.steps.forEach((s, i) => steps.push(s.same ? Object.assign({}, steps[i - 1], s) : s));

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
.stage { position: absolute; top: 64px; bottom: 132px; left: 0; right: 0; padding: 18px 40px; display: flex; align-items: center; justify-content: center; gap: 40px; }
.cap { position: absolute; bottom: 0; left: 0; right: 0; height: 132px; display: flex; align-items: center; justify-content: center;
  padding: 0 48px; background: #ffffff; border-top: 4px solid #2e7d32; font-size: 29px; line-height: 1.7; text-align: center; }
h1 { font-size: 54px; color: #1b5e20; margin: 0 0 10px; line-height: 1.5; }
h2 { font-size: 40px; color: #1b5e20; margin: 0 0 18px; text-align: center; line-height: 1.5; }
.sub { font-size: 28px; color: #4f5f53; }
.title-text { flex: 1; }
.pic { max-height: 470px; max-width: 520px; border-radius: 14px; border: 2px solid #cfe5cf; background: #fff; padding: 6px; }
.col { display: flex; flex-direction: column; align-items: center; width: 100%; }
.cards { display: flex; gap: 22px; justify-content: center; }
.card { width: 250px; padding: 18px 12px; border: 3px solid #cfe5cf; border-radius: 18px; background: #fff; text-align: center; }
.card .e { font-size: 74px; line-height: 1.25; }
.card .n { font-size: 32px; font-weight: 700; color: #1b5e20; line-height: 1.5; }
.card .x { font-size: 22px; color: #4f5f53; }
.card.dim { opacity: 0.35; }
.card.on { border-color: #ef6c00; background: #fff8e1; }
.diagram { width: 560px; border: 2px solid #cfe5cf; border-radius: 16px; padding: 8px; background: #fff; }
.diagram svg { width: 100%; height: auto; display: block; }
.dlabel { font-size: 16px; fill: #1f2a1f; paint-order: stroke; stroke: #fff; stroke-width: 4px; stroke-linejoin: round; font-family: Naskh; }
.part .lead { stroke: #78909c; stroke-width: 1.5; }
.part.active .shape { stroke: #ef6c00; stroke-width: 5px; }
.part.active .dlabel { fill: #e65100; font-weight: 700; font-size: 19px; }
.info { width: 380px; padding: 24px; border: 3px solid #ef6c00; border-radius: 18px; background: #fff8e1; text-align: center; }
.info .n { font-size: 52px; font-weight: 700; color: #e65100; line-height: 1.5; }
.info .x { font-size: 28px; line-height: 1.6; }
.eq { display: flex; align-items: center; gap: 16px; flex-wrap: nowrap; justify-content: center; }
.eq .t { padding: 10px 14px; border: 3px solid #cfe5cf; border-radius: 16px; text-align: center; min-width: 120px; }
.eq .t .e { font-size: 52px; line-height: 1.3; }
.eq .t .n { font-size: 22px; font-weight: 700; color: #1b5e20; }
.eq .t.on { border-color: #ef6c00; background: #fff8e1; }
.eq .op { font-size: 44px; color: #2e7d32; font-weight: 700; }
.list { list-style: none; padding: 0; margin: 0; width: 820px; }
.list li { display: flex; align-items: center; gap: 18px; font-size: 30px; line-height: 1.5; padding: 4px 20px; margin: 8px 0; border-radius: 14px; background: #f1f8f1; border: 2px solid #cfe5cf; }
.list li .e { font-size: 40px; }
.list li.hide { visibility: hidden; }
.q { width: 900px; text-align: center; }
.q .qq { font-size: 46px; font-weight: 700; color: #1b5e20; line-height: 1.6; }
.q .aa { margin-top: 24px; font-size: 40px; padding: 18px; border-radius: 16px; background: #e6f4ea; border: 3px solid #2e7d32; line-height: 1.6; }
.q .think { margin-top: 24px; font-size: 64px; }
.end .l { font-size: 36px; margin: 12px 0; text-align: center; line-height: 1.6; }
.end .url { margin-top: 18px; font-size: 30px; direction: ltr; color: #2e7d32; font-weight: 700; font-family: "Segoe UI", sans-serif; }
.diagram svg { max-height: 460px; }
</style>
<script src="${url('js/diagrams.js')}"></script></head>
<body><div class="head"><span>🌿 سندھ سائنس لرننگ پورٹل</span><small>${video.head}</small></div>
<div class="stage" id="stage"></div><div class="cap" id="cap"></div>
<script>
var LABELS = ${JSON.stringify(labels)};
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
window.show = function (s, imgs) {
  var st = document.getElementById('stage'), h = '';
  if (s.kind === 'title') {
    h = '<div class="title-text"><h1>' + esc(s.title) + '</h1><p class="sub">' + esc(s.sub) + '</p></div><img class="pic" src="' + imgs[s.img] + '">';
  } else if (s.kind === 'diagram') {
    h = '<div class="diagram">' + window.DIAGRAMS[s.type](function (id) { return esc(LABELS[id] || id); }) + '</div>' +
      '<div class="info"><div class="n">' + esc(LABELS[s.hi]) + '</div><div class="x">' + esc(s.note) + '</div></div>';
  } else if (s.kind === 'cards') {
    h = '<div class="col"><h2>' + esc(s.title) + '</h2><div class="cards">' + s.cards.map(function (c, i) {
      return '<div class="card' + (s.hi < 0 ? '' : i === s.hi ? ' on' : ' dim') + '"><div class="e">' + c[0] + '</div><div class="n">' + esc(c[1]) + '</div><div class="x">' + esc(c[2]) + '</div></div>';
    }).join('') + '</div></div>';
  } else if (s.kind === 'equation') {
    var term = function (c) { return '<div class="t' + (c[2] && c[2] === s.hi ? ' on' : '') + '"><div class="e">' + c[0] + '</div><div class="n">' + esc(c[1]) + '</div></div>'; };
    h = '<div class="col"><h2>' + esc(s.title) + '</h2><div class="eq">' + s.left.map(term).join('<span class="op">+</span>') +
      '<span class="op">←</span>' + s.right.map(term).join('<span class="op">+</span>') + '</div></div>';
  } else if (s.kind === 'list') {
    h = '<div class="col"><h2>' + esc(s.title) + '</h2><ul class="list">' + s.items.map(function (it, i) {
      return '<li' + (i < s.upto ? '' : ' class="hide"') + '><span class="e">' + it[0] + '</span><span>' + esc(it[1]) + '</span></li>';
    }).join('') + '</ul></div>';
  } else if (s.kind === 'quiz') {
    h = '<div class="q"><h2>❓ سوال</h2><div class="qq">' + esc(s.q) + '</div>' + (s.show ? '<div class="aa">✅ ' + esc(s.a) + '</div>' : '<div class="think">🤔</div>') + '</div>';
  } else if (s.kind === 'end') {
    h = '<div class="col end"><h2>' + esc(s.title) + '</h2>' + s.lines.map(function (l) { return '<div class="l">' + esc(l) + '</div>'; }).join('') +
      '<div class="url">sindh-science-portal.vercel.app</div></div>';
  }
  st.innerHTML = h;
  if (s.kind === 'diagram') { var p = st.querySelector('[data-part="' + s.hi + '"]'); if (p) p.classList.add('active'); }
  document.getElementById('cap').textContent = s.say;
};
</script></body></html>`;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const page = path.join(out, 'slides.html');
  fs.writeFileSync(page, html);
  const imgs = {};
  fs.readdirSync(path.join(site, 'img')).filter((f) => f.endsWith('.webp')).forEach((f) => { imgs[f.replace('.webp', '')] = url('img/' + f); });
  const pg = await launch({ profile: 'C:\\Users\\adils\\AppData\\Local\\Temp\\vidrec\\prof-lv-' + Date.now(), port: 9380 });
  try {
    await pg.send('Page.enable');
    await pg.viewport(1280, 720, 1.5, false);
    await pg.goto('file:///' + page.replace(/\\/g, '/'));
    await pg.eval('document.fonts.ready.then(() => true)');
    const list = [];
    for (let i = 0; i < steps.length; i++) {
      await pg.eval('window.show(' + JSON.stringify(steps[i]) + ', ' + JSON.stringify(imgs) + ')');
      await sleep(150);
      await pg.eval('Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))).then(() => true)');
      const file = path.join(out, 'step' + String(i).padStart(2, '0') + '.png');
      await pg.shot(file);
      list.push({ png: file, say: steps[i].say, pause: steps[i].pause || 0 });
    }
    fs.writeFileSync(path.join(out, 'steps.json'), JSON.stringify(list, null, 1));
    console.log('rendered', list.length, 'steps');
  } finally { await pg.close(); }
})();
