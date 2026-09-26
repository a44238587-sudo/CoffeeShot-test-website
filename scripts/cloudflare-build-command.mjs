#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { isAllowedCloudflareBuild, printPublicationInstructions } from './project-command.mjs';

if (!isAllowedCloudflareBuild()) {
  printPublicationInstructions();
  process.exit(1);
}

const result = spawnSync(process.execPath, [
  'node_modules/expo/bin/cli', 'export', '--platform', 'web', '--output-dir', 'dist',
], {
  cwd: process.cwd(),
  env: { ...process.env, EXPO_NO_TELEMETRY: '1', CI: '1' },
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

if (!process.exitCode) await import('./publish-test-access.mjs');
