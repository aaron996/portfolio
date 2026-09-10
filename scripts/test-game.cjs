const assert = require('node:assert/strict');
const { test } = require('node:test');
const { fixture, advance, content, evaluate, canvasRecorder } = require('./game-test-runtime.cjs');

test('chapter rules differ: matching, toggle routing, timing, ordered tracing, persistent prevention', () => {
  const { MissionRun } = evaluate('components/game/chapterMission.ts');
  const runs = content.game.maps.filter((map) => map.mission).map((map) => new MissionRun(map.mission));
  const use = (run, id) => {
    const node = run.definition.nodes.find((entry) => entry.id === id);
    return run.interact(node.x, node.y);
  };
  const [match, timing, trace, rules] = runs;
  const route = new MissionRun({ mode: 'route', nodes: [{id:'a',x:0,y:0},{id:'b',x:100,y:0},{id:'dispatch',x:200,y:0}], sequence: ['a','b','dispatch'], exposureSeconds: 12 });
  assert.equal(use(match, 'wrong-one'), 'wrong');
  assert.equal(use(match, 'correct'), 'exposed');
  assert.equal(use(route, 'dispatch'), 'wrong');
  use(route, 'b'); use(route, 'a'); use(route, 'a');
  assert.equal(use(route, 'dispatch'), 'wrong');
  use(route, 'a'); assert.equal(use(route, 'dispatch'), 'exposed');
  assert.equal(use(timing, 'balance'), 'wrong');
  timing.tick(4); assert.equal(use(timing, 'balance'), 'exposed');
  timing.tick(10); assert.equal(timing.exposure, 0);
  assert.equal(use(trace, 'warehouse'), 'wrong');
  use(trace, 'order'); use(trace, 'handoff'); assert.equal(use(trace, 'warehouse'), 'exposed');
  use(rules, 'unique'); assert.equal(use(rules, 'bypass'), 'wrong');
  assert.equal(rules.completed.length, 0);
  use(rules, 'unique'); assert.equal(use(rules, 'required'), 'exposed');
  rules.tick(120); assert.ok(rules.exposure > 0);
  assert.equal(match.interact(0, 344), 'absent');
});

test('tutorial events require real movement, grounded jump, hit and held guard', () => {
  const actions = [];
  const g = fixture({}, { handlers: { onTutorialAction: (action) => actions.push(action) } });
  g.press('atk'); g.release('atk'); advance(g, .4);
  assert.ok(!actions.includes('atk'));
  g.press('right'); advance(g, .5); g.release('right');
  assert.ok(actions.includes('right'));
  g.press('jump'); g.release('jump');
  assert.equal(actions.filter((a) => a === 'jump').length, 1);
  g.press('jump'); g.release('jump');
  assert.equal(actions.filter((a) => a === 'jump').length, 1);
  advance(g, 1); g.press('guard'); advance(g, .4); g.release('guard');
  assert.ok(actions.includes('guard'));
});

test('death callback selects boss checkpoint only after the encounter has begun', () => {
  for (const checkpoint of [false, true]) {
    let death;
    const g = fixture({}, { globals: { window: {
      addEventListener() {}, removeEventListener() {}, clearTimeout() {},
      setTimeout(fn) { death = fn; return 1; },
    } } });
    if (checkpoint) g.lab.spawnBoss();
    g.lab.player.hp = 1; g.lab.hurtPlayer(-1); death();
    assert.equal(g.status().hp, 5);
    assert.equal(g.status().bossAlive, checkpoint);
    assert.equal(g.status().mobsLeft, checkpoint ? 0 : 1);
  }
});

test('audio stays silent before activation, when muted and paused, and closes on teardown', () => {
  let created = 0, starts = 0, closed = 0;
  const param = { value: 0, setTargetAtTime() {}, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} };
  class AudioContext {
    state = 'running'; currentTime = 1;
    constructor() { created++; }
    createGain() { return { gain: { ...param }, connect() {}, disconnect() {} }; }
    createOscillator() { return { frequency: { value: 0 }, connect() {}, disconnect() {}, start() { starts++; }, stop() {} }; }
    close() { closed++; return Promise.resolve(); }
  }
  const { GameAudio } = evaluate('components/game/gameAudio.ts', { AudioContext });
  const sound = new GameAudio(); sound.play('jump'); assert.equal(created, 0);
  sound.activate(); sound.setMuted(true); sound.play('jump'); assert.equal(starts, 0);
  sound.setMuted(false); sound.setPaused(true); sound.play('jump'); assert.equal(starts, 0);
  sound.setPaused(false); sound.play('jump'); assert.equal(starts, 2);
  sound.destroy(); assert.equal(closed, 1);
});

test('death timeout is canceled by restart and destroy, with no ghost map reload', () => {
  for (const action of ['restart', 'destroy']) {
    const timers = new Map(); let serial = 0; let loads = 0;
    const g = fixture({}, { handlers: { onMap: () => loads++ }, globals: { window: {
      addEventListener() {}, removeEventListener() {},
      setTimeout(fn) { timers.set(++serial, fn); return serial; },
      clearTimeout(id) { timers.delete(id); },
    } } });
    g.lab.player.hp = 1; g.lab.hurtPlayer(-1);
    assert.equal(timers.size, 1);
    const staleCallback = [...timers.values()][0];
    if (action === 'restart') g.loadMap(0); else g.destroy();
    assert.equal(timers.size, 0);
    if (action === 'destroy') { staleCallback(); assert.equal(loads, 1); }
    else assert.equal(g.status().hp, 5);
  }
});

test('map loads reset held keys, ammo and timed combat state', () => {
  const g = fixture(); g.press('right'); g.lab.player.ammo = 3;
  g.loadMap(0); advance(g, .25);
  assert.equal(g.lab.player.x, 60); assert.equal(g.status().ammo, 0);
  assert.equal(g.lab.player.raiseT, 0); assert.equal(g.lab.player.dropY, null);
});

test('boss checkpoint restarts the boss encounter without restoring cleared mobs', () => {
  const g = fixture({ mobs: [], traps: [], pickups: [] });
  g.lab.spawnBoss();
  assert.equal(g.status().checkpoint, true);
  g.restartFromCheckpoint();
  const state = g.status();
  assert.equal(state.mobsLeft, 0);
  assert.equal(state.bossAlive, true);
  assert.equal(state.checkpoint, true);
  assert.ok(g.lab.player.x > 1500);
});

test('remaining target gives a direction only when at most two mobs remain', () => {
  const g = fixture();
  assert.equal(g.status().remainingTarget?.name, 'sentinel');
  assert.equal(g.status().remainingTarget?.direction, 'right');
  g.lab.player.x = 2150;
  assert.equal(g.status().remainingTarget?.direction, 'left');
});

test('checkpoint preserves entry equipment across repeated deaths and avoids moving traps', () => {
  for (const map of content.game.maps) {
    const g = fixture(map);
    Object.assign(g.lab.player, { ammo: 6, gunName: 'checkpoint gun', tool: 8, toolName: 'checkpoint tool' });
    g.lab.spawnBoss();
    for (let attempt = 0; attempt < 2; attempt++) {
      Object.assign(g.lab.player, { ammo: 0, tool: 0, hp: 0 });
      g.restartFromCheckpoint();
      const state = g.status();
      assert.equal(state.ammo, 6); assert.equal(state.toolLeft, 8);
      assert.equal(state.hp, 5); assert.equal(state.mobsLeft, 0);
      assert.equal(state.bossHpPct, 1);
      const x = g.lab.player.x;
      for (const trap of map.traps) {
        if ((trap.y ?? 344) < 304) continue;
        assert.ok(x + 26 <= trap.x - 36 || x >= trap.x + (trap.w ?? 26) + 36, map.name);
      }
    }
  }
});

test('source tracing rejects wrong order, respects pause and resets its window at checkpoint', () => {
  const map = content.game.maps[3];
  const g = fixture({ ...map, mobs: [], traps: [], pickups: [] });
  g.lab.spawnBoss();
  g.lab.player.inv = 100;
  const interact = (id) => {
    const node = map.mission.nodes.find((entry) => entry.id === id);
    Object.assign(g.lab.player, { x: node.x - 13, y: node.y - 40 });
    g.press('interact'); g.release('interact');
  };
  interact('warehouse'); assert.equal(g.status().mission.completed, 0);
  g.pause(); interact('order'); assert.equal(g.status().mission.completed, 0);
  g.resume();
  for (const id of map.mission.sequence) interact(id);
  assert.equal(g.status().mission.exposure, 10);
  g.pause(); advance(g, 12); assert.equal(g.status().mission.exposure, 10);
  g.resume(); advance(g, 10.1);
  assert.equal(g.status().mission.completed, 0); assert.equal(g.status().mission.exposure, 0);
  for (const id of map.mission.sequence) interact(id);
  g.restartFromCheckpoint(); assert.equal(g.status().mission.exposure, 0);
  assert.equal(g.status().mission.completed, 0);
});

test('locked source boss blocks melee and bullets, then takes damage when traced', () => {
  const map = content.game.maps[3];
  const g = fixture({ ...map, mobs: [], traps: [], pickups: [], plats: [] });
  g.lab.spawnBoss(); g.lab.player.inv = 100;
  Object.assign(g.lab.boss, { x: 800, cd: 100 });
  Object.assign(g.lab.player, { x: 766, face: 1, ammo: 10 });
  g.press('atk'); g.release('atk'); advance(g, .4);
  g.press('shoot'); g.release('shoot'); advance(g, .4);
  assert.equal(g.lab.boss.hp, 16);
  for (const node of map.mission.nodes) {
    Object.assign(g.lab.player, { x: node.x - 13, y: node.y - 40 });
    g.press('interact'); g.release('interact');
  }
  Object.assign(g.lab.player, { x: g.lab.boss.x - 34, y: 304, ground: true, face: 1 });
  g.press('atk'); g.release('atk'); advance(g, .4);
  assert.ok(g.lab.boss.hp < 16);
});

test('pause hotkeys ignore auto-repeat; paused simulation consumes no movement or ammo', () => {
  const g = fixture(); const p = g.lab.player; p.ammo = 4;
  g.press('right'); g.press('shoot');
  const key = { code: 'KeyP', preventDefault() {}, repeat: false };
  g.lab.onKeyDown(key); assert.equal(g.isPaused(), true);
  g.lab.onKeyDown({ ...key, repeat: true }); assert.equal(g.isPaused(), true);
  const x = p.x; advance(g, 2); assert.equal(p.x, x); assert.equal(p.ammo, 4);
  g.lab.onKeyDown(key); advance(g, .2); assert.equal(p.x, x);
});

test('armed locomotion selects real held-gun poses, then returns to paper when empty', () => {
  const g = fixture(); const p = g.lab.player; p.ammo = 1;
  assert.match(g.lab.playerFrame().src, /armed-idle/);
  p.vx = 300;
  for (let i = 0; i < 4; i++) { p.runPhase = i / 4; assert.match(g.lab.playerFrame().src, new RegExp(`armed-run-${i+1}`)); }
  p.ground = false; p.vy = -200; assert.match(g.lab.playerFrame().src, /armed-jump-rise/);
  p.vy = 200; assert.match(g.lab.playerFrame().src, /armed-jump-fall/);
  p.ammo = 0; assert.doesNotMatch(g.lab.playerFrame().src, /armed/);
});

for (const map of content.game.maps) test(`${map.boss}: melee can defeat the boss with zero ammo and clears exactly once`, () => {
  let cleared = 0; let finished = 0;
  const g = fixture({ ...map, mobs: [], traps: [], pickups: [], plats: [] }, {
    handlers: { onCleared: () => cleared++, onFinished: () => finished++ },
  });
  g.lab.spawnBoss(); g.lab.player.inv = 100;
  if (map.mission) {
    if (map.mission.mode === 'timing') advance(g, 4.1);
    for (const id of map.mission.sequence) {
      const node = map.mission.nodes.find((entry) => entry.id === id);
      Object.assign(g.lab.player, { x: node.x - 13, y: node.y - 40 });
      g.press('interact'); g.release('interact');
    }
  }
  for (let i = 0; i < 40 && !cleared; i++) {
    Object.assign(g.lab.boss, { x: 800, y: 262, cd: 100, dash: 0, tel: 0, recover: 100, impulseT: 0 });
    Object.assign(g.lab.player, { x: 766, y: 304, vx: 0, vy: 0, face: 1, ground: true });
    g.press('atk'); g.release('atk'); advance(g, .5);
  }
  assert.equal(g.status().ammo, 0); assert.equal(cleared, 1); assert.equal(finished, 1);
  assert.equal(g.lab.boss, null); advance(g, .5); assert.equal(cleared, 1);
});

test('boss volley emits three typed projectiles and can be reflected from the real firing position', () => {
  const g = fixture({ bossKind: 'volley' }); const p = g.lab.player;
  Object.assign(p, { x: 400, face: 1 }); g.lab.spawnBoss();
  Object.assign(g.lab.boss, { x: 520, dir: -1, tel: .001, cd: 100, attackId: 41 });
  g.lab.step(1/120); assert.equal(g.lab.shots.length, 3);
  assert.equal(new Set(g.lab.shots.map((shot) => shot.attackId)).size, 3,
    'each projectile must own collision resolution independently');
  let reflected = false; const hp = g.lab.boss.hp;
  for (let i=0;i<180;i++) {
    const approaching = g.lab.shots.some(s=>!s.reflected && s.vx < 0 && s.x < p.x+55 && s.x > p.x);
    if (approaching && !p.guarding) g.press('guard');
    g.lab.step(1/120);
    if (g.lab.shots.some(s=>s.reflected)) reflected = true;
  }
  assert.ok(reflected); assert.ok(g.lab.boss.hp < hp);
});

test('slam emits floor shockwaves, cannot be guarded, and is avoided above the floor', () => {
  for (const airborne of [false, true]) {
    const g = fixture({ bossKind: 'slam' }); const p = g.lab.player;
    Object.assign(p, { x: 480, y: airborne ? 250 : 304, vy: airborne ? -100 : 0, ground: !airborne, face: 1 });
    g.lab.spawnBoss();
    Object.assign(g.lab.boss, { x: 520, dir: -1, tel: .001, cd: 100, attackId: 51 });
    if (!airborne) g.press('guard');
    g.lab.step(1/120);
    assert.equal(g.lab.shots.length, 0);
    assert.equal(g.lab.shockwaves.length, 2);
    assert.equal(new Set(g.lab.shockwaves.map((wave) => wave.attackId)).size, 1,
      'the two fronts of one slam must share one collision result');
    advance(g, .1);
    assert.equal(p.hp, airborne ? 5 : 4);
    if (!airborne) assert.equal(p.vy, 0, 'ground wave must not reuse the large upward hurt launch');
  }
});

test('the two fronts of one slam cannot deal damage twice after immunity ends', () => {
  const g = fixture({ bossKind: 'slam' }); const p = g.lab.player;
  Object.assign(p, { x: 480, y: 304, ground: true }); g.lab.spawnBoss();
  Object.assign(g.lab.boss, { x: 520, dir: -1, tel: .001, cd: 100, attackId: 61 });
  g.lab.step(1/120); advance(g, .1);
  assert.equal(p.hp, 4, 'the first wave front lands');
  p.inv = 0; p.x = 630;
  advance(g, .05);
  assert.equal(p.hp, 4, 'the second front shares the slam collision result');
  assert.equal(g.lab.shockwaves.length, 0, 'both fronts reached their terminal collision');
});

test('attack ids resolve exactly once while different attacks remain independent', () => {
  const g = fixture(); const p = g.lab.player;
  assert.equal(g.lab.hurtPlayer(1, false, { attackId: 71 }), 'damaged');
  p.inv = 0;
  assert.equal(g.lab.hurtPlayer(1, false, { attackId: 71 }), 'ignored');
  assert.equal(p.hp, 4);
  assert.equal(g.lab.hurtPlayer(1, false, { attackId: 72 }), 'damaged');
  assert.equal(p.hp, 3);
});

test('separate projectiles preserve their own id through parry and resolve after immunity ends', () => {
  const parry = fixture(); const p = parry.lab.player;
  Object.assign(p, { x: 400, face: 1 });
  parry.lab.fire(p.x + 27, p.y + 20, -4.4, 0);
  parry.lab.fire(p.x + 120, p.y + 20, -4.4, 0);
  const [first, second] = parry.lab.shots;
  const firstId = first.attackId; const secondId = second.attackId;
  assert.notEqual(first.attackId, second.attackId);
  parry.press('guard'); advance(parry, .02);
  assert.equal(first.reflected, true); assert.equal(first.attackId, firstId);
  parry.release('guard');
  second.x = p.x + 27;
  parry.press('guard'); advance(parry, .02);
  assert.equal(second.reflected, true, 'a later projectile must not inherit the first parry result');
  assert.equal(second.attackId, secondId, 'parry must retain projectile ownership id');

  const damage = fixture(); const target = damage.lab.player;
  Object.assign(target, { x: 400, face: -1 });
  damage.lab.fire(target.x + 27, target.y + 20, -4, 0);
  damage.lab.fire(target.x + 120, target.y + 20, -4, 0);
  const [, later] = damage.lab.shots;
  advance(damage, .02); assert.equal(target.hp, 4);
  target.inv = 0;
  later.x = target.x + 27;
  advance(damage, .02);
  assert.equal(target.hp, 3, 'a different projectile resolves normally once existing immunity expires');
});

test('rules devices render neutral before interaction and only show completion after success', () => {
  const recording = canvasRecorder();
  const g = fixture({}, { maps: content.game.maps, canvas: recording.canvas });
  g.loadMap(4); g.resume(); g.lab.spawnBoss();
  const nodes = content.game.maps[4].mission.nodes;
  const p = g.lab.player;
  const paint = () => {
    recording.commands.length = 0; g.lab.draw();
    return (node) => {
      const reverse = [...recording.commands].reverse();
      return {
        border: reverse.find((command) => command.op === 'strokeRect' && command.args[0] === node.x - 20 && command.args[1] === node.y - 48),
        light: reverse.find((command) => command.op === 'arc' && command.args[0] === node.x + 12 && command.args[1] === node.y - 10 && command.args[2] === 3),
        symbol: reverse.find((command) => command.op === 'fillText' && command.args[1] === node.x && command.args[2] === node.y - 28),
        label: reverse.find((command) => command.op === 'fillText' && typeof command.args[0] === 'string' && command.args[0].endsWith(node.name)),
      };
    };
  };
  const assertPaint = (node, color, symbol) => {
    const commands = paint()(node);
    assert.equal(commands.border?.strokeStyle, color, `${node.id} border`);
    assert.equal(commands.light?.fillStyle, color, `${node.id} light`);
    assert.equal(commands.symbol?.fillStyle, color, `${node.id} symbol`);
    assert.equal(commands.symbol?.args[0], symbol, `${node.id} symbol text`);
    assert.equal(commands.label?.fillStyle, color, `${node.id} label`);
  };
  const at = (node) => Object.assign(p, { x: node.x - p.w / 2, y: node.y - p.h, ground: true });
  const interact = (node) => { at(node); g.press('interact'); g.release('interact'); };

  at({ x: 1200, y: 344 });
  for (const node of nodes) assertPaint(node, '#f2f1ec', '•');
  for (const node of nodes) { at(node); assertPaint(node, '#9FD8FF', 'E'); }

  interact(nodes[0]); assertPaint(nodes[0], '#d4f236', '✓');
  interact(nodes[2]);
  at({ x: 1200, y: 344 });
  for (const node of nodes) assertPaint(node, '#f2f1ec', '•');

  interact(nodes[0]); interact(nodes[1]);
  assert.ok(g.status().mission.exposure > 0, 'both valid rules keep the boss unlocked');
});

test('boss dash locks direction at tell, resolves once, repels on parry and stays harmless in recovery', () => {
  const direction = fixture({ bossKind: 'dash' });
  direction.lab.spawnBoss();
  Object.assign(direction.lab.player, { x: 400, y: 304, ground: true });
  Object.assign(direction.lab.boss, { x: 520, cd: 0 });
  direction.lab.step(1/120);
  assert.equal(direction.lab.boss.dir, -1);
  direction.lab.player.x = 700;
  advance(direction, .66);
  assert.equal(direction.lab.boss.dir, -1, 'direction must stay snapshotted through tell');

  const parry = fixture({ bossKind: 'dash' }); const p = parry.lab.player;
  parry.lab.spawnBoss();
  Object.assign(p, { x: 400, y: 304, ground: true, face: 1 });
  Object.assign(parry.lab.boss, { x: 424, dir: -1, dash: .5, attackId: 81, cd: 100 });
  parry.press('guard'); advance(parry, .03);
  assert.equal(p.hp, 5); assert.equal(parry.lab.boss.dash, 0);
  assert.ok(parry.lab.boss.recover > 1); assert.ok(parry.lab.boss.impulseX > 0);
  const hp = p.hp;
  Object.assign(parry.lab.boss, { x: p.x + 4 });
  advance(parry, .2);
  assert.equal(p.hp, hp, 'recovery body overlap must be harmless');
});

test('boss-specific patterns use parcel, trace packet and hybrid slam contracts', () => {
  const game = fixture({}, { maps: content.game.maps });

  game.loadMap(1); game.resume(); game.lab.spawnBoss();
  Object.assign(game.lab.boss, { x: 520, dir: -1, tel: .001, cd: 100, attackId: 91 });
  game.lab.step(1/120);
  assert.equal(game.lab.shots.length, 2);
  assert.ok(game.lab.shots.every((shot) => shot.kind === 'parcel'));
  assert.equal(new Set(game.lab.shots.map((shot) => shot.attackId)).size, 2);

  game.loadMap(3); game.resume(); game.lab.spawnBoss();
  Object.assign(game.lab.player, { x: 400, y: 304, ground: true });
  Object.assign(game.lab.boss, { x: 520, dir: -1, tel: .001, cd: 100, attackId: 92, targetX: 413, targetY: 324 });
  game.lab.step(1/120);
  assert.equal(game.lab.shots.length, 1);
  assert.equal(game.lab.shots[0].kind, 'packet');
  assert.ok(Math.abs(game.lab.shots[0].x - (game.lab.boss.x + game.lab.boss.w / 2 - 24)) < 10,
    'trace packet must originate at the boss emitter, not the interaction node');

  game.loadMap(4); game.resume(); game.lab.spawnBoss();
  Object.assign(game.lab.boss, { cd: 0, pattern: 1 });
  game.lab.step(1/120);
  assert.equal(game.lab.boss.attackKind, 'slam');
  assert.ok(game.lab.boss.tel > .79);
});

test('walker, flyer and shooter each have a harmless tell and a separate recovery', () => {
  const walkerGame = fixture({ mobs: [{ kind: 'walker', name: 'walker', x: 105, range: 70 }] });
  const walker = walkerGame.lab.mobs[0]; const p = walkerGame.lab.player;
  Object.assign(p, { x: 100, y: 304, ground: true }); walker.cd = 0;
  walkerGame.lab.step(1/120);
  assert.ok(walker.tel > 0); assert.equal(p.hp, 5);
  advance(walkerGame, .3);
  assert.equal(p.hp, 4); assert.ok(walker.recover > 0);
  const hp = p.hp; Object.assign(walker, { x: p.x + 4 }); advance(walkerGame, .2);
  assert.equal(p.hp, hp);

  const flyerGame = fixture({ mobs: [{ kind: 'flyer', name: 'flyer', x: 220, y: 300, range: 220 }] });
  const flyer = flyerGame.lab.mobs[0]; Object.assign(flyerGame.lab.player, { x: 120, y: 260 }); flyer.cd = 0;
  const targetY = flyerGame.lab.player.y;
  flyerGame.lab.step(1/120);
  assert.ok(flyer.tel > .4); const attackVy = flyer.attackVy;
  flyerGame.lab.player.y = targetY - 100;
  advance(flyerGame, .45);
  assert.equal(flyer.attackVy, attackVy, 'dive vertical course must stay snapshotted');

  const shooterGame = fixture({ mobs: [{ kind: 'shooter', name: 'shooter', x: 220 }] });
  const shooter = shooterGame.lab.mobs[0]; shooter.cd = 0;
  shooterGame.lab.step(1/120);
  assert.ok(shooter.tel > .4); assert.equal(shooterGame.lab.shots.length, 0);
  advance(shooterGame, .43);
  assert.equal(shooterGame.lab.shots.length, 1); assert.ok(shooter.recover > 0);
});

test('gun raises before spending ammo, fires on pose, keeps aim for repeat shots', () => {
  const g = fixture(); const p = g.lab.player; p.ammo = 3;
  g.press('shoot'); g.release('shoot');
  assert.equal(p.ammo, 3); assert.equal(g.lab.bullets.length, 0);
  advance(g, .1);
  assert.ok(p.raiseT > 0); assert.match(g.lab.playerFrame().src, /raise-gun|shoot-1/);
  advance(g, .1);
  assert.equal(p.ammo, 2); assert.equal(g.lab.bullets.length, 1);
  assert.ok(p.shootT > 0); assert.equal(p.raiseT, 0);
  advance(g, .27); g.press('shoot');
  assert.equal(p.ammo, 1); assert.equal(p.raiseT, 0);
});
for (const action of ['guard', 'atk', 'pause', 'hurt']) test(`raising cancels on ${action} without spending ammo`, () => {
  const g = fixture(); g.lab.player.ammo = 3;
  g.press('shoot'); g.release('shoot');
  if (action === 'pause') g.pause();
  else if (action === 'hurt') g.lab.hurtPlayer(-1);
  else g.press(action);
  advance(g, .25);
  assert.equal(g.lab.player.ammo, 3); assert.equal(g.lab.player.raiseT, 0);
});
test('drop crosses only current platform; holding down cannot drop through the next', () => {
  const g = fixture({ plats: [[100, 260, 160], [100, 180, 160]] });
  Object.assign(g.lab.player, { x: 150, y: 140, ground: true });
  g.press('down'); advance(g, .5);
  assert.equal(g.lab.player.y, 220); assert.equal(g.lab.player.ground, true);
  g.press('down'); advance(g, .2); assert.equal(g.lab.player.y, 220);
  g.release('down'); g.press('down'); advance(g, .5);
  assert.equal(g.lab.player.y, 304);
  g.release('down'); g.press('down'); advance(g, .2);
  assert.equal(g.lab.player.y, 304);
});
for (const face of [-1, 1]) for (const vy of [-1.1, 0, 1.1]) {
  test(`timed guard reverses the same projectile, face ${face}, vy ${vy}`, () => {
    const g = fixture(); const p = g.lab.player;
    Object.assign(p, { x: 400, face }); g.press('guard'); advance(g, .04);
    g.lab.fire(p.x + p.w / 2 + face * 15, p.y + 20, -face * 4.4, vy);
    const shot = g.lab.shots[0]; const hp = p.hp;
    advance(g, .02);
    assert.equal(g.lab.shots[0], shot); assert.equal(shot.reflected, true);
    assert.ok(shot.vx * face > 0); assert.equal(shot.vy, vy * -1.4);
    assert.equal(p.hp, hp);
  });
}
test('holding guard late blocks but does not reflect; wrong facing takes damage', () => {
  for (const wrong of [false, true]) {
    const g = fixture(); const p = g.lab.player; p.face = wrong ? -1 : 1;
    g.press('guard'); advance(g, .3);
    g.lab.fire(p.x + 27, p.y + 20, -4, 0); advance(g, .02);
    assert.equal(g.lab.shots.length, 0);
    assert.equal(p.hp, wrong ? 4 : 5);
  }
});
test('reflected diagonal projectile travels back and damages a boss', () => {
  const g = fixture({ bossKind: 'volley' }); const p = g.lab.player;
  Object.assign(p, { x: 400, face: 1 }); g.lab.spawnBoss();
  Object.assign(g.lab.boss, { x: 520, y: 262, cd: 100, recover: 100 });
  const hp = g.lab.boss.hp;
  g.press('guard'); advance(g, .03);
  g.lab.fire(p.x + 27, p.y + 20, -4.4, 1.1); advance(g, .02);
  g.release('guard'); advance(g, .4);
  assert.equal(g.lab.boss.hp, hp - 1);
});
for (const kind of ['charger', 'rider']) {
  test(`${kind}: committed tell, continuous dash, recovery at landing position, larger activity range`, () => {
    const g = fixture({ mobs: [{ kind, name: kind, x: 800, range: 70 }] });
    const o = g.lab.mobs[0]; const p = g.lab.player;
    assert.ok(o.b - o.a >= (kind === 'rider' ? 1240 : 840));
    p.x = 1000; o.cd = 0;
    g.lab.stepMob(o, 1 / 120); assert.ok(o.tel >= .59); assert.equal(o.dir, 1);
    p.x = 600;
    let largest = 0; let recovered = false;
    for (let i = 0; i < 350; i++) {
      const before = o.x; const recovering = o.recover > 0;
      g.lab.stepMob(o, 1 / 120);
      largest = Math.max(largest, Math.abs(o.x - before));
      if (recovering) { recovered = true; assert.equal(o.x, before); }
    }
    assert.ok(recovered); assert.ok(largest <= 390 / 120 + .001);
    assert.ok(o.x > 870, 'must not return to old patrol boundary');
  });
  test(`${kind}: parry interrupts dash; recovery contact is harmless and melee can punish`, () => {
    const g = fixture({ mobs: [{ kind, name: kind, x: 120 }] });
    const o = g.lab.mobs[0]; const p = g.lab.player;
    Object.assign(p, { x: 100, face: 1 });
    Object.assign(o, { x: 124, dir: -1, dash: .5 });
    g.press('guard'); advance(g, .025);
    assert.equal(o.dash, 0); assert.ok(o.recover > 1); assert.equal(p.hp, 5);
    g.release('guard'); advance(g, .3);
    Object.assign(p, { x: o.x - 32, face: 1 }); g.press('atk'); advance(g, .2);
    assert.ok(o.hp < 3); assert.equal(p.hp, 5);
  });
}
test('rushing mobs on elevated platforms remain on their actual platform', () => {
  const g = fixture({ plats: [[500, 240, 200]], mobs: [{ kind: 'rider', name: 'elevated', x: 550, y: 240 }] });
  const o = g.lab.mobs[0]; assert.equal(o.a, 500); assert.equal(o.b, 658);
  Object.assign(o, { dash: .85, dir: 1 });
  for (let i = 0; i < 120; i++) g.lab.stepMob(o, 1 / 120);
  assert.equal(o.x, 658); assert.ok(o.recover > 0);
});
test('every real map loads and steps with expanded rush bounds inside the world', () => {
  for (const map of content.game.maps) {
    const g = fixture(map); advance(g, .1);
    for (const mob of g.lab.mobs) {
      assert.ok(Number.isFinite(mob.x)); assert.ok(mob.a >= 0 && mob.b + mob.w <= 2200);
    }
  }
});

test('gun muzzle-height bullets can hit the visible head of ground enemies', () => {
  const g = fixture({ mobs: [{ kind: 'charger', name: 'target', x: 180 }] });
  g.lab.player.ammo = 2; g.press('shoot'); g.release('shoot'); advance(g, .45);
  assert.equal(g.lab.mobs[0].hp, 2);
});
test('ordinary held guard does not spend block stamina every simulation tick', () => {
  const g = fixture(); const p = g.lab.player;
  g.press('guard'); advance(g, .3);
  g.lab.hurtPlayer(-1); const stamina = p.stam;
  assert.equal(g.lab.hurtPlayer(-1), 'ignored'); assert.equal(p.stam, stamina);
});
test('rush attack is interruptible with ordinary held guard as well as parry', () => {
  const g = fixture({ mobs: [{ kind: 'rider', name: 'rider', x: 500 }] });
  const o = g.lab.mobs[0]; const p = g.lab.player;
  g.press('guard'); advance(g, .3);
  Object.assign(o, { x: p.x + 24, dir: -1, dash: .5 });
  advance(g, .02);
  assert.equal(o.dash, 0); assert.ok(o.recover > .5); assert.equal(p.hp, 5);
});

test('map 4 second-tier platform is reachable with a running jump', () => {
  const g = fixture({ plats: [[360,262,130],[640,206,120]] });
  const p = g.lab.player;
  g.press('right'); advance(g, .6);
  Object.assign(p, { x: 488, y: 222, ground: true, vy: 0 });
  g.press('jump'); g.release('jump');
  let reached = false;
  for (let i = 0; i < 100; i++) {
    g.lab.step(1/120);
    if (p.ground && p.y === 166) reached = true;
  }
  assert.ok(reached, 'the raised platform must not be visually reachable but physically impossible');
});
