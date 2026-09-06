# Combat regression checks

Run `npm run test:game` for deterministic tests against the actual engine source.
`scripts/game-test-runtime.cjs` injects accessors into an in-memory transpilation;
no debugging API is exported by the production game. Tests use a 120 Hz step and
cover gun windup/cancellation, stacked-platform drops, directional/diagonal parries,
boss damage, rush continuity, interruption, recovery and all five map loads.

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
  shows harmless recovery. Guard interrupts with 0.65s recovery; timed parry grants
  1.3s. Melee/gun hits interrupt too. World/platform edges constrain actual movement,
  never teleport a rider back to its original short patrol after a dash.

Verification scope: automated combat scenarios plus browser diagnostic and responsive
production-page smoke checks; not an end-to-end manual clear of all five stages.
