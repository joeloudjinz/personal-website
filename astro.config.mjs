import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import { autoNewTabExternalLinks } from './src/autoNewTabExternalLinks';
import {
  assertForeignCanonicalsNotAdvertised,
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

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !isProjectPage(page) }),
    // After sitemap(): same-hook integrations run in array order, and this one
    // reads the files sitemap() writes.
    assertCanonicalHosts,
    tailwind()
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