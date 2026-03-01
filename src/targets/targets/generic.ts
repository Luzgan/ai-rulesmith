import type { TargetDefinition } from '../target.types.js';

export const genericTarget: TargetDefinition = {
  name: 'Generic',
  description: 'Generic AI agent (AGENTS.md)',
  output: {
    mainFilePath: 'AGENTS.md',
    stepFilePattern: '.rulesmith/steps/step-{{step_index}}-{{step_slug}}.md',
    requiredDirs: ['.rulesmith/steps'],
    supportsFileReferences: true,
  },
};
