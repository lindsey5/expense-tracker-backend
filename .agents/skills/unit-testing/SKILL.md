---
name: unit-testing
description: Write isolated backend tests for logic that can be verified with controlled dependencies.
---

# Unit testing

Use for a changed function, service, helper, or pure rule with a small dependency boundary.

- Find the installed test framework and nearby test conventions. Mock only external collaborators needed to isolate the behavior.
- Assert observable results and meaningful failures, including calls that enforce ownership or data integrity when those calls are the unit's responsibility.
- Run the narrow test and the project's relevant suite. Do not treat mocked transactions or repositories as proof of real persistence behavior.
