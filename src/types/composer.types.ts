import type { TargetConfig } from './config.types.js';

export interface OutputFile {
  path: string;
  content: string;
}

export interface CompositionResult {
  mainFile: OutputFile;
  stepFiles: OutputFile[];
}

export interface BuildResult {
  outputs: Array<{
    targetName: string;
    config: TargetConfig;
    composition: CompositionResult;
  }>;
  errors: BuildError[];
}

export interface BuildError {
  targetName: string;
  message: string;
  ruleSlug?: string;
}
