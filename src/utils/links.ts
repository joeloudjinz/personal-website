/**
 * New-tab attributes for a link that leaves the site.
 *
 * Stated here because nothing else states them: autoNewTabExternalLinks is a
 * rehype plugin, so it rewrites links that came from markdown and never sees an
 * .astro template. Every href on a project page is authored data and may point
 * anywhere, so this is the single place that decides "does this link leave the
 * site", for every shape a bare-string href permits:
 *
 *   #get-started        same page      — stays
 *   /about, docs.md     site-relative  — stays
 *   //github.com/foo    off-site       — LEAVES; protocol-relative, and it has
 *                                        no scheme to test for, so a scheme
 *                                        test alone silently keeps it in-tab
 *                                        with no rel= against window.opener
 *   https://github.com  off-site       — leaves
 *   mailto:, tel:       handed off     — stays; the OS takes it, and _blank
 *                                        leaves an empty tab behind
 *
 * So: protocol-relative first, then http(s) only. Any other scheme — mailto,
 * tel, sms — is a handoff, not a navigation, and gets nothing.
 */
const NEW_TAB = {target: '_blank', rel: 'noopener noreferrer'};

export function linkAttrs(href: string) {
  if (href.startsWith('//')) return NEW_TAB;
  const scheme = href.match(/^([a-z][a-z0-9+.-]*):/i)?.[1].toLowerCase();
  if (!scheme) return {};
  return scheme === 'http' || scheme === 'https' ? NEW_TAB : {};
}
