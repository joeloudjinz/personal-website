import { readFile } from 'node:fs/promises';

/**
 * Scrapes the real asset paths out of a built page.
 *
 * Deliberately reads the built HTML rather than hard-coding filenames: Astro
 * content-hashes every asset, so any fixed list goes stale on the next build.
 * Takes one representative of each asset kind — enough to prove the shield rules
 * work without probing all eighty-odd files.
 */
export async function assetPathsFrom(htmlFile) {
  const html = await readFile(htmlFile, 'utf8');
  const all = [...html.matchAll(/\/_astro\/[^"'\s,]+/g)].map((m) => m[0]);

  const byExtension = new Map();
  for (const path of all) {
    const extension = path.split('.').pop();
    if (!byExtension.has(extension)) byExtension.set(extension, path);
  }
  return [...byExtension.values()];
}

/** Follows nothing — we want to observe the redirect itself, not its destination. */
async function probeOne(base, { path, expect, to }) {
  let response;
  try {
    response = await fetch(`${base}${path}`, { redirect: 'manual' });
  } catch (error) {
    return { path, ok: false, actual: `unreachable (${error.cause?.code ?? error.message})` };
  }

  const location = response.headers.get('location');
  const statusOk = response.status === expect;
  const targetOk = !to || location === to;

  return {
    path,
    ok: statusOk && targetOk,
    actual: `${response.status}${location ? ` → ${location}` : ''}`,
  };
}

/**
 * Runs the whole matrix. Sequential on purpose — the local dev server is
 * single-process and this is a dozen requests, so concurrency buys nothing and
 * makes failures harder to read.
 */
export async function probeAll(base, checks) {
  const results = [];
  for (const check of checks) {
    results.push({ ...check, ...(await probeOne(base, check)) });
  }
  return { results, ok: results.every((r) => r.ok) };
}

export async function waitForServer(base, { timeoutMs = 45_000, intervalMs = 500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(base, { redirect: 'manual' });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  return false;
}
