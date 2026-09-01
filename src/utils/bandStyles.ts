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

/**
 * A band's outer section, and the shell inside it.
 *
 * Full-width so the hairline runs edge to edge, with the 96px side padding
 * coming from .shell within. The hero opens the page against the header's own
 * bottom rule, so only the bands after it carry a top one — which also means an
 * absent optional band leaves no orphan rule behind it.
 *
 * The anchor clearance is on every band rather than only the ones something
 * links to today, because every band carries an id: the ids come from
 * BAND_ANCHORS, which is also what decides whether an "#href" is legal, so a
 * band that renders is a band that can be jumped to. It reads the token shared
 * with article headings rather than restating the number — see --anchor-offset
 * in global.css for what it is made of.
 *
 * Here rather than hoisted in BandPage because the long-form band moved out into
 * FeatureBand.astro, which draws its own section and needs the identical pair. A
 * second copy is a second place for the rhythm to drift.
 */
export const band = 'border-t border-hairline scroll-mt-[var(--anchor-offset)]';
export const bandInner = 'shell py-[72px]';

/**
 * Reading copy — the standfirsts and intros a visitor reads through, as opposed
 * to the muted register that labels and notes are set in.
 *
 * Shared for the same reason as `band`: the long-form band sets its standfirst
 * in it from another file, and this is the line between "read this" and "this
 * labels that" for the whole page template.
 */
export const readingCopy = 'text-[17px] leading-[1.7] text-body';
