#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const API = (process.env.SNIP_API || 'http://localhost:3000').replace(/\/$/, '');

function usage() {
  console.log(`Usage:
  snip add <url>     Shorten a URL
  snip ls            List shortened links
  snip open <code>   Open a short code in your browser
  snip help          Show this help`);
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function readJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(path, options) {
  try {
    return await fetch(`${API}${path}`, options);
  } catch {
    throw new Error(`Could not reach Snip backend at ${API}.`);
  }
}

async function add(url) {
  if (!url || !isHttpUrl(url)) {
    fail('Usage: snip add <http-or-https-url>');
    return;
  }

  const response = await request('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const body = await readJson(response);

  if (!response.ok) {
    fail(body?.error || `Backend returned ${response.status}.`);
    return;
  }

  console.log(body.shortUrl);
}

async function list() {
  const response = await request('/api/links');
  const links = await readJson(response);

  if (!response.ok) {
    fail(links?.error || `Backend returned ${response.status}.`);
    return;
  }

  if (!Array.isArray(links) || links.length === 0) {
    console.log('No links yet.');
    return;
  }

  const codeWidth = Math.max('CODE'.length, ...links.map((link) => String(link.code).length));
  const hitsWidth = Math.max('HITS'.length, ...links.map((link) => String(link.hits).length));

  console.log(`${'CODE'.padEnd(codeWidth)}  ${'HITS'.padStart(hitsWidth)}  URL`);

  for (const link of links) {
    console.log(`${String(link.code).padEnd(codeWidth)}  ${String(link.hits).padStart(hitsWidth)}  ${link.url}`);
  }
}

function openerCommand(target) {
  if (process.platform === 'win32') {
    return { command: 'cmd', args: ['/c', 'start', '', target] };
  }

  if (process.platform === 'darwin') {
    return { command: 'open', args: [target] };
  }

  return { command: 'xdg-open', args: [target] };
}

async function openCode(code) {
  if (!code) {
    fail('Usage: snip open <code>');
    return;
  }

  const response = await request(`/${encodeURIComponent(code)}`, { redirect: 'manual' });
  const location = response.headers.get('location');

  if (response.status === 404) {
    fail(`Unknown short code: ${code}`);
    return;
  }

  if (response.status < 300 || response.status >= 400 || !location) {
    fail(`Backend returned ${response.status}.`);
    return;
  }

  const { command, args } = openerCommand(location);
  const result = spawnSync(command, args, { stdio: 'ignore' });

  if (result.error || result.status !== 0) {
    fail(`Could not open browser for ${location}.`);
    return;
  }

  console.log(location);
}

async function main() {
  const [command, value] = process.argv.slice(2);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    return;
  }

  try {
    if (command === 'add') {
      await add(value);
      return;
    }

    if (command === 'ls') {
      await list();
      return;
    }

    if (command === 'open') {
      await openCode(value);
      return;
    }

    fail(`Unknown command: ${command}`);
    usage();
  } catch (error) {
    fail(error.message || 'Snip command failed.');
  }
}

main();
