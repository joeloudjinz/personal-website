/** Terminal rendering. No dependencies; honours NO_COLOR. */

const useColour = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code) => (s) => (useColour ? `[${code}m${s}[0m` : s);

export const dim = wrap('2');
export const bold = wrap('1');
export const green = wrap('32');
export const yellow = wrap('33');
export const red = wrap('31');
export const blue = wrap('36');

/** Phase state → glyph. Mirrors the vocabulary used in the runbook. */
export const MARKS = {
  satisfied: green('✓'),
  pending: yellow('⏳'),
  running: blue('→'),
  todo: dim('·'),
  failed: red('✗'),
  skipped: dim('–'),
};

export function log(message = '') {
  process.stdout.write(`${message}\n`);
}

export function heading(target) {
  log();
  log(`  ${bold(target.slug)} ${dim('→')} ${bold(target.host)}`);
  log();
}

/**
 * One line of the phase table. Kept to a fixed shape so successive runs are
 * visually diffable.
 */
export function phaseLine(index, mark, id, detail = '') {
  const n = String(index).padStart(2, ' ');
  const name = id.padEnd(14, ' ');
  log(`  ${mark} ${dim(n)}  ${name} ${detail ? dim(detail) : ''}`.trimEnd());
}

export function note(message) {
  log(`     ${dim(message)}`);
}

export function failure(message) {
  log();
  log(`  ${red('✗')} ${message}`);
}

export function success(message) {
  log();
  log(`  ${green('✓')} ${message}`);
}
