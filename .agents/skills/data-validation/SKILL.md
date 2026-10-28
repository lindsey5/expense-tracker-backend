---
name: data-validation
description: Enforce persisted business invariants that request validation cannot prove.
---

# Data validation

Use when validity depends on existing records, relationships, or concurrent writes.

- Identify the invariant and its authoritative source. Check ownership and state in the service or data layer, and use a database constraint where concurrency requires one.
- Handle constraint failures as expected domain outcomes rather than relying only on a pre-write lookup.
- Test valid state, invalid state, and a race or duplicate case when the invariant can be contested. Use input-validation for request shape.
