/**
 * Whether a project page's section nav fits the header it sits in.
 *
 * The subdomain header is a single row: the logo, the project name, the section
 * links, the back link, the social marks and the theme toggle. Everything in it
 * is `shrink-0` or as wide as its own text, so a row that asks for more than the
 * bar holds does not reflow — it pushes the document wider and the page scrolls
 * sideways at every width below the one it broke at.
 *
 * Which sections appear is the entry's decision, so this is the check that keeps
 * "project #2 costs one markdown file" true of the nav as well: an author who
 * labels one band too many gets a build error naming the overflow in pixels,
 * rather than a header that has quietly stopped fitting.
 *
 * A character count cannot express the bound, for the reason src/utils/washFit.ts
 * gives at length about the washed headings: width follows case, not length.
 * "Prayer times" (12 characters) is 94px and "Verification" (12) is 86px, while
 * "FAQ" (3) is 30px and "Why" (3) is 33px. So the schema caps each label at 14
 * characters to stop a heading being pasted into a nav item, and the row is added
 * up here in pixels.
 */

/**
 * Advance width, in px, of one character at the binding condition: Readex Pro,
 * 600 weight, 15px.
 *
 * 600 rather than the 500 the links are set in, because the current section's
 * link is drawn semibold and any of them can be the current one — so the widest
 * state the row ever reaches is every label at 600. The webfont rather than a
 * fallback face: unlike the hero's wash, this row is chrome that wraps nothing
 * and moves nothing while the webfont swaps.
 *
 * Measured 2026-08-15 in Chromium, the way washFit.ts arrives at its own numbers
 * — a 20-character run of each glyph in a span sized to its own text and with
 * kerning off, divided by 20 — then raised to the next half pixel, so summing
 * them can only over-state a row and never under-state it. The check
 * `document.fonts.check("600 15px 'Readex Pro'")` answered true before a width
 * was read, so these are the webfont's own advances and not a fallback's.
 *
 * Checked against eleven candidate labels: the sum runs from 2.0% generous at
 * the tightest, "Why", to 6.6% at the loosest, "FAQ", and is never short of what
 * the browser draws. Kerning only ever narrows, so the direction of the error is
 * the safe one.
 */
const ADVANCE_GROUPS: ReadonlyArray<readonly [string, number]> = [
  ['.:\'·', 4], [',!l', 4.5], [' ij', 5], ['ft()', 6], ['-', 6.5],
  ['r', 7], ['s', 7.5], ['zI?', 8], ['ac127', 8.5], ['evx+/35689', 9],
  ['hknouyFLST', 9.5], ['bdgpqEJP04', 10], ['ABCYZ', 10.5], ['RVX', 11],
  ['DKU&', 11.5], ['GH', 12], ['NOQw', 12.5], ['M', 13.5], ['m', 14.5],
  ['W', 15]
];

const ADVANCE = new Map<string, number>(
  ADVANCE_GROUPS.flatMap(([chars, px]) => [...chars].map((c) => [c, px] as const))
);

/**
 * What an unmeasured character is charged.
 *
 * Wider than every glyph in the measured set — W, the widest, is 15 — so a
 * character the set does not cover is over-charged rather than let through
 * cheap, and the guard keeps erring towards rejecting a row it could have
 * held.
 */
const WIDEST_PX = 16;

/**
 * The gap between two links, in px — the `gap-7` the row is drawn with.
 *
 * Between the main site's `gap-6` at its narrow end and its `gap-9` at its wide
 * one, because this row appears at one breakpoint rather than growing through
 * two, and it shares its bar with more than the main site's nav does.
 */
const NAV_GAP_PX = 28;

/**
 * How much room the row has.
 *
 * Measured on the built page at 1280, which is the narrowest viewport the nav is
 * drawn at and therefore the one that binds. The nav content box is 1088px there
 * (1280 less the shell's 96px a side); the logo, the divider, the project name
 * and the right-hand cluster take 575px of it including the three 16px gaps
 * between them, which leaves 513px; the row is a fourth flex child and so brings
 * a fourth gap, and the divider between light and dark logos costs 2px more.
 *
 * 480 keeps the remainder in hand. It is not slack that can be spent: the project
 * name is capped at 12 characters and this entry's is 5, so a longer one eats
 * into the same 513px from the other side.
 */
export const NAV_BUDGET_PX = 480;

/** Rendered width of one nav label, in px. */
export function navLabelWidth(label: string): number {
  let total = 0;
  for (const char of label) total += ADVANCE.get(char) ?? WIDEST_PX;
  return total;
}

/** Rendered width of the whole row, labels and the gaps between them. */
export function navRowWidth(labels: readonly string[]): number {
  if (labels.length === 0) return 0;
  const text = labels.reduce((total, label) => total + navLabelWidth(label), 0);
  return text + NAV_GAP_PX * (labels.length - 1);
}

/** Whether the row fits the header's centre at the width it first appears at. */
export function navRowFits(labels: readonly string[]): boolean {
  return navRowWidth(labels) <= NAV_BUDGET_PX;
}
