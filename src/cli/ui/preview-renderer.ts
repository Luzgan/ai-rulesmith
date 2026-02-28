import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import chalk from 'chalk';
import type { CompositionResult } from '../../types/composer.types.js';

marked.setOptions({ renderer: new TerminalRenderer() as any });

export function renderPreview(targetName: string, result: CompositionResult): void {
  const { mainFile, stepFiles } = result;

  console.log(chalk.bold.cyan(`\n━━━ ${targetName} ━━━`));
  console.log(chalk.dim(`Output: ${mainFile.path} (${mainFile.content.length} bytes)`));
  console.log(chalk.dim('─'.repeat(60)));
  console.log(marked.parse(mainFile.content));

  for (const stepFile of stepFiles) {
    console.log(chalk.dim('─'.repeat(60)));
    console.log(chalk.dim(`Step file: ${stepFile.path} (${stepFile.content.length} bytes)`));
    console.log(chalk.dim('─'.repeat(60)));
    console.log(marked.parse(stepFile.content));
  }

  console.log(chalk.dim('━'.repeat(60)));
}

export function renderFileSummary(result: CompositionResult): void {
  const allFiles = [result.mainFile, ...result.stepFiles];
  console.log(chalk.dim(`  ${allFiles.length} file(s) to write:`));
  for (const file of allFiles) {
    console.log(chalk.dim(`    → ${file.path}`));
  }
}
