/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['selector', '.theme-dark'],
    /**
     * Tailwind scans these files as raw bytes. It has no idea what a comment, a
     * string or an identifier is, so a token that looks like a utility name is
     * extracted wherever it appears and its rule is emitted into the bundle every
     * page loads. Nothing flags it: the CSS is valid, just dead.
     *
     * THE TEST — "does a class list in src/ contain this exact token?"
     *
     * Not "is this word a utility name?", and emphatically NOT "is the rule in
     * the bundle already?". This comment used to say the second thing: it
     * carried a list of 27 words called free "because they are all in the
     * bundle already, emitted from real class lists". Measured against the
     * built output, 15 of those 27 are in no class list anywhere — they were in
     * the bundle because they had ALREADY leaked, and the list was quoting the
     * damage back as proof of safety. Every word it excused cost bytes.
     *
     * Measured, not reasoned about. The words that really are free, because a
     * class list somewhere emits them:
     *
     *   sticky truncate italic block flex grid absolute relative hidden
     *   uppercase border contents
     *
     * The words that are NOT, whatever this file used to say:
     *
     *   collapse static fixed table isolate visible prose container inline
     *   underline shadow transform filter invisible resize
     *
     * Re-measure rather than trust either list — both go stale the moment a
     * component stops using a utility. `node deadcss.mjs dist` in the review
     * notes does it: collect every token from every class="…" in dist, collect
     * every leading class from the bundle's selectors, and subtract.
     *
     * WHAT IT HAS COST, so the size of it is on the record:
     *
     *   prose    12,335 bytes — 88 @tailwindcss/typography rules on all 36
     *            pages, from the last word of one sentence in content.config.ts:
     *            "…the cap exists to protect the layout, not the prose." It
     *            says "copy" now. Removing this and four smaller ones took the
     *            shared bundle from 41,712 to 29,056 bytes, −30.3%.
     *   top-28   A comment in [project].astro. The markup only ever used the
     *            lg: prefixed form, so the bare rule applied to nothing.
     *   !block   A local named `block`, negated as `if (!block)` in
     *            CodeBlock.astro. Extracted as an important-flagged utility;
     *            renamed codeBox. `!btn` in Header.astro and `!marquee` in
     *            ToolboxMarquee.astro are the same bug, still there, 589 bytes.
     *   outline  The `outline: 2px solid …` shorthand in a scoped <style>.
     *            Longhands in CodeBlock.astro for that reason.
     *   ring     The ordinary word for a drawn focus indicator, in a comment
     *            about one. The comment says "indicator" now.
     *   shadow   "one would silently shadow the other" — a guard's error
     *            message in projectPages.ts. It says "mask" now.
     *   lowercase  "must be lowercase kebab-case" — a Zod message in
     *            content.config.ts. It says "lower-case" now.
     *
     * TWO SOURCES NO REWRITE FIXES. Both are structural; neither is sloppiness,
     * and it is worth knowing which leaks are worth chasing and which are the
     * cost of writing the code correctly:
     *
     *   Guard error messages. They are user-facing prose that has to name real
     *   things — "static route", "lowercase", "shadow" are the accurate words
     *   for what went wrong. They can usually be reworded without lying, and
     *   the two above were. Sometimes they cannot.
     *   Legitimate CSS longhand values. `overflow: visible` and
     *   `position: static` in KnobsTable.astro restore a visually-hidden thead
     *   at the wide breakpoint. The values ARE `visible` and `static`; there is
     *   no other spelling that says so. 52 bytes, deliberately kept — writing
     *   `overflow: initial` to dodge a byte scanner would cost the next reader
     *   more than it saves.
     *
     * If a token fails the test: hyphenate it, reword it, rename the
     * identifier, or split the declaration. If it cannot be, leave it and add
     * it above.
     *
     * This file is outside the content glob, so every name here costs nothing.
     */
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: {
                xl: '1024px'
            }
        },
        extend: {
            colors: {
                surface: 'var(--surface)',
                'surface-soft': 'var(--surface-soft)',
                'surface-card': 'var(--surface-card)',
                strong: 'var(--text-strong)',
                body: 'var(--text-body)',
                muted: 'var(--text-muted)',
                accent: 'var(--accent)',
                'accent-wash': 'var(--accent-wash)',
                positive: 'var(--positive)',
                info: 'var(--info)',
                hairline: 'var(--hairline)',
                'on-accent': 'var(--on-accent)'
            },
            fontFamily: {
                display: ['Fraunces', 'Georgia', '"Times New Roman"', 'serif'],
                sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif']
            },
            borderRadius: {
                chip: '9px',
                card: '14px',
                tile: '16px'
            },
            boxShadow: {
                soft: 'var(--shadow-soft)',
                card: 'var(--shadow-card)',
                lift: 'var(--shadow-lift)'
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '100%', // add required value here
                    }
                }
            }
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
