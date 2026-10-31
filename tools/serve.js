// Tiny static server for local preview: node serve.js <root> <port>
// Same routing as vercel.json: /admin -> admin.html, unknown paths -> index.html.
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.'), port = +(process.argv[3] || 5173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg', '.jpg': 'image/jpeg', '.xml': 'application/xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/admin' || p === '/admin/') p = '/admin.html';
  let file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (/^\/(css|js|data|fonts|icons|img|audio|videos|lesson-videos)\//.test(p)) { res.writeHead(404); return res.end('not found'); }
    file = path.join(root, 'index.html');
  }
  const headers = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' };
  const size = fs.statSync(file).size, range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range) {
    const start = +range[1] || 0, end = range[2] ? +range[2] : size - 1;
    res.writeHead(206, Object.assign(headers, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes' }));
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, Object.assign(headers, { 'Content-Length': size, 'Accept-Ranges': 'bytes' }));
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log('serving ' + root + ' on http://localhost:' + port));
