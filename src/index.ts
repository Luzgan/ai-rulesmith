export { loadConfig } from './core/config-loader.js';
export { buildAll } from './core/composer.js';
export { resolveRule, resolveRules, listAvailableRules } from './core/rule-resolver.js';
export { writeOutputFiles } from './core/file-writer.js';
export { getTarget, getAllTargets, getTargetNames } from './targets/target-registry.js';

export type { RootConfig, TargetConfig, WorkflowConfig, StandardWorkflowConfig, StepsWorkflowConfig, StepConfig } from './types/config.types.js';
export type { ResolvedRule, RuleFrontmatter, RuleListEntry } from './types/rule.types.js';
export type { CompositionResult, OutputFile, BuildResult, BuildError } from './types/composer.types.js';
export type { TargetDefinition, TargetOutputConfig, TransformMetadata } from './targets/target.types.js';
