// Builds light-on-dark logo variants from the original black/gold PNG.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../src/assets/site/logo.png', import.meta.url));
const out = (name) => fileURLToPath(new URL(`../src/assets/site/${name}`, import.meta.url));
const CREAM = [250, 245, 237];

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const light = Buffer.from(data);
let gold = [0, 0, 0, 0];

for (let i = 0; i < light.length; i += 4) {
	const [r, g, b, a] = [light[i], light[i + 1], light[i + 2], light[i + 3]];
	if (a < 10) continue;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const isNeutral = max - min < 28;
	if (isNeutral && max < 150) {
		light[i] = CREAM[0];
		light[i + 1] = CREAM[1];
		light[i + 2] = CREAM[2];
	} else if (!isNeutral && a > 200) {
		gold[0] += r;
		gold[1] += g;
		gold[2] += b;
		gold[3]++;
	}
}

const raw = { raw: { width: info.width, height: info.height, channels: 4 } };
await sharp(light, raw).png().toFile(out('logo-light.png'));
await sharp(light, raw).extract({ left: 60, top: 0, width: info.width - 120, height: 320 }).trim().png().toFile(out('mark-light.png'));
await sharp(data, raw).extract({ left: 60, top: 0, width: info.width - 120, height: 320 }).trim().png().toFile(out('mark-dark.png'));

const favicon = await sharp(light, raw).extract({ left: 60, top: 0, width: info.width - 120, height: 320 }).trim().resize(52, 52, { fit: 'contain', background: '#00000000' }).png().toBuffer();
await sharp({ create: { width: 64, height: 64, channels: 4, background: '#5f5850' } })
	.composite([{ input: favicon, gravity: 'center' }])
	.png()
	.toFile(fileURLToPath(new URL('../public/favicon.png', import.meta.url)));

const hex = gold.slice(0, 3).map((c) => Math.round(c / gold[3]).toString(16).padStart(2, '0')).join('');
console.log(`logo ${info.width}x${info.height}, average gold #${hex}`);
