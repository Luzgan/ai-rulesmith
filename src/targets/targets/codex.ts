import type { TargetDefinition } from '../target.types.js';

export const codexTarget: TargetDefinition = {
  name: 'Codex',
  description: 'OpenAI Codex CLI (AGENTS.md)',
  output: {
    mainFilePath: 'AGENTS.md',
    stepFilePattern: '.rulesmith/steps/step-{{step_index}}-{{step_slug}}.md',
    requiredDirs: ['.rulesmith/steps'],
    supportsFileReferences: true,
  },
};
