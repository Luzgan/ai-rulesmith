---
name: Never Expose Secrets
description: Keep credentials, tokens, and PII out of logs, errors, and source code
category: security
tags: [security, secrets, credentials]
---

# Never Expose Secrets

- Never log credentials, tokens, API keys, or PII in any log level
- Never include secrets in error messages, stack traces, or API responses
- Store secrets in environment variables or secure vaults — never in source code or config files committed to git
- Sanitize data before including in user-visible output
- Review CI/CD pipelines for accidental secret exposure in build logs
