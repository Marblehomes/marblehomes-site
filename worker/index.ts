interface Env {
	ASSETS: { fetch(request: Request): Promise<Response> };
	CONTACT_TO: string;
	CONTACT_FROM: string;
	RESEND_API_KEY?: string;
	TURNSTILE_SECRET_KEY?: string;
}

const LIMITS = {
	firstName: 80,
	lastName: 80,
	email: 254,
	phone: 40,
	suburb: 80,
	enquiry: 60,
	message: 5000,
} as const;

type Field = keyof typeof LIMITS;
type Enquiry = Record<Field, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
	Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

const escapeHtml = (s: string) =>
	s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const singleLine = (s: string) => s.replace(/[\r\n]+/g, ' ');

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
	const body = new URLSearchParams({ secret, response: token });
	if (ip) body.set('remoteip', ip);
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
	const result = (await res.json()) as { success?: boolean };
	return result.success === true;
}

function renderEmail(e: Enquiry) {
	const name = `${e.firstName} ${e.lastName}`.trim();
	const rows: [string, string][] = [
		['Name', name],
		['Email', e.email],
		['Phone', e.phone],
		['Suburb', e.suburb || '-'],
		['Enquiry', e.enquiry || '-'],
	];
	const text = [...rows.map(([k, v]) => `${k}: ${v}`), '', e.message || '(no message)'].join('\n');
	const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="color:#6b645c"><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`).join('\n')}
</table>
<p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(e.message || '(no message)')}</p>`;
	return { subject: singleLine(`Website enquiry — ${e.enquiry || 'General'} (${name})`), text, html };
}

async function handleContact(request: Request, env: Env) {
	if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
	if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
		console.error('Contact form is not configured: RESEND_API_KEY or TURNSTILE_SECRET_KEY is missing');
		return json(503, { error: 'not_configured' });
	}

	const origin = request.headers.get('origin');
	if (origin && new URL(origin).host !== new URL(request.url).host) return json(403, { error: 'forbidden' });

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return json(400, { error: 'bad_request' });
	}

	// Honeypot: bots fill the hidden field; pretend success so they don't retry.
	// Its name must not look like anything browsers autofill (e.g. "company"), or real enquiries get dropped.
	if (String(form.get('mh_trap') ?? '').trim()) {
		console.warn('Contact form honeypot triggered; enquiry dropped');
		return json(200, { ok: true });
	}

	const enquiry = Object.fromEntries(
		(Object.keys(LIMITS) as Field[]).map((k) => [k, String(form.get(k) ?? '').trim().slice(0, LIMITS[k])]),
	) as Enquiry;
	if (!enquiry.firstName || !EMAIL_RE.test(enquiry.email) || !enquiry.phone) return json(422, { error: 'invalid' });

	const token = String(form.get('cf-turnstile-response') ?? '');
	try {
		if (!token || !(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request.headers.get('cf-connecting-ip')))) {
			return json(403, { error: 'verification_failed' });
		}

		const { subject, text, html } = renderEmail(enquiry);
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
			body: JSON.stringify({
				from: env.CONTACT_FROM,
				to: [env.CONTACT_TO],
				reply_to: singleLine(enquiry.email),
				subject,
				text,
				html,
			}),
		});
		if (!res.ok) {
			console.error('Resend error', res.status, await res.text());
			return json(502, { error: 'send_failed' });
		}
		return json(200, { ok: true });
	} catch (err) {
		console.error('Contact form upstream error', err);
		return json(502, { error: 'upstream_error' });
	}
}

export default {
	async fetch(request: Request, env: Env) {
		const { pathname } = new URL(request.url);
		if (pathname === '/api/contact') return handleContact(request, env);
		return env.ASSETS.fetch(request);
	},
};
