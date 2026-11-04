# Patterns

Reusable solutions at three altitudes. Keeping them separate matters - conflating a
code idiom with an architectural decision is a category error.

- [`code/`](./code) - object/class level: GoF (strategy, factory, observer…), language idioms.
- [`architectural/`](./architectural) - system shape: CQRS, event sourcing, saga, strangler fig, hexagonal/ports-and-adapters, BFF.
- [`distributed/`](./distributed) - coordination under failure: outbox, idempotency keys, leader election, quorum, circuit breaker, bulkhead.

Each pattern note: *problem → solution → when to use → when **not** to → real example.*
