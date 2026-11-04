#!/usr/bin/env node
/*
 * build.mjs — assemble a self-contained animated diagram from a spec.
 *
 *   node build.mjs specs/cassandra-write.json [dist/cassandra-write.html]
 *
 * Inlines diagram-engine.js and the spec into template.html and writes one HTML
 * file with nothing external. Open it in a browser, or embed it in a page.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export function assemble(specJson) {
  const engine = readFileSync(here("./diagram-engine.js"), "utf8");
  const template = readFileSync(here("./template.html"), "utf8");
  const spec = JSON.parse(specJson);
  const title = spec.title || spec.badge || "Diagram";
  return template
    .replace("__TITLE__", () => escapeHtml(title))
    .replace("/*ENGINE*/", () => "\n" + engine + "\n")
    .replace("/*SPEC*/", () => JSON.stringify(spec));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(here("./build.mjs"));
if (invokedDirectly) {
  const [src, out] = process.argv.slice(2);
  if (!src) {
    console.error("usage: node build.mjs <spec.json> [out.html]");
    process.exit(2);
  }
  const specJson = readFileSync(src, "utf8");
  const file = resolve(out ?? here("./dist/" + basename(src).replace(/\.json$/, ".html")));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, assemble(specJson));
  console.log("built " + file);
}
