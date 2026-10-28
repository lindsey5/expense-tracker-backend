---
name: ci-cd
description: Review or change a backend's continuous integration and delivery gates.
---

# CI/CD

Use when changing pipeline stages, dependencies, release conditions, or required checks.

- Find the pipeline entry point and map triggers, permissions, jobs, dependencies, artifacts, and deployment effects before editing.
- Keep untrusted contributions away from publishing and deployment credentials. Verify which checks block a release and which are advisory.
- Run local equivalents of relevant checks when available and review the resulting job graph. Use github-actions only if the pipeline is implemented there.
