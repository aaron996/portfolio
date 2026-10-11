// In bảng tiếng tuyệt đối của một phim case dưới dạng JSON: { fps, master, frames, cues }.
// Dùng cho scripts/motion-sfx.py (trộn thành một file tiếng) và trang nghe thử.
//   node scripts/motion-cues.cjs interdist
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const FILMS = {
  interdist: { module: './components/motion/interdist/InterdistFilm', cues: 'INTERDIST_CUES', frames: 'INTERDIST_FILM_FRAMES' },
  opspulse: { module: './components/motion/opspulse/OpsPulseFilm', cues: 'OPSPULSE_CUES', frames: 'OPSPULSE_FILM_FRAMES' },
  cod: { module: './components/motion/cod/CodFilm', cues: 'COD_CUES', frames: 'COD_FILM_FRAMES' },
  warehouse: { module: './components/motion/warehouse/WarehouseFilm', cues: 'WAREHOUSE_CUES', frames: 'WAREHOUSE_FILM_FRAMES' },
  shopee: { module: './components/motion/shopee/ShopeeFilm', cues: 'SHOPEE_CUES', frames: 'SHOPEE_FILM_FRAMES' },
};

function filmCues(name) {
  const film = FILMS[name];
  if (!film) throw new Error(`Không có phim "${name}". Có: ${Object.keys(FILMS).join(', ')}`);
  const out = path.join(root, 'output', 'motion-audio', `cues-${name}.cjs`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  esbuild.buildSync({
    stdin: {
      contents: `export { ${film.cues} as cues, ${film.frames} as frames } from "${film.module}";
        export { FPS as fps } from "./components/motion/paper";
        export { SFX_MASTER as master } from "./components/motion/sfx";`,
      resolveDir: root, loader: 'tsx',
    },
    bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', outfile: out, logLevel: 'error',
  });
  delete require.cache[out];
  const { fps, master, frames, cues } = require(out);
  return { fps, master, frames, cues };
}

module.exports = { filmCues };
if (require.main === module) process.stdout.write(JSON.stringify(filmCues(process.argv[2] || 'interdist')));
