import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { singleOrArrayConfigSchema } from './config-schema.js';
import type { RootConfig } from '../types/config.types.js';

export function loadConfig(configPath: string): RootConfig {
  const absolutePath = resolve(configPath);

  let raw: string;
  try {
    raw = readFileSync(absolutePath, 'utf-8');
  } catch {
    throw new Error(`Config file not found: ${absolutePath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in config file: ${absolutePath}`);
  }

  const result = singleOrArrayConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid config:\n${issues}`);
  }

  return result.data;
}
