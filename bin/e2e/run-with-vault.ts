import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { readApiSettings } from '../../e2e/api/config';
import { requireCaseCreationTarget } from '../../e2e/api/case-data';
import { readInboundStorageUrl } from '../../e2e/api/audio-data';

const execFileAsync = promisify(execFile);

const secretNames = {
  AAD_B2C_ROPC_CLIENT_ID: 'AzureAdB2CFuncTestROPCClientId',
  AAD_B2C_ROPC_CLIENT_SECRET: 'AzureAdB2CFuncTestROPCClientSecret',
  AZURE_AD_FUNCTIONAL_TEST_GLOBAL_USERNAME: 'AzureAdB2CFuncTestROPCGlobalUsername',
  AZURE_AD_FUNCTIONAL_TEST_GLOBAL_PASSWORD: 'AzureAdB2CFuncTestROPCGlobalPassword',
};

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (
    mode !== 'api-check' &&
    mode !== 'case-search' &&
    mode !== 'transcript-request' &&
    mode !== 'examples'
  ) {
    throw new Error(
      'Choose api-check, case-search, transcript-request or examples. See README.md.',
    );
  }
  if (!process.env.DARTS_API) throw new Error('Set DARTS_API to the target API origin.');
  const env = { ...process.env };
  const secrets = Object.entries(secretNames).map(([variable, name]) => ({
    variable,
    name,
    vault: 'darts-stg',
  }));
  if (mode !== 'api-check') {
    requireCaseCreationTarget(env.DARTS_PORTAL, env.DARTS_API);
    // Match the external automation account supplied by the Jenkins E2E pipeline.
    env.E2E_LOGIN_ROUTE = 'external';
    delete env._DARTS_E2E_AUTH_RUN_ID;
    secrets.push(
      { variable: 'AUTOMATION_USERNAME', name: 'AutomationTestUserName', vault: 'darts-stg' },
      {
        variable: 'AUTOMATION_PASSWORD',
        name: 'AutomationTestPassword',
        vault: 'darts-stg',
      },
    );
  }
  const needsAudio = mode === 'transcript-request' || mode === 'examples';
  if (needsAudio && !env.E2E_AUDIO_INBOUND_SAS_URL) {
    const vault = env.E2E_AUDIO_STORAGE_VAULT?.trim();
    if (!vault)
      throw new Error(
        'Set E2E_AUDIO_STORAGE_VAULT to the vault used by the target API storage, or supply E2E_AUDIO_INBOUND_SAS_URL.',
      );
    secrets.push({
      variable: 'E2E_AUDIO_INBOUND_SAS_URL',
      name: 'DartsInboundStorageSasUrl',
      vault,
    });
  }
  for (const { variable, name, vault } of secrets) {
    if (env[variable]?.trim()) continue;
    try {
      const { stdout } = await execFileAsync(
        'az',
        [
          'keyvault',
          'secret',
          'show',
          '--vault-name',
          vault,
          '--name',
          name,
          '--query',
          'value',
          '--output',
          'tsv',
          '--only-show-errors',
        ],
        { timeout: 30_000 },
      );
      env[variable] = stdout.replace(/[\r\n]+$/, '');
    } catch {
      throw new Error(
        `Could not load ${variable} from ${vault}. Check Azure login and vault access.`,
      );
    }
  }
  readApiSettings(env);
  if (needsAudio) readInboundStorageUrl(env);
  const commands = {
    'api-check': ['test:e2e:api-check'],
    'case-search': ['test:e2e', 'e2e/tests/case-search.spec.ts'],
    'transcript-request': ['test:e2e', 'e2e/tests/transcript-request.spec.ts'],
    examples: ['test:e2e', 'e2e/tests/case-search.spec.ts', 'e2e/tests/transcript-request.spec.ts'],
  };
  const command = commands[mode];
  if (mode !== 'api-check') {
    // Keep each run's identifiers and failure evidence, including after another local run.
    const runId = `${mode}-${randomUUID()}`;
    command.push(`--output=e2e/test-results/runs/${runId}`, '--reporter=list,html,json');
    env.PLAYWRIGHT_HTML_OUTPUT_DIR = path.resolve('playwright-report', runId);
    env.PLAYWRIGHT_HTML_OPEN = 'never';
    env.PLAYWRIGHT_JSON_OUTPUT_NAME = path.resolve('e2e/test-results/runs', runId, 'results.json');
  }
  const child = spawn('yarn', [...command, ...process.argv.slice(3)], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
  });
  child.on('error', () => {
    console.error('Could not start the test through Yarn.');
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    process.exitCode = code ?? 1;
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Key Vault secret loading failed.');
  process.exitCode = 1;
});
