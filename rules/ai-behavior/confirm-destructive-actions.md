---
name: Confirm Destructive Actions
description: Pause and confirm before deleting, overwriting, or running irreversible commands
category: ai-behavior
tags: [ai-behavior, safety, destructive]
---

# Confirm Destructive Actions

- Confirm before deleting files, overwriting work, or running destructive commands (force push, reset --hard)
- Don't make changes beyond what was requested — a bug fix doesn't need surrounding code refactored
- If the task is larger than expected, pause and discuss before continuing
- Investigate unexpected state (unfamiliar files, branches, configs) before modifying it
- If an action cannot be undone, say so explicitly when asking for confirmation
