import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import { autoNewTabExternalLinks } from './src/autoNewTabExternalLinks';

const SITE = 'https://abdellahaddoun.com';

/**
 * The slugs of the project showcase pages.
 *
 * Each of those pages is deployed to its own subdomain and declares that
 * subdomain as its canonical (see BaseHead). Their abdellahaddoun.com URL is a
 * build artefact, so listing it in the sitemap would advertise a duplicate on
 * the wrong host — exactly what the canonical is there to prevent.
 *
 * Read off the markdown rather than through getCollection(): this file is
 * evaluated before Astro's content layer exists. Recursive, because the
 * collection loads with `pattern: "**\/*.md"` — a one-level read would let a
 * page in a subdirectory be generated and advertised.
 *
 * The slug is an explicit frontmatter field, not the filename, so it is the
 * field that gets read — a filename-derived guess would silently stop matching
 * the day the two diverge.
 */
const projectPagesDir = new URL('./src/content/projectpages/', import.meta.url);
const projectPageSlugs = readdirSync(projectPagesDir, { recursive: true })
  .map((entry) => String(entry))
  .filter((entry) => entry.endsWith('.md'))
  .map((entry) => {
    const slug = /^slug:\s*['"]?([^'"\n]+?)['"]?\s*$/m
      .exec(readFileSync(new URL(entry, projectPagesDir), 'utf8'))?.[1];
    if (!slug) {
      throw new Error(
        `[sitemap] src/content/projectpages/${entry} has no top-level "slug" field, so its ` +
        `generated URL cannot be excluded from the sitemap. The collection schema requires ` +
        `one — if it moved or was renamed, update the pattern in astro.config.mjs.`
      );
    }
    return slug;
  });

/**
 * Compare on the path, not on a hand-built URL string. The emitted URL's shape
 * is Astro's to decide — `trailingSlash` and `build.format` both change it — and
 * a literal `${SITE}/${slug}/` would stop matching the day either moves, turning
 * the exclusion into a silent no-op.
 */
const pagePath = (url) =>
  new URL(url).pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';

const excludedSlugs = new Set();
const isProjectPage = (page) => {
  const path = pagePath(page);
  const slug = projectPageSlugs.find((candidate) => path === `/${candidate}`);
  if (slug) excludedSlugs.add(slug);
  return Boolean(slug);
};

/**
 * Proves the exclusion actually happened, rather than trusting that it did.
 * Runs after @astrojs/sitemap has written its files, so it can check the
 * artefact: both that the filter matched every known project page, and that no
 * project page survived into an emitted sitemap.
 */
const assertProjectPagesExcluded = {
  name: 'assert-project-pages-excluded',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const unmatched = projectPageSlugs.filter((slug) => !excludedSlugs.has(slug));
      if (unmatched.length > 0) {
        throw new Error(
          `[sitemap] The sitemap filter never matched project page(s): ${unmatched.join(', ')}. ` +
          `Every project page should have been offered to the filter and rejected. The URL shape ` +
          `Astro emits has probably changed — check pagePath() in astro.config.mjs.`
        );
      }

      const sitemaps = readdirSync(dir).filter((file) => /^sitemap.*\.xml$/.test(file));
      const leaked = [];
      for (const file of sitemaps) {
        const xml = readFileSync(new URL(file, dir), 'utf8');
        for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
          const slug = projectPageSlugs.find((candidate) => pagePath(loc) === `/${candidate}`);
          if (slug) leaked.push(`${loc} (${file})`);
        }
      }
      if (leaked.length > 0) {
        throw new Error(
          `[sitemap] Project page URL(s) survived into the sitemap: ${leaked.join(', ')}. ` +
          `These pages are canonical on their own subdomain, so advertising them here points ` +
          `crawlers at a duplicate on the wrong host.`
        );
      }
    }
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
    assertProjectPagesExcluded,
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