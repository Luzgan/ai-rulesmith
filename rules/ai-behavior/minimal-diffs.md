---
name: Minimal Diffs
description: Change only what was requested, don't touch surrounding code
category: ai-behavior
tags: [ai-behavior, discipline, diffs]
---

# Minimal Diffs

- Change only what was requested — nothing more
- Don't refactor surrounding code during a bug fix
- Don't add docstrings/comments/types to unchanged code
- Don't rename variables or reorganize imports in files you're not modifying
- Each commit should be reviewable in isolation
