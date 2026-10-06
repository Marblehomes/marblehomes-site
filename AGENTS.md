# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Codex, Copilot, etc.) working in this repository. Human contributors: see `README.md`.

## Project

Marketing site for Marble Homes, a Sydney builder, served at https://marblehomes.com.au.

- Astro 7, static output. No database.
- Hosting: one Cloudflare Worker (`wrangler.jsonc`). Static files in `dist/` are served directly; only `/api/*` runs Worker code (`worker/index.ts`).
- The only API is `POST /api/contact`: validates the enquiry form, verifies Cloudflare Turnstile, then emails `info@marblehomes.com.au` via Resend.
- Animations: GSAP + ScrollTrigger and Lenis, all in `src/scripts/main.ts`.
- Node 22 (`.nvmrc`).

## Commands

```bash
npm ci          # install
npm run dev     # http://localhost:4321
npm run check   # astro check (types)
npm run build   # outputs dist/
npx wrangler dev --port 8787   # serves dist/ + the Worker API (run build first)
```

For `wrangler dev`, put secrets in a git-ignored `.dev.vars`. Cloudflare's Turnstile test secrets: `1x0000000000000000000000000000000AA` (always passes), `2x0000000000000000000000000000000AA` (always fails).

Before finishing any change, run `npm run check` and `npm run build`. Both must pass; CI runs the same steps.

## Deployment model

- Merging to `main` deploys to production automatically via Cloudflare Workers Builds (`npm run build` then `npx wrangler deploy`). There is no manual deploy step.
- GitHub Actions (`.github/workflows/ci.yml`) only validates; it does not deploy.
- Never add deploy credentials, API tokens or Cloudflare account IDs to the repo.
- Worker secrets `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` live only in the Cloudflare dashboard (Settings → Variables and Secrets). Non-secret config is in `wrangler.jsonc` `vars`. The public Turnstile site key is `turnstileSiteKey` in `src/data/site.ts`.

## Where things live

| What | Where |
| --- | --- |
| Company details, nav, services, process, reasons | `src/data/site.ts` |
| Projects (drives `/projects/` and `/projects/[slug]/`) | `src/content/projects/<slug>/index.md` + photos; schema in `src/content.config.ts`; loaded and sorted by `src/data/projects.ts` |
| Images | Project photos live next to their `index.md`; site images in `src/assets/site/` |
| Design tokens (colours, fonts, spacing) | `:root` in `src/styles/global.css` |
| Page shell, header, footer | `src/layouts/Base.astro`, `src/components/` |
| Interactions and animations | `src/scripts/main.ts` |
| Legacy URL redirects | `public/_redirects` |
| Contact form API | `worker/index.ts` (client side in `src/scripts/main.ts`) |
| Privacy policy | `src/pages/privacy.astro` |

## Conventions

- **Content belongs in `src/data/` and `src/content/`.** Don't hard-code company details, phone numbers or copy in pages or components; read from `site.ts` or the projects collection.
- **Adding a project:** prefer `npm run import-projects -- "<folder>"` (macOS; folder named like `North Ryde House 2` containing a .doc/.docx and photos). It resizes to 2400px, strips EXIF/GPS and writes `src/content/projects/<slug>/`. Otherwise create that folder by hand following an existing `index.md`. `type` is `House | Duplex | Apartment`; `number` is optional and renders as "House 2 — North Ryde"; the 6 lowest `order` values are featured on the home page. Don't create per-project page files.
- **Project photos:** never commit originals straight from a camera or phone; run them through the import script (or equivalent resize + metadata strip) first so the repo stays small and no location data is published.
- **Images:** render with `astro:assets` `<Image>` so they're optimised at build time. Don't put photos in `public/`. Filenames are lowercase-kebab-case.
- **Styling:** use the CSS variables in `global.css` (`--taupe`, `--taupe-deep`, `--cream`, `--greige`, `--gold`, `--font-body`, …) rather than new literal colours. Keep the existing class naming style (`block__element`, `block--modifier`).
- **Animations:** add behaviour in `src/scripts/main.ts`, scoped by a data attribute or class. Respect `prefers-reduced-motion` and use `gsap.matchMedia` for breakpoint-specific motion. Elements hidden for reveal must stay visible when JS is off (reveals are gated on the `js` class on `<html>`).
- **Links:** internal links use trailing slashes (`/about/`, `/projects/northbridge-house-2/`), matching `html_handling: auto-trailing-slash`.
- **Redirects:** when renaming or removing a page, add a 301 to `public/_redirects` (both slash and no-slash forms).
- **Code style:** tabs for indentation in `.astro`, `.ts` and `.mjs`; TypeScript strict mode. Match surrounding code; keep comments rare and only for non-obvious constraints.
- **Contact form:** if you add or rename a form field, update both `contact.astro` and `LIMITS` in `worker/index.ts`. If you add a new data processor or start collecting new personal information, update `privacy.astro`.
- **Copy:** Australian English (colour, organise, programme). All text and images must be Marble Homes' own. Don't copy wording or imagery from other builders' websites.

## Dependencies

- The lockfile must only reference `https://registry.npmjs.org/`. Cloudflare's build can't reach private registries; the project `.npmrc` enforces this and CI fails otherwise.
- Prefer no new runtime dependencies. If one is needed, explain why in the PR.

## Don't

- Don't commit `dist/`, `node_modules/`, `.astro/`, `.wrangler/`, `.dev.vars` or any `.env` files.
- Don't edit or remove anything related to email DNS (MX, SPF, Microsoft 365). That lives in Cloudflare, not this repo, but don't suggest changes to it.
- Don't change `wrangler.jsonc` or `astro.config.mjs` `site` without a clear reason; both affect production directly.
