// Local-only review harness. Debug hooks exist in this generated copy, never in /game.
// Run: node scripts/preview-game-art.cjs, then open http://127.0.0.1:3002
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const compile = source => ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
let source = fs.readFileSync(path.join(root,'components/game/engine.ts'),'utf8').replaceAll('\r\n','\n');
const hook = `
    qa: {
      state: () => ({player:{...player},mobs:mobs.map(o=>({...o})),boss:boss&&{...boss}}),
      ready: () => Promise.all([...imageCache.values()].map(im=>im.decode())),
      assets: () => [...imageCache].map(([path,im])=>({path,loaded:im.complete&&im.naturalWidth>0})),
      tick: (seconds) => { phase='play'; for(let n=0;n<Math.round(seconds*120);n++) step(1/120); phase='title';draw(); },
      pose: (data) => { phase='title'; Object.assign(player,data.player||{}); if(data.boss) boss={x:370,y:GY-78,w:70,h:78,hp:12,mhp:16,dir:1,hurt:0,tel:0,cd:2,bob:0,dash:0,...data.boss}; if(data.mobs) mobs=data.mobs; if(data.cam!==undefined) cam=data.cam; draw(); },
      frame: (kind) => { const o=mobs.find(o=>o.kind===kind);return o?mobFrame(o):null; },
    },`;
if(!source.includes('    loadMap,\n')) throw Error('Engine export changed; update harness hook.');
source=source.replace('    loadMap,\n', '    loadMap,\n'+hook+'\n');
const engine=compile(source), content=compile(fs.readFileSync(path.join(root,'content/content.vi.ts'),'utf8'));
const metrics=fs.readFileSync(path.join(root,'components/game/mob-sprite-metrics.json'),'utf8');
const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><title>Game art review</title>
<style>body{background:#161c22;color:#edf2f5;font:15px system-ui;margin:24px}button,select{padding:10px;margin:4px;background:#2b3b48;color:white;border:1px solid #536978;border-radius:6px}canvas{display:block;width:min(100%,1000px);height:auto;margin:16px 0}pre{white-space:pre-wrap}img{max-width:100%}</style>
<h1>Ải Vận Hành · kiểm tra art</h1><select id="map" aria-label="Ải"></select>
<button id="idle">Đứng</button><button id="run">Chạy</button><button id="jump">Nhảy</button><button id="attack">Chém</button><button id="aura">Đồ nghề</button><button id="rider">Rider báo đòn</button><button id="boss">Trùm báo đòn</button><button id="hit">Trùm trúng đòn</button><button id="gate">Cửa ải</button>
<canvas width="800" height="420" aria-label="Game art preview"></canvas><pre id="results">Đang tải ảnh…</pre>
<script>const engine=(()=>{const exports={};const require=()=>({default:${metrics}});${engine};return exports})();const data=(()=>{const exports={};${content};return exports.content.game})();
const game=engine.createGame(document.querySelector('canvas'),data.maps,{bossAppear:data.bossAppear,deathLine:data.deathLine,pickupTool:data.pickupTool,pickupHeal:data.pickupHeal});
const map=document.querySelector('#map');data.maps.forEach((m,i)=>map.add(new Option(m.name,i)));
map.onchange=()=>{game.loadMap(+map.value);game.qa.pose({player:{ground:true}})};
const pose=p=>game.qa.pose({player:{atk:0,hurtT:0,tool:0,landT:0,ground:true,vx:0,...p}});
document.querySelector('#idle').onclick=()=>pose({});document.querySelector('#run').onclick=()=>pose({vx:120,runFrame:4});
document.querySelector('#jump').onclick=()=>pose({ground:false,vy:-100,y:200});
document.querySelector('#attack').onclick=()=>pose({atk:.08,attackActive:.12,attackBuffed:false,y:304});
document.querySelector('#aura').onclick=()=>pose({tool:12,y:304});
document.querySelector('#boss').onclick=()=>game.qa.pose({boss:{tel:.5},player:{x:270,y:304,ground:true}});
document.querySelector('#hit').onclick=()=>game.qa.pose({boss:{hurt:.15},player:{x:270,y:304,ground:true}});
document.querySelector('#gate').onclick=()=>game.qa.pose({cam:1400,player:{x:2070,y:304,ground:true}});
document.querySelector('#rider').onclick=()=>{map.value='2';game.loadMap(2);const o=game.qa.state().mobs.find(o=>o.kind==='rider');game.qa.pose({mobs:[{...o,x:350,tel:.4}],player:{x:270,y:304,ground:true}})};
(async()=>{await game.qa.ready();const checks=[];const check=(name,ok)=>{checks.push({name,ok});if(!ok)throw Error(name)};
check('All runtime images decode',game.qa.assets().every(x=>x.loaded));
const mobAssets=game.qa.assets().filter(x=>x.path.startsWith('mob/'));
check('Exactly 64 mob frames are loaded',mobAssets.length===64&&new Set(mobAssets.map(x=>x.path)).size===64);
const frames=(mapIndex,kind,fps)=>{game.loadMap(mapIndex);const o=game.qa.state().mobs.find(x=>x.kind===kind);return [0,1,2,3].map(i=>{game.qa.pose({mobs:[{...o,anim:i/fps,tel:0,dash:0}]});return game.qa.frame(kind)})};
check('Walker cycles through frames 1-4',frames(0,'walker',6).join(',')==='1,2,3,4');
check('Flyer cycles through frames 1-4',frames(0,'flyer',8).join(',')==='1,2,3,4');
game.loadMap(1);const charger=game.qa.state().mobs.find(o=>o.kind==='charger');game.qa.pose({mobs:[{...charger,tel:.2,dash:0}]});check('Charger wind-up uses frame 3',game.qa.frame('charger')===3);game.qa.pose({mobs:[{...charger,tel:0,dash:.2}]});check('Charger dash uses frame 4',game.qa.frame('charger')===4);
game.loadMap(2);const shooter=game.qa.state().mobs.find(o=>o.kind==='shooter');game.qa.pose({mobs:[{...shooter,tel:.2,dash:0}]});check('Shooter aim uses frame 3',game.qa.frame('shooter')===3);game.qa.pose({mobs:[{...shooter,tel:0,dash:.12}]});check('Shooter recoil uses frame 4',game.qa.frame('shooter')===4);
game.loadMap(0);game.qa.tick(.03);const x=game.qa.state().player.x;game.press('right');game.qa.tick(.3);game.release('right');check('Movement advances player',game.qa.state().player.x>x+10);
const y=game.qa.state().player.y;game.resume();game.press('jump');game.release('jump');game.qa.tick(.2);check('Jump rises',game.qa.state().player.y<y-40);game.qa.tick(1);check('Landing returns to floor',game.qa.state().player.ground);
game.loadMap(0);game.qa.pose({player:{x:100,y:304,ground:true},mobs:[{...game.qa.state().mobs[0],x:145,y:314,a:145,b:145,dir:1,hp:2}]});game.resume();game.press('atk');game.release('atk');game.qa.tick(.1);check('No damage during windup',game.qa.state().mobs[0].hp===2);game.qa.tick(.08);check('Damage on active frame',game.qa.state().mobs[0].hp===1);
game.loadMap(2);const rider=game.qa.state().mobs.find(o=>o.kind==='rider');game.qa.pose({player:{x:rider.x-160,y:304,ground:true},mobs:[{...rider,cd:0}]});game.qa.tick(.01);check('Rider telegraphs using frame 3',game.qa.frame('rider')===3);game.qa.tick(.51);check('Rider dashes using frame 4',game.qa.frame('rider')===4);
const cached=game.qa.assets();for(let i=0;i<5;i++){game.loadMap(i);game.qa.pose({boss:{hurt:.15},player:{tool:12,ground:true}});check('Map '+(i+1)+' renders',cached.some(a=>a.path==='bg/m'+(i+1)+'-far.png'&&a.loaded));}
document.querySelector('#results').textContent=JSON.stringify({images:cached.length,passed:checks.length,checks},null,2);game.loadMap(0);pose({tool:12});})().catch(e=>{document.querySelector('#results').textContent='FAIL: '+e.stack});
</script></html>`;
fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});
fs.writeFileSync(path.join(root,'output/playwright/game-art-review.html'),html);
http.createServer((req,res)=>{
  if(req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
  const filename=path.resolve(root,'public','.'+decodeURIComponent(req.url.split('?')[0]));
  if(!filename.startsWith(path.join(root,'public')+path.sep)){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(filename)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type','image/png');fs.createReadStream(filename).pipe(res);
}).listen(3002,'127.0.0.1',()=>console.log('Art review: http://127.0.0.1:3002'));
