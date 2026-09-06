const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fixture, advance, content } = require('./game-test-runtime.cjs');

// Build platform edges by actually executing running jumps through the engine.
// Fixtures place the actor at a launch edge, but every edge is then traversed by input/physics.
function canJump(from, to) {
  if (from[1] - to[1] > 106) return false;
  const direction = to[0] + to[2]/2 >= from[0] + from[2]/2 ? 1 : -1;
  const starts = from[1] === 344 ? [to[0] - 55, to[0] + to[2]/2 - 13] :
    [direction > 0 ? from[0] + from[2] - 2 : from[0] - 24, from[0] + from[2]/2 - 13];
  for (const start of starts) {
    const g = fixture({ plats: [from,to].filter(p=>p[1]!==344) }); const p = g.lab.player;
    const key = direction > 0 ? 'right' : 'left';
    g.press(key); advance(g,.5);
    Object.assign(p,{x:start,y:from[1]-40,vy:0,ground:true});
    g.press('jump');g.release('jump');
    for (let i=0;i<115;i++) {
      if (p.x > to[0]+10 && p.x+p.w < to[0]+to[2]-10) g.release(key);
      g.lab.step(1/120);
      if(p.ground && p.y===to[1]-40 && p.x+p.w>to[0] && p.x<to[0]+to[2])return true;
    }
  }
  return false;
}
for (const [index,map] of content.game.maps.entries()) {
  test(`map ${index+1}: all platforms and encounter floors are reachable`,()=>{
    const ground=[0,344,2200]; const reached=[ground]; const pending=[...map.plats];
    let progress=true;
    while(progress && pending.length){
      progress=false;
      for(let i=pending.length-1;i>=0;i--){
        if(reached.some(from=>canJump(from,pending[i]))){reached.push(pending.splice(i,1)[0]);progress=true;}
      }
    }
    assert.equal(pending.length,0,`unreachable platforms: ${JSON.stringify(pending)}`);
    for(const mob of map.mobs){
      if(mob.kind==='flyer')continue;
      assert.ok(reached.some(([x,y,w])=>y===(mob.y??344)&&mob.x+30>x&&mob.x<x+w),mob.name);
    }
  });
}
