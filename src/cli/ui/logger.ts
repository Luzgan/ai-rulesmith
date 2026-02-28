import chalk from 'chalk';

export const log = {
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  },
  success(message: string): void {
    console.log(chalk.green('✓'), message);
  },
  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  },
  error(message: string): void {
    console.error(chalk.red('✗'), message);
  },
  dim(message: string): void {
    console.log(chalk.dim(message));
  },
  heading(message: string): void {
    console.log(chalk.bold.underline(message));
  },
  blank(): void {
    console.log();
  },
  file(path: string, action: string = 'write'): void {
    console.log(chalk.green('✓'), chalk.dim(`${action}:`), chalk.cyan(path));
  },
  table(rows: Array<[string, string]>): void {
    const maxKey = Math.max(...rows.map(([k]) => k.length));
    for (const [key, value] of rows) {
      console.log(`  ${chalk.bold(key.padEnd(maxKey))}  ${value}`);
    }
  },
};
