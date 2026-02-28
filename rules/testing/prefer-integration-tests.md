---
name: Prefer Integration Tests
description: Integration tests over heavy mocking, test real behavior with real dependencies
category: testing
tags: [testing, integration, mocking]
---

# Prefer Integration Tests

- Prefer integration tests over heavy mocking
- Separate pure-logic unit tests from IO/DB integration tests
- Test real behavior with real dependencies where practical
- Heavy mocking hides real bugs and couples tests to internals
- Use mocks only for external services you don't control
