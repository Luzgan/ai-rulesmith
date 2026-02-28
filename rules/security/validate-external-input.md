---
name: Validate External Input
description: Validate all external input at system boundaries before processing
category: security
tags: [security, validation, input]
---

# Validate External Input

- Validate all external input at system boundaries (API params, file paths, user input, webhook payloads)
- Validate file paths to prevent path traversal — reject `..` segments, resolve to expected base directory
- Never execute user-provided strings as code or shell commands without sanitization
- Whitelist acceptable values where possible rather than blacklisting dangerous ones
- Validate early, before the data is passed deeper into the system
