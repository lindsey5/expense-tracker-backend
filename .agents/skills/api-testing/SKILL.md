---
name: api-testing
description: Test a backend API through its real request and response boundary.
---

# API testing

Use when middleware, routing, parsing, status codes, or serialization matter.

- Use the repository's existing request test client and initialize the same boundary configuration as the running application.
- Cover representative success and error responses, invalid input, missing credentials, and denied access where relevant.
- Stub uncontrolled external services and isolate persistent state. Do not assert boundary validation in a test setup that bypasses it.
