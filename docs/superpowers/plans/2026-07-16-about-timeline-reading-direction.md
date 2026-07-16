# About Timeline Reading Direction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the About page's newest-first experience timeline read as a deliberate walk backwards through time, and let readers opt into chronological "story order".

**Architecture:** Phase 1 is pure markup and CSS — a descending start year on the timeline rail, a corrected kicker, a "How I got here" flashback sub-header, and a "Before that" cue chip. Phase 2 adds a `Latest first | Story order` toggle that flips a single class on a section wrapper and reverses the entry DOM nodes. All direction-dependent text is rendered twice and switched with CSS, so Phase 2's script never rewrites strings.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS. Spec: `docs/superpowers/specs/2026-07-16-about-timeline-reading-direction-design.md`.

---

## Before you start: read this

**There is no test framework in this repo.** `npm run check:build` (TypeScript check + Astro build) is the primary
validation step for any change — this is stated in `CLAUDE.md`. So the usual TDD loop does not apply here. Every task
below substitutes:

1. `npm run check:build` must pass, and
2. an explicit, scripted browser check with a stated expected observation.

Do not add a test framework. That is out of scope and against the repo's conventions.

**Two non-obvious things about this codebase you must not break:**

1. **The traveling dot's math is hardcoded and fragile.** `src/pages/about.astro` contains
   `const DOT_CENTER_OFFSET = 55;` with the comment `/* rail pt-12 (48) + half dot (7) */`. It assumes each entry's
   dot centre sits 55px below the entry's top. If you change the rail column's vertical spacing without preserving
   that 55px, the dot silently desyncs from the cards. Task 1 changes rail padding and **must** preserve it.
2. **The rail script pairs DOM order with layout.** It uses `timeline.querySelectorAll('.timeline-entry')` (DOM
   order) together with `offsetTop`. Never reorder entries with CSS `flex-direction: column-reverse` — visual and DOM
   order would desync and the dot math would break. Phase 2 moves real DOM nodes for this reason.

**Styling rule:** never hard-code palette values. Use the semantic tokens / shared classes (`.kicker`, `.cardx`,
`.badge-accent`, `.badge-outline`, `.chip`) defined in `src/styles/global.css`.

**Commit style:** this repo uses gerund-phrase commit subjects, e.g. "Rewriting the AMEK story as narrative prose".
Match it. Do **not** add any Claude/AI attribution or `Co-Authored-By` trailer to commits, branches, or the PR.

**Branch:** this plan is being executed from a git worktree on branch `worktree-about-timeline`, which is based on
`feat/about-timeline-reading-direction` (which already contains the spec commit and is itself based on `dev`). Task 7
reconciles the branches before opening the PR. The PR targets `dev`, never `main`.

**Note on the working tree:** the *main* checkout has an unrelated uncommitted edit to
`src/content/experiences/10-amek-senior-engineer.md`. It is not in this worktree and is not your concern. No task in
this plan touches `src/content/experiences/`. Never use `git add -A` or `git commit -a`.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/components/ExperienceCard.astro` | One timeline entry: rail column (year + dot) and story card | Modify |
| `src/pages/about.astro` | Section wrapper, kicker, flashback sub-header, order toggle, direction CSS, toggle script | Modify |
| `package.json` | Version | Modify (final task) |

No new files. Phase 1 is confined to those two components; Phase 2 adds the control and script to `about.astro` only.

---

## Task 1: Descending start year on the rail

Adds a muted start year above each dot, so the descent is legible before any copy is read. Desktop only — the mobile
gutter is 28px and the card's meta line already carries dates.

**The critical constraint:** the dot must not move. Its centre stays 55px below the entry top at **both**
breakpoints, so `DOT_CENTER_OFFSET = 55` in `about.astro` keeps working untouched.

| Breakpoint | Rail padding | Year | Gap | Dot top | Dot centre |
|---|---|---|---|---|---|
| mobile (year hidden) | `pt-12` = 48px | — | — | 48px | 55px |
| md (year shown) | `pt-6` = 24px | 14px | 10px | 48px | 55px |

**Files:**
- Modify: `src/components/ExperienceCard.astro`

- [ ] **Step 1: Derive the start year in the component frontmatter**

In `src/components/ExperienceCard.astro`, find this line:

```astro
const workTypeLabel = workType.charAt(0).toUpperCase() + workType.slice(1);
```

Add directly below it:

```astro
const startYear = startDate.slice(0, 4);
```

`startDate` is already destructured from `experience.data` on the line above. Its schema format is `"YYYY-MM"`, so
`slice(0, 4)` is the year. (`endDate` is *not* safe to slice — for the current role it is free text, `"Present"`.)

- [ ] **Step 2: Render the year above the dot**

In the same file, find the rail column:

```astro
<div class='flex flex-col items-center pt-12'>
    <span class='w-3.5 h-3.5 rounded-full border-2 border-accent bg-surface relative z-[1] shrink-0'></span>
</div>
```

Replace it with:

```astro
<div class='flex flex-col items-center pt-12 md:pt-6'>
    <span class='hidden md:block text-[11px] font-semibold text-muted tabular-nums leading-[14px] mb-[10px]'>{startYear}</span>
    <span class='w-3.5 h-3.5 rounded-full border-2 border-accent bg-surface relative z-[1] shrink-0'></span>
</div>
```

Why each part matters:
- `pt-12 md:pt-6` — 48px on mobile where the year is hidden; 24px on desktop where the year occupies the rest.
- `hidden md:block` — hides the year on mobile.
- `leading-[14px]` + `mb-[10px]` — pins the year's box to exactly 14px + 10px = 24px, so 24 + 24 = 48px puts the dot
  top at the same place as mobile's `pt-12`. Do not change these numbers casually.
- `tabular-nums` — equal-width digits so the years line up vertically down the rail.
- `text-muted` — semantic token; the year is a quiet cue, not a headline.

- [ ] **Step 3: Verify the build passes**

Run: `npm run check:build`
Expected: completes with `[build] Complete!` and no TypeScript errors.

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev` and open `http://localhost:4321/about`.

Expected observations:
1. At desktop width, years run down the rail reading **2026, 2025, 2025, 2024, 2023, 2023, 2023, 2022, 2021, 2019**.
   Repeated years are correct and intentional — three roles began in 2023. Do not "fix" them.
2. The dot of each entry still sits vertically level with its card's role title, exactly as before the change.
3. Scrolling: the accent traveling dot still lands on each entry's dot. **If it drifts, Step 2's spacing is wrong —
   recheck the 14px/10px numbers before continuing.**
4. Narrow the window below `md` (768px): years disappear, dots stay level with the titles.

- [ ] **Step 5: Commit**

```bash
git add src/components/ExperienceCard.astro
git commit -m "Adding descending start years to the about timeline rail"
```

---

## Task 2: Direction-aware CSS foundation and corrected kicker

The kicker currently reads `2019 → Today` while the list runs Today → 2019 — the label contradicts the order. This
task fixes it and, in the same stroke, builds the CSS mechanism that Phase 2 depends on.

**The mechanism:** every direction-dependent string is rendered **twice** — `.cue-back` (shown by default) and
`.cue-forward` (hidden). An `.order-story` class on an ancestor swaps which is visible. Phase 2 therefore only
toggles a class; it never rewrites text.

`.order-story` must live on an ancestor of **both** the kicker and the timeline, so this task introduces a wrapper
with `id='experienceSection'`.

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Add the section wrapper and rewrite the kicker**

In `src/pages/about.astro`, find the experience section:

```astro
    <!-- Experience timeline -->
    <section class='border-t border-hairline'>
        <div class='shell py-[72px]'>
            <p class='kicker mb-4'>2019 → Today · {experiences.length} roles</p>
```

Replace those four lines with:

```astro
    <!-- Experience timeline -->
    <section class='border-t border-hairline'>
        <div class='shell py-[72px]' id='experienceSection'>
            <p class='kicker mb-4'>
                <span class='cue-back'>Today → 2019</span><span class='cue-forward'>2019 → Today</span> · {experiences.length} roles
            </p>
```

Keep the rest of the section exactly as it is.

- [ ] **Step 2: Add the direction CSS**

`src/pages/about.astro` already has a `<style is:global>` block containing `.timeline-entry .story-card` rules. These
rules must be global (not Astro-scoped) because `.order-story` is set on an ancestor and the `.cue-*` spans live
inside `ExperienceCard.astro` — a different component.

Find the opening of that block:

```css
<style is:global>
    .timeline-entry .story-card {
```

Insert these rules immediately after `<style is:global>` and before `.timeline-entry .story-card`:

```css
    /* Direction-dependent text is rendered twice; .order-story picks which shows.
       This keeps the Phase 2 toggle to a single class flip — no string rewriting. */
    .cue-forward {
        display: none;
    }

    .order-story .cue-back {
        display: none;
    }

    .order-story .cue-forward {
        display: inline;
    }
```

- [ ] **Step 3: Verify the build passes**

Run: `npm run check:build`
Expected: completes with `[build] Complete!` and no TypeScript errors.

- [ ] **Step 4: Verify in the browser**

Open `http://localhost:4321/about`.

Expected: the kicker above the heading now reads **`Today → 2019 · 10 roles`**. The text `2019 → Today` must **not**
be visible anywhere (it is in the DOM but hidden by `.cue-forward { display: none }`).

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro
git commit -m "Correcting the about timeline kicker to match the reading direction"
```

---

## Task 3: "Before that" cue chip on non-leading cards

Adds a quiet cue above each role title marking the step backwards. It is self-correcting: hiding it on
`.timeline-entry:first-child` means the leading card suppresses its own cue in **either** order, with no position
logic and no JavaScript.

**Files:**
- Modify: `src/components/ExperienceCard.astro`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Render both cue variants in the card**

In `src/components/ExperienceCard.astro`, find the card's header row:

```astro
    <div class='cardx p-6 md:p-10 mb-7 story-card'>
        <div class='flex items-center gap-3 flex-wrap mb-3'>
```

Insert a cue line between those two lines, so it reads:

```astro
    <div class='cardx p-6 md:p-10 mb-7 story-card'>
        <p class='direction-cue kicker mb-2'>
            <span class='cue-back'>Before that</span><span class='cue-forward'>Then</span>
        </p>
        <div class='flex items-center gap-3 flex-wrap mb-3'>
```

`.kicker` is an existing shared class from `src/styles/global.css` — reuse it rather than inventing new type styles.
The `.cue-back` / `.cue-forward` spans reuse the CSS built in Task 2.

- [ ] **Step 2: Hide the cue on the leading card**

In `src/pages/about.astro`, inside the same `<style is:global>` block, add this rule directly after the
`.order-story .cue-forward` rule from Task 2:

```css
    /* The leading card has nothing before it — true in either order, so :first-child
       handles both without position logic. */
    .timeline-entry:first-child .direction-cue {
        display: none;
    }
```

- [ ] **Step 3: Verify the build passes**

Run: `npm run check:build`
Expected: completes with `[build] Complete!` and no TypeScript errors.

- [ ] **Step 4: Verify in the browser**

Open `http://localhost:4321/about`.

Expected observations:
1. The **first** card (Senior Software Engineer, AMEK Consulting) shows **no** cue above its title.
2. Every **other** card shows a small `Before that` label above its role title.
3. The word `Then` is not visible anywhere.

- [ ] **Step 5: Commit**

```bash
git add src/components/ExperienceCard.astro src/pages/about.astro
git commit -m "Adding a direction cue to the about timeline cards"
```

---

## Task 4: "How I got here" flashback sub-header

Inserts a sub-header after the first entry, reframing everything below as an explicit retrospective. This is what
turns backwards reading from broken into intentional.

It renders in the **content column**, not the rail, so the rail line runs unbroken behind it from first dot to last.
It is a sibling of the `.timeline-entry` nodes and is deliberately **not** given that class — the rail script selects
`.timeline-entry`, so the sub-header stays invisible to the dot math while still taking vertical space (which is
harmless: the rail spans first dot to last dot regardless).

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Know that Fragment needs no import**

`Fragment` is built into Astro and is available in every `.astro` template with no import. This step exists only so
you do not go hunting for one. Proceed to Step 2.

- [ ] **Step 2: Insert the sub-header after the first entry**

In `src/pages/about.astro`, find the entry loop:

```astro
                {experiences.map((exp) => <ExperienceCard experience={exp}/>)}
```

Replace it with:

```astro
                {experiences.map((exp, index) => (
                    <Fragment>
                        <ExperienceCard experience={exp}/>
                        {index === 0 && (
                            <div id='timelineFlashback' class='grid grid-cols-[28px_1fr] md:grid-cols-[48px_1fr]'>
                                <div aria-hidden='true'></div>
                                <h3 class='kicker mb-7'>How I got here</h3>
                            </div>
                        )}
                    </Fragment>
                ))}
```

The empty `<div>` occupies the rail column so the text aligns with the cards, matching the
`grid-cols-[28px_1fr] md:grid-cols-[48px_1fr]` used by `ExperienceCard`. It is `aria-hidden` to match how
`#timelineMarker` and `#timelineLine` already mark presentational elements in this file.

**Why `<h3>` and not `<p>`:** this sub-header's whole job is to reframe everything below it as a retrospective. As a
`<p class='kicker'>` it would be the only kicker in the codebase that neither precedes a heading nor sits in a
landmark — meaning a screen-reader user navigating by heading outline would never encounter it, and the reframing
cue would be lost for exactly the users who most need explicit structure. `<h3>` keeps heading order valid: the
section's `<h2>` is "The story behind my experience.", role titles are `<h3>`, so the sequence stays
`h2 → h3 → h3 → …` with no skipped levels.

- [ ] **Step 3: Verify the build passes**

Run: `npm run check:build`
Expected: completes with `[build] Complete!` and no TypeScript errors.

- [ ] **Step 4: Verify in the browser**

Open `http://localhost:4321/about`.

Expected observations:
1. `How I got here` appears once, between the first card (AMEK) and the second card (Solo Engineer).
2. It is aligned with the left edge of the cards, not the rail.
3. The rail line passes behind/beside it without a visible break.
4. Scroll the full timeline: the traveling dot still lands on each entry's dot. The extra vertical space must not
   have desynced it.

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro
git commit -m "Framing the about timeline history as a flashback"
```

---

## Task 5: Order toggle control (markup and styles)

Phase 2 begins. This task adds the control only — it does nothing until Task 6 wires the script. Splitting it keeps
each commit small and leaves the build working at every step.

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Add the control markup**

In `src/pages/about.astro`, find the heading that follows the kicker:

```astro
            <h2 class='font-display text-4xl md:text-[44px] font-semibold text-strong leading-tight mb-12'>
                The story behind my experience.
            </h2>
```

Change its bottom margin from `mb-12` to `mb-6` and insert the control after it, so the block reads:

```astro
            <h2 class='font-display text-4xl md:text-[44px] font-semibold text-strong leading-tight mb-6'>
                The story behind my experience.
            </h2>
            <div class='flex items-center gap-2 mb-12' id='orderControl'>
                <span class='kicker'>Read</span>
                <button type='button' class='order-btn chip' data-order='latest' aria-pressed='true'>Latest first</button>
                <button type='button' class='order-btn chip' data-order='story' aria-pressed='false'>Story order</button>
            </div>
```

`.chip` is an existing shared class from `src/styles/global.css`.

- [ ] **Step 2: Style the selected state**

In `src/pages/about.astro`'s `<style is:global>` block, add after the `.timeline-entry:first-child` rule from Task 3:

```css
    .order-btn {
        cursor: pointer;
    }

    .order-btn[aria-pressed='true'] {
        background: var(--accent-wash);
        color: var(--text-strong);
        font-weight: 600;
    }
```

`--accent-wash` is an existing token — it is already used by the timeline marker's box-shadow in this same file.

- [ ] **Step 3: Verify the build passes**

Run: `npm run check:build`
Expected: completes with `[build] Complete!` and no TypeScript errors.

- [ ] **Step 4: Verify in the browser**

Open `http://localhost:4321/about`.

Expected: a `Read  [Latest first] [Story order]` control sits between the heading and the timeline. `Latest first` is
visibly emphasised. Clicking either button does nothing yet — that is correct at this stage.

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro
git commit -m "Adding the reading order control to the about timeline"
```

---

## Task 6: Order toggle behaviour

Wires the control. Three rules govern this code:

1. **Move real DOM nodes.** Never `column-reverse` (see "Before you start").
2. **Never rewrite strings.** Direction text flips via the `.order-story` class from Task 2.
3. **Re-run the rail math after reordering** by dispatching a `resize` event. The existing script's `update()` is
   closed over and not exported; it already listens for `resize`. Dispatching one is far safer than refactoring it.

**Files:**
- Modify: `src/components/ExperienceCard.astro`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Tag each entry with its render index**

The script needs a stable notion of original order, because after one reversal the DOM no longer tells you.

In `src/components/ExperienceCard.astro`, find:

```astro
export interface Props {
    experience: CollectionEntry<'experiences'>;
}

const {experience} = Astro.props;
```

Replace with:

```astro
export interface Props {
    experience: CollectionEntry<'experiences'>;
    index: number;
}

const {experience, index} = Astro.props;
```

Then find the entry's root element:

```astro
<div class='timeline-entry grid grid-cols-[28px_1fr] md:grid-cols-[48px_1fr] reveal'>
```

Replace with:

```astro
<div class='timeline-entry grid grid-cols-[28px_1fr] md:grid-cols-[48px_1fr] reveal' data-index={index}>
```

And in `src/pages/about.astro`, pass it — find the line introduced in Task 4:

```astro
                        <ExperienceCard experience={exp}/>
```

Replace with:

```astro
                        <ExperienceCard experience={exp} index={index}/>
```

- [ ] **Step 2: Add the toggle script**

In `src/pages/about.astro`, add this as a **new** `<script is:inline>` block after the existing timeline script block
(the one ending with the `ResizeObserver` and its closing `</script>`). Do not merge it into that block.

```astro
<script is:inline>
    if (!window.__orderToggleBound) {
        window.__orderToggleBound = true;

        const STORAGE_KEY = 'experienceOrder';

        const applyOrder = (order) => {
            const section = document.getElementById('experienceSection');
            const timeline = document.getElementById('experienceTimeline');
            const flashback = document.getElementById('timelineFlashback');
            if (!section || !timeline) return;

            // Sort back to render order first; after a reversal the DOM is no longer authoritative.
            const entries = Array.from(timeline.querySelectorAll('.timeline-entry'))
                .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
            const ordered = order === 'story' ? entries.slice().reverse() : entries;

            // Moving real nodes, not CSS column-reverse: the rail script pairs
            // querySelectorAll order with offsetTop and would desync otherwise.
            ordered.forEach((entry) => timeline.appendChild(entry));

            // The flashback frame only makes sense walking backwards; in story order
            // the current role is last, so it is hidden by CSS and its position is moot.
            if (flashback) timeline.insertBefore(flashback, ordered[1] ?? null);

            section.classList.toggle('order-story', order === 'story');

            document.querySelectorAll('.order-btn').forEach((button) => {
                button.setAttribute('aria-pressed', String(button.dataset.order === order));
            });

            // The rail's update() is closed over; it already listens for resize.
            window.dispatchEvent(new Event('resize'));
        };

        const readStoredOrder = () => {
            try {
                return localStorage.getItem(STORAGE_KEY) === 'story' ? 'story' : 'latest';
            } catch {
                return 'latest';
            }
        };

        document.addEventListener('click', (event) => {
            const button = event.target?.closest?.('.order-btn');
            if (!button) return;
            const order = button.dataset.order;
            try {
                localStorage.setItem(STORAGE_KEY, order);
            } catch {
                /* private mode — the toggle still works for this page view */
            }
            applyOrder(order);
        });

        // Re-apply on first load and after each View Transitions navigation.
        document.addEventListener('astro:page-load', () => applyOrder(readStoredOrder()));
    }
</script>
```

Notes on the choices, so you do not "simplify" them into bugs:
- The `try/catch` around `localStorage` mirrors how theme persistence is handled and keeps private browsing from
  throwing.
- `ordered[1] ?? null` — `insertBefore` with `null` appends, which is the correct fallback if there is only one entry.
- The `window.__orderToggleBound` guard matches the existing `__timelineBound` / `__storyToggleBound` pattern in this
  repo and prevents double-binding across View Transitions.

- [ ] **Step 3: Verify the build passes**

Run: `npm run check:build`
Expected: completes with `[build] Complete!` and no TypeScript errors.

- [ ] **Step 4: Verify in the browser**

Open `http://localhost:4321/about`.

Expected observations:
1. Click `Story order`. The entries reverse: AMEK is now **last**, Sweedy Portal (2019) **first**. Rail years now
   ascend 2019 → 2026.
2. The kicker flips to `2019 → Today · 10 roles`.
3. `How I got here` disappears.
4. Cue chips now read `Then` instead of `Before that`, and the **first** card (Sweedy Portal, 2019) shows none.
5. Scroll: the traveling dot still lands on each entry's dot. **This is the check most likely to fail — if it drifts,
   the `resize` dispatch is not reaching `update()`.**
6. Reload the page: story order persists.
7. Click `Latest first`: AMEK returns to the top and `How I got here` reappears between the first and second cards
   (not at the very top — if it is at the top, the `insertBefore` is wrong).
8. Navigate to `/` and back to `/about` via the header links (this uses View Transitions): the saved order re-applies
   and the buttons do not double-bind.

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro src/components/ExperienceCard.astro
git commit -m "Wiring the reading order toggle on the about timeline"
```

---

## Task 7: Version bump, branch reconciliation, and pull request

This repo bumps `package.json` per semver in every PR. This work adds a user-facing feature, so it is a **minor**
bump: `1.1.1` → `1.2.0`.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Bump the version**

In `package.json`, change:

```json
  "version": "1.1.1",
```

to:

```json
  "version": "1.2.0",
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run check:build`
Expected: completes with `[build] Complete!` and no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Bumping version to 1.2.0"
```

- [ ] **Step 4: Confirm nothing unrelated was committed**

Run: `git log --oneline feat/about-timeline-reading-direction..HEAD`
Expected: exactly six commits, Task 1 through Task 7, in order.

Run: `git diff --name-only feat/about-timeline-reading-direction..HEAD`
Expected: exactly three paths — `package.json`, `src/components/ExperienceCard.astro`, `src/pages/about.astro`.
Nothing under `src/content/` may appear. If it does, stop and report it.

- [ ] **Step 5: Reconcile the branches**

This plan's commits are on `worktree-about-timeline`; the spec lives on `feat/about-timeline-reading-direction`, which
is this branch's base and therefore already an ancestor. Fast-forward the feature branch onto the work, from the
**main checkout** (a branch cannot be checked out in two worktrees at once):

```bash
git -C /Users/joeinz/Workspace/personal/Projects/Web/personal-website \
  branch -f feat/about-timeline-reading-direction worktree-about-timeline
```

Note: the main checkout currently has `feat/about-timeline-reading-direction` checked out, so `branch -f` will be
refused. If that happens, switch it to `dev` first, then retry:

```bash
git -C /Users/joeinz/Workspace/personal/Projects/Web/personal-website switch dev
```

Switching is safe: the uncommitted AMEK edit follows the working tree and is not lost.

- [ ] **Step 6: Push and open the draft PR**

```bash
git push -u origin feat/about-timeline-reading-direction
gh pr create --draft --base dev --assignee joeloudjinz \
  --title "Reading direction on the about timeline" \
  --body "$(cat <<'EOF'
The experience entries read as a story, but the timeline runs newest-first, so reading top-to-bottom meant reading the story backwards. The kicker also said `2019 → Today` while the list ran the other way.

Keeps newest-first as the default and makes the descent deliberate: start years descend down the rail, the kicker matches the order, a "How I got here" sub-header frames the history as a flashback, and each card carries a "Before that" cue.

Adds a `Latest first | Story order` toggle for readers who want the story in order. It persists in localStorage and flips direction text via a single CSS class.

Design: `docs/superpowers/specs/2026-07-16-about-timeline-reading-direction-design.md`
EOF
)"
```

Keep the PR description short and straightforward. Do not add AI attribution.

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Years on the rail, descending, desktop only | 1 |
| `DOT_CENTER_OFFSET` / rail geometry unchanged | 1 (table + Step 4 check 3) |
| Repeated years accepted, not suppressed | 1 (Step 4 check 1) |
| Kicker corrected to `Today → 2019` | 2 |
| Direction text is CSS-driven, never rewritten | 2 (mechanism), 6 (consumes it) |
| No directional connectives in markdown | Honoured — no task touches `src/content/experiences/` |
| Flashback sub-header in content column, not a `.timeline-entry` | 4 |
| "Now" hero already exists (Current badge + expanded by default) | No task needed — spec states this is pre-existing |
| Cue chip, hidden on `:first-child`, self-correcting | 3 |
| Toggle: persists, reverses DOM nodes, hides sub-header, flips kicker, re-runs `update()` | 5, 6 |
| Reversal moves DOM nodes, never `column-reverse` | 6 (Step 2 comment + "Before you start") |
| Out of scope: 3-line clamp, chapter counters, reordering the default | No tasks — correctly absent |
| Verification: `check:build` + dot tracking at both widths | Every task, Steps 3–4 |

No gaps.

**Placeholder scan:** none. Every step names exact files, shows the actual code, and states an expected observation.

**Type consistency:** `startYear` (Task 1) is used only in Task 1. The `index` prop (Task 6 Step 1) is declared in
`Props`, destructured, rendered as `data-index`, and read as `dataset.index` in the same task. `.cue-back` /
`.cue-forward` are defined in Task 2 and reused verbatim in Tasks 3 and 6. `.order-story` is defined in Task 2 and set
in Task 6 on `#experienceSection`, the wrapper Task 2 introduces. `#timelineFlashback` is created in Task 4 and read
in Task 6. `.order-btn` is created in Task 5 and read in Task 6. Consistent throughout.

**Ordering dependency:** Task 4 introduces the `(exp, index)` map signature, and Task 6 Step 1 reuses that `index`
when passing it to `ExperienceCard`. Task 6 depends on Task 4 having landed. Execute in order.
