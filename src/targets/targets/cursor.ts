import type { TargetDefinition, TransformMetadata } from '../target.types.js';

export const cursorTarget: TargetDefinition = {
  name: 'Cursor',
  description: 'Cursor AI (.cursorrules)',
  output: {
    mainFilePath: '.cursorrules',
    stepFilePattern: '.cursor/rules/step-{{step_index}}-{{step_slug}}.mdc',
    requiredDirs: ['.cursor/rules'],
    supportsFileReferences: true,
  },
  transformOutput(content: string, metadata: TransformMetadata): string {
    if (metadata.type === 'step') {
      const frontmatter = [
        '---',
        `description: Step ${metadata.stepIndex} - ${metadata.stepName}`,
        'alwaysApply: false',
        '---',
        '',
      ].join('\n');
      return frontmatter + content;
    }
    return content;
  },
};
