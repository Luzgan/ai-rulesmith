import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const SERVICE_NAME = 'ai-rulesmith';

const ENV_VAR_MAP: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
};

const isMacOS = platform() === 'darwin';

// --- macOS Keychain via `security` CLI ---

function keychainRead(account: string): string | null {
  try {
    const result = execSync(
      `security find-generic-password -s "${SERVICE_NAME}" -a "${account}" -w 2>/dev/null`,
      { encoding: 'utf-8' },
    );
    return result.trim() || null;
  } catch {
    return null;
  }
}

function keychainWrite(account: string, password: string): void {
  // -U = update if exists
  execSync(
    `security add-generic-password -U -s "${SERVICE_NAME}" -a "${account}" -w "${password}"`,
  );
}

// --- Native macOS password dialog via osascript ---

function promptNativeDialog(providerName: string): string | null {
  try {
    const script = [
      'set dialogResult to display dialog',
      `"Enter API key for ${providerName}:" with title "AI Rulesmith"`,
      'default answer "" with hidden answer',
      'return text returned of dialogResult',
    ].join(' ');

    const result = execSync(`osascript -e '${script}' 2>/dev/null`, { encoding: 'utf-8' });
    return result.trim() || null;
  } catch {
    // User cancelled the dialog
    return null;
  }
}

// --- Terminal prompt with hidden input ---

async function promptTerminal(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stderr.write(question);

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw ?? false;

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding('utf-8');

    let input = '';

    const onData = (char: string): void => {
      if (char === '\n' || char === '\r' || char === '\u0004') {
        // Enter or Ctrl+D — done
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw);
        }
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stderr.write('\n');
        resolve(input.trim());
      } else if (char === '\u0003') {
        // Ctrl+C — abort
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw);
        }
        process.exit(1);
      } else if (char === '\u007F' || char === '\b') {
        // Backspace
        input = input.slice(0, -1);
      } else {
        input += char;
      }
    };

    stdin.on('data', onData);
  });
}

// --- Public API ---

export async function getApiKey(provider: string, resetKey: boolean = false): Promise<string> {
  const envVar = ENV_VAR_MAP[provider];

  // 1. Check env var (always takes priority, useful for CI)
  if (envVar) {
    const envValue = process.env[envVar];
    if (envValue) {
      return envValue;
    }
  }

  const account = `${provider}-api-key`;

  // 2. Check Keychain (unless resetting)
  if (isMacOS && !resetKey) {
    const stored = keychainRead(account);
    if (stored) {
      return stored;
    }
  }

  // 3. Prompt for key — try native dialog first, fall back to terminal
  let key: string | null = null;

  if (isMacOS) {
    key = promptNativeDialog(provider);
  }

  if (!key) {
    key = await promptTerminal(`Enter API key for ${provider}: `);
  }

  if (!key) {
    throw new Error(`No API key provided for ${provider}`);
  }

  // 4. Save to Keychain on macOS (automatic — no need to ask)
  if (isMacOS) {
    keychainWrite(account, key);
    process.stderr.write(`Key saved to macOS Keychain (service: ${SERVICE_NAME}).\n`);
  }

  return key;
}

export async function resolveProviderKeys(
  providers: string[],
  resetKeys: boolean = false,
): Promise<Record<string, string>> {
  const uniqueProviders = [...new Set(providers)];
  const keys: Record<string, string> = {};

  for (const provider of uniqueProviders) {
    keys[provider] = await getApiKey(provider, resetKeys);
  }

  return keys;
}
