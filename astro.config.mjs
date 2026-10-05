import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://marblehomes.com.au',
	server: { port: 4321, host: true },
	devToolbar: { enabled: false },
	vite: {
		optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'lenis'] },
	},
});
