---
template: "pinboard"
slug: "joeinz-ds"
subdomain: "joeinz-ds.abdellahaddoun.com"
projectName: "Joe Inz DS"
seo:
  title: "Joe Inz Design System, a personal brand system in two scripts"
  description: "The design system behind my work. One calm palette, five typefaces, Arabic as an equal script, and the rules that keep it honest."
  keywords: [ "design system", "design tokens", "Arabic typography", "RTL design", "brand system", "accessibility" ]
  imageAlt: "The hand-lettered Joe Inz speech bubble logo on a cream background"

masthead:
  kicker: "Joe Inz · design system"
  heading: "A brand from a forgotten doodle."
  wash: "doodle"
  facts: [ "v1.1.0", "two scripts", "one accent", "audited" ]
  lightSwitch:
    toDark: "Turn the lights off"
    toLight: "Turn the lights on"

mirror:
  flipLabel: "عربي"
  en:
    kicker: "Two scripts, one voice"
    heading: "You're not behind. You're paying attention."
    body: "Neither side is the original and neither side is the translation. Flip the card and the layout follows the reading direction."
  ar:
    kicker: "خطّان، صوت واحد"
    heading: "أنت لست متأخرًا. أنت منتبه."
    body: "لا جهة هنا أصل ولا جهة ترجمة. اقلب البطاقة وسيتبع التصميم اتجاه القراءة."

railCaption: "The story · tap to focus"
allLabel: "All pins"
stops:
  - { id: "origin", label: "01 · The doodle" }
  - { id: "palette", label: "02 · The palette" }
  - { id: "type", label: "03 · The voices" }
  - { id: "second-script", label: "04 · The second script" }
  - { id: "proof", label: "05 · The proof" }

pins:
  - kind: "origin"
    stop: "origin"
    label: "01 · the origin"
    alt: "The hand-lettered Joe Inz speech bubble, drawn in ink on cream"
    note: "Drawn in 2021. Ignored for years. Now it signs everything."
  - kind: "swatches"
    stop: "palette"
    label: "02 · the palette"
    colors:
      - { hex: "#F3EAD2", name: "cream", ink: "dark" }
      - { hex: "#3A281E", name: "chocolate", ink: "light" }
      - { hex: "#B07A3C", name: "caramel", ink: "light" }
      - { hex: "#191F33", name: "navy", ink: "light" }
    note: "One saturated accent. A budget, not a paint."
    more:
      label: "Tell me more"
      body: "Caramel appears in exactly five jobs: the kicker mark, one marker highlight per view, the primary action, focus, and selection. Six extra state colors handle good and bad news, and each one arrives with a glyph so color never carries a meaning alone."
  - kind: "stat"
    stop: "type"
    label: "03 · the scale"
    value: "7"
    caption: "Sizes in the ladder, one density knob, and every step ships its Arabic size beside it."
  - kind: "quote"
    stop: "type"
    label: "field note · sharp register"
    text: "Senior is a behavior, not a title."
  - kind: "nameplate"
    stop: "second-script"
    label: "04 · الاسم الحقيقي"
    name: "عبد اللّه عدّون"
    body: "خطّ عربي بقواعده الكاملة، لا طبقة ترجمة. أحجام أكبر، أسطر أوسع، ولا تباعد بين الحروف أبدًا."
    more:
      label: "اقرأ المزيد"
      lang: "ar"
      body: "خطّان للعناوين حسب النبرة، هارمتان للدفء وأميري للاقتباس، وردكس برو لكل ما هو عملي. الأرقام غربية دائمًا، والاقتباس بعلامتيه «هكذا»."
  - kind: "faces"
    stop: "type"
    label: "03 · the voices"
    note: "Five faces with defined jobs. A serif that speaks, a sans that works, a mono that computes."
  - kind: "terminal"
    stop: "proof"
    label: "05 · the terminal"
    lines:
      - { prompt: true, text: "joeinz --voice console" }
      - { text: "✓ mono on a quiet well" }
      - { text: "✓ one highlight per pane" }
    more:
      label: "Show me how"
      body: "Adopting the console voice is one class on a container. The system brings the mono face, the recessed well, sixteen terminal colors and the diff and log styles with it. Nothing to configure, nothing to rebuild."
  - kind: "states"
    stop: "palette"
    label: "02 · the states"
    items:
      - { glyph: "✓", name: "positive", tone: "positive" }
      - { glyph: "i", name: "info", tone: "info" }
      - { glyph: "✕", name: "negative", tone: "negative" }
      - { glyph: "!", name: "caution", tone: "caution" }
    note: "Color never works alone. Every state has a glyph partner."
  - kind: "audit"
    stop: "proof"
    label: "05 · the audit"
    rows:
      - { check: "contrast, light", result: "pass" }
      - { check: "contrast, dark", result: "pass" }
      - { check: "color blindness", result: "pass" }
      - { check: "reduced motion", result: "pass" }

closing:
  heading: "One calm core. Built to be borrowed."
  wash: "borrowed"
  sub: "The system is a contract, not a kit. Six things you may set, six things you never touch, and everything on this board comes with its proof."
  contract:
    label: "Read the contract"
    may: "You may set six things. The voice of a surface, its register, light or dark, its density, its rhythm, and your own tokens under your own prefix."
    never: "You may never touch six things. The type roles, the font stacks, the palette, the Arabic rules, the motion law, and any name the foundation already owns."
  proofsLabel: "Show me the proofs"
  proofsStop: "proof"
---
