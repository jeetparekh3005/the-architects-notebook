# diagram-forge

The notebook's house diagram engine: write a small JSON spec, get an animated,
self-contained architecture diagram in one locked style.

## The house style

- **Neo-brutal on graph paper** — white cards, hard offset shadows, 2px black
  borders, Line icons, bold monospace labels on a faint engineering grid.
- **One motion language.** A **pulse** is a call in flight. The **line** says how it
  is called. Nothing else moves.

| Encoding | Meaning |
|----------|---------|
| Teal **pulse** | a call (request or data read/write) travelling a path |
| **Solid** line | synchronous call |
| **Dashed** line | asynchronous / stream (no pulse travels it) |
| **Thick** line | the hot (critical) path |
| Faint dashed | structural link, not on the request path |

Every diagram ships the same **Key** legend, and labels sit on a paper backing so
wires never cross the text.

## Usage

```bash
# build a self-contained animated HTML page from a spec
node build.mjs specs/cassandra-write.json            # -> dist/cassandra-write.html

# export a static SVG for GitHub / MkDocs (JS does not run there)
node export-svg.mjs dist/cassandra-write.html dist/cassandra-write.svg --t=2.2

# export a looping animated GIF for Substack / LinkedIn / anywhere JS does not run
node export-gif.mjs dist/cassandra-write.html dist/cassandra-write.gif --fps=12
```

The GIF export captures exactly one pulse period (`pulsePeriod`, default 4.8s) via
the deterministic `?static=1&t=` mode, so the loop is seamless, then runs gifsicle
`-O3` so the mostly-static flat-colour frames delta-compress (a ~6 MB raw encode
lands around 260 KB). It shares the same cache as the SVG exporter.

- **In the MkDocs site / a blog:** embed the HTML (animated) or the SVG (static).
- **On GitHub / in Markdown:** use the SVG.
- **In a page directly:** load `diagram-engine.js` and call
  `Diagram.render(hostElement, spec)`.

The SVG export needs a browser once; it installs Playwright's Chromium into
`~/.cache/diagram-forge` (override with `DIAGRAM_FORGE_CACHE`). No browser? Open the
built HTML with `?static=1&t=2.2` and copy the `<svg>` out by hand.

## The spec

```jsonc
{
  "badge": "Deep dive · Apache Cassandra",   // small eyebrow tag
  "title": "A write, and where it lives",
  "subtitle": "One or two sentences of context.",
  "width": 1160, "height": 940,              // viewBox

  // tiers are horizontal bands, top to bottom; their y is the band centre
  "tiers": [
    { "label": "Client", "y": 80 },
    { "label": "Coordinator", "y": 228 }
  ],

  // nodes: x is explicit; y comes from the tier (override with "y" for a second
  // row inside a tier). icon is a name from Diagram.ICONS. "wide": true for a bar.
  "nodes": {
    "client": { "x": 580, "tier": 0, "label": "Client", "sub": "app", "icon": "phone" },
    "coord":  { "x": 580, "tier": 1, "label": "Coordinator", "sub": "hashing", "icon": "hub" }
  },

  // flows draw SOLID wires AND send a pulse along the whole sequence.
  // "hot": true makes the wire thick (the hot path).
  "flows": [
    { "seq": ["client", "coord"] },
    { "seq": ["coord", "rB"], "hot": true }
  ],

  // async: dashed wires, no pulse (streams, events, background flushes)
  "async": [["mem", "ss3"]],

  // weak: faint structural links (replication, indexes), no pulse
  "weak": [["bloom", "ss3"]]
}
```

### Icons

`phone monitor gate branch hub box server surge hex route bell map card stream
cyl stack bars journal grid bloom merge cloud lock`

Add more in `diagram-engine.js` under `ICONS` — each is line art drawn with
`currentColor`, centred on the origin, fitting a ~44px box.

## Layout tips

- Put a tier's nodes at distinct `x`. For two stacked rows inside one tier, give the
  lower node an explicit `y`.
- Keep vertical spines on a shared `x` so wires run straight; the router is
  orthogonal (Manhattan) and trims to node edges automatically.
- The hot path should be the single most important route — one thick line reads; three
  do not.

## Genericity and limits (read this)

Be honest about what this is: **a styled renderer with a fixed visual language, not an
auto-layout tool.** The *style* is fully generic — any spec renders identically. The
*layout is manual*:

- **You place every `x`.** There is no force-directed or hierarchical auto-layout. `y`
  comes from the tier; `x` is yours. Two nodes at the same `x` in the same tier overlap.
- **The router is orthogonal but node-blind.** Each wire routes independently (drop to a
  staggered mid-channel, across, down). It does not know about other nodes, so a wire
  *can* pass through a node you didn't intend — typically a long edge that skips a node in
  a shared row or column, or anything routed across a wide central node.

Three guardrails make this safe to work with:

- **Spec validation.** An unknown node id or bad tier renders a readable error box, not a
  blank page.
- **Crossing warnings.** The engine logs `console.warn("wire A->B crosses node X")` for
  every wire that passes through an unrelated node's box. **Check the console after every
  build** and nudge an `x` (or re-tier) until it is silent. All three shipped specs are
  warning-free.
- **Channel stagger.** Parallel fan-out edges are offset slightly so they separate instead
  of stacking into one ambiguous line.

What this means in practice: simple-to-moderate diagrams (a request path, a storage
engine, a service map of ~12–18 nodes) come out clean with a little `x` tuning. Very dense
graphs, or ones with a big hub that everything must route past, still need deliberate
placement — the warnings tell you where. Node-aware auto-routing is a deliberate non-goal
for now; the trade is a tiny, dependency-free engine you fully control.

## Files

| File | Purpose |
|------|---------|
| `diagram-engine.js` | the renderer + icon registry + house-style tokens |
| `build.mjs` | spec -> self-contained animated HTML |
| `export-svg.mjs` | built HTML -> static SVG |
| `template.html` | the page skeleton build.mjs fills |
| `specs/` | example specs (Uber dispatch, Cassandra write path) |
