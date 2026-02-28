import type { TargetDefinition } from './target.types.js';
import { claudeCodeTarget } from './targets/claude-code.js';
import { cursorTarget } from './targets/cursor.js';
import { copilotTarget } from './targets/copilot.js';
import { windsurfTarget } from './targets/windsurf.js';
import { codexTarget } from './targets/codex.js';
import { genericTarget } from './targets/generic.js';

const registry = new Map<string, TargetDefinition>();

function register(target: TargetDefinition): void {
  registry.set(target.name, target);
}

register(claudeCodeTarget);
register(cursorTarget);
register(copilotTarget);
register(windsurfTarget);
register(codexTarget);
register(genericTarget);

export function getTarget(name: string): TargetDefinition | undefined {
  return registry.get(name);
}

export function getAllTargets(): TargetDefinition[] {
  return Array.from(registry.values());
}

export function getTargetNames(): string[] {
  return Array.from(registry.keys());
}

export function getCustomTarget(outputPath: string, targetName?: string): TargetDefinition {
  return {
    name: targetName ?? 'custom',
    description: `Custom target (${outputPath})`,
    output: {
      mainFilePath: outputPath,
      stepFilePattern: '.context-builder/steps/step-{{step_index}}-{{step_slug}}.md',
      requiredDirs: ['.context-builder/steps'],
      supportsFileReferences: true,
    },
  };
}
