# AI Rulesmith

CLI tool to compose AI agent context files from reusable markdown rules.

## Why

Every AI coding agent reads a different file — Claude Code wants `CLAUDE.md`, Cursor wants `.cursorrules`, Copilot wants `.github/copilot-instructions.md`, Codex wants `AGENTS.md`. The rules inside are often the same, but you have to remember the right filename, the right location, and maintain each one separately.

AI Rulesmith solves this the same way ESLint solved linting config: you define your rules once, compose them into the set that fits your project, and the tool generates the right output for each agent. Like ESLint's shareable configs, rules are small, focused atoms — each one enforces a single practice. You pick the ones you need, skip the ones you don't, and override any with your own.

The built-in ruleset ships with 28 rules across 9 categories, distilled from proven patterns found across the AI coding community. But the real value is the model: define once, build for every agent, keep projects consistent without copying and pasting between files you can never remember the name of.

## Install

```bash
npm install -g ai-rulesmith
```

This makes `ai-rulesmith` (and aliases `rulesmith`, `cb`) available globally.

## Quick Start

```bash
# 1. Initialize config in your project
rulesmith init

# 2. Edit AI_RULES.json to configure your rules and targets

# 3. Build context files
rulesmith build
```

## How It Works

You create an `AI_RULES.json` in your project root. It defines which rules to include and which agents to target. AI Rulesmith composes the rules into the correct output files — one config, multiple agents.

### Standard Workflow

Composes rules sequentially into a single output file:

```json
[
  {
    "target": "Claude Code",
    "ai_workflow": {
      "type": "standard",
      "preamble": "TypeScript ESM project using Vitest for testing.",
      "before_start": ["workflow/understand-before-changing"],
      "rules": [
        "code-style/strict-typescript",
        "testing/isolated-unit-tests"
      ],
      "before_finish": ["workflow/verify-before-completing", "git/conventional-commits"]
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
      "before_start": ["workflow/understand-before-changing", "git/feature-branch-workflow"],
      "before_finish": ["workflow/verify-before-completing", "git/conventional-commits"],
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
| `ai_workflow.before_start` | No | Rules placed in a "Before You Start" section (see Priority Zones) |
| `ai_workflow.before_finish` | No | Rules placed in a "Before You Finish" section (see Priority Zones) |
| `ai_workflow.rules` | Yes* | Rule slugs or rule objects with variables (standard workflow only) |
| `ai_workflow.steps` | Yes* | Array of steps (steps workflow only) |
| `ai_workflow.steps[].step_name` | Yes | Step label |
| `ai_workflow.steps[].description` | No | Short description of the step |
| `ai_workflow.steps[].rules` | Yes | Rule slugs or rule objects with variables for this step |
| `ai_workflow.steps[].before_start` | No | Additional per-step "Before You Start" rules (merged with workflow-level) |
| `ai_workflow.steps[].before_finish` | No | Additional per-step "Before You Finish" rules (merged with workflow-level) |

### Priority Zones

LLMs pay most attention to instructions at the **beginning and end** of their context, with the middle being a lower-attention zone. Priority zones let you control where rules appear in the generated output so that critical behavioral rules aren't buried among coding standards.

- **`before_start`** — Rules placed at the **top** of each step file (or the output file for standard workflows), under a "Before You Start" heading. Use for rules the agent must follow before writing any code: understanding the codebase, creating a branch, confirming approach.
- **`before_finish`** — Rules placed at the **bottom**, under a "Before You Finish" heading. Use for rules the agent must follow after implementation: running tests, committing with conventional format, updating project trackers.
- **`rules`** — Everything in between. Technical coding standards, error handling patterns, testing conventions.

Workflow-level `before_start`/`before_finish` apply to **every step**. Per-step `before_start`/`before_finish` add step-specific rules (merged after the workflow-level ones).

## Supported Targets

| Target | Output File | Step Files |
|--------|------------|------------|
| `Claude Code` | `CLAUDE.md` | `.rulesmith/steps/` |
| `Cursor` | `.cursorrules` | `.cursor/rules/` |
| `GitHub Copilot` | `.github/copilot-instructions.md` | `.github/instructions/` |
| `Windsurf` | `.windsurfrules` | `.windsurf/rules/` |
| `Codex` | `AGENTS.md` | `.rulesmith/steps/` |
| `Generic` | `AGENTS.md` | `.rulesmith/steps/` |
| `custom` | (set `output_path`) | `.rulesmith/steps/` |

## Built-in Rules

Rules are small, focused atoms — like ESLint rules. Each one enforces a single practice. You compose them into the set that fits your project.

Rules are referenced by slug (e.g., `"code-style/strict-typescript"`). Run `rulesmith list-rules` to see all available rules.

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

Rules are resolved in order: **project → global → built-in**. A rule at a higher level overrides the same slug at a lower level.

| Level | Location | Scope |
|-------|----------|-------|
| Project | `.rulesmith/rules/<category>/<name>.md` | This project only |
| Global | `~/.config/rulesmith/rules/<category>/<name>.md` | All your projects |
| Built-in | Shipped with the package | Everyone |

Global rules are useful for personal or company-wide standards you want across all projects without copying files. Project rules override global rules with the same slug if you need a project-specific variant.

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

## Rule Variables

Rules can declare `{{variables}}` that get filled in from your config. This lets you write reusable rules that adapt to each project — for example, a "track progress" rule that takes the project name as a variable.

### Declaring variables in a rule

Add a `vars` section to the frontmatter. Each variable can have a description, a `required` flag, and a `default` value:

```markdown
---
name: Track Project Progress
description: Update project tracker after completing tasks
vars:
  project_name:
    description: Name of the project in the tracker
    required: true
  tracker:
    description: Which tracker to use
    default: life_manager
---

# Track Project Progress

- After completing a task, update the **{{project_name}}** project in {{tracker}}
```

### Providing values in config

Instead of a plain slug string, use an object with `slug` and `vars`:

```json
{
  "rules": [
    "code-style/strict-typescript",
    {
      "slug": "workflow/track-project-progress",
      "vars": {
        "project_name": "My App"
      }
    }
  ]
}
```

Variables with a `default` in the rule frontmatter don't need to be provided — the default is used automatically. Variables marked `required: true` will error if not provided.

## CLI Commands

### `rulesmith build`

Compose rules into output files. This is the default command.

```bash
rulesmith build                    # Build all targets
rulesmith build -t "Claude Code"   # Build specific target
rulesmith build --dry-run          # Preview only
rulesmith build --force            # Overwrite without confirmation
rulesmith build --no-preview       # Skip terminal preview
rulesmith build -c ./custom.json   # Use custom config path
```

### `rulesmith init`

Scaffold a starter `AI_RULES.json`:

```bash
rulesmith init
rulesmith init --target "Cursor"
rulesmith init --workflow steps
```

### `rulesmith preview`

Preview composed output in the terminal without writing files:

```bash
rulesmith preview
rulesmith preview -t "Claude Code"
```

### `rulesmith validate`

Validate config and check all referenced rules exist:

```bash
rulesmith validate
```

### `rulesmith list-rules`

List available rules:

```bash
rulesmith list-rules
rulesmith list-rules --built-in
rulesmith list-rules --custom
rulesmith list-rules --category code-style
```

### `rulesmith list-targets`

List supported targets and their output paths:

```bash
rulesmith list-targets
```

### `rulesmith test`

Run scenario tests to verify your rules actually influence agent behavior. Uses an LLM to simulate scenarios and a judge model to evaluate whether assertions pass:

```bash
rulesmith test                           # Run all scenarios
rulesmith test --scenario "follows step" # Run matching scenarios
rulesmith test --target "Claude Code"    # Filter by target
rulesmith test --verbose                 # Show full LLM responses
rulesmith test --reset-keys              # Re-prompt for API keys
```

Test scenarios are defined in `AI_RULES.test.json`:

```json
{
  "models": ["anthropic/sonnet"],
  "judge": "anthropic/haiku",
  "scenarios": [
    {
      "name": "Agent follows step workflow",
      "target": "Claude Code",
      "prompt": "Add a new CLI command called 'stats'.",
      "assertions": [
        "Response mentions reading the rules file before starting",
        "Response does not immediately start writing code"
      ]
    }
  ]
}
```

Models can use shorthand aliases like `"anthropic/sonnet"` or full IDs like `"claude-sonnet-4-20250514"`. API keys are resolved from environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) or prompted interactively and saved to the macOS Keychain.

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
