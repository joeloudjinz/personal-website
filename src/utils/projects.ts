import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';

export type ProjectCollectionEntry = CollectionEntry<'projects'>;

// Hand-curated display order (by frontmatter id)
export const PROJECT_ORDER = [
  'inz-foge-ui-library',
  'dynamic-module-loader-dotnet',
  'data-seeder-dotnet',
  'algerian-rib-validator',
  'pipeline-pattern-dotnet',
  'pipeline-pattern-typescript',
  'onion-architecture-dotnet',
  'repository-pattern-laravel'
];

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
