# Astro Personal Website - Project Context

## Project Overview

This is a personal website built with Astro, designed to showcase portfolio, blog, projects, and professional experience using the Devolio template. The site is built with modern web technologies to provide a fast, responsive, and SEO-friendly experience.

### Key Technologies
- **Astro** - Modern static site builder
- **TypeScript** - Type safety and enhanced development experience
- **Tailwind CSS** - Utility-first CSS framework for styling
- **MDX** - Content with JSX components
- **Content Collections** - Structured content management for blog posts

### Project Structure
```
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable Astro components
│   ├── widgets/      # Widget components
│   ├── Author.astro
│   ├── FormattedDate.astro
│   ├── PostItem.astro
│   ├── PostsByYear.astro
│   ├── ProjectList.astro
│   └── Prose.astro
├── content/          # Content collections
│   └── blog/         # Blog posts organized by date
├── layouts/          # Page layouts
├── pages/            # Route pages
│   ├── posts/
│   ├── projects/
│   ├── tags/
│   ├── [...slug].astro
│   ├── 404.astro
│   ├── about.astro
│   ├── index.astro
│   └── rss.xml.js
├── styles/           # Global styles
├── autoNewTabExternalLinks.ts  # Utility for external links
├── const.ts          # Constants
├── content.config.ts # Content collection configuration
├── env.d.ts          # TypeScript declaration file
└── utils.ts          # Utility functions
```

## Building and Running

### Development Commands
- `npm run dev` or `npm start` - Start the development server
- `npm run build` - Build the production site (with type checking)
- `npm run preview` - Preview the built site locally

### Key Features
- **Content Collections**: Blog posts organized in `src/content/blog/` with structured metadata (title, description, publication date, tags, cover image)
- **MDX Support**: Ability to use JSX components within Markdown content
- **RSS Feed**: Automatic generation of RSS feed for blog content
- **Sitemap**: Automatic sitemap generation for SEO
- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive design
- **Type Safety**: TypeScript configuration with strict mode enabled

### Content Structure
Blog posts are stored in `src/content/blog/` organized in dated directories. Each post includes frontmatter with:
- title
- seoTitle (optional)
- description
- pubDate
- updatedDate (optional)
- tags
- coverImage (optional)

### Environment Variables
- Uses `.env.example` as a template for environment variables
- Site domain configured in `astro.config.mjs` (currently marked as TODO to replace with actual domain)

### Development Conventions
- TypeScript with strict null checks enabled
- Tailwind CSS utility classes with typography plugin
- Component-based architecture using Astro components
- SEO best practices (sitemap, RSS, structured content)
- Code formatting with Prettier

### Integration Notes
- Uses `@astrojs/mdx` for MDX content support
- Uses `@astrojs/sitemap` for automatic sitemap generation
- Uses `@astrojs/tailwind` for Tailwind CSS integration
- Uses `@astrojs/partytown` for third-party script optimization
- Custom `autoNewTabExternalLinks` utility for handling external links