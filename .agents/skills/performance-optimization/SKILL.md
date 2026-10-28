---
name: performance-optimization
description: Improve a measured backend bottleneck while preserving results and resource limits.
---

# Performance optimization

Use when latency, throughput, memory, or query cost is observed to be a problem.

- Measure the slow path with representative data and identify whether work occurs in application code, persistence, network calls, or deployment settings.
- Make the smallest change that addresses the measured cause. Preserve filtering, authorization, ordering, pagination, and error behavior.
- Compare before and after measurements and test output equivalence. Do not claim a gain from code shape or an unrepresentative microbenchmark.
