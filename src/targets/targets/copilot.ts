import type { TargetDefinition } from '../target.types.js';

export const copilotTarget: TargetDefinition = {
  name: 'GitHub Copilot',
  description: 'GitHub Copilot (.github/copilot-instructions.md)',
  output: {
    mainFilePath: '.github/copilot-instructions.md',
    stepFilePattern: '.github/instructions/step-{{step_index}}-{{step_slug}}.instructions.md',
    requiredDirs: ['.github', '.github/instructions'],
    supportsFileReferences: true,
  },
};
