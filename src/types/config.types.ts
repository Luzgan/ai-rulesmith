export interface RuleReference {
  slug: string;
  vars?: Record<string, string>;
}

export type RuleEntry = string | RuleReference;

export interface StepConfig {
  step_name: string;
  description?: string | null;
  rules: RuleEntry[];
  before_start?: RuleEntry[];
  before_finish?: RuleEntry[];
}

export interface StandardWorkflowConfig {
  type: 'standard';
  preamble?: string | null;
  rules: RuleEntry[];
  before_start?: RuleEntry[];
  before_finish?: RuleEntry[];
}

export interface StepsWorkflowConfig {
  type: 'steps';
  preamble?: string | null;
  steps: StepConfig[];
  before_start?: RuleEntry[];
  before_finish?: RuleEntry[];
}

export type WorkflowConfig = StandardWorkflowConfig | StepsWorkflowConfig;

export interface TargetConfig {
  target: string;
  target_name?: string;
  output_path?: string | null;
  ai_workflow: WorkflowConfig;
}

export type RootConfig = TargetConfig[];
