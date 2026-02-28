export interface RuleFrontmatter {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface ResolvedRule {
  slug: string;
  filePath: string;
  frontmatter: RuleFrontmatter | null;
  content: string;
}

export interface RuleListEntry {
  slug: string;
  name: string;
  description: string;
  category: string;
  source: 'built-in' | 'custom';
}
