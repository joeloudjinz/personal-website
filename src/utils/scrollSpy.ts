/**
 * Which section the reader is in, for a row or rail of in-page links.
 *
 * The rule is the one the subdomain header's inline script applies to the band
 * page: the current section is the last one whose top edge has reached 30% of
 * the viewport — none at the top of the page, and the one you were last in
 * while you read something that is not in the nav. Recomputed on every
 * observer delivery from where the sections are, rather than trusted per
 * entry, because a delivery that carries every section at once would otherwise
 * leave whichever is last in the list marked.
 *
 * A module rather than a copy so the longform page's rail and its jump list
 * share it. The header keeps its own copy for now: a script written into the
 * markup cannot import, and hoisting a processed one onto every page is a
 * separate change.
 */
export interface ScrollSpyOptions {
  /** Fraction of the viewport height a section's top must pass. */
  topFraction?: number;
  /** Selector of the pinned bar whose height the window is inset by. */
  barSelector?: string;
  /** Class set on every link pointing at the current section. */
  currentClass?: string;
}

export function observeSections(links: HTMLAnchorElement[], options: ScrollSpyOptions = {}): () => void {
  const {topFraction = 0.3, barSelector = 'header', currentClass = 'is-current'} = options;
  const targets = [...new Set(links.map((link) => link.getAttribute('href') ?? ''))]
    .filter((href) => href.startsWith('#'))
    .map((href) => ({href, section: document.getElementById(href.slice(1))}))
    .filter((item): item is {href: string; section: HTMLElement} => item.section !== null);
  if (targets.length === 0 || !('IntersectionObserver' in window)) return () => {};

  const mark = (href: string | null) => {
    for (const link of links) {
      const on = link.getAttribute('href') === href;
      link.classList.toggle(currentClass, on);
      if (on) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const bar = Math.round(document.querySelector(barSelector)?.getBoundingClientRect().height ?? 0);
  // The edge never sits above the bottom of the pinned bar. On a short
  // landscape phone the bar can be taller than the top fraction, and an edge
  // above it would turn the observer's window inside out and silence it.
  const edgeOf = () => Math.max(bar, window.innerHeight * topFraction);
  const bottom = Math.max(0, Math.round(100 - (edgeOf() / window.innerHeight) * 100));
  const observer = new IntersectionObserver(() => {
    const edge = edgeOf();
    let current: string | null = null;
    for (const target of targets) {
      if (target.section.getBoundingClientRect().top <= edge) current = target.href;
    }
    mark(current);
  }, {rootMargin: `-${bar}px 0px -${bottom}% 0px`});
  targets.forEach((target) => observer.observe(target.section));
  return () => observer.disconnect();
}
