// Slides for five short Urdu teacher-training videos, recorded from the site's own pages on a local demo server
// (video-work/scripts/serve.js --mock: a pretend database on this computer, so no real account is made or changed).
// Test names only (zz_train_*, Ahmed, Sara …). Each step: do something on the page, put a yellow ring on what matters,
// screenshot it, then place the screenshot (phone or laptop frame) beside the Urdu sentence on a 1920 × 1080 slide.
//   node make.js <site> <work>                       -> <work>/teacher-*/slide-NN.png + steps.json
//   python ../exp-videos/build.py <site> <work> teacher-login teacher-students ...   (then move to videos/)
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { launch, sleep } = require('../exp-videos/cdp');

const [site, work] = process.argv.slice(2);
const PORT = 5311;
const BASE = 'http://localhost:' + PORT;
const TEACHER = { email: 'zz_train_teacher@example.com', pw: 'zzTrain2026' };   // test values for the demo server only
const NAMES = ['Ahmed Ali', 'Sara Khan', 'Bilal', 'Zainab', 'Umar', 'Hira'];
const kids = {};   // name -> { username, pin, parent, token }

const PHONE = [450, 860, 2, true], LAPTOP = [1280, 800, 1, false];

// helpers put into every page after it loads
const HELPERS = `(() => {
  const q = (s) => document.querySelector(s);
  window.V = {
    top(sel, off) { const e = typeof sel === 'string' ? q(sel) : sel; if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - (off == null ? 10 : off)); return !!e; },
    ring(sel) {
      const e = typeof sel === 'string' ? q(sel) : sel; if (!e) return false;
      const b = e.getBoundingClientRect(), d = document.createElement('div');
      d.className = 'vid-ring';
      d.style.cssText = 'position:absolute;z-index:9999;pointer-events:none;border:5px solid #f2b705;border-radius:12px;box-shadow:0 0 0 5px rgba(242,183,5,.35);' +
        'left:' + (b.left + scrollX - 7) + 'px;top:' + (b.top + scrollY - 7) + 'px;width:' + (b.width + 14) + 'px;height:' + (b.height + 14) + 'px';
      document.body.appendChild(d); return true;
    },
    clear() { document.querySelectorAll('.vid-ring').forEach((n) => n.remove()); },
    set(sel, v) { const e = q(sel); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); },
    text(t, root) { return [...(root || document).querySelectorAll('button, a, .chip')].find((n) => n.textContent.trim().indexOf(t) >= 0); },
    rpc(fn, args) { return fetch('/__sb/rest/v1/rpc/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) }).then((r) => r.json().catch(() => null)); }
  };
  return true; })()`;

const say = (t, s, run, frame) => ({ t, say: s, run, frame: frame || 'phone' });

const VIDEOS = [
  {
    id: 'teacher-login', n: 1, title: 'استاد کا اکاؤنٹ اور پہلا لاگ ان',
    steps: [
      say('استاد کا اکاؤنٹ اور پہلا لاگ ان', 'السلام علیکم! اس ویڈیو میں ہم دیکھیں گے کہ استاد کا اکاؤنٹ کیسے بنتا ہے، اور پہلی بار لاگ ان کر کے اپنی کلاس کیسے بنائیں۔',
        async (P) => { await P.go('/class/', "document.querySelector('form[data-form=\"login\"]')"); await P.ev("V.ring('form[data-form=\"login\"]')"); }),
      say('ایڈمن اکاؤنٹ بناتا ہے', 'استاد اپنا اکاؤنٹ خود نہیں بناتے۔ اسکول کا ایڈمن عملے کے پینل میں یوزرز والا صفحہ کھولتا ہے، استاد کی ای میل اور کم از کم آٹھ حروف کا پاس ورڈ لکھتا ہے، اور ایڈ کا بٹن دباتا ہے۔',
        async (P) => {
          await P.view(LAPTOP);
          await P.ev("localStorage.setItem('ssp-staff-session', JSON.stringify({ access_token: 'demo', refresh_token: 'demo', expires_at: Math.floor(Date.now() / 1000) + 3600 }))");
          await P.go('/admin#users', "[...document.querySelectorAll('h2')].some((h) => /Add a teacher/.test(h.textContent))");
          await P.ev(`(() => { const f = [...document.querySelectorAll('form')].find((x) => /Add a teacher/.test(x.textContent));
            const inp = f.querySelectorAll('input'); inp[0].value = '${TEACHER.email}'; inp[1].value = '${TEACHER.pw}';
            window.scrollTo(0, f.getBoundingClientRect().top + scrollY - 20); V.ring(f); return true; })()`);
        }, 'laptop'),
      say('اکاؤنٹ بن گیا', 'اکاؤنٹ بن گیا۔ اب ایڈمن استاد کو تین چیزیں دیتا ہے: استاد والے صفحے کا پتہ، ای میل، اور پاس ورڈ۔ پاس ورڈ کسی اور کو نہ بتائیں۔',
        async (P) => {
          await P.ev("(() => { const f = [...document.querySelectorAll('form')].find((x) => /Add a teacher/.test(x.textContent)); f.requestSubmit(); return true; })()");
          await P.wait("document.querySelector('form .msg.ok')");
          await P.ev("V.ring(document.querySelector('form .msg.ok'))");
        }, 'laptop'),
      say('استاد لاگ ان کرے', 'اب استاد اپنے فون پر ویب سائٹ کا استاد والا صفحہ کھولے، یعنی سلیش کلاس۔ ای میل اور پاس ورڈ لکھے اور لاگ ان کا بٹن دبائے۔',
        async (P) => {
          await P.view(PHONE);
          await P.ev("localStorage.removeItem('ssp-staff-session')");
          await P.go('/class/', "document.querySelector('form[data-form=\"login\"]')");
          await P.ev(`V.set('input[name="email"]', '${TEACHER.email}'), V.set('input[name="pw"]', '${TEACHER.pw}'), V.ring('form[data-form="login"]')`);
        }),
      say('میری کلاسیں', 'لاگ ان ہو گیا۔ یہ میری کلاسیں والا صفحہ ہے۔ پہلی بار یہاں کوئی کلاس نہیں ہوتی، اس لیے نیچے نئی کلاس کا خانہ ہے۔',
        async (P) => {
          await P.ev("document.querySelector('form[data-form=\"login\"]').requestSubmit()");
          await P.wait("document.querySelector('form[data-form=\"class\"]')");
          await P.ev("V.top('.tc-head'), V.ring('form[data-form=\"class\"]')");
        }),
      say('کلاس بنائیں', 'کلاس کا نام لکھیں، جیسے پنجم الف، اور اپنے اسکول کا نام۔ پھر کلاس بنائیں کا بٹن دبائیں۔',
        async (P) => { await P.ev("V.set('form[data-form=\"class\"] input[name=\"name\"]', 'پنجم الف'), V.set('form[data-form=\"class\"] input[name=\"school\"]', 'نمونہ پرائمری اسکول'), V.top('form[data-form=\"class\"]', 60), V.ring('form[data-form=\"class\"]')"); }),
      say('کلاس بن گئی', 'کلاس بن گئی اور اس کا صفحہ کھل گیا۔ اوپر کلاس کے حصوں کے بٹن ہیں، جیسے طلبہ، ہوم ورک، اور پیچھے رہ جانے والے۔ اگلی ویڈیو میں ہم بچوں کے اکاؤنٹ بنائیں گے۔',
        async (P) => {
          await P.ev("document.querySelector('form[data-form=\"class\"]').requestSubmit()");
          await P.wait("document.querySelector('.tc-tabs')");
          await P.ev("window.scrollTo(0, 0), V.ring('.tc-tabs')");
        }),
      say('لاگ آؤٹ اور پاس ورڈ', 'کام ختم ہو تو لاگ آؤٹ دبا دیں، خاص طور پر اگر فون کسی اور کا ہو۔ اگر پاس ورڈ بھول جائیں تو ایڈمن آپ کے لیے نیا پاس ورڈ بنا سکتا ہے۔',
        async (P) => {
          await P.ev("document.querySelector('[data-act=\"home\"]').click()");
          await P.wait("document.querySelector('.tc-class')");
          await P.ev("window.scrollTo(0, 0), V.ring('[data-act=\"logout\"]'), V.ring('.tc-class')");
        })
    ]
  },
  {
    id: 'teacher-students', n: 2, title: 'بچوں کے اکاؤنٹ اور لاگ ان پرچیاں',
    steps: [
      say('بچوں کے اکاؤنٹ', 'اس ویڈیو میں ہم بچوں کے اکاؤنٹ بنائیں گے اور ان کی لاگ ان پرچیاں پرنٹ کریں گے۔ استاد والے صفحے پر اپنی کلاس کھولیں۔',
        async (P) => { await P.ev("V.ring('.tc-class')"); }),
      say('طلبہ کا خانہ', 'کلاس میں طلبہ والے حصے میں یہ خانہ ہے۔ یہاں بچوں کے نام لکھنے ہیں۔',
        async (P) => {
          await P.ev("document.querySelector('.tc-class').click()");
          await P.wait("document.querySelector('form[data-form=\"students\"]')");
          await P.ev("V.top('.tc-tabs', 20), V.ring('form[data-form=\"students\"]')");
        }),
      say('نام لکھیں', 'ہر لائن میں ایک بچے کا نام لکھیں۔ ایک بار میں ساٹھ نام تک لکھ سکتے ہیں۔ پھر اکاؤنٹ بنائیں کا بٹن دبائیں۔',
        async (P) => { await P.ev(`V.set('textarea[name="names"]', ${JSON.stringify(NAMES.join('\n'))}), V.ring('textarea[name="names"]')`); }),
      say('لاگ ان پرچیاں', 'سائٹ نے ہر بچے کے لیے یوزر نیم اور چار ہندسوں کا پن بنا دیا۔ دھیان دیں: یہ پن صرف ابھی نظر آتے ہیں، اس لیے ابھی پرنٹ کر لیں یا لکھ لیں۔',
        async (P) => {
          await P.ev("document.querySelector('form[data-form=\"students\"]').requestSubmit()");
          await P.wait("document.querySelector('.tc-slip')");
          const slips = await P.ev("[...document.querySelectorAll('.tc-slip')].map((s) => ({ name: s.querySelector('.tc-slip-name').textContent, b: [...s.querySelectorAll('b.ltr')].map((x) => x.textContent), link: (s.textContent.match(/c=([A-Z0-9]+)/) || [])[1] }))");
          slips.forEach((s) => { kids[s.name] = { username: s.b[0], pin: s.b[1], parent: s.link }; });
          await P.ev("window.scrollTo(0, 0), V.ring('.note')");
        }),
      say('ایک پرچی', 'ہر پرچی پر بچے کا نام، ویب سائٹ کا پتہ، یوزر نیم، پن، اور والدین کا لنک لکھا ہے۔',
        async (P) => { await P.ev("V.top('.tc-slips', 20), V.ring('.tc-slip')"); }),
      say('پرنٹ کریں', 'پرنٹ کا بٹن دبائیں، پرچیاں کاٹیں اور ہر بچے کو اس کی اپنی پرچی دیں۔ پرنٹر نہ ہو تو یوزر نیم اور پن کاپی میں لکھ لیں۔ پھر ٹھیک ہے دبائیں۔',
        async (P) => { await P.ev("window.scrollTo(0, 0), V.ring('[data-act=\"print\"]'), V.ring('[data-act=\"slipsdone\"]')"); }),
      say('کلاس کی فہرست', 'اب سب بچے کلاس کی فہرست میں ہیں۔ اگر کوئی بچہ پن بھول جائے تو اس کے نام کے سامنے نیا پن دبائیں۔ نئی پرچی بن جائے گی اور پرانا پن کام نہیں کرے گا۔',
        async (P) => {
          await P.ev("document.querySelector('[data-act=\"slipsdone\"]').click()");
          await P.wait("document.querySelector('.tc-table')");
          await P.ev("V.top('.table-wrap', 20), V.ring('[data-pin]')");
        }),
      say('بچہ لاگ ان کرے', 'بچہ ویب سائٹ پر لاگ ان والا صفحہ کھولے، اپنی پرچی سے یوزر نیم اور پن لکھے اور لاگ ان دبائے۔ اس کے بعد اس کا سارا کام استاد تک پہنچتا ہے۔',
        async (P) => {
          await P.go('/login/', "document.querySelector('input[name=\"user\"]')");
          const k = kids['Umar'];
          await P.ev(`V.set('input[name="user"]', '${k.username}'), V.set('input[name="pin"]', '${k.pin}'), V.top('input[name="user"]', 160), V.ring(document.querySelector('input[name="user"]').closest('form'))`);
        })
    ]
  },
  {
    id: 'teacher-homework', n: 3, title: 'ہوم ورک دینا',
    steps: [
      say('ہوم ورک', 'اس ویڈیو میں ہم بچوں کو ہوم ورک دیں گے۔ استاد والے صفحے پر کلاس کھولیں اور ہوم ورک والا بٹن دبائیں۔',
        async (P) => {
          await P.go('/class/', "document.querySelector('.tc-class')");
          await P.ev("document.querySelector('.tc-class').click()");
          await P.wait("document.querySelector('.tc-tabs')");
          await P.ev("window.scrollTo(0, 0), V.ring('[data-tab=\"homework\"]')");
        }),
      say('باب، کام اور تاریخ', 'باب منتخب کریں۔ پھر کام منتخب کریں: کوئز، ورک شیٹ، یا تجربہ۔ آخر میں آخری تاریخ رکھیں اور دیں کا بٹن دبائیں۔',
        async (P) => {
          await P.ev("document.querySelector('[data-tab=\"homework\"]').click()");
          await P.wait("document.querySelector('form[data-form=\"hw\"]')");
          await P.ev("V.set('select[name=\"chapter\"]', '5/science/matter'), V.set('select[name=\"kind\"]', 'quiz'), V.top('.tc-tabs', 20), V.ring('form[data-form=\"hw\"]')");
        }),
      say('ہوم ورک دے دیا', 'ہوم ورک فہرست میں آ گیا۔ یہاں لکھا ہے کہ کتنے بچوں نے کر لیا، اور کن بچوں نے ابھی نہیں کیا۔ ابھی کسی نے نہیں کیا۔',
        async (P) => {
          await P.ev("document.querySelector('form[data-form=\"hw\"]').requestSubmit()");
          await P.wait("document.querySelector('.tc-hw')");
          await P.ev("document.querySelector('[data-tab=\"homework\"]').click()");
          await P.wait("document.querySelector('.tc-hw')");
          await P.ev("V.top('.tc-hw', 120), V.ring('.tc-hw')");
        }),
      say('بچے کو ہوم ورک نظر آتا ہے', 'جب بچہ اپنے اکاؤنٹ سے لاگ ان کرتا ہے تو ویب سائٹ کے پہلے صفحے پر اسے اپنا ہوم ورک نظر آتا ہے۔ دبانے سے سیدھا وہی کوئز کھل جاتا ہے۔',
        async (P) => {
          const k = kids['Umar'];
          await P.go('/login/', "document.querySelector('input[name=\"user\"]')");
          await P.ev(`V.set('input[name="user"]', '${k.username}'), V.set('input[name="pin"]', '${k.pin}'), document.querySelector('input[name="user"]').closest('form').requestSubmit()`);
          await sleep(1500);
          await P.go('/', "document.querySelector('.stu-hw')");
          await P.ev("V.top('.stu-hw', 120), V.ring('.stu-hw')");
          // sign the child out again so the teacher pages are not mixed with a child's account
          await P.ev("localStorage.removeItem('ssp1.student'), sessionStorage.clear()");
        }),
      say('کس نے کر لیا', 'جیسے جیسے بچے کوئز کرتے ہیں، یہ گنتی خود بڑھتی ہے۔ ابھی چھ میں سے چار بچوں نے کر لیا ہے۔ نیچے ان دو بچوں کے نام ہیں جنہوں نے ابھی نہیں کیا۔',
        async (P) => {
          await P.go('/class/', "document.querySelector('.tc-class')");
          // the demo children do their quizzes (test data on the demo server)
          await P.ev(`(async () => {
            const done = ${JSON.stringify(['Ahmed Ali', 'Sara Khan', 'Bilal', 'Zainab'].map((n) => [kids[n].username, kids[n].pin]))};
            const score = [14, 12, 6, 13];
            for (let i = 0; i < done.length; i++) {
              const s = await V.rpc('student_login', { p_username: done[i][0], p_pin: done[i][1] });
              await V.rpc('student_report', { p_token: s.token, p_kind: 'quiz', p_chapter: '5/science/matter', p_score: score[i], p_total: 16 });
            }
            return true; })()`);
          await P.ev("document.querySelector('.tc-class').click()");
          await P.wait("document.querySelector('.tc-tabs')");
          await P.ev("document.querySelector('[data-tab=\"homework\"]').click()");
          await P.wait("document.querySelector('.tc-hw')");
          await P.ev("V.top('.tc-hw', 120), V.ring('.tc-hw')");
        }),
      say('ہوم ورک ہٹائیں', 'اگر غلطی سے غلط ہوم ورک دے دیا ہو تو ہٹائیں کا بٹن دبا کر اسے ختم کر دیں، پھر صحیح ہوم ورک دوبارہ دیں۔',
        async (P) => { await P.ev("V.top('.tc-hw', 120), V.ring('[data-hwdel]')"); })
    ]
  },
  {
    id: 'teacher-results', n: 4, title: 'نتائج اور پیچھے رہ جانے والے',
    steps: [
      say('نتائج', 'اس ویڈیو میں ہم دیکھیں گے کہ بچوں کے نتائج کہاں نظر آتے ہیں، اور کون سے بچے پیچھے رہ گئے ہیں۔',
        async (P) => {
          // more demo work: a few more quizzes and points, so the lists have something to show
          await P.ev(`(async () => {
            const more = ${JSON.stringify([['Ahmed Ali', 'living-things', 15, 120], ['Sara Khan', 'living-things', 13, 95], ['Bilal', 'living-things', 5, 40], ['Zainab', 'seeds', 14, 110]].map((r) => [kids[r[0]].username, kids[r[0]].pin, r[1], r[2], r[3]]))};
            for (const m of more) {
              const s = await V.rpc('student_login', { p_username: m[0], p_pin: m[1] });
              await V.rpc('student_report', { p_token: s.token, p_kind: 'quiz', p_chapter: '5/science/' + m[2], p_score: m[3], p_total: 16 });
              await V.rpc('student_save', { p_token: s.token, p_data: { keys: { 'ssp1.progress': JSON.stringify({ points: m[4] }) } } });
            }
            return true; })()`);
          await P.ev("document.querySelector('[data-act=\"home\"]').click()");
          await P.wait("document.querySelector('.tc-class')");
          await P.ev("document.querySelector('.tc-class').click()");
          await P.wait("document.querySelector('.tc-table')");
          await P.ev("window.scrollTo(0, 0), V.ring('.tc-tabs')");
        }),
      say('طلبہ کی فہرست', 'طلبہ والی فہرست میں ہر بچے کے پوائنٹس نظر آتے ہیں، اور یہ بھی کہ وہ آخری بار کب ویب سائٹ پر آیا۔',
        async (P) => { await P.ev("V.top('.table-wrap', 20), V.ring('.tc-table')"); }),
      say('پیچھے رہ جانے والے', 'اب پیچھے رہ جانے والے بٹن دبائیں۔ پہلی فہرست میں وہ بچے ہیں جنہوں نے اس ہفتے کچھ نہیں کیا۔',
        async (P) => {
          await P.ev("document.querySelector('[data-tab=\"behind\"]').click()");
          await P.ev("V.top('.tc-tabs', 20), V.ring(document.querySelectorAll('main section.card')[0])");
        }),
      say('کم نمبر', 'دوسری فہرست میں وہ بچے ہیں جن کا کوئز کا اوسط پچاس فیصد سے کم ہے۔ ان بچوں پر کلاس میں خاص توجہ دیں۔',
        async (P) => { await P.ev("V.top('.tc-tabs', 20), V.ring(document.querySelectorAll('main section.card')[1])"); }),
      say('واٹس ایپ رپورٹ', 'ہر نام کے ساتھ واٹس ایپ کا لنک ہے۔ اسے دبانے سے بچے کی رپورٹ کا پیغام تیار ہو جاتا ہے۔ واٹس ایپ میں والدین کا نمبر خود چنیں اور بھیج دیں۔',
        async (P) => { await P.ev("V.top('.tc-tabs', 20), V.ring([...document.querySelectorAll('main section.card a')].find((a) => /wa\\.me/.test(a.href)))"); }),
      say('والدین کا صفحہ', 'رپورٹ میں والدین کا لنک ہوتا ہے۔ اسے کھولنے پر والدین کو بچے کے پوائنٹس، نتائج اور ہوم ورک نظر آتے ہیں، کسی پاس ورڈ کے بغیر۔',
        async (P) => {
          await P.go('/parent/?c=' + kids['Ahmed Ali'].parent, "document.querySelector('main h1, main h2')");
          await sleep(800);
          await P.ev("window.scrollTo(0, 0), V.ring(document.querySelector('main .card') || document.querySelector('main'))");
        }),
      say('ہر ہفتے دیکھیں', 'ہر ہفتے یہ صفحہ ضرور دیکھیں۔ جو بچے پیچھے ہیں ان کی مدد کریں، اور جو اچھا کر رہے ہیں انہیں شاباش دیں۔',
        async (P) => {
          await P.go('/class/', "document.querySelector('.tc-class')");
          await P.ev("document.querySelector('.tc-class').click()");
          await P.wait("document.querySelector('.tc-tabs')");
          await P.ev("document.querySelector('[data-tab=\"behind\"]').click()");
          await P.ev("window.scrollTo(0, 0)");
        })
    ]
  },
  {
    id: 'teacher-paper-book', n: 5, title: 'سوالیہ پرچہ اور باب کی کتاب',
    steps: [
      say('سوالیہ پرچہ بنائیں', 'اس ویڈیو میں ہم سوالیہ پرچہ بنائیں گے، اور باب کی کتاب پی ڈی ایف میں لیں گے۔ ویب سائٹ پر سوالیہ پرچہ والا صفحہ کھولیں۔ پہلے قدم میں باب منتخب کریں۔',
        async (P) => {
          await P.ev("localStorage.removeItem('ssp1.paper')");
          await P.go('/paper/', "document.querySelector('#maker input[name=\"ch\"]')");
          await P.ev("document.querySelector('[data-act=\"none\"]').click()");
          await P.ev("['matter', 'force-machines'].forEach((id) => { const c = document.querySelector('#maker input[name=\"ch\"][value=\"' + id + '\"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); })");
          await P.ev("V.top('.pm-step', 20), V.ring('.pm-step')");
        }),
      say('سوال اور نمبر', 'دوسرے قدم میں لکھیں کہ ہر قسم کے کتنے سوال چاہییں، اور ہر سوال کے کتنے نمبر۔ کل نمبر خود جمع ہو جاتے ہیں۔',
        async (P) => { await P.ev("V.top(document.querySelectorAll('.pm-step')[1], 20), V.ring(document.querySelectorAll('.pm-step')[1])"); }),
      say('پرچے کی تفصیل', 'تیسرے قدم میں اسکول کا نام، امتحان کا نام، جماعت، وقت اور تاریخ لکھیں۔ پھر پرچہ بنائیں کا بٹن دبائیں۔',
        async (P) => {
          await P.ev("V.set('#maker input[name=\"school\"]', 'نمونہ پرائمری اسکول'), V.set('#maker input[name=\"exam\"]', 'ماہانہ ٹیسٹ'), V.set('#maker input[name=\"cls\"]', 'پنجم'), V.set('#maker input[name=\"time\"]', '40 منٹ'), V.set('#maker input[name=\"date\"]', '2026-11-20')");
          await P.ev("V.top(document.querySelectorAll('.pm-step')[2], 20), V.ring(document.querySelectorAll('.pm-step')[2])");
        }),
      say('پرچہ تیار ہے', 'پرچہ تیار ہو گیا۔ اس پر ایک کوڈ لکھا ہوتا ہے۔ یہی کوڈ دوبارہ لکھیں تو بالکل یہی پرچہ دوبارہ بن جاتا ہے، چاہے کسی اور زبان میں بنائیں۔',
        async (P) => {
          await P.ev("document.getElementById('maker').requestSubmit()");
          await P.wait("document.querySelector('[data-act=\"print-paper\"]')", 15000);
          await P.ev("V.top('#out', 10), V.ring(document.querySelector('#out').firstElementChild)");
        }),
      say('پرچہ اور جوابات پرنٹ کریں', 'پرچہ پرنٹ کریں کا بٹن دبا کر پرچہ چھاپیں۔ جوابات کی کلید الگ بٹن سے پرنٹ ہوتی ہے، تاکہ وہ صرف آپ کے پاس رہے۔',
        async (P) => { await P.ev("V.top(document.querySelector('[data-act=\"print-paper\"]').closest('.btn-row'), 120), V.ring(document.querySelector('[data-act=\"print-paper\"]').closest('.btn-row'))"); }),
      say('باب کی کتاب', 'اب باب کی کتاب۔ کتاب والا صفحہ کھولیں، باب منتخب کریں، اور جو حصے چاہییں ان پر نشان لگائیں: سبق، تصویریں، اہم الفاظ، تجربہ، سوالات، ورک شیٹ اور جوابات۔',
        async (P) => {
          // /book/ asks for a student login (site-nav.js); the demo server's test account opens it for the recording
          await P.ev("localStorage.setItem('ssp1.student', JSON.stringify({ token: 'test-token', username: 'zz_test', name: 'Test' }))");
          await P.go('/book/?ch=matter&lang=ur', "document.querySelector('#book')");
          await sleep(800);
          await P.ev("V.top('select[name=\"ch\"]', 120), V.ring(document.querySelector('select[name=\"ch\"]').closest('form, section, .card') || document.querySelector('.bt-row'))");
        }),
      say('پی ڈی ایف بنائیں', 'نیچے کتاب کے صفحے تیار نظر آتے ہیں۔ پرنٹ یا پی ڈی ایف کا بٹن دبائیں، اور پرنٹ والی کھڑکی میں سیو ایز پی ڈی ایف منتخب کریں۔ یا ساتھ والے بٹن سے تیار پی ڈی ایف سیدھی ڈاؤن لوڈ کر لیں۔',
        async (P) => {
          await P.ev("V.top('[data-act=\"print\"]', 200), V.ring(document.querySelector('[data-act=\"print\"]').closest('.btn-row') || '[data-act=\"print\"]')");
          await P.ev("localStorage.removeItem('ssp1.student')");
        })
    ]
  }
];

(async () => {
  const server = spawn(process.execPath, [path.join(site, '..', 'video-work', 'scripts', 'serve.js'), site, String(PORT), '--mock'], { stdio: 'ignore' });
  await sleep(900);
  const page = await launch({ profile: path.join(work, 'chrome-teacher'), port: 9373 });
  let view = null;
  const P = {
    async view(v) { if (view !== v) { view = v; await page.viewport(v[0], v[1], v[2], v[3]); } },
    async go(url, ready) { await page.goto(BASE + url, ready); await page.eval(HELPERS); },
    ev(js) { return page.eval(js); },
    wait(expr, ms) { return page.waitFor(expr, ms || 10000); }
  };
  try {
    await page.send('Page.enable');
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await P.view(PHONE);
    await page.goto(BASE + '/');
    await page.eval("localStorage.clear(), localStorage.setItem('ssp1.lang', JSON.stringify('ur')), true");
    for (const vid of VIDEOS) {
      const dir = path.join(work, vid.id);
      fs.mkdirSync(dir, { recursive: true });
      const shots = [];
      for (let i = 0; i < vid.steps.length; i++) {
        const st = vid.steps[i];
        await P.view(st.frame === 'laptop' ? LAPTOP : PHONE);
        await page.eval(HELPERS);
        await st.run(P);
        await page.settle();
        // the demo server's address would show on slips and links: show the real site's address instead
        await page.eval(`(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = w.nextNode(); n; n = w.nextNode()) if (/localhost:${PORT}/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/(https?:\\/\\/)?localhost:${PORT}/g, 'sindh-science-portal.vercel.app');
          document.querySelectorAll('input').forEach((i) => { if (/localhost:${PORT}/.test(i.value)) i.value = i.value.replace(/(https?:\\/\\/)?localhost:${PORT}/g, 'sindh-science-portal.vercel.app'); });
          return true; })()`);
        const f = path.join(dir, 'page-' + String(i + 1).padStart(2, '0') + '.png');
        await page.shot(f);
        shots.push(f);
        await page.eval('window.V && V.clear(), true');
        console.log(vid.id, 'shot', i + 1, 'of', vid.steps.length);
      }
      vid.shots = shots;
    }

    // slides
    await P.view([1920, 1080, 1, false]);
    const font = (f) => 'file:///' + path.join(site, 'fonts', f).replace(/\\/g, '/');
    for (const vid of VIDEOS) {
      const dir = path.join(work, vid.id), steps = [];
      for (let i = 0; i < vid.steps.length; i++) {
        const s = vid.steps[i], img = 'file:///' + vid.shots[i].replace(/\\/g, '/'), laptop = s.frame === 'laptop';
        const dots = vid.steps.map((x, j) => '<i class="' + (j === i ? 'on' : j < i ? 'done' : '') + '"></i>').join('');
        const html = `<!doctype html><html lang="ur" dir="rtl"><head><meta charset="utf-8"><style>
@font-face { font-family: Naskh; src: url("${font('noto-naskh-arabic-arabic-400-normal.woff2')}"); font-weight: 400; }
@font-face { font-family: Naskh; src: url("${font('noto-naskh-arabic-arabic-700-normal.woff2')}"); font-weight: 700; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #fff; font-family: Naskh, "Segoe UI", sans-serif; color: #1f2d1f; }
.band { position: absolute; inset: 0 0 auto 0; height: 14px; background: #2e7d32; }
.wrap { position: absolute; inset: 14px 0 0 0; display: grid; grid-template-columns: 1fr ${laptop ? 1060 : 560}px; gap: ${laptop ? 50 : 70}px; padding: 50px ${laptop ? 70 : 110}px 50px ${laptop ? 50 : 90}px; box-sizing: border-box; }
.text { display: flex; flex-direction: column; justify-content: center; }
.eyebrow { color: #2e7d32; font-size: ${laptop ? 28 : 32}px; font-weight: 700; margin: 0 0 6px; }
h1 { font-size: ${laptop ? 54 : 64}px; line-height: 1.5; margin: 0 0 22px; color: #1b5e20; }
.say { font-size: ${laptop ? 34 : 39}px; line-height: 2; margin: 0; background: #f1f8f1; border-right: 10px solid #2e7d32; border-radius: 18px; padding: 24px 32px; }
.phone { align-self: center; justify-self: center; width: 470px; height: 898px; border-radius: 46px; background: #1f2d1f; padding: 16px; box-shadow: 0 30px 70px rgba(0,0,0,.18); }
.phone img { display: block; width: 470px; height: 898px; border-radius: 32px; object-fit: cover; object-position: top; }
.laptop { align-self: center; justify-self: center; width: 1024px; }
.laptop .scr { background: #1f2d1f; border-radius: 22px 22px 0 0; padding: 18px; }
.laptop img { display: block; width: 988px; height: 618px; object-fit: cover; object-position: top; border-radius: 6px; }
.laptop .base { height: 26px; background: #c9d3c9; border-radius: 0 0 26px 26px; margin: 0 -40px; }
.dots { position: absolute; bottom: 34px; left: 90px; display: flex; gap: 10px; direction: ltr; }
.dots i { width: 16px; height: 16px; border-radius: 50%; background: #d9e6d9; } .dots i.done { background: #9cc79e; } .dots i.on { background: #2e7d32; width: 40px; border-radius: 8px; }
.demo { position: absolute; bottom: 28px; right: 110px; font-size: 24px; color: #6b7b6b; }
</style></head><body><div class="band"></div><div class="wrap">
<div class="text"><p class="eyebrow">اساتذہ کی تربیت · ویڈیو ${vid.n} از 5 · ${vid.title}</p><h1>${s.t}</h1><p class="say">${s.say}</p></div>
${laptop ? `<div class="laptop"><div class="scr"><img src="${img}" alt=""></div><div class="base"></div></div>` : `<div class="phone"><img src="${img}" alt=""></div>`}
</div><div class="dots">${dots}</div><p class="demo">نمونے کا ڈیٹا · نام اور اکاؤنٹ فرضی ہیں</p></body></html>`;
        const hf = path.join(dir, 'slide-' + String(i + 1).padStart(2, '0') + '.html');
        fs.writeFileSync(hf, html);
        await page.goto('file:///' + hf.replace(/\\/g, '/'), "document.querySelector('img').complete");
        const png = hf.replace(/\.html$/, '.png');
        await page.shot(png);
        steps.push({ png, say: s.say, pause: i === vid.steps.length - 1 ? 1.2 : 0 });
      }
      fs.writeFileSync(path.join(dir, 'steps.json'), JSON.stringify(steps, null, 1));
      console.log('done slides', vid.id, steps.length);
    }
    console.log('done all slides');
  } finally { await page.close(); server.kill(); }
})().catch((e) => { console.error(e); process.exit(1); });
