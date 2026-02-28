import { Command } from 'commander';
import chalk from 'chalk';
import { listAvailableRules } from '../../core/rule-resolver.js';
import { log } from '../ui/logger.js';

export const listRulesCommand = new Command('list-rules')
  .description('List all available rules (built-in and custom)')
  .option('--built-in', 'Show only built-in rules')
  .option('--custom', 'Show only custom rules')
  .option('--category <category>', 'Filter by category')
  .action((options) => {
    const projectDir = process.cwd();
    let rules = listAvailableRules(projectDir);

    if (options.builtIn) {
      rules = rules.filter((r) => r.source === 'built-in');
    }
    if (options.custom) {
      rules = rules.filter((r) => r.source === 'custom');
    }
    if (options.category) {
      rules = rules.filter((r) => r.category === options.category);
    }

    if (rules.length === 0) {
      log.warn('No rules found.');
      return;
    }

    log.heading('Available Rules');
    log.blank();

    // Group by category
    const grouped = new Map<string, typeof rules>();
    for (const rule of rules) {
      const cat = rule.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(rule);
    }

    for (const [category, categoryRules] of grouped) {
      console.log(chalk.bold.cyan(`  ${category}/`));
      for (const rule of categoryRules) {
        const source = rule.source === 'custom' ? chalk.yellow(' (custom)') : '';
        const desc = rule.description ? chalk.dim(` — ${rule.description}`) : '';
        console.log(`    ${rule.slug}${source}${desc}`);
      }
      console.log();
    }

    log.dim(`${rules.length} rule(s) total`);
  });
