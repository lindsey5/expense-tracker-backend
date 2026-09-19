# Architecture Skill

## Purpose

Use this skill to choose the project structure, module boundaries, and dependency direction before implementation.

## Best Practices

- Group code by domain or feature.
- Keep controllers thin.
- Put business logic in services.
- Keep DTOs close to the API boundary.
- Avoid shared utility code until duplication is real.
- Keep infrastructure concerns separate from business rules.

## Project-Start Checklist

- What modules are needed?
- Which module owns each resource?
- Which services need database access?
- Which code should be shared?
- What should remain private to a module?

## Common Mistakes

- Creating generic modules too early.
- Mixing controller logic with business rules.
- Letting one service own too many unrelated concerns.
- Creating circular dependencies.

## Definition Of Done

- Modules have clear ownership.
- Dependency direction is understandable.
- Shared code is minimal and justified.
- Future features have an obvious place to live.

