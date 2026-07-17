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
so the total is ceilinged at 6s (see Decisions).

The consequence must be stated plainly, because it shapes every other choice:

- Longest remainder = 1,796 chars (2,172 minus the measured 376-char teaser). In 6s that is ~300 chars/sec.
- At 60fps that is **~5 characters per frame**.
- A classic typewriter cadence is 30–60 chars/sec. People read at ~25 chars/sec.

So on the **two longest** stories the effect still reads as fast terminal output streaming in, not as someone typing.
1,796 characters cannot be written deliberately in six seconds; no parameter choice escapes that. The cursor is what
sells it as "being written". Two things follow:

1. **Per-character `setTimeout` is impossible.** The engine must be a frame loop that reveals a batch per frame — at
   `dSteady ≈ 3.64ms` the longest story needs ~5 characters per frame, and `setTimeout` cannot go below ~4ms.
2. **The writing feel is real on most of the set.** Two stories land under the ceiling and type at the full 12ms
   cadence; five more run brisk at 6.4–9.1ms/char. Only the two Teknika stories are compressed hard enough to stream.

### What the ceiling means today

Computed against the **measured** 376-char teaser (an earlier draft used a wrong 200-char teaser, which made every
story hit the ceiling and rendered the dynamic formula inert):

| story | remainder | wants @12ms/char | actual | dSteady | feel |
|---|---|---|---|---|---|
| 08-teknika-senior-engineer | 455 | 5.0s | **5.0s** | 12.00ms | writing — under the ceiling |
| 01-dubai-backend | 510 | 5.6s | **5.6s** | 12.00ms | writing — under the ceiling |
| 05-teknika-software-engineer | 721 | 7.9s | 6.0s | 9.08ms | brisk |
| 04-raineys-software-engineer | 839 | 9.2s | 6.0s | 7.80ms | brisk |
| 02-assistt-full-stack | 843 | 9.3s | 6.0s | 7.76ms | brisk |
| 09-solo-engineer | 977 | 10.7s | 6.0s | 6.70ms | brisk |
| 10-amek-senior-engineer | 986 | 10.8s | 6.0s | 6.64ms | brisk |
| 03-retavo-back-lead | 1,020 | 11.2s | 6.0s | 6.42ms | brisk |
| 07-teknika-dev-manager | 1,678 | 18.5s | 6.0s | 3.90ms | streams |
| 06-teknika-backend-lead | 1,796 | 19.8s | 6.0s | 3.64ms | streams |

**Two of ten run at the true 12ms writing cadence**, five are brisk (110–155 chars/s), and only the two long Teknika
stories are compressed hard enough to read as streaming. The dynamic formula earns its place: it produces real
variation across today's content, and a shorter role added later would type at the full writing cadence rather than
being padded to 6s.

## Decisions

| Question | Decision |
|---|---|
| Where does typing start? | Replace the 77px clamp with a word-boundary truncation, so the boundary is a known character index. No layout measurement of the cut. |
| Total duration | Dynamic, ceilinged at 6s. Aim for a 12ms/char steady writing rate; compress only when that would exceed 6s. The priority is the *feel of writing*, not finishing fast. |
| Speed curve | Fast, then settle to a steady pace. The opening burst is 2× the steady rate — quicker, but not a blur. Decelerates to a constant rate, never to a crawl. |
| Escape hatches | All three: click to finish instantly; `prefers-reduced-motion` skips entirely; auto-finish if scrolled out of view. |
| Teaser length | **Measured, not fixed.** Binary-search the character index where line 4 begins, then back off to a word boundary. Supersedes the "~200 desktop / ~120 mobile" budgets in an earlier draft — see below. |
| Screen readers | Collapsed content leaves the accessibility tree. Disclosure pattern completed with `aria-controls`. |

### Why the teaser is measured, not a constant — corrected during plan review

An earlier draft of this spec fixed the teaser at ~200 chars desktop / ~120 mobile, on the assumption that ~200 chars
is about three lines. **Measurement in a real browser disproved both numbers**, and the correction matters:

- At a 1440px viewport the `.story` box is **1118px** wide, and three lines hold **376 characters**. A 200-char teaser
  would show ~1.4 lines — a visible regression against today's clamp. (`77px ÷ 25.575px line-height = 3.01`, so 77px
  was indeed a 3-line design.)
- At a 390px viewport the `.story` box is **still 874px** wide. The card never narrows. This is a **pre-existing
  horizontal-overflow bug** on the site — the home page overflows too, and it is not caused by this work. So a
  "mobile" budget is currently meaningless, and hardcoding one would bake in a number derived from a broken layout,
  then silently regress the day the overflow is fixed.

Measuring the real 3-line boundary is both more correct and simpler: it deletes the responsive branch entirely and
reproduces today's collapsed height at any width, whatever the card is doing.

This does **not** reopen the rejected "measure the visual clamp cut" option. That one was rejected because the boundary
would be live and layout-dependent during typing. This measures **once**, at init, and still yields a fixed character
index — the property that made truncation attractive. Typing from that index stays exact and trivial.

The measurement is a binary search (~11 probes per story, since line tops increase monotonically down the flow), not a
linear walk over ~2,000 characters. It re-runs on `document.fonts.ready`, because the pre-paint pass measures with
fallback font metrics and would otherwise cut at the wrong place once the web font swaps in.

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
3. Binary-searches the character index where line 4 begins, backs off to the last word boundary before it, appends
   `…`, and empties the text nodes past the cut.

**Emptied text nodes are not enough on their own.** An empty `<p>` still occupies a line and an empty `<li>` still
paints its bullet via `li::before`, so any block whose text lies entirely past the cut must also be `display: none`.
Without this, a collapsed card shows blank lines and stray bullets under its teaser.

Running pre-paint avoids a flash of the full story. The `TreeWalker` approach preserves `<strong>` and `<ul>`/`<li>`
markup — only `09-solo-engineer.md` has a list, but it must survive.

The existing `.story.collapsed { max-height: 77px }` rule is removed; truncation replaces it.

### 2. Expand sequence

Order matters, and this is the part that most affects perceived quality:

1. **Grow the box to full height first** (~320ms), then
2. **Then** start typing into the settled box.

**The height mechanism changes, and this is easy to get wrong.** Today `.story.collapsed { max-height: 77px }` does
the clamping and `.story { transition: max-height 320ms }` animates it. Once truncation replaces the clamp, the
collapsed box is simply the natural height of the teaser, and `max-height` no longer reserves anything — a `max-height`
does not *force* a box to be tall, so the growth step would do nothing and the box would instead jump as text arrives.

Reservation must therefore use `min-height`:

1. Measure full height `H` from an offscreen clone carrying the full text.
2. Set `min-height` to the box's *current* height, force a reflow, then set `min-height: H` so the transition has an
   explicit start value (`auto` is not animatable). This mirrors the pattern the existing expand code already uses
   with `scrollHeight`.
3. Transition `min-height` over 320ms with `--ease-standard`. The box grows, empty below the teaser.
4. Type. Text fills the reserved space.
5. On completion, clear the inline `min-height` — natural height now equals `H`.

The `.story` transition property changes from `max-height` to `min-height` accordingly.

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

The opening burst is **2×** the steady rate (`dFast = dSteady / 2`). It was 3× in an earlier draft; that was softened
deliberately, because a 3× burst on a long story reaches ~15 chars/frame — a blur, which is the opposite of the feel
of writing.

Integrating the ramp plus the constant tail:

```
T = N·(dFast + dSteady)/6  +  2N·dSteady/3
```

Substituting `dFast = dSteady/2` gives `T = 11·N·dSteady / 12`, therefore:

```
D_TARGET = 12ms          // desired steady writing rate
CEILING  = 6000ms

T       = min(CEILING, 11·N·D_TARGET/12)
dSteady = 12T / (11N)
dFast   = dSteady / 2
```

This is self-consistent: when a story lands under the ceiling, `dSteady` resolves to exactly `D_TARGET`.

Worked examples, using the measured 376-char teaser:

- **1,796-char remainder** (`06-teknika-backend-lead`) — wants 19.8s, so `T` clamps to 6000ms; `dSteady ≈ 3.64ms`,
  `dFast ≈ 1.82ms`. Both far below one frame, which is exactly why the accumulator loop is required.
- **986-char remainder** (`10-amek-senior-engineer`) — wants 10.8s, clamps to 6000ms; `dSteady ≈ 6.64ms`,
  `dFast ≈ 3.32ms`. Brisk.
- **455-char remainder** (`08-teknika-senior-engineer`) — wants 5.0s, **under the ceiling**, so `T = 5005ms` and
  `dSteady = 12ms` exactly, `dFast = 6ms`. Roughly one character per frame: the writing feel, uncompressed.

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

- **Streaming, not typing** on the long stories. See above. Inherent to the 6s ceiling; no parameter choice escapes it.
- **Screen readers during the run.** Text is inserted progressively, so a screen reader that starts reading the
  instant the toggle is activated could encounter partial text. Bounded at 6s, and screen-reader reading is far slower
  than even the slowest steady rate here (~83 chars/sec at the uncompressed 12ms cadence), so the text lands well
  before it is reached. Reduced-motion
  users skip the animation entirely.
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
