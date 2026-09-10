// Test-only instrumentation: production engine has no debug API or scenario shortcuts.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const compiled = new Map();
function compile(file, browser = false) {
  const cacheKey = file + browser;
  if (compiled.has(cacheKey)) return compiled.get(cacheKey);
  let source = fs.readFileSync(path.join(root, file), 'utf8');
  if (file.endsWith('engine.ts')) {
    const anchor = '  return {\n    loadMap,';
    source = source.replace(/\r\n/g, '\n');
    if (!source.includes(anchor)) throw new Error('Engine test anchor changed');
    source = source.replace(anchor, `  return {
    lab: { player, step, stepMob, stepBoss, playerFrame, combatBossFrame, draw, fire, spawnBoss, hurtPlayer, onKeyDown,
      get mobs() { return mobs; }, get shots() { return shots; },
      get shockwaves() { return shockwaves; },
      get combatFx() { return combatFx; },
      get bullets() { return bullets; }, get boss() { return boss; },
      get liftY() { return liftY; }, get camera() { return {x:cam,y:camY}; },
      get platforms() { return surfaces(); }, get pickups() { return pickups; } },
    loadMap,`);
    if (browser) source += '\nexport { drawRig, playerRig, mobRig, mobRef, bossRig, HEAD_PX, BOSS_PX };';
  }
  const result = ts.transpileModule(source, { compilerOptions: {
    module: browser ? ts.ModuleKind.ES2022 : ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  }}).outputText;
  compiled.set(cacheKey, result);
  return result;
}
function evaluate(file, globals = {}) {
  const exports = {};
  vm.runInNewContext(compile(file), {
    exports, process: { env: { NODE_ENV: 'production' } }, console,
    require: (name) => {
      if (name === './chapterMission') return evaluate('components/game/chapterMission.ts');
      throw new Error(`Unexpected engine dependency: ${name}`);
    },
    Image: class { complete = false; naturalWidth = 0; },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    matchMedia: () => ({ matches: true }), performance: { now: () => 0 },
    requestAnimationFrame: () => 1, cancelAnimationFrame: () => {},
    window: { addEventListener() {}, removeEventListener() {}, setTimeout() {}, clearTimeout() {} },
    ...globals,
  }, { filename: file });
  return exports;
}
const content = evaluate('content/content.vi.ts').content;
function canvasRecorder() {
  const commands = [];
  const state = {};
  const snapshot = () => ({ fillStyle: state.fillStyle, strokeStyle: state.strokeStyle,
    lineWidth: state.lineWidth, font: state.font, textAlign: state.textAlign });
  const gradient = () => ({ addColorStop(...args) { commands.push({ op: 'addColorStop', args, ...snapshot() }); } });
  const context = new Proxy({}, {
    get(_, key) {
      if (key in state) return state[key];
      if (key === 'createLinearGradient') return (...args) => { commands.push({ op: key, args, ...snapshot() }); return gradient(); };
      if (key === 'measureText') return (text) => ({ width: String(text).length * 6 });
      return (...args) => commands.push({ op: key, args, ...snapshot() });
    },
    set(_, key, value) { state[key] = value; commands.push({ op: 'set', key, value, ...snapshot() }); return true; },
  });
  return { canvas: { width: 0, height: 0, getContext: () => context, getBoundingClientRect: () => ({ width: 0 }),
    addEventListener() {}, removeEventListener() {} }, commands };
}
function fixture(overrides = {}, options = {}) {
  const map = { ...content.game.maps[0], mission: undefined, traps: [], pickups: [],
    mobs: [{ kind: 'walker', name: 'sentinel', x: 2100, range: 10 }],
    plats: [], ...overrides };
  const canvas = options.canvas || { getContext: () => ({}), addEventListener() {}, removeEventListener() {} };
  const game = evaluate('components/game/engine.ts', options.globals).createGame(canvas, options.maps || [map], content.game, options.handlers);
  game.resume();
  game.setPauseOnPickup(false);
  game.lab.player.ground = true;
  return game;
}
function advance(game, seconds) {
  for (let i = 0; i < Math.round(seconds * 120); i++) game.lab.step(1 / 120);
}
module.exports = { root, compile, fixture, advance, content, evaluate, canvasRecorder };
