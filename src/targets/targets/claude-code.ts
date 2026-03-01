import type { TargetDefinition } from '../target.types.js';

export const claudeCodeTarget: TargetDefinition = {
  name: 'Claude Code',
  description: 'Anthropic Claude Code (CLAUDE.md)',
  output: {
    mainFilePath: 'CLAUDE.md',
    stepFilePattern: '.rulesmith/steps/step-{{step_index}}-{{step_slug}}.md',
    requiredDirs: ['.rulesmith/steps'],
    supportsFileReferences: true,
  },
};
