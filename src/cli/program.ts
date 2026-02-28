import { Command } from 'commander';
import { buildCommand } from './commands/build.js';
import { initCommand } from './commands/init.js';
import { previewCommand } from './commands/preview.js';
import { validateCommand } from './commands/validate.js';
import { listRulesCommand } from './commands/list-rules.js';
import { listTargetsCommand } from './commands/list-targets.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('context-builder')
    .description('Compose AI agent context files from reusable markdown rules')
    .version('0.1.0');

  program.addCommand(buildCommand, { isDefault: true });
  program.addCommand(initCommand);
  program.addCommand(previewCommand);
  program.addCommand(validateCommand);
  program.addCommand(listRulesCommand);
  program.addCommand(listTargetsCommand);

  return program;
}
