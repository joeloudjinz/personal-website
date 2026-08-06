/**
 * Build-time invariants for pages that are canonical somewhere other than this
 * site — today, the project showcase pages, each deployed to its own subdomain.
 *
 * Lives here rather than in astro.config.mjs so it is type-checked: the config
 * is the one file `astro check` does not cover, and this is the same shape of
 * work src/utils/projectPages.ts already does for the content layer.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { PROJECT_PAGES_BASE, PROJECT_PAGES_EXTENSIONS } from './projectPagesSource';

/**
 * The path a page is advertised at, normalised so the comparison survives
 * config changes. `trailingSlash` and `build.format` both reshape the emitted
 * URL, and comparing raw strings would turn any exclusion into a silent no-op
 * the day either moves.
 */
export function pagePath(url: string): string {
  return new URL(url).pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
}

/** The same normalisation, for a path relative to the output directory. */
function distFileToPath(relativePath: string): string {
  return '/' + relativePath
    .replace(/\\/g, '/')
    .replace(/(^|\/)index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/^\/+|\/+$/g, '');
}

function walkFiles(dir: URL, predicate: (name: string) => boolean): string[] {
  return readdirSync(dir, { recursive: true })
    .map((entry) => String(entry).replace(/\\/g, '/'))
    .filter(predicate);
}

/**
 * The `slug` of every project page entry.
 *
 * Read off the markdown rather than through getCollection(), because
 * astro.config.mjs is evaluated before the content layer exists. The directory
 * and extensions come from projectPagesSource.ts — the same constants the
 * collection's loader uses — so this cannot fall out of step with what actually
 * gets built.
 *
 * The slug is an explicit frontmatter field, not the filename, so it is the
 * field that gets read: a filename-derived guess would stop matching the day
 * the two diverge.
 */
export function readProjectPageSlugs(projectRoot: URL): string[] {
  const dir = new URL(PROJECT_PAGES_BASE.replace(/^\.\//, '') + '/', projectRoot);
  const isEntry = (name: string) =>
    PROJECT_PAGES_EXTENSIONS.some((extension) => name.endsWith(`.${extension}`));

  return walkFiles(dir, isEntry).map((entry) => {
    const slug = /^slug:\s*['"]?([^'"\n]+?)['"]?\s*$/m
      .exec(readFileSync(new URL(entry, dir), 'utf8'))?.[1];
    if (!slug) {
      throw new Error(
        `[project-pages] ${PROJECT_PAGES_BASE}/${entry} has no top-level "slug" field, so its ` +
        `generated URL cannot be excluded from the sitemap. The collection schema requires one — ` +
        `if it moved or was renamed, update the pattern in src/utils/projectPagesBuild.ts.`
      );
    }
    return slug;
  });
}

/**
 * Every generated page whose `<link rel="canonical">` points at a host other
 * than this site's.
 *
 * This is the honest question to ask of the output: a page that names another
 * host as authoritative must not also be advertised here, whatever kind of page
 * it is or how it came to be. Derived entirely from the build artefact, so it
 * needs no list of slugs to stay in step with and automatically covers any
 * future page type that overrides its canonical.
 */
export function findForeignCanonicalPages(
  distDir: URL,
  siteHost: string
): { path: string; canonical: string; file: string }[] {
  const found: { path: string; canonical: string; file: string }[] = [];

  for (const file of walkFiles(distDir, (name) => name.endsWith('.html'))) {
    const html = readFileSync(new URL(file, distDir), 'utf8');
    const tag = /<link[^>]+rel=["']canonical["'][^>]*>/i.exec(html)?.[0];
    const canonical = tag && /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!canonical) continue;

    let host: string;
    try {
      host = new URL(canonical).host;
    } catch {
      continue; // A relative canonical is by definition this host.
    }
    if (host !== siteHost) found.push({ path: distFileToPath(file), canonical, file });
  }

  return found;
}

/**
 * Fails the build if a page that declares a foreign canonical is also listed in
 * an emitted sitemap, which would point crawlers at a duplicate on the wrong
 * host — the exact thing the canonical is there to prevent.
 *
 * Also checks the converse for project pages specifically: each one must
 * actually be declaring a foreign canonical. Without that, a regression in
 * BaseHead would leave the pages canonical on this site, the scan above would
 * find nothing, and the check would pass while saying nothing at all.
 */
export function assertForeignCanonicalsNotAdvertised(
  distDir: URL,
  projectRoot: URL,
  siteHost: string
): void {
  const foreign = findForeignCanonicalPages(distDir, siteHost);
  const foreignPaths = new Map(foreign.map((page) => [page.path, page]));

  const slugs = readProjectPageSlugs(projectRoot);
  const missing = slugs.filter((slug) => !foreignPaths.has(`/${slug}`));
  if (missing.length > 0) {
    throw new Error(
      `[project-pages] These project pages do not declare a canonical on another host: ` +
      `${missing.join(', ')}. Each is served from its own subdomain, so its page must pass ` +
      `\`canonical\` through BaseLayout — check src/pages/[project].astro and BaseHead.astro.`
    );
  }

  const leaked: string[] = [];
  for (const file of walkFiles(distDir, (name) => /^sitemap.*\.xml$/.test(name))) {
    const xml = readFileSync(new URL(file, distDir), 'utf8');
    for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const page = foreignPaths.get(pagePath(loc));
      if (page) leaked.push(`${loc} -> canonical ${page.canonical} (${file})`);
    }
  }
  if (leaked.length > 0) {
    throw new Error(
      `[project-pages] Page(s) advertised in the sitemap while declaring a canonical on another ` +
      `host:\n  ${leaked.join('\n  ')}\n` +
      `Exclude them with the sitemap \`filter\` in astro.config.mjs.`
    );
  }
}
