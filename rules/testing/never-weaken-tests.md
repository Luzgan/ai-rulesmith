---
name: Never Weaken Tests
description: Fix code when tests fail, never weaken assertions to pass
category: testing
tags: [testing, regression, discipline]
---

# Never Weaken Tests

- When a test fails after a code change, the test is probably right — fix the code
- Only modify tests if the change was intended to affect the tested behavior
- Never weaken assertions to make failing tests pass
- Never delete a failing test unless the feature it covers was intentionally removed
- If you're unsure whether a test should change, ask before modifying it
