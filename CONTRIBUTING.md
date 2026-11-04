# Contributing

This is primarily a personal working notebook, but corrections, better explanations, and
new case studies are welcome. If something here is wrong, say so — I'd rather be corrected
than confidently mistaken.

## Ways to contribute

- **Fix an error** — a wrong claim, a broken link, a misleading diagram. Open a PR or an issue.
- **Sharpen an explanation** — clarity beats cleverness. If a note didn't click for you, that's a signal.
- **Add a case study** — use the [template](./case-studies/_template.md). Must cite real sources (eng blogs, papers, talks) and end with a **Steal / Avoid** section.
- **Add an ADR** — use the [template](./decisions/_template.md) for a trade-off worth recording.

## Conventions

- **One concept per file.** Don't let a note sprawl across topics.
- **Organize by concept, not by source.** Books and courses are indexes in [`reading/`](./reading) that link *into* the topic folders — every concept has exactly one home.
- **Link liberally.** Cross-reference related notes so the notebook reads as a connected graph.
- **Every case study** ends with **Steal / Avoid**.
- **Every non-trivial choice** gets an ADR in [`decisions/`](./decisions).
- **Diagrams** live in [`assets/diagrams/`](./assets/diagrams) and are referenced, not pasted inline.
- Prefer plain, direct prose. Short sentences. Tables and bullets over walls of text.

## Making a change

1. Fork and branch (`git checkout -b fix/consistent-hashing-typo`).
2. Edit the relevant `.md` file(s).
3. Preview locally if you touched structure or links:
   ```bash
   pip install -r requirements-docs.txt
   mkdocs serve        # http://127.0.0.1:8000
   ```
4. Open a PR with a one-line description of *what* changed and *why*.

## Scope

Not every topic belongs here. This notebook is about **architecture** — the design of
systems and the trade-offs behind them. Language tutorials, framework how-tos, and
LeetCode-style puzzles are out of scope.
