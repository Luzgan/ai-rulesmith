import type { TargetDefinition } from '../target.types.js';

export const windsurfTarget: TargetDefinition = {
  name: 'Windsurf',
  description: 'Windsurf AI (.windsurfrules)',
  output: {
    mainFilePath: '.windsurfrules',
    stepFilePattern: '.windsurf/rules/step-{{step_index}}-{{step_slug}}.md',
    requiredDirs: ['.windsurf/rules'],
    supportsFileReferences: true,
  },
};
