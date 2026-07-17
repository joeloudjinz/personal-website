import type {CollectionEntry} from 'astro:content';
import {getCollection} from 'astro:content';

export type ExperienceEntry = CollectionEntry<'experiences'>;

const numericId = (entry: ExperienceEntry) => parseInt(entry.data.id.match(/^\d+/)?.[0] ?? '0');

/** Chronological, oldest first. */
export async function getExperiences(): Promise<ExperienceEntry[]> {
  return (await getCollection('experiences')).sort((a, b) => numericId(a) - numericId(b));
}

/** endDate is "YYYY-MM" for finished roles, free text ("Present") for the current one. */
export const isCurrentRole = (entry: ExperienceEntry) => !/^\d{4}-\d{2}$/.test(entry.data.endDate);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatExperienceDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return 'Today';
  return `${MONTHS[parseInt(match[2]) - 1]} ${match[1]}`;
}
