---
name: transactions-and-integrity
description: Keep related persistent writes consistent when a backend operation spans records.
---

# Transactions and integrity

Use when one business action changes multiple records or derived totals.

- Identify every write and the invariant that must hold if any step fails. Use the repository's supported transaction mechanism for coupled writes.
- Check ownership and preconditions within a safe concurrency boundary; do not assume a read before a write prevents races.
- Test rollback and retry behavior where supported. For financial state, verify the source record and balance or aggregate together.
