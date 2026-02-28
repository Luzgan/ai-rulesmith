import { Command } from 'commander';
import chalk from 'chalk';
import { getAllTargets } from '../../targets/target-registry.js';
import { log } from '../ui/logger.js';

export const listTargetsCommand = new Command('list-targets')
  .description('List all supported AI targets and their output file paths')
  .action(() => {
    const targets = getAllTargets();

    log.heading('Supported Targets');
    log.blank();

    for (const target of targets) {
      console.log(chalk.bold.cyan(`  ${target.name}`));
      console.log(chalk.dim(`    ${target.description}`));
      console.log(`    Main file:  ${chalk.green(target.output.mainFilePath)}`);
      if (target.output.stepFilePattern) {
        console.log(`    Step files: ${chalk.green(target.output.stepFilePattern)}`);
      }
      console.log();
    }

    log.blank();
    log.dim('Use "custom" target with "output_path" for unsupported agents.');
  });
