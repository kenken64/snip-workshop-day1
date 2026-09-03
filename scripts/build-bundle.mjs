#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const backendDir = join(root, 'backend');
const frontendDir = join(root, 'frontend');
const cliDir = join(root, 'cli');
const bundleDir = join(root, 'bundle');
const frontendOutput = join(frontendDir, 'dist', 'snip-frontend', 'browser');
const shouldPush = process.argv.includes('--push');

function bin(name) {
  return process.platform === 'win32' ? `${name}.cmd` : name;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    stdio: options.stdio || 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }

  return result;
}

function hasStagedChanges(cwd) {
  const result = spawnSync('git', ['diff', '--cached', '--quiet'], {
    cwd,
    stdio: 'ignore',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status === 1;
}

async function emptyDirectory(path) {
  await mkdir(path, { recursive: true });

  for (const entry of await readdir(path)) {
    if (entry === '.git') {
      continue;
    }

    await rm(join(path, entry), { recursive: true, force: true });
  }
}

async function assembleBundle() {
  console.log('Assembling bundle/');
  await emptyDirectory(bundleDir);
  await mkdir(join(bundleDir, 'public'), { recursive: true });

  await cp(join(backendDir, 'server.js'), join(bundleDir, 'server.js'));
  await cp(join(cliDir, 'cli.js'), join(bundleDir, 'cli.js'));
  await cp(frontendOutput, join(bundleDir, 'public'), { recursive: true });

  await writeFile(join(bundleDir, '.env'), 'PUBLIC_DIR=./public\n');
  await writeFile(join(bundleDir, 'package.json'), `${JSON.stringify({
    name: 'snip-bundle',
    scripts: {
      start: 'bun server.js',
    },
  }, null, 2)}\n`);
  await writeFile(join(bundleDir, 'Dockerfile'), [
    'FROM oven/bun:1-alpine',
    'WORKDIR /app',
    'COPY . .',
    'ENV PORT=3000',
    'EXPOSE 3000',
    'CMD bun server.js',
    '',
  ].join('\n'));
  await writeFile(join(bundleDir, '.dockerignore'), [
    '.git',
    'node_modules',
    'npm-debug.log',
    'Dockerfile',
    '.dockerignore',
    '',
  ].join('\n'));
  await writeFile(join(bundleDir, 'railway.json'), `${JSON.stringify({
    $schema: 'https://railway.app/railway.schema.json',
    build: {
      builder: 'DOCKERFILE',
    },
  }, null, 2)}\n`);
}

function commitIfChanged(cwd, paths, message, unchangedMessage) {
  run('git', ['add', ...paths], { cwd });

  if (!hasStagedChanges(cwd)) {
    console.log(unchangedMessage);
    return false;
  }

  run('git', ['commit', '-m', message], { cwd });
  return true;
}

console.log('Updating source submodules');
run('git', ['submodule', 'update', '--init', '--remote', 'backend', 'frontend', 'cli']);

console.log('Installing frontend dependencies');
run(bin('npm'), ['install'], { cwd: frontendDir });

console.log('Building frontend');
run(bin('npx'), ['ng', 'build'], { cwd: frontendDir });

const indexHtml = join(frontendOutput, 'index.html');
if (!existsSync(indexHtml)) {
  throw new Error(`Expected frontend build output is missing: ${indexHtml}`);
}

await assembleBundle();

const bundleChanged = commitIfChanged(
  bundleDir,
  ['-A'],
  'Build generated bundle',
  'Bundle unchanged; nothing to commit.'
);

const superprojectChanged = commitIfChanged(
  root,
  ['backend', 'frontend', 'cli', 'bundle', '.gitmodules'],
  'Update submodule pointers',
  'Superproject unchanged; nothing to commit.'
);

if (shouldPush) {
  console.log('Pushing bundle branch');
  run('git', ['push', 'origin', 'HEAD:bundle'], { cwd: bundleDir });

  console.log('Pushing main branch');
  run('git', ['push', 'origin', 'main'], { cwd: root });
} else if (bundleChanged || superprojectChanged) {
  console.log('Run again with --push to publish the generated bundle and main pointer.');
}
