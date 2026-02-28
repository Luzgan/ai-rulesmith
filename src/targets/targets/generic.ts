import type { TargetDefinition } from '../target.types.js';

export const genericTarget: TargetDefinition = {
  name: 'Generic',
  description: 'Generic AI agent (AGENTS.md)',
  output: {
    mainFilePath: 'AGENTS.md',
    stepFilePattern: '.context-builder/steps/step-{{step_index}}-{{step_slug}}.md',
    requiredDirs: ['.context-builder/steps'],
    supportsFileReferences: true,
  },
};
