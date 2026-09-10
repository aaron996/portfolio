// Promote the selected CC0 audition assets. Run preparation/download scripts first.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const work = path.join(root, 'output/audio-audition');
const dir = path.join(root, 'public/game/audio');
const audition = JSON.parse(fs.readFileSync(path.join(root, 'docs/game-audio-audition-manifest.json')));
const bins = path.join(work, 'tools/imageio_ffmpeg/binaries');
const ffmpeg = process.env.FFMPEG_PATH || path.join(bins, fs.readdirSync(bins).find(x => /^ffmpeg.*\.exe$/.test(x)));
function ff(args) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-nostdin', '-y', ...args], { encoding: 'utf8', windowsHide: true });
  if (r.error || r.status) throw new Error(r.error?.message || r.stderr);
  return r.stderr;
}
const assets = [];
function record(relative, source, edit) {
  const file = path.join(dir, relative);
  const report = ff(['-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
  const d = report.match(/Duration: (\d+):(\d+):([\d.]+)/);
  assets.push({ ...source, file: relative, bytes: fs.statSync(file).size,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    durationSeconds: Number(d[1])*3600+Number(d[2])*60+Number(d[3]),
    peakDb: Number(report.match(/max_volume: ([-\d.]+) dB/)[1]), edit });
}
for (const folder of ['music', 'ambience', 'sfx']) fs.mkdirSync(path.join(dir, folder), {recursive:true});
const body = path.join(work, 'release-body.wav'), head = path.join(work, 'release-head.wav');
ff(['-ss','2','-i',path.join(work,'loop-town-normalized.wav'),'-t','79',body]);
ff(['-i',path.join(work,'loop-town-normalized.wav'),'-t','2',head]);
ff(['-i',body,'-i',head,'-filter_complex','acrossfade=d=1:c1=tri:c2=tri','-c:a','libvorbis','-q:a','4',path.join(dir,'music/map-1-cat-lai.ogg')]);
record('music/map-1-cat-lai.ogg', audition.loops.find(x=>x.id==='loop-town'), 'First 81 seconds of normalized original OGG; rotate at 2s with 1s circular crossfade; 80s output. Target -20 LUFS / -3 dBTP before edit. Subjective seam listening unverified.');
fs.copyFileSync(path.join(work,'preview/harbour.ogg'),path.join(dir,'ambience/map-1-port.ogg'));
record('ambience/map-1-port.ogg', audition.loops.find(x=>x.id==='harbour'), 'CC0 public HQ MP3 preview derivative, not lossless original. First 81s normalized to target -24 LUFS; 1s circular crossfade -> 80s.');
const old = path.join(dir,'factory-ambiance.ogg'), warehouse = path.join(dir,'ambience/map-2-warehouse.ogg');
if(fs.existsSync(old)) { fs.copyFileSync(old,warehouse); fs.unlinkSync(old); }
record('ambience/map-2-warehouse.ogg', {id:'factory',author:'yd',page:'https://opengameart.org/content/factory-ambiance',license:'CC0-1.0',originalFile:'factory-ambiance.ogg',originalFormat:'OGG Vorbis'}, 'Existing repository asset, relocated without changing bytes.');
const targets = {jump:['player-jump'],attack:['player-slash-01','player-slash-02'],hit:['enemy-hit-01','enemy-hit-02'],hurt:['player-hurt'],enemyDefeat:['enemy-defeat'],shoot:['gun-shot'],reflect:['parry'],pickup:['pickup'],checkpoint:['checkpoint'],interact:['mission-interact'],bossWarning:['boss-warning'],bossSlam:['boss-slam'],clear:['chapter-clear']};
for(const [event, names] of Object.entries(targets)) names.forEach((name,i)=>{
  const source = audition.sfx[event][i], target = 'sfx/'+name+'.ogg';
  fs.copyFileSync(path.join(work,'preview',source.file),path.join(dir,target));
  record(target,source,'Peak normalized near -3 dBFS; 44.1kHz OGG Vorbis q4; no trimming.');
});
const totalBytes = assets.reduce((sum,x)=>sum+x.bytes,0);
if(totalBytes>8_000_000) throw new Error('Audio budget exceeded: '+totalBytes);
fs.writeFileSync(path.join(root,'docs/game-audio-assets.json'),JSON.stringify({selection:'User delegated selection after requesting a cheerful MapleStory-like mood; no MapleStory assets used.',license:'CC0-1.0',totalBytes,assets},null,2)+'\n');
console.log(JSON.stringify({files:assets.length,totalBytes}));
