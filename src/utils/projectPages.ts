import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';

export type ProjectPageEntry = CollectionEntry<'projectPages'>;

// Top-level static routes in src/pages. A project slug matching one of these
// would be silently swallowed: Astro gives static routes priority over dynamic ones.
const RESERVED_SLUGS = ['404', 'about', 'posts', 'projects', 'tags'];

const list = (values: string[]) => values.map((value) => `"${value}"`).join(', ');

/**
 * Loads the project showcase pages, refusing to build if a slug is not unique
 * at the site root.
 *
 * Project pages render at /<slug>/ — the same URL namespace blog posts occupy
 * through src/pages/[...slug].astro. Nothing in Astro complains when the two
 * sets overlap; one route simply wins and the other page quietly disappears
 * from the output. This turns that into a loud build failure instead.
 */
export async function getProjectPages(): Promise<ProjectPageEntry[]> {
  const pages = await getCollection('projectPages');
  const slugs = pages.map((page) => page.data.slug);

  const duplicated = [...new Set(slugs.filter((slug, index) => slugs.indexOf(slug) !== index))];
  if (duplicated.length > 0) {
    throw new Error(
      `[project-pages] Duplicate project page slug(s): ${list(duplicated)}. ` +
      `Each entry in src/content/projectpages must declare a unique "slug".`
    );
  }

  const reserved = slugs.filter((slug) => RESERVED_SLUGS.includes(slug));
  if (reserved.length > 0) {
    throw new Error(
      `[project-pages] Project page slug(s) ${list(reserved)} collide with a top-level page in src/pages. ` +
      `The static route wins and the project page would never be generated. Rename the "slug" field.`
    );
  }

  const postSlugs = new Set((await getCollection('blog')).map((post) => post.id));
  const collisions = slugs.filter((slug) => postSlugs.has(slug));
  if (collisions.length > 0) {
    throw new Error(
      `[project-pages] Project page slug(s) ${list(collisions)} collide with a blog post slug. ` +
      `Both render at /<slug>/, so one would silently shadow the other. ` +
      `Rename the "slug" field in src/content/projectpages, or the post's "slug" in src/content/blog.`
    );
  }

  return pages;
}
