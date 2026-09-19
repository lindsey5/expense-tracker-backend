# Testing Skill

## Purpose

Use this skill to build confidence through unit, controller, and e2e tests.

## Best Practices

- Test business logic at the service level.
- Mock database access in unit tests.
- Test controller delegation separately.
- Use e2e tests for route wiring and HTTP behavior.
- Cover success, failure, and edge cases.
- Keep tests deterministic.

## Project-Start Checklist

- What logic can fail?
- What branches need coverage?
- Which dependencies should be mocked?
- Which tests need HTTP requests?
- Which tests need a real database, if any?

## Common Mistakes

- Testing implementation details instead of behavior.
- Using a real database for simple unit tests.
- Forgetting failure paths.
- Making coverage high but low-value.

## Definition Of Done

- Core logic has unit tests.
- Controllers have delegation tests.
- Important routes have e2e tests.
- Tests are fast and repeatable.
- Coverage reflects meaningful behavior.

