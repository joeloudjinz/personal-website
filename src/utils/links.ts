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
 *   //github.com/foo    off-site       — LEAVES. Protocol-relative: it has no
 *                                        scheme, so a scheme test reads it as a
 *                                        path and silently keeps an off-site
 *                                        link in the reader's own tab.
 *   https://github.com  off-site       — leaves
 *   mailto:, tel:       handed off     — stays; the OS takes it, and _blank
 *                                        leaves an empty tab behind
 *
 * So: protocol-relative first, then http(s) only. Any other scheme — mailto,
 * tel, sms — is a handoff, not a navigation, and gets nothing.
 *
 * `rel` rides along with `target` and is not a second decision. It is only
 * meaningful when a new browsing context is opened: with no target there is no
 * window.opener for a foreign page to reach back through, so a same-tab link has
 * nothing to protect against and gets no rel.
 *
 * ACCEPTED, not overlooked: an absolute URL at the page's OWN host — a project
 * page linking to `https://inzsh.abdellahaddoun.com/docs` rather than `/docs` —
 * is treated as leaving, and opens in a new tab. Comparing against the entry's
 * `subdomain` would fix it, but it would also make this function need the page it
 * is called from, which is the thing that keeps it usable from ArrowLink. The
 * authored form for a same-host link is the relative one, the schema's href is a
 * bare string that invites it, and the failure mode is a spare tab rather than a
 * broken link. If it ever stops being acceptable, the fix is to pass the host in,
 * not to guess.
 */
const NEW_TAB = {target: '_blank', rel: 'noopener noreferrer'};

export function linkAttrs(rawHref: string) {
  // A YAML scalar may legally carry leading whitespace, and " https://x" would
  // otherwise fail both tests below and ship as a same-tab off-site link. Only
  // the classification is trimmed; the href attribute keeps what was authored,
  // since browsers strip it themselves.
  const href = rawHref.trim();
  if (href.startsWith('//')) return NEW_TAB;
  const scheme = href.match(/^([a-z][a-z0-9+.-]*):/i)?.[1].toLowerCase();
  if (!scheme) return {};
  return scheme === 'http' || scheme === 'https' ? NEW_TAB : {};
}
