import type {CollectionEntry} from 'astro:content';
import {render} from 'astro:content';
import type {MarkdownHeading} from 'astro';
import type {LongformEntry} from './projectPages';
import {navLabelWidth} from './navFit';

export type ChapterEntry = CollectionEntry<'projectPageChapters'>;
export type SpineChapter = LongformEntry['data']['chapters'][number];

/**
 * How wide a rail row's text column is, in px, at the 240px rail the longform
 * template draws from 1280px up. Labels are measured with navFit's glyph widths —
 * Readex Pro 600 at 15px — while the rail sets them at 500 and 14px, so the
 * measure over-states every label by about a tenth. That is the safe direction:
 * a label it passes fits; a label it rejects may have fit, and is shortened.
 */
export const TOC_BUDGET_PX = 216;

const name = (entry: {filePath?: string; id: string}) => entry.filePath ?? entry.id;

/**
 * Every non-reserved chapter has exactly one file, every file fills a declared
 * chapter, and every nav label fits the rail. Fails the build with the file
 * and the chapter named, because a chapter the spine lists and nothing renders
 * is a table-of-contents row that jumps nowhere.
 */
export function assertChaptersPaired(pages: LongformEntry[], files: ChapterEntry[]): void {
  const problems: string[] = [];
  const slugs = new Set(pages.map((page) => page.data.slug));

  for (const file of files) {
    if (!slugs.has(file.data.page)) {
      problems.push(`${name(file)}: "page: ${file.data.page}" is not a longform project page`);
    }
  }

  for (const page of pages) {
    const own = files.filter((file) => file.data.page === page.data.slug);
    const declared = new Set(page.data.chapters.map((chapter) => chapter.id));
    for (const file of own) {
      if (!declared.has(file.data.chapter)) {
        problems.push(`${name(file)}: "chapter: ${file.data.chapter}" is not in the spine of ${name(page)}`);
      }
    }
    for (const chapter of page.data.chapters) {
      const matching = own.filter((file) => file.data.chapter === chapter.id);
      if (chapter.reserved && matching.length > 0) {
        problems.push(`${name(page)}: chapter "${chapter.id}" is reserved but ${name(matching[0])} fills it`);
      }
      if (!chapter.reserved && matching.length === 0) {
        problems.push(`${name(page)}: chapter "${chapter.id}" has no file under chapters/ and is not reserved`);
      }
      if (matching.length > 1) {
        problems.push(`${name(page)}: chapter "${chapter.id}" is filled by ${matching.length} files`);
      }
      const width = navLabelWidth(chapter.navLabel);
      if (width > TOC_BUDGET_PX) {
        problems.push(
          `${name(page)}: navLabel "${chapter.navLabel}" renders ${Math.round(width)}px wide, ` +
          `over the ${TOC_BUDGET_PX}px the rail holds; shorten it`
        );
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`[project-pages] Longform chapters do not pair with their spine:\n  ${problems.join('\n  ')}`);
  }
}

/** A chapter ready to draw: its spine row and, unless reserved, its rendered body. */
export interface LoadedChapter {
  spine: SpineChapter;
  Content?: Awaited<ReturnType<typeof render>>['Content'];
  headings: MarkdownHeading[];
}

/**
 * Headings inside a chapter are H3 only — the chapter's own title is the H2 —
 * and every H3 slug is unique across the page, because Astro gives headings
 * bare ids and two chapters with "What it stores" would share one anchor.
 * Authors disambiguate in the heading text.
 */
export function assertChapterHeadings(page: LongformEntry, chapters: LoadedChapter[]): void {
  const problems: string[] = [];
  const seen = new Map<string, string>();
  for (const chapter of chapters) {
    for (const heading of chapter.headings) {
      if (heading.depth !== 3) {
        problems.push(`chapter "${chapter.spine.id}": heading "${heading.text}" is an H${heading.depth}; chapters use H3 only`);
      }
      const owner = seen.get(heading.slug);
      if (owner && owner !== chapter.spine.id) {
        problems.push(`chapter "${chapter.spine.id}": heading slug "${heading.slug}" is already used in chapter "${owner}"`);
      }
      seen.set(heading.slug, chapter.spine.id);
    }
  }
  if (problems.length > 0) {
    throw new Error(`[project-pages] ${name(page)} chapter headings:\n  ${problems.join('\n  ')}`);
  }
}

/** Renders a page's chapters in spine order and checks their headings. */
export async function loadChapters(page: LongformEntry, files: ChapterEntry[]): Promise<LoadedChapter[]> {
  const own = new Map(files.filter((file) => file.data.page === page.data.slug)
    .map((file) => [file.data.chapter, file] as const));
  const chapters: LoadedChapter[] = [];
  for (const spine of page.data.chapters) {
    const file = own.get(spine.id);
    if (!file) {
      chapters.push({spine, headings: []});
      continue;
    }
    const {Content, headings} = await render(file);
    chapters.push({spine, Content, headings});
  }
  assertChapterHeadings(page, chapters);
  return chapters;
}
