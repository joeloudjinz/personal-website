import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';
import {NAV_BUDGET_PX, navLabelWidth, navRowFits, navRowWidth} from './navFit';

export type ProjectPageEntry = CollectionEntry<'projectPages'>;

/** The two page templates, split off the schema union by the template literal. */
export type PinboardEntry = ProjectPageEntry & {
  data: Extract<ProjectPageEntry['data'], {template: 'pinboard'}>
};
export type BandEntry = ProjectPageEntry & {
  data: Exclude<ProjectPageEntry['data'], {template: 'pinboard'}>
};
export const isPinboard = (page: ProjectPageEntry): page is PinboardEntry =>
  page.data.template === 'pinboard';

/**
 * Top-level route names in src/pages. A project slug matching one of these would
 * be silently swallowed: Astro gives file routes priority over dynamic ones.
 *
 * Derived from the directory rather than hand-listed, so adding a page cannot
 * leave this out of date. Vite resolves the glob at build time, so it costs
 * nothing at runtime; `[...]` entries are the dynamic routes and are skipped.
 */
const RESERVED_SLUGS = [...new Set(
  Object.keys(import.meta.glob('../pages/**/*.{astro,md,mdx,html}'))
    // "about.astro" -> "about"; "tags/[tag]/index.astro" -> "tags". Only the first
    // segment can collide, since that is the whole of a project page's URL.
    .map((path) => path.replace('../pages/', '').split('/')[0].replace(/\.(astro|md|mdx|html)$/, ''))
    .filter((name) => !name.startsWith('[') && name !== 'index')
)];

// Errors name the file, not just the offending value: with several project pages
// a bare slug does not tell you which one to open. The entry id is no help here —
// the glob loader derives it from the slug, so it repeats the value.
const list = (entries: {file: string; slug: string}[]) =>
  entries.map(({file, slug}) => `"${slug}" (${file})`).join(', ');

// Off the band branch rather than off the union: `keyof` a union of object types
// yields only the keys they share, which is the identity fields and nothing else.
type BandKey = keyof BandEntry['data'];

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
 * Every band that can be jumped to, in the order the page draws them.
 *
 * One list doing two jobs, on purpose. It is the order the section nav runs in,
 * and — through BAND_ANCHORS below — the record of which "#href" targets resolve.
 * A band added to the page registers its anchor and takes its place in the nav in
 * the same move, rather than in two moves with one of them forgotten.
 *
 * The order is the template's, not this file's: it has to match the order the
 * bands appear in src/components/projectpage/BandPage.astro, because a nav that lists them in a
 * different order is a nav that lies about where the reader is going.
 */
const BAND_ORDER = [
  'glance', 'why', 'anatomy', 'deepDive', 'config', 'steps',
  'gallery', 'specs', 'pillars', 'verification', 'faq'
] as const satisfies readonly BandKey[];

type NavigableBand = (typeof BAND_ORDER)[number];

/**
 * An anchor that is not what the band key derives to, and why.
 *
 * "#get-started" is the fragment the hero and closing CTAs already point at and
 * the one a link off this site would carry. Deriving "#steps" would be tidier and
 * would break every one of them.
 */
const ANCHOR_OVERRIDES: Partial<Record<NavigableBand, string>> = {steps: 'get-started'};

/** "deepDive" -> "deep-dive". */
const toAnchor = (band: string) => band.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

/**
 * The in-page anchor each band renders when it is present, and the only record of
 * which "#href" targets are reachable.
 *
 * Renderers must take their id from here rather than hard-coding it, and the ids
 * are derived from the band key rather than authored, so the two halves cannot
 * drift: the guard in getProjectPages() rejects an href pointing at an anchor
 * nothing renders, and it is silent about the opposite — a band emitting an id no
 * one registered. Deriving both from this list is what closes that side.
 */
export const BAND_ANCHORS = Object.fromEntries(
  BAND_ORDER.map((band) => [band, ANCHOR_OVERRIDES[band] ?? toAnchor(band)])
) as Record<NavigableBand, string>;

/** One item of the section nav: where it goes and what it reads. */
export interface PageSection {
  href: string;
  label: string;
}

/**
 * The section nav for an entry: the bands that are present AND have declared a
 * short label, in page order.
 *
 * The label's absence is the switch. A band that declares one is navigable and a
 * band that does not is not, so which sections a project offers is authored in
 * its markdown rather than listed in the template — which is the same rule the
 * rest of the collection follows, applied to the one thing on the page that is
 * about the page rather than in it.
 */
export function pageSections(data: ProjectPageEntry['data']): PageSection[] {
  return BAND_ORDER.flatMap((band) => {
    const value = (data as Record<string, unknown>)[band] as {navLabel?: string} | undefined;
    return value?.navLabel
      ? [{href: `#${BAND_ANCHORS[band]}`, label: value.navLabel}]
      : [];
  });
}

/**
 * Depth-first walk of an entry's data, calling `visit` with every object in it
 * and the dotted path that reaches it.
 *
 * A walk rather than a hand-kept list of positions: new bands bring their own
 * links and their own media, and a list would silently stop covering them.
 * Shared by the guards below because they look for different shapes in the same
 * tree, and a second copy of the traversal is a second place for a new band's
 * nesting to be missed by one of them and not the other.
 */
function walkObjects(
  node: unknown,
  path: string,
  visit: (record: Record<string, unknown>, path: string) => void
): void {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walkObjects(item, `${path}[${index}]`, visit));
    return;
  }
  if (node === null || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  visit(record, path);
  for (const [key, value] of Object.entries(record)) {
    walkObjects(value, path ? `${path}.${key}` : key, visit);
  }
}

/** Every {label, href} pair in an entry, wherever it sits. */
function collectHrefs(data: unknown, found: {path: string; href: string}[]): void {
  walkObjects(data, '', (record, path) => {
    if (typeof record.href === 'string') found.push({path, href: record.href});
  });
}

/**
 * Loads the project showcase pages, enforcing the invariants that hold *between*
 * entries and their surroundings — the ones no single entry's schema can see.
 *
 * Slug uniqueness is the case: project pages render at /<slug>/, the same URL
 * namespace blog posts occupy through src/pages/[...slug].astro and the file
 * routes occupy by filename. Nothing in Astro complains when those sets overlap;
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
      `The file route wins and the project page would never be generated. Rename the "slug" field.`
    );
  }

  const postSlugs = new Set((await getCollection('blog')).map((post) => post.id));
  const collisions = entries.filter(({slug}) => postSlugs.has(slug));
  if (collisions.length > 0) {
    throw new Error(
      `[project-pages] ${list(collisions)} collide(s) with a blog post slug. ` +
      `Both render at /<slug>/, so one would silently mask the other. ` +
      `Rename the "slug" field in src/content/projectpages, or the post's "slug" in src/content/blog.`
    );
  }

  const deadAnchors = pages.flatMap((page) => {
    const reachable = new Set<string>(
      Object.entries(BAND_ANCHORS)
        .filter(([band]) => (page.data as Record<string, unknown>)[band] != null)
        .map(([, anchor]) => anchor)
    );
    const found: {path: string; href: string}[] = [];
    collectHrefs(page.data, found);
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

  /**
   * A section nav wider than the bar it sits in.
   *
   * Every item in the subdomain header is as wide as its own text and none of
   * them reflow, so one label too many does not wrap onto a second line: it
   * widens the document and the page scrolls sideways. The row is added up
   * against what the header's centre holds at the width the nav first appears
   * at — see src/utils/navFit.ts for both numbers and where they were measured.
   *
   * Here rather than in the schema because it is a fact about the whole entry:
   * no single band knows how many of its neighbours also asked to be in the nav.
   */
  const overfullNav = pages.flatMap((page) => {
    const labels = pageSections(page.data).map(({label}) => label);
    if (navRowFits(labels)) return [];
    const widest = [...labels].sort((a, b) => navLabelWidth(b) - navLabelWidth(a))[0];
    return [
      `${page.filePath ?? page.id}: ${labels.length} section labels render ` +
      `${Math.round(navRowWidth(labels))}px wide, over the ${NAV_BUDGET_PX}px the header's ` +
      `centre holds. Drop a "navLabel" — the longest is "${widest}" — or shorten one.`
    ];
  });
  if (overfullNav.length > 0) {
    throw new Error(
      `[project-pages] The section nav does not fit the header:\n  ${overfullNav.join('\n  ')}\n` +
      `A band is in the nav because it declares a "navLabel", so this is a question of ` +
      `which sections earn a place in the bar, not of making the bar bigger.`
    );
  }

  /**
   * `variants` that will never be read.
   *
   * They exist for one situation: an animated capture skips the image service —
   * one frame is what would come back — so the only responsive candidates it can
   * offer are files somebody rendered by hand. MediaFrame therefore reads them
   * when the asset is a GIF and ignores them for everything else, which is
   * correct and is also completely silent. An author who renders three sizes of
   * a PNG gets no srcset from them, no error, and no way to tell.
   *
   * The schema cannot catch this and says so: inside a content-layer schema
   * `image()` has not resolved, so the value being validated is still a path and
   * the format is not knowable. Here it is — these entries carry resolved
   * ImageMetadata — which makes this the first place the question can be asked.
   *
   * The condition mirrors MediaFrame's exactly. If that component ever learns a
   * second animated format, this has to learn it in the same move, or a legal
   * entry starts failing the build.
   */
  const ignoredVariants = pages.flatMap((page) => {
    const found: string[] = [];
    walkObjects(page.data, '', (record, path) => {
      const variants = record.variants;
      const src = record.src as {format?: string} | undefined;
      if (!Array.isArray(variants) || variants.length === 0) return;
      if (!src || typeof src !== 'object' || src.format === 'gif') return;
      found.push(
        `${page.filePath ?? page.id} → ${path}: src is ${src.format ?? 'an unknown format'}, ` +
        `so ${variants.length} hand-rendered variant(s) would be dropped`
      );
    });
    return found;
  });
  if (ignoredVariants.length > 0) {
    throw new Error(
      `[project-pages] "variants" declared on a capture that does not use them:\n  ` +
      `${ignoredVariants.join('\n  ')}\n` +
      `Only an animated capture needs hand-rendered rungs, because it skips the image ` +
      `service; every other format gets its ladder generated from the "widths" its call ` +
      `site passes. Remove the variants, or check the asset is the animated one you meant.`
    );
  }

  return pages;
}
