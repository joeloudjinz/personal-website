---
name: "InZsh"
demoLink: "https://github.com/joeloudjinz/inzsh"
# The showcase page, now at its own host. This was site-relative until the
# subdomain existed; it is absolute because the page's canonical says
# inzsh.abdellahaddoun.com, and a card pointing at /inzsh/ would send readers to
# a copy that only tells search engines to look elsewhere.
#
# Absolute also earns the new tab: linkAttrs reads the scheme and opens off-site
# links in a new window, so the "project pages open in a new tab" behaviour comes
# from this one line rather than a flag someone has to remember.
#
# /inzsh/ still builds and still works. It is what the subdomain's own catch-all
# redirects back to, so it has to keep existing — it just is not what we link.
projectPageLink: "https://inzsh.abdellahaddoun.com/"
isUnderConstruction: false
isFeatured: true
version: "2.0.2"
# "WCAG AA by design", not "WCAG AA". The showcase page spends a whole band
# separating the two — contrast was worked out pair by pair when the palette was
# built and the ratios are recorded beside the colours, but no test measures it,
# and the project's own limitations page says to read it as documented design
# intent rather than as a gate. A bare standard name on a card reads as a
# compliance claim, which is the one thing that band exists to not say.
tags: [ "Zsh", "Shell", "Oh My Zsh", "Powerline", "JoeInz Design System", "WCAG AA by design", "ShellSpec" ]
id: "inzsh-zsh-theme"
---

A zsh prompt that carries prayer times in it, computed on your machine — no network, no
dependencies beyond zsh. Thirteen segments each take their place from a single integer, across
as many prompt rows as you care to declare. The rest is built from the JoeInz design system
rather than a palette that happened to look nice: every colour has a defined job, contrast was
worked out pair by pair when the palette was built, and no state is signalled by colour alone.
Two presets ship with it, sharp and warm.
