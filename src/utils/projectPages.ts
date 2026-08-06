import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';

export type ProjectPageEntry = CollectionEntry<'projectPages'>;

// Top-level static routes in src/pages. A project slug matching one of these
// would be silently swallowed: Astro gives static routes priority over dynamic ones.
const RESERVED_SLUGS = ['404', 'about', 'posts', 'projects', 'tags'];

// Errors name the file, not just the offending value: with several project pages
// a bare slug does not tell you which one to open. The entry id is no help here —
// the glob loader derives it from the slug, so it repeats the value.
const list = (entries: {file: string; slug: string}[]) =>
  entries.map(({file, slug}) => `"${slug}" (${file})`).join(', ');

type BandKey = keyof ProjectPageEntry['data'];

/**
 * Splits a heading around its washed phrase so the marker span — and whatever
 * punctuation trails it — survive into the markup. Shared because every band
 * component that renders a washed heading needs exactly this.
 *
 * Returns null when the wash is not present. The schema already rejects that, so
 * it should be unreachable; returning null rather than an empty match keeps the
 * caller from emitting the empty, padded span the schema exists to prevent.
 */
export function splitWash(heading: string, wash: string): {before: string; washed: string; after: string} | null {
  const at = heading.indexOf(wash);
  if (at === -1 || wash.length === 0) return null;
  return {before: heading.slice(0, at), washed: wash, after: heading.slice(at + wash.length)};
}

/**
 * The in-page anchor each optional band renders when it is present, and the only
 * record of which "#href" targets are reachable. Renderers must take their id
 * from here rather than hard-coding it, so that adding a band in a later group
 * registers its anchor in the same move.
 */
export const BAND_ANCHORS = {steps: 'get-started'} as const satisfies Partial<Record<BandKey, string>>;

/**
 * Walks an entry collecting every {label, href} pair, wherever it sits. A walk
 * rather than a hand-kept list of CTA and link positions: new bands bring their
 * own links, and a list would silently stop covering them.
 */
function collectHrefs(node: unknown, path: string, found: {path: string; href: string}[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, index) => collectHrefs(item, `${path}[${index}]`, found));
    return;
  }
  if (node === null || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  if (typeof record.href === 'string') found.push({path, href: record.href});
  for (const [key, value] of Object.entries(record)) {
    collectHrefs(value, path ? `${path}.${key}` : key, found);
  }
}

/**
 * Loads the project showcase pages, enforcing the invariants that hold *between*
 * entries and their surroundings — the ones no single entry's schema can see.
 *
 * Slug uniqueness is the case: project pages render at /<slug>/, the same URL
 * namespace blog posts occupy through src/pages/[...slug].astro and the static
 * pages occupy by filename. Nothing in Astro complains when those sets overlap;
 * one route simply wins and the other page quietly disappears from the output.
 *
 * In-page anchors are the other case: whether "#get-started" resolves depends on
 * whether the band that emits it is present, which is a fact about the whole
 * entry rather than about the CTA holding the href.
 *
 * Invariants within a single entry — a wash appearing in its heading, a slug's
 * shape — live in the collection schema instead, so they hold for every consumer
 * rather than only for callers of this function.
 */
export async function getProjectPages(): Promise<ProjectPageEntry[]> {
  const pages = await getCollection('projectPages');
  const entries = pages.map((page) => ({file: page.filePath ?? page.id, slug: page.data.slug}));
  const slugs = entries.map(({slug}) => slug);

  const duplicated = entries.filter(({slug}, index) => slugs.indexOf(slug) !== index);
  if (duplicated.length > 0) {
    throw new Error(
      `[project-pages] Duplicate project page slug(s): ${list(duplicated)}. ` +
      `Each entry in src/content/projectpages must declare a unique "slug".`
    );
  }

  const reserved = entries.filter(({slug}) => RESERVED_SLUGS.includes(slug));
  if (reserved.length > 0) {
    throw new Error(
      `[project-pages] ${list(reserved)} collide(s) with a top-level page in src/pages. ` +
      `The static route wins and the project page would never be generated. Rename the "slug" field.`
    );
  }

  const postSlugs = new Set((await getCollection('blog')).map((post) => post.id));
  const collisions = entries.filter(({slug}) => postSlugs.has(slug));
  if (collisions.length > 0) {
    throw new Error(
      `[project-pages] ${list(collisions)} collide(s) with a blog post slug. ` +
      `Both render at /<slug>/, so one would silently shadow the other. ` +
      `Rename the "slug" field in src/content/projectpages, or the post's "slug" in src/content/blog.`
    );
  }

  const deadAnchors = pages.flatMap((page) => {
    const reachable = new Set<string>(
      Object.entries(BAND_ANCHORS)
        .filter(([band]) => page.data[band as BandKey] != null)
        .map(([, anchor]) => anchor)
    );
    const found: {path: string; href: string}[] = [];
    collectHrefs(page.data, '', found);
    return found
      .filter(({href}) => href.startsWith('#') && !reachable.has(href.slice(1)))
      .map(({path, href}) => `${page.filePath ?? page.id} → ${path}: "${href}"`);
  });
  if (deadAnchors.length > 0) {
    throw new Error(
      `[project-pages] In-page link points at an anchor nothing renders:\n  ${deadAnchors.join('\n  ')}\n` +
      `Anchors come from bands that are present. Add the band, change the href, ` +
      `or register the new anchor in BAND_ANCHORS (src/utils/projectPages.ts).`
    );
  }

  return pages;
}
