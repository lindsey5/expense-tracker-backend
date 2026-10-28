---
name: docker
description: Change Docker image builds or Compose services when a backend uses Docker.
---

# Docker

Use when the target repository builds a Docker image or defines Compose services.

- Inspect build context, stages, ignored files, generated assets, runtime command, ports, and service dependencies before editing.
- Keep secrets outside images and make runtime configuration explicit through the project's established mechanism. Verify each service starts the intended process.
- Build and start an isolated local image only when the required tooling and safe test configuration are available. Do not assume a database container or worker exists.
