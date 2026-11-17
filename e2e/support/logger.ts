import { test } from '@playwright/test';

export type LogLevel = 'INFO' | 'DEBUG';

let workerLogLevel: LogLevel = 'INFO';

function logLevel(): LogLevel {
  let value: unknown = 'INFO';
  try {
    value = test.info().config.metadata.logLevel ?? 'INFO';
  } catch {
    // Worker teardown runs after the current test has been cleared.
    return workerLogLevel;
  }
  if (value !== 'INFO' && value !== 'DEBUG') {
    throw new Error('Set metadata.logLevel to INFO or DEBUG in playwright.config.ts.');
  }
  workerLogLevel = value;
  return workerLogLevel;
}

function context(): string {
  try {
    const info = test.info();
    const scenario = /^([A-Z]+_\d+):/.exec(info.title)?.[1] ?? info.project.name;
    return `${scenario}/worker-${info.workerIndex}`;
  } catch {
    return process.env.TEST_WORKER_INDEX ? `worker-${process.env.TEST_WORKER_INDEX}` : 'runner';
  }
}

// Keep console output behind one entry point so diagnostic sinks can be added later.
// Callers supply explicit messages, never credentials, payloads or raw errors.
export function createLogger(scope: string) {
  function write(level: LogLevel, message: string): void {
    if (level === 'DEBUG' && logLevel() !== 'DEBUG') return;
    console.log(`${new Date().toISOString()} [${level}] [${context()}] [${scope}] ${message}`);
  }
  return {
    info: (message: string): void => write('INFO', message),
    debug: (message: string): void => write('DEBUG', message),
  };
}
