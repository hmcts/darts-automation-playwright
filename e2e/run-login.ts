import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function runLogin(): Promise<void> {
  const { stdout } = await execFileAsync(
    process.execPath,
    ['--import', 'tsx', 'e2e/login-runner.ts'],
    { timeout: 55_000 },
  );
  console.log(stdout.trim());
}
