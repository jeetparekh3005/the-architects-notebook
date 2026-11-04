#!/usr/bin/env node
/*
 * export-svg.mjs — render a built diagram to a static SVG for GitHub / MkDocs,
 * where JavaScript does not run. Produces one frozen frame of the animation.
 *
 *   node export-svg.mjs dist/cassandra-write.html [dist/cassandra-write.svg] [--t 2.2]
 *
 * Requires a browser. Uses Playwright's bundled Chromium; installs playwright-core
 * once into a cache folder if it is not present. If you prefer not to depend on a
 * browser, open the built HTML with ?static and copy the <svg> out by hand.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith("--"));
const out = args.filter((a) => !a.startsWith("--"))[1] || src?.replace(/\.html$/, ".svg");
const tArg = (args.find((a) => a.startsWith("--t")) || "--t=2.2").split("=")[1] || "2.2";
if (!src) { console.error("usage: node export-svg.mjs <built.html> [out.svg] [--t=2.2]"); process.exit(2); }

const cache = process.env.DIAGRAM_FORGE_CACHE || resolve(homedir(), ".cache/diagram-forge");
const pwPath = resolve(cache, "node_modules/playwright-core");
if (!existsSync(pwPath)) {
  mkdirSync(cache, { recursive: true });
  console.error("installing playwright-core once into " + cache + " ...");
  execSync("npm init -y >/dev/null 2>&1 && npm i playwright-core@^1 >/dev/null 2>&1", { cwd: cache, stdio: "inherit" });
  execSync("node node_modules/playwright-core/cli.js install chromium", { cwd: cache, stdio: "inherit" });
}
const pwMod = await import(pathToFileURL(resolve(pwPath, "index.js")).href);
const chromium = (pwMod.default || pwMod).chromium;

const url = pathToFileURL(resolve(src)).href + "?static=1&t=" + tArg;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2, colorScheme: "light" });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(200);
// clone the svg and inline the engine's stylesheet so the file is self-contained
const svg = await p.evaluate(() => {
  const src = document.querySelector("#root svg.df-svg");
  const clone = src.cloneNode(true);
  const css = (document.getElementById("df-style") || {}).textContent || "";
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = css;
  clone.insertBefore(style, clone.firstChild);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return clone.outerHTML;
});
await b.close();

const file = resolve(out);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, '<?xml version="1.0" encoding="UTF-8"?>\n' + svg);
console.log("wrote " + file);
