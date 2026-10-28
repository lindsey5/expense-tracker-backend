---
name: backend-conventions
description: Match a backend repository's established layout and checks during routine code changes.
---

# Backend conventions

Use for ordinary backend edits that should follow local patterns.

- Read the manifest, entry points, nearby feature, and repository instructions before choosing a file or abstraction.
- Keep request handling, domain behavior, persistence, and shared utilities in the layers the project already uses. Reuse local helpers and avoid editing generated output.
- Find the project's non-rewriting lint, test, and build checks; run those relevant to the edit.
