# Context Builder

CLI tool to compose AI agent context files from reusable markdown rules.

## Why

Every AI coding agent reads a different file — Claude Code wants `CLAUDE.md`, Cursor wants `.cursorrules`, Copilot wants `.github/copilot-instructions.md`, Codex wants `AGENTS.md`. The rules inside are often the same, but you have to remember the right filename, the right location, and maintain each one separately.

Context Builder solves this the same way ESLint solved linting config: you define your rules once, compose them into the set that fits your project, and the tool generates the right output for each agent. Like ESLint's shareable configs, rules are small, focused atoms — each one enforces a single practice. You pick the ones you need, skip the ones you don't, and override any with your own.

The built-in ruleset ships with 28 rules across 9 categories, distilled from proven patterns found across the AI coding community. But the real value is the model: define once, build for every agent, keep projects consistent without copying and pasting between files you can never remember the name of.

## Install

```bash
npm install -g context-builder
```

This makes `context-builder` (and the short alias `cb`) available globally.

## Quick Start

```bash
# 1. Initialize config in your project
context-builder init

# 2. Edit AI_RULES.json to configure your rules and targets

# 3. Build context files
context-builder build
```

## How It Works

You create an `AI_RULES.json` in your project root. It defines which rules to include and which agents to target. Context Builder composes the rules into the correct output files — one config, multiple agents.

### Standard Workflow

Composes rules sequentially into a single output file:

```json
[
  {
    "target": "Claude Code",
    "ai_workflow": {
      "type": "standard",
      "preamble": "TypeScript ESM project using Vitest for testing. Run `npm test` to run tests, `npm run lint` to lint, `npm run typecheck` to type-check.",
      "rules": [
        "code-style/strict-typescript",
        "testing/isolated-unit-tests",
        "git/conventional-commits"
      ]
    }
  }
]
```

### Steps Workflow

Creates a multi-step workflow where each step gets its own rule file. The main output file instructs the agent to read step-specific files as it progresses:

```json
[
  {
    "target": "Claude Code",
    "ai_workflow": {
      "type": "steps",
      "steps": [
        {
          "step_name": "Create",
          "description": "Implement the feature following coding standards.",
          "rules": ["code-style/strict-typescript", "testing/isolated-unit-tests"]
        },
        {
          "step_name": "Review",
          "description": "Review the implementation for quality and security.",
          "rules": ["review/thorough-code-review", "review/security-audit"]
        }
      ]
    }
  }
]
```

### Multiple Targets

Target multiple agents from a single config. The same rules, different output files:

```json
[
  {
    "target": "Claude Code",
    "ai_workflow": {
      "type": "standard",
      "rules": ["code-style/strict-typescript", "testing/isolated-unit-tests"]
    }
  },
  {
    "target": "Cursor",
    "ai_workflow": {
      "type": "standard",
      "rules": ["code-style/strict-typescript", "testing/isolated-unit-tests"]
    }
  }
]
```

### Config Fields

| Field | Required | Description |
|-------|----------|-------------|
| `target` | Yes | Target name (see Supported Targets) or `"custom"` |
| `target_name` | No | Display name when target is `"custom"` |
| `output_path` | No | Override the default output file path |
| `ai_workflow.type` | Yes | `"standard"` or `"steps"` |
| `ai_workflow.preamble` | No | Text inserted at the top of the output, before rules |
| `ai_workflow.rules` | Yes* | Rule slugs (standard workflow only) |
| `ai_workflow.steps` | Yes* | Array of steps (steps workflow only) |
| `ai_workflow.steps[].step_name` | Yes | Step label |
| `ai_workflow.steps[].description` | No | Short description of the step |
| `ai_workflow.steps[].rules` | Yes | Rule slugs for this step |

## Supported Targets

| Target | Output File | Step Files |
|--------|------------|------------|
| `Claude Code` | `CLAUDE.md` | `.context-builder/steps/` |
| `Cursor` | `.cursorrules` | `.cursor/rules/` |
| `GitHub Copilot` | `.github/copilot-instructions.md` | `.github/instructions/` |
| `Windsurf` | `.windsurfrules` | `.windsurf/rules/` |
| `Codex` | `AGENTS.md` | `.context-builder/steps/` |
| `Generic` | `AGENTS.md` | `.context-builder/steps/` |
| `custom` | (set `output_path`) | `.context-builder/steps/` |

## Built-in Rules

Rules are small, focused atoms — like ESLint rules. Each one enforces a single practice. You compose them into the set that fits your project.

Rules are referenced by slug (e.g., `"code-style/strict-typescript"`). Run `context-builder list-rules` to see all available rules.

| Slug | Description |
|------|-------------|
| `ai-behavior/clarify-dont-assume` | Ask for clarification on ambiguity, state assumptions, present alternatives |
| `ai-behavior/confirm-destructive-actions` | Pause and confirm before deleting, overwriting, or running irreversible commands |
| `ai-behavior/minimal-diffs` | Change only what was requested, don't touch surrounding code |
| `architecture/solid-principles` | Single responsibility, open/closed, Liskov, interface segregation, dependency inversion |
| `code-style/comments-explain-why-not-what` | Comment non-obvious decisions, not obvious code |
| `code-style/consistent-project-structure` | Organize by feature/domain, colocate related files, flat over nested |
| `code-style/descriptive-naming` | Names convey purpose with consistent casing conventions |
| `code-style/early-returns-and-guards` | Check preconditions first, return early, keep logic flat |
| `code-style/immutable-by-default` | Create new objects instead of mutating, use readonly types, no side effects |
| `code-style/no-hardcoded-values` | Named constants, config files, env vars — no magic numbers or strings |
| `code-style/prefer-functional-style` | Functional and declarative patterns over classes, composition over inheritance |
| `code-style/small-focused-functions` | Functions do one thing, under 50 lines, max 3-4 nesting levels |
| `code-style/strict-typescript` | Strict config, explicit types, no any, const over let |
| `error-handling/actionable-error-messages` | Errors include context, cause, and guidance for resolution |
| `error-handling/typed-errors` | Custom error types, structured API responses, error codes for programmatic handling |
| `git/conventional-commits` | Structured commit messages with type, scope, and meaningful descriptions |
| `git/feature-branch-workflow` | Branch before changes, merge when green |
| `review/security-audit` | Input validation, injection prevention, secret handling, least privilege |
| `review/thorough-code-review` | Trace logic, check edge cases, verify error handling and naming |
| `security/never-expose-secrets` | Keep credentials, tokens, and PII out of logs, errors, and source code |
| `security/validate-external-input` | Validate all external input at system boundaries before processing |
| `testing/isolated-unit-tests` | Independent tests with mocked deps, clear assertions, and boundary coverage |
| `testing/never-weaken-tests` | Fix code when tests fail, never weaken assertions to pass |
| `testing/prefer-integration-tests` | Integration tests over heavy mocking, test real behavior with real dependencies |
| `workflow/incremental-changes` | Small shippable increments, commit after each chunk, each passes tests |
| `workflow/test-driven-development` | Red-green-refactor cycle, test first, simplest case first |
| `workflow/understand-before-changing` | Read existing code, identify patterns and blast radius before modifying |
| `workflow/verify-before-completing` | Run linter, type checker, and tests after every change before declaring done |

## Custom Rules

Create custom rules in your project at `.context-builder/rules/<category>/<name>.md`. Custom rules override built-in rules with the same slug, so you can replace any built-in rule with your own version.

Rule files are plain markdown with optional YAML frontmatter:

```markdown
---
name: My Custom Rule
description: What this rule enforces
category: my-category
tags: [custom, example]
---

# My Custom Rule

- Rule content here
- Another guideline
```

## CLI Commands

### `context-builder build`

Compose rules into output files. This is the default command.

```bash
context-builder build                    # Build all targets
context-builder build -t "Claude Code"   # Build specific target
context-builder build --dry-run          # Preview only
context-builder build --force            # Overwrite without confirmation
context-builder build --no-preview       # Skip terminal preview
context-builder build -c ./custom.json   # Use custom config path
```

### `context-builder init`

Scaffold a starter `AI_RULES.json`:

```bash
context-builder init
context-builder init --target "Cursor"
context-builder init --workflow steps
```

### `context-builder preview`

Preview composed output in the terminal without writing files:

```bash
context-builder preview
context-builder preview -t "Claude Code"
```

### `context-builder validate`

Validate config and check all referenced rules exist:

```bash
context-builder validate
```

### `context-builder list-rules`

List available rules:

```bash
context-builder list-rules
context-builder list-rules --built-in
context-builder list-rules --custom
context-builder list-rules --category code-style
```

### `context-builder list-targets`

List supported targets and their output paths:

```bash
context-builder list-targets
```

## Contributing

The built-in ruleset is a starting point. If you have a rule that works well across your projects, consider contributing it. Good rules are:

- **Focused** — one practice per rule, not a checklist of everything
- **Universal** — applies across languages and frameworks, not tied to a specific stack
- **Descriptive** — the slug tells you exactly what the rule enforces
- **Actionable** — concrete guidelines, not vague principles

New categories, new rules, and improvements to existing ones are all welcome. The goal is a community-maintained library of proven patterns that anyone can compose into their own AI workflow.

## Acknowledgments

The built-in rules are informed by proven patterns found across the AI coding community:

- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) by PatrickJS
- [ai-coding-rules](https://github.com/SabrinaRamonov/ai-coding-rules) by Sabrina Ramonov
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) by Affaan M
- [claude-code-config](https://github.com/trailofbits/claude-code-config) by Trail of Bits
- [cursor.directory](https://cursor.directory) community rules
- [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) by HumanLayer
- [How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/) by Addy Osmani
- [How to write rules for AI](https://virtuslab.com/blog/ai/how-to-write-rules-for-ai/) by VirtusLab
- [Top Cursor Rules](https://www.prompthub.us/blog/top-cursor-rules-for-coding-agents) by PromptHub

## License

MIT
