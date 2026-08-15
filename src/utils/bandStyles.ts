/**
 * Class strings shared by src/components/projectpage/BandPage.astro and the band components it
 * renders. No types — the module exports one const, and calling it a type sent
 * a reader looking for something that was never here.
 *
 * Only what genuinely crosses the file boundary lives here; the rest of the
 * page's rhythm constants stay hoisted at the top of BandPage, where they are
 * read alongside the bands that use them.
 */

/**
 * A band's own H2: Literata 44, one step down before there is room for it.
 *
 * Two files draw it. The five split bands go through BandHeader; the full-width
 * ones — the deep dive, the gallery, the assurance cards, and the configuration
 * band when it is promoted — set their own H2 beside content BandHeader does not
 * model. One declaration so the two cannot drift, which is what happened to the
 * margins these headings used to carry.
 */
export const bandHeading =
  'font-display text-4xl md:text-[44px] font-semibold text-strong leading-tight';
