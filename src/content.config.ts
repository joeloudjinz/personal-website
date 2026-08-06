import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Not available with legacy API

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
const projectPages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projectpages" }),
  schema: ({ image }) => {
    const cta = z.object({ label: z.string().max(22), href: z.string() });
    const link = z.object({ label: z.string().max(40), href: z.string() });
    // A row whose label is page copy too, not a template constant: "Privacy", "Asr:", …
    const labelled = z.object({ label: z.string().max(40), value: z.string() });

    return z.object({
      slug: z.string(),
      subdomain: z.string(),
      projectName: z.string().max(12),
      hero: z.object({
        kicker: z.string().max(44),
        // name is the product noun (chips, meta); heading is the full H1 including
        // its own punctuation, and wash is the phrase inside it that takes the
        // caramel marker — same split as closing.
        name: z.string().max(12),
        heading: z.string().max(80),
        wash: z.string(),
        promise: z.string().max(140),
        status: z.enum(['Stable', 'In progress', 'Maintained', 'Archived']),
        version: z.string().optional(),
        ctaPrimary: z.object({ label: z.string().max(18), href: z.string() }),
        ctaSecondary: cta,
        media: z.object({ src: image(), alt: z.string() }).optional()
      }),
      glance: z.object({
        kicker: z.string().max(44),
        items: z.array(z.object({ value: z.string().max(12), label: z.string().max(60) }))
          .min(3).max(5)
      }).optional(),
      why: z.object({
        kicker: z.string().max(44),
        heading: z.string().max(50),
        paragraphs: z.array(z.string()).min(2).max(3)
      }).optional(),
      prayer: z.object({
        kicker: z.string().max(44),
        heading: z.string(),
        standfirst: z.string(),
        // Label above the config block, e.g. "Four values in .zshrc".
        configLabel: z.string().max(40).optional(),
        config: z.array(z.object({ prompt: z.boolean().default(false), text: z.string() })),
        methods: labelled,
        asr: labelled,
        media: z.object({ src: image(), alt: z.string() }).optional(),
        highLatitudes: labelled,
        privacy: labelled
      }).optional(),
      // The one band the approved design runs without a kicker, so kicker is optional here.
      config: z.object({
        kicker: z.string().max(44).optional(),
        heading: z.string(),
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
        kicker: z.string().max(44),
        heading: z.string(),
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({
          title: z.string().max(26),
          lines: z.array(z.object({ prompt: z.boolean().default(false), text: z.string() })),
          note: z.string().max(110).optional()
        })).min(2).max(4)
      }).optional(),
      // items is optional so the band's copy can land before the captures do.
      gallery: z.object({
        kicker: z.string().max(44),
        heading: z.string(),
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({ src: image(), caption: z.string().max(70) }))
          .min(2).max(4).optional()
      }).optional(),
      specs: z.object({
        kicker: z.string().max(44),
        heading: z.string(),
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({ label: z.string(), value: z.string().max(90) }))
          .min(4).max(7)
      }).optional(),
      colour: z.object({
        kicker: z.string().max(44),
        heading: z.string(),
        cards: z.array(z.object({ title: z.string(), body: z.string() })).min(3).max(4)
      }).optional(),
      verification: z.object({
        kicker: z.string().max(44),
        heading: z.string(),
        rows: z.array(z.object({ label: z.string(), value: z.string() })).min(3).max(5)
      }).optional(),
      faq: z.object({
        kicker: z.string().max(44),
        heading: z.string(),
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({ q: z.string().max(70), a: z.string() })).min(3).max(6)
      }).optional(),
      closing: z.object({
        heading: z.string().max(36),
        wash: z.string(),
        sub: z.string().max(90),
        ctaPrimary: z.object({ label: z.string().max(18), href: z.string() }),
        ctaSecondary: cta,
        facts: z.array(z.string().max(14)).max(4).optional()
      }),
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