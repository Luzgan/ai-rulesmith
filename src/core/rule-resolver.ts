import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import type { ResolvedRule, RuleFrontmatter, RuleListEntry } from '../types/rule.types.js';
import { readdirSync, statSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getBuiltInRulesDir(): string {
  // Navigate from dist/src/core/ up to package root, then into rules/
  return resolve(__dirname, '..', '..', '..', 'rules');
}

function getCustomRulesDir(projectDir: string): string {
  return resolve(projectDir, '.context-builder', 'rules');
}

export function resolveRule(slug: string, projectDir: string): ResolvedRule {
  const customPath = join(getCustomRulesDir(projectDir), `${slug}.md`);
  const builtInPath = join(getBuiltInRulesDir(), `${slug}.md`);

  let filePath: string;
  if (existsSync(customPath)) {
    filePath = customPath;
  } else if (existsSync(builtInPath)) {
    filePath = builtInPath;
  } else {
    throw new Error(`Rule not found: "${slug}"\n  Checked:\n    ${customPath}\n    ${builtInPath}`);
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

export function resolveRules(slugs: string[], projectDir: string): ResolvedRule[] {
  const errors: string[] = [];
  const resolved: ResolvedRule[] = [];

  for (const slug of slugs) {
    try {
      resolved.push(resolveRule(slug, projectDir));
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

export function listAvailableRules(projectDir: string): RuleListEntry[] {
  const builtInDir = getBuiltInRulesDir();
  const customDir = getCustomRulesDir(projectDir);

  const builtInSlugs = collectSlugs(builtInDir);
  const customSlugs = collectSlugs(customDir);

  const entries: RuleListEntry[] = [];
  const seen = new Set<string>();

  // Custom rules first (they override built-in)
  for (const slug of customSlugs) {
    seen.add(slug);
    const rule = resolveRule(slug, projectDir);
    entries.push({
      slug,
      name: rule.frontmatter?.name ?? slugToTitle(slug),
      description: rule.frontmatter?.description ?? '',
      category: rule.frontmatter?.category ?? slug.split('/')[0],
      source: 'custom',
    });
  }

  for (const slug of builtInSlugs) {
    if (seen.has(slug)) continue;
    const rule = resolveRule(slug, projectDir);
    entries.push({
      slug,
      name: rule.frontmatter?.name ?? slugToTitle(slug),
      description: rule.frontmatter?.description ?? '',
      category: rule.frontmatter?.category ?? slug.split('/')[0],
      source: 'built-in',
    });
  }

  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

function slugToTitle(slug: string): string {
  const name = slug.split('/').pop() ?? slug;
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
