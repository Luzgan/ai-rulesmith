---
name: Small Focused Functions
description: Functions do one thing, under 50 lines, max 3-4 nesting levels
category: code-style
tags: [code-style, functions, complexity]
---

# Small Focused Functions

- Functions do one thing; keep them under 50 lines
- Files under 400 lines; hard limit ~800 lines
- Max nesting depth: 3-4 levels
- Extract only when reused, enables testing, or drastically improves readability
- If a function needs a comment explaining what it does, it's too complex — break it up
