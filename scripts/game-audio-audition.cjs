// Local audition only. Nothing here is imported by Next or the production game.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { root, compile } = require('./game-test-runtime.cjs');
const previewRoot = path.join(root, 'output', 'audio-audition', 'preview');
const modules = {
  '/engine.js': 'const process={env:{NODE_ENV:"production"}};\n' + compile('components/game/engine.ts', true),
  '/chapterMission': compile('components/game/chapterMission.ts', true),
  '/content.js': compile('content/content.vi.ts', true),
};
const mime = { '.html':'text/html; charset=utf-8', '.json':'application/json', '.js':'text/javascript; charset=utf-8', '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.png':'image/png' };
const server = http.createServer((req,res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end(); }
  if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (modules[pathname]) { res.setHeader('Content-Type', mime['.js']); return res.end(modules[pathname]); }
  let file;
  if (pathname === '/') file = path.join(__dirname, 'game-audio-audition.html');
  else {
    const base = pathname.startsWith('/preview/') ? previewRoot : pathname.startsWith('/game/') ? path.join(root,'public','game') : null;
    if (!base) { res.writeHead(404); return res.end(); }
    file = path.resolve(base, pathname.replace(/^\/(preview|game)\//, ''));
    if (!file.startsWith(base + path.sep)) { res.writeHead(403); return res.end(); }
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Run preview preparation first.'); }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(file).pipe(res);
});
const port = Number(process.env.AUDIO_AUDITION_PORT || 3011);
// Loopback only: this diagnostic includes engine shortcuts and is never deployed.
server.listen(port, '127.0.0.1', () => console.log(`Audio audition: http://127.0.0.1:${port}`));
