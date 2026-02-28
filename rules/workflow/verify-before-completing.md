---
name: Verify Before Completing
description: Run linter, type checker, and tests after every change before declaring done
category: workflow
tags: [workflow, verification, quality]
---

# Verify Before Completing

- Run linter, type checker, and tests after every change
- Never declare a task done until verification passes
- If a check fails, fix the issue — don't skip the check
- Automate checks with pre-commit hooks or CI gates
- Build must succeed before merging
