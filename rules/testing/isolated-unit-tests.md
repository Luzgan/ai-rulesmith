---
name: Isolated Unit Tests
description: Independent tests with mocked deps, clear assertions, and boundary coverage
category: testing
tags: [testing, unit-tests, isolation]
---

# Isolated Unit Tests

- Arrange-Act-Assert pattern
- One logical assertion per test
- Test names describe behavior: `[unit] [scenario] [expected result]`
- Mock external deps; each test independent; no shared state leaks
- Test boundary values, edge cases, error paths
- Test public API surface, not internals
- Keep fixtures minimal — only data relevant to the test
