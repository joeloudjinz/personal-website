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
// Nested string fields render as PLAIN TEXT, not markdown, with exactly one mark
// read out of them: a run between backticks is drawn as code. `INZSH_PRESET`,
// `inzsh locate`, `--uninstall`. That is src/components/CodeSpans.astro, and the
// marks pair off left to right, so a lone backtick prints as itself rather than
// eating the rest of the sentence. Nothing else is interpreted: an asterisk is
// an asterisk and a bracket is a bracket, because the fields here are copy with
// character caps on them, not documents.
//
// The mark is read in every field that is READING COPY — the row values, the
// answers and questions, the notes, the intros, the paragraphs, the standfirsts,
// the captions, the effect cells. It is NOT read in the registers where a
// monospace run would be wrong whatever it said: display type, small caps, a
// pill, or the text of a control. A backtick authored in one of those prints as
// a backtick, which is the page telling the author the field is the wrong one.
// The full list, and the reasoning, is at the top of src/components/projectpage/BandPage.astro.
//
// This used to be ‘single curly quotes’, which is what an author reaches for
// when the design system has no treatment to reach for; there is one now.
//
// One convention on top of the mark: a file name in a sentence stays unmarked.
// It is a thing being named rather than a thing being typed, and one field
// settles the case anyway — deepDive.code.label is both the on-screen label and
// the accessible name of that block's copy control, so a mark in it would be
// spoken aloud rather than drawn.
// One line of a rendered code block. Exported as a type so the component that
// draws it — src/components/CodeBlock.astro — derives its prop signature from
// this schema instead of restating it, and a change here reaches it as a type
// error rather than as a silent mis-render.
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
    // What this band is called in the page's section nav, when it belongs there.
    //
    // Its absence is the switch: a band without one is simply not in the nav, so
    // which sections a project offers is authored per project rather than listed
    // in the template. The nav is content in that sense — the second project
    // navigates to its own bands under its own names — while the control that
    // scrolls back to the top of the page is an affordance and lives in the
    // component, which is the same line drawn in the header of this file.
    //
    // A nav item and not a heading: "Segments", where the band above it is headed
    // "What the prompt draws, and in what order". The cap is what says so.
    //
    // Fit is a separate question from length and is checked separately. Width
    // follows case rather than character count, and the row shares one bar with
    // the logo, the project name, the back link, the social marks and the theme
    // toggle — so getProjectPages() adds the row up in pixels against what that
    // bar holds. See src/utils/navFit.ts.
    const navLabel = z.string().max(14).optional();
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
    // A reference table, declared column by column. Two bands are shaped this
    // way — the engine knobs and the segment reference — and the component that
    // draws them, src/components/DataTable.astro, knows nothing about either:
    // it draws the columns it is handed, however many that is.
    //
    // Which is the fix for the one thing on this page that a second project
    // could not have written in markdown alone. The table used to be four
    // columns keyed name/values/fallback/effect with its widths tuned to those
    // four, so the next band that wanted three had to edit a component.
    //
    // `label` is copy, and `kind` and `tone` are the two things about a column
    // that the copy cannot imply: whether its cells are typed tokens or a
    // sentence, and which ink it is set in — the row's subject, a value, or the
    // muted register. They vary separately, which is why they are two fields:
    // a knob's name and its default are both tokens and are drawn differently.
    // `width` is pixels at the wide layout, where the columns exist; the
    // columns that omit it share what is left.
    const tableColumn = z.object({
      label: z.string().max(24),
      kind: z.enum(['tokens', 'sentence']),
      tone: z.enum(['strong', 'body', 'muted']),
      width: z.number().int().positive().optional()
    });
    // One token, or a run of them. A run is not a convenience: a column of
    // accepted values is a list even when it has one member, and it is drawn as
    // one — middle-dot separated, wrapping as a run.
    const tableCell = z.union([z.string(), z.array(z.string()).min(1)]);
    const dataTable = z.object({
      // Five is where the widths stop dividing into anything a phone can also
      // stack; two is the fewest that is a table rather than a list, and a list
      // of pairs is DefinitionRows.
      columns: z.array(tableColumn).min(2).max(5),
      // Cells in column order. Wrapped in an object rather than left as a bare
      // array so a row can grow a field later without every entry being rewritten.
      rows: z.array(z.object({ cells: z.array(tableCell) })).min(1)
    }).superRefine((table, ctx) => {
      // Positional cells need the count checked somewhere, and the alternative —
      // keying every cell by its column name — moves the same mistake from a
      // miscount to a typo, which is the quieter of the two.
      table.rows.forEach((row, index) => {
        if (row.cells.length !== table.columns.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rows', index, 'cells'],
            message:
              `row ${index} has ${row.cells.length} cell(s) for ${table.columns.length} column(s). ` +
              `Cells are positional: one per column, in the order the columns are declared.`
          });
        }
        row.cells.forEach((cell, column) => {
          if (table.columns[column]?.kind === 'sentence' && Array.isArray(cell)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['rows', index, 'cells', column],
              message:
                `row ${index}, column "${table.columns[column].label}" is a sentence column, ` +
                `so its cell is one string. A list belongs in a "tokens" column, where the ` +
                `middle dots between its members are drawn.`
            });
          }
        });
      });
    });
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
    // dominates length: "knows the hour" (14) is 240px and fits, and "ZERO
    // OVERHEAD" — one character shorter — is 291px and overflows the 250px
    // budget by 41px. This is the check that makes "project #2 costs one
    // markdown file" true of a washed heading.
    //
    // Those numbers come from washFit.ts's own table; recompute them there
    // rather than editing them here. This sentence used to offer "knows the
    // hours" (15) as the example that fits — it is 255px and fails.
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

    // Identity and head-only fields shared by every page template. Hoisted so a
    // second template cannot drift from the first on how a page names itself.
    const identity = {
      // Deliberately an explicit field rather than the glob loader's derived id,
      // which is how blog posts work. A Zod regex can validate a schema field and
      // cannot validate a filename — and the regex is what stops a slug like
      // "About" from overwriting dist/about/index.html on a case-insensitive
      // filesystem. The divergence from the blog idiom buys that check.
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'slug must be kebab-case, lower-case only: it becomes the URL segment'
      }),
      // A bare hostname. src/components/projectpage/BandPage.astro interpolates it into
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
      // Head-only text. Nothing here renders on the page.
      //
      // The split exists because the H1 and the <title> want opposite things. The
      // H1 is written to be read — "InZsh: a prompt that knows the hour." — and
      // names none of the words anyone types into a search box. The <title> has to
      // carry those words, and is also what a share card shows, which matters more
      // than usual here: project pages fall back to the site's avatar for og:image,
      // so the text is doing all the work of saying what the thing is.
      seo: z.object({
        // ~60 chars is where Google starts truncating; the cap allows a little
        // over so a good title is not blocked by a rule of thumb.
        title: z.string().max(70),
        // Optional because hero.promise is usually the right description already.
        // Set it when the promise is written for rhythm rather than for search.
        description: z.string().max(160).optional(),
        // Replaces the site-wide keyword list, which is a personal-brand one:
        // on a project page it advertises Ruby, PHP and Java, none of which the
        // project has anything to do with. Google has ignored this meta since
        // 2009, so the value here is not ranking — it is not shipping a claim
        // that contradicts the page.
        keywords: z.array(z.string().max(40)).min(1).max(15).optional(),
        // Describes the og:image, which for a project page is the site avatar
        // rather than anything project-specific. Defaulting it to the page title
        // captions a photograph of a person with the name of a shell theme.
        imageAlt: z.string().max(140).optional()
      })
    };

    const bandPage = z.object({
      // Which template renders this entry. Band entries may omit it — inzsh
      // predates the field — so it is optional here and literal in pinboardPage.
      template: z.literal('band').optional(),
      ...identity,
      // Feeds SoftwareApplication JSON-LD in place of the generic WebSite node.
      //
      // Worth being straight about the payoff: this is unlikely to produce a
      // visual rich result, because Google leans on aggregateRating for those and
      // inventing ratings is not on the table. What it does is let a crawler know
      // the page is a piece of software with a version, a licence and a
      // repository, rather than an unspecified web page.
      software: z.object({
        // schema.org values: DeveloperApplication, UtilitiesApplication, etc.
        applicationCategory: z.string().max(40),
        operatingSystem: z.string().max(80),
        // SPDX identifier or a URL. Must match what the repository actually ships.
        license: z.string().max(60),
        repository: z.string().url()
      }).optional(),
      hero: z.object({
        kicker,
        // The full H1, including its own trailing punctuation.
        heading: z.string().max(80),
        wash,
        promise: z.string().max(140),
        // What the status badge reads, verbatim. A bounded string, not an
        // enum — and the argument is the one made twelve lines below for
        // `version`, applied to the field it was skipped on.
        //
        // It was z.enum(['Stable', 'In progress', 'Maintained', 'Archived']),
        // which made "Beta", "Alpha", "Release candidate" and "Deprecated"
        // schema edits. That is the one visitor-facing string on the page that
        // project #2 could not reword, in a collection whose stated purpose is
        // that project #2 costs one markdown file. The test in the header —
        // "would project #2 write it differently?" — has an obvious answer for
        // a release-stage label, and four English words in a template is
        // exactly the shape this file exists to keep out.
        //
        // Capped where `version` is, because they are drawn as a pair of pills
        // in one wrapping row and neither should be the one that blows it up.
        // 20 characters is 'Release candidate' with room to spare, and about
        // 208px set in the badge's 11px uppercase — inside the 272px a 320px
        // screen leaves. Non-blank for the reason `wash` is: an empty badge is
        // a padded pill with nothing in it, and .min(1) alone admits " ".
        status: z.string().max(20).refine((value) => value.trim().length > 0, {
          message: 'status must contain a non-blank label; a blank one renders an empty, padded badge'
        }),
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
        navLabel,
        kicker,
        items: z.array(z.object({ value: z.string().max(12), label: z.string().max(60) }))
          .min(3).max(5)
      }).optional(),
      why: z.object({
        navLabel,
        kicker,
        heading: z.string().max(50),
        paragraphs: z.array(z.string()).min(2).max(3)
      }).optional(),
      // What the thing is made of, enumerated: an intro stating the rule its
      // parts obey, and a row per part. The band that has to come before any
      // band taking one part apart, because a reader shown the part first has
      // nothing to hang it on.
      //
      // Named for the role rather than for InZsh's segments, like deepDive
      // below it. The next project fills it with its own parts, in as many
      // columns as those parts need, and neither has to touch this file.
      anatomy: z.object({
        navLabel,
        kicker,
        heading: bandHeading,
        intro: z.string(),
        table: dataTable
      }).optional(),
      // The long-form band for a project's signature feature: a standfirst, an
      // optional code block, and however many labelled paragraphs that feature
      // needs. Named for the role, not the subject — InZsh fills it with prayer
      // times, the next project fills it with something else, and neither has to
      // touch this file. Row order is the author's, not a side effect of where
      // the fields happen to sit in the schema.
      deepDive: z.object({
        navLabel,
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
          // At least one. `code` as a whole is optional, so a project with
          // nothing to show omits it; declaring the block and leaving it empty
          // is the case this rejects. An empty block is not blank — it renders
          // a bare navy bar and, since the pane is a keyboard tab stop, a stop
          // that announces "Code: <label>, group" over nothing at all.
          lines: z.array(codeLine).min(1)
        }).optional(),
        media: media.optional(),
        // Eight rather than six. Six was the number the band happened to hold
        // the day it was written, and it was full — so the first edit that split
        // one row in two, naming the calculation authorities and moving their
        // aliases out from under them, was a copy change that failed the build.
        // A cap the copy reaches on its first rewording is not protecting the
        // layout; these rows stack, and the eighth costs what the seventh does.
        // Eight leaves the headroom the split just used up, and stops short of
        // the dozen that would make this a reference list drawn as a band.
        rows: z.array(labelled(400)).min(2).max(8),
        // Sources, not further reading. A band that states how something is
        // calculated should say where the definitions came from, and these are
        // the only strings on the page a reader can go and check for themselves.
        // Plural because no one document covers it: the prayer definitions, the
        // solar arithmetic and the authorities' parameters are three separate
        // references. Rendered as arrow links, so linkAttrs decides the tab.
        links: z.array(link).max(4).optional()
      }).optional(),
      // The one band the approved design runs without a kicker, so kicker is optional here.
      config: z.object({
        navLabel,
        kicker: kicker.optional(),
        heading: bandHeading,
        intro: z.string(),
        table: dataTable,
        note: z.string(),
        link: link.optional()
      }).optional(),
      steps: z.object({
        navLabel,
        kicker,
        heading: bandHeading,
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(z.object({
          title: z.string().max(26),
          // Optional, and at least one line when it is there.
          //
          // Optional because "three steps in" is not a CLI-only shape: a step
          // reading "Download the app" or "Open your first book" has nothing to
          // type, and a required array made that project write `lines: []` —
          // which passed the schema, passed every guard, built clean, and drew
          // an empty navy bar per step with an empty keyboard tab stop in it,
          // announcing "Code: Download the app, group" over nothing.
          //
          // A step with no lines is now a title and its note, which is what
          // such a step is. CodeBlock refuses an empty array as well, so no
          // call site can reintroduce the bar by another route.
          lines: z.array(codeLine).min(1).optional(),
          note: z.string().max(110).optional()
        })).min(2).max(4)
      }).optional(),
      // A caption is copy and ships before its capture exists, so src is optional
      // within an item. items itself is not optional: a gallery band with a
      // heading and nothing under it is a mistake, not a staging step.
      gallery: z.object({
        navLabel,
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
        navLabel,
        kicker,
        heading: bandHeading,
        intro: z.string().optional(),
        link: link.optional(),
        items: z.array(labelled(90)).min(4).max(7)
      }).optional(),
      // Three or four short claims, each a title and a sentence. InZsh uses it for
      // colour accessibility; the role is "the things we promise", not "colour".
      pillars: z.object({
        navLabel,
        kicker,
        heading: bandHeading,
        cards: z.array(z.object({ title: z.string(), body: z.string() })).min(3).max(4)
      }).optional(),
      verification: z.object({
        navLabel,
        kicker,
        heading: bandHeading,
        // Six rather than five, for the reason the deep dive's rows went from
        // six to eight. Five was the number this band happened to hold the day
        // it was written, and it was full — so the first row added after it, the
        // one saying what the render path costs, was a copy change that failed
        // the build. These rows stack, and the sixth costs what the fifth did.
        rows: z.array(labelled(200)).min(3).max(6)
      }).optional(),
      faq: z.object({
        navLabel,
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

    // The pinboard template: a masonry board of pins with a story rail, per the
    // feature spec in the vault KB (design-system-showcase-page). Copy strings
    // only — layout lives in PinboardPage.astro.
    // Rail filter ids, held to the same shape rules as `slug` two screens above.
    const stopId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(24);
    // A per-pin "Tell me more" unfold. `lang` is the language the body is
    // written in, and the component derives both dir and lang from it: a
    // direction cannot imply a language, so the language is the thing authored.
    const more = z.object({
      label: z.string().max(24),
      // A short paragraph — the unfold's budget, shared with the closing contract.
      body: z.string().max(420),
      lang: z.enum(['en', 'ar']).default('en')
    });
    const pinBase = {
      stop: stopId,
      label: z.string().max(28),
      more: more.optional()
    };
    const pin = z.discriminatedUnion('kind', [
      // alt but no src: the artwork is the site's own /avatar.png, deliberately
      // not an entry asset — so the entry authors the description and the
      // component owns the file. Uncapped, like every other alt here.
      z.object({ kind: z.literal('origin'), ...pinBase, alt: z.string(), note: z.string().max(160) }),
      z.object({
        kind: z.literal('swatches'), ...pinBase,
        colors: z.array(z.object({
          // The design system's published palette values, displayed as content.
          // Deliberately not read from the site's live CSS tokens.
          hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          name: z.string().max(16),
          ink: z.enum(['dark', 'light'])
        })).min(2).max(8),
        note: z.string().max(160)
      }),
      // value is a numeral or a short token: "7", "1.25", "AA". Four characters
      // is what the 76px display type holds inside a pin at the narrow column,
      // measured rather than guessed: "1.25" reaches the column edge and a
      // fifth character runs past it. The cap is the type's, not the copy's.
      z.object({ kind: z.literal('stat'), ...pinBase, value: z.string().max(4), caption: z.string().max(160) }),
      z.object({ kind: z.literal('quote'), ...pinBase, text: z.string().max(140) }),
      // Named for the role, not the script: a real name typeset in its own.
      z.object({ kind: z.literal('nameplate'), ...pinBase, name: z.string(), body: z.string().max(220) }),
      z.object({ kind: z.literal('faces'), ...pinBase, note: z.string().max(180) }),
      z.object({ kind: z.literal('terminal'), ...pinBase, lines: z.array(codeLine).min(1).max(6) }),
      z.object({
        kind: z.literal('states'), ...pinBase,
        items: z.array(z.object({
          // One glyph. Zod counts UTF-16 code units, so a ZWJ or skin-tone emoji
          // would blow this cap; ours are single-unit text glyphs — ✓ i ✕ !
          glyph: z.string().max(2),
          name: z.string().max(12),
          tone: z.enum(['positive', 'info', 'negative', 'caution'])
        })).min(2).max(6),
        note: z.string().max(160)
      }),
      z.object({
        kind: z.literal('audit'), ...pinBase,
        rows: z.array(z.object({ check: z.string().max(28), result: z.string().max(12) })).min(2).max(8)
      })
    ]);

    const pinboardPage = z.object({
      template: z.literal('pinboard'),
      ...identity,
      masthead: z.object({
        kicker,
        // One line beside the light switch, so tighter than the band hero's 80.
        heading: z.string().max(60),
        // Same wash validator as the band hero: the pinboard masthead clamps to
        // the same 30px floor, so washFits applies unchanged.
        wash,
        facts: z.array(z.string().max(24)).min(1).max(4),
        // toDark/toLight, never off/on: YAML parses unquoted `off:`/`on:` keys
        // as booleans, which would silently break the frontmatter.
        lightSwitch: z.object({ toDark: z.string().max(24), toLight: z.string().max(24) })
      }).refine(washIsInHeading, washIsInHeadingError),
      mirror: z.object({
        // A script name — "عربي" — not a sentence: the flip is labelled by the
        // script it flips to.
        flipLabel: z.string().max(8),
        en: z.object({ kicker, heading: z.string().max(80), body: z.string().max(220) }),
        ar: z.object({ kicker, heading: z.string().max(80), body: z.string().max(220) })
      }),
      railCaption: z.string().max(32),
      // The sentence under the caption that says how the rail behaves. Required
      // rather than optional, and entry-owned like every other string a visitor
      // reads: a rail that never explains itself is the worse page, and the
      // second project's rail will not behave in this one's words.
      railNote: z.string().max(120),
      allLabel: z.string().max(16),
      // Two is the fewest that is a filter; six is what the rail row holds.
      stops: z.array(z.object({ id: stopId, label: z.string().max(24) })).min(2).max(6),
      // Under four pins the board is not a board; over twelve it stops being curated.
      pins: z.array(pin).min(4).max(12),
      closing: z.object({
        heading: z.string().max(60),
        wash,
        // A short paragraph, like the unfold bodies.
        sub: z.string().max(220),
        contract: z.object({
          label: z.string().max(24),
          // The unfold's budget again: each side of the contract is one paragraph.
          may: z.string().max(420),
          never: z.string().max(420)
        }),
        proofsLabel: z.string().max(24),
        proofsStop: stopId
      }).refine(washIsInHeading, washIsInHeadingError)
    });

    // Discriminated rather than a plain union, so an error reports against the
    // template the entry declared: a band entry missing its closing band reads
    // "closing: Required" instead of the bare "Invalid input" a plain union
    // gives when neither branch matches. `template` is optional on bandPage —
    // inzsh predates the field — and Zod routes a template-less entry there.
    //
    // The pinboard's cross-field checks hang off the union rather than off
    // pinboardPage because discriminatedUnion refuses a ZodEffects option, so
    // the refinement sits outside it and screens out band entries itself.
    return z.discriminatedUnion('template', [pinboardPage, bandPage])
      .superRefine((page, ctx) => {
        if (page.template !== 'pinboard') return;
        // The rail is a filter over the pins, so the two have to agree in both
        // directions: a pin pointing at no stop is unreachable, and a stop no
        // pin points at is a rail filter that matches nothing.
        const declared = new Set<string>();
        page.stops.forEach((stop, index) => {
          if (declared.has(stop.id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom, path: ['stops', index, 'id'],
              message:
                `stop id "${stop.id}" is declared twice. Ids are what pins point at, ` +
                `so the second stop can never be told from the first.`
            });
          }
          declared.add(stop.id);
        });
        page.pins.forEach((entry, index) => {
          if (!declared.has(entry.stop)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom, path: ['pins', index, 'stop'],
              message: `pin stop "${entry.stop}" is not one of the declared stops: ${[...declared].join(', ')}`
            });
          }
        });
        const pointedAt = new Set(page.pins.map((entry) => entry.stop));
        page.stops.forEach((stop, index) => {
          if (!pointedAt.has(stop.id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom, path: ['stops', index, 'id'],
              message:
                `no pin points at stop "${stop.id}", so selecting it in the rail empties ` +
                `the board. Give a pin that stop, or drop the stop.`
            });
          }
        });
        if (!declared.has(page.closing.proofsStop)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom, path: ['closing', 'proofsStop'],
            message: `proofsStop "${page.closing.proofsStop}" is not a declared stop`
          });
        }
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