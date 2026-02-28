---
name: Actionable Error Messages
description: Errors include context, cause, and guidance for resolution
category: error-handling
tags: [error-handling, errors, messages]
---

# Actionable Error Messages

- Include context: what failed, why, and with what input
- User-facing errors: tell the user what to do, not just what went wrong
- Include source info when relevant (file path, field name, line number)
- Collect all validation errors before reporting — don't fail on the first one
- Fail fast on unrecoverable errors; never silently swallow errors
- Don't catch just to re-throw without adding value
