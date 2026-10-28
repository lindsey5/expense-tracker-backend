---
name: code-review
description: Review backend changes for concrete correctness, security, data, and operational risks.
---

# Code review

Use for a requested diff, pull request, or code-path review.

- Read connected callers and tests, not only changed lines. Trace affected data from input through storage and output.
- Check trust boundaries, tenant ownership, coupled writes, compatibility, migration effects, and meaningful test coverage when applicable.
- Report actionable findings with location, severity, and impact. Distinguish an introduced regression from an existing defect; avoid speculative style notes.
