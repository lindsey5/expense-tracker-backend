# API Design Skill

## Purpose

Use this skill to design predictable, stable, client-friendly APIs.

## Best Practices

- Use resource-based routes.
- Keep request and response DTOs explicit.
- Make pagination consistent.
- Use stable operation aliases for generated clients.
- Keep response shapes predictable.
- Return useful errors without leaking sensitive details.

## Project-Start Checklist

- What are the API resources?
- Which endpoints are public?
- Which endpoints require auth?
- What is the request body for each endpoint?
- What is the response body for each endpoint?
- Which endpoints need pagination, sorting, or filtering?

## Common Mistakes

- Returning different shapes for similar endpoints.
- Mixing strings and numbers for query values without transformation.
- Forgetting generated client compatibility.
- Changing API contracts without updating frontend clients.

## Definition Of Done

- Routes are named consistently.
- DTOs describe all request and response shapes.
- Auth requirements are clear.
- API aliases are stable.
- Frontend usage is considered.

