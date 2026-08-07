import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Not available with legacy API
import { PROJECT_PAGES_BASE, PROJECT_PAGES_PATTERN } from './utils/projectPagesSource';
import { WASH_BUDGET_PX, washFits, washWidthAtFloor } from './utils/washFit';

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
    // The project's own showcase page in the projectPages collection, when it
    // has one. A separate field rather than a repointed demoLink: every entry
    // in this collection points demoLink at a repository and the card labels it
    // "View repository", so overloading it would make one card's label a lie and
    // leave the repository with nowhere to be linked from. See projectLead() in
    // src/utils/projects.ts for what the card does with the pair.
    projectPageLink: z.string().optional(),
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
// Where the line falls, so it stops being argued case by case:
//
//   Per-project CONTENT lives in the data. Anything a second project would want
//   to word differently — a band kicker, a gallery's placeholder label, the
//   prefix on a version badge — is authored here, and is required rather than
//   defaulted, because a default has to be written down somewhere and the only
//   place left is the template.
//
//   Universal UI AFFORDANCES live in the component. A copy control's "Copy", a
//   disclosure's "Read the answer ↓", the header's "Light"/"Dark" read
//   identically on every project page; they are the same affordance whatever
//   the project is, and they would be translated once, site-wide. Those belong
//   beside the behaviour they name, not in every entry.
//
// The test is not "is it English?" — it is "would project #2 write it
// differently?". If yes, it is a field. If no, it is the component's.
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
    // to a full paragraph, and the cap exists to protect the layout, not the copy.
    const labelled = (valueMax: number) =>
      z.object({ label: z.string().max(40), value: z.string().max(valueMax) });
    const kicker = z.string().max(44);
    // A capture and what it says. `variants` are further renders of that same
    // capture at smaller sizes, and exist for one situation: an animated capture
    // never reaches the image service — one frame is what would come back — so the
    // only responsive candidates it can offer are files somebody rendered.
    //
    // Which means they are read for an animated format and ignored for every other,
    // and the deciding is MediaFrame's because MediaFrame is where the format is
    // known. Not enforced here, and not for want of trying: inside a content-layer
    // schema `image()` has not resolved yet — the value being validated is still
    // the path, so this file cannot ask what format it turned out to be.
    const media = z.object({ src: image(), alt: z.string(), variants: z.array(image()).optional() });
    // Band headings are display type set at one size; past ~60 characters the
    // line count changes and the band's rhythm breaks. hero, why and closing
    // carry their own tighter caps because their headings are shaped differently.
    const bandHeading = z.string().max(60);
    // The phrase inside a heading that takes the caramel marker.
    //
    // Bounded at both ends. It must be a non-blank phrase: .marker-wash carries
    // padding, so a blank wash renders an empty span that injects 20px of stray
    // space before the heading. A bare .min(1) would still let " " through, and
    // "".includes() defeats the cross-field substring check in getProjectPages().
    //
    // And it must fit the narrowest viewport. The wash is the one string on the
    // page that cannot wrap, so its width is not something layout can absorb —
    // see src/utils/washFit.ts, which carries the metrics and the reasoning. The
    // bound is on rendered width rather than on character count because case
    // dominates length: "knows the hours" (15) fits and "ZERO OVERHEAD" (13)
    // overflows by 30px. This is the check that makes "project #2 costs one
    // markdown file" true of a washed heading.
    const wash = z.string()
      .refine((value) => value.trim().length > 0, {
        message: 'wash must contain a non-blank phrase; a blank wash renders an empty, padded marker span'
      })
      .refine(washFits, (value) => ({
        message:
          `wash "${value}" renders ${washWidthAtFloor(value)}px wide at the 30px clamp floor, ` +
          `over the ${WASH_BUDGET_PX}px a 320px screen leaves it. A washed phrase cannot wrap, ` +
          `so this runs off the screen rather than reflowing. Shorten it, or move some of the ` +
          `words out of the wash and into the unwashed part of the heading.`
      }));
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
        message: 'slug must be kebab-case, lower-case only: it becomes the URL segment'
      }),
      // A bare hostname. src/pages/[project].astro interpolates it into
      // `https://<subdomain>/` for the page's canonical, og:url and twitter:url —
      // which is why a scheme, port, path or trailing slash is rejected here:
      // any of them would produce a malformed URL rather than a wrong one.
      // The same value is what keeps the page out of the main sitemap.
      subdomain: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/, {
        message: 'subdomain must be a bare lower-case hostname — no scheme, port, path or trailing slash'
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
        // What the version badge reads, verbatim — including the leading ‘v’ if
        // the project wants one. Not a bare number with a ‘v’ added by the
        // template: a project that versions as 2024.11 or beta-3 would get
        // "v2024.11" with no way to opt out, and the prefix is exactly the kind
        // of per-project wording the rule above puts in the data.
        version: z.string().max(20).optional(),
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
        // The block and its label are one optional object, not two independent
        // optionals. The label is what tells this block's copy control apart
        // from the ones the steps band renders — several controls on a page all
        // named "Copy this code block" are indistinguishable in a screen
        // reader's list of controls, which is the defect the label exists to
        // fix. Nested, a block without a label cannot be written down; as two
        // sibling optionals it merely had not been written down yet.
        code: z.object({
          // e.g. "Four values in .zshrc" — drawn above the block, and the
          // subject of its copy control's accessible name.
          label: z.string().max(40),
          lines: z.array(codeLine)
        }).optional(),
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
        // What the placeholder of a not-yet-captured item reads. English chrome
        // in a template is the thing this collection exists to prevent, and a
        // placeholder label is chrome — so it is authored per band. Required
        // rather than optional: a default would have to live in the template,
        // which is where it must not be.
        pendingLabel: z.string().max(30),
        items: z.array(z.object({
          src: image().optional(),
          caption: z.string().max(70),
          // What the capture shows, for a reader who cannot see it.
          //
          // Separate from the caption because the two do different jobs, and the
          // difference only showed once there were captures. A caption
          // names which of the three this is — "the warm preset, light,
          // editorial" — and is written to be read beside the image. It says
          // nothing about the prompt in it, and the prompt is what the band is
          // about: three captions alone leave a screen-reader user told that
          // there are three presets and never shown one.
          //
          // Optional in the type and required in practice: an item may ship its
          // caption before its capture exists, and the refinement below is what
          // stops one arriving without the other. Uncapped, like the alt on
          // `media` — a description that has to carry a whole terminal line is
          // not the place to enforce brevity.
          alt: z.string().optional(),
          // The capture's intended pixel box. Not decoration: with no src the
          // frame reserves exactly this ratio, so the finished asset drops into
          // a box already the right shape and the page does not jump. Declared
          // per item because a gallery may mix a wide hero strip with narrow
          // ones. Once src is set the file's own dimensions take over and these
          // are ignored — they stay as the record of what was commissioned.
          width: z.number().int().positive(),
          height: z.number().int().positive()
          // An item with a capture carries a description of it. Written as a
          // refinement rather than by making alt required, because the staging
          // step this band was built around — captions first, captures later —
          // is the case where there is nothing yet to describe.
        }).refine((item) => !item.src || Boolean(item.alt?.trim()), {
          message: 'a gallery item with a src needs an alt: the caption names the capture, it does not describe it',
          path: ['alt']
        })).min(2).max(4)
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