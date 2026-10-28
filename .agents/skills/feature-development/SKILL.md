---
name: feature-development
description: Add a backend capability through the repository's existing interfaces, layers, and tests.
---

# Feature development

Use when adding a route, job, event, or domain behavior.

- Trace the closest existing feature from entry point through validation, business logic, persistence, and tests. Register new components only where the framework requires them.
- Define the public contract and check its callers before changing request or response shapes. Apply authentication and ownership rules where data is user-owned.
- Add focused coverage for success and meaningful failures, then run the discovered checks.
