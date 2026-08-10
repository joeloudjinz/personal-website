/**
 * Where the project showcase pages live on disk, and what they are written in.
 *
 * Two places need this and must never disagree: the collection definition in
 * src/content.config.ts, which loads the entries, and the build-time read in
 * src/utils/projectPagesBuild.ts, which keeps their URLs out of the main
 * sitemap. If the loader picked up a file the sitemap logic did not, the page
 * would be generated and then advertised on the wrong host — silently.
 *
 * Deliberately free of imports, including `astro:content`. src/content.config.ts
 * is evaluated before the content layer exists, so anything it imports has to be
 * inert.
 */
export const PROJECT_PAGES_BASE = './src/content/projectpages';

/** File extensions that count as a project page entry, without the dot. */
export const PROJECT_PAGES_EXTENSIONS = ['md'] as const;

/**
 * The loader's glob. Built from the extension list rather than written out, so
 * adding `mdx` in one place updates the loader and the sitemap read together.
 */
export const PROJECT_PAGES_PATTERN =
  PROJECT_PAGES_EXTENSIONS.length === 1
    ? `**/*.${PROJECT_PAGES_EXTENSIONS[0]}`
    : `**/*.{${PROJECT_PAGES_EXTENSIONS.join(',')}}`;
