# Security Skill

## Purpose

Use this skill to protect user data, secrets, auth flows, and production configuration.

## Best Practices

- Never expose secrets in code or workflows.
- Authenticate protected routes.
- Authorize by resource ownership.
- Keep login errors generic.
- Hash passwords before storage.
- Validate all external input.

## Project-Start Checklist

- Which routes are public?
- Which routes require auth?
- Which records belong to a user?
- Where are secrets stored?
- What data should never be returned?

## Common Mistakes

- Checking authentication but not ownership.
- Trusting IDs from request bodies.
- Logging secrets or tokens.
- Hardcoding env values in CI.

## Definition Of Done

- Protected routes use guards.
- Services enforce ownership.
- Secrets are externalized.
- Sensitive fields are not returned.
- Auth errors do not leak details.

