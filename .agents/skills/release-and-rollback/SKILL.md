---
name: release-and-rollback
description: Prepare a backend release and recovery plan from the versioned artifacts and procedures available.
---

# Release and rollback

Use for a release checklist, failed rollout, or recovery procedure.

- Identify the exact artifact version, target environment, deployed version, migration compatibility, and operator-approved rollback mechanism.
- Confirm health criteria and data recovery limits before release. If rollback or backup steps are absent, state the gap and do not invent commands.
- Never replace or roll back a live service without authorization, a verified target, and a plan for data created after deployment.
