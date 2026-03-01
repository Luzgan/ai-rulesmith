import type { TargetConfig, RuleEntry } from '../types/config.types.js';
import type { CompositionResult, BuildResult, BuildError } from '../types/composer.types.js';
import type { TargetDefinition } from '../targets/target.types.js';
import type { ResolvedRule } from '../types/rule.types.js';
import { getTarget, getCustomTarget } from '../targets/target-registry.js';
import { resolveRules } from './rule-resolver.js';
import { composeStandard } from './standard-composer.js';
import { composeSteps } from './steps-composer.js';

function resolveOptionalRules(entries: RuleEntry[] | undefined, projectDir: string): ResolvedRule[] {
  if (!entries || entries.length === 0) return [];
  return resolveRules(entries, projectDir);
}

function resolveTarget(config: TargetConfig): TargetDefinition {
  if (config.target === 'custom') {
    if (!config.output_path) {
      throw new Error('Custom target requires "output_path" to be specified');
    }
    return getCustomTarget(config.output_path, config.target_name);
  }

  const target = getTarget(config.target);
  if (!target) {
    throw new Error(
      `Unknown target: "${config.target}". Use "context-builder list-targets" to see available targets.`,
    );
  }
  return target;
}

function composeOne(config: TargetConfig, projectDir: string): CompositionResult {
  const target = resolveTarget(config);
  const outputPath = config.output_path ?? target.output.mainFilePath;

  const workflow = config.ai_workflow;
  const workflowBeforeStart = resolveOptionalRules(workflow.before_start, projectDir);
  const workflowBeforeFinish = resolveOptionalRules(workflow.before_finish, projectDir);

  if (workflow.type === 'standard') {
    const rules = resolveRules(workflow.rules, projectDir);
    return composeStandard(rules, workflowBeforeStart, workflowBeforeFinish, workflow, target, outputPath);
  }

  // Steps workflow
  const stepsWithRules = workflow.steps.map((step) => ({
    step,
    rules: resolveRules(step.rules, projectDir),
    beforeStart: [
      ...workflowBeforeStart,
      ...resolveOptionalRules(step.before_start, projectDir),
    ],
    beforeFinish: [
      ...workflowBeforeFinish,
      ...resolveOptionalRules(step.before_finish, projectDir),
    ],
  }));
  return composeSteps(stepsWithRules, workflow, target, outputPath);
}

export function buildAll(
  configs: TargetConfig[],
  projectDir: string,
  targetFilter?: string,
): BuildResult {
  const filtered = targetFilter
    ? configs.filter((c) => c.target === targetFilter)
    : configs;

  if (filtered.length === 0 && targetFilter) {
    return {
      outputs: [],
      errors: [{ targetName: targetFilter, message: `No config found for target "${targetFilter}"` }],
    };
  }

  const outputs: BuildResult['outputs'] = [];
  const errors: BuildError[] = [];

  for (const config of filtered) {
    try {
      const composition = composeOne(config, projectDir);
      outputs.push({
        targetName: config.target_name ?? config.target,
        config,
        composition,
      });
    } catch (err) {
      errors.push({
        targetName: config.target_name ?? config.target,
        message: (err as Error).message,
      });
    }
  }

  return { outputs, errors };
}
