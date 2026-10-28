---
name: logging-and-monitoring
description: Improve backend diagnostics or monitoring using the observability tools actually present.
---

# Logging and monitoring

Use for logs, metrics, traces, health signals, alerts, or incident diagnosis.

- Inventory the current logging and monitoring path before adding instrumentation; do not assume a collector, dashboard, or alert exists.
- Record enough request or job context to diagnose failures without exposing credentials, personal data, or sensitive payloads. Keep identifiers consistent across relevant components.
- Verify that the signal is emitted and actionable in the target environment. A passing pipeline alone does not prove runtime health.
