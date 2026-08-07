import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Not available with legacy API
import { PROJECT_PAGES_BASE, PROJECT_PAGES_PATTERN } from './utils/projectPagesSource';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
		title: z.string(),
    seoTitle: z.string().optional(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
		coverImage: image().optional()
	})
});

const majorSkills = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/majorskills" }),
  schema: z.object({
    title: z.string(),
    order: z.number()
  })
});

const experiences = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experiences" }),
  schema: z.object({
    id: z.string(),
    roleName: z.string(),
    companyName: z.string(),
    companyUrl: z.string().nullable(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string(),
    workType: z.enum(['onsite', 'hybrid', 'remote']),
    tags: z.array(z.string())
  })
});

const education = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/education" }),
  schema: z.object({
    title: z.string(),
    universityName: z.string(),
    universityUrl: z.string().nullable(),
    facultyName: z.string(),
    facultyUrl: z.string().nullable(),
    universityLocation: z.string(),
    startDate: z.string(),
    endDate: z.string()
  })
});

const recommendations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/recommendations" }),
  schema: z.object({
    id: z.number(),
    name: z.string(),
    title: z.string(),
    avatar: z.string(),
    date: z.string(),
    relationship: z.string(),
    linkedinUrl: z.string(),
    pullQuote: z.string().optional(), // curated card quote; falls back to the body's first sentence
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) => z.object({
    name: z.string(),
    demoLink: z.string(),
    demoLinkRel: z.string().optional(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    postLink: z.string().optional(),
    isUnderConstruction: z.boolean().default(false),
    publishedPackageLink: z.string().optional(),
    version: z.string().optional(),
    isFeatured: z.boolean().default(false),
    id: z.string(), // New required property for sorting
    coverImage: image().optional()
  })
});

// Project showcase pages — one standalone marketing page per released system,
// each eventually served on its own subdomain. Every band is optional except
// the hero and the closing, so a page can ship with only the parts it has copy for.
//
// Every band carries its own kicker, heading and links. The point of this
// collection is that project #2 costs one markdown file: nothing that varies
// between projects may live in a template.
//
// Nested string fields render as PLAIN TEXT, not markdown. Code identifiers are
// written with ‘single curly quotes’ — the design system has no inline-code
// treatment and that is the approved rendering. Backticks would render literally.
// One line of a rendered code block. Exported as a type so the render helpers that
// consume it — the scaffold's renderLines today, Group C's code-block component
// tomorrow — derive their signature from the schema instead of restating it.
//
// `prompt: true` draws a caramel ‘$’ before the line, marking it as something you
// type. There is no third field for output, because a transcript already says so
// in its own text: a line whose text OPENS with ✓ or ✔ is drawn as a success mark
// in sage, and is left out of what the Copy control puts on the clipboard —
// alongside the ‘$’ markers — so a copied block pastes into a shell and runs.
// Write the glyph as the first character of `text`; anywhere else it is just text.
const codeLine = z.object({ prompt: z.boolean().default(false), text: z.string() });
export type CodeLine = z.infer<typeof codeLine>;

const projectPages = defineCollection({
  // Pattern and base come from projectPagesSource.ts, shared with the build-time
  // read that keeps these pages out of the sitemap. If the two disagreed, a page
  // could be generated and then advertised on the wrong host.
  loader: glob({ pattern: PROJECT_PAGES_PATTERN, base: PROJECT_PAGES_BASE }),
  schema: ({ image }) => {
    const cta = (labelMax: number) => z.object({ label: z.string().max(labelMax), href: z.string() });
    const link = z.object({ label: z.string().max(40), href: z.string() });
    // A row whose label is page copy too, not a template constant: "Privacy", "Asr:", …
    // The value cap is per-site: these rows carry anything from a one-word licence
    // to a full paragraph, and the cap exists to protect the layout, not the prose.
    const labelled = (valueMax: number) =>
      z.object({ label: z.string().max(40), value: z.string().max(valueMax) });
    const kicker = z.string().max(44);
    const media = z.object({ src: image(), alt: z.string() });
    // Band headings are display type set at one size; past ~60 characters the
    // line count changes and the band's rhythm breaks. hero, why and closing
    // carry their own tighter caps because their headings are shaped differently.
    const bandHeading = z.string().max(60);
    // The phrase inside a heading that takes the caramel marker. It must be a
    // visible phrase: .marker-wash carries padding, so a blank wash renders an
    // empty span that injects 20px of stray space before the heading. A bare
    // .min(1) would still let " " through, and "".includes() defeats the
    // cross-field substring check in getProjectPages().
    const wash = z.string().refine((value) => value.trim().length > 0, {
      message: 'wash must contain a visible phrase; a blank wash renders an empty, padded marker span'
    });
    // heading and wash are siblings, so the substring invariant is an object-level
    // refinement rather than something a caller has to remember to run. Applied
    // here it reports through Astro's frontmatter errors and holds for every
    // consumer of the collection, including components that import it directly.
    const washIsInHeading = (band: { heading: string; wash: string }) =>
      band.heading.includes(band.wash);
    const washIsInHeadingError = {
      message: 'wash must appear verbatim inside heading, or the marker span renders empty',
      path: ['wash']
    };

    return z.object({
      // Deliberately an explicit field rather than the glob loader's derived id,
      // which is how blog posts work. A Zod regex can validate a schema field and
      // cannot validate a filename — and the regex is what stops a slug like
      // "About" from overwriting dist/about/index.html on a case-insensitive
      // filesystem. The divergence from the blog idiom buys that check.
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'slug must be lowercase kebab-case: it becomes the URL segment'
      }),
      // A bare hostname. src/pages/[project].astro interpolates it into
      // `https://<subdomain>/` for the page's canonical, og:url and twitter:url —
      // which is why a scheme, port, path or trailing slash is rejected here:
      // any of them would produce a malformed URL rather than a wrong one.
      // The same value is what keeps the page out of the main sitemap.
      subdomain: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/, {
        message: 'subdomain must be a bare lowercase hostname — no scheme, port, path or trailing slash'
      }),
      // The product noun on its own, for chrome that names the project rather
      // than sells it: the subdomain nav, meta, breadcrumbs.
      projectName: z.string().max(12),
      hero: z.object({
        kicker,
        // The full H1, including its own trailing punctuation.
        heading: z.string().max(80),
        wash,
        promise: z.string().max(140),
        status: z.enum(['Stable', 'In progress', 'Maintained', 'Archived']),
        version: z.string().optional(),
        ctaPrimary: cta(18),
        ctaSecondary: cta(22),
        media: media.optional()
      }).refine(washIsInHeading, washIsInHeadingError),
      glance: z.object({
        kicker,
        items: z.array(z.object({ value: z.string().max(12), label: z.string().max(60) }))
          .min(3).max(5)
      }).optional(),
      why: z.object({
        kicker,
        heading: z.string().max(50),
        paragraphs: z.array(z.string()).min(2).max(3)
      }).optional(),
      // The long-form band for a project's signature feature: a standfirst, an
      // optional code block, and however many labelled paragraphs that feature
      // needs. Named for the role, not the subject — InZsh fills it with prayer
      // times, the next project fills it with something else, and neither has to
      // touch this file. Row order is the author's, not a side effect of where
      // the fields happen to sit in the schema.
      deepDive: z.object({
        kicker,
        heading: bandHeading,
        standfirst: z.string(),
        // Label above the code block, e.g. "Four values in .zshrc".
        codeLabel: z.string().max(40).optional(),
        code: z.array(codeLine).optional(),
        media: media.optional(),
        rows: z.array(labelled(400)).min(2).max(6)
      }).optional(),
      // The one band the approved design runs without a kicker, so kicker is optional here.
      config: z.object({
        kicker: kicker.optional(),
        heading: bandHeading,
        intro: z.string(),
        // Column headers are copy, not derivable from the keys: "fallback" prints
        // as "Default" here, and a non-zsh project needs different headers entirely.
        knobHeaders: z.object({
          name: z.string().max(24),
          values: z.string().max(24),
          fallback: z.string().max(24),
          effect: z.string().max(24)
        }),
        knobs: z.array(z.object({
          name: z.string(),
          values: z.array(z.string()),
          fallback: z.string(),
          effect: z.string()
        })).min(1),
        note: z.string(),
        link: link.optional()
      }).optional(),
      steps: z.object({
        kicker,
        heading: bandHeading,
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({
          title: z.string().max(26),
          lines: z.array(codeLine),
          note: z.string().max(110).optional()
        })).min(2).max(4)
      }).optional(),
      // A caption is copy and ships before its capture exists, so src is optional
      // within an item. items itself is not optional: a gallery band with a
      // heading and nothing under it is a mistake, not a staging step.
      gallery: z.object({
        kicker,
        heading: bandHeading,
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({ src: image().optional(), caption: z.string().max(70) }))
          .min(2).max(4)
      }).optional(),
      specs: z.object({
        kicker,
        heading: bandHeading,
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(labelled(90)).min(4).max(7)
      }).optional(),
      // Three or four short claims, each a title and a sentence. InZsh uses it for
      // colour accessibility; the role is "the things we promise", not "colour".
      pillars: z.object({
        kicker,
        heading: bandHeading,
        cards: z.array(z.object({ title: z.string(), body: z.string() })).min(3).max(4)
      }).optional(),
      verification: z.object({
        kicker,
        heading: bandHeading,
        rows: z.array(labelled(200)).min(3).max(5)
      }).optional(),
      faq: z.object({
        kicker,
        heading: bandHeading,
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({ q: z.string().max(70), a: z.string() })).min(3).max(6)
      }).optional(),
      closing: z.object({
        heading: z.string().max(36),
        wash,
        sub: z.string().max(90),
        ctaPrimary: cta(18),
        ctaSecondary: cta(22),
        facts: z.array(z.string().max(14)).max(4).optional()
      }).refine(washIsInHeading, washIsInHeadingError),
      credit: z.string().optional()
    });
  }
});

const interests = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/interests" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(60, { message: "Description must be 60 characters or less" }),
    coverImage: z.string().optional()
  })
});

export const collections = { blog, majorSkills, experiences, education, recommendations, projects, interests, projectPages };