---
name: github-actions
description: Edit GitHub Actions workflow syntax, permissions, and job wiring when a repository uses it.
---

# GitHub Actions

Use when the target repository has GitHub Actions workflows to change.

- Read the entry workflow and every called reusable workflow affected by the change. Trace event triggers, conditions, job dependencies, permissions, secrets, and artifacts.
- Check whether forked pull requests or non-release branches can access credentials, publish packages, or deploy. Preserve intended gates and least privilege.
- Validate workflow YAML and action inputs with available tooling. Do not dispatch a workflow or publish an artifact merely to check syntax.
