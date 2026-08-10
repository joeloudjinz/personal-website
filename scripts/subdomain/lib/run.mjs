import { spawn } from 'node:child_process';

/** Runs a command, streaming output through. Rejects on non-zero exit. */
export function run(command, args, { cwd, env, quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    let captured = '';
    if (quiet) {
      child.stdout.on('data', (d) => (captured += d));
      child.stderr.on('data', (d) => (captured += d));
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(captured);
      else reject(new Error(`${command} ${args.join(' ')} exited ${code}\n${captured}`));
    });
  });
}

/**
 * Starts a long-running process and returns a handle with a stop().
 * Used for the local Pages dev server during verification.
 */
/**
 * `env` REPLACES the process environment rather than extending it — the one
 * caller needs to withhold credentials, and a merge would quietly hand them
 * back. See envWithoutSecrets.
 */
export function background(command, args, { cwd, env } = {}) {
  const child = spawn(command, args, {
    cwd,
    env: env ?? process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (d) => (output += d));
  child.stderr.on('data', (d) => (output += d));

  return {
    child,
    get output() {
      return output;
    },
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          child.kill('SIGKILL');
          resolve();
        }, 5000);
        child.on('close', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    },
  };
}

/**
 * Compatibility date for the local `pages dev` runtime.
 *
 * Wrangler defaults this to *today*, which the bundled workerd refuses because
 * its ceiling is whatever the installed binary shipped with. The first version
 * of this pinned "yesterday", which worked on the day it was written and broke
 * the next: the ceiling does not advance with the calendar, it is fixed by the
 * wrangler version. Wrangler 4.120.0 tops out at 2026-08-08, so "yesterday" was
 * already a day too new the following morning.
 *
 * A fixed past date has no downside here. Compatibility dates gate opt-in
 * behaviour changes in the Workers runtime, and this server has no Worker to
 * change — wrangler prints "No Functions. Shimming..." and serves static assets
 * with `_redirects`. Nothing this verifies depends on the date, so the only
 * requirement is that every wrangler we might run accepts it.
 */
export const LOCAL_COMPATIBILITY_DATE = '2025-01-01';

/**
 * Environment for the local dev server, with credentials withheld.
 *
 * Two separate leaks, and the second is the one that actually bit.
 *
 * 1. Process environment. Filtered by pattern below. Wrangler only forwards
 *    these when CLOUDFLARE_INCLUDE_PROCESS_ENV is set, so this is hygiene
 *    rather than a live fix — but it costs nothing and the server needs no
 *    credentials at all.
 *
 * 2. `.env` on disk. Since August 2025 wrangler loads .env itself in local dev
 *    and binds every key into the Worker, independent of what it is handed as
 *    an environment. That is how CLOUDFLARE_API_TOKEN and
 *    PORKBUN_SECRET_API_KEY ended up listed as bindings on a static-file server
 *    that has no use for either — and, because this tool prints the server's
 *    output when it fails to start, into the terminal too. Wrangler masks the
 *    values; the names still leak, and the Worker still gets them.
 *
 *    CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false is the documented off switch,
 *    and is the fix. Filtering the process environment alone does nothing here.
 *
 * Deny by pattern rather than allow by name: an allowlist that forgets PATH or
 * HOME fails confusingly, while catching one variable too many costs nothing.
 */
const SECRET_PATTERN = /(TOKEN|SECRET|_KEY|APIKEY|PASSWORD|CREDENTIAL|ACCOUNT_ID)/i;

export function envWithoutSecrets(source = process.env) {
  const clean = Object.fromEntries(
    Object.entries(source).filter(([key]) => !SECRET_PATTERN.test(key))
  );
  clean.CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = 'false';
  return clean;
}
