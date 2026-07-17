# Story Typing Reveal — Design

**Date:** 2026-07-17
**Status:** Approved, not yet implemented
**Builds on:** `2026-07-16-about-timeline-reading-direction-design.md`

## Goal

When a reader clicks "Read the story ↓" on an About page experience card, the previously hidden part of the story is
written out with a terminal-style cursor, rather than appearing instantly.

## The central constraint: this streams, it does not type

Stories are long. Measured from `src/content/experiences/*.md`:

| story | chars | @12ms/char (classic typewriter) |
|---|---|---|
| 06-teknika-backend-lead | 2,172 | 26.1s |
| 07-teknika-dev-manager | 2,054 | 24.6s |
| 10-amek-senior-engineer | 1,362 | 16.3s |
| 08-teknika-senior-engineer | 831 | 10.0s |

A typewriter **gates reading** — the reader cannot read faster than the animation. A 26-second gate is unacceptable,
so the total is capped at ~3s (see Decisions).

The consequence must be stated plainly, because it shapes every other choice:

- Longest remainder ≈ 1,972 chars (2,172 minus the ~200-char teaser). In 3s that is ~660 chars/sec.
- At 60fps that is **~11 characters per frame**.
- A classic typewriter cadence is 30–60 chars/sec. People read at ~25 chars/sec.

So this effect reads as **fast terminal output streaming in** (like `cat`-ing a file), not as someone typing. The
cursor is what sells it as "being written". This was accepted knowingly. Two things follow:

1. **Per-character `setTimeout` is impossible.** The engine must be a frame loop that reveals a batch per frame.
2. Nobody should expect a slow, deliberate keystroke rhythm on the long stories. The short ones (~631-char remainder,
   ~210 chars/sec) are the only ones where individual characters are perceptible.

## Decisions

| Question | Decision |
|---|---|
| Where does typing start? | Replace the 77px clamp with a word-boundary truncation, so the boundary is a known character index. No layout measurement of the cut. |
| Total duration | Capped: `min(3000ms, N × 6ms)`. Speed adapts to length; every card feels the same. Short remainders finish early rather than being dragged out to fill 3s. |
| Speed curve | Fast, then settle to a steady pace. Decelerates to a constant rate, never to a crawl. |
| Escape hatches | All three: click to finish instantly; `prefers-reduced-motion` skips entirely; auto-finish if scrolled out of view. |
| Mobile truncation | Responsive: ~200 chars desktop, ~120 chars mobile. |
| Screen readers | Collapsed content leaves the accessibility tree. Disclosure pattern completed with `aria-controls`. |

### Why responsive truncation

Today's `max-height: 77px` yields ~3 lines at *any* width. A fixed ~200 chars is ~3 lines on desktop but ~5–6 lines
on mobile, which would visibly grow mobile cards. A responsive count preserves the existing ~3-line intent at both
breakpoints.

### Why the screen-reader change is acceptable

Today `overflow: hidden` clips the story visually but leaves it in the accessibility tree — a screen reader reads the
entire story while the card *looks* collapsed, and the toggle's `aria-expanded` state is a lie. Truncating removes the
text until expand, which is the standard disclosure behavior and matches `aria-expanded`. This is a fix, not a
regression. The toggle gains `aria-controls` pointing at the story region to complete the pattern.

## Architecture

### 1. Collapsed state

An `is:inline` script runs **pre-paint** (the pattern already established by the theme setup in `BaseLayout.astro` and
the order toggle in `about.astro`) and, for each collapsed story:

1. Walks text nodes with a `TreeWalker`, building a flat character map `[{node, start, end, text}]`.
2. Caches each node's full text.
3. Truncates at the last word boundary at or before the budget (200 desktop / 120 mobile), appends `…`, and empties
   the text nodes past the cut.

Running pre-paint avoids a flash of the full story. The `TreeWalker` approach preserves `<strong>` and `<ul>`/`<li>`
markup — only `09-solo-engineer.md` has a list, but it must survive.

The existing `.story.collapsed { max-height: 77px }` rule is removed; truncation replaces it.

### 2. Expand sequence

Order matters, and this is the part that most affects perceived quality:

1. **Grow the box to full height first**, reusing the existing 320ms `max-height` transition. Full height is obtained
   by measuring an offscreen clone carrying the full text.
2. **Then** start typing into the settled box.

Text fills a pre-sized area instead of pushing the page down for three seconds. Two consequences: no continuous layout
shift while the reader is reading, and the timeline rail re-syncs **once** after expansion rather than every frame for
3s. (The page has a `ResizeObserver` on `documentElement` driving the traveling dot; letting the card grow for 3s
would churn it continuously.)

### 3. The engine

A `requestAnimationFrame` loop with a delay accumulator:

```
acc += dt
while (revealed < N && acc >= delayAt(revealed)) { acc -= delayAt(revealed); revealed++ }
```

This reveals however many characters the elapsed time buys — 1 on short stories, ~11 on the longest — and is
frame-rate independent. Revealing means restoring `textContent` on the mapped text nodes up to `revealed`.

### 4. The speed curve

Per-character delay ramps linearly from `dFast` to `dSteady` across the first third of characters, then holds
constant:

```
p     = i / N
ramp  = min(1, p / (1/3))
delay = dFast + (dSteady - dFast) * ramp
```

With `dFast = dSteady / 3`, integrating gives total `T = 8·N·dSteady / 9`, therefore:

```
dSteady = 9T / (8N)
dFast   = dSteady / 3
```

Worked example — 1,972-char remainder, `T = 3000ms`: `dSteady ≈ 1.71ms`, `dFast ≈ 0.57ms`. Both far below one frame,
which is exactly why the accumulator loop above is required.

### 5. Cursor

A single block `<span>` at the write head, moved to follow the current text node, blinking via a CSS animation using
`--accent`. It fades out on completion — ten cards each left with a permanently blinking cursor would be noise.

### 6. Escape hatches

- **Click** anywhere on the card (or the toggle again) finishes instantly: restore all text, remove cursor.
- **`IntersectionObserver`** — if the card leaves the viewport mid-run, snap to full text.
- **`prefers-reduced-motion`** — no typing and no truncation; stories render in full, and the toggle expands
  instantly. This is non-negotiable and matches the repo's existing motion policy (`global.css:100`).

## Design system constraints

- Motion tokens: `--ease-standard: cubic-bezier(.22,.61,.36,1)`, `--dur-fast: 120ms`, `--dur-base: 220ms`,
  `--dur-slow: 420ms`. The cursor blink and fade use these; the typing curve is computed in JS (no token maps to it).
- Cursor colour: `--accent`. Never hard-code palette values.
- Reuse the existing `.story-toggle` button and `.story` container; do not introduce a parallel component.

## Known limitations, accepted

- **Streaming, not typing** on long stories. See above. Inherent to the 3s cap.
- **Screen readers during the run.** Text is inserted progressively, so a screen reader that starts reading the
  instant the toggle is activated could encounter partial text. Bounded at 3s, and screen-reader reading is slower
  than 660 chars/sec, so the text lands well before it is reached. Reduced-motion users skip the animation entirely.
- **Find-in-page** will not match text that has not been typed yet, and will not match collapsed text at all
  (it is not in the DOM). Same as any disclosure widget.

## Out of scope

- Typing on the current role's card, which is expanded by default on load. It renders in full, no animation.
- Reverse animation on collapse ("Show less ↑") — collapse stays instant.
- Any change to the reading-order toggle, the rail, or `DOT_CENTER_OFFSET`.

## Verification

No test framework; `npm run check:build` is the gate, plus a live browser pass (the previous feature shipped a bug
that only a real browser caught — `dist/` inspection is not sufficient).

1. `npm run check:build` passes.
2. Collapsed cards show ~3 lines ending in `…` at desktop and mobile widths.
3. Expanding: box grows first, then text streams in with a visible cursor; total ≈3s on the longest story, less on
   short ones.
4. No layout shift below the card while typing (box is pre-sized).
5. The traveling dot stays synced after expansion.
6. Clicking mid-run finishes instantly. Scrolling away mid-run snaps to full text.
7. Under `prefers-reduced-motion`, stories are never truncated and expansion is instant.
8. `09-solo-engineer.md`'s bullet list survives truncation and typing intact.
9. The toggle's `aria-expanded` matches reality, and `aria-controls` resolves to the story region.
