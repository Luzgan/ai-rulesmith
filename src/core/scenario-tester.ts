import type { ModelRef, Scenario, AssertionResult, ScenarioResult, TestRunResult, ToolDefinition } from '../types/test.types.js';
import type { LlmClient } from './llm-client.js';
import { createClient } from './llm-client.js';
import { buildAll } from './composer.js';
import { loadConfig } from './config-loader.js';
import type { TargetConfig } from '../types/config.types.js';

const DEFAULT_JUDGE: ModelRef = { provider: 'anthropic', model: 'claude-haiku-4-20250414' };

function composeRulesForTarget(
  targetName: string,
  projectDir: string,
  configPath: string,
): string {
  const configs = loadConfig(configPath);
  const targetConfig = configs.find((c: TargetConfig) => c.target === targetName);

  if (!targetConfig) {
    throw new Error(`Target "${targetName}" not found in config`);
  }

  const result = buildAll([targetConfig], projectDir);

  if (result.errors.length > 0) {
    throw new Error(`Build failed: ${result.errors.map((e) => e.message).join(', ')}`);
  }

  const output = result.outputs[0];
  if (!output) {
    throw new Error(`No output for target "${targetName}"`);
  }

  // Combine main file + step files into a single context
  const parts = [output.composition.mainFile.content];
  for (const stepFile of output.composition.stepFiles) {
    parts.push(stepFile.content);
  }
  return parts.join('\n\n---\n\n');
}

async function evaluateAssertion(
  judge: LlmClient,
  agentResponse: string,
  assertion: string,
): Promise<AssertionResult> {
  const prompt = [
    'You are evaluating whether an AI agent response satisfies a specific assertion.',
    '',
    'Agent response:',
    '"""',
    agentResponse,
    '"""',
    '',
    `Assertion: "${assertion}"`,
    '',
    'Does the agent response satisfy this assertion?',
    'Reply with exactly one line: YES or NO',
    'Then on the next line, give a brief reasoning (one sentence).',
  ].join('\n');

  const result = await judge.chat(
    'You are a strict evaluator. Answer YES or NO on the first line, then reasoning on the second line.',
    prompt,
  );

  const lines = result.trim().split('\n');
  const verdict = lines[0]?.trim().toUpperCase() ?? '';
  const reasoning = lines.slice(1).join(' ').trim() || 'No reasoning provided';

  return {
    assertion,
    passed: verdict.startsWith('YES'),
    reasoning,
  };
}

async function runScenario(
  scenario: Scenario,
  model: ModelRef,
  agentClient: LlmClient,
  judgeClient: LlmClient,
  rulesContext: string,
  globalTools?: ToolDefinition[],
): Promise<ScenarioResult> {
  // Merge global + scenario-level tools
  const mergedTools = [...(globalTools ?? []), ...(scenario.tools ?? [])];
  const chatOptions = mergedTools.length > 0 ? { tools: mergedTools } : undefined;

  // Get agent response with rules as system prompt
  const agentResponse = await agentClient.chat(rulesContext, scenario.prompt, chatOptions);

  // Evaluate each assertion
  const assertions: AssertionResult[] = [];
  for (const assertion of scenario.assertions) {
    const result = await evaluateAssertion(judgeClient, agentResponse, assertion);
    assertions.push(result);
  }

  return {
    scenario,
    model,
    agentResponse,
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

export interface TestRunOptions {
  configPath: string;
  projectDir: string;
  apiKeys: Record<string, string>;
  judge?: ModelRef;
  models: ModelRef[];
  scenarios: Scenario[];
  globalTools?: ToolDefinition[];
  scenarioFilter?: string;
  targetFilter?: string;
  onScenarioStart?: (scenario: Scenario, model: ModelRef) => void;
  onScenarioComplete?: (result: ScenarioResult) => void;
}

export async function runTests(options: TestRunOptions): Promise<TestRunResult> {
  const {
    configPath,
    projectDir,
    apiKeys,
    models,
    judge = DEFAULT_JUDGE,
    globalTools,
    scenarioFilter,
    targetFilter,
  } = options;

  let scenarios = options.scenarios;

  if (scenarioFilter) {
    const filter = scenarioFilter.toLowerCase();
    scenarios = scenarios.filter((s) => s.name.toLowerCase().includes(filter));
  }

  if (targetFilter) {
    scenarios = scenarios.filter((s) => s.target === targetFilter);
  }

  if (scenarios.length === 0) {
    throw new Error('No scenarios to run after applying filters');
  }

  // Build rules context per target (cached)
  const rulesCache = new Map<string, string>();
  function getRulesContext(targetName: string): string {
    if (!rulesCache.has(targetName)) {
      rulesCache.set(targetName, composeRulesForTarget(targetName, projectDir, configPath));
    }
    return rulesCache.get(targetName)!;
  }

  // Create judge client
  const judgeKey = apiKeys[judge.provider];
  if (!judgeKey) {
    throw new Error(`No API key for judge provider "${judge.provider}"`);
  }
  const judgeClient = createClient(judge, judgeKey);

  const results: ScenarioResult[] = [];

  for (const model of models) {
    const modelKey = apiKeys[model.provider];
    if (!modelKey) {
      throw new Error(`No API key for model provider "${model.provider}"`);
    }
    const agentClient = createClient(model, modelKey);

    for (const scenario of scenarios) {
      options.onScenarioStart?.(scenario, model);

      const rulesContext = getRulesContext(scenario.target);
      const result = await runScenario(scenario, model, agentClient, judgeClient, rulesContext, globalTools);
      results.push(result);

      options.onScenarioComplete?.(result);
    }
  }

  return {
    results,
    totalPassed: results.filter((r) => r.passed).length,
    totalFailed: results.filter((r) => !r.passed).length,
  };
}
