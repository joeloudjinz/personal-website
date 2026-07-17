# Story Typing Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a reader expands an About page experience card, the hidden part of the story is written out with a terminal-style cursor instead of appearing instantly.

**Architecture:** All story logic consolidates into one `is:inline` script in `about.astro` so it can run before first paint. A `TreeWalker` builds a flat character map over the story's text nodes; truncation and reveal are both "restore text nodes up to character N". A `requestAnimationFrame` accumulator loop drives the reveal, because the required per-character delays are far below one frame.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS. Spec: `docs/superpowers/specs/2026-07-17-story-typing-reveal-design.md`.

---

## Before you start: read this

**There is no test framework in this repo.** `npm run check:build` is the primary validation step per `CLAUDE.md`. Do
not add a test framework. Each task gates on the build plus a scripted browser check.

**`dist/` inspection is NOT sufficient verification.** The previous feature on this branch shipped a CSS selector that
matched zero elements; it passed three reviews because each verified the rule *existed in the compiled CSS*, never that
it *matched*. Worse, dev and production DOM differ (Vite injects component scripts inline in dev; production bundles
them into `<head>`). **Verify in a real browser against `npm run dev`.**

**Five things about this codebase you must not break:**

1. **`DOT_CENTER_OFFSET = 55`** in `src/pages/about.astro` drives a scroll-following "traveling dot". Do not touch that
   script. Story height changes are picked up by an existing `ResizeObserver` on `documentElement`.
2. **`.timeline-entry:not(.timeline-entry ~ .timeline-entry)`** hides the leading card's direction cue. Do not
   "simplify" it to `:first-child` or an adjacent-sibling form — both silently match nothing. This is documented at
   length in `docs/superpowers/plans/2026-07-16-about-timeline-reading-direction.md`.
3. **Direction text is rendered twice and switched by CSS** (`.cue-back` / `.cue-forward` under `.order-story`). Never
   rewrite those strings in JS.
4. **The order toggle reverses real DOM nodes.** Never reorder entries with CSS `column-reverse`.
5. **`is:inline` scripts in `about.astro` run before paint** and are guarded with `window.__*Bound` flags because the
   site uses View Transitions. Follow that pattern exactly.

**Styling rule:** never hard-code palette values. Use semantic tokens (`--accent`, `--ease-standard`, `--dur-base`).

**Commit style:** gerund-phrase subjects ("Adding…", "Wiring…"). **No** Claude/AI attribution or `Co-Authored-By`
trailer in commits, branches, or PRs.

**Branch:** `worktree-about-timeline` in a git worktree. Task 4 reconciles branches. PR targets `dev`, never `main`.

**Do not touch** `package.json` dependencies or `package-lock.json`. `package-lock.json` may already show as modified in
the working tree — that is pre-existing drift. Leave it. Never `git add -A` or `git commit -a`.

---

## Key facts established before writing this plan

- **`ExperienceCard.astro` is rendered only by `about.astro`.** Confirmed by grep. Moving its script is therefore safe.
- **`ExperienceCard.astro`'s `<script>` (line 99) is a bundled module script**, which is deferred and runs *after* first
  paint. Truncating there would flash the full story. This is why the logic must move to an `is:inline` script in
  `about.astro`. An `is:inline` script inside the component is not an option — Astro renders it once per instance, so
  it would be duplicated ten times.
- Removing that component script also removes the `<script>` node Vite injects between `#timelineMarker` and the first
  `.timeline-entry` in dev. That node is what broke the earlier cue selector. The current selector does not depend on
  it either way — do not "re-simplify" the selector just because the node is gone.
- Only `09-solo-engineer.md` contains rich markup (a bullet list). It must survive truncation and typing intact.
- **The teaser length is measured, not a constant — and this was corrected during plan review.** An earlier draft
  hardcoded "~200 chars desktop / ~120 mobile". Measured in a real browser, both are wrong: at 1440px the `.story` box
  is **1118px** wide and three lines hold **376 characters**; 200 would render ~1.4 lines, a visible regression against
  today's 3-line clamp. (`77px ÷ 25.575px line-height = 3.01 lines` confirms 77px was a 3-line design.)
- **The responsive split was removed, because it is currently meaningless.** At a 390px viewport the `.story` box is
  still **874px** wide — the card never narrows. That is a pre-existing horizontal-overflow bug on this site (the home
  page overflows too; it is not caused by this branch or the previous one). Hardcoding a "mobile" budget would bake in
  a number derived from a broken layout and silently regress the day someone fixes the overflow. Measuring the real
  3-line boundary is immune to both.
- `experience.id` resolves via the `glob()` loader in `src/content.config.ts` to the filename slug, e.g.
  `10-amek-senior-engineer` — verified, and valid/unique as an HTML id.

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/components/ExperienceCard.astro` | Card markup; story container + toggle button | Modify: remove `<script>`, retarget `.story` transition, drop the clamp, add `id`/`aria-controls` |
| `src/pages/about.astro` | Page-level inline scripts and global CSS | Modify: add the story reveal script + cursor CSS |
| `package.json` | Version | Modify (final task) |

No new files. The reveal script joins the two `is:inline` scripts already in `about.astro`.

---

## Task 1: Truncated collapsed state, script consolidated

Replaces the `max-height` clamp with a word-boundary truncation, and moves all story-toggle logic into a pre-paint
inline script in `about.astro`. After this task, stories truncate cleanly and the toggle expands instantly — **no
typing yet**. That arrives in Task 2.

**Files:**
- Modify: `src/components/ExperienceCard.astro`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Give the story an id and wire the disclosure**

In `src/components/ExperienceCard.astro`, find:

```astro
        <div class:list={['story text-[15.5px] leading-[1.65] text-body', !current && 'collapsed']}>
            <Content/>
        </div>
        <button class='story-toggle text-sm font-semibold text-info mt-4'
                aria-expanded={current ? 'true' : 'false'}>
            {current ? 'Show less ↑' : 'Read the story ↓'}
        </button>
```

Replace with:

```astro
        <div id={`story-${experience.id}`}
             class:list={['story text-[15.5px] leading-[1.65] text-body', !current && 'collapsed']}>
            <Content/>
        </div>
        <button class='story-toggle text-sm font-semibold text-info mt-4'
                aria-expanded={current ? 'true' : 'false'}
                aria-controls={`story-${experience.id}`}>
            {current ? 'Show less ↑' : 'Read the story ↓'}
        </button>
```

`experience.id` is the collection id, e.g. `10-amek-senior-engineer` — a valid HTML id and unique per card.

Why: the button already claimed `aria-expanded`, but nothing said *what* it expands. Truncation removes the collapsed
text from the accessibility tree, which makes this a real disclosure widget, so it needs `aria-controls`.

- [ ] **Step 2: Retarget the transition and drop the clamp**

In the same file, find:

```css
    .story {
        overflow: hidden;
        transition: max-height 320ms var(--ease-standard);
    }

    /* ~3 lines at 15.5px / 1.65 */
    .story.collapsed {
        max-height: 77px;
    }
```

Replace with:

```css
    .story {
        overflow: hidden;
        /* min-height, not max-height: once truncation replaces the clamp there is no
           overflow to cap, and a max-height cannot RESERVE space. Task 2 grows this to
           the story's full height before typing so the page does not shift while the
           reader reads. */
        transition: min-height 320ms var(--ease-standard);
    }
```

The `collapsed` class stays on the element — the script uses it as a state marker — but it no longer has a CSS rule.

- [ ] **Step 3: Delete the component's script**

In the same file, delete the **entire** `<script>` block starting at line 99 (`// One delegated handler animates every
story's expand/collapse via max-height.`) through its closing `</script>`. Its logic is re-homed in Step 4.

Do not leave an empty `<script></script>`. Remove the whole block.

- [ ] **Step 4: Add the reveal script to about.astro**

In `src/pages/about.astro`, add this as a **new** `<script is:inline>` block after the existing order-toggle script
block (the one ending with the `astro:after-swap` listener). Do not merge it into an existing block.

```astro
<script is:inline>
    if (!window.__storyRevealBound) {
        window.__storyRevealBound = true;

        const LINES = 3;   /* collapsed height, matching the 77px clamp this replaces */

        const state = new WeakMap();

        /* Flat character map over the story's text nodes. Walking text nodes (rather than
           slicing innerHTML) is what keeps <strong> and the bullet list in 09-solo-engineer
           intact. */
        const buildState = (story) => {
            const walker = document.createTreeWalker(story, NodeFilter.SHOW_TEXT);
            const nodes = [];
            let offset = 0;
            let node;
            while ((node = walker.nextNode())) {
                const full = node.nodeValue || '';
                nodes.push({node: node, full: full, start: offset, end: offset + full.length});
                offset += full.length;
            }
            /* Blocks that leave an artefact when emptied: an empty <p> still occupies a
               line, an empty <li> still paints its bullet via li::before. */
            const blocks = Array.from(story.querySelectorAll('p, ul, ol, li')).map((el) => {
                const inside = nodes.filter((n) => el.contains(n.node));
                return {
                    el: el,
                    start: inside.length ? inside[0].start : 0,
                    end: inside.length ? inside[inside.length - 1].end : 0
                };
            });
            return {nodes: nodes, blocks: blocks, total: offset, cut: offset, cursor: null, raf: 0, typing: false};
        };

        /* Restore text up to character `upto`; empty everything after. Returns the last
           node holding revealed text, which is where the cursor goes. */
        const reveal = (story, upto, ellipsis) => {
            const s = state.get(story);
            let tail = null;
            for (const item of s.nodes) {
                if (item.end <= upto) {
                    if (item.node.nodeValue !== item.full) item.node.nodeValue = item.full;
                    if (item.full.length) tail = item;
                } else if (item.start >= upto) {
                    if (item.node.nodeValue !== '') item.node.nodeValue = '';
                } else {
                    item.node.nodeValue = item.full.slice(0, upto - item.start);
                    tail = item;
                }
            }
            for (const b of s.blocks) {
                b.el.style.display = b.start >= upto && b.end > b.start ? 'none' : '';
            }
            if (ellipsis && tail) tail.node.nodeValue = tail.node.nodeValue + '…';
            return tail;
        };

        /* Top of the character at `index`, or null if it has no box (collapsed whitespace). */
        const rectTopAt = (s, index) => {
            for (const item of s.nodes) {
                if (index >= item.start && index < item.end) {
                    const range = document.createRange();
                    range.setStart(item.node, index - item.start);
                    range.setEnd(item.node, index - item.start + 1);
                    const rect = range.getBoundingClientRect();
                    return rect.height ? rect.top : null;
                }
            }
            return null;
        };

        /* First character index that falls below `lines` lines. Binary search, not a linear
           walk: tops increase monotonically down the flow, so this costs ~11 probes per
           story instead of ~2000. Nothing is mutated during the search, so the layout read
           stays cached. */
        const lineBoundary = (story, lines) => {
            const s = state.get(story);
            const lineHeight = parseFloat(getComputedStyle(story).lineHeight);
            if (!lineHeight) return s.total;
            let firstTop = null;
            for (let i = 0; i < s.total && firstTop === null; i++) firstTop = rectTopAt(s, i);
            if (firstTop === null) return s.total;
            const limit = firstTop + lines * lineHeight - 1;
            let lo = 0;
            let hi = s.total;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                const top = rectTopAt(s, mid);
                if (top === null || top <= limit) lo = mid + 1;
                else hi = mid;
            }
            return lo;
        };

        const truncate = (story) => {
            const s = state.get(story);
            reveal(story, s.total); /* measure against the full text */
            const boundary = lineBoundary(story, LINES);
            if (boundary >= s.total) {
                s.cut = s.total;
                return;
            }
            const full = s.nodes.map((n) => n.full).join('');
            const space = full.slice(0, boundary).lastIndexOf(' ');
            s.cut = space > 0 ? space : boundary;
            reveal(story, s.cut, true);
        };

        const expand = (story, button) => {
            const s = state.get(story);
            story.classList.remove('collapsed');
            button.textContent = 'Show less ↑';
            button.setAttribute('aria-expanded', 'true');
            reveal(story, s.total);
        };

        const collapse = (story, button) => {
            story.classList.add('collapsed');
            button.textContent = 'Read the story ↓';
            button.setAttribute('aria-expanded', 'false');
            truncate(story);
        };

        document.addEventListener('click', (event) => {
            const button = event.target?.closest('.story-toggle');
            if (!button) return;
            const story = button.closest('.story-card')?.querySelector('.story');
            if (!story || !state.has(story)) return;
            if (story.classList.contains('collapsed')) expand(story, button);
            else collapse(story, button);
        });

        /* Runs before paint so the full story never flashes; astro:after-swap covers
           View Transitions navigations, matching the other scripts on this page. */
        const initStories = () => {
            document.querySelectorAll('.story').forEach((story) => {
                if (!state.has(story)) state.set(story, buildState(story));
                if (story.classList.contains('collapsed')) truncate(story);
            });
        };
        initStories();
        document.addEventListener('astro:after-swap', initStories);

        /* The pre-paint pass measures with fallback font metrics, so the boundary is wrong
           until the web fonts swap in. Re-truncate once they land. The page already
           reflows on font swap, so this rides along invisibly. Only collapsed stories are
           re-cut, so a story the reader already expanded is left alone. */
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(initStories);
    }
</script>
```

Note on the current role: its `.story` has no `collapsed` class, so `initStories` leaves it fully revealed and its
`state.cut` stays at `total`. That is intended — the spec puts typing-on-load out of scope.

- [ ] **Step 5: Verify the build passes**

Run: `npm run check:build`
Expected: `[build] Complete!`, no TypeScript errors.

- [ ] **Step 6: Verify in a real browser**

Run `npm run dev -- --host 0.0.0.0` and open `/about`.

Expected observations:
1. Collapsed cards show roughly three lines ending in `…` — a clean word break, not a mid-word cut.
2. **No flash of the full story on load.** If you see one, the script is not running pre-paint.
3. Clicking "Read the story ↓" reveals the full text instantly (no typing yet — correct at this stage).
4. Clicking "Show less ↑" re-truncates.
5. Expand `09-solo-engineer` ("Solo Engineer Looking for Opportunities"): its **bullet list renders intact** with no
   stray bullets while collapsed.
6. At a narrow width (390px), collapsed cards are still ~3 lines — not 5–6.
7. The traveling dot still tracks correctly after expanding a card.

- [ ] **Step 7: Commit**

```bash
git add src/components/ExperienceCard.astro src/pages/about.astro
git commit -m "Truncating collapsed stories at a word boundary"
```

---

## Task 2: Height reservation and the typing engine

Adds the reveal animation. Two things carry the quality here: the box grows to full height **before** typing starts, and
the engine is a frame loop rather than a per-character timer.

**Why a frame loop is not optional:** the longest remainder is 1,796 chars (`06-teknika-backend-lead`, after the
measured 376-char teaser). At the 6s ceiling that is `dSteady ≈ 3.64ms` — under a quarter of a frame. A `setTimeout`
per character cannot go below ~4ms and would drift badly. The loop below consumes elapsed time against per-character
delays and reveals however many characters that buys: ~5 per frame on the longest story, ~1 per frame on the shortest
(`08-teknika-senior-engineer`, which lands under the ceiling and types at the full 12ms cadence).

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Add the cursor CSS**

In `src/pages/about.astro`'s `<style is:global>` block, add after the `.order-btn[aria-pressed='true']` rule:

```css
    /* The cursor is created by script, so it cannot live in ExperienceCard's scoped styles. */
    .type-cursor {
        display: inline-block;
        width: 0.5em;
        height: 1em;
        margin-left: 1px;
        vertical-align: text-bottom;
        background: var(--accent);
        animation: type-blink 1s steps(2, start) infinite;
    }

    .type-cursor.is-done {
        animation: none;
        opacity: 0;
        transition: opacity var(--dur-base) var(--ease-standard);
    }

    @keyframes type-blink {
        to {
            visibility: hidden;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .type-cursor {
            animation: none;
        }
    }
```

- [ ] **Step 2: Add the timing constants**

In the reveal script from Task 1, find:

```js
        const LINES = 3;   /* collapsed height, matching the 77px clamp this replaces */
```

Insert directly above it:

```js
        const D_TARGET = 12;       /* ms/char: the steady writing rate we aim for */
        const CEILING = 6000;      /* ms: hard ceiling on one reveal, no matter how long */
        const MAX_FRAME_MS = 50;   /* clamp a stalled frame so it cannot dump the story */
        const GROW_MS = 340;       /* the .story min-height transition is 320ms */
```

- [ ] **Step 3: Add the engine**

In the same script, insert these three functions directly above `const expand = (story, button) => {`:

```js
        const finish = (story) => {
            const s = state.get(story);
            if (s.raf) cancelAnimationFrame(s.raf);
            s.raf = 0;
            s.typing = false;
            reveal(story, s.total);
            story.style.minHeight = '';
            if (s.cursor) {
                const cursor = s.cursor;
                s.cursor = null;
                cursor.classList.add('is-done');
                setTimeout(() => cursor.remove(), 260);
            }
        };

        const placeCursor = (story, upto) => {
            const s = state.get(story);
            if (!s.cursor) return;
            let tail = s.nodes[0];
            for (const item of s.nodes) if (item.start < upto) tail = item;
            const parent = tail.node.parentNode;
            if (parent && s.cursor.previousSibling !== tail.node) {
                parent.insertBefore(s.cursor, tail.node.nextSibling);
            }
        };

        const type = (story) => {
            const s = state.get(story);
            /* The reader may have collapsed the card during the grow delay. */
            if (story.classList.contains('collapsed')) return;
            const from = s.cut;
            const N = s.total - from;
            if (N <= 0) {
                finish(story);
                return;
            }

            /* delay ramps dFast -> dSteady across the first third, then holds constant.
               Integrating that gives T = 11*N*dSteady/12, hence dSteady = 12T/(11N).
               Under the ceiling, dSteady resolves to exactly D_TARGET. */
            const T = Math.min(CEILING, (11 * N * D_TARGET) / 12);
            const dSteady = (12 * T) / (11 * N);
            const dFast = dSteady / 2;
            const delayAt = (i) => dFast + (dSteady - dFast) * Math.min(1, (i / N) * 3);

            s.cursor = document.createElement('span');
            s.cursor.className = 'type-cursor';
            s.cursor.setAttribute('aria-hidden', 'true');
            s.typing = true;

            let revealed = from;
            let acc = 0;
            let last = performance.now();
            const frame = (now) => {
                acc += Math.min(now - last, MAX_FRAME_MS);
                last = now;
                while (revealed < s.total && acc >= delayAt(revealed - from)) {
                    acc -= delayAt(revealed - from);
                    revealed++;
                }
                reveal(story, revealed);
                placeCursor(story, revealed);
                if (revealed >= s.total) {
                    finish(story);
                    return;
                }
                s.raf = requestAnimationFrame(frame);
            };
            s.raf = requestAnimationFrame(frame);
        };
```

- [ ] **Step 4: Reserve height, then type**

Replace the `expand` function from Task 1 entirely:

```js
        const expand = (story, button) => {
            const s = state.get(story);
            story.classList.remove('collapsed');
            button.textContent = 'Show less ↑';
            button.setAttribute('aria-expanded', 'true');

            /* Measure the full height by briefly revealing everything. This is synchronous
               and forces one reflow, so the browser never paints the revealed state. */
            reveal(story, s.total);
            const fullHeight = story.scrollHeight;
            reveal(story, s.cut, true);

            /* Reserve the space before typing so nothing below the card shifts while the
               reader reads. min-height needs an explicit start value — auto will not
               transition. */
            story.style.minHeight = story.offsetHeight + 'px';
            void story.offsetHeight;
            story.style.minHeight = fullHeight + 'px';

            setTimeout(() => type(story), GROW_MS);
        };
```

`setTimeout` rather than `transitionend`: `transitionend` never fires when the height happens not to change, which
would leave a card stuck showing only its teaser.

- [ ] **Step 5: Cancel typing on collapse**

Replace the `collapse` function from Task 1 entirely:

```js
        const collapse = (story, button) => {
            const s = state.get(story);
            if (s.raf) cancelAnimationFrame(s.raf);
            s.raf = 0;
            s.typing = false;
            if (s.cursor) {
                s.cursor.remove();
                s.cursor = null;
            }
            story.style.minHeight = '';
            story.classList.add('collapsed');
            button.textContent = 'Read the story ↓';
            button.setAttribute('aria-expanded', 'false');
            truncate(story);
        };
```

- [ ] **Step 6: Verify the build passes**

Run: `npm run check:build`
Expected: `[build] Complete!`, no TypeScript errors.

- [ ] **Step 7: Verify in a real browser**

Run `npm run dev -- --host 0.0.0.0` and open `/about`.

Expected observations:
1. Expanding a card grows the box **first**, then text streams in with a visible blinking cursor at the write head.
2. **Nothing below the card shifts while text types.** If the page pushes down continuously, height reservation failed.
3. The longest story (`06-teknika-backend-lead`, "Backend Team Lead" at Teknika) takes ~6s. The cursor fades when done.
4. The bullet list in `09-solo-engineer` types through intact — no stray bullets ahead of the write head.
5. The traveling dot is still aligned after expansion settles.
6. Collapsing mid-type stops it cleanly and re-truncates.

- [ ] **Step 8: Commit**

```bash
git add src/pages/about.astro
git commit -m "Writing out the hidden story with a terminal cursor"
```

---

## Task 3: Escape hatches

Three ways out, so an impatient reader is never trapped waiting.

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Skip the animation under reduced motion**

In the reveal script, find the start of `expand`:

```js
        const expand = (story, button) => {
            const s = state.get(story);
            story.classList.remove('collapsed');
            button.textContent = 'Show less ↑';
            button.setAttribute('aria-expanded', 'true');
```

Insert directly after the `aria-expanded` line:

```js

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                reveal(story, s.total);
                story.style.minHeight = '';
                return;
            }
```

Note: reduced motion still **truncates** when collapsed. Truncation is a disclosure, not an animation — hiding it
behind a motion preference would leave those readers with no collapsed state at all. Only the animation is skipped.

- [ ] **Step 2: Any click finishes a run in progress**

Replace the click handler from Task 1 entirely:

```js
        document.addEventListener('click', (event) => {
            const card = event.target?.closest('.story-card');
            if (!card) return;
            const story = card.querySelector('.story');
            if (!story || !state.has(story)) return;

            /* Mid-run, ANY click on the card finishes immediately — including one on the
               toggle, which must not collapse a card the reader is waiting to read. */
            if (state.get(story).typing) {
                finish(story);
                return;
            }

            const button = event.target?.closest('.story-toggle');
            if (!button) return;
            if (story.classList.contains('collapsed')) expand(story, button);
            else collapse(story, button);
        });
```

- [ ] **Step 3: Finish if the card scrolls out of view**

In the reveal script, replace `initStories` and its two call sites:

```js
        /* A card typing off-screen wastes frames and strands the reader with a
           half-written story when they scroll back. */
        const offscreenObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) return;
                const story = entry.target.querySelector('.story');
                if (story && state.has(story) && state.get(story).typing) finish(story);
            });
        }, {threshold: 0});

        const initStories = () => {
            document.querySelectorAll('.story').forEach((story) => {
                if (!state.has(story)) state.set(story, buildState(story));
                if (story.classList.contains('collapsed')) truncate(story);
            });
            document.querySelectorAll('.story-card').forEach((card) => offscreenObserver.observe(card));
        };
        initStories();
        document.addEventListener('astro:after-swap', initStories);
```

- [ ] **Step 4: Verify the build passes**

Run: `npm run check:build`
Expected: `[build] Complete!`, no TypeScript errors.

- [ ] **Step 5: Verify in a real browser**

Run `npm run dev -- --host 0.0.0.0` and open `/about`.

Expected observations:
1. Click a card mid-type: text completes instantly, cursor fades. The card does **not** collapse.
2. Expand a card and immediately scroll it off-screen; scroll back — it shows the full story, not a half-written one.
3. In DevTools, emulate `prefers-reduced-motion: reduce`, reload, and expand: text appears instantly, no cursor.
   Collapsed cards are **still truncated with `…`** — reduced motion does not disable the collapsed state.

- [ ] **Step 6: Commit**

```bash
git add src/pages/about.astro
git commit -m "Letting readers escape the story animation"
```

---

## Task 4: Version bump and pull request

This repo bumps `package.json` per semver in every PR. This adds a user-facing feature: **minor**, `1.2.0` → `1.3.0`.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Bump the version**

In `package.json`, change `"version": "1.2.0",` to `"version": "1.3.0",`.

Change **only** that line. If `git diff package.json` shows dependency changes, you have picked up unrelated drift —
stop and report it.

- [ ] **Step 2: Verify the build passes**

Run: `npm run check:build`
Expected: `[build] Complete!`, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Bumping version to 1.3.0"
```

- [ ] **Step 4: Audit the branch**

```bash
git diff --name-only dev..HEAD
```
Expected exactly: the two spec/plan docs, `package.json`, `src/components/ExperienceCard.astro`,
`src/pages/about.astro`, plus the earlier reading-direction docs. **Nothing under `src/content/`.**

```bash
git log dev..HEAD --format='%B' | grep -Ei "co-authored-by|claude|anthropic"
```
Expected: no matches.

- [ ] **Step 5: Push**

The branch `feat/about-timeline-reading-direction` already exists on the remote with an open draft PR (#20). This work
extends it. From the **main checkout** (a branch cannot be checked out in two worktrees at once — it is currently on
`dev`, which is where it should stay):

```bash
git -C /Users/joeinz/Workspace/personal/Projects/Web/personal-website \
  branch -f feat/about-timeline-reading-direction worktree-about-timeline
cd /Users/joeinz/Workspace/personal/Projects/Web/personal-website/.claude/worktrees/about-timeline
git push origin worktree-about-timeline:feat/about-timeline-reading-direction
```

Network calls in this environment need the sandbox disabled and may time out — retry up to three times.

- [ ] **Step 6: Update the PR body**

PR #20's description covers only the reading-direction work. Append the typing reveal:

```bash
gh pr edit 20 --body "$(cat <<'EOF'
The experience entries read as a story, but the timeline runs newest-first, so reading top-to-bottom meant reading the story backwards. The kicker also said `2019 → Today` while the list ran the other way.

Keeps newest-first as the default and makes the descent deliberate: start years descend down the rail, the kicker matches the order, a "How I got here" sub-header frames the history as a flashback, and each card carries a "Before that" cue.

Adds a `Latest first | Story order` toggle for readers who want the story in order. It persists in localStorage and flips direction text via a single CSS class, so no JavaScript rewrites strings.

Also reworks the "Read the story" expansion. Collapsed cards now truncate at a word boundary instead of being clipped mid-word, and expanding writes the hidden text out with a terminal cursor. The box grows to its full height before typing so nothing below shifts while you read. Readers can escape at any time: clicking finishes it, scrolling away finishes it, and reduced-motion skips it entirely.

Verified in a real browser at both widths: the traveling dot stays synced in both orders (zero drift), the leading card's cue is suppressed either way, and the stored order applies before first paint.

Design: `docs/superpowers/specs/2026-07-16-about-timeline-reading-direction-design.md`, `docs/superpowers/specs/2026-07-17-story-typing-reveal-design.md`
EOF
)"
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Word-boundary truncation replaces the 77px clamp | 1 (Steps 2, 4) |
| Teaser matches the collapsed height at any width | 1 (`lineBoundary`, measured — supersedes the spec's fixed 200/120 budgets, which measurement disproved; spec amended) |
| Boundary survives web-font swap | 1 (`document.fonts.ready` re-truncate) |
| Pre-paint truncation, no flash | 1 (`initStories()` called immediately in an `is:inline` script) |
| `TreeWalker` preserves `<strong>` / `<ul>` | 1 (`buildState`) |
| `aria-controls` completes the disclosure | 1 (Step 1) |
| Grow box first, then type | 2 (Step 4) |
| `min-height` reservation with explicit start value | 1 (Step 2 CSS), 2 (Step 4) |
| rAF accumulator engine | 2 (Step 3, `type`) |
| Curve: `dFast = dSteady/2`, ramp over first third | 2 (Step 3, `delayAt`) |
| `T = min(6000, 11·N·D_TARGET/12)`, `dSteady = 12T/(11N)` | 2 (Step 3) |
| Cursor at write head, blinks, fades on completion | 2 (Steps 1, 3) |
| Click to finish | 3 (Step 2) |
| `IntersectionObserver` auto-finish | 3 (Step 3) |
| `prefers-reduced-motion` skips | 3 (Step 1) |
| Current role does not type on load | 1 (no `collapsed` class → untouched; noted after Step 4) |
| Collapse stays instant | 2 (Step 5) |

No gaps.

**Placeholder scan:** none. Every step names exact files and shows the actual code.

**Type consistency:** `state` is a `WeakMap` keyed by the `.story` element, holding `{nodes, blocks, total, cut,
cursor, raf, typing}` — defined in Task 1 `buildState`, and every later reference (`s.cut`, `s.total`, `s.typing`,
`s.raf`, `s.cursor`) matches. `reveal(story, upto, ellipsis)` keeps its signature across Tasks 1–3. `finish`,
`placeCursor`, `type` are defined in Task 2 and consumed in Task 3. `.type-cursor` / `.is-done` are defined in Task 2
Step 1 and used in Task 2 Step 3.

**Ordering dependency:** Task 2 replaces `expand`/`collapse` wholesale from Task 1; Task 3 replaces the click handler
and `initStories` wholesale from Task 1. Execute in order.
