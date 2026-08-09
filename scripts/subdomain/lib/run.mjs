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
export function background(command, args, { cwd, env } = {}) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
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
 * Wrangler defaults compatibility_date to today, but the bundled workerd binary
 * only supports up to the previous day, so `pages dev` dies on startup with a
 * confusing "newest date supported by this server binary" error. Pin yesterday.
 */
export function yesterdayISO(now = new Date()) {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
