import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { TerminalError } from './errors.mjs';

/**
 * Loads .env if present. Real environment variables win, matching the behaviour
 * of every other tool in the deploy path — CI can export them without a file.
 */
export function loadEnv(cwd = process.cwd()) {
  const file = resolve(cwd, '.env');
  if (!existsSync(file)) return;
  const before = { ...process.env };
  process.loadEnvFile(file);
  for (const [key, value] of Object.entries(before)) {
    if (value !== undefined) process.env[key] = value;
  }
}

const WHERE = {
  CLOUDFLARE_API_TOKEN:
    'dashboard → My Profile → API Tokens. Permission: Account → Cloudflare Pages → Edit',
  CLOUDFLARE_ACCOUNT_ID: 'dashboard → Workers & Pages → Account ID in the right-hand pane',
  PORKBUN_API_KEY: 'https://porkbun.com/account/api',
  PORKBUN_SECRET_API_KEY: 'https://porkbun.com/account/api',
};

/**
 * Fail with the variable name and where to get it, rather than a stack trace
 * three phases later.
 */
export function requireEnv(...names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) {
    const lines = missing.map((name) => `  ${name} — ${WHERE[name] ?? 'see .env.example'}`);
    throw new TerminalError(
      `Missing credentials:\n${lines.join('\n')}`,
      { hint: 'Copy .env.example to .env and fill these in.' }
    );
  }
  return Object.fromEntries(names.map((name) => [name, process.env[name]]));
}
