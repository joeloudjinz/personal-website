import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';
import {linkAttrs} from './links';

export type ProjectCollectionEntry = CollectionEntry<'projects'>;

// Hand-curated display order (by frontmatter id)
export const PROJECT_ORDER = [
  'joeinz-design-system',
  'inzsh-zsh-theme',
  'dynamic-module-loader-dotnet',
  'data-seeder-dotnet',
  'algerian-rib-validator',
  'inz-foge-ui-library',
  'pipeline-pattern-dotnet',
  'repository-pattern-laravel',
  'pipeline-pattern-typescript',
  'onion-architecture-dotnet'
];

/**
 * Where a project card's title leads, as the anchor's whole attribute bag.
 *
 * A project with a showcase page leads there; every other one leads to its
 * repository, which is what `demoLink` is in practice — every entry that has
 * one points it at GitHub, and the card has always labelled it "View
 * repository". The design system has neither a repository nor anything honest
 * to put in its place, which is why the last branch returns no href at all
 * rather than an empty one: `href=''` is a link back to the current page.
 *
 * Shared because two call sites draw that title — the projects gallery through
 * ProjectItem, and the home page's featured row inline — and the rule that
 * decides between the two hrefs is exactly the kind that drifts when it is
 * written down twice.
 *
 * The TARGET comes from linkAttrs rather than from a `target='_blank'` written
 * at the call site, and that is the point of routing it through here. A
 * showcase page is destined for its own subdomain but ships site-relative until
 * that host exists, and a hard-coded _blank made the card contradict the one
 * module whose job this decision is: links.ts says a site-relative href stays
 * in the tab, and the card opened an internal, same-origin page in a new one,
 * losing View Transitions on the way. Deciding it from the href means the
 * target flips itself the day `projectPageLink` becomes absolute — the same
 * one-line swap the field's own comment already promises, with nothing else to
 * remember.
 *
 * The repository branch keeps its literal _blank and its `demoLinkRel`. That
 * behaviour predates links.ts and is every other card on the site; changing it
 * would add rel='noopener noreferrer' to eight cards that did not ask for it
 * in a change about one. Worth doing, separately.
 */
export function projectLead(
  project: ProjectCollectionEntry
): {href?: string; target?: string; rel?: string} {
  const {projectPageLink, demoLink, demoLinkRel} = project.data;
  if (projectPageLink) return {href: projectPageLink, ...linkAttrs(projectPageLink)};
  if (demoLink) return {href: demoLink, target: '_blank', rel: demoLinkRel};
  // Neither link: the bag is empty, so both call sites draw an anchor with no
  // href — a plain-text title — rather than one that navigates to itself.
  // Astro drops an undefined attribute, whether it is spread or named.
  return {};
}

export async function getAllProjects(): Promise<ProjectCollectionEntry[]> {
  return await getCollection('projects');
}

/** Projects in curated order; anything not in the list is appended so new files never vanish. */
export async function getOrderedProjects(): Promise<ProjectCollectionEntry[]> {
  const all = await getAllProjects();
  return [
    ...PROJECT_ORDER
      .map((id) => all.find((project) => project.data.id === id))
      .filter((project): project is ProjectCollectionEntry => project !== undefined),
    ...all.filter((project) => !PROJECT_ORDER.includes(project.data.id))
  ];
}
