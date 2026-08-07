/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['selector', '.theme-dark'],
    /**
     * Tailwind scans these files as raw bytes. It has no idea what a comment, a
     * string or an identifier is, so a token that looks like a utility name is
     * extracted wherever it appears and its rule is emitted into the bundle every
     * page loads. Nothing flags it: the CSS is valid, just dead.
     *
     * The hazard is narrower than that makes it sound, and stating it precisely
     * matters, because writing around it costs more readability than it saves
     * bytes. A plain English word that happens to also be a utility name is
     * almost always free: sticky, collapse, static, fixed, table, isolate,
     * truncate, italic, visible, prose, block, flex, grid, container, absolute,
     * relative, hidden, inline, underline, uppercase, border, shadow, transform,
     * filter, contents, invisible and resize are all in the bundle already,
     * emitted from real class lists in index.astro, about.astro, Prose.astro,
     * KnobsTable.astro and blog markdown. Writing one in a sentence adds nothing.
     *
     * What leaks is a token nothing else in src/ uses. Three real cases so far,
     * all of them a name that no class list contains:
     *
     *   top-28   Written bare in a comment in [project].astro. The markup only
     *            ever uses the lg: prefixed form, so the bare rule shipped on
     *            every page of the site applying to nothing.
     *   !block   A local variable named `block`, negated as `if (!block)` in
     *            CodeBlock.astro's handler. Extracted as an important-flagged
     *            utility. It is named codeBox for that reason.
     *   outline  The `outline: 2px solid …` shorthand in a scoped <style>.
     *            Written as longhands in CodeBlock.astro for that reason.
     *   ring     The ordinary English word for a drawn focus indicator, in a
     *            comment in CodeBlock.astro explaining that block's own one.
     *            Nothing in src/ uses the utility, so it shipped a box-shadow
     *            rule on every page. The comment says "indicator" now.
     *
     * So the check is not "is this word a utility name?" — it is "does a class
     * list in src/ contain this exact token?". If yes, write it plainly. If no,
     * hyphenate it, rename the identifier, or split the declaration.
     *
     * This file is outside the content glob, so the names above cost nothing here.
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
