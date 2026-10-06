// Imports project folders ("Northbridge House 2/" with a .doc/.docx description and photos)
// into src/content/projects/<slug>/. macOS only: descriptions are read with `textutil`.
//
//   npm run import-projects -- "<folder of project folders | single project folder>" [--force]
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const TYPES = { house: 'House', duplex: 'Duplex', apartment: 'Apartment' };
const IMAGE_RE = /\.(jpe?g|png|webp|heic|tiff?)$/i;
const DOC_RE = /\.docx?$/i;
const MAX_EDGE = 2400;

const outRoot = fileURLToPath(new URL('../src/content/projects/', import.meta.url));
const args = process.argv.slice(2);
const force = args.includes('--force');
const input = args.find((a) => !a.startsWith('--'));
if (!input) {
	console.error('Usage: npm run import-projects -- "<folder>" [--force]');
	process.exit(1);
}
const source = path.resolve(input.replace(/^~(?=$|\/)/, homedir()));

const titleCase = (s) => s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export function parseFolderName(name) {
	const tokens = name.trim().split(/\s+/);
	const typeIndex = tokens.findIndex((t) => TYPES[t.toLowerCase()]);
	if (typeIndex < 1) throw new Error(`Can't find House/Duplex/Apartment after a location in "${name}"`);
	const type = TYPES[tokens[typeIndex].toLowerCase()];
	const number = tokens.map(Number).find((n) => Number.isInteger(n) && n > 1);
	const location = titleCase(tokens.slice(0, typeIndex).filter((t) => !/^\d+$/.test(t)).join(' '));
	const slug = [location, type, number].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-');
	return { type, number, location, slug };
}

const readDescription = (file) =>
	execFileSync('textutil', ['-convert', 'txt', '-stdout', file], { encoding: 'utf8' })
		.split(/\n+/)
		.map((p) => p.trim())
		.filter(Boolean)
		.join('\n\n');

async function nextOrder() {
	if (!existsSync(outRoot)) return 10;
	let max = 0;
	for (const dir of await readdir(outRoot)) {
		const md = path.join(outRoot, dir, 'index.md');
		if (!existsSync(md)) continue;
		const m = (await readFile(md, 'utf8')).match(/^order:\s*(\d+)/m);
		if (m) max = Math.max(max, Number(m[1]));
	}
	return max + 10;
}

async function importProject(dir) {
	const meta = parseFolderName(path.basename(dir));
	const out = path.join(outRoot, meta.slug);
	if (existsSync(out) && !force) {
		console.log(`skip   ${meta.slug} (exists; use --force to overwrite)`);
		return;
	}

	const files = (await readdir(dir)).filter((f) => !f.startsWith('.')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
	const doc = files.find((f) => DOC_RE.test(f));
	const photos = files.filter((f) => IMAGE_RE.test(f));
	if (!doc) throw new Error(`No .doc/.docx description in ${dir}`);
	if (!photos.length) throw new Error(`No photos in ${dir}`);

	const existingMd = path.join(out, 'index.md');
	const previousOrder = existsSync(existingMd) ? (await readFile(existingMd, 'utf8')).match(/^order:\s*(\d+)/m)?.[1] : undefined;
	const order = previousOrder ? Number(previousOrder) : await nextOrder();
	await rm(out, { recursive: true, force: true });
	await mkdir(out, { recursive: true });

	const names = [];
	for (const [i, photo] of photos.entries()) {
		const name = `${String(i + 1).padStart(2, '0')}.jpg`;
		await sharp(path.join(dir, photo))
			.rotate()
			.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 80, mozjpeg: true })
			.toFile(path.join(out, name));
		names.push(`./${name}`);
	}

	const frontmatter = [
		'---',
		`type: ${meta.type}`,
		`location: ${JSON.stringify(meta.location)}`,
		`order: ${order}`,
		`cover: ${names[0]}`,
		'gallery:',
		...names.map((n) => `  - ${n}`),
		'---',
	];
	await writeFile(path.join(out, 'index.md'), `${frontmatter.join('\n')}\n\n${readDescription(path.join(dir, doc))}\n`);
	console.log(`import ${meta.slug} (${photos.length} photos)`);
}

const entries = await readdir(source);
const isSingle = entries.some((f) => DOC_RE.test(f));
const dirs = isSingle
	? [source]
	: (
			await Promise.all(
				entries.filter((f) => !f.startsWith('.')).map(async (f) => ((await stat(path.join(source, f))).isDirectory() ? path.join(source, f) : null)),
			)
		).filter(Boolean);

for (const dir of dirs.sort()) await importProject(dir);
