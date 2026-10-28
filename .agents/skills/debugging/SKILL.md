---
name: debugging
description: Investigate an observed backend failure and locate its root cause before changing code.
---

# Debugging

Use for a reproducible error, incorrect result, or failing check.

- Capture the failing input, expected result, actual result, and environment. Reproduce with the narrowest available test or safe local request.
- Trace the request or job across validation, authorization, logic, persistence, and external calls. Compare logs and configuration without exposing secrets.
- Inspect every caller of the failing shared function, fix the common cause, and add a regression check. Separate pre-existing failures from new ones.
