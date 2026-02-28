export interface StepConfig {
  step_name: string;
  description?: string | null;
  rules: string[];
}

export interface StandardWorkflowConfig {
  type: 'standard';
  preamble?: string | null;
  rules: string[];
}

export interface StepsWorkflowConfig {
  type: 'steps';
  preamble?: string | null;
  steps: StepConfig[];
}

export type WorkflowConfig = StandardWorkflowConfig | StepsWorkflowConfig;

export interface TargetConfig {
  target: string;
  target_name?: string;
  output_path?: string | null;
  ai_workflow: WorkflowConfig;
}

export type RootConfig = TargetConfig[];
