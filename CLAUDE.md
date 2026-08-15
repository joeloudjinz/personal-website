# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio and blog site for Abdellah Addoun, built with Astro 5, TypeScript, Tailwind CSS, and MDX. Deployed to Firebase Hosting at https://abdellahaddoun.com.

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Production build (outputs to `dist/`)
- `npm run check:build` — TypeScript check + build
- `npm run preview` — Preview production build locally

No test framework is configured — `npm run check:build` is the primary validation step for any change.

## Git Workflow & Deployment

- Day-to-day work happens on the `dev` branch; changes reach `main` via pull requests.
- No CI/CD is configured. Deploys are manual (`firebase deploy` after `npm run build`) and often run directly from `dev`, so the live site can be ahead of `main`. Firebase Hosting serves `dist/`; project ID: `personal-website-50382`.
- **The main site and the project subdomains deploy separately.** Firebase serves `abdellahaddoun.com`; each project page is its own Cloudflare Pages project behind a Porkbun CNAME, converged by `npm run subdomain:* <target>` (`scripts/subdomain/`). Run those from the main checkout, never a worktree — the `checkout` phase blocks it, because a worktree carries a different branch and its own `.env`. Runbook: `docs/subdomain-deploys.md`.
- A new project page needs both halves: a target in `scripts/subdomain/targets.mjs`, and a `/<slug>{,/**}` redirect in `firebase.json` that only takes effect on the next main-site deploy.

## Architecture

### Content Collections

All site content lives in `src/content/` as Markdown files managed by Astro's content collections (defined in `src/content.config.ts` with Zod schemas). Seven collections exist:

- **blog/** — Posts in `date-slug/index.md` format. Schema: title, description, pubDate (required); seoTitle, updatedDate, tags, coverImage (optional).
- **experiences/** — Work history entries sorted by numeric ID prefix (e.g. `01-dubai-backend.md`).
- **education/** — Degree entries with university/faculty metadata.
- **projects/** — Open-source projects with version, tags, demo links. Custom sort order in `pages/projects/index.astro`.
- **majorskills/** — Skill areas sorted by `order` field.
- **recommendations/** — Professional testimonials with LinkedIn links.
- **interests/** — Short personal interests with cover images.

### Routing

- Blog post detail pages use the catch-all route `src/pages/[...slug].astro`, which generates static paths from the blog collection.
- Tags: `src/pages/tags/index.astro` lists all tags; `src/pages/tags/[tag]/index.astro` filters posts by tag.
- A sitemap is generated at build time by `@astrojs/sitemap` (site URL set in `astro.config.mjs`).
- Other pages are standard file-based routes (`index`, `about`, `projects/index`, `posts/index`, `404`).

### Layout & Components

`src/layouts/BaseLayout.astro` wraps all pages (per-page `gradient` prop picks the background family: `glow`/`subtle`/`warm`); its building blocks (`BaseHead`, `Header`, `Footer`) live in `src/layouts/components/`. Reusable components live in `src/components/` — card components for each content type, `StackLine` (dotted tag lines), `Byline`, `ContactBlock`, `ToolboxMarquee`, plus `Prose.astro` for article typography. Blog posts include `TableOfContent` (H2 rows, scroll-synced) and `PublisherCard` sidebar widgets from `src/components/widgets/`, plus a reading-progress bar.

### Key Patterns

- **Design system**: "Joe Inz" brand — semantic CSS custom properties in `src/styles/global.css` (cream/chocolate/caramel light, navy dark), mapped into Tailwind via `tailwind.config.mjs`. Fraunces (display) + Inter (UI/body) from Google Fonts. Shared classes: `.shell`, `.kicker`, `.cardx`, `.chip`, `.btn-*`, `.marker-wash`, `.stack-line`.
- **Path alias**: `@src/*` maps to `src/*` (configured in tsconfig.json).
- **Dark mode**: `.theme-dark` class on `<html>` flips the semantic tokens (Tailwind `darkMode: ['selector', '.theme-dark']`), persisted in localStorage (checked before OS preference), re-applied on Astro View Transitions via `astro:after-swap`. Giscus comments sync theme via script.
- **View transitions**: Astro `ClientRouter` in `BaseLayout`; per-page inline scripts bind via `astro:page-load` with window guards.
- **External links**: Custom rehype plugin `src/autoNewTabExternalLinks.ts` opens external links in new tabs (excludes localhost:4321).
- **Analytics**: Google Analytics 4 via inline gtag scripts in `BaseLayout.astro`. `PUBLIC_GTAG_MEASUREMENT_ID` is declared in the `env.schema` of `astro.config.mjs` (client/public).
- **Comments**: Giscus integration in `[...slug].astro`, conditional on `GISCUS_*` env vars read via Vite's `loadEnv`.
- **Site constants**: `src/consts.ts` holds name, title, tagline, social URLs.
- **Utilities**: `src/utils.ts` has `slugify()`. `src/utils/posts.ts` provides `getSortedPosts()` and `getTagSlugMap()`; `src/utils/projects.ts` provides `getAllProjects()`.

### Styling

Tailwind CSS with `@tailwindcss/typography` plugin. All colors flow through the semantic tokens in `src/styles/global.css` — never hard-code palette values in components. Page backgrounds are gradients + a grain overlay (see `.page-grad-*` and `.grain-overlay`). Motion respects `prefers-reduced-motion`; content shell is 1440px with 96px side padding at desktop (`.shell`).

## Environment Variables

All are optional:
- `PUBLIC_GTAG_MEASUREMENT_ID` — GA4 measurement ID (public, client-side; declared in the `astro.config.mjs` env schema)
- `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`, `GISCUS_CATEGORY_ID` — Giscus comments config (build-time only, via `loadEnv`)
