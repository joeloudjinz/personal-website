import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import { autoNewTabExternalLinks } from './src/autoNewTabExternalLinks';
import {
  assertForeignCanonicalsNotAdvertised,
  assertProjectPagesRedirected,
  pagePath,
  readProjectPageSlugs
} from './src/utils/projectPagesBuild';

const SITE = 'https://abdellahaddoun.com';
const PROJECT_ROOT = new URL('./', import.meta.url);

/**
 * Project showcase pages are deployed to their own subdomain and declare it as
 * their canonical, so their abdellahaddoun.com URL is a build artefact. Listing
 * it here would advertise a duplicate on the wrong host.
 */
const projectPageSlugs = readProjectPageSlugs(PROJECT_ROOT);
const isProjectPage = (page) =>
  projectPageSlugs.some((slug) => pagePath(page) === `/${slug}`);

/**
 * Proves the exclusion happened rather than trusting that it did, by checking
 * the emitted output: no page that names another host as canonical may appear
 * in a sitemap. Reads the artefact, so it needs no second list to stay in step
 * with and covers any future page type that overrides its canonical.
 */
const assertCanonicalHosts = {
  name: 'assert-canonical-hosts',
  hooks: {
    'astro:build:done': ({ dir }) =>
      assertForeignCanonicalsNotAdvertised(dir, PROJECT_ROOT, new URL(SITE).host)
  }
};

/**
 * A canonical is a hint to search engines; it does nothing for a reader who
 * types the URL. Every project page is built into this dist — the subdomain
 * deploy uploads the same directory — so without a redirect the main site
 * serves a working duplicate of a page that lives somewhere else.
 *
 * At build start rather than done: nothing needs the output, and failing before
 * a two-second build beats failing after it.
 */
const assertProjectPageRedirects = {
  name: 'assert-project-page-redirects',
  hooks: {
    'astro:build:start': () => assertProjectPagesRedirected(PROJECT_ROOT)
  }
};

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !isProjectPage(page) }),
    // After sitemap(): same-hook integrations run in array order, and this one
    // reads the files sitemap() writes.
    assertCanonicalHosts,
    assertProjectPageRedirects,
    // `src/styles/global.css` owns the three @tailwind directives — it has to,
    // its @layer base and @layer components blocks need directives in the same
    // sheet to hoist into — so the base stylesheet the
    // integration injects on its own is a second copy of the same output. The
    // bundler used to fold the two into one chunk and hide that; once a route
    // pulled in two page components the fold stopped happening and every page
    // started linking a full duplicate stylesheet alongside the real one.
    tailwind({ applyBaseStyles: false })
  ],
  markdown: {
    rehypePlugins: [[autoNewTabExternalLinks, {
      domain: 'localhost:4321'
    }]]
  },
  env: {
    schema: {
      // GTAG Measurement ID - public client variable
      PUBLIC_GTAG_MEASUREMENT_ID: envField.string({
        context: "client", 
        access: "public",
        optional: true,
        description: "Google Analytics Measurement ID"
      }),
    }
  }
});