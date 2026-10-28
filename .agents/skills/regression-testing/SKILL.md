---
name: regression-testing
description: Capture an observed backend bug in a durable test that fails before the fix.
---

# Regression testing

Use after reproducing a reported defect or unexpected behavior.

- Choose the narrowest test level that includes the failing boundary. Record the input and expected observable outcome before editing the implementation.
- Include side effects for data or money bugs and a denied principal for access bugs. Avoid an assertion that merely repeats the current code.
- Run the test before and after the fix, then run the relevant suite. Report unrelated pre-existing failures separately.
