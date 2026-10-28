---
name: authorization
description: Enforce resource ownership and permission checks after identity is established.
---

# Authorization

Use when a backend operation reads or changes protected resources.

- Find the trusted identity or role source and the repository's policy pattern. Never trust an owner or role supplied only by the request.
- Scope reads, counts, updates, deletes, and related-record lookups to the permitted principal. A successful login does not prove access to a resource ID.
- Test allowed and denied principals, including cross-tenant access where the app has tenants. Use api-security for broader exposure review.
