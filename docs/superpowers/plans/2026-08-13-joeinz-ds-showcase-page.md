# Joe Inz DS Showcase Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A self-contained masonry-pinboard showcase page for the Joe Inz Design System at `/joeinz-ds/` (future host `joeinz-ds.abdellahaddoun.com`), plus a featured project card, without touching the existing inzsh band page.

**Architecture:** The page stays a `projectPages` collection entry so all three build guards (sitemap exclusion, foreign-canonical check, firebase-redirect check) remain automatic. The collection schema becomes a union: the existing band shape (inzsh, untouched) plus a new pinboard shape discriminated by `template: "pinboard"`. `[project].astro` becomes a thin dispatcher over two components: the extracted `BandPage` (pure move of today's template) and the new `PinboardPage`. The page rides the site's existing tokens/reveal/theme mechanisms and loads its own fonts; it never imports the DS `foundation.css` (token-name collisions with `global.css` are proven).

**Tech Stack:** Astro 5 content collections + Zod, Tailwind utility classes over semantic CSS custom properties, vanilla inline scripts bound via `astro:page-load`, Google Fonts (Literata, Readex Pro, Harmattan, JetBrains Mono).

**Spec:** Obsidian vault, `personal-website-2/design-system-showcase-page/design-system-showcase-page-spec.md`. Decisions D1–D8 in the sibling decisions note. Approved mock: KB `assets/design-system-showcase-page-v3-revision.html`.

**Validation:** No test framework exists in this repo. `npm run check:build` (astro check + build) is the gate for every task, plus targeted greps of `dist/`. Build guards fail loudly on redirect/canonical/sitemap mistakes — treat them as the test suite.

**Copy rules (bind every user-visible string):** no AI jargon, human and slightly professional, NO em-dashes, NO semicolons. Kicker middle dots (·) are fine. Arabic: MSA, Western digits, never letter-spaced, `dir="rtl" lang="ar"` on every Arabic element, the name is عبد اللّه عدّون with both shaddas.

---

### Task 1: Extract BandPage from [project].astro (pure move)

**Files:**
- Create: `src/components/projectpage/BandPage.astro`
- Modify: `src/pages/[project].astro` (shrinks to a dispatcher)

- [ ] **Step 1: Record the pre-move fingerprint of the inzsh page**

```bash
npm run build && shasum dist/inzsh/index.html | tee /tmp/inzsh-before.sha
```
Expected: build succeeds, one SHA line saved.

- [ ] **Step 2: Create `src/components/projectpage/BandPage.astro`**

Copy the ENTIRE current `src/pages/[project].astro` into it, then make exactly these changes and no others:
1. Delete the `export async function getStaticPaths() { ... }` block (currently lines 50–55).
2. Keep the existing `interface Props { page: ProjectPageEntry; }` and `const {page} = Astro.props;` — they move over unchanged.
3. In the `@src/utils/projectPages` import, drop `getProjectPages` (only the deleted
   getStaticPaths used it — leaving it would trip astro check as an unused import):

```astro
import {
    BAND_ANCHORS, pageSections, splitWash, type ProjectPageEntry
} from '@src/utils/projectPages';
```

Do not reformat, do not rewrite comments, do not rename anything. This is a mechanical move — the diff inside the file body must be empty.

- [ ] **Step 3: Rewrite `src/pages/[project].astro` as the dispatcher**

Replace the whole file with:

```astro
---
// Dispatcher for project showcase pages. The band template (inzsh) lives in
// BandPage; a second template joins in the pinboard work. getStaticPaths stays
// here because this file is the route.
import BandPage from '@src/components/projectpage/BandPage.astro';
import {getProjectPages, type ProjectPageEntry} from '@src/utils/projectPages';

export async function getStaticPaths() {
    // getProjectPages() fails the build if a slug collides with a blog post or a
    // top-level page — this route is the only thing that puts them in one namespace.
    const pages = await getProjectPages();
    return pages.map((page) => ({params: {project: page.data.slug}, props: {page}}));
}

interface Props {
    page: ProjectPageEntry;
}

const {page} = Astro.props;
---
<BandPage page={page}/>
```

- [ ] **Step 4: Verify the inzsh page is byte-identical**

```bash
npm run check:build && shasum dist/inzsh/index.html && cat /tmp/inzsh-before.sha
```
Expected: 0 errors, and the two SHA values match exactly. If they differ, diff `dist/inzsh/index.html` against a rebuild from `git stash`-free HEAD — the move was not pure.

- [ ] **Step 5: Commit**

```bash
git add src/components/projectpage/BandPage.astro "src/pages/[project].astro"
git commit -m "Extract the band template into BandPage ahead of a second page template"
```

---

### Task 2: Pinboard schema branch, union, and type guards

**Files:**
- Modify: `src/content.config.ts` (the `projectPages` collection, lines ~159–615)
- Modify: `src/utils/projectPages.ts`
- Modify: `src/components/projectpage/BandPage.astro` (Props type only)

- [ ] **Step 1: Hoist the identity fields shared by both branches**

In `src/content.config.ts`, inside `schema: ({ image }) => { ... }`, the returned `z.object({...})` starts with `slug`, `subdomain`, `projectName`, `seo` (currently at lines ~310–355). Cut those four field definitions (with their comments) into a hoisted const placed just above the `return`:

```ts
    // Identity and head-only fields shared by every page template. Hoisted so a
    // second template cannot drift from the first on how a page names itself.
    const identity = {
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'slug must be kebab-case, lower-case only: it becomes the URL segment'
      }),
      subdomain: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/, {
        message: 'subdomain must be a bare lower-case hostname — no scheme, port, path or trailing slash'
      }),
      projectName: z.string().max(12),
      seo: z.object({
        title: z.string().max(70),
        description: z.string().max(160).optional(),
        keywords: z.array(z.string().max(40)).min(1).max(15).optional(),
        imageAlt: z.string().max(140).optional()
      })
    };
```

(Keep the original long comments attached to each field when moving them — the code above shows the shape, the comments come along.) In the band object, replace the four moved fields with `...identity,`.

- [ ] **Step 2: Name the band schema instead of returning it inline**

Change `return z.object({` (the big band object) to `const bandPage = z.object({`, add a discriminator field as its FIRST line so the union type narrows:

```ts
    const bandPage = z.object({
      // Which template renders this entry. Band entries may omit it — inzsh
      // predates the field — so it is optional here and literal in pinboardPage.
      template: z.literal('band').optional(),
      ...identity,
      // ...everything else exactly as it is today...
```

The band object's closing `});` stays; the refinements chained onto it stay.

- [ ] **Step 3: Add the pinboard schema after `bandPage`**

```ts
    // The pinboard template: a masonry board of pins with a story rail, per the
    // feature spec in the vault KB (design-system-showcase-page). Copy strings
    // only — layout lives in PinboardPage.astro.
    const stopId = z.string().regex(/^[a-z0-9-]+$/);
    // A per-pin "Tell me more" unfold. dir marks the Arabic ones so the
    // component can set dir/lang without guessing from the text.
    const more = z.object({
      label: z.string().max(24),
      body: z.string().max(420),
      dir: z.enum(['ltr', 'rtl']).default('ltr')
    });
    const pinBase = {
      stop: stopId,
      label: z.string().max(28),
      more: more.optional()
    };
    const pin = z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('origin'), ...pinBase, alt: z.string().max(140), note: z.string().max(160) }),
      z.object({
        kind: z.literal('swatches'), ...pinBase,
        colors: z.array(z.object({
          hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          name: z.string().max(16),
          ink: z.enum(['dark', 'light'])
        })).min(2).max(8),
        note: z.string().max(160)
      }),
      z.object({ kind: z.literal('stat'), ...pinBase, value: z.string().max(6), caption: z.string().max(160) }),
      z.object({ kind: z.literal('quote'), ...pinBase, text: z.string().max(140) }),
      z.object({ kind: z.literal('arabic'), ...pinBase, name: z.string(), body: z.string().max(220) }),
      z.object({ kind: z.literal('typeProof'), ...pinBase, note: z.string().max(180) }),
      z.object({ kind: z.literal('terminal'), ...pinBase, lines: z.array(codeLine).min(1).max(6) }),
      z.object({
        kind: z.literal('states'), ...pinBase,
        items: z.array(z.object({
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
        flipLabel: z.string().max(8),
        en: z.object({ kicker, heading: z.string().max(80), body: z.string().max(220) }),
        ar: z.object({ kicker, heading: z.string().max(80), body: z.string().max(220) })
      }),
      railCaption: z.string().max(32),
      allLabel: z.string().max(16),
      stops: z.array(z.object({ id: stopId, label: z.string().max(24) })).min(2).max(6),
      pins: z.array(pin).min(4).max(12),
      closing: z.object({
        heading: z.string().max(60),
        wash,
        sub: z.string().max(220),
        contract: z.object({
          label: z.string().max(24),
          may: z.string().max(420),
          never: z.string().max(420)
        }),
        proofsLabel: z.string().max(24),
        proofsStop: stopId
      }).refine(washIsInHeading, washIsInHeadingError)
    }).superRefine((page, ctx) => {
      // Every pin (and the proofs button) must point at a declared stop, or the
      // rail filter silently matches nothing.
      const ids = new Set(page.stops.map((stop) => stop.id));
      page.pins.forEach((entry, index) => {
        if (!ids.has(entry.stop)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom, path: ['pins', index, 'stop'],
            message: `pin stop "${entry.stop}" is not one of the declared stops: ${[...ids].join(', ')}`
          });
        }
      });
      if (!ids.has(page.closing.proofsStop)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom, path: ['closing', 'proofsStop'],
          message: `proofsStop "${page.closing.proofsStop}" is not a declared stop`
        });
      }
    });

    // Order matters: pinboard first, because its template literal is required —
    // a band entry (no template field) falls through to bandPage.
    return z.union([pinboardPage, bandPage]);
```

`kicker`, `wash`, `washIsInHeading`, `washIsInHeadingError`, and `codeLine` already exist in this scope — reuse them, do not redeclare.

- [ ] **Step 4: Add type guards to `src/utils/projectPages.ts`**

Below the existing `export type ProjectPageEntry` line (line 5), add:

```ts
/** The two page templates, split off the schema union by the template literal. */
export type PinboardEntry = ProjectPageEntry & {
  data: Extract<ProjectPageEntry['data'], {template: 'pinboard'}>
};
export type BandEntry = ProjectPageEntry & {
  data: Exclude<ProjectPageEntry['data'], {template: 'pinboard'}>
};
export const isPinboard = (page: ProjectPageEntry): page is PinboardEntry =>
  page.data.template === 'pinboard';
```

- [ ] **Step 5: Narrow BandPage's Props**

In `src/components/projectpage/BandPage.astro`, change the import and Props:

```astro
import {
    BAND_ANCHORS, getProjectPages, pageSections, splitWash, type BandEntry
} from '@src/utils/projectPages';
```
(remove `getProjectPages` from that import if the extracted file no longer calls it — it does not, only the route did; also remove `ProjectPageEntry` if now unused)

```astro
interface Props {
    page: BandEntry;
}
```

And in `src/pages/[project].astro`, narrow before rendering:

```astro
import BandPage from '@src/components/projectpage/BandPage.astro';
import {getProjectPages, isPinboard, type ProjectPageEntry} from '@src/utils/projectPages';
```
```astro
{isPinboard(page)
    ? null /* PinboardPage lands in the next task; no pinboard entries exist yet */
    : <BandPage page={page}/>}
```

- [ ] **Step 6: Verify**

The union breaks two spots in `src/utils/projectPages.ts` that index band keys on `page.data` — patch both now rather than waiting for astro check:

1. `pageSections` (line ~107): band keys do not exist on the pinboard branch of the union, so read through a plain record. Replace the function body's first line:

```ts
export function pageSections(data: ProjectPageEntry['data']): PageSection[] {
  return BAND_ORDER.flatMap((band) => {
    const value = (data as Record<string, unknown>)[band] as {navLabel?: string} | undefined;
    return value?.navLabel
      ? [{href: `#${BAND_ANCHORS[band]}`, label: value.navLabel}]
      : [];
  });
}
```

2. In `getProjectPages`, the dead-anchor check (line ~198) indexes `page.data[band as BandKey]`. Change that one expression to:

```ts
        .filter(([band]) => (page.data as Record<string, unknown>)[band] != null)
```

(Both changes are type-level only: absent keys were already treated as absent bands at runtime. Pinboard entries then naturally produce no sections and no band anchors, and the nav-fit guard passes them through empty.)

```bash
npm run check:build
```
Expected: 0 errors, inzsh still builds.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/utils/projectPages.ts src/components/projectpage/BandPage.astro "src/pages/[project].astro"
git commit -m "Add a pinboard template branch to the projectPages schema"
```

---

### Task 3: Entry file, redirect, and the PinboardPage skeleton

These three land together because the guards couple them: an entry without a firebase redirect fails the build, and an entry without a rendering branch would crash the route.

**Files:**
- Create: `src/content/projectpages/joeinz-ds.md`
- Create: `src/components/projectpage/PinboardPage.astro`
- Modify: `src/pages/[project].astro` (swap `null` for the component)
- Modify: `firebase.json`

- [ ] **Step 1: Write the content entry**

Create `src/content/projectpages/joeinz-ds.md` (frontmatter only, no body — the pinboard renders entirely from data):

```markdown
---
template: "pinboard"
slug: "joeinz-ds"
subdomain: "joeinz-ds.abdellahaddoun.com"
projectName: "Joe Inz DS"
seo:
  title: "Joe Inz Design System, a personal brand system in two scripts"
  description: "The design system behind my work. One calm palette, five typefaces, Arabic as an equal script, and the rules that keep it honest."
  keywords: [ "design system", "design tokens", "Arabic typography", "RTL design", "brand system", "accessibility" ]
  imageAlt: "The hand-lettered Joe Inz speech bubble logo on a cream background"

masthead:
  kicker: "Joe Inz · design system"
  heading: "A brand from a forgotten doodle."
  wash: "doodle"
  facts: [ "v1.1.0", "two scripts", "one accent", "audited" ]
  lightSwitch:
    toDark: "Turn the lights off"
    toLight: "Turn the lights on"

mirror:
  flipLabel: "عربي"
  en:
    kicker: "Two scripts, one voice"
    heading: "You're not behind. You're paying attention."
    body: "Neither side is the original and neither side is the translation. Flip the card and the layout follows the reading direction."
  ar:
    kicker: "خطّان، صوت واحد"
    heading: "أنت لست متأخرًا. أنت منتبه."
    body: "لا جهة هنا أصل ولا جهة ترجمة. اقلب البطاقة وسيتبع التصميم اتجاه القراءة."

railCaption: "The story · tap to focus"
allLabel: "All pins"
stops:
  - { id: "origin", label: "01 · The doodle" }
  - { id: "palette", label: "02 · The palette" }
  - { id: "type", label: "03 · The voices" }
  - { id: "arabic", label: "04 · The second script" }
  - { id: "proof", label: "05 · The proof" }

pins:
  - kind: "origin"
    stop: "origin"
    label: "01 · the origin"
    alt: "The hand-lettered Joe Inz speech bubble, drawn in ink on cream"
    note: "Drawn in 2021. Ignored for years. Now it signs everything."
  - kind: "swatches"
    stop: "palette"
    label: "02 · the palette"
    colors:
      - { hex: "#F3EAD2", name: "cream", ink: "dark" }
      - { hex: "#3A281E", name: "chocolate", ink: "light" }
      - { hex: "#B07A3C", name: "caramel", ink: "light" }
      - { hex: "#191F33", name: "navy", ink: "light" }
    note: "One saturated accent. A budget, not a paint."
    more:
      label: "Tell me more"
      body: "Caramel appears in exactly five jobs: the kicker mark, one marker highlight per view, the primary action, focus, and selection. Six extra state colors handle good and bad news, and each one arrives with a glyph so color never carries a meaning alone."
  - kind: "stat"
    stop: "type"
    label: "03 · the scale"
    value: "7"
    caption: "Sizes in the ladder, one density knob, and every step ships its Arabic size beside it."
  - kind: "quote"
    stop: "type"
    label: "field note · sharp register"
    text: "Senior is a behavior, not a title."
  - kind: "arabic"
    stop: "arabic"
    label: "04 · الاسم الحقيقي"
    name: "عبد اللّه عدّون"
    body: "خطّ عربي بقواعده الكاملة، لا طبقة ترجمة. أحجام أكبر، أسطر أوسع، ولا تباعد بين الحروف أبدًا."
    more:
      label: "اقرأ المزيد"
      dir: "rtl"
      body: "خطّان للعناوين حسب النبرة، هارمتان للدفء وأميري للاقتباس، وردكس برو لكل ما هو عملي. الأرقام غربية دائمًا، والاقتباس بعلامتيه «هكذا»."
  - kind: "typeProof"
    stop: "type"
    label: "03 · the voices"
    note: "Five faces with defined jobs. A serif that speaks, a sans that works, a mono that computes."
  - kind: "terminal"
    stop: "proof"
    label: "05 · the terminal"
    lines:
      - { prompt: true, text: "joeinz --voice console" }
      - { text: "✓ mono on a quiet well" }
      - { text: "✓ one highlight per pane" }
    more:
      label: "Show me how"
      body: "Adopting the console voice is one class on a container. The system brings the mono face, the recessed well, sixteen terminal colors and the diff and log styles with it. Nothing to configure, nothing to rebuild."
  - kind: "states"
    stop: "palette"
    label: "02 · the states"
    items:
      - { glyph: "✓", name: "positive", tone: "positive" }
      - { glyph: "i", name: "info", tone: "info" }
      - { glyph: "✕", name: "negative", tone: "negative" }
      - { glyph: "!", name: "caution", tone: "caution" }
    note: "Color never works alone. Every state has a glyph partner."
  - kind: "audit"
    stop: "proof"
    label: "05 · the audit"
    rows:
      - { check: "contrast, light", result: "pass" }
      - { check: "contrast, dark", result: "pass" }
      - { check: "color blindness", result: "pass" }
      - { check: "reduced motion", result: "pass" }

closing:
  heading: "One calm core. Built to be borrowed."
  wash: "borrowed"
  sub: "The system is a contract, not a kit. Six things you may set, six things you never touch, and everything on this board comes with its proof."
  contract:
    label: "Read the contract"
    may: "You may set six things. The voice of a surface, its register, light or dark, its density, its rhythm, and your own tokens under your own prefix."
    never: "You may never touch six things. The type roles, the font stacks, the palette, the Arabic rules, the motion law, and any name the foundation already owns."
  proofsLabel: "Show me the proofs"
  proofsStop: "proof"
---
```

Wash widths are pre-checked against `washFit.ts`: "doodle" is 105px and "borrowed" is 152px, both inside the 250px budget.

- [ ] **Step 2: Add the firebase redirect**

In `firebase.json`, `hosting.redirects` currently holds one inzsh rule. Add a second:

```json
      {
        "source": "/joeinz-ds{,/**}",
        "destination": "https://joeinz-ds.abdellahaddoun.com/",
        "type": 301
      }
```

- [ ] **Step 3: Create the PinboardPage skeleton**

Create `src/components/projectpage/PinboardPage.astro`. Skeleton scope for this task: BaseLayout wiring, fonts, page-scoped tokens, and the masthead only. Later tasks append the remaining sections INSIDE `<div class='dsp'>`.

```astro
---
// The pinboard template: the Joe Inz Design System showcase. Layout and
// behavior live here; every user-visible string comes from the entry.
// Spec: vault KB design-system-showcase-page. Copy rules: no em-dashes, no
// semicolons, human register (decision D2 in the KB).
import BaseLayout from '@src/layouts/BaseLayout.astro';
import {splitWash, type PinboardEntry} from '@src/utils/projectPages';

interface Props {
    page: PinboardEntry;
}

const {page} = Astro.props;
const {seo, projectName, masthead, mirror, railCaption, allLabel, stops, pins, closing} = page.data;

const canonical = `https://${page.data.subdomain}/`;

// Same wash contract as the band pages, split by the same shared helper. Null
// is unreachable (the schema enforces wash-in-heading) but the render guards it
// anyway, exactly as BandPage does.
const mastheadWash = splitWash(masthead.heading, masthead.wash);
const closingWash = splitWash(closing.heading, closing.wash);
---

<BaseLayout title={seo.title} description={seo.description ?? mirror.en.body} gradient='warm'
            keywords={seo.keywords?.join(', ')} imageAlt={seo.imageAlt}
            canonical={canonical} chrome='subdomain' projectName={projectName}>
    {/* Page-only faces. A <link> in the body is valid HTML and keeps the fonts
        off every other page. The site's Fraunces/Inter still load via BaseHead
        for the shared chrome. */}
    <link rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,500&family=Readex+Pro:wght@400;500;600;700&family=Harmattan:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap'/>

    <div class='dsp'>
        <header class='shell pt-[72px] pb-[8px]'>
            <div class='dsp-mast'>
                <div class='dsp-cascade'>
                    <p class='kicker mb-6'>{masthead.kicker}</p>
                    <h1 class='dsp-display font-semibold text-strong tracking-[-0.015em] leading-[1.05]'>
                        {mastheadWash
                            ? <>{mastheadWash.before}<span class='marker-wash whitespace-nowrap'>{mastheadWash.washed}</span>{mastheadWash.after}</>
                            : masthead.heading}
                    </h1>
                </div>
                <div class='dsp-aside'>
                    <button class='dsp-modebtn' type='button' data-light-switch
                            data-label-to-dark={masthead.lightSwitch.toDark}
                            data-label-to-light={masthead.lightSwitch.toLight}>
                        {masthead.lightSwitch.toDark}
                    </button>
                    <p class='dsp-facts'>{masthead.facts.join(' · ')}</p>
                </div>
            </div>
        </header>
        {/* mirror pin lands in Task 4, board in Task 5, closing in Task 6 */}
    </div>

    <style>
        /* Page-scoped additions only. Everything else reads the site's own
           tokens (--cream, --choc, --caramel, --hairline, gradients, grain),
           which global.css already defines. Never import the DS foundation.css
           here: it declares the same names with 1.x values and would rewire the
           shared chrome (see KB decision A8). */
        .dsp {
            --dsp-font-display: 'Literata', Georgia, serif;
            --dsp-font-sans: 'Readex Pro', system-ui, sans-serif;
            --dsp-font-ar: 'Harmattan', sans-serif;
            --dsp-font-mono: 'JetBrains Mono', monospace;
            --dsp-ease: cubic-bezier(.2, .7, .3, 1);
            --dsp-dur-enter: .55s;  /* choreography: zeroed under reduced motion */
            --dsp-dur-state: .25s;  /* feedback: survives reduced motion */
            font-family: var(--dsp-font-sans);
        }
        .dsp-display {
            font-family: var(--dsp-font-display);
            /* Same 30px floor as the band heroes, so the schema's washFits bound
               holds here without a second table. */
            font-size: clamp(30px, 8.5vw, 84px);
            max-width: 12ch;
        }
        .dsp-mast { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; flex-wrap: wrap; }
        .dsp-aside { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; padding-bottom: 10px; }
        .dsp-facts { font-family: var(--dsp-font-mono); font-size: 11px; line-height: 1.8; color: var(--text-muted); text-align: right; margin: 0; }
        .dsp-modebtn {
            cursor: pointer; border: 1.5px solid var(--text-strong); background: transparent;
            color: var(--text-strong); border-radius: 999px; font-weight: 600; font-size: 13px;
            padding: 9px 20px;
            transition: background-color var(--dsp-dur-state), color var(--dsp-dur-state), border-color var(--dsp-dur-state);
        }
        .dsp-modebtn:hover { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
    </style>

    <script>
        // Theme alias: same class, same persistence as the header toggle. One
        // mechanism, two controls (KB spec §2.5).
        const bindLightSwitch = () => {
            const btn = document.querySelector<HTMLButtonElement>('[data-light-switch]');
            if (!btn || btn.dataset.bound) return;
            btn.dataset.bound = '1';
            const setLabel = () => {
                const dark = document.documentElement.classList.contains('theme-dark');
                btn.textContent = dark ? (btn.dataset.labelToLight ?? '') : (btn.dataset.labelToDark ?? '');
            };
            btn.addEventListener('click', () => {
                const dark = document.documentElement.classList.toggle('theme-dark');
                localStorage.setItem('theme', dark ? 'dark' : 'light');
                setLabel();
            });
            setLabel();
        };
        document.addEventListener('astro:page-load', bindLightSwitch);
    </script>
</BaseLayout>
```

- [ ] **Step 4: Wire the dispatcher**

In `src/pages/[project].astro`, add the import and replace the `null` branch:

```astro
import PinboardPage from '@src/components/projectpage/PinboardPage.astro';
```
```astro
{isPinboard(page)
    ? <PinboardPage page={page}/>
    : <BandPage page={page}/>}
```

- [ ] **Step 5: Verify the guards and the output**

```bash
npm run check:build
grep -o '<link rel="canonical" href="[^"]*"' dist/joeinz-ds/index.html
grep -c 'joeinz-ds' dist/sitemap-0.xml || echo "not in sitemap (good)"
```
Expected: 0 errors. Canonical is `https://joeinz-ds.abdellahaddoun.com/`. The sitemap grep prints `0` or "not in sitemap (good)". (If check:build fails on the redirect guard, the firebase.json edit from Step 2 is missing or malformed — the error message prints the exact JSON to paste.)

- [ ] **Step 6: Commit**

```bash
git add src/content/projectpages/joeinz-ds.md firebase.json src/components/projectpage/PinboardPage.astro "src/pages/[project].astro"
git commit -m "Add the joeinz-ds pinboard entry, its redirect, and the masthead skeleton"
```

---

### Task 4: The mirror pin

**Files:**
- Modify: `src/components/projectpage/PinboardPage.astro`

- [ ] **Step 1: Add the mirror markup** (inside `<div class='dsp'>`, after the `</header>`)

```astro
        <section class='shell mt-6 reveal'>
            <div class='dsp-mirror' id='dsp-mirror'>
                <button class='dsp-flipbtn' type='button' data-mirror-flip>
                    EN <span aria-hidden='true'>⇄</span> <b lang='ar'>{mirror.flipLabel}</b>
                </button>
                <div class='dsp-mside'>
                    <p class='kicker mb-3'>{mirror.en.kicker}</p>
                    <h2 class='dsp-mhead'>{mirror.en.heading}</h2>
                    <p class='dsp-mbody'>{mirror.en.body}</p>
                </div>
                <div class='dsp-mside dsp-mside-ar' dir='rtl' lang='ar'>
                    <p class='kicker dsp-kicker-ar mb-3'>{mirror.ar.kicker}</p>
                    <h2 class='dsp-mhead dsp-mhead-ar'>{mirror.ar.heading}</h2>
                    <p class='dsp-mbody dsp-mbody-ar'>{mirror.ar.body}</p>
                </div>
            </div>
        </section>
```

- [ ] **Step 2: Add the mirror styles** (append inside the `<style>` block)

```css
        .dsp-mirror {
            position: relative; display: grid; grid-template-columns: 1fr 1fr;
            border: 1px solid var(--hairline); border-radius: 20px; overflow: hidden;
            background: color-mix(in srgb, var(--cream) 60%, transparent);
        }
        .theme-dark .dsp-mirror { background: color-mix(in srgb, var(--navy-soft) 70%, transparent); }
        .dsp-mside { padding: 38px 44px 34px; transition: opacity .18s ease, transform .18s ease; }
        .dsp-mside-ar { border-inline-start: 1px solid var(--hairline); text-align: right; }
        .dsp-mirror.is-flipped { direction: rtl; }
        .dsp-mirror.is-swapping .dsp-mside { opacity: 0; transform: scale(.985); }
        .dsp-mhead { font-family: var(--dsp-font-display); font-size: clamp(22px, 2.6vw, 30px); font-weight: 600; line-height: 1.2; color: var(--text-strong); margin: 0 0 8px; }
        .dsp-mhead-ar { font-family: var(--dsp-font-ar); font-weight: 700; font-size: clamp(26px, 3vw, 36px); line-height: 1.4; }
        .dsp-mbody { font-size: 13.5px; color: var(--text-muted); line-height: 1.65; margin: 0; }
        .dsp-mbody-ar { font-family: var(--dsp-font-ar); font-size: 16px; line-height: 1.85; }
        .dsp-kicker-ar { flex-direction: row-reverse; letter-spacing: 0; text-transform: none; font-family: var(--dsp-font-ar); }
        .dsp-flipbtn {
            cursor: pointer; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 3;
            border: 1.5px solid var(--text-strong); background: var(--cream); color: var(--text-strong);
            border-radius: 999px; font-weight: 600; font-size: 12.5px; padding: 8px 16px; box-shadow: var(--shadow-lift);
            transition: background-color var(--dsp-dur-state), color var(--dsp-dur-state), transform var(--dsp-dur-state);
        }
        .theme-dark .dsp-flipbtn { background: var(--navy-soft); border-color: var(--cream); color: var(--cream); }
        .dsp-flipbtn:hover { background: var(--accent); border-color: var(--accent); color: var(--on-accent); transform: translate(-50%, -50%) scale(1.05); }
        .dsp-flipbtn b { font-family: var(--dsp-font-ar); font-weight: 700; font-size: 15px; }
        @media (max-width: 860px) {
            .dsp-mirror { grid-template-columns: 1fr; }
            .dsp-mside-ar { border-inline-start: none; border-top: 1px solid var(--hairline); }
        }
```

Note: `--navy-soft`, `--shadow-lift`, `--accent`, `--on-accent`, `--cream`, `--hairline`, `--text-*` all exist in `global.css` — verified during spec work. If `color-mix` bothers `astro check` it will not (it is CSS, not TS).

- [ ] **Step 3: Add the flip script** (append inside the `<script>` block, and bind it in the same `astro:page-load` listener — restructure to one `init` function)

Replace the script contents with:

```ts
        const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const bindLightSwitch = () => { /* unchanged from Task 3 */ };

        const bindMirror = () => {
            const mirror = document.getElementById('dsp-mirror');
            const btn = document.querySelector<HTMLButtonElement>('[data-mirror-flip]');
            if (!mirror || !btn || btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', () => {
                const flip = () => {
                    mirror.classList.toggle('is-flipped');
                    document.dispatchEvent(new CustomEvent('pinboard:flip', {
                        detail: {to: mirror.classList.contains('is-flipped') ? 'to-ar' : 'to-en'}
                    }));
                };
                if (REDUCED()) { flip(); return; }
                mirror.classList.add('is-swapping');
                setTimeout(() => { flip(); mirror.classList.remove('is-swapping'); }, 180);
            });
        };

        const init = () => { bindLightSwitch(); bindMirror(); };
        document.addEventListener('astro:page-load', init);
```

(Keep `bindLightSwitch` exactly as written in Task 3 — the comment marker above stands in for it here only to avoid restating it, the function body does not change.)

- [ ] **Step 4: Verify and commit**

```bash
npm run check:build
grep -c 'dir="rtl" lang="ar"' dist/joeinz-ds/index.html
git add src/components/projectpage/PinboardPage.astro
git commit -m "Add the bilingual mirror pin with its flip"
```
Expected: 0 errors, grep prints at least 1.

---

### Task 5: The board — rail, masonry, pins, disclosures

**Files:**
- Modify: `src/components/projectpage/PinboardPage.astro`

- [ ] **Step 1: Add the board markup** (after the mirror section, inside `.dsp`)

```astro
        <div class='shell dsp-body mt-9 pb-8'>
            <nav class='dsp-rail' aria-label='The story'>
                <p class='dsp-railcap'>{railCaption}</p>
                <div class='dsp-railline'>
                    <button class='dsp-stop is-on' type='button' data-rail-stop='all'>{allLabel}</button>
                    {stops.map((stop) => (
                        <button class='dsp-stop' type='button' data-rail-stop={stop.id}>{stop.label}</button>
                    ))}
                </div>
            </nav>

            <div class='dsp-board' id='dsp-board'>
                {pins.map((pin) => (
                    <article class={`dsp-pin reveal ${pin.kind === 'quote' || pin.kind === 'terminal' ? 'dsp-pin-dark' : ''}`}
                             data-pin-stop={pin.stop} tabindex='0'>
                        <span class='dsp-pindot' aria-hidden='true'></span>
                        <span class={`dsp-lbl ${pin.kind === 'arabic' ? 'dsp-lbl-ar' : ''}`}
                              dir={pin.kind === 'arabic' ? 'rtl' : undefined}
                              lang={pin.kind === 'arabic' ? 'ar' : undefined}>{pin.label}</span>

                        {pin.kind === 'origin' && (
                            <div class='dsp-origin'>
                                <img src='/avatar.png' alt={pin.alt} width='400' height='400' loading='lazy' class='dsp-bubble'/>
                                <p class='dsp-anno dsp-anno-c'>{pin.note}</p>
                            </div>
                        )}
                        {pin.kind === 'swatches' && (
                            <>
                                <div class='dsp-swgrid'>
                                    {pin.colors.map((color) => (
                                        <span class='dsp-sw' style={`background:${color.hex}`}>
                                            <i class={color.ink === 'light' ? 'dsp-sw-light' : ''}>{color.name}</i>
                                        </span>
                                    ))}
                                </div>
                                <p class='dsp-anno'>{pin.note}</p>
                            </>
                        )}
                        {pin.kind === 'stat' && (
                            <>
                                <p class='dsp-statn'>{pin.value}</p>
                                <p class='dsp-statc'>{pin.caption}</p>
                            </>
                        )}
                        {pin.kind === 'quote' && <p class='dsp-quote'>"{pin.text}"</p>}
                        {pin.kind === 'arabic' && (
                            <div dir='rtl' lang='ar' class='dsp-arwrap'>
                                <p class='dsp-arname'>{pin.name}</p>
                                <p class='dsp-arbody'>{pin.body}</p>
                            </div>
                        )}
                        {pin.kind === 'typeProof' && (
                            <>
                                <p class='dsp-proofline'>Aa <span lang='ar'>ع</span></p>
                                <p class='dsp-anno'>{pin.note}</p>
                            </>
                        )}
                        {pin.kind === 'terminal' && (
                            <pre class='dsp-term'>{pin.lines.map((line) => (
                                <span>{line.prompt ? '$ ' : ''}{line.text}</span>
                            ))}<span class='dsp-cursor' aria-hidden='true'></span></pre>
                        )}
                        {pin.kind === 'states' && (
                            <>
                                <div class='dsp-states'>
                                    {pin.items.map((item) => (
                                        <span class={`dsp-st dsp-st-${item.tone}`}>{item.glyph} {item.name}</span>
                                    ))}
                                </div>
                                <p class='dsp-anno'>{pin.note}</p>
                            </>
                        )}
                        {pin.kind === 'audit' && (
                            <dl class='dsp-audit'>
                                {pin.rows.map((row) => (
                                    <div><dt>{row.check}</dt><dd>{row.result}</dd></div>
                                ))}
                            </dl>
                        )}

                        {pin.more && (
                            <details class='dsp-more' data-pin-more={pin.label}
                                     dir={pin.more.dir === 'rtl' ? 'rtl' : undefined}
                                     lang={pin.more.dir === 'rtl' ? 'ar' : undefined}>
                                <summary class={pin.more.dir === 'rtl' ? 'dsp-more-ar' : ''}>
                                    <span class='dsp-chev' aria-hidden='true'>›</span> {pin.more.label}
                                </summary>
                                <p class={`dsp-morebody ${pin.more.dir === 'rtl' ? 'dsp-morebody-ar' : ''}`}>{pin.more.body}</p>
                            </details>
                        )}
                    </article>
                ))}
            </div>
        </div>
```

- [ ] **Step 2: Add the board styles** (append to the `<style>` block)

```css
        .dsp-body { display: grid; grid-template-columns: 216px 1fr; gap: 36px; }
        .dsp-rail { position: sticky; top: 20px; align-self: start; }
        .dsp-railcap { font-family: var(--dsp-font-mono); font-size: 9.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 10px 20px; }
        .dsp-railline { border-left: 3px solid color-mix(in srgb, var(--accent) 35%, transparent); display: flex; flex-direction: column; }
        .dsp-stop {
            position: relative; text-align: left; background: none; border: none; cursor: pointer;
            padding: 9px 0 9px 20px; font-size: 13.5px; font-family: inherit; color: var(--text-muted);
            transition: color var(--dsp-dur-state);
        }
        .dsp-stop::before {
            content: ""; position: absolute; left: -7px; top: 13px; width: 11px; height: 11px; border-radius: 50%;
            background: var(--surface, var(--cream)); border: 3px solid color-mix(in srgb, var(--accent) 45%, transparent);
            transition: background-color var(--dsp-dur-state), border-color var(--dsp-dur-state), transform var(--dsp-dur-state);
        }
        .dsp-stop:hover { color: var(--text-strong); }
        .dsp-stop:hover::before { transform: scale(1.15); }
        .dsp-stop.is-on { color: var(--text-strong); font-weight: 600; }
        .dsp-stop.is-on::before { background: var(--accent); border-color: var(--accent); }

        .dsp-board { columns: 3; column-gap: 20px; }
        .dsp-pin {
            display: inline-block; width: 100%; margin: 0 0 20px; break-inside: avoid; position: relative;
            background: color-mix(in srgb, var(--cream) 55%, transparent); border: 1px solid var(--hairline);
            border-radius: 20px; padding: 24px; box-shadow: var(--shadow-soft);
            transition: transform .3s var(--dsp-ease), box-shadow .3s var(--dsp-ease), opacity .45s ease, filter .45s ease;
        }
        .theme-dark .dsp-pin { background: color-mix(in srgb, var(--navy-soft) 70%, transparent); }
        .dsp-pin:hover { transform: translateY(-4px); box-shadow: var(--shadow-lift); }
        .dsp-pin.is-dim { opacity: .14; transform: scale(.97); filter: grayscale(.7); }
        .dsp-pindot {
            position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 12px; height: 12px;
            border-radius: 50%; background: var(--accent); box-shadow: var(--shadow-soft);
            transition: transform var(--dsp-dur-state);
        }
        .dsp-pin:hover .dsp-pindot { transform: translateX(-50%) scale(1.25); }
        .dsp-lbl { font-family: var(--dsp-font-mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 12px; }
        .dsp-lbl-ar { font-family: var(--dsp-font-ar); letter-spacing: 0; text-transform: none; font-size: 13px; text-align: right; }
        .dsp-anno { font-family: var(--dsp-font-display); font-style: italic; font-size: 14.5px; color: var(--text-muted); line-height: 1.55; margin: 12px 0 0; }
        .dsp-anno::before { content: ""; display: block; width: 24px; height: 3px; background: var(--accent); border-radius: 2px; margin-bottom: 8px; transition: width .3s var(--dsp-ease); }
        .dsp-pin:hover .dsp-anno::before { width: 44px; }
        .dsp-anno-c { text-align: center; }
        .dsp-anno-c::before { margin-inline: auto; }
        .dsp-origin { text-align: center; }
        .dsp-bubble { width: 172px; height: auto; margin: 4px auto 0; animation: dsp-float 6.5s ease-in-out infinite; }
        @keyframes dsp-float { 50% { transform: translateY(-5px); } }
        .dsp-swgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dsp-sw { height: 56px; border-radius: 10px; border: 1px solid var(--hairline); position: relative; }
        .dsp-sw i { position: absolute; left: 6px; bottom: 5px; font-style: normal; font-family: var(--dsp-font-mono); font-size: 8.5px; color: var(--choc-ink); }
        .dsp-sw i.dsp-sw-light { color: var(--cream-soft); }
        .dsp-statn { font-family: var(--dsp-font-display); font-size: 76px; font-weight: 600; line-height: .95; letter-spacing: -.02em; color: var(--text-strong); margin: 0; }
        .dsp-statc { font-size: 12px; color: var(--text-muted); margin: 8px 0 0; line-height: 1.55; }
        .dsp-pin-dark { background: var(--navy); border-color: transparent; }
        .dsp-pin-dark .dsp-lbl { color: var(--cream-muted); }
        .dsp-quote { font-family: var(--dsp-font-display); font-style: italic; font-size: 19px; line-height: 1.45; color: var(--cream); margin: 0; }
        .dsp-arwrap { text-align: right; }
        .dsp-arname { font-family: var(--dsp-font-ar); font-size: 33px; font-weight: 700; line-height: 1.45; color: var(--text-strong); margin: 0; }
        .dsp-arbody { font-family: var(--dsp-font-ar); font-size: 14.5px; color: var(--text-muted); line-height: 1.8; margin: 6px 0 0; }
        .dsp-proofline { font-family: var(--dsp-font-display); font-size: 64px; font-weight: 600; line-height: 1; color: var(--text-strong); margin: 2px 0 0; }
        .dsp-proofline span { font-family: var(--dsp-font-ar); font-weight: 700; }
        .dsp-term { background: var(--navy); border-radius: 12px; color: var(--cream-muted); font-family: var(--dsp-font-mono); font-size: 11.5px; line-height: 1.7; padding: 14px 16px; margin: 0; white-space: pre-wrap; }
        .dsp-term span { display: block; }
        /* Specificity note: this must be .dsp-term .dsp-cursor (0,2,0) so it
           beats the block rule above (0,1,1). The cursor blinks on its own line
           under the last output line, which is how a real prompt sits. */
        .dsp-term .dsp-cursor { display: inline-block; width: 7px; height: 13px; background: var(--cream-muted); vertical-align: -2px; animation: dsp-blink 1.15s steps(1) infinite; }
        @keyframes dsp-blink { 50% { opacity: 0; } }
        .dsp-states { display: flex; gap: 8px; flex-wrap: wrap; }
        .dsp-st { font-size: 11px; font-weight: 600; border-radius: 999px; padding: 5px 12px; }
        .dsp-st-positive { background: color-mix(in srgb, var(--sage) 16%, transparent); color: var(--sage); }
        .dsp-st-info { background: color-mix(in srgb, var(--ink-blue) 14%, transparent); color: var(--ink-blue); }
        .dsp-st-negative { background: color-mix(in srgb, #8E4A42 14%, transparent); color: #8E4A42; }
        .dsp-st-caution { background: color-mix(in srgb, #B8912F 16%, transparent); color: #7A5E1D; }
        .theme-dark .dsp-st-negative { color: #C98D85; }
        .theme-dark .dsp-st-caution { color: #D4B25E; }
        .dsp-audit { font-family: var(--dsp-font-mono); font-size: 12px; line-height: 2.05; margin: 0; }
        .dsp-audit div { display: flex; justify-content: space-between; gap: 12px; }
        .dsp-audit dt, .dsp-audit dd { margin: 0; }
        .dsp-audit dd { color: var(--sage); }
        .dsp-more { margin-top: 14px; }
        .dsp-more summary {
            cursor: pointer; list-style: none; display: inline-flex; align-items: center; gap: 6px;
            font-size: 12.5px; font-weight: 600; color: var(--accent); transition: color var(--dsp-dur-state);
        }
        .dsp-more summary::-webkit-details-marker { display: none; }
        .dsp-more summary:hover { color: var(--text-strong); }
        .dsp-more-ar { font-family: var(--dsp-font-ar); font-size: 15px; }
        .dsp-chev { display: inline-block; transition: transform var(--dsp-dur-state); font-size: 11px; }
        .dsp-more[open] .dsp-chev { transform: rotate(90deg); }
        .dsp-morebody { padding-top: 12px; font-size: 12.5px; line-height: 1.65; color: var(--text-muted); border-top: 1px solid var(--hairline); margin: 12px 0 0; }
        .dsp-morebody-ar { font-family: var(--dsp-font-ar); font-size: 14px; line-height: 1.85; }
        @media (max-width: 900px) {
            .dsp-body { grid-template-columns: 1fr; }
            .dsp-rail { position: sticky; top: 0; z-index: 5; background: inherit; }
            .dsp-railline { flex-direction: row; border-left: none; gap: 4px; overflow: auto; padding: 6px 0; }
            .dsp-stop { padding: 8px 12px; white-space: nowrap; }
            .dsp-stop::before { display: none; }
            .dsp-railcap { display: none; }
            .dsp-board { columns: 2; }
        }
        @media (max-width: 580px) { .dsp-board { columns: 1; } }
```

Two notes for the implementer: `--surface` does not exist in `global.css` — the `var(--surface, var(--cream))` fallback covers it; and the pin `tabindex='0'` exists so keyboard focus can drive the rail (next step).

- [ ] **Step 3: Add rail behavior to the script** (extend the `init` composition)

```ts
        const bindRail = () => {
            const board = document.getElementById('dsp-board');
            if (!board || board.dataset.bound) return;
            board.dataset.bound = '1';
            const railStops = [...document.querySelectorAll<HTMLButtonElement>('[data-rail-stop]')];
            const pinEls = [...board.querySelectorAll<HTMLElement>('[data-pin-stop]')];
            let filtering = 'all';

            const light = (id: string) =>
                railStops.forEach((stop) => stop.classList.toggle('is-on', stop.dataset.railStop === id));

            railStops.forEach((stop) => stop.addEventListener('click', () => {
                filtering = stop.dataset.railStop ?? 'all';
                light(filtering);
                pinEls.forEach((pinEl) => {
                    const match = filtering === 'all' || pinEl.dataset.pinStop === filtering;
                    pinEl.classList.toggle('is-dim', !match);
                });
                if (filtering !== 'all') {
                    document.dispatchEvent(new CustomEvent('pinboard:focus', {detail: {stop: filtering}}));
                }
            }));

            // Hover (and keyboard focus) drive the rail, never scroll: a masonry
            // grid has no single vertical order, so scroll position lies (D7).
            const track = (pinEl: HTMLElement) => {
                if (filtering !== 'all') return;
                light(pinEl.dataset.pinStop ?? 'all');
            };
            pinEls.forEach((pinEl) => {
                pinEl.addEventListener('mouseenter', () => track(pinEl));
                pinEl.addEventListener('focusin', () => track(pinEl));
            });
            board.addEventListener('mouseleave', () => { if (filtering === 'all') light('all'); });
        };
```
and extend `init`:
```ts
        const init = () => { bindLightSwitch(); bindMirror(); bindRail(); };
```

- [ ] **Step 4: Verify and commit**

```bash
npm run check:build
grep -c 'data-pin-stop' dist/joeinz-ds/index.html
git add src/components/projectpage/PinboardPage.astro
git commit -m "Add the story rail and the masonry board with all nine pin kinds"
```
Expected: 0 errors, grep prints 9.

---

### Task 6: Closing band, contract panel, proofs button

**Files:**
- Modify: `src/components/projectpage/PinboardPage.astro`

- [ ] **Step 1: Add the closing markup** (after `.dsp-body`, inside `.dsp`)

```astro
        <section class='border-t border-hairline mt-4'>
            <div class='shell py-20 text-center reveal'>
                <h2 class='dsp-closing font-semibold text-strong tracking-[-0.015em] leading-[1.1]'>
                    {closingWash.before}<span class='marker-wash whitespace-nowrap'>{closingWash.washed}</span>{closingWash.after}
                </h2>
                <p class='dsp-closingsub'>{closing.sub}</p>
                <div class='dsp-ctas'>
                    {/* No data-pin-more here: the summary already fires cta_click,
                        and one click must not report as two events. */}
                    <details class='dsp-contract'>
                        <summary class='dsp-btn dsp-btn-pri' data-cta='primary' data-cta-location='closing'>{closing.contract.label}</summary>
                        <div class='dsp-contractbody'>
                            <p><strong>{closing.contract.may}</strong></p>
                            <p>{closing.contract.never}</p>
                        </div>
                    </details>
                    <button class='dsp-btn dsp-btn-sec' type='button' data-proofs-stop={closing.proofsStop}
                            data-cta='secondary' data-cta-location='closing'>{closing.proofsLabel}</button>
                </div>
            </div>
        </section>
```

- [ ] **Step 2: Add the closing styles**

```css
        .dsp-closing { font-family: var(--dsp-font-display); font-size: clamp(30px, 7vw, 56px); }
        .dsp-closingsub { margin: 14px auto 26px; font-size: 14.5px; color: var(--text-muted); max-width: 48ch; line-height: 1.65; }
        .dsp-ctas { display: flex; gap: 12px; justify-content: center; align-items: flex-start; flex-wrap: wrap; }
        .dsp-btn {
            font-weight: 600; font-size: 14px; border-radius: 999px; padding: 12px 26px; cursor: pointer;
            display: inline-block; list-style: none;
            transition: background-color var(--dsp-dur-state), color var(--dsp-dur-state), border-color var(--dsp-dur-state), transform var(--dsp-dur-state);
        }
        .dsp-btn:active { transform: scale(.97); }
        .dsp-btn-pri { background: var(--accent); border: 1.5px solid var(--accent); color: var(--on-accent); }
        .dsp-btn-pri:hover { background: var(--text-strong); border-color: var(--text-strong); }
        .dsp-btn-sec { background: transparent; border: 1.5px solid var(--text-strong); color: var(--text-strong); }
        .dsp-btn-sec:hover { background: var(--text-strong); color: var(--cream); }
        .dsp-contract summary::-webkit-details-marker { display: none; }
        .dsp-contractbody { max-width: 640px; margin: 20px auto 0; text-align: start; font-size: 13px; line-height: 1.65; color: var(--text-muted); border-top: 1px solid var(--hairline); padding-top: 16px; }
        .dsp-contractbody p { margin: 0 0 10px; }
        .dsp-contractbody strong { color: var(--text-body); }
```

- [ ] **Step 3: Add the proofs button behavior** (extend the script)

```ts
        const bindProofs = () => {
            const btn = document.querySelector<HTMLButtonElement>('[data-proofs-stop]');
            if (!btn || btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', () => {
                const stop = document.querySelector<HTMLButtonElement>(`[data-rail-stop="${btn.dataset.proofsStop}"]`);
                stop?.click();
                document.getElementById('dsp-board')?.scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                    block: 'start'
                });
            });
        };
```
and extend `init`:
```ts
        const init = () => { bindLightSwitch(); bindMirror(); bindRail(); bindProofs(); };
```

- [ ] **Step 4: Verify and commit**

```bash
npm run check:build
git add src/components/projectpage/PinboardPage.astro
git commit -m "Add the closing band with the in-page contract panel and proofs focus"
```
Expected: 0 errors.

---

### Task 7: Motion polish, reduced motion, no-JS

**Files:**
- Modify: `src/components/projectpage/PinboardPage.astro`

- [ ] **Step 1: Add the masthead cascade and reduced-motion rules** (append to `<style>`)

```css
        .dsp-cascade > * { animation: dsp-rise var(--dsp-dur-enter) var(--dsp-ease) backwards; }
        .dsp-cascade > :nth-child(1) { animation-delay: .05s; }
        .dsp-cascade > :nth-child(2) { animation-delay: .18s; }
        .dsp-aside { animation: dsp-rise var(--dsp-dur-enter) var(--dsp-ease) .3s backwards; }
        @keyframes dsp-rise { from { opacity: 0; transform: translateY(14px); } }

        /* The motion law, page edition: choreography and ambience stop under
           reduced motion, state feedback (colors, chevron) survives. */
        @media (prefers-reduced-motion: reduce) {
            .dsp-cascade > *, .dsp-aside { animation: none; }
            .dsp-bubble { animation: none; }
            .dsp-cursor { animation: none; }
            .dsp-pin, .dsp-pin:hover { transform: none; }
            .dsp-mside { transition: none; }
        }
```

The scroll-rise of pins is already handled: every pin carries the site's `.reveal` class, and BaseLayout's `initReveals` observer (with its own no-IntersectionObserver fallback) adds `.is-visible`. Do not add a second observer.

- [ ] **Step 2: Confirm the no-JS story, and patch the one gap**

Check how `.reveal` behaves without JavaScript:

```bash
grep -n "\.reveal" src/styles/global.css | head -5
```

If `.reveal` starts at `opacity: 0` in CSS (it does on this site), add a `<noscript>` block inside PinboardPage right after the fonts `<link>`:

```html
    <noscript>
        <style>
            .reveal { opacity: 1 !important; transform: none !important; }
        </style>
    </noscript>
```

(Disclosures are native `<details>`, the theme falls back to the pre-paint script in BaseLayout's head which is inline and JS-dependent but degrades to light mode, and the rail without JS is a list of inert buttons above a fully readable board — acceptable per spec §2.9.)

- [ ] **Step 3: Verify and commit**

```bash
npm run check:build
git add src/components/projectpage/PinboardPage.astro
git commit -m "Motion pass for the pinboard, reduced motion and no-JS covered"
```
Expected: 0 errors.

---

### Task 8: Analytics events

**Files:**
- Modify: `src/components/ProjectAnalytics.astro`
- Modify: `src/components/projectpage/PinboardPage.astro` (include the component)

- [ ] **Step 1: Include ProjectAnalytics on the pinboard**

At the bottom of PinboardPage's markup, just before `</BaseLayout>`:

```astro
    <ProjectAnalytics/>
```
with the import added to the frontmatter:
```astro
import ProjectAnalytics from '@src/components/ProjectAnalytics.astro';
```

The closing `data-cta` / `data-cta-location` attributes from Task 6 make `cta_click` fire with no new code.

- [ ] **Step 2: Add the three pinboard events to `ProjectAnalytics.astro`**

Inside the existing IIFE (after the FAQ `toggle` listener, following its delegated style and the two-parameter taxonomy), add:

```js
        // Pinboard: which script the visitor chose to read. The page's most
        // telling signal — see the feature spec (§2.8, vault KB).
        document.addEventListener('pinboard:flip', (event) => {
            track('mirror_flip', {item: (event.detail && event.detail.to) || ''});
        });

        // Pinboard: which story chapter was deliberately focused.
        document.addEventListener('pinboard:focus', (event) => {
            track('rail_focus', {item: (event.detail && event.detail.stop) || ''});
        });

        // Pinboard: which "tell me more" earned an open. Same toggle mechanics
        // as faq_open, its own name because it answers a different question.
        document.addEventListener('toggle', (event) => {
            const item = event.target;
            if (!(item instanceof Element) || !item.matches('[data-pin-more]')) return;
            if (!item.open) return;
            track('disclosure_open', {item: (item.getAttribute('data-pin-more') || '').slice(0, 60)});
        }, true);
```

- [ ] **Step 3: Verify and commit**

```bash
npm run check:build
grep -c 'pinboard:flip' dist/joeinz-ds/index.html
git add src/components/ProjectAnalytics.astro src/components/projectpage/PinboardPage.astro
git commit -m "Track the mirror flip, rail focus, and disclosure opens on the pinboard"
```
Expected: 0 errors, grep ≥ 1.

---

### Task 9: The project card and home highlight

**Files:**
- Modify: `src/content.config.ts` (projects collection, line ~75: `demoLink`)
- Modify: `src/components/ProjectItem.astro`
- Modify: `src/utils/projects.ts`
- Create: `src/content/projects/joeinz-ds.md`

- [ ] **Step 1: Make `demoLink` optional**

In the `projects` collection schema in `src/content.config.ts`, change:

```ts
    demoLink: z.string(),
```
to:
```ts
    // Optional since the design-system entry: a project without a public
    // repository has nothing honest to put here, and the card omits the
    // "View repository" link instead of pointing it somewhere it is not.
    demoLink: z.string().optional(),
```

- [ ] **Step 2: Teach `projectLead` and ProjectItem about the absence**

In `src/utils/projects.ts`, `projectLead` currently falls back to `demoLink`. An entry may now have neither... except the schema still allows that only in theory — every real entry has one of the two. Guard it anyway with the page link taking priority (unchanged) and an explicit fallback:

```ts
export function projectLead(
  project: ProjectCollectionEntry
): {href: string; target?: string; rel?: string} {
  const {projectPageLink, demoLink, demoLinkRel} = project.data;
  if (projectPageLink) return {href: projectPageLink, ...linkAttrs(projectPageLink)};
  if (demoLink) return {href: demoLink, target: '_blank', rel: demoLinkRel};
  // A card with neither link renders its title as plain text at the call site.
  return {href: ''};
}
```

In `src/components/ProjectItem.astro`, wrap the repository link (lines 62–64) in a conditional, mirroring the `projectPageLink` block above it:

```astro
            {demoLink && (
                    <a href={demoLink} target='_blank' rel={demoLinkRel} class='arrow-link text-sm'>
                        View repository <span class='arrow'>→</span>
                    </a>
            )}
```

And guard the title anchor so an empty lead renders text, not a dead link:

```astro
            <a href={leadHref || undefined} target={leadTarget} rel={leadRel}>{name}</a>
```

(The home featured row never renders `demoLink` — verified — so `index.astro` needs no change.)

- [ ] **Step 3: Write the card entry**

Create `src/content/projects/joeinz-ds.md`:

```markdown
---
name: "Joe Inz DS"
# No demoLink on purpose: the system has no public repository. The showcase
# page is the whole public surface, so the card leads there and shows no
# "View repository" link.
projectPageLink: "https://joeinz-ds.abdellahaddoun.com/"
isUnderConstruction: false
isFeatured: true
version: "1.1.0"
tags: [ "Design System", "Design Tokens", "Typography", "Arabic", "RTL", "Accessibility" ]
id: "joeinz-design-system"
---

The design system behind everything I publish. It began as a hand-lettered logo I drew and
forgot about, and grew into a full system: one calm palette with a single caramel accent,
five typefaces across two scripts, and a contract that says what an adopter may set and what
they may never touch. Arabic is an equal script, not a translation layer, and every color
pairing shipped only after a contrast and color-blindness audit.
```

(The colon after "full system" in the body is a colon, not a semicolon — D2 permits it. One frontmatter block, one body paragraph, nothing else.)

- [ ] **Step 4: Put the card first in the curated order**

In `src/utils/projects.ts`, `PROJECT_ORDER` (line 8), prepend the new id:

```ts
export const PROJECT_ORDER = [
  'joeinz-design-system',
  'inzsh-zsh-theme',
  ...
```

(D8: the DS is the root of the brand, so it leads. The user may reorder.)

- [ ] **Step 5: Verify and commit**

```bash
npm run check:build
grep -c 'joeinz-ds.abdellahaddoun.com' dist/index.html dist/projects/index.html
git add src/content.config.ts src/utils/projects.ts src/components/ProjectItem.astro src/content/projects/joeinz-ds.md
git commit -m "Add the design system project card, featured on the home page"
```
Expected: 0 errors, both greps ≥ 1 (home featured row + projects gallery).

---

### Task 10: Deploy target, copy lint, version, PR

**Files:**
- Modify: `scripts/subdomain/targets.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add the deploy target**

In `scripts/subdomain/targets.mjs`, add to the `targets` object:

```js
  'joeinz-ds': {
    slug: 'joeinz-ds',
    host: 'joeinz-ds.abdellahaddoun.com',
    zone: 'abdellahaddoun.com',
    record: 'joeinz-ds',
    // Checked for availability at setup time: pages.dev names are global.
    project: 'joeinz-ds',
    branch: 'main',
    mainSite: 'https://abdellahaddoun.com',
  },
```

No deploy is run — the target exists so `npm run subdomain status joeinz-ds` works when the user gives the deploy command later.

- [ ] **Step 2: Copy lint against D2**

```bash
grep -n '—\|;' src/content/projectpages/joeinz-ds.md | grep -v '^\s*#' || echo "copy clean"
grep -n '—\|;' src/content/projects/joeinz-ds.md || echo "copy clean"
```
Expected: "copy clean" for both (comments in frontmatter are exempt, user-visible strings are not — inspect any hit by eye before dismissing it).

- [ ] **Step 3: Bump the version**

In `package.json`: `"version": "1.5.4"` → `"version": "1.6.0"` (minor: new feature).

- [ ] **Step 4: Full gate**

```bash
npm run check:build
node scripts/subdomain/cli.mjs status joeinz-ds --allow-worktree || true
```
Expected: check:build 0 errors. The status command may fail on missing Cloudflare/Porkbun credentials — that is fine, it must not fail on "unknown target".

- [ ] **Step 5: Commit and push the branch**

```bash
git add scripts/subdomain/targets.mjs package.json
git commit -m "Register the joeinz-ds deploy target and bump to 1.6.0"
git push -u origin worktree-ds-showcase-page
```

- [ ] **Step 6: Open the PR (draft, per repo conventions)**

Target `dev`, assign joeloudjinz, short plain description, no AI attribution anywhere:

```bash
gh pr create --draft --base dev --title "Design system showcase page (joeinz-ds)" --assignee joeloudjinz --body "Adds the second project webpage: a showcase for the Joe Inz Design System at /joeinz-ds/, destined for joeinz-ds.abdellahaddoun.com.

- New pinboard template branch in the projectPages schema, band template untouched (inzsh output byte-identical)
- PinboardPage component: masthead, bilingual mirror pin with flip, story rail with hover tracking and tap-to-focus, masonry board of nine pins, in-page contract panel
- Firebase redirect, deploy target, featured project card (demoLink now optional)
- Version 1.6.0

No deploy in this PR. The subdomain setup and deploy run separately after merge."
```

**STOP here.** Deployment (`subdomain up`, `firebase deploy`) and the D4 site adjustment are separate, user-gated follow-ups — not part of this plan.

---

## Self-review notes (already applied)

- **Spec coverage:** §2.1 R1–R7 → Tasks 3, 9, 10. §2.2 structure → Tasks 3–6. §2.3 disclosures → Task 5 (native `<details>`). §2.4 motion → Tasks 4–7. §2.5 template/styling/theme → Tasks 2–3. §2.6 Arabic → Tasks 3–5 (dir/lang everywhere, shaddas in the entry). §2.7 SEO → Task 3 entry + BaseLayout defaults. §2.8 analytics → Task 8. §2.9 robustness → Task 7 (+ `astro:page-load` binding throughout).
- **Known simplification:** the filter "pop" animation from the mock is dropped — ghosting alone reads clearly and one less animation honors the restraint rule. Revisit only if the user asks.
- **Type consistency:** `PinboardEntry`/`BandEntry`/`isPinboard` defined once in Task 2 and used in Tasks 2–3. Pin field names in Task 5's markup match the Task 2 schema exactly (`colors`, `items`, `rows`, `lines`, `more.label/body/dir`).
- **Traps for the implementer:** do not import `foundation.css` (token collisions, KB A8); do not add a top-level `joeinz-ds` route file (RESERVED_SLUGS guard); do not hand-edit `dist/_redirects` (generated); `projectName` max is 12 chars — "Joe Inz DS" fits, the full name does not; never name YAML keys `off`/`on`/`yes`/`no` — YAML reads them as booleans (why the light switch fields are `toDark`/`toLight`).
- **Review pass (2026-08-13):** fixed before execution — YAML boolean-key blocker in `lightSwitch`, cursor CSS specificity, `pageSections` union typing spelled out, unused `getProjectPages` import in the Task 1 move, contract click double-count, a malformed card-entry block, and `splitWash` reuse instead of a hand-rolled copy.
