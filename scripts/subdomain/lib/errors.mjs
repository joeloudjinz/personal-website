/**
 * Two error kinds, because the convergence loop treats them differently.
 *
 * Terminal  — stop now, retrying will never help. A bad credential, a CAA record
 *             blocking issuance, a zone hold. Surfacing these as "still pending"
 *             would leave the user re-running a command forever.
 * Pending   — not done yet, but on track. Exit cleanly and invite a re-run.
 */

export class TerminalError extends Error {
  /** @param {string} message @param {{hint?: string, url?: string}} [extra] */
  constructor(message, extra = {}) {
    super(message);
    this.name = 'TerminalError';
    this.hint = extra.hint;
    this.url = extra.url;
  }
}

export class PendingError extends Error {
  /** @param {string} message @param {{hint?: string}} [extra] */
  constructor(message, extra = {}) {
    super(message);
    this.name = 'PendingError';
    this.hint = extra.hint;
  }
}
