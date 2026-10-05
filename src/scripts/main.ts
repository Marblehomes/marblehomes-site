import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel) as NodeListOf<T>);

let lenis: Lenis | null = null;
if (!reduceMotion) {
	lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time) => lenis?.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target: string | HTMLElement) {
	if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
	else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: 'smooth' });
}

/* ---------- Header state ---------- */

const updateHeader = () => document.body.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.35);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

/* ---------- Menu ---------- */

const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const setMenu = (open: boolean) => {
	document.body.classList.toggle('menu-open', open);
	openBtn?.setAttribute('aria-expanded', String(open));
	if (open) lenis?.stop();
	else lenis?.start();
};
openBtn?.addEventListener('click', () => setMenu(true));
$$('[data-menu-close], [data-menu-link]').forEach((el) => el.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

/* ---------- In-page anchors ---------- */

document.addEventListener('click', (e) => {
	const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
	if (!link) return;
	const url = new URL(link.href);
	if (url.pathname !== location.pathname || !url.hash) return;
	const el = document.querySelector<HTMLElement>(url.hash);
	if (!el) return;
	e.preventDefault();
	setMenu(false);
	scrollToTarget(el);
	history.replaceState(null, '', url.hash);
});

if (location.hash) {
	const el = document.querySelector<HTMLElement>(location.hash);
	if (el) requestAnimationFrame(() => setTimeout(() => scrollToTarget(el), 120));
}

/* ---------- Split text ---------- */

function splitChars(el: HTMLElement) {
	const chars: HTMLElement[] = [];
	const walk = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent ?? '';
			if (!text.trim()) return;
			const frag = document.createDocumentFragment();
			text.split(/(\s+)/).forEach((part) => {
				if (!part) return;
				if (/^\s+$/.test(part)) {
					frag.append(document.createTextNode(' '));
					return;
				}
				const word = document.createElement('span');
				word.className = 'split-word';
				for (const ch of part) {
					const c = document.createElement('span');
					c.className = 'split-char';
					c.textContent = ch;
					word.append(c);
					chars.push(c);
				}
				frag.append(word);
			});
			node.parentNode?.replaceChild(frag, node);
		} else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== 'BR') {
			Array.from(node.childNodes).forEach(walk);
		}
	};
	el.setAttribute('aria-label', el.textContent?.replace(/\s+/g, ' ').trim() ?? '');
	Array.from(el.childNodes).forEach(walk);
	el.classList.add('is-split');
	return chars;
}

$$('[data-split]').forEach((el) => {
	if (reduceMotion) {
		el.classList.add('is-split');
		return;
	}
	const chars = splitChars(el);
	chars.forEach((c) => c.setAttribute('aria-hidden', 'true'));
	const onLoad = el.dataset.split === 'load';
	gsap.set(chars, { yPercent: 110 });
	gsap.to(chars, {
		yPercent: 0,
		duration: 1.1,
		ease: 'expo.out',
		stagger: Math.min(0.025, 0.6 / chars.length),
		delay: onLoad ? 0.25 : 0,
		scrollTrigger: onLoad ? undefined : { trigger: el, start: 'top 85%', once: true },
	});
});

/* ---------- Reveal ---------- */

if (!reduceMotion) {
	ScrollTrigger.batch('[data-reveal]', {
		start: 'top 88%',
		once: true,
		onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
	});
}

/* ---------- Hero ---------- */

const heroImg = document.querySelector<HTMLElement>('[data-hero] img');
if (heroImg && !reduceMotion) {
	gsap.fromTo(heroImg, { scale: 1.18 }, { scale: 1, duration: 2.4, ease: 'expo.out' });
	gsap.to(heroImg, {
		yPercent: 14,
		ease: 'none',
		scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
	});
}

/* ---------- Parallax ---------- */

if (!reduceMotion) {
	$$('[data-parallax]').forEach((img) => {
		gsap.fromTo(
			img,
			{ yPercent: -8 },
			{ yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
		);
	});
}

/* ---------- Statements ---------- */

$$('[data-statements]').forEach((root) => {
	const items = $$('li', root);
	if (items.length < 2) return;
	let i = 0;
	setInterval(() => {
		items[i].classList.remove('is-active');
		i = (i + 1) % items.length;
		items[i].classList.add('is-active');
	}, 2200);
});

/* ---------- Selected projects drift ---------- */

if (!reduceMotion) {
	gsap.matchMedia().add('(min-width: 961px)', () => {
		$$('.selected__list .card').forEach((card, i) => {
			gsap.fromTo(
				card,
				{ y: 80 + (i % 3) * 40 },
				{ y: -(80 + (i % 3) * 40), ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } },
			);
		});
	});
}

/* ---------- Accordion ---------- */

$$('[data-accordion]').forEach((acc) => {
	const items = $$('.acc-item', acc);
	items.forEach((item) => {
		const btn = item.querySelector<HTMLButtonElement>('.acc-trigger');
		btn?.addEventListener('click', () => {
			const willOpen = !item.classList.contains('is-open');
			items.forEach((other) => {
				other.classList.remove('is-open');
				other.querySelector('.acc-trigger')?.setAttribute('aria-expanded', 'false');
			});
			if (willOpen) {
				item.classList.add('is-open');
				btn.setAttribute('aria-expanded', 'true');
			}
			setTimeout(() => ScrollTrigger.refresh(), 650);
		});
	});
});

/* ---------- Quote word highlight ---------- */

$$('[data-quote]').forEach((el) => {
	const words = (el.textContent ?? '').split(/\s+/).filter(Boolean);
	el.setAttribute('aria-label', words.join(' '));
	el.innerHTML = words.map((w) => `<span class="q-word" aria-hidden="true">${w}</span>`).join(' ');
	const spans = $$('.q-word', el);
	if (reduceMotion) {
		gsap.set(spans, { opacity: 1 });
		return;
	}
	gsap.to(spans, {
		opacity: 1,
		ease: 'none',
		stagger: 0.1,
		scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
	});
});

/* ---------- Expanding image ---------- */

$$('[data-expand]').forEach((section) => {
	const frame = section.querySelector<HTMLElement>('[data-expand-frame]');
	const caption = section.querySelector<HTMLElement>('[data-expand-caption]');
	if (!frame) return;
	if (reduceMotion) {
		gsap.set(frame, { width: '100vw', height: '100svh', borderRadius: 0 });
		if (caption) gsap.set(caption, { opacity: 1 });
		return;
	}
	const tl = gsap.timeline({
		scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true },
	});
	tl.to(frame, { width: '100vw', height: '100svh', borderRadius: 0, ease: 'power2.inOut', duration: 1 });
	tl.fromTo(frame.querySelector('img'), { scale: 1.35 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0);
	if (caption) tl.to(caption, { opacity: 1, y: 0, duration: 0.25 }, 0.85);
});

/* ---------- Project stage ---------- */

$$('[data-stage]').forEach((stage) => {
	const shade = stage.querySelector<HTMLElement>('[data-stage-shade]');
	if (!shade) return;
	gsap.to(shade, {
		opacity: 1,
		ease: 'none',
		scrollTrigger: { trigger: stage, start: 'top top', end: () => `+=${window.innerHeight * 0.8}`, scrub: true },
	});
});

/* ---------- Project filters ---------- */

const grid = document.querySelector<HTMLElement>('[data-project-grid]');
const filters = $$<HTMLButtonElement>('[data-filter]');
filters.forEach((btn) => {
	btn.addEventListener('click', () => {
		const value = btn.dataset.filter;
		filters.forEach((b) => {
			const active = b === btn;
			b.classList.toggle('is-active', active);
			b.setAttribute('aria-pressed', String(active));
		});
		const cards = $$('.card', grid ?? document);
		grid?.classList.toggle('is-filtered', value !== 'all');
		cards.forEach((card) => {
			card.hidden = value !== 'all' && card.dataset.category !== value;
		});
		gsap.fromTo(
			cards.filter((c) => !c.hidden),
			{ opacity: 0, y: 30 },
			{ opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 },
		);
		ScrollTrigger.refresh();
	});
});

/* ---------- Contact form ---------- */

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
form?.addEventListener('submit', (e) => {
	e.preventDefault();
	const status = form.querySelector<HTMLElement>('[data-form-status]');
	const data = new FormData(form);
	const missing = ['firstName', 'email', 'phone'].filter((k) => !String(data.get(k) ?? '').trim());
	if (missing.length || !form.checkValidity()) {
		if (status) status.textContent = 'Please fill in your first name, a valid email and phone number.';
		form.querySelector<HTMLInputElement>(`[name="${missing[0] ?? 'email'}"]`)?.focus();
		return;
	}
	const name = `${data.get('firstName')} ${data.get('lastName') ?? ''}`.trim();
	const body = [
		`Name: ${name}`,
		`Email: ${data.get('email')}`,
		`Phone: ${data.get('phone')}`,
		`Suburb: ${data.get('suburb') || '-'}`,
		`Enquiry: ${data.get('enquiry')}`,
		'',
		String(data.get('message') ?? ''),
	].join('\n');
	const subject = `Website enquiry — ${data.get('enquiry')} (${name})`;
	window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	if (status) status.textContent = 'Opening your email app — thank you, we’ll be in touch shortly.';
});

/* ---------- Fit text to width ---------- */

const fitText = () => {
	$$('[data-fit]').forEach((el) => {
		const available = el.parentElement?.clientWidth ?? window.innerWidth;
		const styles = getComputedStyle(el.parentElement ?? document.body);
		const inner = available - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
		el.style.fontSize = '100px';
		el.style.display = 'inline-block';
		const ratio = inner / el.scrollWidth;
		el.style.display = '';
		el.style.fontSize = `${Math.floor(100 * ratio * 0.99)}px`;
	});
};
document.fonts.ready.then(fitText);
window.addEventListener('resize', fitText);

window.addEventListener('load', () => ScrollTrigger.refresh());
