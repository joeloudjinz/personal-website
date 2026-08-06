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
const projectPages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projectpages" }),
  schema: ({ image }) => z.object({
    slug: z.string(),
    subdomain: z.string(),
    projectName: z.string().max(12),
    hero: z.object({
      kicker: z.string().max(44),
      name: z.string().max(12),
      hook: z.string().optional(),
      promise: z.string().max(140),
      status: z.enum(['Stable', 'In progress', 'Maintained', 'Archived']),
      version: z.string().optional(),
      ctaPrimary: z.object({ label: z.string().max(18), href: z.string() }),
      ctaSecondary: z.object({ label: z.string().max(22), href: z.string() }),
      media: z.object({ src: image(), alt: z.string() }).optional()
    }),
    glance: z.array(z.object({ value: z.string().max(12), label: z.string().max(60) }))
      .min(3).max(5).optional(),
    why: z.object({
      heading: z.string().max(50),
      paragraphs: z.array(z.string()).min(2).max(3)
    }).optional(),
    steps: z.array(z.object({
      title: z.string().max(26),
      lines: z.array(z.object({ prompt: z.boolean().default(false), text: z.string() })),
      note: z.string().max(110).optional()
    })).min(2).max(4).optional(),
    gallery: z.array(z.object({ src: image(), caption: z.string().max(70) }))
      .min(2).max(4).optional(),
    specs: z.array(z.object({ label: z.string(), value: z.string().max(90) }))
      .min(4).max(7).optional(),
    prayer: z.object({
      heading: z.string(),
      standfirst: z.string(),
      config: z.array(z.object({ prompt: z.boolean().default(false), text: z.string() })),
      methods: z.string(),
      asr: z.string(),
      media: z.object({ src: image(), alt: z.string() }).optional(),
      highLatitudes: z.string(),
      privacy: z.string()
    }).optional(),
    config: z.object({
      heading: z.string(),
      intro: z.string(),
      knobs: z.array(z.object({
        name: z.string(),
        values: z.array(z.string()),
        fallback: z.string(),
        effect: z.string()
      })).min(1),
      note: z.string(),
      link: z.object({ label: z.string(), href: z.string() }).optional()
    }).optional(),
    colour: z.object({
      heading: z.string(),
      cards: z.array(z.object({ title: z.string(), body: z.string() })).min(3).max(4)
    }).optional(),
    verification: z.object({
      heading: z.string(),
      rows: z.array(z.object({ label: z.string(), value: z.string() })).min(3).max(5)
    }).optional(),
    faq: z.array(z.object({ q: z.string().max(70), a: z.string() })).min(3).max(6).optional(),
    closing: z.object({
      heading: z.string().max(36),
      wash: z.string(),
      sub: z.string().max(90),
      facts: z.array(z.string().max(14)).max(4).optional()
    }),
    credit: z.string().optional()
  })
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