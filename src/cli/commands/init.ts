import { Command } from 'commander';
import { resolve } from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';
import { log } from '../ui/logger.js';
import { confirm } from '../ui/prompts.js';
import { getTargetNames } from '../../targets/target-registry.js';

const SAMPLE_CONFIG = [
  {
    target: 'Claude Code',
    ai_workflow: {
      type: 'standard',
      rules: ['code-style/typescript', 'git/commit-messages'],
    },
  },
];

export const initCommand = new Command('init')
  .description('Create a starter AI_RULES.json in the current directory')
  .option('--target <name>', 'Pre-select a target')
  .option('--workflow <type>', 'Workflow type: standard or steps')
  .action(async (options) => {
    const configPath = resolve(process.cwd(), 'AI_RULES.json');

    if (existsSync(configPath)) {
      const overwrite = await confirm('AI_RULES.json already exists. Overwrite?');
      if (!overwrite) {
        log.dim('Aborted.');
        return;
      }
    }

    const config = [...SAMPLE_CONFIG];

    if (options.target) {
      const targets = getTargetNames();
      if (!targets.includes(options.target) && options.target !== 'custom') {
        log.warn(`Unknown target "${options.target}". Available: ${targets.join(', ')}`);
      }
      config[0].target = options.target;
    }

    if (options.workflow === 'steps') {
      (config[0] as any).ai_workflow = {
        type: 'steps',
        steps: [
          {
            step_name: 'Create',
            description: 'Implement the feature',
            rules: ['code-style/typescript'],
          },
          {
            step_name: 'Review',
            description: 'Review the implementation',
            rules: ['review/code-review'],
          },
        ],
      };
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
    log.success('Created AI_RULES.json');
    log.dim('Edit the file to configure your rules, then run: context-builder build');
  });
