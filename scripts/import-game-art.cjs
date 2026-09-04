// Runtime packaging only: preserve alpha; normalize player head size and foot anchor.
// Usage: node scripts/import-game-art.cjs <path-to-existing-output-packages>
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
sharp.cache(false);
const root = path.resolve(__dirname, '..');
const sourceRoot = process.argv[2];
const generated = require('../docs/game-art-generated.json');
const records = [];
const pngOptions = { palette: true, quality: 95, effort: 8 };
function writeOutput(out, buffer) {
  const temporary = out + '.import-tmp';
  fs.writeFileSync(temporary, buffer);
  fs.renameSync(temporary, out);
}

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? files(path.join(dir, e.name)) : e.name.endsWith('.png') ? [path.join(dir, e.name)] : []);
}
async function bounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = 0, bottom = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 20) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  let headLeft = info.width, headRight = 0;
  for (let y = top; y < top + (bottom - top) * 0.27; y++) for (let x = left; x <= right; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 80) {
      headLeft = Math.min(headLeft, x); headRight = Math.max(headRight, x);
    }
  }
  return { left, top, width: right-left+1, height: bottom-top+1, headWidth: headRight-headLeft+1 };
}
async function save(src, relative, mode = 'sprite') {
  const out = path.join(root, 'public/game', relative);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (mode === 'normalized') {
    writeOutput(out, await sharp(src).ensureAlpha().png(pngOptions).toBuffer());
  } else if (mode === 'background') {
    const b = await bounds(src), m = await sharp(src).metadata();
    // Preserve horizontal tiling; remove only unused vertical transparent padding.
    writeOutput(out, await sharp(src).extract({left:0,top:b.top,width:m.width,height:b.height}).png(pngOptions).toBuffer());
  } else {
    const b = await bounds(src);
    let image = sharp(src).extract({ left:b.left, top:b.top, width:b.width, height:b.height });
    if (mode === 'player') {
      const scale = Math.min(145/b.headWidth, 470/b.width, 445/b.height);
      const width = Math.round(b.width*scale), height = Math.round(b.height*scale);
      const resized = await image.resize(width, height).png().toBuffer();
      writeOutput(out, await sharp({create:{width:512,height:512,channels:4,background:'#00000000'}})
        .composite([{input:resized,left:Math.round((512-width)/2),top:470-height}]).png(pngOptions).toBuffer());
    } else {
      writeOutput(out, await image.resize({width:relative.startsWith('bg/')?1024:384,height:512,fit:'inside',withoutEnlargement:true}).png(pngOptions).toBuffer());
    }
  }
  const m = await sharp(out).metadata();
  const record = {file:relative,source:src,width:m.width,height:m.height,alpha:m.hasAlpha};
  const existing = records.findIndex(item => item.file === relative);
  if (existing >= 0) records[existing] = record;
  else records.push(record);
}
(async()=>{
  if (!sourceRoot) throw new Error('Pass the directory containing the asset packages.');
  const packs = [
    ['mob-v2-additions/complete-set/public/game','normalized'],
  ];
  for (const [pack, mode] of packs) {
    const dir = path.join(sourceRoot, pack);
    for (const file of files(dir)) {
      const relative = (mode === 'player' ? 'player/' : '') + path.relative(dir,file).replaceAll('\\','/');
      await save(file,relative,relative.startsWith('bg/')?'background':mode);
    }
  }
  for(const entry of generated) await save(entry.source,entry.destination,entry.key==='ground'?'background':'sprite');
  const mobMetrics = {};
  for (const entry of records.filter(r => r.file.startsWith('mob/'))) {
    const key = entry.file.replace('mob/','').replace(/-[1-4]\.png$/, '');
    const b = await bounds(path.join(root,'public/game',entry.file));
    const group = mobMetrics[key] ??= {width:0,height:0,frames:{}};
    group.width = Math.max(group.width,b.width);
    group.height = Math.max(group.height,b.height);
    group.frames[entry.file.match(/-([1-4])\.png$/)[1]] = {x:b.left+b.width/2,y:b.top+b.height};
  }
  fs.writeFileSync(path.join(root,'components/game/mob-sprite-metrics.json'),JSON.stringify(mobMetrics,null,2)+'\n');
  fs.writeFileSync(path.join(root,'docs/game-art-import.json'),JSON.stringify(records,null,2)+'\n');
  console.log(JSON.stringify({imported:records.length-generated.length,generated:generated.length,total:records.length,bytes:records.reduce((n,r)=>n+fs.statSync(path.join(root,'public/game',r.file)).size,0)}));
})().catch(e=>{console.error(e);process.exitCode=1;});
