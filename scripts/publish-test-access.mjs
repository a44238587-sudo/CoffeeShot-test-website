import { cpSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { isAllowedCloudflareBuild } from './project-command.mjs';
if (!isAllowedCloudflareBuild()) throw new Error('Login assets are published only by the remote Pages build.');
cpSync('src/test-access', 'dist/test-access', { recursive: true });
mkdirSync('dist/_test-auth', { recursive: true });
for (const file of ['index.js', 'flow.js', 'flow-controller.js', 'cookie-client.js', 'recovery.js']) {
  copyFileSync(`node_modules/website-auth-sdk/src/${file}`, `dist/_test-auth/${file}`);
}
// No route may bypass root middleware, including static assets.
writeFileSync('dist/_routes.json', JSON.stringify({ version: 1, include: ['/*'], exclude: [] }) + '\n');
