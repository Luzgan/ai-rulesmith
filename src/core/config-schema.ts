import { z } from 'zod';

const ruleSlugSchema = z
  .string()
  .min(1, 'Rule slug cannot be empty')
  .regex(/^[a-z0-9-]+\/[a-z0-9-]+$/, 'Rule slug must be in format "category/rule-name"');

const ruleRefSchema = z.union([
  ruleSlugSchema,
  z.object({
    slug: ruleSlugSchema,
    vars: z.record(z.string()).optional(),
  }),
]);

const optionalRuleArray = z.array(ruleRefSchema).optional();

const stepSchema = z.object({
  step_name: z.string().min(1, 'Step name cannot be empty'),
  description: z.string().nullish(),
  rules: z.array(ruleRefSchema).min(1, 'Each step must have at least one rule'),
  before_start: optionalRuleArray,
  before_finish: optionalRuleArray,
});

const standardWorkflowSchema = z.object({
  type: z.literal('standard'),
  preamble: z.string().nullish(),
  rules: z.array(ruleRefSchema).min(1, 'Workflow must have at least one rule'),
  before_start: optionalRuleArray,
  before_finish: optionalRuleArray,
});

const stepsWorkflowSchema = z.object({
  type: z.literal('steps'),
  preamble: z.string().nullish(),
  steps: z.array(stepSchema).min(1, 'Steps workflow must have at least one step'),
  before_start: optionalRuleArray,
  before_finish: optionalRuleArray,
});

const workflowSchema = z.discriminatedUnion('type', [
  standardWorkflowSchema,
  stepsWorkflowSchema,
]);

const targetConfigSchema = z.object({
  target: z.string().min(1, 'Target cannot be empty'),
  target_name: z.string().optional(),
  output_path: z.string().nullish(),
  ai_workflow: workflowSchema,
});

export const rootConfigSchema = z.array(targetConfigSchema).min(1, 'Config must have at least one target');

export const singleOrArrayConfigSchema = z.union([
  targetConfigSchema.transform((val) => [val]),
  rootConfigSchema,
]);
