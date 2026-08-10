import { existsSync } from 'node:fs';
import { readFile, stat, writeFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { resolveCname } from 'node:dns/promises';

import { readDomainStatus } from './lib/cloudflare.mjs';
import { PendingError, TerminalError } from './lib/errors.mjs';
import { buildRedirects, expectations } from './lib/redirects.mjs';
import { assetPathsFrom, probeAll, waitForServer } from './lib/probe.mjs';
import { LOCAL_COMPATIBILITY_DATE, background, envWithoutSecrets, run } from './lib/run.mjs';

const SETUP = 'setup';
const DEPLOY = 'deploy';

/** Newest mtime under a path, so `build` can tell fresh output from stale. */
async function newestMtime(path, newest = 0) {
  let entries;
  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch {
    const info = await stat(path).catch(() => null);
    return info ? Math.max(newest, info.mtimeMs) : newest;
  }
  for (const entry of entries) {
    const child = join(path, entry.name);
    newest = entry.isDirectory()
      ? await newestMtime(child, newest)
      : Math.max(newest, (await stat(child)).mtimeMs);
  }
  return newest;
}

/**
 * @typedef {object} Phase
 * @property {string} id
 * @property {string} group
 * @property {boolean} [always]  Runs every time; its check is informational only.
 * @property {(ctx: any) => Promise<{satisfied: boolean, detail?: string}>} check
 * @property {(ctx: any) => Promise<string|void>} [run]
 */

/** @type {Phase[]} */
export const phases = [
  {
    id: 'preflight',
    group: SETUP,
    async check({ cf, pb }) {
      const [cfOk, pbIp] = await Promise.all([
        cf.getProject('___connectivity_probe___').then(
          () => 'ok',
          (error) => (error.notFound ? 'ok' : error)
        ),
        pb.ping().then((ip) => ip, (error) => error),
      ]);

      if (cfOk instanceof Error) throw cfOk;
      if (pbIp instanceof Error) throw pbIp;
      return { satisfied: true, detail: `cloudflare ok · porkbun ok (${pbIp})` };
    },
  },

  {
    id: 'cf-project',
    group: SETUP,
    async check({ cf, target }) {
      const project = await cf.getProject(target.project);
      if (!project) return { satisfied: false, detail: 'not created' };

      // A mismatched production branch is the silent-preview trap: deploys land
      // as previews and the custom domain serves nothing. Report it as drift
      // rather than quietly accepting it — we cannot fix it via this API.
      if (project.production_branch !== target.branch) {
        return {
          satisfied: false,
          detail: `production branch is "${project.production_branch}", expected "${target.branch}"`,
          undrifted: true,
        };
      }
      return { satisfied: true, detail: `production branch: ${project.production_branch}` };
    },
    async run({ cf, target }) {
      const existing = await cf.getProject(target.project);
      if (existing) {
        throw new TerminalError(
          `Pages project "${target.project}" has production branch "${existing.production_branch}", ` +
            `but this target expects "${target.branch}".`,
          {
            hint:
              'Change it in the dashboard under Settings → Builds → Branch control, ' +
              'or update the target. Deleting and recreating the project is not worth it.',
          }
        );
      }
      await cf.createProject({ name: target.project, productionBranch: target.branch });
      return `created ${target.project} (${target.branch})`;
    },
  },

  {
    id: 'cf-domain',
    group: SETUP,
    async check({ cf, target }) {
      const domain = await cf.getDomain(target.project, target.host);
      if (!domain) return { satisfied: false, detail: 'not registered' };
      const { status } = readDomainStatus(domain);
      return { satisfied: true, detail: `registered (${status})` };
    },
    async run({ cf, target }) {
      // MUST happen before the CNAME exists. A CNAME pointing at Pages without the
      // domain registered here yields a 522 that reads as a DNS fault.
      await cf.addDomain(target.project, target.host);
      return `registered ${target.host}`;
    },
  },

  {
    id: 'dns-cname',
    group: SETUP,
    async check({ pb, target }) {
      const want = `${target.project}.pages.dev`;
      const records = await pb.findRecords({
        zone: target.zone,
        record: target.record,
        type: 'CNAME',
      });
      // Empty array with status SUCCESS is the normal "no such record" response.
      if (!records.length) return { satisfied: false, detail: 'absent' };

      const match = records.find((r) => r.content === want);
      if (!match) {
        return {
          satisfied: false,
          detail: `points at ${records[0].content}, expected ${want}`,
          undrifted: true,
        };
      }
      return { satisfied: true, detail: `${target.record} → ${want} (ttl ${match.ttl})` };
    },
    async run({ pb, target, phaseResults }) {
      if (!phaseResults['cf-domain']?.satisfied) {
        throw new TerminalError(
          'Refusing to create the CNAME before the custom domain is registered on the Pages project.',
          { hint: 'That ordering produces a 522 that looks like a DNS fault. Run cf-domain first.' }
        );
      }
      const content = `${target.project}.pages.dev`;
      const existing = await pb.findRecords({
        zone: target.zone,
        record: target.record,
        type: 'CNAME',
      });
      if (existing.length) {
        throw new TerminalError(
          `A CNAME for "${target.record}.${target.zone}" already exists pointing at ${existing[0].content}.`,
          { hint: `Remove it, or run \`subdomain:down ${target.slug}\` first.` }
        );
      }
      await pb.createRecord({
        zone: target.zone,
        record: target.record,
        type: 'CNAME',
        content,
      });
      return `created ${target.record} → ${content}`;
    },
  },

  {
    id: 'dns-active',
    group: SETUP,
    async check({ cf, target }) {
      const domain = await cf.getDomain(target.project, target.host);
      if (!domain) return { satisfied: false, detail: 'domain not registered yet' };

      const state = readDomainStatus(domain);
      if (state.terminal) {
        throw new TerminalError(
          `Custom domain is "${state.status}" and will not recover by waiting: ${
            state.message ?? 'no detail given'
          }`,
          { hint: 'Check CAA records and any zone hold. Re-adding the domain risks a CA rate limit.' }
        );
      }
      return {
        satisfied: state.active,
        detail: state.active
          ? `active (${state.authority ?? 'cert issued'})`
          : `${state.status} — cert issuing`,
      };
    },
    async run({ cf, target, flags }) {
      // Poll only. Never delete-and-re-add to "nudge" it: repeated add/remove
      // cycles get the domain rate-limited by the CA and stuck on "initializing",
      // which needs Cloudflare staff to clear. Waiting is always the right move.
      const deadline = Date.now() + flags.waitMs;
      const cname = await resolveCname(target.host).catch(() => []);
      if (!cname.length) {
        throw new PendingError('CNAME is not resolving publicly yet.', {
          hint: 'DNS propagation. Re-run in a few minutes.',
        });
      }

      while (Date.now() < deadline) {
        const state = readDomainStatus(await cf.getDomain(target.project, target.host));
        if (state.active) return `active (${state.authority ?? 'cert issued'})`;
        if (state.terminal) {
          throw new TerminalError(
            `Custom domain is "${state.status}": ${state.message ?? 'no detail given'}`
          );
        }
        await new Promise((r) => setTimeout(r, 10_000));
      }

      throw new PendingError(
        `Still "${
          readDomainStatus(await cf.getDomain(target.project, target.host)).status
        }" after ${Math.round(flags.waitMs / 60_000)} minutes.`,
        {
          hint:
            'Normal for a first issuance. Re-run this command later — nothing is half-done. ' +
            'Escalate only after ~24h.',
        }
      );
    },
  },

  {
    id: 'build',
    group: DEPLOY,
    async check({ paths, target }) {
      const page = join(paths.dist, target.slug, 'index.html');
      if (!existsSync(page)) return { satisfied: false, detail: 'not built' };

      const built = (await stat(page)).mtimeMs;
      const sources = await Promise.all(
        ['src', 'public', 'astro.config.mjs', 'package.json']
          .map((p) => resolve(paths.root, p))
          .filter(existsSync)
          .map((p) => newestMtime(p))
      );
      const newestSource = Math.max(...sources);
      return newestSource > built
        ? { satisfied: false, detail: 'stale — sources changed since last build' }
        : { satisfied: true, detail: `dist/${target.slug}/ up to date` };
    },
    async run({ paths, target }) {
      // Quiet: a few hundred lines of Astro output would bury the phase table,
      // and the table is the point. Failures re-raise with the captured output.
      await run('npm', ['run', 'build'], { cwd: paths.root, quiet: true });
      const page = join(paths.dist, target.slug, 'index.html');
      if (!existsSync(page)) {
        throw new TerminalError(
          `Build succeeded but ${target.slug}/index.html was not emitted.`,
          { hint: `Is "${target.slug}" a real entry in the projectPages collection?` }
        );
      }
      return 'built';
    },
  },

  {
    id: 'checkout',
    group: DEPLOY,
    async check({ paths, flags }) {
      // Deploys come from the main checkout, not a feature worktree. The reason
      // is not tidiness: a worktree is a different branch with a different .env,
      // and this tool builds whatever checkout it is run from. Deploying from
      // one ships a feature branch to production under a config that was never
      // meant to leave the branch, and nothing downstream would say so.
      const gitDir = await run('git', ['rev-parse', '--git-dir'], {
        cwd: paths.root, quiet: true
      }).then((s) => s.trim(), () => null);
      const commonDir = await run('git', ['rev-parse', '--git-common-dir'], {
        cwd: paths.root, quiet: true
      }).then((s) => s.trim(), () => null);

      if (!gitDir || !commonDir) return { satisfied: true, detail: 'not a git checkout' };

      const inWorktree = gitDir !== commonDir;
      if (inWorktree && !flags.allowWorktree) {
        return { satisfied: false, detail: 'running from a linked worktree', undrifted: true };
      }
      return { satisfied: true, detail: inWorktree ? 'worktree (allowed)' : 'main checkout' };
    },
    async run() {
      throw new TerminalError(
        'This is a linked worktree, and deploys are meant to run from the main checkout.',
        {
          hint:
            'A worktree carries a different branch and its own .env, so deploying from ' +
            'one ships branch state under the wrong config. Merge first and deploy from ' +
            'the main checkout, or pass --allow-worktree if this is the exception.'
        }
      );
    }
  },

  {
    id: 'analytics',
    group: DEPLOY,
    async check({ paths, target }) {
      // Checks the built artefact, not the environment. PUBLIC_GTAG_MEASUREMENT_ID
      // is read at build time and the tag is emitted conditionally, so a build
      // made without it produces a page that looks perfect and measures nothing.
      // Nothing downstream would notice, which is exactly why this is a phase.
      const page = join(paths.dist, target.slug, 'index.html');
      if (!existsSync(page)) return { satisfied: false, detail: 'nothing built yet' };

      const html = await readFile(page, 'utf8');
      const id = html.match(/G-[A-Z0-9]{6,}/)?.[0];
      if (!id) {
        return {
          satisfied: false,
          detail: 'built page carries no analytics tag',
          undrifted: true
        };
      }
      return { satisfied: true, detail: `${id} present` };
    },
    async run() {
      throw new TerminalError(
        'The built page has no Google Analytics tag, so this deploy would measure nothing.',
        {
          hint:
            'PUBLIC_GTAG_MEASUREMENT_ID is read at build time. Add it to .env in the ' +
            'repository root and re-run — the build phase will pick it up. ' +
            'Deploy without analytics deliberately with --from=redirects.'
        }
      );
    }
  },

  {
    id: 'redirects',
    group: DEPLOY,
    async check({ paths, target }) {
      const file = join(paths.dist, '_redirects');
      if (!existsSync(file)) return { satisfied: false, detail: 'absent' };
      const actual = await readFile(file, 'utf8');
      return actual === buildRedirects(target)
        ? { satisfied: true, detail: '4 rules, generated' }
        : { satisfied: false, detail: 'drifted from generated content' };
    },
    async run({ paths, target }) {
      await writeFile(join(paths.dist, '_redirects'), buildRedirects(target));
      return 'written';
    },
  },

  {
    id: 'verify-local',
    group: DEPLOY,
    always: true,
    async check() {
      return { satisfied: false, detail: 'runs every deploy' };
    },
    async run({ paths, target, flags }) {
      const base = `http://127.0.0.1:${flags.port}`;

      // Refuse to run if something already holds the port. Wrangler fails to
      // bind and keeps going, so the probes would hit whatever is already there
      // and report a pass or a failure about the wrong build entirely. A
      // verification that can silently test something else is worse than none.
      const squatter = await fetch(base, { redirect: 'manual' }).then(() => true, () => false);
      if (squatter) {
        throw new TerminalError(
          `Something is already listening on port ${flags.port}.`,
          { hint: `Stop it, or pass --port=<n> to verify against a free port.` }
        );
      }

      const server = background(
        'npx',
        [
          'wrangler',
          'pages',
          'dev',
          paths.dist,
          '--port',
          String(flags.port),
          '--ip',
          '127.0.0.1',
          `--compatibility-date=${LOCAL_COMPATIBILITY_DATE}`,
        ],
        // Credentials withheld: this server serves static files and needs none.
        { cwd: paths.root, env: envWithoutSecrets() }
      );

      try {
        if (!(await waitForServer(base))) {
          throw new TerminalError(
            `Local Pages runtime did not start.\n${server.output.slice(-1200)}`
          );
        }
        const assets = await assetPathsFrom(join(paths.dist, target.slug, 'index.html'));
        const { results, ok } = await probeAll(base, expectations(target, assets));
        if (!ok) {
          const failed = results
            .filter((r) => !r.ok)
            .map((r) => `      ${r.path} → ${r.actual} (wanted ${r.expect})`)
            .join('\n');
          throw new TerminalError(`Local verification failed:\n${failed}`);
        }
        return `${results.length} probes passed locally`;
      } finally {
        await server.stop();
      }
    },
  },

  {
    id: 'deploy',
    group: DEPLOY,
    always: true,
    async check({ cf, target }) {
      const deployments = await cf.listDeployments(target.project).catch(() => null);
      const production = deployments?.find((d) => d.environment === 'production');
      return {
        satisfied: false,
        detail: production
          ? `last production deploy ${new Date(production.created_on).toISOString().slice(0, 16).replace('T', ' ')}`
          : 'never deployed',
      };
    },
    async run({ paths, target }) {
      // --branch is not optional. Inside a git worktree wrangler auto-detects the
      // current branch, which will not match the production branch, and the deploy
      // lands as a preview while the custom domain serves nothing.
      await run(
        'npx',
        [
          'wrangler',
          'pages',
          'deploy',
          paths.dist,
          `--project-name=${target.project}`,
          `--branch=${target.branch}`,
          '--commit-dirty=true',
        ],
        { cwd: paths.root }
      );
      return `deployed to ${target.branch}`;
    },
  },

  {
    id: 'verify-remote',
    group: DEPLOY,
    always: true,
    async check() {
      return { satisfied: false, detail: 'runs every deploy' };
    },
    async run({ paths, target }) {
      const assets = await assetPathsFrom(join(paths.dist, target.slug, 'index.html'));
      const { results, ok } = await probeAll(
        `https://${target.host}`,
        expectations(target, assets)
      );
      if (!ok) {
        const failed = results
          .filter((r) => !r.ok)
          .map((r) => `      ${r.path} → ${r.actual} (wanted ${r.expect})`)
          .join('\n');
        throw new TerminalError(`Live verification failed:\n${failed}`);
      }
      return `${results.length} probes passed against ${target.host}`;
    },
  },
];

export const GROUPS = { SETUP, DEPLOY };
