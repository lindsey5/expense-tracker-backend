---
name: integration-testing
description: Verify interactions among backend components or persistence that isolated tests cannot prove.
---

# Integration testing

Use for database constraints, transaction rollback, provider wiring, or external integration behavior.

- Inspect the existing harness and choose the smallest real boundary needed. Use a disposable database or a controlled test service when persistent or external state is involved.
- Keep test data isolated and ensure cleanup affects only records the test created. Never point a test at an unconfirmed shared or production target.
- Assert actual cross-component outcomes and failure recovery. Avoid building a general harness for a case that a unit test can prove.
