---
name: Early Returns and Guards
description: Validate inputs first, fail early, keep logic flat
category: code-style
tags: [guards, early-return, readability]
---

# Early Returns and Guards

- Check preconditions at the top of functions: null, invalid state, out-of-range values
- Return early or throw immediately on invalid input — don't nest the happy path inside if-else
- Each guard clause handles one condition and exits (return/throw) — keeps logic flat
- Reduces indentation depth — the main logic runs at the shallowest nesting level
- Eliminates `else` blocks by handling the negative case first and returning
