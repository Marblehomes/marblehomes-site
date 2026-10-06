import serviceDesign from '../assets/site/service-design.jpg';
import serviceConstruction from '../assets/site/service-construction.jpg';
import serviceManagement from '../assets/site/service-management.jpg';
import processDesign from '../assets/site/process-design.png';
import processPlanning from '../assets/site/process-planning.png';
import interiorLiving from '../assets/site/interior-living.jpg';

export const company = {
	name: 'Marble Homes',
	legalName: 'Marble Homes Pty Ltd',
	director: 'Kevin Tang',
	phone: '0478 190 109',
	phoneHref: 'tel:+61478190109',
	email: 'info@marblehomes.com.au',
	addressLines: ['U1402, Circa Burwood', '180-186 Burwood Road', 'Burwood NSW 2134'],
	tagline: ['Architectural Design', 'Construction', 'Project Management'],
};

// Public Cloudflare Turnstile site key (safe to commit; the secret key lives in Cloudflare).
export const turnstileSiteKey = '0x4AAAAAAFO5Gqz_uoItuibU';

export const nav = [
	{ label: 'About', href: '/about/' },
	{ label: 'Projects', href: '/projects/' },
	{ label: 'Services', href: '/#services' },
	{ label: 'Process', href: '/#process' },
];

export const quote =
	'From innovation and design to quality and attention to detail, Marble Homes is dedicated to achieving excellence in every aspect of construction. We take pride in collaborating effectively with clients and industry professionals to ensure the best results for every project.';

export const about = {
	lead: 'Marble Homes Pty Ltd, founded by Kevin Tang, is renowned for its exceptional services in construction, project management, design, and building.',
	paragraphs: [
		"The company's ethos is deeply rooted in ensuring client satisfaction through a commitment to transparent communication and active client involvement throughout the construction journey.",
		'This unwavering dedication to excellence in customer service has cultivated a base of loyal customers who value not just the superior quality of the finished projects but also the collaborative and seamless experience Marble Homes offers.',
		'Boasting a commendable history of completing projects punctually and within the allocated budget, Marble Homes is recognised as a dependable and esteemed entity within the construction sector. The company specialises in the creation of luxurious residential properties, commercial edifices, and custom-designed architectural masterpieces.',
	],
};

export const statements = ['invest in durable materials.', 'meet every deadline.', 'keep you informed.', 'put your vision first.'];

export const services = [
	{
		title: 'Architectural Design',
		summary:
			'We craft bespoke architectural solutions that blend aesthetic appeal with functionality, tailoring each design to meet the unique needs and visions of our clients.',
		detail:
			'Our team is adept not only in addressing your construction requirements but also in remedial works and office space planning. Marble Homes has facilitated projects reaching the tender stages, offering a comprehensive scope of works, product specification lists, working drawings, and engineer’s details.',
		image: serviceDesign,
	},
	{
		title: 'Construction',
		summary:
			'Our construction services bring architectural designs to life with precision, quality craftsmanship, and a commitment to meeting project timelines and budgets.',
		detail:
			'Marble Homes takes immense pride in every project we undertake. Some of our smallest assignments have paved the way for our most significant ventures. We treat each client with utmost respect and dedication.',
		image: serviceConstruction,
	},
	{
		title: 'Project Management',
		summary:
			'We provide comprehensive project management services, overseeing every aspect from concept to completion to ensure efficiency, quality, and client satisfaction throughout the construction process.',
		detail:
			'We specialise in the delivery of projects in challenging environments, applying a management style that initiates, plans, executes & controls all processes to achieve a client’s vision — meeting time, cost, scope & quality expectations.',
		image: serviceManagement,
	},
];

export const process = [
	{
		title: 'Brief & Design Development',
		body: [
			'We start by defining the brief with you, then prepare a comprehensive scope of works, product specification lists, working drawings, and engineer’s details — taking projects all the way to tender stage.',
			'With a roster of specialist consultants, engineers, and experts who have collaborated with Marble Homes for over seven years, we are equipped to handle specialised tasks such as floating wharf construction and repairs, and abseiling structural engineering.',
		],
		image: processDesign,
	},
	{
		title: 'Approvals & Procurement',
		body: [
			'Our project management covers the full lifecycle from inception, project definition and approvals through to design development and procurement.',
			'Our expertise includes defining the brief, engaging with stakeholders, developing project controls, managing risk, and consultant & contractor procurement.',
		],
		image: processPlanning,
	},
	{
		title: 'Construction Delivery',
		body: [
			'We believe in transparency and accountability, providing our clients with upfront cost estimates to avoid any surprises midway through the project.',
			'Our seasoned project managers leverage years of on-site experience to anticipate potential challenges and inform clients of potential issues in advance, ensuring a smooth and predictable project execution from start to finish.',
		],
		image: serviceConstruction,
	},
	{
		title: 'Commissioning & Handover',
		body: [
			'We manage the construction delivery and handover process through to commissioning and operations, so every project meets the time, cost, scope & quality expectations agreed at the outset.',
			'Marble Homes boasts a commendable history of completing projects punctually and within the allocated budget — the reason so many of our clients return.',
		],
		image: interiorLiving,
	},
];

export const reasons = [
	{
		title: 'Quality Craftsmanship',
		body: 'Marble Homes delivers top-notch construction with a focus on quality craftsmanship.',
	},
	{
		title: 'Durable Materials',
		body: 'We invest in high-quality, durable materials, such as marble, for a tangible and long-lasting impact on the structural integrity and appearance of your project.',
	},
	{
		title: 'On-Time Delivery',
		body: 'With a proven track record of meeting deadlines, Marble Homes is committed to practical reliability, ensuring your project progresses smoothly and on schedule.',
	},
	{
		title: 'Your Vision, Our Priority',
		body: 'Our team is dedicated to understanding your practical needs and preferences, delivering tailored solutions that genuinely reflect your unique style and requirements.',
	},
	{
		title: 'Hands-On Project Management',
		body: 'Expect practical, hands-on project management from Marble Homes, guaranteeing that every aspect of your construction is overseen with meticulous attention to detail.',
	},
	{
		title: 'Transparent Process',
		body: 'Marble Homes adopts a transparent and practical approach, keeping clients informed at every stage, making the construction process straightforward and understandable.',
	},
];
