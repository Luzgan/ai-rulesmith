export interface TransformMetadata {
  type: 'main' | 'step';
  stepIndex?: number;
  stepName?: string;
  stepSlug?: string;
}

export interface TargetOutputConfig {
  mainFilePath: string;
  stepFilePattern: string | null;
  requiredDirs: string[];
  supportsFileReferences: boolean;
}

export interface TargetDefinition {
  name: string;
  description: string;
  output: TargetOutputConfig;
  transformOutput?: (content: string, metadata: TransformMetadata) => string;
}
