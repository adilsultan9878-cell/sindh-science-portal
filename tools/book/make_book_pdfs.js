// Makes the ready PDFs for /book/: one per chapter and language, and the whole book per language.
// Opens /book/?ch=<id|all>&lang=<l>&pdf=1 in headless Chrome and saves Page.printToPDF (A4, from the page's CSS).
// Usage (with tools/serve.js running the site): node make_book_pdfs.js <base url> <output folder> [only: e.g. "plants-ur,all-en"]
// Also reports script errors and the page count of each file.
const fs = require('fs');
const path = require('path');
const { launch, sleep } = require('./cdp');

const BASE = process.argv[2] || 'http://localhost:5190';
const OUT = path.resolve(process.argv[3] || 'pdf-out');
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const LANGS = ['sd', 'ur', 'en'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const catalog = await (await fetch(BASE + '/data/catalog.json')).json();
  const ids = catalog.classes.find((c) => c.id === '5').subjects.find((s) => s.id === 'science').chapters;
  const jobs = [];
  LANGS.forEach((l) => { ['all'].concat(ids).forEach((ch) => jobs.push({ ch, l, file: (ch === 'all' ? 'class5-science' : ch) + '-' + l + '.pdf' })); });
  const todo = ONLY ? jobs.filter((j) => ONLY.includes(j.ch + '-' + j.l)) : jobs;

  const page = await launch({ profile: 'C:\\Users\\adils\\AppData\\Local\\Temp\\vidrec\\prof-book-' + Date.now(), port: 9395 });
  let errs = [];
  page.ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Runtime.exceptionThrown') errs.push('exception: ' + (m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text).split('\n')[0]);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push('console: ' + m.params.args.map((a) => a.value || a.description).join(' ').slice(0, 200));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errs.push('log: ' + m.params.entry.text.slice(0, 200));
  });
  let total = 0, bad = 0;
  try {
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    await page.send('Log.enable');
    for (const j of todo) {
      errs = [];
      const t0 = Date.now();
      await page.goto(BASE + '/book/?ch=' + j.ch + '&lang=' + j.l + '&pdf=1', "document.body.getAttribute('data-book-ready') === '1'");
      await sleep(300);
      const r = await page.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, generateTaggedPDF: true, generateDocumentOutline: true });
      const buf = Buffer.from(r.data, 'base64');
      fs.writeFileSync(path.join(OUT, j.file), buf);
      total += buf.length;
      const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      if (errs.length) bad++;
      console.log((errs.length ? 'CHECK ' : 'ok    ') + j.file.padEnd(34) + String(pages).padStart(4) + ' pages ' + (buf.length / 1048576).toFixed(2).padStart(6) + ' MB  ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s' + (errs.length ? '\n      ' + errs.join('\n      ') : ''));
    }
  } finally { await page.close(); }
  console.log(todo.length + ' file(s), ' + (total / 1048576).toFixed(1) + ' MB in all' + (bad ? ', ' + bad + ' with errors' : ''));
})().catch((e) => { console.error(e); process.exit(1); });
