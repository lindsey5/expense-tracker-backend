# Backend Implementation Skill

## Purpose

Use this skill when implementing services, controllers, DTOs, and module wiring.

## Best Practices

- Implement the smallest complete behavior.
- Validate input at the DTO boundary.
- Keep controllers thin and services testable.
- Check ownership before update/delete.
- Prefer structured APIs over manual parsing.
- Match existing project patterns.

## Project-Start Checklist

- Is there a DTO for each request?
- Is there a response shape?
- Does the service enforce ownership?
- Are all database writes safe?
- Are errors specific enough for clients?

## Common Mistakes

- Trusting frontend-provided `userId`.
- Skipping not-found and unauthorized paths.
- Putting Prisma query logic in controllers.
- Returning raw inconsistent objects.

## Definition Of Done

- Controller delegates to service.
- Service handles business rules.
- DTOs validate request shape.
- Error paths are handled.
- Tests cover the behavior.

