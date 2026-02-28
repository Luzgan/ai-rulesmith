---
name: Security Audit
description: Input validation, injection prevention, secret handling, least privilege
category: review
tags: [review, security, audit]
---

# Security Audit

- Validate all input at system boundaries
- Parameterized queries to prevent injection
- Never log credentials, tokens, or PII
- Secrets in env vars, not source code
- Principle of least privilege
- Flag security concerns explicitly — don't assume someone else will catch them
- Watch for: command injection, path traversal, unsafe deserialization, CORS misconfiguration
