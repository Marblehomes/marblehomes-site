import type { ImageMetadata } from 'astro';
import killara from '../assets/projects/killara.jpg';
import pymble from '../assets/projects/pymble.jpg';
import kellyville from '../assets/projects/kellyville.jpg';
import ryde from '../assets/projects/ryde.jpg';
import ermington from '../assets/projects/ermington.png';
import stIves from '../assets/projects/st-ives.png';
import burwood from '../assets/projects/burwood.png';
import bronte from '../assets/projects/bronte.png';
import carlingford from '../assets/projects/carlingford.png';
import epping from '../assets/projects/epping.jpg';
import macquariePark from '../assets/projects/macquarie-park.png';
import dundasValley from '../assets/projects/dundas-valley.png';

export type Category = 'New Build' | 'Renovation' | 'Extension & Alterations' | 'Commercial Fit-out' | 'Secondary Dwelling';

export interface Project {
	slug: string;
	name: string;
	suburb: string;
	type: string;
	category: Category;
	image: ImageMetadata;
	summary: string;
}

const summaries: Record<Category, string> = {
	'New Build':
		'A new residence taken from working drawings through construction and handover, with a focus on quality craftsmanship, durable materials and on-time delivery.',
	Renovation:
		'A renovation that transforms an existing home while respecting how the family lives — managed with transparent communication and upfront cost estimates throughout.',
	'Extension & Alterations':
		'Structural alterations and additions carefully integrated with the existing building, coordinated with consultants and engineers to keep the home liveable and the programme on track.',
	'Commercial Fit-out':
		'A commercial fit-out combining office space planning with precise construction delivery, minimising disruption and meeting time, cost, scope and quality expectations.',
	'Secondary Dwelling':
		'A self-contained secondary dwelling designed and built to make the most of the site, delivered with the same attention to detail as a full-scale residence.',
};

const make = (slug: string, suburb: string, type: string, category: Category, image: ImageMetadata): Project => ({
	slug,
	name: suburb,
	suburb,
	type,
	category,
	image,
	summary: summaries[category],
});

export const projects: Project[] = [
	make('st-ives', 'St Ives', 'New Build', 'New Build', stIves),
	make('carlingford', 'Carlingford', 'New Duplex', 'New Build', carlingford),
	make('epping', 'Epping', 'Major Alterations', 'Extension & Alterations', epping),
	make('killara', 'Killara', 'Renovation', 'Renovation', killara),
	make('burwood', 'Burwood', 'Office Fit-out', 'Commercial Fit-out', burwood),
	make('pymble', 'Pymble', 'Renovation', 'Renovation', pymble),
	make('ryde', 'Ryde', 'New Build', 'New Build', ryde),
	make('bronte', 'Bronte', 'Extension', 'Extension & Alterations', bronte),
	make('ermington', 'Ermington', 'Renovation', 'Renovation', ermington),
	make('kellyville', 'Kellyville', 'New Build', 'New Build', kellyville),
	make('macquarie-park', 'Macquarie Park', 'Office Fit-out', 'Commercial Fit-out', macquariePark),
	make('dundas-valley', 'Dundas Valley', 'Granny Flat', 'Secondary Dwelling', dundasValley),
];

export const featured = projects.slice(0, 6);

export const categories: Category[] = ['New Build', 'Renovation', 'Extension & Alterations', 'Commercial Fit-out', 'Secondary Dwelling'];
