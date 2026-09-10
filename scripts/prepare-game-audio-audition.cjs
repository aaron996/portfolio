// Prepare licensed, local audition files; NEVER writes to public/.
// Download the sources in docs/game-audio-audition-sources.json first.
// FFMPEG_PATH can point to an existing installation; otherwise uses the local tool.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const work = path.join(root, 'output', 'audio-audition');
const sourcesFile = path.join(root, 'docs', 'game-audio-audition-sources.json');
const provenance = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));
const sourceById = Object.fromEntries(provenance.sources.map(x => [x.id, x]));
const binaries = path.join(work, 'tools', 'imageio_ffmpeg', 'binaries');
const ffmpeg = process.env.FFMPEG_PATH || path.join(binaries, fs.readdirSync(binaries).find(x => /^ffmpeg.*\.exe$/.test(x)));
const preview = path.join(work, 'preview');
fs.mkdirSync(preview, { recursive: true });
function ff(args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-nostdin', '-y', ...args], {encoding:'utf8', windowsHide:true, maxBuffer:4*1024*1024});
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr);
  return result.stderr;
}
function probe(file) {
  const report = ff(['-i',file,'-af','volumedetect','-f','null','-']);
  const duration = report.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const peak = report.match(/max_volume: ([-\d.]+) dB/);
  if (!duration || !peak) throw new Error('Unable to measure '+file);
  return {durationSeconds:Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3]),peakDb:Number(peak[1])};
}
function sha(file) {return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}
function findFile(dir,name){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isFile()&&item.name===name)return file;if(item.isDirectory()){const found=findFile(file,name);if(found)return found}}}
const round2 = process.argv.includes('--round2');
const only = process.argv.find(x=>x.startsWith('--only='))?.slice('--only='.length);
const manifest = round2 ? JSON.parse(fs.readFileSync(path.join(preview,'manifest.json'),'utf8')) : { status:'AUDITION ONLY — subjective evaluation pending', baseline:'3a895f10108426b9c9b2bb98f9a43d9a18c44525', license:'CC0-1.0', loops:[], sfx:{} };
const loopIds = round2 ? provenance.sources.filter(x=>x.round===2).map(x=>x.id) : ['searching','bleak','harbour','diesel'];
if(only&&!loopIds.includes(only))throw new Error('Unknown audition id: '+only);
for(const id of loopIds.filter(x=>!only||x===only)) {
  const src=sourceById[id];
  const input=path.join(work,'sources',src.file);
  const original=probe(input);
  const whole=src.previewMode==='whole-track';
  const seconds=whole ? original.durationSeconds : Math.min(81, Math.floor(original.durationSeconds));
  if(!whole&&seconds<61) throw new Error('Candidate needs a different loop edit: '+id);
  const normalized=path.join(work,id+'-normalized.wav');
  const lufs=src.kind==='music'?-20:-24;
  ff(['-i',input,'-t',String(seconds),'-af',`loudnorm=I=${lufs}:TP=-3:LRA=9`,'-ar','44100',normalized]);
  const file=id+'.ogg', output=path.join(preview,file);
  if(whole) {
    ff(['-i',normalized,'-c:a','libvorbis','-q:a','4',output]);
  } else {
  // Wrap through seconds 0..2, crossfading the first second. Resume at second 2.
  // Separate inputs avoid a split/trim buffering issue in bundled FFmpeg 7.
  const body=path.join(work,id+'-body.wav'), head=path.join(work,id+'-head.wav');
  ff(['-ss','2','-i',normalized,'-t',String(seconds-2),body]);
  ff(['-i',normalized,'-t','2',head]);
  ff(['-i',body,'-i',head,'-filter_complex','acrossfade=d=1:c1=tri:c2=tri','-c:a','libvorbis','-q:a','4',output]);
  }
  manifest.loops=manifest.loops.filter(x=>x.id!==id);
  manifest.loops.push({id,title:src.title,round:src.round||1,kind:src.kind,file,author:src.author,page:src.page,license:'CC0-1.0',originalFile:src.originalFile||src.file,originalFormat:src.originalFormat,downloadedFormat:path.extname(src.file).slice(1),downloadedDurationSeconds:original.durationSeconds,...probe(output),sourceSha256:sha(input),sha256:sha(output),bytes:fs.statSync(output).size,edit:whole?`Whole track for style audition; target ${lufs} LUFS / -3 dBTP; no cut/crossfade; final 60-90s loop edit and listening approval pending`:`First ${seconds}s; target ${lufs} LUFS / -3 dBTP; 1s circular crossfade; subjective approval pending`});
  if(src.durationSeconds===null)src.durationSeconds=original.durationSeconds;
  console.log('Prepared loop: '+id);
}
const selections = {
  jump:[['rpg','cloth1.ogg']],
  attack:[['rpg','knifeSlice.ogg'],['rpg','knifeSlice2.ogg']],
  hit:[['impact','impactPunch_medium_000.ogg'],['impact','impactPunch_medium_001.ogg']],
  hurt:[['impact','impactSoft_heavy_000.ogg']],
  enemyDefeat:[['impact','impactSoft_heavy_002.ogg']],
  shoot:[['scifi','laserSmall_000.ogg']],
  reflect:[['scifi','forceField_000.ogg']],
  pickup:[['rpg','handleCoins.ogg']],
  checkpoint:[['interface','confirmation_001.ogg']],
  interact:[['interface','click_003.ogg']],
  bossWarning:[['interface','question_003.ogg']],
  bossSlam:[['impact','impactMetal_heavy_000.ogg']],
  clear:[['interface','confirmation_004.ogg']],
};
for(const [event,files] of Object.entries(round2 ? {} : selections)) {
  manifest.sfx[event]=files.map(([pack,originalFile],i)=>{
    const src=sourceById[pack], input=findFile(path.join(work,'sources',pack),originalFile);
    if(!input)throw new Error('Missing '+originalFile);
    const original=probe(input),file=`${event}-${i+1}.ogg`, output=path.join(preview,file);
    ff(['-i',input,'-af',`volume=${-3-original.peakDb}dB`,'-ar','44100','-c:a','libvorbis','-q:a','4',output]);
    return {file,originalFile,originalFormat:'OGG Vorbis',originalDurationSeconds:original.durationSeconds,pack,author:src.author,page:src.page,license:'CC0-1.0',...probe(output),sourceSha256:sha(input),sha256:sha(output),bytes:fs.statSync(output).size,edit:'Peak near -3 dBFS, no trimming; audition candidate, not approved'};
  });
}
for(const src of provenance.sources.filter(x=>x.kind==='sfx-pack')) {
  src.originalFormat='ZIP containing OGG Vorbis samples and License.txt';
  src.durationSeconds='Per-file values in docs/game-audio-audition-manifest.json';
}
fs.writeFileSync(sourcesFile,JSON.stringify(provenance,null,2)+'\n');
const data=JSON.stringify(manifest,null,2)+'\n';
fs.writeFileSync(path.join(preview,'manifest.json'),data);
fs.writeFileSync(path.join(root,'docs','game-audio-audition-manifest.json'),data);
console.log(`Prepared ${manifest.loops.length} loops and ${Object.values(manifest.sfx).flat().length} SFX; production assets untouched.`);
