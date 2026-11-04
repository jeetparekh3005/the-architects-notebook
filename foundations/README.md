# Foundations

The theory the rest of the notebook stands on. Organized by concept; DDIA and other
books index *into* here from [`../reading`](../reading).

- [`data-systems/`](./data-systems) - storage engines (LSM vs B-tree), encoding & schema evolution, data models, indexing. *(DDIA Ch 1-4, 10)*
- [`distributed-systems/`](./distributed-systems) - replication, partitioning, transactions, consistency models, consensus, time & ordering, failure modes. *(DDIA Ch 5-9, and beyond)*
- [`decentralized-systems/`](./decentralized-systems) - the same problems under trustless/adversarial assumptions: BFT & Nakamoto consensus, cryptographic primitives, DLTs & blockchain, finality.

The through-line worth tracking: **consensus is consensus** - Raft in etcd and Tendermint
in a chain solve the same problem under different fault models. Cross-link accordingly.
