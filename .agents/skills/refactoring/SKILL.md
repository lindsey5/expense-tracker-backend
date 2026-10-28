---
name: refactoring
description: Change backend structure while preserving behavior and public contracts.
---

# Refactoring

Use when simplifying or moving code without an intended behavior change.

- Map callers, tests, configuration, registration, and exports before moving logic. Keep validation, error handling, and authorization intact.
- Prefer the smallest deletion or local consolidation that removes the duplication; avoid new layers solely for future flexibility.
- Compare observable results and failure behavior before and after, then run the project's relevant checks.
