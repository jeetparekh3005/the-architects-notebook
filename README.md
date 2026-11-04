# The Architect's Notebook

[![Deploy docs](https://github.com/jeetparekh3005/the-architects-notebook/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/jeetparekh3005/the-architects-notebook/actions/workflows/deploy-docs.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

📖 **Read it as a site:** <https://jeetparekh3005.github.io/the-architects-notebook/>

A working notebook on software architecture — patterns, algorithms, and the design of
scalable systems, with real-world case studies and the trade-offs behind every decision.

It spans the full altitude of architectural thinking — from code-level patterns to
distributed and decentralized systems — alongside the practice of it: a system-design
methodology, real-world case studies (each ending in *"what to steal, what to avoid"*),
cross-cutting concerns, and a decision log capturing the trade-offs behind every call.

It grows with whatever I'm building.

---

## Map

| Area | What lives here |
|------|-----------------|
| [`patterns/`](./patterns) | Recipes at three altitudes: [`code/`](./patterns/code) (GoF, idioms), [`architectural/`](./patterns/architectural) (CQRS, event sourcing, saga, strangler fig), [`distributed/`](./patterns/distributed) (outbox, idempotency, leader election) |
| [`algorithms/`](./algorithms) | The architect's toolbox — consistent hashing, bloom filters, HyperLogLog, CRDTs, merkle trees, consensus |
| [`foundations/`](./foundations) | Theory: [`data-systems/`](./foundations/data-systems), [`distributed-systems/`](./foundations/distributed-systems), [`decentralized-systems/`](./foundations/decentralized-systems) (DLTs, blockchain, BFT) |
| [`ai-systems/`](./ai-systems) | RAG, agents, extraction, agentic data, NL→rules, LLMOps, and AI architecture patterns |
| [`system-design/`](./system-design) | Methodology — estimation, component catalog, the framework for approaching any design |
| [`case-studies/`](./case-studies) | Architecture teardowns of real systems, each ending in *steal / avoid* |
| [`cross-cutting/`](./cross-cutting) | Concerns that cut across everything: reliability, observability, security, performance, cost |
| [`decisions/`](./decisions) | ADR log + *"X vs Y, when & why"* trade-off frameworks |
| [`engineering-leadership/`](./engineering-leadership) | The org lens: Conway's law, team topologies, migration playbooks |
| [`reading/`](./reading) | Reading companions that index *into* the topic folders (e.g. [DDIA](./reading/ddia.md)) |

## How it's organized

The notebook separates three different kinds of thing:

- **Knowledge** — `foundations/`, `patterns/`, `algorithms/`, `ai-systems/` (the primitives)
- **Judgment** — `decisions/`, `cross-cutting/` (the lenses you apply when it's your turn to design)
- **Evidence** — `case-studies/` (the primitives, composed in the wild)

`system-design/` is the method that ties them together.

Topics are organized by **concept**, not by source. Books and courses live in
[`reading/`](./reading) as indexes that link into the topic folders — so every concept
has exactly one home.

## Roadmap

A rough order of attack — depth over breadth, one node at a time:

1. **Foundations** — distributed-systems core (replication, consistency, consensus)
2. **Algorithms** — consistent hashing, bloom filters, quorum, merkle trees
3. **System design** — lock in the methodology, then first product teardown
4. **AI systems** — RAG eval, then a LangGraph agent architecture
5. **Case studies** — Uber, Slack, Telegram; then databases & chains
6. **Decisions & cross-cutting** — fill as real trade-offs come up

## Templates

- [ADR template](./decisions/_template.md)
- [Case-study teardown template](./case-studies/_template.md)

## Conventions

- One concept per file. Link related notes liberally.
- Every case study ends with a **Steal / Avoid** section.
- Every non-trivial choice gets an ADR in [`decisions/`](./decisions).
- Diagrams live in [`assets/diagrams/`](./assets/diagrams) and are referenced, not inlined.

## Running the site locally

```bash
pip install -r requirements-docs.txt
mkdocs serve        # http://127.0.0.1:8000
```

Pushes to `main` auto-build and deploy to GitHub Pages via
[`.github/workflows/deploy-docs.yml`](./.github/workflows/deploy-docs.yml).

## Contributing & License

Corrections and new case studies welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).
Licensed under [MIT](./LICENSE).
