const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {evaluate, fixture, advance, root} = require('./game-test-runtime.cjs');
const {SOUND_CUES, MAP_AUDIO, sampleIndex, AUDIO_MIX} = evaluate('components/game/audioManifest.ts');
const settle = () => new Promise(resolve => setImmediate(resolve));
function harness({defer=false, fail='', suspended=false}={}) {
  const contexts=[], sources=[], requests=[], waits=[], warnings=[];
  function param(value=1) { return {value,events:[],setValueAtTime(v,t){this.value=v;this.events.push([v,t]);},linearRampToValueAtTime(v,t){this.events.push([v,t]);},exponentialRampToValueAtTime(v,t){this.events.push([v,t]);},cancelScheduledValues(){}}; }
  function node() { return {disconnected:false,connect(target){this.target=target;},disconnect(){this.disconnected=true;}}; }
  class AudioContext {
    state=suspended?'suspended':'running'; currentTime=1; destination=node(); closed=0;
    constructor(){contexts.push(this);}
    createGain(){return {...node(),gain:param()};}
    createDynamicsCompressor(){return {...node(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()};}
    createBufferSource(){const s={...node(),loop:false,started:false,stopped:false,start(){this.started=true;},stop(at){this.stopAt=at;if(at==null){this.stopped=true;this.onended?.();}}};sources.push(s);return s;}
    createOscillator(){const s=this.createBufferSource();s.oscillator=true;s.frequency=param();return s;}
    async decodeAudioData(bytes){return {path:bytes.path};}
    async resume(){this.state='running';}
    async close(){this.closed++;this.state='closed';}
  }
  const fetch = (url,options) => {
    requests.push({url,signal:options.signal});
    const result=()=>url.includes(fail)&&fail?{ok:false,status:404}:{ok:true,arrayBuffer:async()=>({path:url})};
    return defer?new Promise(resolve=>waits.push({url,resolve:()=>resolve(result())})):Promise.resolve(result());
  };
  const {GameAudio}=evaluate('components/game/gameAudio.ts',{AudioContext,fetch,AbortController,setTimeout,clearTimeout,console:{warn:(...x)=>warnings.push(x)}});
  const audio=new GameAudio(()=>1);
  return {audio,contexts,sources,requests,waits,warnings,flush(){for(const w of waits.splice(0))w.resolve();}};
}
test('audio assets match hashes, manifest, CC0 metadata and 8 MB budget',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/game-audio-assets.json')));
  const paths=[...Object.values(MAP_AUDIO).flatMap(x=>[x.music?.path,x.ambience?.path].filter(Boolean)),...Object.values(SOUND_CUES).flatMap(x=>x.samples)];
  assert.equal(paths.length,18);
  let bytes=0;
  for(const url of paths){
    const data=fs.readFileSync(path.join(root,'public',url));
    const entry=manifest.assets.find(x=>url.endsWith('/'+x.file));
    assert.equal(entry.license,'CC0-1.0');assert.ok(entry.page&&entry.author);
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);
    bytes+=data.length;
  }
  assert.equal(bytes,manifest.totalBytes);assert.ok(bytes<=8_000_000);
  assert.ok(manifest.assets.find(x=>x.id==='loop-town').durationSeconds<=90);
});
test('no AudioContext or fetch before gesture; normal cues use samples and cache',async()=>{
  const h=harness(), a=h.audio;
  a.setMap(0);a.setMusicActive(true);a.play('jump');
  assert.equal(h.contexts.length,0);assert.equal(h.requests.length,0);
  a.activate();await settle();
  assert.equal(a.loops.size,2);assert.equal(h.requests.length,17);
  a.play('jump');a.play('attack');a.play('hit');a.play('reflect');
  assert.equal(a.voices.size,4);assert.equal(h.sources.filter(x=>x.oscillator).length,0);
  a.play('jump');assert.equal(a.voices.size,4,'per-cue cooldown');
  for(let i=0;i<4;i++){a.setMap(0);a.activate();}
  await settle();assert.equal(a.loops.size,2);assert.equal(h.requests.length,17);
  const ctx=h.contexts[0];a.destroy();assert.equal(ctx.closed,1);
  assert.ok(h.sources.every(x=>x.disconnected));a.activate();assert.equal(h.contexts.length,1);
});
test('mute and pause silence the master and cancel cues without duplicating loops',async()=>{
  const h=harness(),a=h.audio;a.setMusicActive(true);a.activate();await settle();
  for(const method of ['setMuted','setPaused']){
    a.play('hurt');assert.equal(a.voices.size,1);
    a[method](true);assert.equal(a.master.gain.value,0);assert.equal(a.voices.size,0);
    a.play('hit');assert.equal(a.voices.size,0);
    a[method](false);await settle();assert.equal(a.loops.size,2);
    assert.equal(a.master.gain.events.at(-1)[0],1);
  }
  assert.equal(h.sources.filter(x=>x.loop).length,2);a.destroy();
});
test('partial bank load survives pause/resume, then starts both layers once',async()=>{
  const h=harness({defer:true}),a=h.audio;a.setMusicActive(true);a.activate();
  h.waits.find(x=>x.url.includes('/music/')).resolve();await settle();
  assert.equal(a.loops.size,0);a.setPaused(true);a.setPaused(false);
  h.flush();await settle();assert.equal(a.loops.size,2);
  a.destroy();
});
test('late map loads cannot start stale sources and warehouse has only original ambience',async()=>{
  const h=harness({defer:true}),a=h.audio;a.setMusicActive(true);a.activate();
  a.setMap(1);h.flush();await settle();
  assert.equal(a.loops.size,1);
  assert.match([...a.loops][0].source.buffer.path,/map-2-warehouse/);
  a.setMap(0);await settle();assert.equal(a.loops.size,2);
  a.setMap(2);await settle();assert.equal(a.loops.size,0);assert.ok(a.retiring.size<=2);
  a.destroy();assert.ok(h.sources.every(x=>x.disconnected));
});
test('pending cue is discarded after restart, pause, inactivity delay or destroy',async()=>{
  for(const action of ['restart','pause','delay','destroy']){
    const h=harness({defer:true}),a=h.audio;a.activate();a.play('attack');
    if(action==='restart')a.setMap(0);
    if(action==='pause')a.setPaused(true);
    if(action==='delay')h.contexts[0].currentTime+=1;
    if(action==='destroy'){a.destroy();assert.ok(h.requests.every(x=>x.signal.aborted));}
    h.flush();await settle();assert.equal(h.sources.length,0);a.destroy();
  }
});
test('failed samples alone use fallback; failed loops remain silent',async()=>{
  const h=harness({fail:'.ogg'}),a=h.audio;a.setMusicActive(true);a.activate();await settle();
  assert.equal(a.loops.size,0);assert.equal(h.sources.length,0);
  a.play('jump');assert.equal(h.sources.filter(x=>x.oscillator).length,1);
  assert.ok(h.warnings.length>0);a.destroy();
});
test('clamped variation, SFX cap, priority admission and short ducking',async()=>{
  assert.equal(sampleIndex(2,1),1);assert.equal(sampleIndex(2,-1),0);assert.equal(sampleIndex(2,NaN),0);
  const h=harness(),a=h.audio;a.activate();await settle();
  a.play('attack');const first=[...a.voices][0].source.buffer.path;
  h.contexts[0].currentTime+=1;a.play('attack');
  assert.notEqual([...a.voices][1].source.buffer.path,first);
  a.setMap(0);
  for(const event of ['jump','attack','hit','shoot','pickup','interact']) for(let i=0;i<3;i++){
    h.contexts[0].currentTime+=1;a.play(event);
  }
  assert.equal(a.voices.size,AUDIO_MIX.maxVoices);
  a.play('bossSlam');assert.equal(a.voices.size,AUDIO_MIX.maxVoices);
  assert.ok([...a.voices].some(v=>v.sound==='bossSlam'));
  assert.deepEqual(a.music.gain.events.slice(-2).map(x=>x[0]),[.65,1]);a.destroy();
});
test('clear cue still plays while music fades out, and resume after suspended activation works',async()=>{
  const h=harness({suspended:true}),a=h.audio;a.setMusicActive(true);a.activate();await settle();
  assert.equal(a.loops.size,2);a.setMusicActive(false);a.play('clear');
  assert.equal(a.loops.size,0);assert.equal(a.retiring.size,2);assert.equal(a.voices.size,1);
  for(const v of a.retiring)assert.equal(v.source.stopAt,h.contexts[0].currentTime+1.2);
  a.destroy();
});
test('swing emits once on active frame even on a miss; multi-kill has one hit and defeat cue',()=>{
  for(const hit of [false,true]){
    const sounds=[];const g=fixture({}, {handlers:{onSound:s=>sounds.push(s)}});
    if(hit){const mob=g.lab.mobs[0];Object.assign(mob,{x:100,y:304,a:90,b:130,hp:1});g.lab.mobs.push({...mob});}
    g.press('atk');g.release('atk');assert.equal(sounds.filter(s=>s==='attack').length,0);
    advance(g,.3);assert.equal(sounds.filter(s=>s==='attack').length,1);
    assert.equal(sounds.filter(s=>s==='hit').length,hit?1:0);
    assert.equal(sounds.filter(s=>s==='enemyDefeat').length,hit?1:0);g.destroy();
  }
});
test('one bullet kill emits hit and defeat once',()=>{
  const sounds=[],g=fixture({}, {handlers:{onSound:s=>sounds.push(s)}});
  const mob=g.lab.mobs[0];Object.assign(mob,{x:140,y:304,a:140,b:150,hp:1});
  g.lab.player.ammo=3;g.press('shoot');g.release('shoot');advance(g,.5);
  assert.equal(sounds.filter(s=>s==='shoot').length,1);
  assert.equal(sounds.filter(s=>s==='hit').length,1);
  assert.equal(sounds.filter(s=>s==='enemyDefeat').length,1);g.destroy();
});
test('boss warning precedes one slam cue for both shockwave fronts',()=>{
  const sounds=[],g=fixture({bossKind:'slam'}, {handlers:{onSound:s=>sounds.push(s)}});
  g.lab.spawnBoss();Object.assign(g.lab.boss,{cd:0,x:520});g.lab.player.inv=100;
  g.lab.stepBoss(g.lab.boss,.01);assert.equal(sounds.filter(s=>s==='bossWarning').length,1);
  assert.equal(sounds.filter(s=>s==='bossSlam').length,0);
  g.lab.stepBoss(g.lab.boss,.81);assert.equal(sounds.filter(s=>s==='bossSlam').length,1);
  assert.equal(g.lab.shockwaves.length,2);g.lab.stepBoss(g.lab.boss,.01);
  assert.equal(sounds.filter(s=>s==='bossSlam').length,1);g.destroy();
});
