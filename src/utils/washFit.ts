/**
 * Whether a washed heading phrase fits the narrowest viewport the site supports.
 *
 * A `.marker-wash` phrase cannot wrap. The class paints one absolutely-positioned
 * rectangle across the whole span, so a phrase broken over two lines draws a
 * caramel block across the text between them — which is why both washed headings
 * in src/components/projectpage/BandPage.astro set the span `whitespace-nowrap`.
 *
 * An un-wrappable phrase is exactly as wide as its glyphs make it, and nothing
 * downstream can rescue an over-long one. The clamp on those headings floors at
 * 30px because that is the smallest the design allows; below it the heading stops
 * being a heading. So at 320px the phrase either fits or it runs off the screen,
 * and a schema that admits an over-long wash is a schema that admits a broken
 * page. Measured: a legal 36-character closing wash produced 278px of real
 * document overflow — scrollWidth 598 against a 320px viewport.
 *
 * A character count cannot express this bound, because width follows case far
 * more than length. At the floor, and computed from the table below: "knows the
 * hour" (14 characters) is 240px and fits, while "ZERO OVERHEAD" — one character
 * SHORTER — is 291px and overflows the 250px budget by 41px. So the bound is on
 * width, computed from the metrics below.
 *
 * Both figures are derived from ADVANCE_GROUPS, not remembered. An earlier
 * version of this paragraph offered "knows the hours" (15) as the example that
 * fits; it is 255px and fails, so an author copying it got a build error from
 * the sentence explaining the rule. Recompute rather than edit these.
 *
 * Scope, stated because it is narrower than it looks: the table covers ASCII
 * letters, digits and the punctuation these headings use. Anything else — an
 * accented letter, a non-Latin script, an emoji — is charged as the widest glyph
 * in the face, so it is rejected sooner than it strictly needs to be rather than
 * let through unmeasured.
 */

/**
 * Advance width, in px, of one character at the binding condition: 600 weight,
 * 30px, Georgia, -0.015em tracking.
 *
 * Georgia and not Fraunces because Fraunces loads with `display=swap`, so Georgia
 * — the next family in the display stack — is what paints the phrase until the
 * webfont arrives, and it is the wider of the two. 30px because that is the clamp
 * floor, which is what applies at 320px.
 *
 * Measured in Chrome by advancing a 20-character run of each glyph and dividing,
 * then raised to the next whole px so that summing them can only over-state a
 * phrase, never under-state it. Summing advances is exact here rather than
 * approximate: checked against "knows the hour", "ZERO OVERHEAD", "MADE FOR
 * SPEED", "Works Everywhere" and "system", the sum matched the rendered
 * getBoundingClientRect().width to 0.0px every time — this face applies no
 * kerning pairs at this size.
 */
const ADVANCE_GROUPS: ReadonlyArray<readonly [string, number]> = [
  [" '’", 8], ['.,lj', 10], ['i:;!-', 11], ['ft', 12], ['I()', 13],
  ['1s', 15], ['rzc?', 16], ['7yveg', 17], ['xJa5', 18], ['32kob69q', 19],
  ['S4pdF8uh', 20], ['TLZn0P', 21], ['CEY', 22], ['BAV', 23], ['R&GX', 24],
  ['KOQUDN', 25], ['w', 26], ['H', 27], ['—', 28], ['mM', 31], ['W', 34]
];

const ADVANCE = new Map<string, number>(
  ADVANCE_GROUPS.flatMap(([chars, px]) => [...chars].map((c) => [c, px] as const))
);

/** The widest glyph in the face, and what an unmeasured character is charged. */
const WIDEST_PX = 34;

/**
 * How much room the phrase has.
 *
 * At 320px — the narrowest viewport this site is verified at — `.shell` leaves a
 * 272px content box (320 less 24px of padding a side). `.marker-wash` spends 20px
 * of that on its own horizontal padding, which leaves 252px of text. The budget
 * keeps two of those in hand against sub-pixel rounding.
 */
export const WASH_BUDGET_PX = 250;

/** Rendered width of a washed phrase at the clamp floor, in px. */
export function washWidthAtFloor(phrase: string): number {
  let total = 0;
  for (const char of phrase) total += ADVANCE.get(char) ?? WIDEST_PX;
  return total;
}

/** Whether a washed phrase fits the shell at 320px in the fallback face. */
export function washFits(phrase: string): boolean {
  return washWidthAtFloor(phrase) <= WASH_BUDGET_PX;
}
