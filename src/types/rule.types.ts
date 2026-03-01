export interface RuleVarDefinition {
  description?: string;
  required?: boolean;
  default?: string;
}

export interface RuleFrontmatter {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  vars?: Record<string, RuleVarDefinition>;
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
  source: 'built-in' | 'global' | 'custom';
}
