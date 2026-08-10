/**
 * Generates the Pages `_redirects` file for a target.
 *
 * ORDER IS LOAD-BEARING. Only the first matching rule applies, and per the Pages
 * docs "redirects are always followed, regardless of whether or not an asset
 * matches the incoming request" — so the catch-all outranks real files unless the
 * asset rules come first.
 *
 * Verified against the real Pages runtime via `wrangler pages dev` on 2026-08-09.
 * Removing the two asset rules was tested: every asset then 301s to the main site.
 * That failure is nastier than it looks — because both hosts deploy the same dist,
 * those redirects RESOLVE, so the page still renders correctly while issuing a
 * cross-origin redirect per asset, and only breaks once the two deploys drift and
 * the content hashes stop matching.
 *
 * This file exists so those rules are never hand-copied per project.
 */

/** Root-relative paths that must serve themselves rather than hit the catch-all. */
const ASSET_RULES = [
  ['/_astro/*', '/_astro/:splat'],
  ['/favicon.png', '/favicon.png'],
];

/** @param {import('../targets.mjs').Target} target */
export function buildRedirects(target) {
  const rows = [
    ...ASSET_RULES.map(([from, to]) => [from, to, '200']),
    ['/', `/${target.slug}/`, '200'],
    // The page's own path, sent to this host's root rather than through the
    // catch-all. The main site now redirects /<slug>/ here, so letting the
    // catch-all handle it would bounce the reader out and straight back.
    //
    // Absolute rather than "/", and the difference only shows on the wrong
    // host: a relative redirect keeps whoever arrived at
    // <project>.pages.dev/<slug>/ on pages.dev, which is not the canonical
    // host. Naming it sends every route to the same place.
    [`/${target.slug}/*`, `https://${target.host}/`, '301'],
    ['/*', `${target.mainSite}/:splat`, '301'],
  ];

  const widths = [0, 1].map((column) => Math.max(...rows.map((row) => row[column].length)));

  return (
    rows
      .map(([from, to, code]) =>
        `${from.padEnd(widths[0])}  ${to.padEnd(widths[1])}  ${code}`
      )
      .join('\n') + '\n'
  );
}

/**
 * The paths a correct deployment must satisfy, derived from the same rules above
 * so the test can't drift from the implementation.
 *
 * @param {import('../targets.mjs').Target} target
 * @param {string[]} assetPaths Real asset paths scraped from the built page.
 */
export function expectations(target, assetPaths) {
  return [
    { path: '/', expect: 200, note: 'serves the project page' },
    ...assetPaths.map((path) => ({ path, expect: 200, note: 'asset shielded from catch-all' })),
    { path: '/favicon.png', expect: 200, note: 'asset shielded from catch-all' },
    { path: '/about', expect: 301, to: `${target.mainSite}/about`, note: 'falls through' },
    {
      path: `/${target.slug}/`,
      expect: 301,
      to: `https://${target.host}/`,
      note: 'the page is at the root here, not under its slug',
    },
  ];
}
