# Combat regression checks

Run `npm run test:game` for deterministic tests against the actual engine source.
`scripts/game-test-runtime.cjs` injects accessors into an in-memory transpilation;
no debugging API is exported by the production game. Tests use a 120 Hz step and
cover gun windup/cancellation, stacked-platform drops, directional/diagonal parries,
attack IDs, boss damage, rush continuity, shockwaves, interruption, recovery,
distinct enemy patterns and all five map loads.

For browser checks run `node scripts/game-lab.cjs`, open
`http://127.0.0.1:3004`, and use scenario/action/step buttons. This local diagnostic
server binds only to loopback and serves the actual engine plus existing assets;
it is not a Next route. Screenshots belong in ignored `output/playwright/`.

## Controls and tuning

- Down/S (mobile ▼): leave the current one-way platform only. Release and press
  again to descend another level. Ground never drops through.
- First gunshot: 0.18s raise → discharge/recoil → 0.48s aim hold. Subsequent held
  shots use the existing 0.26s cadence. Canceling windup spends no ammo.
- Guard: face incoming fire and raise within the existing 0.22s parry window.
  The same projectile reverses both velocities at 1.4× speed and becomes friendly;
  its return flight can damage enemies/bosses and is not culled at the camera edge.
- Charger: 0.60s tell, 264px/s dash, 0.85s recovery, minimum ±420px activity range.
- Rider: 0.75s tell, 390px/s dash (was 492), 1.05s recovery, minimum ±620px range.
- Rush direction locks at tell start. Red arrow shows the direction; lime foot ring
  shows harmless recovery. Guard interrupts with 0.72s recovery; timed parry grants
  1.2s. Melee/gun hits interrupt too. World/platform edges constrain actual movement,
  never teleport a rider back to its original short patrol after a dash.

## Combat V3 contract

- Every committed hit has an `attackId`. One ID produces at most one effective
  `damaged`, `blocked`, `parried` or `ignored` result against the player. A later
  attack keeps its own result even while the previous hit's invulnerability is active.
- Control velocity and collision impulse are separate. A block/parry cannot be
  erased by movement friction on the next simulation tick.
- Boss lifecycle is `tell -> active -> recovery`. Direction and target are captured
  when tell begins. Boss body overlap is harmless outside an active dash.
- Container slam uses two `Shockwave` fronts at 300 world px/s. They share one
  attack ID, stay on the ground layer, ignore guard, are avoided when the player's
  feet are at least 18px above the floor, and apply a low horizontal impulse without
  the normal upward hurt launch.
- Map 2 emits parcel silhouettes, map 4 emits data packets from the boss socket,
  and map 5 alternates dash/slam. Reflected projectiles keep their original object
  silhouette and add a lime ownership ring.
- Walker, flyer and shooter now use separate tell/active/recovery windows. Flyer
  dive direction is snapshotted; shooter direction locks before discharge.
- Mission devices have a readable procedural off/on fallback. Match and rules modes
  never highlight `mission.next`, so their answer is not leaked before interaction.

Current deterministic gate: `npm run test:game` passes 57 scenarios. Browser smoke
was run on the production `/game` page at desktop, 390x844 and 844x390. It covers
real keyboard/touch input, responsive controls, console errors and asset requests;
it is not a complete manual clear of all five stages.

Verification scope: automated combat scenarios plus browser diagnostic and responsive
production-page smoke checks; not an end-to-end manual clear of all five stages.
