// Trang nghe thử tiếng cho phim case — chỉ chạy ở máy, không thuộc site.
//   python scripts/motion-sfx.py --audition      (cắt ứng viên → output/motion-audio/audition/)
//   node scripts/motion-audio-audition.cjs        → http://127.0.0.1:3012
// Hình lấy từ bản render ở .preview/<phim>-film.mp4; mốc tiếng lấy thẳng từ bảng tiếng của phim
// (scripts/motion-cues.cjs) nên khớp đúng khung hình đang dùng.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { filmCues } = require('./motion-cues.cjs');

const root = path.resolve(__dirname, '..');
const audition = path.join(root, 'output', 'motion-audio', 'audition');
const preview = path.join(root, '.preview');

const mime = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };

function send(res, file, req) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Thiếu file — chạy motion-sfx.py --audition và render phim trước.'); }
  const size = fs.statSync(file).size;
  const type = mime[path.extname(file)] || 'application/octet-stream';
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  // Video cần Range để tua tới đúng cảnh.
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store' });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end(); }
  if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (pathname === '/') return send(res, path.join(__dirname, 'motion-audio-audition.html'), req);
  const cues = /^\/cues\/([a-z]+)\.json$/.exec(pathname);
  if (cues) {
    try { const body = JSON.stringify(filmCues(cues[1])); res.writeHead(200, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' }); return res.end(body); }
    catch (error) { res.writeHead(500); return res.end(String(error)); }
  }
  const video = /^\/film\/([a-z]+)\.mp4$/.exec(pathname);
  if (video) return send(res, path.join(preview, `${video[1]}-film.mp4`), req);
  if (pathname === '/manifest.json') return send(res, path.join(audition, 'manifest.json'), req);
  if (pathname.startsWith('/clips/')) {
    const base = path.join(audition, 'clips');
    const file = path.resolve(base, pathname.slice('/clips/'.length));
    if (!file.startsWith(base + path.sep)) { res.writeHead(403); return res.end(); }
    return send(res, file, req);
  }
  res.writeHead(404); res.end();
});

const port = Number(process.env.MOTION_AUDITION_PORT || 3012);
// Chỉ nghe ở loopback: trang phục vụ tiếng Adobe/Freesound nguyên bản, không được đưa ra ngoài.
server.listen(port, '127.0.0.1', () => console.log(`Motion audio audition: http://127.0.0.1:${port}`));
