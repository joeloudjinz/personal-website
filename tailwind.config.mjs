/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['selector', '.theme-dark'],
    /**
     * Tailwind scans these files as raw bytes. It has no idea what a comment is,
     * so a bare utility name written as English prose — "blur", "truncate",
     * "container", "table", "fixed", "grid" — is extracted as a class and its
     * rule is emitted into the bundle every page loads. Nothing flags it: the
     * CSS is valid, just dead.
     *
     * When writing a comment in a scanned file, avoid bare utility names or put
     * them in a form Tailwind will not match (hyphenate, or write `.blur`).
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
