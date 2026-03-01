import { Command } from 'commander';
import { resolve } from 'node:path';
import { loadConfig } from '../../core/config-loader.js';
import { resolveRule } from '../../core/rule-resolver.js';
import { getTarget } from '../../targets/target-registry.js';
import { log } from '../ui/logger.js';

export const validateCommand = new Command('validate')
  .description('Validate AI_RULES.json config and check that all referenced rules exist')
  .option('-c, --config <path>', 'Path to AI_RULES.json', './AI_RULES.json')
  .action((options) => {
    const projectDir = process.cwd();
    const configPath = resolve(projectDir, options.config);

    // Validate config structure
    let configs;
    try {
      configs = loadConfig(configPath);
      log.success('Config structure is valid.');
    } catch (err) {
      log.error((err as Error).message);
      process.exit(1);
    }

    let hasErrors = false;

    // Validate targets
    for (const config of configs) {
      if (config.target !== 'custom' && !getTarget(config.target)) {
        log.warn(`Unknown target: "${config.target}"`);
      }

      if (config.target === 'custom' && !config.output_path) {
        log.error(`Custom target requires "output_path"`);
        hasErrors = true;
      }

      // Validate rules exist
      const workflow = config.ai_workflow;
      const entries = [
        ...(workflow.before_start ?? []),
        ...(workflow.before_finish ?? []),
        ...(workflow.type === 'standard'
          ? workflow.rules
          : workflow.steps.flatMap((step) => [
              ...(step.before_start ?? []),
              ...step.rules,
              ...(step.before_finish ?? []),
            ])),
      ];

      for (const entry of entries) {
        const slug = typeof entry === 'string' ? entry : entry.slug;
        try {
          resolveRule(slug, projectDir);
          log.success(`Rule found: ${slug}`);
        } catch {
          log.error(`Rule not found: ${slug}`);
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      log.blank();
      log.error('Validation failed.');
      process.exit(1);
    }

    log.blank();
    log.success('All checks passed!');
  });
