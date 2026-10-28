---
name: input-validation
description: Validate untrusted request shape and values at a backend boundary.
---

# Input validation

Use for request fields, types, ranges, formats, coercion, or unknown properties.

- Locate the actual transport boundary and validation library before adding rules. Apply runtime validation to untrusted input rather than relying on types alone.
- Keep required fields, allowed values, parsing, and API documentation aligned; reject or strip unknown input according to the project's established policy.
- Test malformed, missing, and boundary values. Use data-validation for rules that depend on stored state or concurrent writes.
