---
name: diagram-forge
description: Create an animated architecture diagram in the notebook's locked house style from a plain-language description of a system. Use when the user wants a diagram for a blog post, case study, or notebook page — a request flow, a storage engine, a service map, a data pipeline. Produces a self-contained animated HTML and a static SVG for GitHub/MkDocs.
---

# diagram-forge: draw a system in the house style

You turn a description of a system into one diagram in the notebook's locked style:
Neo-brutal cards on graph paper, Line-Mono labels, and a two-motion language
(pulse = a call, dashed = async, thick = hot path). The engine is fixed; you write
the **spec** and build. Never restyle — the whole point is that every diagram looks
like one hand drew it.

The engine, build scripts, spec format, and examples live in
`tools/diagram-forge/` (read its `README.md` for the full spec). Work there.

## 1. Understand the system

From the user's description, decide:

- **Tiers** — the horizontal bands, top to bottom (clients → edge → core → services →
  stream → data is a common spine, but use what the system is). Each tier has a `y`.
- **Nodes** — the components, one icon each (see the icon list in the README; pick the
  closest, or add a new line glyph to `ICONS` in `diagram-engine.js`).
- **The request path** — the sequence(s) a call travels. These become `flows` (solid +
  pulse). Pick the single **hot path** and mark it `"hot": true`.
- **Async work** — streams, events, background flushes, replication. These become
  `async` (dashed, no pulse) or `weak` (faint structural) links.

One diagram, one story. If it needs two unrelated stories, make two diagrams.

## 2. Write the spec

Create `tools/diagram-forge/specs/<name>.json` following the README's schema and the
existing examples (`cassandra-write.json`, `uber-dispatch.json`). Layout rules:

- Give every node in a tier a distinct `x`. Centre the main spine (e.g. x≈580 on a
  1160-wide canvas). For a second row inside one tier, set the node's explicit `y`.
- Keep a vertical chain on one shared `x` so its wires run straight.
- Space tiers ~150–180 apart in `y`; leave room under each node for its label.
- The hot path is exactly one route. Data stores belong in the lowest tier and should
  be reached by real `flows` (so they light up), not only `weak` links.

## 3. Build and look

```bash
cd tools/diagram-forge
node build.mjs specs/<name>.json                       # -> dist/<name>.html
node export-svg.mjs dist/<name>.html dist/<name>.svg    # -> static SVG
```

Then **check the console and look at it**. The engine warns on problems:

- **`console.warn("wire A->B crosses node X")`** — a wire runs through a node. Nudge an
  `x` or re-tier a node until the console is silent. Do not ship a diagram with crossings.
- A spec error (unknown id, bad tier) renders a red error box instead of the diagram.

Then open the HTML (or screenshot `dist/<name>.svg`) and confirm:

- Every node is visible (no two share an x and y), and no wire crosses a label.
- Arrowheads point the right way; the pulse follows the path you meant; the hot path is right.
- The data tier actually lights up (it is on a flow, not just a weak link).
- The static SVG reads on its own (arrowheads carry direction without the animation).

Fix the spec and rebuild until the console is silent and it reads at a glance. Do not hand
over a diagram you did not look at.

## 4. Hand over

Publish the HTML as an artifact if you can, and point the user at the SVG for
GitHub/MkDocs. Say, one line each: what the diagram shows, which route is the hot
path, and anything you could not verify.

## What goes wrong

| If you catch yourself | Do this instead |
| --- | --- |
| adding a second colour or motion type | the language is one pulse + line styles; use colour never, line weight for the hot path |
| putting two nodes at the same x in the same tier | give one an explicit `y`, or move it to another x |
| a vertical wire cutting through a label | labels already have a paper backing; if it still clips, nudge the node's x off the wire |
| marking three paths "hot" | one hot path; emphasis you spend everywhere is emphasis nowhere |
| restyling the cards, fonts, or grid | never — edit the spec, not the house style in `diagram-engine.js` |
| a data store that never lights up | route a real flow to it, not just a weak link |
