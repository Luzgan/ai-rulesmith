---
name: Semantic Versioning
description: Classify commits by semver impact using conventional commit prefixes
category: git
tags: [git, versioning, semver, commits]
---

# Semantic Versioning

- Every commit message must use conventional commit format: `type(scope): description`
- Classify the semver impact of each change:
  - **patch** — `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`, `perf:`, `build:`, `ci:`
  - **minor** — `feat:` (new functionality, backward-compatible)
  - **major** — `feat!:` or any type with `!` suffix, or a `BREAKING CHANGE` footer (incompatible API changes)
- If a commit includes multiple changes, use the highest impact level
- Be explicit: if a refactor changes public API, it's a breaking change, not a refactor
