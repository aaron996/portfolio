const assert = require('node:assert/strict');
const { test } = require('node:test');
const { fixture, advance, content } = require('./game-test-runtime.cjs');

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
  for (let i = 0; i < 40 && !cleared; i++) {
    Object.assign(g.lab.boss, { x: 800, y: 262, cd: 100, dash: 0, tel: 0 });
    Object.assign(g.lab.player, { x: 766, y: 304, vx: 0, vy: 0, face: 1, ground: true });
    g.press('atk'); g.release('atk'); advance(g, .5);
  }
  assert.equal(g.status().ammo, 0); assert.equal(cleared, 1); assert.equal(finished, 1);
  assert.equal(g.lab.boss, null); advance(g, .5); assert.equal(cleared, 1);
});

test('boss projectile patterns emit their expected volley and can be reflected back from the real firing position', () => {
  for (const kind of ['slam', 'volley']) {
    const g = fixture({ bossKind: kind }); const p = g.lab.player;
    Object.assign(p, { x: 400, face: 1 }); g.lab.spawnBoss();
    Object.assign(g.lab.boss, { x: 520, tel: .001, cd: 100 });
    g.lab.step(1/120); assert.equal(g.lab.shots.length, kind === 'slam' ? 2 : 3);
    let reflected = false; const hp = g.lab.boss.hp;
    for (let i=0;i<180;i++) {
      const approaching = g.lab.shots.some(s=>!s.reflected && s.vx < 0 && s.x < p.x+55 && s.x > p.x);
      if (approaching && !p.guarding) g.press('guard');
      g.lab.step(1/120);
      if (g.lab.shots.some(s=>s.reflected)) reflected = true;
    }
    assert.ok(reflected, kind); assert.ok(g.lab.boss.hp < hp, kind);
  }
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
  Object.assign(g.lab.boss, { x: 520, y: 262, cd: 100 });
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
    g.release('guard'); g.press('atk'); advance(g, .2);
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
