import { TerminalError } from './errors.mjs';

const BASE = 'https://api.cloudflare.com/client/v4';

/**
 * Domain status values, per the Pages domains API.
 * `active` is done; the last three will never resolve by waiting.
 */
export const DOMAIN_TERMINAL_BAD = new Set(['deactivated', 'blocked', 'error']);

export function cloudflareClient({ token, accountId }) {
  async function call(path, { method = 'GET', body } = {}) {
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => null);

    if (!payload?.success) {
      const detail =
        payload?.errors?.map((e) => `${e.message}${e.code ? ` (${e.code})` : ''}`).join('; ') ??
        `HTTP ${response.status}`;
      const err = new TerminalError(`Cloudflare ${method} ${path}: ${detail}`);
      err.status = response.status;
      err.notFound = response.status === 404;
      throw err;
    }

    return payload.result;
  }

  const projects = `/accounts/${accountId}/pages/projects`;

  return {
    async getProject(name) {
      try {
        return await call(`${projects}/${encodeURIComponent(name)}`);
      } catch (error) {
        if (error.notFound) return null;
        throw error;
      }
    },

    async createProject({ name, productionBranch }) {
      return call(projects, {
        method: 'POST',
        body: { name, production_branch: productionBranch },
      });
    },

    async getDomain(project, domain) {
      try {
        return await call(
          `${projects}/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}`
        );
      } catch (error) {
        if (error.notFound) return null;
        throw error;
      }
    },

    async addDomain(project, domain) {
      return call(`${projects}/${encodeURIComponent(project)}/domains`, {
        method: 'POST',
        body: { name: domain },
      });
    },

    async listDeployments(project) {
      return call(`${projects}/${encodeURIComponent(project)}/deployments`);
    },
  };
}

/**
 * Flattens the several status fields the domain endpoint returns into one verdict.
 * `validation_data.error_message` is where a CAA problem actually surfaces.
 */
export function readDomainStatus(domain) {
  const status = domain?.status ?? 'unknown';
  const validation = domain?.validation_data ?? {};
  return {
    status,
    active: status === 'active',
    terminal: DOMAIN_TERMINAL_BAD.has(status) || DOMAIN_TERMINAL_BAD.has(validation.status),
    message: validation.error_message ?? domain?.verification_data?.error_message,
    authority: domain?.certificate_authority,
  };
}
