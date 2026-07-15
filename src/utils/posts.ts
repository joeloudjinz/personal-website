import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';
import {slugify} from '../utils';

export type BlogPostEntry = CollectionEntry<'blog'>;

export async function getSortedPosts(): Promise<BlogPostEntry[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getTagSlugMap(posts: BlogPostEntry[]): Map<string, string> {
  const tagsBySlug = new Map<string, string>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      const slug = slugify(tag);
      const existing = tagsBySlug.get(slug);
      if (existing && existing !== tag) {
        console.warn(`[tags] "${existing}" and "${tag}" collide on slug "${slug}"; keeping "${existing}"`);
        continue;
      }
      tagsBySlug.set(slug, tag);
    }
  }
  return tagsBySlug;
}
