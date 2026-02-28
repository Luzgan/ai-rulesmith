import { Command } from 'commander';
import { resolve } from 'node:path';
import { loadConfig } from '../../core/config-loader.js';
import { buildAll } from '../../core/composer.js';
import { renderPreview } from '../ui/preview-renderer.js';
import { log } from '../ui/logger.js';

export const previewCommand = new Command('preview')
  .description('Preview composed output in the terminal without writing files')
  .option('-c, --config <path>', 'Path to AI_RULES.json', './AI_RULES.json')
  .option('-t, --target <name>', 'Preview only a specific target')
  .action((options) => {
    const projectDir = process.cwd();
    const configPath = resolve(projectDir, options.config);

    let configs;
    try {
      configs = loadConfig(configPath);
    } catch (err) {
      log.error((err as Error).message);
      process.exit(1);
    }

    const result = buildAll(configs, projectDir, options.target);

    if (result.errors.length > 0) {
      for (const err of result.errors) {
        log.error(`[${err.targetName}] ${err.message}`);
      }
    }

    if (result.outputs.length === 0) {
      log.warn('No outputs to preview.');
      process.exit(1);
    }

    for (const output of result.outputs) {
      renderPreview(output.targetName, output.composition);
    }
  });
