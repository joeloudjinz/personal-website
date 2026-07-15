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

`src/layouts/BaseLayout.astro` wraps all pages; its building blocks (`BaseHead`, `Header`, `HeaderLink`, `Footer`) live in `src/layouts/components/`. Reusable components live in `src/components/` — card components for each content type, plus `Prose.astro` for Tailwind typography wrapping. Blog posts include `TableOfContent` (scroll-synced TOC from H2/H3 headings) and `AboutTheAuthor` sidebar widgets from `src/components/widgets/`.

### Key Patterns

- **Path alias**: `@src/*` maps to `src/*` (configured in tsconfig.json).
- **Dark mode**: Class-based toggle (`selector` strategy), persisted in localStorage. Giscus comments sync theme via script.
- **External links**: Custom rehype plugin `src/autoNewTabExternalLinks.ts` opens external links in new tabs (excludes localhost:4321).
- **Analytics**: Google Analytics 4 via inline gtag scripts in `BaseLayout.astro`. `PUBLIC_GTAG_MEASUREMENT_ID` is declared in the `env.schema` of `astro.config.mjs` (client/public).
- **Comments**: Giscus integration in `[...slug].astro`, conditional on `GISCUS_*` env vars read via Vite's `loadEnv`.
- **Site constants**: `src/consts.ts` holds name, title, tagline, social URLs.
- **Utilities**: `src/utils.ts` has `slugify()` and `unslugify()`. A separate `src/utils/projects.ts` provides `getAllProjects()`.

### Styling

Tailwind CSS with `@tailwindcss/typography` plugin. Custom animated gradient utilities (`purple-red-gradient-wave`, `beige-amber-gradient-wave`) defined in `src/styles/global.css` as `@layer utilities`. Container max-width is 1024px.

## Environment Variables

All are optional:
- `PUBLIC_GTAG_MEASUREMENT_ID` — GA4 measurement ID (public, client-side; declared in the `astro.config.mjs` env schema)
- `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`, `GISCUS_CATEGORY_ID` — Giscus comments config (build-time only, via `loadEnv`)
