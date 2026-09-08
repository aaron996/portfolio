// Local-only browser diagnostic. No debug route is included in the Next build.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { root, compile } = require('./game-test-runtime.cjs');
const modules = {
  '/warehouse-route.js': fs.readFileSync(path.join(__dirname, 'warehouse-route.cjs'),'utf8')
    .replace("const assert = require('node:assert/strict');", "const assert = {ok(v,m){if(!v)throw Error(m)},equal(a,b,m){if(a!==b)throw Error(m || (a+' != '+b))}};")
    .replace("const { advance } = require('./game-test-runtime.cjs');", "function advance(g,s){for(let i=0;i<Math.round(s*120);i++)g.lab.step(1/120)}")
    .replace('module.exports={warehouseRoute};', 'export { warehouseRoute };'),
  '/chapterMission': compile('components/game/chapterMission.ts', true),
  '/engine.js': 'const process = {env:{NODE_ENV:"production"}};\n' + compile('components/game/engine.ts', true),
  '/content.js': compile('content/content.vi.ts', true),
};
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/manifest.json') {
    const manifest = Object.fromEntries(['player','mob','boss'].map(group => [group,
      fs.readdirSync(path.join(root,'public','game',group)).filter(f=>f.endsWith('.png')).map(f=>`/game/${group}/${f}`)
    ]));
    res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(manifest));
  }
  if (url.pathname === '/gallery') {
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return fs.createReadStream(path.join(__dirname,'game-gallery.html')).pipe(res);
  }
  if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (modules[url.pathname]) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    return res.end(modules[url.pathname]);
  }
  const file = url.pathname === '/' ? path.join(__dirname, 'game-lab.html') : path.resolve(root, 'public', '.' + url.pathname);
  if (url.pathname !== '/' && (!url.pathname.startsWith('/game/') || !file.startsWith(path.join(root, 'public', 'game') + path.sep))) {
    res.writeHead(404); return res.end();
  }
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8');
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.GAME_LAB_PORT || 3004), '127.0.0.1', () => console.log(`Game diagnostic: http://127.0.0.1:${process.env.GAME_LAB_PORT || 3004}`));
