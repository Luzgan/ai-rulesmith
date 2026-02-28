---
name: Immutable by Default
description: Create new objects instead of mutating, use readonly types, no side effects
category: code-style
tags: [code-style, immutability, functional]
---

# Immutable by Default

- Create new objects, never mutate existing ones
- Use `readonly`, `Readonly<T>`, `as const` where applicable
- Prefer spread/destructuring over mutation
- Functions return new values, not modify inputs
- Prevents hidden side effects and enables safe concurrency
