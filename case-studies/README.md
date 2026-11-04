# Case Studies

Architecture teardowns of real systems - where theory meets reality. Every study follows
the [template](./_template.md) and ends with a **Steal / Avoid** section; that footer is
the line between a teardown and an architect's note.

- [`products/`](./products) - Uber (geospatial + dispatch), Slack (WebSocket fan-out), Telegram (multi-DC sync), Netflix, Discord, Stripe
- [`databases/`](./databases) - Spanner, Cassandra, DynamoDB, CockroachDB
- [`streaming/`](./streaming) - Kafka, Flink, Pulsar
- [`chains/`](./chains) - Bitcoin, Ethereum, a modern L2
- [`ai/`](./ai) - Perplexity, Cursor, Harvey, Copilot

Each study links *back into* the primitives it uses - [[consistent-hashing]], [[quorum]],
a [[pattern]] - so the notebook reads as one connected graph.
