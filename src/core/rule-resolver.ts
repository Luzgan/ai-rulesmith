import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import matter from 'gray-matter';
import type { ResolvedRule, RuleFrontmatter, RuleListEntry } from '../types/rule.types.js';
import type { RuleEntry } from '../types/config.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getBuiltInRulesDir(): string {
  return resolve(__dirname, '..', '..', '..', 'rules');
}

function getGlobalRulesDir(): string {
  return resolve(homedir(), '.config', 'rulesmith', 'rules');
}

function getCustomRulesDir(projectDir: string): string {
  return resolve(projectDir, '.context-builder', 'rules');
}

export function resolveRule(slug: string, projectDir: string): ResolvedRule {
  const customPath = join(getCustomRulesDir(projectDir), `${slug}.md`);
  const globalPath = join(getGlobalRulesDir(), `${slug}.md`);
  const builtInPath = join(getBuiltInRulesDir(), `${slug}.md`);

  let filePath: string;
  if (existsSync(customPath)) {
    filePath = customPath;
  } else if (existsSync(globalPath)) {
    filePath = globalPath;
  } else if (existsSync(builtInPath)) {
    filePath = builtInPath;
  } else {
    throw new Error(
      `Rule not found: "${slug}"\n  Checked:\n    ${customPath}\n    ${globalPath}\n    ${builtInPath}`
    );
  }

  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const frontmatter: RuleFrontmatter | null =
    Object.keys(data).length > 0 ? (data as RuleFrontmatter) : null;

  return {
    slug,
    filePath,
    frontmatter,
    content: content.trim(),
  };
}

function normalizeRuleEntry(entry: RuleEntry): { slug: string; vars: Record<string, string> } {
  if (typeof entry === 'string') {
    return { slug: entry, vars: {} };
  }
  return { slug: entry.slug, vars: entry.vars ?? {} };
}

export function applyVariables(rule: ResolvedRule, vars: Record<string, string>): ResolvedRule {
  const declared = rule.frontmatter?.vars ?? {};

  // Build final values: defaults first, then provided vars
  const finalVars: Record<string, string> = {};
  for (const [name, def] of Object.entries(declared)) {
    if (vars[name] !== undefined) {
      finalVars[name] = vars[name];
    } else if (def.default !== undefined) {
      finalVars[name] = def.default;
    } else if (def.required) {
      throw new Error(
        `Rule "${rule.slug}" requires variable "{{${name}}}" but it was not provided.\n  Add it to your AI_RULES.json: { "slug": "${rule.slug}", "vars": { "${name}": "..." } }`
      );
    }
  }

  // Replace {{varName}} placeholders in content
  let content = rule.content;
  for (const [name, value] of Object.entries(finalVars)) {
    content = content.replaceAll(`{{${name}}}`, value);
  }

  return { ...rule, content };
}

export function resolveRules(entries: RuleEntry[], projectDir: string): ResolvedRule[] {
  const errors: string[] = [];
  const resolved: ResolvedRule[] = [];

  for (const entry of entries) {
    try {
      const { slug, vars } = normalizeRuleEntry(entry);
      const rule = resolveRule(slug, projectDir);
      resolved.push(Object.keys(vars).length > 0 ? applyVariables(rule, vars) : rule);
    } catch (err) {
      errors.push((err as Error).message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to resolve rules:\n${errors.join('\n')}`);
  }

  return resolved;
}

function collectSlugs(dir: string, prefix: string = ''): string[] {
  if (!existsSync(dir)) return [];

  const slugs: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      slugs.push(...collectSlugs(fullPath, prefix ? `${prefix}/${entry}` : entry));
    } else if (entry.endsWith('.md')) {
      const name = entry.replace(/\.md$/, '');
      slugs.push(prefix ? `${prefix}/${name}` : name);
    }
  }

  return slugs;
}

function collectEntries(
  slugs: string[],
  projectDir: string,
  source: RuleListEntry['source'],
  seen: Set<string>,
): RuleListEntry[] {
  const entries: RuleListEntry[] = [];

  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    const rule = resolveRule(slug, projectDir);
    entries.push({
      slug,
      name: rule.frontmatter?.name ?? slugToTitle(slug),
      description: rule.frontmatter?.description ?? '',
      category: rule.frontmatter?.category ?? slug.split('/')[0],
      source,
    });
  }

  return entries;
}

export function listAvailableRules(projectDir: string): RuleListEntry[] {
  const customSlugs = collectSlugs(getCustomRulesDir(projectDir));
  const globalSlugs = collectSlugs(getGlobalRulesDir());
  const builtInSlugs = collectSlugs(getBuiltInRulesDir());

  const seen = new Set<string>();
  const entries: RuleListEntry[] = [
    ...collectEntries(customSlugs, projectDir, 'custom', seen),
    ...collectEntries(globalSlugs, projectDir, 'global', seen),
    ...collectEntries(builtInSlugs, projectDir, 'built-in', seen),
  ];

  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

function slugToTitle(slug: string): string {
  const name = slug.split('/').pop() ?? slug;
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
