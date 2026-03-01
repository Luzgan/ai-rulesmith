import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { buildCommand } from './commands/build.js';
import { initCommand } from './commands/init.js';
import { previewCommand } from './commands/preview.js';
import { validateCommand } from './commands/validate.js';
import { listRulesCommand } from './commands/list-rules.js';
import { listTargetsCommand } from './commands/list-targets.js';
import { testCommand } from './commands/test.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', '..', '..', 'package.json'), 'utf-8'));

export function createProgram(): Command {
  const program = new Command();

  program
    .name('rulesmith')
    .description('Compose AI agent context files from reusable markdown rules')
    .version(pkg.version);

  program.addCommand(buildCommand, { isDefault: true });
  program.addCommand(initCommand);
  program.addCommand(previewCommand);
  program.addCommand(validateCommand);
  program.addCommand(listRulesCommand);
  program.addCommand(listTargetsCommand);
  program.addCommand(testCommand);

  return program;
}
