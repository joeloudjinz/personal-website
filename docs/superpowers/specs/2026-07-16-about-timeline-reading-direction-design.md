# About Timeline: Reading Direction — Design

**Date:** 2026-07-16
**Status:** Approved, not yet implemented

## Problem

The ten entries in `src/content/experiences/` are written as narrative prose — chapters of a story. The About page
renders them newest-first, so reading top-to-bottom means reading the story backwards.

This is not a subjective impression; the arc is literal:

- `01-dubai-backend.md` opens with "My professional journey began right after university" — a story's first line.
- `10-amek-senior-engineer.md` closes with "This chapter is still being written" — a story's last line.

Top-to-bottom, the reader gets the ending first and the opening last.

Two supporting problems surfaced during investigation:

1. **The page contradicts itself.** The kicker in `src/pages/about.astro` reads `2019 → Today · 10 roles` while the
   list beneath it runs Today → 2019. The label promises forward motion the order does not deliver.
2. **The story is opt-in and fragmented.** Every non-current card is clamped to ~3 lines behind a "Read the story ↓"
   toggle, so continuous narrative reading is not currently possible. (Out of scope here — see below.)

## Constraints

- **Newest-first stays the default.** Every visitor lands on newest-first. This serves recruiters, who want the
  current role first, and is non-negotiable.
- **A reader-controlled toggle to chronological order is permitted** as an opt-in layer.
- **Content copy may change**, with one hard exception below.

### Hard constraint: no directional connectives in markdown

Because a toggle can flip the order, any directional language baked into the markdown bodies ("Before that…",
"Earlier…") becomes wrong the moment a reader flips to story order. **Directional language must live in the component**,
where it can flip with the order. Copy being fair game does not extend to connectives.

## Approach

Phased. Phase 1 is framing and helps 100% of visitors with zero interaction. Phase 2 is the toggle and helps only
those who find it. Phase 1 ships first and stands alone: if Phase 2 never ships, the page still reads correctly.

## Phase 1 — Framing (no JavaScript)

### 1. Years on the rail

Each entry's rail column gains a small muted start year above its dot, descending 2026 → 2019. This is the
load-bearing cue: descending numbers make direction unmistakable before a single word is read.

Desktop only (`hidden md:block`). The mobile gutter is 28px and the card meta line already carries dates.

**Geometry (measured, not assumed):** "2026" at ~11px tabular Inter is ~26px wide and fits the **existing** 48px md
gutter. The gutter does **not** need widening. Therefore `about.astro`'s hardcoded rail geometry — line
`left-[13px] md:left-[23px]`, marker `left-[7px] md:left-[17px]`, and `DOT_CENTER_OFFSET = 55` — is **unchanged**.

The year must sit inside the rail column's existing 48px of top padding so the dot does not move:

| Breakpoint | Rail column padding | Year | Gap | Dot top | Dot center |
|---|---|---|---|---|---|
| mobile (year hidden) | `pt-12` = 48px | — | — | 48px | 55px |
| md (year shown) | `pt-6` = 24px | ~14px | 10px | 48px | 55px |

Rail column classes become `pt-12 md:pt-6`; the year element is `hidden md:block mb-[10px]` with tight leading.
`DOT_CENTER_OFFSET` stays 55 at both breakpoints, so the traveling dot stays synced.

**Year source:** first four characters of `startDate` (the role's start year).

**Repeated years are accepted, deliberately.** Start years are 2026, 2025, 2025, 2024, 2023, 2023, 2023, 2022, 2021,
2019 — three roles began in 2023. The rail will show `2023` three times. This is kept rather than suppressed because:

- Suppressing repeats cannot survive the Phase 2 reversal without JS (which occurrence is "first" flips with order).
- The stutter is honest signal: three roles in 2023 shows progression velocity at Teknika.
- Non-increasing years still read unambiguously as a descent.

### 2. Kicker corrected

In `src/pages/about.astro`, `2019 → Today · {n} roles` becomes `Today → 2019 · {n} roles`, so the label matches the
list. Phase 2 makes this direction-aware.

### 3. Flashback frame

A `How I got here` sub-header is inserted after the first entry, turning everything below it into an explicit
retrospective. Backwards reading becomes intentional rather than broken.

It renders in the **content column**, not the rail, so the rail runs unbroken from first dot to last. It is a sibling
of the `.timeline-entry` nodes, which matters for Phase 2 (see below).

Entries are **not** structurally split into `[current, ...rest]`. All ten render in the existing loop. The "Now" hero
treatment largely exists already — `ExperienceCard` renders a `Current` badge and the current role's story is expanded
by default — so this reduces to emphasis on the existing card, not new structure.

### 4. Direction cue

Non-leading cards get a "Before that" chip. It is rendered CSS-driven, with both variants present:

```html
<span class='cue-back'>Before that</span><span class='cue-forward'>Then</span>
```

`.cue-forward` is hidden by default; `.order-story .cue-back` hides and `.order-story .cue-forward` shows. Phase 2
then only toggles one class — no JS rewriting strings.

The cue is hidden on `.timeline-entry:first-child`. This is self-correcting: the leading card suppresses its own cue
in **either** order, with no position logic and no JS.

## Phase 2 — Toggle

A `Latest first | Story order` segmented control near the section header, defaulting to `Latest first`. The choice
persists in `localStorage`, following the existing theme-persistence pattern, and re-applies on
`astro:after-swap` / `astro:page-load` with window guards per the repo's View Transitions conventions.

Selecting `Story order`:

1. Adds `.order-story` to `#experienceTimeline` — flips the cue chips via CSS (Phase 1 already built this).
2. **Reverses the `.timeline-entry` DOM nodes.** Must move actual nodes, selecting `.timeline-entry` only so the
   `How I got here` sub-header is not swept into the reversal.
3. Hides the `How I got here` sub-header via `.order-story` — the flashback frame is meaningless in chronological
   order, where the current role is last.
4. Flips the kicker to `2019 → Today`.
5. Re-runs the rail's `update()`.

**Reversal must move DOM nodes, not use CSS `column-reverse`.** The rail script pairs `querySelectorAll` (DOM order)
with `offsetTop`; `column-reverse` would desync visual and DOM order and silently break the traveling-dot math.

## Out of scope

- **The 3-line clamp** truncates prose mid-sentence, which is itself anti-story. A curated one-line teaser per entry
  in frontmatter would make scan mode read as chapter blurbs. Real improvement, separate concern from direction; this
  is the next thing to fix.
- **Chapter counters** ("Chapter 10 of 10") — considered and dropped as gimmicky given the rail years already carry
  direction.
- **Reordering the default** — explicitly ruled out by the constraints.

## Verification

No test framework is configured; `npm run check:build` is the primary gate.

1. `npm run check:build` passes.
2. Dev server pass: the traveling dot tracks correctly at mobile and desktop widths.
3. Rail years render descending on desktop, hidden on mobile.
4. The leading card shows no cue chip; all others do.
5. Phase 2 only: flipping to story order reverses entries, hides the sub-header, flips cues and kicker, and leaves
   the traveling dot synced. Selection survives a reload and a View Transitions navigation.
