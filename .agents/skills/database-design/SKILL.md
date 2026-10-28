---
name: database-design
description: Design persistence models, relationships, constraints, and indexes for a backend.
---

# Database design

Use when changing stored entities, fields, relationships, or uniqueness rules.

- Inspect the actual schema, query patterns, and migration history before selecting types or constraints.
- Define ownership, nullability, uniqueness, deletion behavior, and indexes from observed business rules. Consider existing rows and compatibility with deployed code.
- Pair the design with a reviewed migration and affected query, validation, and test changes; do not assume an ORM or database engine.
