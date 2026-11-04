# System Design

The *method*, not a dumping ground for topics (those live in [`../foundations`](../foundations)
and [`../patterns`](../patterns)). This is how to approach any design problem under
constraints.

Planned:

- [ ] **The framework** - requirements → estimation → API → data model → high-level design → bottlenecks → deep-dive
- [ ] **Back-of-the-envelope** - the numbers every engineer should know (latency, QPS, storage)
- [ ] **Component catalog** - load balancer, cache, CDN, message queue, API gateway, blob store: what each buys and costs
- [ ] **Scaling playbook** - vertical → horizontal → sharding → caching → async
- [ ] **Trade-off reasoning** - consistency vs. availability, latency vs. throughput, cost vs. resilience

Worked designs (URL shortener, rate limiter, newsfeed, chat) live here; full teardowns of
*real* systems live in [`../case-studies`](../case-studies).
