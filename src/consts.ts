// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const FULL_NAME = 'Abdellah Addoun';
export const NICKNAME = 'JoeInz';
export const SITE_TITLE = 'Abdellah ADDOUN';
export const SITE_TAGLINE = 'Senior/Lead Software Engineer'; // site tagline
export const SITE_DESCRIPTION = "My personal cyber space 🌌 in the wide web 🕸️. Find details about my experience, projects, thoughts, and more all in one place. I'm one message away, i'll be more then excited to answer.";
export const EMAIL = 'addoun.abdellah@gmail.com';

export const GITHUB_ACCOUNT = 'https://github.com/joeloudjinz';
export const LINKEDIN_ACCOUNT = 'https://www.linkedin.com/in/abdellah-addoun';

export const AUTHOR_ROLE = 'Senior Software Engineer';

/**
 * The main site's absolute URL and bare hostname, for chrome that has to point
 * home from another host. A project showcase page is served from its own
 * subdomain, where "/" is that subdomain's root — the route back has to be
 * absolute, and the label has to name the host it goes to.
 *
 * Derived from `site` in astro.config.mjs rather than restated here, so there is
 * one place the domain is written down.
 *
 * Throws rather than falling back. `site` is set, so this is unreachable — but a
 * `?? ''` would render `aria-label=""` and a back link reading just "‹", which
 * is a silent failure on the one control that gets a visitor off the subdomain.
 */
export function mainSite(site: URL | undefined): {href: string; host: string} {
  if (!site) {
    throw new Error(
      '[consts] Astro.site is undefined, so the route back to the main site cannot be built. ' +
      'Set "site" in astro.config.mjs.'
    );
  }
  return {href: site.href, host: site.host};
}
