---
name: environment-management
description: Manage backend configuration names, defaults, and secret flow across environments.
---

# Environment management

Use when adding or changing a configuration value or secret.

- Find every read of the value and the repository's example, test, CI, container, and deployment configuration before editing.
- Define safe defaults only where the application permits them. Keep required values validated at startup and avoid logging or committing secret contents.
- Update only the environments that actually use the value, and test the missing or invalid configuration path when it can cause data loss or exposure.
