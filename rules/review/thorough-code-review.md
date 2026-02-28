---
name: Thorough Code Review
description: Trace logic, check edge cases, verify error handling and naming
category: review
tags: [review, code-quality, verification]
---

# Thorough Code Review

- Trace logic for key scenarios — does the code actually do what it claims?
- Edge cases handled? (empty input, null, boundary values, concurrent access)
- Error paths handled gracefully — not silently swallowed?
- Names descriptive and consistent with the rest of the codebase?
- No unnecessary abstractions or over-engineering?
- Tests present for new behavior?
- No new warnings or type errors introduced?
