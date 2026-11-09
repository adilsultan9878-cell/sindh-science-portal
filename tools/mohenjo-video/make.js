// Slides for the Urdu "how to play" video of the Mohenjo-daro Science Lab (/sindh/mohenjo-daro/).
// Opens the real page in Urdu at phone size, plays each lab (with a yellow ring on what is tapped), screenshots it,
// then puts every screenshot on a 1920 × 1080 slide next to its Urdu sentence.
// Writes <work>/mohenjo-daro/slide-NN.png and steps.json; then tools/exp-videos/build.py makes the MP4:
//   node make.js <site> <work>
//   python ../exp-videos/build.py <site> <work> mohenjo-daro      -> exp-videos/mohenjo-daro-ur.mp4 + .webp
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { launch, sleep } = require('../exp-videos/cdp');

const [site, work] = process.argv.slice(2);
const dir = path.join(work, 'mohenjo-daro');
fs.mkdirSync(dir, { recursive: true });
const PORT = 5307;

const LAB = 'موہنجو داڑو سائنس لیب';
// t: title on the slide, say: the spoken sentence (also shown on the slide)
const STEPS = [
  { t: LAB, say: 'السلام علیکم بچو! آج ہم موہنجو داڑو سائنس لیب دیکھیں گے۔ موہنجو داڑو ہمارے سندھ میں، لاڑکانہ کے قریب، تقریباً ساڑھے چار ہزار سال پرانا شہر ہے۔' },
  { t: 'شہر میں گھومیں', say: 'یہ شہر کی تصویر ہے۔ اس پر پانچ نمبر ہیں: نالیاں، اینٹوں کا بھٹا، عظیم حمام، باٹ کی دکان اور کنواں۔ کسی نمبر کو دبائیں تو اس کے پیچھے کی سائنس کھل جاتی ہے۔' },
  { t: 'نمبر 1: ڈھکی ہوئی نالیاں', say: 'مثلاً نمبر ایک دبائیں۔ یہاں لکھا ہے کہ موہنجو داڑو کی نالیاں ڈھکی ہوئی تھیں اور ہلکی ڈھلوان پر بنی تھیں، تاکہ کششِ ثقل پانی کو خود نیچے بہا دے۔ نیچے کتاب کے باب کا لنک بھی ہے۔' },
  { t: 'لیب 1: نالیاں بنائیں', say: 'اب لیب ایک: نالیاں بنائیں۔ اوپر تین گھر ہیں اور نیچے بڑا نالا۔ زمین ڈھلوان ہے: گھر اونچائی پر ہیں اور نالا نیچے۔ گول نشان والے خانے کنویں ہیں، ان پر نالی نہیں بنتی۔' },
  { t: 'ٹکڑا گھسیٹ کر رکھیں', say: 'نالی کا ٹکڑا انگلی سے گھسیٹ کر کسی خانے پر رکھیں۔ تین طرح کے ٹکڑے ہیں: سیدھا، موڑ اور تین راہہ۔ رکھے ہوئے ٹکڑے کو دبائیں تو وہ گھوم جاتا ہے۔' },
  { t: 'حل: پہلا قدم', say: 'اب حل دیکھیں۔ پہلے ہر گھر کے نیچے تین سیدھے ٹکڑے کھڑے رکھیں، تاکہ پانی سیدھا نیچے آئے۔' },
  { t: 'حل: دوسرا قدم', say: 'پھر چوتھی قطار میں سب نالیاں جوڑیں: بائیں کونے پر موڑ، پھر ایک لیٹا ہوا سیدھا ٹکڑا، بیچ والے گھر کے نیچے تین راہہ، دائیں کونے پر موڑ، اور بڑے نالے کے اوپر ایسا تین راہہ جو نیچے کی طرف کھلے۔ آخر میں سب سے نیچے ایک سیدھا ٹکڑا رکھیں۔' },
  { t: 'پانی چھوڑیں', say: 'اب پانی چھوڑیں کا بٹن دبائیں۔ نیلا پانی تینوں گھروں سے بہہ کر بڑے نالے تک پہنچ گیا۔ شاباش! گلی صاف اور خشک رہی، اس لیے مچھر اور جراثیم نہیں پھیلیں گے۔' },
  { t: 'غلطی کہاں ہے؟', say: 'اگر نالی ٹوٹی ہو تو پانی گلی میں گرتا ہے اور خانہ سرخ ہو جاتا ہے۔ اگر نالی اوپر کی طرف جائے تو خانہ نارنجی ہو جاتا ہے، کیونکہ پانی خود اوپر نہیں چڑھ سکتا۔ غلطی ٹھیک کریں اور دوبارہ کوشش کریں۔' },
  { t: 'لیب 2: کچی اینٹ', say: 'لیب دو: اینٹ پکائیں۔ صرف دھوپ میں سوکھی کچی اینٹ کو پانی میں ڈالیں تو وہ گھل کر دوبارہ مٹی بن جاتی ہے۔' },
  { t: 'لیب 2: پکی اینٹ', say: 'اب سلائیڈر سے بھٹے کی گرمی نو سو ڈگری کریں اور اینٹ پانی میں ڈالیں۔ پکی اینٹ سخت اور سرخ رہتی ہے۔ حرارت نے مٹی کو ہمیشہ کے لیے بدل دیا: یہ کیمیائی تبدیلی ہے۔' },
  { t: 'لیب 3: عظیم حمام', say: 'لیب تین: عظیم حمام۔ صرف مٹی کا تالاب ہو تو پانی زمین میں جذب ہو جاتا ہے۔ اینٹیں اور جپسم کا پلستر لگائیں اور ان کے پیچھے ڈامر کی تہہ دیں، تو دس دن بعد بھی حمام بھرا رہتا ہے۔' },
  { t: 'لیب 4: ترازو برابر کریں', say: 'لیب چار: ترازو۔ گندم کی تھیلی کا وزن تیرہ ہے۔ آٹھ، چار اور ایک کے باٹ ڈالیں۔ آٹھ جمع چار جمع ایک، تیرہ۔ ڈنڈی سیدھی ہو گئی! ترازو ایک لیور ہے۔' },
  { t: 'خود کو آزمائیں', say: 'آخر میں پانچ سوالوں کا کوئز ہے۔ ہر سوال کا جواب چنیں اور جواب چیک کریں کا بٹن دبائیں۔' },
  { t: 'آپ کی باری!', end: true, say: 'موہنجو داڑو کے لوگوں نے سائنس کی مدد سے صاف اور مضبوط شہر بنایا۔ اب آپ خود یہ لیب کھیلیں، سندھ سائنس پورٹل پر۔ خدا حافظ!', pause: 1.2 }
];

(async () => {
  // tools/serve.js sends folders to the app, so use the video-work server, which serves <folder>/index.html
  const server = spawn(process.execPath, [path.join(site, '..', 'video-work', 'scripts', 'serve.js'), site, String(PORT)], { stdio: 'ignore' });
  await sleep(700);
  const page = await launch({ profile: path.join(work, 'chrome-mohenjo'), port: 9371 });
  try {
    await page.send('Page.enable');
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await page.viewport(450, 860, 2, true);
    const url = 'http://localhost:' + PORT + '/sindh/mohenjo-daro/';
    await page.goto(url);
    await page.eval("localStorage.setItem('ssp1.lang', JSON.stringify('ur')), true");
    await page.goto(url, "document.querySelector('.md-city')");

    // helpers that run in the page
    await page.eval(`(() => {
      const q = (s) => document.querySelector(s);
      window.V = {
        top(sel, off) { const e = q(sel); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - (off || 8)); },
        ring(sel) {
          const e = q(sel), b = e.getBoundingClientRect(), d = document.createElement('div');
          d.className = 'vid-ring';
          d.style.cssText = 'position:absolute;z-index:99;pointer-events:none;border:5px solid #f2b705;border-radius:12px;box-shadow:0 0 0 5px rgba(242,183,5,.35);' +
            'left:' + (b.left + scrollX - 7) + 'px;top:' + (b.top + scrollY - 7) + 'px;width:' + (b.width + 14) + 'px;height:' + (b.height + 14) + 'px';
          document.body.appendChild(d);
        },
        clear() { document.querySelectorAll('.vid-ring').forEach((n) => n.remove()); },
        mask(r, c) { const d = (q('[data-cell="' + r + ',' + c + '"] .pipe-in') || { getAttribute: () => '' }).getAttribute('d') || '';
          return (d.includes('V0') ? 1 : 0) | (d.includes('H40') ? 2 : 0) | (d.includes('V40') ? 4 : 0) | (d.includes('H0') ? 8 : 0); },
        put(r, c, tool, want) { q('[data-tool="' + tool + '"]').click(); q('[data-cell="' + r + ',' + c + '"]').click();
          for (let i = 0; i < 4 && V.mask(r, c) !== want; i++) q('[data-cell="' + r + ',' + c + '"]').click();
          if (V.mask(r, c) !== want) throw new Error('could not place ' + r + ',' + c); }
      };
      return true; })()`);

    const shots = [];
    const shot = async (name) => { await page.settle(); const f = path.join(dir, 'page-' + name + '.png'); await page.shot(f); shots.push(f); await page.eval('V.clear(), true'); };

    // 1 hero, 2 city
    await page.eval('window.scrollTo(0, 0), true'); await shot('01');
    await page.eval("V.top('#city'), V.ring('.md-citybox'), true"); await shot('02');
    // 3 spot 1 open
    await page.eval("document.querySelector('[data-spot=\"drains\"]').dispatchEvent(new MouseEvent('click', { bubbles: true })), true");
    await page.eval("V.top('#city'), true");
    await page.eval("V.top('#spot', 70), V.ring('#spot h3'), true"); await shot('03');
    // 4 empty drains grid
    await page.eval("V.top('#dr-box .dr-tools', 20), V.ring('.dr-wrap'), true"); await shot('04');
    // 5 a piece being dragged: press on the straight piece, move over a square, screenshot, then let go
    await page.eval("V.top('#dr-box .dr-tools', 20), true");
    const from = await page.rect('[data-tool="straight"]'), to = await page.rect('[data-cell="0,0"]');
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y });
    await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1 });
    for (let i = 1; i <= 8; i++) {
      await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8, button: 'left', buttons: 1 });
      await sleep(30);
    }
    await page.eval("V.ring('[data-tool=\"straight\"]'), true"); await shot('05');
    await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', clickCount: 1 });
    await page.settle();
    if (await page.eval('V.mask(0, 0)') !== 5) throw new Error('drag did not place the piece');
    // 6 three columns, 7 the joining row, 8 water runs
    await page.eval("[0, 2, 4].forEach((c) => [0, 1, 2].forEach((r) => V.put(r, c, 'straight', 5))), V.top('#dr-box .dr-tools', 20), true"); await shot('06');
    await page.eval("V.put(3, 0, 'corner', 3), V.put(3, 1, 'straight', 10), V.put(3, 2, 'tee', 11), V.put(3, 3, 'tee', 14), V.put(3, 4, 'corner', 9), V.put(4, 3, 'straight', 5), true");
    await page.eval("V.top('#dr-box .dr-tools', 20), ['3,0','3,1','3,2','3,3','3,4','4,3'].forEach((k) => V.ring('[data-cell=\"' + k + '\"]')), true"); await shot('07');
    await page.eval("document.querySelector('[data-act=\"run\"]').click(), true");
    await page.waitFor("document.querySelector('#dr-box .note.ok')", 8000);
    await page.eval("V.top('.dr-slope', 10), V.ring('#dr-box .note'), true"); await shot('08');
    // 9 a wrong drain: one column goes down to the bottom row and up again
    await page.eval("document.querySelector('[data-act=\"clear\"]').click(), [0, 1, 2, 3].forEach((r) => V.put(r, 0, 'straight', 5)), V.put(4, 0, 'corner', 3), V.put(4, 1, 'corner', 9), V.put(3, 1, 'corner', 6), true");
    await page.eval("document.querySelector('[data-act=\"run\"]').click(), true");
    await page.waitFor("document.querySelector('#dr-box .note.warn')", 8000);
    await page.eval("V.top('.dr-wrap', 10), V.ring('.dr-cell.up'), true"); await shot('09');
    // 10 raw brick, 11 baked brick
    await page.eval("V.top('#lab-bricks'), document.querySelector('[data-act=\"dunk\"]').click(), true");
    await page.waitFor("document.querySelector('#bk-box .note')", 5000);
    await page.eval("V.top('#bk-box', 60), V.ring('#bk-box .bk-pic'), true"); await shot('10');
    await page.eval("(() => { const r = document.querySelector('[data-heat]'); r.value = 900; r.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('[data-act=\"dunk\"]').click(); return true; })()");
    await page.waitFor("document.querySelector('#bk-box .note.ok')", 5000);
    await page.eval("V.top('#bk-box', 60), V.ring('[data-heat]'), true"); await shot('11');
    // 12 the bath with bricks and bitumen, after 10 days
    await page.eval("document.querySelector('[data-line=\"bricks\"]').click(), document.querySelector('[data-line=\"tar\"]').click(), document.querySelector('[data-act=\"fill\"]').click(), true");
    await page.waitFor("document.querySelector('#bh-box .note.ok')", 8000);
    await page.eval("V.top('#bh-box', 60), V.ring('#bh-box .bk-ctrl'), true"); await shot('12');
    // 13 weights 8 + 4 + 1
    await page.eval("[8, 4, 1].forEach((w) => document.querySelector('[data-w=\"' + w + '\"]').click()), true");
    await page.eval("V.top('#wt-box', 60), V.ring('.wt-set'), true"); await shot('13');
    // 14 quiz, 15 back to the city for the end slide
    await page.eval("V.top('#quiz'), V.ring('.md-q'), true"); await shot('14');
    await page.eval("V.top('#city'), true"); await shot('15');

    // slides
    await page.viewport(1920, 1080, 1, false);
    const font = (f) => 'file:///' + path.join(site, 'fonts', f).replace(/\\/g, '/');
    const steps = [];
    for (let i = 0; i < STEPS.length; i++) {
      const s = STEPS[i];
      const img = 'file:///' + shots[i].replace(/\\/g, '/');
      const dots = STEPS.map((x, j) => '<i class="' + (j === i ? 'on' : j < i ? 'done' : '') + '"></i>').join('');
      const html = `<!doctype html><html lang="ur" dir="rtl"><head><meta charset="utf-8"><style>
@font-face { font-family: Naskh; src: url("${font('noto-naskh-arabic-arabic-400-normal.woff2')}"); font-weight: 400; }
@font-face { font-family: Naskh; src: url("${font('noto-naskh-arabic-arabic-700-normal.woff2')}"); font-weight: 700; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #fff; font-family: Naskh, "Segoe UI", sans-serif; color: #1f2d1f; }
.band { position: absolute; inset: 0 0 auto 0; height: 14px; background: linear-gradient(90deg, #2e7d32, #a8643a); }
.wrap { position: absolute; inset: 14px 0 0 0; display: grid; grid-template-columns: 1fr 560px; gap: 70px; padding: 50px 110px 50px 90px; box-sizing: border-box; }
.text { display: flex; flex-direction: column; justify-content: center; }
.eyebrow { color: #2e7d32; font-size: 34px; font-weight: 700; margin: 0 0 6px; }
h1 { font-size: ${s.end ? 82 : 68}px; line-height: 1.5; margin: 0 0 26px; color: #1b5e20; }
.say { font-size: 40px; line-height: 2; margin: 0; background: #f1f8f1; border-right: 10px solid #2e7d32; border-radius: 18px; padding: 26px 36px; }
.url { margin-top: 30px; font: 700 40px "Segoe UI", sans-serif; direction: ltr; color: #2e7d32; text-align: right; }
.phone { align-self: center; justify-self: center; width: 470px; height: 900px; border-radius: 46px; background: #1f2d1f; padding: 16px; box-sizing: content-box; box-shadow: 0 30px 70px rgba(0,0,0,.18); }
.phone img { display: block; width: 470px; height: 898px; border-radius: 32px; object-fit: cover; object-position: top; }
.dots { position: absolute; bottom: 34px; left: 90px; display: flex; gap: 10px; direction: ltr; }
.dots i { width: 16px; height: 16px; border-radius: 50%; background: #d9e6d9; } .dots i.done { background: #9cc79e; } .dots i.on { background: #2e7d32; width: 40px; border-radius: 8px; }
</style></head><body><div class="band"></div><div class="wrap">
<div class="text"><p class="eyebrow">${i ? LAB : 'سندھ سائنس پورٹل'}</p><h1>${s.t}</h1><p class="say">${s.say}</p>${s.end ? '<p class="url">sindh-science-portal.vercel.app/sindh/mohenjo-daro/</p>' : ''}</div>
<div class="phone"><img src="${img}" alt=""></div></div><div class="dots">${dots}</div></body></html>`;
      const hf = path.join(dir, 'slide-' + String(i + 1).padStart(2, '0') + '.html');
      fs.writeFileSync(hf, html);
      await page.goto('file:///' + hf.replace(/\\/g, '/'), "document.querySelector('img').complete");
      const png = hf.replace(/\.html$/, '.png');
      await page.shot(png);
      steps.push({ png, say: s.say, pause: s.pause || 0 });
      console.log('slide', i + 1, 'of', STEPS.length);
    }
    fs.writeFileSync(path.join(dir, 'steps.json'), JSON.stringify(steps, null, 1));
    console.log('done slides', steps.length);
  } finally { await page.close(); server.kill(); }
})().catch((e) => { console.error(e); process.exit(1); });
