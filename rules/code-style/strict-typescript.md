---
name: Strict TypeScript
description: TypeScript strict mode, explicit types, no any
category: code-style
tags: [typescript, types, strict]
---

# Strict TypeScript

- Use strict TypeScript config (`"strict": true`)
- Explicit return types on all public/exported functions
- Prefer `interface` for object shapes; `type` for unions/intersections
- Never use `any` — prefer `unknown` with type guards
- `const` over `let`; never `var`
- Template literals over string concatenation
- `??` over `||` for defaults; `?.` for null checks
- `import type` for type-only imports
- Named exports over default exports
