# Database Design Skill

## Purpose

Use this skill to design data models, relationships, indexes, and migration flow.

## Best Practices

- Model ownership explicitly with `userId`.
- Add unique constraints for real business rules.
- Add indexes for common filters.
- Use transactions for multi-step writes.
- Keep migrations reviewable.
- Avoid destructive schema changes without a migration plan.

## Project-Start Checklist

- What entities exist?
- What relationships exist?
- What fields are required?
- What uniqueness rules exist?
- What queries must be fast?
- What happens on delete?

## Common Mistakes

- Missing ownership constraints.
- Forgetting indexes for filtered lists.
- Treating money-like values casually.
- Updating multiple related records outside a transaction.

## Definition Of Done

- Models match business rules.
- Ownership is represented.
- Important queries have indexes.
- Multi-write operations are transaction-safe.
- Migrations are committed.

