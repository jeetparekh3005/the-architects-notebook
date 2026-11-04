# The Architect's Notebook

[![Deploy docs](https://github.com/jeetparekh3005/the-architects-notebook/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/jeetparekh3005/the-architects-notebook/actions/workflows/deploy-docs.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Read it as a site: <https://jeetparekh3005.github.io/the-architects-notebook/>

A working notebook on software architecture: patterns, algorithms, and the design of
scalable systems, with real-world case studies and the trade-offs behind every decision.

It spans the full altitude of architectural thinking, from code-level patterns to
distributed and decentralized systems, alongside the practice of it: a system-design
methodology, real-world case studies (each ending in *what to steal, what to avoid*),
cross-cutting concerns, and a decision log. It grows with whatever I'm building.

## Map

| Area | What lives here |
|------|-----------------|
| [Foundations](./foundations) | Theory: [data systems](./foundations/data-systems), [distributed systems](./foundations/distributed-systems), [decentralized systems](./foundations/decentralized-systems) (DLTs, blockchain, BFT) |
| [Patterns](./patterns) | Three altitudes: [code](./patterns/code) (GoF), [architectural](./patterns/architectural) (CQRS, saga, hexagonal), [distributed](./patterns/distributed) (outbox, idempotency) |
| [Algorithms](./algorithms) | The toolbox: consistent hashing, bloom filters, HyperLogLog, CRDTs, merkle trees, consensus |
| [System Design](./system-design) | The method: estimation, component catalog, how to approach any design |
| [AI Systems](./ai-systems) | RAG, agents, extraction, agentic data, NL business rules, LLMOps, AI patterns |
| [Case Studies](./case-studies) | Architecture teardowns of real systems, each ending in *steal / avoid* |
| [Cross-Cutting](./cross-cutting) | Reliability, observability, security, performance, cost |
| [Decisions](./decisions) | ADR log and *X vs Y, when and why* trade-off frameworks |
| [Engineering Leadership](./engineering-leadership) | Conway's law, team topologies, migration playbooks |
| [Reading](./reading) | Companions that index into the topic folders (e.g. [DDIA](./reading/ddia.md)) |

## How it's organized

The notebook separates three kinds of thing, and `system-design/` is the method that
ties them together:

- **Knowledge** that teaches the primitives: `foundations/`, `patterns/`, `algorithms/`, `ai-systems/`
- **Judgment** you apply when designing: `decisions/`, `cross-cutting/`
- **Evidence** of the primitives composed in the wild: `case-studies/`

Topics are organized by concept, not by source. Books live in [`reading/`](./reading) as
indexes that link into the topic folders, so every concept has exactly one home.

## Conventions

- One concept per file; link related notes liberally.
- Every case study ends with a **Steal / Avoid** section ([template](./case-studies/_template.md)).
- Every non-trivial choice gets an ADR in [`decisions/`](./decisions) ([template](./decisions/_template.md)).
- Diagrams live in [`assets/diagrams/`](./assets/diagrams) and are referenced, not inlined.

## Roadmap

Depth over breadth, one node at a time: foundations (replication, consensus) and the core
algorithms first, then the system-design method and a first product teardown, then AI
systems. Decisions and cross-cutting fill in as real trade-offs come up.

---

Run the site locally with `pip install -r requirements-docs.txt && mkdocs serve`; pushes
to `main` auto-deploy via [GitHub Actions](./.github/workflows/deploy-docs.yml).
Contributions welcome ([CONTRIBUTING](./CONTRIBUTING.md)) under the [MIT](./LICENSE) license.
