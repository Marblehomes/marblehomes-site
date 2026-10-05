# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Codex, Copilot, etc.) working in this repository. Human contributors: see `README.md`.

## Project

Static marketing site for Marble Homes, a Sydney builder, served at https://marblehomes.com.au.

- Astro 7, static output only. No server, database or API routes.
- Animations: GSAP + ScrollTrigger and Lenis, all in `src/scripts/main.ts`.
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc` serves `dist/`).
- Node 22 (`.nvmrc`).

## Commands

```bash
npm ci          # install
npm run dev     # http://localhost:4321
npm run check   # astro check (types)
npm run build   # outputs dist/
```

Before finishing any change, run `npm run check` and `npm run build`. Both must pass; CI runs the same steps.

## Deployment model

- Merging to `main` deploys to production automatically via Cloudflare Workers Builds (`npm run build` then `npx wrangler deploy`). There is no manual deploy step.
- GitHub Actions (`.github/workflows/ci.yml`) only validates; it does not deploy.
- Never add deploy credentials, API tokens or Cloudflare account IDs to the repo.

## Where things live

| What | Where |
| --- | --- |
| Company details, nav, services, process, reasons | `src/data/site.ts` |
| Projects (drives `/projects/` and `/projects/[slug]/`) | `src/data/projects.ts` |
| Images | `src/assets/projects/`, `src/assets/site/` |
| Design tokens (colours, fonts, spacing) | `:root` in `src/styles/global.css` |
| Page shell, header, footer | `src/layouts/Base.astro`, `src/components/` |
| Interactions and animations | `src/scripts/main.ts` |
| Legacy URL redirects | `public/_redirects` |

## Conventions

- **Content belongs in `src/data/`.** Don't hard-code company details, phone numbers or copy in pages or components; read from `site.ts` or `projects.ts`.
- **Adding a project:** import the image in `projects.ts` and add a `make(slug, suburb, type, category, image)` entry. Pages are generated; don't create per-project files. The first 6 entries are featured on the home page.
- **Images:** put source images in `src/assets/` and render them with `astro:assets` `<Image>` so they're optimised at build time. Don't put photos in `public/`. Filenames are lowercase-kebab-case.
- **Styling:** use the CSS variables in `global.css` (`--taupe`, `--taupe-deep`, `--cream`, `--greige`, `--gold`, `--font-body`, …) rather than new literal colours. Keep the existing class naming style (`block__element`, `block--modifier`).
- **Animations:** add behaviour in `src/scripts/main.ts`, scoped by a data attribute or class. Respect `prefers-reduced-motion` and use `gsap.matchMedia` for breakpoint-specific motion. Elements hidden for reveal must stay visible when JS is off (reveals are gated on the `js` class on `<html>`).
- **Links:** internal links use trailing slashes (`/about/`, `/projects/st-ives/`), matching `html_handling: auto-trailing-slash`.
- **Redirects:** when renaming or removing a page, add a 301 to `public/_redirects` (both slash and no-slash forms).
- **Code style:** tabs for indentation in `.astro`, `.ts` and `.mjs`; TypeScript strict mode. Match surrounding code; keep comments rare and only for non-obvious constraints.
- **Copy:** Australian English (colour, organise, programme). All text and images must be Marble Homes' own. Don't copy wording or imagery from other builders' websites.

## Dependencies

- The lockfile must only reference `https://registry.npmjs.org/`. Cloudflare's build can't reach private registries; the project `.npmrc` enforces this and CI fails otherwise.
- Prefer no new runtime dependencies. If one is needed, explain why in the PR.

## Don't

- Don't commit `dist/`, `node_modules/`, `.astro/` or any `.env` files.
- Don't edit or remove anything related to email DNS (MX, SPF, Microsoft 365). That lives in Cloudflare, not this repo, but don't suggest changes to it.
- Don't change `wrangler.jsonc` or `astro.config.mjs` `site` without a clear reason; both affect production directly.
