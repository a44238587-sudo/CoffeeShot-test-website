#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isAllowedCloudflareBuild, printPublicationInstructions } from './project-command.mjs';

if (!isAllowedCloudflareBuild() || process.env.CLOUDFLARE_BUILD_MODE !== 'full') {
  printPublicationInstructions();
  process.exit(1);
}

const typecheck = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'], {
  cwd: process.cwd(), env: process.env, stdio: 'inherit',
});
if (typecheck.error) throw typecheck.error;
if (typecheck.status !== 0) process.exit(typecheck.status ?? 1);

const html = readFileSync('dist/index.html', 'utf8');
if (!html.includes('<html') || statSync('dist/index.html').size === 0) {
  throw new Error('Missing published CoffeeShot test page.');
}

function scripts(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return scripts(file);
    return entry.isFile() && file.endsWith('.js') ? [file] : [];
  });
}
const bundles = scripts('dist');
if (!bundles.some((file) => readFileSync(file, 'utf8').includes('coffeeshot-sdk-git.pages.dev'))) {
  throw new Error('Published CoffeeShot test site does not reference the Git-connected SDK.');
}
console.log('[cloudflare-build] Full CoffeeShot test website checks passed.');
