# CI/CD Skill

## Purpose

Use this skill to create reliable automation for testing, building, and deploying.

## Best Practices

- Keep development CI fast.
- Keep production CI stricter.
- Use read-only lint checks in CI.
- Enforce useful coverage gates.
- Build Docker images in production pipelines.
- Use secrets for environment values.

## Project-Start Checklist

- What branches exist?
- Which branch is production?
- What checks block merges?
- What secrets are needed?
- Where will the app deploy?
- How are migrations applied?

## Common Mistakes

- Running slow production work on every dev push.
- Hardcoding secrets in workflow files.
- Using auto-fix lint commands in CI.
- Deploying before tests and migrations are clear.

## Definition Of Done

- Dev and main pipelines are separated.
- CI runs install, lint, tests, and build.
- Production builds an image.
- Secrets are not exposed.
- Deployment has a rollback-aware plan.

