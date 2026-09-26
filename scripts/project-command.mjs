#!/usr/bin/env node
// Copy this file unchanged into each repository that uses the shared command guard.
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localWorkspaceRoot = '/home/xxx/Desktop/en/app/cloudflare';
const isLocalWorkspace = projectRoot === localWorkspaceRoot
  || projectRoot.startsWith(`${localWorkspaceRoot}${path.sep}`);
const nodeModulesRoot = path.join(projectRoot, 'node_modules');
const message = 'Publish by committing and pushing GitHub main. Cloudflare Pages runs npm run build:cloudflare.';
export const PUBLISH_INSTRUCTIONS = message;
const modeMarker = /\[cloudflare:(fast|full)\]/u;
const modeToken = /\[cloudflare:([^\]]*)\]/gu;

export function triggerModeFromSubject(subject) {
  if (typeof subject !== 'string') return '';
  const tokens = [...subject.matchAll(modeToken)];
  if ((subject.match(/\[cloudflare:/giu) || []).length !== tokens.length) return '';
  if (tokens.length === 0) return 'fast';
  if (tokens.length !== 1 || !modeMarker.test(tokens[0][0])) return '';
  return tokens[0][1];
}

export function resolveCloudflareBuildMode(environment = process.env) {
  if (environment.CF_PAGES !== '1' || environment.CF_PAGES_BRANCH !== 'main') {
    throw new Error('Cloudflare Pages must build the GitHub main branch.');
  }
  const commit = String(environment.CF_PAGES_COMMIT_SHA || '');
  if (!/^[0-9a-f]{40}$/u.test(commit)) {
    throw new Error('Missing or invalid CF_PAGES_COMMIT_SHA.');
  }
  const result = spawnSync('git', ['show', '-s', '--format=%s', commit], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Could not inspect deployment commit ${commit}: ${String(result.error?.message || result.stderr || result.stdout || `git exited ${result.status}`).trim()}`);
  }
  const mode = triggerModeFromSubject(String(result.stdout).trim());
  if (!mode) throw new Error('Malformed, unknown, or repeated Cloudflare build-mode marker.');
  return mode;
}

export function isAllowedCloudflareBuild() {
  return !isLocalWorkspace
    && process.env.CF_PAGES === '1'
    && process.env.UNIVERSAL_LAUNCHER_INTERNAL_BUILD === '1';
}

export function printPublicationInstructions() {
  console.error(message);
}

export const isAllowedAstroCommand = isAllowedCloudflareBuild;
export const isAllowedViteCommand = isAllowedCloudflareBuild;
export const printBlockedAstroMessage = printPublicationInstructions;
export const printBlockedViteMessage = printPublicationInstructions;
export const printBlockedModalMessage = printPublicationInstructions;

function writeGuard(guardPath, relativeImport) {
  mkdirSync(path.dirname(guardPath), { recursive: true });
  rmSync(guardPath, { force: true });
  writeFileSync(guardPath, [
    '#!/usr/bin/env node',
    `import { printBlockedAstroMessage } from '${relativeImport}';`,
    'printBlockedAstroMessage();',
    'process.exit(1);',
    '',
  ].join('\n'));
  chmodSync(guardPath, 0o755);
}

function installBinGuards() {
  if (!existsSync(nodeModulesRoot)) return;

  for (const [bin, authorized] of [
    ['astro/bin/astro.mjs', 'astro/bin/astro.authorized.mjs'],
    ['vite/bin/vite.js', 'vite/bin/vite.authorized.js'],
  ]) {
    const binPath = path.join(nodeModulesRoot, bin);
    const authorizedPath = path.join(nodeModulesRoot, authorized);
    if (existsSync(binPath) && !existsSync(authorizedPath)) {
      const source = readFileSync(binPath, 'utf8');
      if (!source.includes('printBlocked')) {
        renameSync(binPath, authorizedPath);
        chmodSync(authorizedPath, 0o755);
      }
    }
  }

  const bins = process.env.CF_PAGES === '1'
    ? ['astro', 'vite']
    : ['astro', 'vite', 'wxt', 'wrangler', 'cloudflare', 'modal', 'miniflare', 'workerd', 'serve', 'http-server'];

  for (const bin of bins) {
    writeGuard(path.join(nodeModulesRoot, '.bin', bin), '../../scripts/project-command.mjs');
  }
  for (const [bin, filename] of [['astro', 'bin/astro.mjs'], ['vite', 'bin/vite.js']]) {
    const packageBin = path.join(nodeModulesRoot, bin, filename);
    if (existsSync(path.dirname(packageBin))) {
      writeGuard(packageBin, '../../../scripts/project-command.mjs');
    }
  }

  if (process.env.CF_PAGES === '1') return;
  for (const bin of bins.filter((name) => !['astro', 'vite'].includes(name))) {
    const packageDir = path.join(nodeModulesRoot, bin);
    if (existsSync(path.join(packageDir, 'package.json'))) continue;
    const filename = path.join(packageDir, 'bin', `${bin}.mjs`);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(path.join(packageDir, 'package.json'), `${JSON.stringify({
      name: bin,
      version: '0.0.0-local-guard',
      private: true,
      type: 'module',
      bin: { [bin]: `bin/${bin}.mjs` },
    }, null, 2)}\n`);
    writeGuard(filename, '../../../scripts/project-command.mjs');
  }
}

function buildCloudflare() {
  if (isLocalWorkspace) throw new Error('Local builds and tests are disabled. Publish GitHub main for Cloudflare Pages validation.');
  const mode = resolveCloudflareBuildMode();
  console.log(`[cloudflare-build] mode=${mode}`);
  const scripts = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8')).scripts || {};
  const env = {
    ...process.env,
    CLOUDFLARE_BUILD_MODE: mode,
    UNIVERSAL_LAUNCHER_INTERNAL_BUILD: '1',
  };
  const customBuild = path.join(projectRoot, 'scripts', 'cloudflare-build-command.mjs');
  if (!existsSync(customBuild)) throw new Error('Missing scripts/cloudflare-build-command.mjs.');
  const result = spawnSync(process.execPath, [customBuild], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) return process.exitCode = result.status ?? 1;
  if (mode === 'full') {
    if (!Object.hasOwn(scripts, 'check:full')) throw new Error('Missing npm script check:full.');
    const npmCli = process.env.npm_execpath;
    if (!npmCli) throw new Error('Cloudflare build must start through npm run build:cloudflare.');
    const check = spawnSync(process.execPath, [npmCli, 'run', 'check:full'], {
      cwd: projectRoot,
      env,
      stdio: 'inherit',
    });
    if (check.error) throw check.error;
    if (check.status !== 0) process.exitCode = check.status ?? 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv[2] === 'install') {
      installBinGuards();
    } else if (process.argv[2] === 'build') {
      buildCloudflare();
    } else {
      printBlockedAstroMessage();
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
