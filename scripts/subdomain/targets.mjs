/**
 * Every project page that gets its own subdomain.
 *
 * Adding project #2 is one entry here. Nothing else in this tree is
 * project-specific — `_redirects` is generated from `slug` and `mainSite`, and the
 * verification matrix is derived from the built page, so the four redirect rules
 * cannot drift or be mis-ordered per project.
 */

/**
 * @typedef {object} Target
 * @property {string} slug      Directory inside dist/ — also the root rewrite destination.
 * @property {string} host      Full subdomain hostname.
 * @property {string} zone      Registrable domain at Porkbun (the DNS zone).
 * @property {string} record    Host label for the CNAME — the part before the zone.
 * @property {string} project   Cloudflare Pages project name; becomes <project>.pages.dev.
 * @property {string} branch    Production branch. MUST match the project's production
 *                              branch or the deploy silently lands as a preview and the
 *                              custom domain serves nothing.
 * @property {string} mainSite  Where non-project paths are sent.
 */

/** @type {Record<string, Target>} */
const targets = {
  inzsh: {
    slug: 'inzsh',
    host: 'inzsh.abdellahaddoun.com',
    zone: 'abdellahaddoun.com',
    record: 'inzsh',
    project: 'inzsh',
    branch: 'main',
    mainSite: 'https://abdellahaddoun.com',
  },
  'joeinz-ds': {
    slug: 'joeinz-ds',
    host: 'joeinz-ds.abdellahaddoun.com',
    zone: 'abdellahaddoun.com',
    record: 'joeinz-ds',
    project: 'joeinz-ds',
    branch: 'main',
    mainSite: 'https://abdellahaddoun.com',
  },
};

export default targets;

export function getTarget(name) {
  const target = targets[name];
  if (!target) {
    const known = Object.keys(targets).join(', ') || '(none defined)';
    throw new Error(`Unknown target "${name}". Known targets: ${known}`);
  }
  return target;
}

export function targetNames() {
  return Object.keys(targets);
}
