---
title: Case Study Template
---

# <System> - architecture teardown

- **What it is:** one line.
- **Scale / constraints:** the numbers that shape the design (QPS, data size, latency SLO, geo).
- **Sources:** engineering blogs, papers, talks (linked).

## The problem

What's genuinely hard here? What's the dominant constraint that everything else bends around?

## Architecture

The shape of the system - components, data flow, storage. Reference a diagram in
`assets/diagrams/` rather than inlining a wall of ASCII.

## Key decisions

The 3-5 choices that define this system and why they made them. Link to the relevant
algorithm or pattern note.

## Failure modes & trade-offs

What they gave up, where it bites, how they mitigate it.

## Steal / Avoid

- **Steal:** what generalizes - ideas worth reaching for in your own designs.
- **Avoid:** what's specific to their scale/context and would be cargo-culting elsewhere.
