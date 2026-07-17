# Mobile Header + Footer Socials — Design

**Date:** 2026-07-17
**Status:** Approved (via visual companion), not yet implemented

## Problem

The site header (`src/layouts/components/Header.astro`) is a single non-wrapping flex row — logo, nav links, two
social icons, and a Light/Dark text toggle — with **no mobile layout**. Below ~554px of content width it overflows;
at 390px the theme toggle sits off-screen at x=527, forcing horizontal scroll on every page. (This is separate from
the tag-line overflow already fixed in `885154b`; with the header hidden, the page fits 390px exactly.)

## Decisions (confirmed via mockups)

**Approach A — slide-down menu**, below the `md` (768px) breakpoint. Desktop (≥768px) is unchanged.

| Aspect | Decision |
|---|---|
| Mobile bar layout | logo (left) · centered group (right) · hamburger — where the centered group is **GitHub · LinkedIn · theme switch** |
| Nav links on mobile | move into a slide-down panel opened by the hamburger |
| Theme switch | keep its two-segment pill; **text → SVG sun + full moon**; **icon + text on desktop, icon-only on mobile** |
| Social icons | GitHub + LinkedIn, real SVG marks, monochrome (ink light / cream dark) — as the header already ships them |
| Footer | add the same GitHub + LinkedIn icons, **centered**, at all widths |
| Scope | header centered-group is **mobile-only**; footer socials apply at **all widths** |

## Architecture

### Single responsive right-group (no duplication)

The mobile "centered" and desktop "right" positions are the **same element**, repositioned with flex auto-margins —
avoiding a duplicated theme toggle (and the duplicate-id hazard). Bar structure:

```
<nav class="flex items-center gap-4">
  <a logo>                                   shrink-0, always
  <div nav-links   class="hidden md:flex md:mx-auto">   desktop only, centered
  <div right-group class="mx-auto md:mx-0">  socials + switch: centered on mobile, pushed right on desktop
  <button hamburger class="md:hidden">       mobile only
</nav>
```

- **Mobile** (nav-links hidden, hamburger shown): `logo · [right-group mx-auto → centered] · hamburger`.
- **Desktop** (hamburger hidden): nav-links `md:mx-auto` takes the auto-space, pushing the right-group to the far
  right — reproducing today's `justify-between` layout exactly.

### Theme switch

One instance, class-based (`.theme-toggle`) — the existing `#themeToggle` script already uses
`querySelectorAll`/`closest`, so switching id→class is safe and future-proofs multiple instances. Each segment gets an
inline SVG (sun / full moon) plus a label span marked `hidden md:inline` (icon-only below md, icon+text at md+). The
full moon is a `currentColor` disc with three low-opacity craters so it never reads as a plain dot. Segment padding
tightens on mobile.

### Slide-down panel

A block below `<nav>` inside `<header>`, `md:hidden`, containing the four nav links stacked vertically. Toggled by the
hamburger. Since `<header>` is `sticky top-0`, the panel pushes content down (slide), not an overlay.

**Accessibility (required):**
- Hamburger: `aria-expanded`, `aria-controls="mobileMenu"`, `aria-label`. Panel: `id="mobileMenu"`.
- Open moves focus to the first link; close returns focus to the hamburger.
- `Escape` closes; a click outside the header closes.
- Closes on navigation (`astro:page-load`) so it's never left open after a View-Transitions route change.
- Respects `prefers-reduced-motion` (no slide animation; instant show/hide).

### New component

`SocialLinks.astro` — renders the GitHub + LinkedIn `<a>` links with the existing ink/cream `<Image>` icon pairs
(from `@src/assets/img/*.svg`, using `GITHUB_ACCOUNT` / `LINKEDIN_ACCOUNT` from `consts`). Reused in the header
right-group and the footer, so the markup lives in one place. A `gap` / size prop keeps header vs footer sizing tidy.

### Footer

`src/layouts/components/Footer.astro` becomes a three-part row: Byline (left) · `SocialLinks` (center) · copyright
(right). It already uses `flex-col sm:flex-row items-center justify-between`; the centered socials slot in the middle
and stack cleanly on mobile.

## Out of scope

- Desktop header appearance — unchanged.
- The tag-line / grid overflow — already fixed (`885154b`).
- Any nav content change (same four links: Home, About, Projects, Posts).

## Verification

No test framework; `npm run check:build` plus a real-browser pass (this branch has repeatedly shipped bugs only a live
browser caught — `dist/` inspection is insufficient).

1. `npm run check:build` passes.
2. At 390px and 360px: **no horizontal scroll** on `/`, `/about`, `/projects`, `/posts`. `document.scrollWidth <= innerWidth`.
3. Mobile bar: logo left, GitHub·LinkedIn·switch centered, hamburger right. Switch is icon-only.
4. Hamburger opens/closes the panel; Esc, outside-click, and navigation all close it; focus moves in and returns.
5. Desktop (≥768px) header is visually identical to before — switch shows icon **+** text, no hamburger, no panel.
6. Theme toggle still flips theme + persists, in both mobile and desktop forms; sun shows in light, full moon in dark.
7. Footer shows centered GitHub + LinkedIn at desktop and mobile, both themes.
8. Full moon renders as a craters disc, not a plain dot; icons recolor correctly in light and dark.
