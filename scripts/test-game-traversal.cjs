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
  if (map.traversal) continue; // Moving-lift route is exercised end to end below.
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

const { warehouseRoute } = require('./warehouse-route.cjs');
const warehouse = content.game.maps.find(map => map.traversal);
test('warehouse: start → power → moving lift → both upper branches → return → boss using movement inputs', () => {
  const g=fixture(warehouse);g.lab.player.inv=1000;
  warehouseRoute(g, (stage) => {
    if(stage===3) assert.ok(g.lab.camera.y < -300,'camera follows upstairs');
    if(stage==='return') assert.ok(g.status().mobsLeft>0,'optional mobs remain before dispatch');
  });
  assert.equal(g.status().bossAlive,true);
  assert.equal(g.status().mission,null,'no repeated boss unlock sequence');
});
test('warehouse: killing all mobs does not bypass route; interaction requires correct floor and order', () => {
  const g=fixture(warehouse);g.lab.mobs.forEach(m=>m.dead=true);advance(g,.1);
  assert.equal(g.status().bossAlive,false);
  for(const node of [warehouse.traversal.nodes[1],{...warehouse.traversal.nodes[0],y:344}]) {
    Object.assign(g.lab.player,{x:node.x-13,y:node.y-40,ground:true});
    g.press('interact');g.release('interact');assert.equal(g.status().traversal.completed,0);
  }
});
test('warehouse: lift and camera pause; jumping off lift does not carry actor upward', () => {
  const g=fixture(warehouse);const p=g.lab.player;p.inv=1000;
  Object.assign(p,{x:337,y:144,ground:true});g.press('interact');g.release('interact');
  Object.assign(p,{x:510,y:304,ground:true});advance(g,2.5);
  const lift=g.lab.liftY, y=p.y;assert.ok(lift<344);
  g.pause();advance(g,5);assert.equal(g.lab.liftY,lift);assert.equal(p.y,y);
  g.resume();g.press('jump');g.release('jump');advance(g,.15);
  assert.ok(p.y+40<g.lab.liftY-50);assert.equal(p.ground,false);
});
test('warehouse: repeated checkpoint deaths preserve progress, gear and pickup state', () => {
  let die;const g=fixture(warehouse,{globals:{window:{addEventListener(){},removeEventListener(){},clearTimeout(){},setTimeout(fn){die=fn;return 1;}}}});
  Object.assign(g.lab.player,{x:337,y:144,ground:true,ammo:8,gunName:'saved gun'});
  g.lab.pickups[2].taken=true;g.lab.mobs[0].dead=true;
  g.press('interact');g.release('interact');
  for(let i=0;i<2;i++){
    Object.assign(g.lab.player,{hp:1,inv:0,ammo:0});g.lab.hurtPlayer(-1);die();
    assert.equal(g.status().traversal.completed,1);assert.equal(g.status().hp,5);assert.equal(g.status().ammo,8);
    assert.equal(g.lab.pickups[2].taken,true);assert.equal(g.lab.mobs[0].dead,true);
    assert.equal(g.lab.player.y,144);assert.equal(g.status().bossAlive,false);
  }
});
test('warehouse: upper-floor enemy projectiles survive outside the old viewport bounds', () => {
  const g=fixture(warehouse);g.lab.fire(400,-280,3,0);advance(g,.1);
  assert.equal(g.lab.shots.length,1);assert.ok(g.lab.shots[0].x>400);
});
