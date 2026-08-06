import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import { autoNewTabExternalLinks } from './src/autoNewTabExternalLinks';

const SITE = 'https://abdellahaddoun.com';

/**
 * The URLs the build emits for project showcase pages.
 *
 * Each of those pages is deployed to its own subdomain and declares that
 * subdomain as its canonical (see BaseHead). Their abdellahaddoun.com URL is a
 * build artefact, so listing it here would advertise a duplicate on the wrong
 * host — exactly what the canonical is there to prevent.
 *
 * Read off the markdown rather than through getCollection(): this file is
 * evaluated before Astro's content layer exists. The slug is an explicit
 * frontmatter field, not the filename, so it is the field that gets read — a
 * filename-derived guess would silently stop matching the day the two diverge.
 */
const projectPagesDir = new URL('./src/content/projectpages/', import.meta.url);
const projectPageURLs = new Set(
  readdirSync(projectPagesDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = /^slug:\s*['"]?([^'"\n]+?)['"]?\s*$/m
        .exec(readFileSync(new URL(file, projectPagesDir), 'utf8'))?.[1];
      if (!slug) {
        throw new Error(
          `[sitemap] src/content/projectpages/${file} has no top-level "slug" field, so its ` +
          `generated URL cannot be excluded from the sitemap. The collection schema requires ` +
          `one — if it moved or was renamed, update the pattern in astro.config.mjs.`
        );
      }
      return `${SITE}/${slug}/`;
    })
);

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [mdx(), sitemap({ filter: (page) => !projectPageURLs.has(page) }), tailwind()],
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