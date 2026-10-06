import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const projectTypes = ['House', 'Duplex', 'Apartment'] as const;

const projects = defineCollection({
	loader: glob({ pattern: '*/index.md', base: './src/content/projects', generateId: ({ entry }) => entry.split('/')[0] }),
	schema: ({ image }) =>
		z.object({
			type: z.enum(projectTypes),
			location: z.string().min(1),
			order: z.number(),
			cover: image(),
			gallery: z.array(image()).min(1),
		}),
});

export const collections = { projects };
