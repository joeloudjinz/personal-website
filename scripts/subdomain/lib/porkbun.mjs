import { TerminalError } from './errors.mjs';

/**
 * Porkbun API v3.
 *
 * Endpoint shape resolved empirically on 2026-08-09, because their docs and the
 * community clients disagree:
 *
 *   POST /dns/retrieve/example.com   → HTTP 400 structured JSON auth error
 *   POST /dns/retrieve               → HTTP 400 structured JSON auth error
 *   POST /dns/totallyFakeEndpoint    → HTTP 404 HTML
 *
 * Both forms route (auth is checked before the domain is resolved, so a 400 only
 * proves the path exists). The path form is the one their OpenAPI spec documents
 * and the one acme.sh uses in production, so that is what this client uses.
 *
 * Host is api.porkbun.com — the legacy porkbun.com/api host is being retired.
 */
const BASE = 'https://api.porkbun.com/api/json/v3';

export function porkbunClient({ apiKey, secretApiKey }) {
  async function call(path, body = {}) {
    const response = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey, secretapikey: secretApiKey, ...body }),
    });

    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      // A 404 returns an HTML error page, not JSON.
      throw new TerminalError(
        `Porkbun ${path} returned non-JSON (HTTP ${response.status}) — likely a bad endpoint path.`
      );
    }

    if (payload.status !== 'SUCCESS') {
      // Newer responses carry a structured error: code, next_action.retryable, requestId.
      const action = payload.next_action ?? {};
      throw new TerminalError(
        `Porkbun ${path}: ${payload.message ?? 'unknown error'}${
          payload.code ? ` [${payload.code}]` : ''
        }`,
        { hint: action.hint, url: action.url }
      );
    }

    return payload;
  }

  return {
    /** Auth smoke test. Returns the caller's public IP. */
    async ping() {
      const { yourIp } = await call('/ping');
      return yourIp;
    },

    /**
     * All records matching a host + type.
     *
     * An empty match is `{status: "SUCCESS", records: []}` — a normal response,
     * NOT an error. Treating a zero-length array as failure is the single most
     * common way clients break against this API.
     */
    async findRecords({ zone, record, type }) {
      const { records = [] } = await call(
        `/dns/retrieveByNameType/${zone}/${type}/${record}`
      );
      return records;
    },

    /** Minimum and default TTL is 600s. Set explicitly so the record is reproducible. */
    async createRecord({ zone, record, type, content, ttl = '600' }) {
      const { id } = await call(`/dns/create/${zone}`, {
        name: record,
        type,
        content,
        ttl,
      });
      return id;
    },

    async deleteRecords({ zone, record, type }) {
      await call(`/dns/deleteByNameType/${zone}/${type}/${record}`);
    },
  };
}
