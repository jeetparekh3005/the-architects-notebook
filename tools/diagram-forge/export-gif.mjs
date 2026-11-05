#!/usr/bin/env node
/*
 * export-gif.mjs — render a built diagram to a looping animated GIF for
 * Substack, LinkedIn, and anywhere else that animates GIFs but not JavaScript.
 *
 *   node export-gif.mjs dist/cassandra-write.html [dist/cassandra-write.gif] [--fps=12] [--scale=1]
 *
 * The engine's pulse system is periodic (every flow shares spec.pulsePeriod,
 * default 4.8s), so capturing exactly one period at a fixed frame rate yields a
 * seamless loop. Frames are rendered deterministically via the template's
 * ?static=1&t=<seconds> mode, not by racing wall-clock screenshots.
 *
 * Requires a browser. Shares the playwright-core cache with export-svg.mjs and
 * adds two small pure-JS deps (pngjs to decode frames, gifenc to encode).
 */
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith("--"));
const out = args.filter((a) => !a.startsWith("--"))[1] || src?.replace(/\.html$/, ".gif");
const opt = (name, dflt) => ((args.find((a) => a.startsWith("--" + name)) || "=" + dflt).split("=")[1] || dflt);
const fps = parseFloat(opt("fps", "12"));
const scale = parseFloat(opt("scale", "1"));
if (!src) { console.error("usage: node export-gif.mjs <built.html> [out.gif] [--fps=12] [--scale=1]"); process.exit(2); }

const cache = process.env.DIAGRAM_FORGE_CACHE || resolve(homedir(), ".cache/diagram-forge");
const need = ["playwright-core", "pngjs", "gifenc", "gifsicle"].filter((m) => !existsSync(resolve(cache, "node_modules", m)));
if (need.length) {
  mkdirSync(cache, { recursive: true });
  console.error("installing " + need.join(", ") + " once into " + cache + " ...");
  execSync("npm init -y >/dev/null 2>&1; npm i " + need.map((m) => (m === "playwright-core" ? m + "@^1" : m)).join(" ") + " >/dev/null 2>&1", { cwd: cache, stdio: "inherit" });
  if (need.includes("playwright-core")) execSync("node node_modules/playwright-core/cli.js install chromium", { cwd: cache, stdio: "inherit" });
}
const pwMod = await import(pathToFileURL(resolve(cache, "node_modules/playwright-core/index.js")).href);
const chromium = (pwMod.default || pwMod).chromium;
const { PNG } = (await import(pathToFileURL(resolve(cache, "node_modules/pngjs/lib/png.js")).href)).default
  || await import(pathToFileURL(resolve(cache, "node_modules/pngjs/lib/png.js")).href);
const { GIFEncoder, quantize, applyPalette } = await import(pathToFileURL(resolve(cache, "node_modules/gifenc/dist/gifenc.esm.js")).href);

// one full pulse period, read from the spec baked into the built page
const html = readFileSync(resolve(src), "utf8");
const period = parseFloat((html.match(/"pulsePeriod"\s*:\s*([\d.]+)/) || [, "4.8"])[1]);
const frames = Math.round(period * fps);
const t0 = 2.0; // any phase works; the loop is periodic

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: scale, colorScheme: "light" });
const base = pathToFileURL(resolve(src)).href;

const rgbaFrames = [];
let dims = null;
for (let i = 0; i < frames; i++) {
  const t = (t0 + (i * period) / frames).toFixed(4);
  await p.goto(base + "?static=1&t=" + t, { waitUntil: "networkidle" });
  const el = await p.waitForSelector("#root svg.df-svg");
  const png = PNG.sync.read(await el.screenshot({ type: "png" }));
  if (!dims) dims = { w: png.width, h: png.height };
  rgbaFrames.push(new Uint8ClampedArray(png.data.buffer, png.data.byteOffset, png.data.byteLength));
  process.stderr.write("\rframe " + (i + 1) + "/" + frames);
}
await b.close();
process.stderr.write("\n");

// flat-colour artwork: one global palette keeps the loop flicker-free
const enc = GIFEncoder();
const palette = quantize(rgbaFrames[0], 256);
const delay = Math.round(1000 / fps);
for (const rgba of rgbaFrames) {
  enc.writeFrame(applyPalette(rgba, palette), dims.w, dims.h, { palette, delay, repeat: 0 });
}
enc.finish();
const raw = resolve(out) + ".raw.gif";
writeFileSync(raw, Buffer.from(enc.bytes()));

// delta-encode the mostly-static frames; flat artwork shrinks dramatically
execSync('"' + resolve(cache, "node_modules/.bin/gifsicle") + '" -O3 "' + raw + '" -o "' + resolve(out) + '"');
execSync('rm -f "' + raw + '"');
console.log("wrote " + resolve(out) + " (" + dims.w + "x" + dims.h + ", " + frames + " frames @ " + fps + "fps, " + period + "s loop)");
