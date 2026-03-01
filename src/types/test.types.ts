import { z } from 'zod';

// --- Model aliases ---

const MODEL_ALIASES: Record<string, Record<string, string>> = {
  anthropic: {
    'sonnet': 'claude-sonnet-4-20250514',
    'sonnet-4': 'claude-sonnet-4-20250514',
    'sonnet-4.6': 'claude-sonnet-4-6',
    'opus': 'claude-opus-4-20250514',
    'opus-4': 'claude-opus-4-20250514',
    'opus-4.6': 'claude-opus-4-6',
    'haiku': 'claude-haiku-4-5-20251001',
    'haiku-4.5': 'claude-haiku-4-5-20251001',
  },
  openai: {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
  },
};

export function resolveModelAlias(provider: string, model: string): string {
  return MODEL_ALIASES[provider]?.[model] ?? model;
}

// --- Zod schemas ---

// Accept "provider/model" string, e.g. "anthropic/sonnet"
const modelRefStringSchema = z
  .string()
  .regex(/^[a-z]+\/.+$/, 'Model must be in format "provider/model"')
  .transform((val): { provider: 'anthropic' | 'openai'; model: string } => {
    const [provider, ...rest] = val.split('/');
    const model = rest.join('/');
    const resolvedModel = resolveModelAlias(provider, model);
    return { provider: provider as 'anthropic' | 'openai', model: resolvedModel };
  });

const modelRefObjectSchema = z.object({
  provider: z.enum(['anthropic', 'openai']),
  model: z.string().min(1, 'Model name cannot be empty'),
}).transform((val) => ({
  ...val,
  model: resolveModelAlias(val.provider, val.model),
}));

const modelRefSchema = z.union([modelRefStringSchema, modelRefObjectSchema]);

const toolDefinitionSchema = z.object({
  name: z.string().min(1, 'Tool name cannot be empty'),
  description: z.string().optional(),
  input_schema: z.record(z.unknown()).default({ type: 'object', properties: {} }),
});

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name cannot be empty'),
  target: z.string().min(1, 'Target cannot be empty'),
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  assertions: z.array(z.string().min(1)).min(1, 'Scenario must have at least one assertion'),
  tools: z.array(toolDefinitionSchema).optional(),
});

export const testConfigSchema = z.object({
  models: z.array(modelRefSchema).min(1, 'Must specify at least one model to test'),
  judge: modelRefSchema.optional(),
  tools: z.array(toolDefinitionSchema).optional(),
  scenarios: z.array(scenarioSchema).min(1, 'Must have at least one scenario'),
});

// --- TypeScript types ---

export interface ModelRef {
  provider: 'anthropic' | 'openai';
  model: string;
}

export interface ToolDefinition {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

export type Scenario = z.infer<typeof scenarioSchema>;
export type TestConfig = z.infer<typeof testConfigSchema>;

export interface AssertionResult {
  assertion: string;
  passed: boolean;
  reasoning: string;
}

export interface ScenarioResult {
  scenario: Scenario;
  model: ModelRef;
  agentResponse: string;
  assertions: AssertionResult[];
  passed: boolean;
}

export interface TestRunResult {
  results: ScenarioResult[];
  totalPassed: number;
  totalFailed: number;
}
