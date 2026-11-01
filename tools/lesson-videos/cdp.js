// Tiny Chrome DevTools Protocol driver: launch headless Chrome, open one page, click, type, screenshot.
const { spawn } = require('child_process');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch(opts) {
  const port = opts.port || 9333;
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + opts.profile,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--disable-gpu',
    '--force-color-profile=srgb', '--lang=ur', 'about:blank'], { stdio: 'ignore' });
  let target = null;
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(150);
    try {
      const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
      target = list.find((t) => t.type === 'page');
    } catch (e) { /* not up yet */ }
  }
  if (!target) throw new Error('Chrome did not start');
  const page = new Page(new WebSocket(target.webSocketDebuggerUrl), proc);
  await page.ready;
  return page;
}

class Page {
  constructor(ws, proc) {
    this.ws = ws; this.proc = proc; this.id = 0; this.calls = new Map(); this.waiters = [];
    this.ready = new Promise((res) => ws.addEventListener('open', res));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.calls.has(msg.id)) {
        const c = this.calls.get(msg.id); this.calls.delete(msg.id);
        msg.error ? c.reject(new Error(c.method + ': ' + msg.error.message)) : c.resolve(msg.result);
      } else if (msg.method) {
        this.waiters = this.waiters.filter((w) => { if (w.method === msg.method) { w.resolve(msg.params); return false; } return true; });
      }
    });
  }
  send(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => { this.calls.set(id, { resolve, reject, method }); this.ws.send(JSON.stringify({ id, method, params: params || {} })); });
  }
  once(method) { return new Promise((resolve) => this.waiters.push({ method, resolve })); }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text) + '\n' + expr.slice(0, 200));
    return r.result.value;
  }
  async waitFor(expr, ms) {
    const end = Date.now() + (ms || 10000);
    while (Date.now() < end) { if (await this.eval('!!(' + expr + ')')) return; await sleep(100); }
    throw new Error('timeout waiting for ' + expr);
  }
  async viewport(w, h, dpr, mobile) {
    await this.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: !!mobile });
    if (mobile) await this.send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36' });
  }
  async goto(url, readyExpr) {
    const loaded = this.once('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded;
    if (readyExpr) await this.waitFor(readyExpr, 15000);
    await this.settle();
  }
  // wait until fonts are in and nothing has changed in the page for a short while
  async settle() {
    await this.eval('document.fonts.ready.then(() => true)');
    let last = '';
    for (let i = 0; i < 30; i++) {
      const now = await this.eval('document.body.innerHTML.length + ":" + scrollY');
      if (now === last) break;
      last = now; await sleep(120);
    }
    await sleep(150);
  }
  // centre of the element's first line box, in CSS pixels of the viewport (after scrolling it into view if asked)
  async rect(sel, scroll) {
    const r = await this.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return null; ${scroll ? "e.scrollIntoView({block: 'center'});" : ''} const rs = e.getClientRects(); const b = rs.length ? rs[0] : e.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height }; })()`);
    if (!r) throw new Error('not found: ' + sel);
    return r;
  }
  async clickAt(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  async click(sel, opts) {
    opts = opts || {};
    if (opts.scroll !== false) await this.rect(sel, true);
    await sleep(80);
    const r2 = await this.rect(sel, false);
    await this.clickAt(r2.x, r2.y);
    if (opts.settle !== false) await this.settle();
    return { x: r2.x, y: r2.y };
  }
  async type(text) { await this.send('Input.insertText', { text }); }
  async scrollTo(sel, block) {
    await this.eval(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block: '${block || 'start'}'})`);
    await sleep(150);
  }
  async shot(file) {
    const r = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
  }
  async close() { try { await this.send('Browser.close'); } catch (e) { /* gone */ } try { this.proc.kill(); } catch (e) { /* gone */ } }
}

module.exports = { launch, sleep };
