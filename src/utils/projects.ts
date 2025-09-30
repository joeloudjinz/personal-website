import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';

export type ProjectCollectionEntry = CollectionEntry<'projects'>;

export async function getAllProjects(): Promise<ProjectCollectionEntry[]> {
  return await getCollection('projects');
}