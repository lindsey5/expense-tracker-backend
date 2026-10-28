---
name: error-handling
description: Define backend failure responses that preserve useful context without losing data or exposing secrets.
---

# Error handling

Use when changing exception mapping, failure behavior, or external-call handling.

- Follow the repository's error type and response conventions; distinguish invalid input, missing resources, conflicts, permission failures, and internal failures.
- Preserve the original failure across coupled writes and avoid returning success after a partial operation. Log enough context to diagnose without leaking credentials or private data.
- Test the observed failure path and its side effects. Coordinate request-shape failures with input-validation.
