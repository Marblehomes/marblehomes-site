import { getCollection, type CollectionEntry } from 'astro:content';
import { projectTypes } from '../content.config';

export type ProjectEntry = CollectionEntry<'projects'>;
export type ProjectType = (typeof projectTypes)[number];

export interface Project {
	slug: string;
	type: ProjectType;
	location: string;
	/** "House — Northbridge" */
	title: string;
	cover: ProjectEntry['data']['cover'];
	gallery: ProjectEntry['data']['gallery'];
	isPortrait: boolean;
	entry: ProjectEntry;
}

const toProject = (entry: ProjectEntry): Project => {
	const { type, location, cover, gallery } = entry.data;
	return {
		slug: entry.id,
		type,
		location,
		title: `${type} — ${location}`,
		cover,
		gallery,
		isPortrait: cover.height > cover.width,
		entry,
	};
};

export const projects: Project[] = (await getCollection('projects'))
	.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
	.map(toProject);

export const featured = projects.slice(0, 6);

export const types: ProjectType[] = projectTypes.filter((t) => projects.some((p) => p.type === t));
