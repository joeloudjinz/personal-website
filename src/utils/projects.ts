import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';

export type ProjectCollectionEntry = CollectionEntry<'projects'>;

// Hand-curated display order (by frontmatter id)
export const PROJECT_ORDER = [
  'inzsh-zsh-theme',
  'inz-foge-ui-library',
  'dynamic-module-loader-dotnet',
  'data-seeder-dotnet',
  'algerian-rib-validator',
  'pipeline-pattern-dotnet',
  'pipeline-pattern-typescript',
  'onion-architecture-dotnet',
  'repository-pattern-laravel'
];

/**
 * Where a project card's title leads, as attributes to spread onto the anchor.
 *
 * A project with a showcase page leads there; every other one leads to its
 * repository, which is what `demoLink` is in practice — all nine entries point
 * it at GitHub, and the card has always labelled it "View repository".
 *
 * Shared because two call sites draw that title — the projects gallery through
 * ProjectItem, and the home page's featured row inline — and the rule that
 * decides between the two hrefs is exactly the kind that drifts when it is
 * written down twice. Both keep their own target='_blank': the showcase pages
 * are destined for their own subdomains.
 *
 * `demoLinkRel` belongs to the repository link and travels with it, so a title
 * pointing somewhere else does not carry it.
 */
export function projectLead(project: ProjectCollectionEntry): {href: string; rel?: string} {
  const {projectPageLink, demoLink, demoLinkRel} = project.data;
  return projectPageLink ? {href: projectPageLink} : {href: demoLink, rel: demoLinkRel};
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
