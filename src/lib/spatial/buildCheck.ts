/**
 * Build-time invariants for the built site, run from astro.config.mjs on
 * `astro:build:done` (KB decision D22). Each build step of the Spatial v2
 * redesign adds the invariants of the page it builds.
 *
 * Self-contained on purpose: it imports nothing but node:fs, so `node --test`
 * can load it without a bundler. See buildCheck.test.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';

/**
 * Routes the site serves today. Losing one breaks inbound links, so it fails
 * the build. Tag pages are left out: they follow each post's tags, and a build
 * that fails on a copy edit is the worse trade.
 */
export const REQUIRED_ROUTES = [
  '/',
  '/about',
  '/projects',
  '/posts',
  '/tags',
  '/404',
  '/my-dotnet-pair-programming-buddy-post',
  '/reliability-in-system-design',
  '/scalability-in-system-design',
  '/rest-api-interview-prep-cheatsheet',
  '/software-engineering-pro-assistant',
  '/why-managers-say-no-to-refactoring',
  '/system-prompt-frontend-test-architect'
];

/** Board review notes and data placeholders from the design package. None may reach a visitor. */
const LEFTOVERS = [
  /\[KEEP THE /,
  /mailto:\[/,
  /\[3D bubble/,
  /\[Section text\]/,
  /\[Text shortened/,
  /\[Credit /
];

/** The route a file in the output directory is served at: `about/index.html` is `/about`. */
export function distPath(file: string): string {
  return '/' + file
    .replace(/\\/g, '/')
    .replace(/(^|\/)index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/^\/+|\/+$/g, '');
}

/** A page on SpatialLayout carries `data-sp-root` on its root element. */
export function isSpatialPage(html: string): boolean {
  return /<html[^>]*\sdata-sp-root[\s>=]/.test(html);
}

/** What is wrong with one built page. An empty list means nothing. */
export function pageProblems(path: string, html: string): string[] {
  const problems = LEFTOVERS
    .filter((pattern) => pattern.test(html))
    .map((pattern) => `${path}: a review note or placeholder is in the page (${pattern.source})`);

  if (isSpatialPage(html)) {
    const count = (html.match(/<h1[\s>]/gi) ?? []).length;
    if (count !== 1) problems.push(`${path}: ${count} <h1> elements, and a page needs exactly one`);
  }
  return problems;
}

/** The required routes that are absent from a build. */
export function missingRoutes(builtRoutes: readonly string[]): string[] {
  const built = new Set(builtRoutes);
  return REQUIRED_ROUTES.filter((route) => !built.has(route));
}

/** Reads the output directory and throws, naming every problem, if any invariant is broken. */
export function assertSpatialPages(distDir: URL): void {
  const files = readdirSync(distDir, { recursive: true })
    .map((entry) => String(entry).replace(/\\/g, '/'))
    .filter((name) => name.endsWith('.html'));

  const problems = [
    ...missingRoutes(files.map(distPath)).map((route) => `${route}: this route is no longer built`),
    ...files.flatMap((file) => pageProblems(distPath(file), readFileSync(new URL(file, distDir), 'utf8')))
  ];

  if (problems.length > 0) {
    throw new Error(
      `[spatial] The built site breaks ${problems.length} invariant(s):\n  ${problems.join('\n  ')}`
    );
  }
}
