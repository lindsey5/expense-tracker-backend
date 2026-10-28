---
name: devsecops
description: Maintain backend security checks for dependencies, secrets, artifacts, and delivery.
---

# DevSecOps

Use for a security scan, dependency finding, CI credential risk, or supply-chain control.

- Inspect installed scanners, dependency manifests, workflow permissions, and artifact provenance before describing a control as active.
- Separate advisory findings from blocking gates. Verify the exact vulnerable or exposed path and test any dependency update rather than assuming a version bump resolves it.
- Keep credentials out of source, logs, build artifacts, and untrusted jobs. Use api-security for runtime endpoint exposure.
