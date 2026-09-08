const assert = require('node:assert/strict');
const { advance } = require('./game-test-runtime.cjs');
// Inputs and engine physics only: no teleport, no alternate movement model.
function warehouseRoute(g, onStage = () => {}) {
  const p = g.lab.player;
  function move(x, max = 5) {
    const key = p.x < x ? 'right' : 'left'; g.press(key);
    let ticks = 0;
    while (Math.abs(p.x - x) > 5 && ticks++ < max * 120) {
      if ((key === 'right' && p.x >= x) || (key === 'left' && p.x <= x)) break;
      g.lab.step(1/120);
    }
    g.release(key); advance(g, .14);
    assert.ok(Math.abs(p.x - x) < 26, `move ${x}: at ${p.x}`);
  }
  function jump(x, floor) {
    assert.ok(p.ground, `jump must begin grounded at ${p.x},${p.y}`);
    const key = p.x < x ? 'right' : 'left'; g.press(key); g.press('jump'); g.release('jump');
    let reached = false;
    for (let i=0;i<180;i++) {
      if ((key==='right' && p.x>=x-12) || (key==='left' && p.x<=x+12)) g.release(key);
      g.lab.step(1/120);
      if(p.ground && Math.abs(p.y+40-floor)<1){reached=true;break;}
    }
    g.release(key); advance(g,.14);
    assert.ok(reached, `jump ${x},${floor}: landed at ${p.x},${p.y+40}`);
  }
  function interact(expected) {
    g.press('interact');g.release('interact');
    assert.equal(g.status().traversal.completed, expected);
    onStage(expected,g);
  }
  move(130); jump(205,264); jump(345,184); interact(1);
  move(520); // Drop to the lift shaft and wait through a complete lift cycle.
  let boarded = false;
  for(let i=0;i<1800;i++) {
    g.lab.step(1/120);
    if(p.ground && Math.abs(p.y+40-44)<1){boarded=true;break;}
  }
  assert.ok(boarded, `lift did not deliver actor: ${p.x},${p.y+40}`);
  onStage('lift',g);
  move(845); interact(2);
  jump(960,-36);jump(815,-116);jump(950,-196);jump(850,-256);
  move(215);interact(3);
  for(let i=0;i<12 && p.y+40<344;i++) {
    g.press('down');g.release('down');advance(g,.65);
  }
  assert.equal(p.y+40,344,'shortcut must return safely to floor 1');
  onStage('return',g);
  move(945);interact(4);
}
module.exports={warehouseRoute};
