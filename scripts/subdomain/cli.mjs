#!/usr/bin/env node
/**
 * Subdomain deploy — a convergence loop, not a step runner.
 *
 * There is deliberately NO state file. Every phase asks the real system whether
 * it is already satisfied, so the tool is safe to interrupt, safe to re-run, and
 * cannot go stale when something changes outside it (a deleted CNAME, a removed
 * project, an expired cert). Tracking, pausing and resuming all fall out of that:
 * the table is always true, and resuming is just running the command again.
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { cloudflareClient } from './lib/cloudflare.mjs';
import { porkbunClient } from './lib/porkbun.mjs';
import { loadEnv, requireEnv } from './lib/env.mjs';
import { PendingError, TerminalError } from './lib/errors.mjs';
import { GROUPS, phases } from './phases.mjs';
import { MARKS, bold, dim, failure, heading, log, note, phaseLine, success, yellow } from './lib/ui.mjs';
import { getTarget, targetNames } from './targets.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const USAGE = `
  ${bold('subdomain')} <command> <target> [options]

  Commands
    status     Inspect every phase. Changes nothing.
    setup      Converge the one-time phases (Cloudflare project, domain, DNS).
    deploy     Build, verify, deploy, verify live. The everyday command.
    up         setup then deploy.
    down       Remove the Porkbun CNAME. Leaves Cloudflare untouched.

  Options
    --dry-run          Show what would run without doing it.
    --from=<phase>     Skip phases before this one.
    --until=<phase>    Stop after this one.
    --wait=<minutes>   Cert-issuance poll budget (default 15).
    --port=<n>         Local verification port (default 8788).

  Targets: ${targetNames().join(', ')}
`;

function parseArgs(argv) {
  const positional = [];
  const flags = { dryRun: false, waitMs: 15 * 60_000, port: 8788, from: null, until: null };

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const [key, value] = arg.slice(2).split('=');
    if (key === 'dry-run') flags.dryRun = true;
    else if (key === 'from') flags.from = value;
    else if (key === 'until') flags.until = value;
    else if (key === 'wait') flags.waitMs = Number(value) * 60_000;
    else if (key === 'port') flags.port = Number(value);
    else if (key === 'help' || key === 'h') positional.unshift('help');
    else throw new TerminalError(`Unknown option --${key}`);
  }

  return { command: positional[0], targetName: positional[1], flags };
}

/** Which phases a command cares about. */
function selectPhases(command, flags) {
  let selected =
    command === 'setup'
      ? phases.filter((p) => p.group === GROUPS.SETUP)
      : command === 'deploy'
        ? phases.filter((p) => p.group === GROUPS.DEPLOY)
        : phases;

  if (flags.from) {
    const index = selected.findIndex((p) => p.id === flags.from);
    if (index === -1) throw new TerminalError(`--from=${flags.from} is not a phase in this command`);
    selected = selected.slice(index);
  }
  if (flags.until) {
    const index = selected.findIndex((p) => p.id === flags.until);
    if (index === -1) throw new TerminalError(`--until=${flags.until} is not a phase in this command`);
    selected = selected.slice(0, index + 1);
  }
  return selected;
}

/**
 * Clients are built lazily so credentials are only demanded by phases that
 * actually call an API. `deploy --until=verify-local` — build, generate
 * `_redirects`, prove the rules against the real Pages runtime — therefore needs
 * no credentials at all, which is the most useful part of this tool and the part
 * worth being able to run on any machine.
 */
function makeContext(target, flags) {
  const cache = {};

  return {
    target,
    flags,
    phaseResults: {},
    paths: { root, dist: resolve(root, 'dist') },

    get cf() {
      if (!cache.cf) {
        const env = requireEnv('CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID');
        cache.cf = cloudflareClient({
          token: env.CLOUDFLARE_API_TOKEN,
          accountId: env.CLOUDFLARE_ACCOUNT_ID,
        });
      }
      return cache.cf;
    },

    get pb() {
      if (!cache.pb) {
        const env = requireEnv('PORKBUN_API_KEY', 'PORKBUN_SECRET_API_KEY');
        cache.pb = porkbunClient({
          apiKey: env.PORKBUN_API_KEY,
          secretApiKey: env.PORKBUN_SECRET_API_KEY,
        });
      }
      return cache.pb;
    },
  };
}

async function commandStatus(ctx, selected) {
  heading(ctx.target);
  for (const [index, phase] of selected.entries()) {
    let result;
    try {
      result = await phase.check(ctx);
    } catch (error) {
      phaseLine(index + 1, MARKS.failed, phase.id, error.message.split('\n')[0]);
      continue;
    }
    ctx.phaseResults[phase.id] = result;
    const mark = phase.always
      ? MARKS.skipped
      : result.satisfied
        ? MARKS.satisfied
        : result.undrifted
          ? MARKS.failed
          : MARKS.todo;
    phaseLine(index + 1, mark, phase.id, result.detail);
  }
  log();
}

async function commandConverge(ctx, selected) {
  heading(ctx.target);

  for (const [index, phase] of selected.entries()) {
    const n = index + 1;

    let result;
    try {
      result = await phase.check(ctx);
    } catch (error) {
      phaseLine(n, MARKS.failed, phase.id);
      throw error;
    }
    ctx.phaseResults[phase.id] = result;

    if (result.satisfied && !phase.always) {
      phaseLine(n, MARKS.satisfied, phase.id, result.detail);
      continue;
    }

    if (ctx.flags.dryRun) {
      phaseLine(n, MARKS.running, phase.id, `would run — ${result.detail ?? ''}`);
      continue;
    }

    phaseLine(n, MARKS.running, phase.id, result.detail);
    const detail = await phase.run(ctx);
    ctx.phaseResults[phase.id] = { satisfied: true, detail };
    phaseLine(n, MARKS.satisfied, phase.id, detail ?? 'done');
  }

  log();
}

async function commandDown(ctx) {
  heading(ctx.target);
  const { target, pb } = ctx;

  const records = await pb.findRecords({
    zone: target.zone,
    record: target.record,
    type: 'CNAME',
  });

  if (!records.length) {
    log(`  ${MARKS.satisfied} CNAME already absent — nothing to do.`);
    log();
    return;
  }

  if (ctx.flags.dryRun) {
    log(`  ${MARKS.running} would delete CNAME ${target.record} → ${records[0].content}`);
    log();
    return;
  }

  await pb.deleteRecords({ zone: target.zone, record: target.record, type: 'CNAME' });
  success(`Deleted CNAME ${target.host}. The subdomain will stop resolving.`);
  note('The Cloudflare project and custom domain are left in place on purpose:');
  note('repeated add/remove cycles get the domain rate-limited by the certificate');
  note('authority and stuck on "initializing", which needs Cloudflare staff to clear.');
  log();
}

async function main() {
  loadEnv(root);
  const { command, targetName, flags } = parseArgs(process.argv.slice(2));

  if (!command || command === 'help') {
    log(USAGE);
    return 0;
  }
  if (!targetName) throw new TerminalError(`Missing target. One of: ${targetNames().join(', ')}`);

  const target = getTarget(targetName);
  const ctx = makeContext(target, flags);

  switch (command) {
    case 'status':
      await commandStatus(ctx, selectPhases('up', flags));
      return 0;
    case 'down':
      await commandDown(ctx);
      return 0;
    case 'setup':
    case 'deploy':
    case 'up': {
      const selected = selectPhases(command, flags);
      await commandConverge(ctx, selected);

      const last = selected.at(-1)?.id;
      const reachedEnd = last === 'verify-remote' || (command === 'setup' && last === 'dns-active');

      success(
        flags.dryRun
          ? 'Dry run — nothing was changed.'
          : !reachedEnd
            ? `Stopped after "${last}" as requested. Re-run without --until to continue.`
            : command === 'setup'
              ? `Setup converged for ${target.host}.`
              : `${target.host} is live and verified.`
      );
      log();
      return 0;
    }
    default:
      throw new TerminalError(`Unknown command "${command}"`);
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    if (error instanceof PendingError) {
      log();
      log(`  ${yellow('⏳')} ${error.message}`);
      if (error.hint) note(error.hint);
      log();
      // Not a failure: nothing is half-done and re-running resumes cleanly.
      process.exit(0);
    }

    failure(error.message);
    if (error.hint) note(error.hint);
    if (error.url) note(error.url);
    if (!(error instanceof TerminalError) && process.env.DEBUG) log(dim(error.stack));
    log();
    process.exit(1);
  });
