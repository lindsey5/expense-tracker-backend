---
name: api-design
description: Design or change a backend API contract using the repository's established interface style.
---

# API design

Use when adding or changing a public operation, request, or response.

- Inspect existing routes or handlers, API documentation, consumers, and versioning rules before choosing names or shapes.
- Keep the handler's transport work separate from business behavior. Define success, validation failures, authentication, and error responses consistently with neighboring operations.
- Update contract documentation and focused boundary tests when an externally visible shape or status changes. Use authorization for resource access rules.
