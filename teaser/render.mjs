// Render teaser: Chrome headless (CDP) vẽ từng khung từ index.html → PNG → ffmpeg (+ audio.wav) → MP4.
//   node teaser/render.mjs still 5.7 7.6 13.2       → export/stills/t_5.700.png ...
//   node teaser/render.mjs video [--silent]          → export/teaser-15s-1080p60.mp4
// Cần: Chrome, Node ≥ 22 (WebSocket toàn cục), ffmpeg (python -m pip install imageio-ffmpeg).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const EXPORT = path.join(ROOT, "export");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FPS = 60, FRAMES = 900, WORKERS = Number(process.env.WORKERS || 4);
const PORT = 4177, DEBUG = 9333;

function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  return execFileSync("python", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"]).toString().trim();
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html");
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res);
});

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } }; }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async eval(expression) { const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails)); return r.result.value; }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function connect(url) { const ws = new WebSocket(url); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; }); return new Cdp(ws); }

async function openPages(n) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "teaser-chrome-"));
  const chrome = spawn(CHROME, [`--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profile}`, "--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1920,1080", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--mute-audio", "--no-first-run", "about:blank"], { stdio: "ignore" });
  let targets;
  for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${DEBUG}/json/version`)).json(); break; } catch { await sleep(250); } }
  if (!targets) throw new Error("Chrome không khởi động được");
  const browser = await connect(targets.webSocketDebuggerUrl);
  const pages = [];
  for (let i = 0; i < n; i++) {
    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const list = await (await fetch(`http://127.0.0.1:${DEBUG}/json/list`)).json();
    const t = list.find(x => x.id === targetId);
    const page = await connect(t.webSocketDebuggerUrl);
    await page.send("Page.enable"); await page.send("Runtime.enable");
    await page.send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
    for (let k = 0; k < 200; k++) { if (await page.eval("window.__ready === true").catch(() => false)) break; await sleep(100); }
    pages.push(page);
  }
  return { chrome, browser, pages, profile };
}
// Lấy PNG theo từng mảnh 1MB — thông điệp CDP/WebSocket quá lớn (>4MB) làm client Node bị treo.
async function grab(page, i) {
  const len = await page.eval(`(renderFrame(${i}), window.__b64 = document.getElementById("cv").toDataURL("image/png").slice(22), window.__b64.length)`);
  const parts = [];
  for (let o = 0; o < len; o += 1_000_000) parts.push(await page.eval(`window.__b64.slice(${o}, ${o + 1_000_000})`));
  return parts.join("");
}

async function main() {
  const [mode, ...rest] = process.argv.slice(2);
  fs.mkdirSync(EXPORT, { recursive: true });
  await new Promise(r => server.listen(PORT, r));
  const { chrome, browser, pages, profile } = await openPages(mode === "video" ? WORKERS : 1);
  const done = async () => { try { browser.send("Browser.close").catch(() => {}); } catch {} await sleep(300); chrome.kill(); server.close(); await sleep(500); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} };
  try {
    if (mode === "still") {
      const dir = path.join(EXPORT, "stills"); fs.mkdirSync(dir, { recursive: true });
      for (const a of rest) { const t = parseFloat(a), i = Math.round(t * FPS); fs.writeFileSync(path.join(dir, `t_${t.toFixed(3)}.png`), Buffer.from(await grab(pages[0], i), "base64")); console.log("still", t); }
    } else if (mode === "video") {
      const silent = rest.includes("--silent");
      const wav = path.join(EXPORT, "teaser-audio.wav");
      const out = path.join(EXPORT, silent ? "teaser-silent-preview.mp4" : "teaser-15s-1080p60.mp4");
      const args = ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-"];
      if (!silent) args.push("-i", wav);
      args.push("-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "13", "-profile:v", "high", "-level", "4.2",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-r", String(FPS), "-g", "120", "-bf", "2");
      if (!silent) args.push("-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2");
      args.push("-t", "15", "-movflags", "+faststart", out);
      const ff = spawn(ffmpegPath(), args, { stdio: ["pipe", "inherit", "inherit"] });
      const buf = new Map(); let next = 0, written = 0; const t0 = Date.now();
      const flush = () => { while (buf.has(written)) { ff.stdin.write(buf.get(written)); buf.delete(written); written++; } };
      await Promise.all(pages.map(async (page, w) => {
        for (let i = w; i < FRAMES; i += WORKERS) {
          while (i - written > WORKERS * 6) await sleep(20);   // giữ bộ đệm nhỏ
          buf.set(i, Buffer.from(await grab(page, i), "base64")); flush();
          if (i % 60 === w) console.log(`frame ${i}/${FRAMES}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
        }
      }));
      flush(); ff.stdin.end(); await new Promise(r => ff.on("close", r));
      console.log("→", out);
    }
  } finally { await done(); }
}
main().then(() => process.exit(0), e => { console.error(e); process.exit(1); });
