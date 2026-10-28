---
name: database-migrations
description: Plan and review schema migrations without assuming a specific database tool.
---

# Database migrations

Use when persistent schema or migration history changes.

- Discover the project's migration tool, configuration, target environments, and review convention before generating or applying anything.
- Inspect the proposed data and schema effects, especially drops, defaults, backfills, locks, and compatibility with old and new application versions.
- Confirm the exact target and backup or recovery process before applying a migration. Use a disposable database for rehearsal when data safety depends on it.
