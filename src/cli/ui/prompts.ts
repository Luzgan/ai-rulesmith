import { createInterface } from 'node:readline';

export async function confirm(message: string, defaultValue: boolean = false): Promise<boolean> {
  const suffix = defaultValue ? '(Y/n)' : '(y/N)';
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} ${suffix} `, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      if (trimmed === '') {
        resolve(defaultValue);
      } else {
        resolve(trimmed === 'y' || trimmed === 'yes');
      }
    });
  });
}
