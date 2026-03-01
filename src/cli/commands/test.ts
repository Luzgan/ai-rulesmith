import { Command } from 'commander';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import chalk from 'chalk';
import { testConfigSchema } from '../../types/test.types.js';
import type { Scenario, ScenarioResult } from '../../types/test.types.js';
import type { ModelRef } from '../../types/test.types.js';
import { runTests } from '../../core/scenario-tester.js';
import { resolveProviderKeys } from '../../core/key-manager.js';
import { log } from '../ui/logger.js';

export const testCommand = new Command('test')
  .description('Run scenario tests to verify rules influence agent behavior')
  .option('-c, --config <path>', 'Path to AI_RULES.json', './AI_RULES.json')
  .option('-t, --test-config <path>', 'Path to AI_RULES.test.json', './AI_RULES.test.json')
  .option('--scenario <filter>', 'Run scenarios matching this name')
  .option('--target <target>', 'Run scenarios for this target only')
  .option('--verbose', 'Show full LLM responses')
  .option('--reset-keys', 'Re-prompt for API keys')
  .action(async (options) => {
    const projectDir = process.cwd();
    const configPath = resolve(projectDir, options.config);
    const testConfigPath = resolve(projectDir, options.testConfig);

    // Load test config
    let rawTestConfig;
    try {
      rawTestConfig = JSON.parse(readFileSync(testConfigPath, 'utf-8'));
    } catch {
      log.error(`Could not read test config: ${testConfigPath}`);
      process.exit(1);
    }

    const parsed = testConfigSchema.safeParse(rawTestConfig);
    if (!parsed.success) {
      log.error('Invalid test config:');
      for (const issue of parsed.error.issues) {
        log.error(`  ${issue.path.join('.')}: ${issue.message}`);
      }
      process.exit(1);
    }

    const testConfig = parsed.data;

    log.heading('Scenario Tests');
    log.blank();
    log.dim(`Models: ${testConfig.models.map((m) => `${m.provider}/${m.model}`).join(', ')}`);
    log.dim(`Judge: ${testConfig.judge ? `${testConfig.judge.provider}/${testConfig.judge.model}` : 'default (anthropic/claude-haiku-4-20250414)'}`);
    log.dim(`Scenarios: ${testConfig.scenarios.length}`);
    log.blank();

    // Resolve API keys
    const allProviders = [
      ...testConfig.models.map((m) => m.provider),
      testConfig.judge?.provider ?? 'anthropic',
    ];

    let apiKeys: Record<string, string>;
    try {
      apiKeys = await resolveProviderKeys(allProviders, options.resetKeys);
    } catch (err) {
      log.error((err as Error).message);
      process.exit(1);
    }

    // Run tests
    try {
      const result = await runTests({
        configPath,
        projectDir,
        apiKeys,
        models: testConfig.models,
        judge: testConfig.judge,
        scenarios: testConfig.scenarios,
        globalTools: testConfig.tools,
        scenarioFilter: options.scenario,
        targetFilter: options.target,
        onScenarioStart: (scenario: Scenario, model: ModelRef) => {
          process.stderr.write(
            chalk.dim(`  ⏳ ${model.provider}/${model.model} — ${scenario.name}...`),
          );
        },
        onScenarioComplete: (result: ScenarioResult) => {
          // Clear the "running" line
          process.stderr.write('\r\x1b[K');

          const icon = result.passed ? chalk.green('✓') : chalk.red('✗');
          const modelLabel = chalk.dim(`[${result.model.provider}/${result.model.model}]`);
          console.log(`  ${icon} ${result.scenario.name} ${modelLabel}`);

          for (const assertion of result.assertions) {
            const aIcon = assertion.passed ? chalk.green('  ✓') : chalk.red('  ✗');
            console.log(`    ${aIcon} ${assertion.assertion}`);
            if (!assertion.passed || options.verbose) {
              console.log(chalk.dim(`      ${assertion.reasoning}`));
            }
          }

          if (options.verbose) {
            console.log(chalk.dim('\n    Agent response:'));
            const lines = result.agentResponse.split('\n');
            for (const line of lines) {
              console.log(chalk.dim(`    │ ${line}`));
            }
            console.log();
          }
        },
      });

      log.blank();

      if (result.totalFailed === 0) {
        log.success(`All ${result.totalPassed} scenario(s) passed!`);
      } else {
        log.error(`${result.totalFailed} scenario(s) failed, ${result.totalPassed} passed.`);
        process.exit(1);
      }
    } catch (err) {
      log.error((err as Error).message);
      process.exit(1);
    }
  });
