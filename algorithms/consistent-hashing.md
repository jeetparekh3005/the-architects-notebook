# Consistent hashing

> **One line:** map keys and nodes onto the same ring so that adding/removing a node
> only remaps `K/N` keys instead of almost all of them.

## The problem it solves

Naive sharding uses `hash(key) % N`. Change `N` (add or lose a node) and *almost every*
key remaps - a full reshuffle and cache stampede. Consistent hashing bounds the churn to
roughly `K/N` keys.

## How it works

1. Hash nodes onto a ring (`0 … 2^m`).
2. Hash each key onto the same ring.
3. A key belongs to the **first node clockwise** from it.
4. Add/remove a node → only keys between it and its predecessor move.

### Virtual nodes

A single point per node gives lumpy load. Give each physical node **V virtual points**
(e.g. 100-200) scattered around the ring → load evens out and removing a node spreads its
keys across many others instead of dumping them all on one neighbor.

## Trade-offs

- Minimal remapping on membership change; smooth scaling.
- Natural fit for replication (walk clockwise to the next R distinct nodes).
- Still needs virtual nodes for balance; hot *keys* aren't solved (that's a different problem).
- Rebalancing bandwidth still real - just bounded.

## Where it shows up

Dynamo/Cassandra partitioning, memcached client rings, CDNs, [[foundations/distributed-systems]]
replication placement, load balancers with sticky routing. See DDIA Ch 6 ([[reading/ddia]]).

## See also

[[quorum]] · [[gossip]] · [[merkle-trees]] (anti-entropy repair in the same systems)
