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
  heading: "A brand from a tucked‑away doodle."
  wash: "doodle."
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
railNote: "The dot follows the pin under your pointer. Choose a stop to focus its pins."
allLabel: "All pins"
stops:
  - { id: "origin", label: "01 · The doodle" }
  - { id: "palette", label: "02 · The palette" }
  - { id: "type", label: "03 · The voices" }
  - { id: "second-script", label: "04 · The second script" }
  - { id: "charts", label: "05 · The charts" }
  - { id: "proof", label: "06 · The proof" }

pins:
  - kind: "origin"
    stop: "origin"
    label: "01 · the origin"
    alt: "The hand-lettered Joe Inz speech bubble, drawn in ink on cream"
    note: "Drawn in 2021. Waiting in a folder for years. Now it signs everything."
    expansion:
      label: "Meet the marks"
      intro: "One drawing became a family. Each mark has one job, and none of them may be redrawn, mirrored or re-lettered."
      marks:
        - { mark: "bubble", title: "The bubble", job: "The drawn original. It signs covers and profiles, and it never holds typeset text." }
        - { mark: "monogram", title: "The AA dot", job: "Drawn, not typeset. Below a 48px box it stands in for everything else, and its own floor is 24px." }
        - { mark: "wordmark", title: "The Arabic wordmark", job: "The name in Harmattan 700, kept as drawn paths. Both shaddas are spelling, not decoration." }
      laws:
        - "Never mirrored, even in right to left layouts."
        - "Never re-lettered, and never recoloured outside the two ink schemes."
        - "Below 48px the dot replaces the bubble and both wordmarks."
  - kind: "swatches"
    stop: "palette"
    label: "02 · the palette"
    colors:
      - { hex: "#F3EAD2", name: "cream", ink: "dark" }
      - { hex: "#3A281E", name: "chocolate", ink: "light" }
      - { hex: "#B07A3C", name: "caramel", ink: "light" }
      - { hex: "#191F33", name: "navy", ink: "light" }
    note: "One saturated accent. A budget, not a paint."
    expansion:
      demo: "budget"
      label: "Spend the budget"
      intro: "Caramel appears in exactly five jobs, spent like money. If it turns up anywhere else, some other use has to give its slot back."
      jobs:
        - { job: "kicker", caption: "The kicker tick that announces a section", sample: "The palette" }
        - { job: "wash", caption: "One marker highlight per view, never two", sample: "one accent" }
        - { job: "action", caption: "The primary action, filled", sample: "Save changes" }
        - { job: "focus", caption: "The focus halo around the active field", sample: "Your name" }
        - { job: "selection", caption: "Selected text, tinted rather than painted", sample: "select this line" }
      strip:
        title: "The same four on navy"
        note: "Dark mode is a matched scheme, not an inversion. The accent stays caramel, and where caramel must read as text it steps up to its brighter twin."
  - kind: "stat"
    stop: "type"
    label: "03 · the scale"
    value: "7"
    caption: "Sizes in the ladder, one density knob, and every step ships its Arabic size beside it."
    expansion:
      demo: "ladder"
      label: "Climb the ladder"
      intro: "Seven roles from one ratio, close to a major third. A surface resizes the whole ladder with one factor and never touches a single step."
      sample: "Joe Inz"
      arSample: "جو إنز"
      rows:
        - { role: "display", px: 39, arPx: 43 }
        - { role: "title", px: 31, arPx: 34 }
        - { role: "heading", px: 25, arPx: 27.5 }
        - { role: "subheading", px: 20, arPx: 22 }
        - { role: "body", px: 16, arPx: 16 }
        - { role: "caption", px: 13, arPx: 13 }
        - { role: "label", px: 11, arPx: 13 }
      denseNote: "Dense surfaces set one multiplier, 0.9375, and every step follows. Nothing is ever resized by hand."
      arNote: "Arabic reads smaller at equal size, so every step ships a pre-computed Arabic size. The one exception: the label never drops to 11px. Weight 700 carries it at 13px."
  - kind: "quote"
    stop: "type"
    register: "sharp"
    label: "field note · sharp register"
    text: "Senior is a behaviour, not a title."
    expansion:
      label: "Hear it in Arabic"
      sibling: "الأقدمية سلوك، لا لقب."
      note: "The sharp register keeps its voice across scripts. Readex Pro carries both, upright and front-loaded, so the two sentences read as one speaker."
  - kind: "nameplate"
    stop: "second-script"
    label: "04 · الاسم الحقيقي"
    name: "عبد اللّه عدّون"
    body: "خطّ عربي بقواعده الكاملة، لا طبقة ترجمة. أحجام أكبر، تباعد أسطر أكبر، ولا تباعد بين الحروف أبدًا."
    expansion:
      label: "قوانين الخطّ"
      intro: "أربعة قوانين تجعل العربية خطًّا أصيلًا في النظام، لا طبقة ترجمة فوقه."
      specimens:
        - { law: "harmattan", caption: "هارمتان للدفء، وهو الوجه الافتراضي", sample: "عبد اللّه عدّون" }
        - { law: "amiri", caption: "أميري للمقام الأدبي والاقتباس", sample: "عبد اللّه عدّون" }
        - { law: "digits", caption: "الأرقام غربية دائمًا، حتى داخل النصّ العربي", sample: "رُسم الشعار عام 2021" }
        - { law: "quotes", caption: "الاقتباس بعلامتيه المزدوجتين، لا بغيرهما", sample: "«خطّان، صوت واحد»" }
  - kind: "faces"
    stop: "type"
    label: "03 · the voices"
    note: "Five faces with defined jobs. A serif that speaks, a sans that works, a mono that computes."
    expansion:
      label: "Meet the five"
      intro: "Every face has one job and a script it answers for. Nothing fakes a weight or a slant, and nothing stands in for another."
      rows:
        - { face: "literata", name: "Literata", job: "The display serif. It speaks, on covers and headings." }
        - { face: "readex", name: "Readex Pro", job: "The working sans. One family carries both scripts in the interface." }
        - { face: "harmattan", name: "Harmattan", job: "Arabic display in the warm register, the system default." }
        - { face: "amiri", name: "Amiri", job: "Arabic in the formal register. Quotation and literature, at 400 and 700 only." }
        - { face: "mono", name: "JetBrains Mono", job: "The machine voice. Code, logs and the terminal, ligatures off." }
  - kind: "quote"
    stop: "type"
    register: "warm"
    label: "field note · warm register"
    text: "Confident about ideas, humble about myself."
    expansion:
      label: "Hear it in Arabic"
      sibling: "واثق بالأفكار، متواضع بالنفس."
      note: "The warm register speaks Harmattan in Arabic, the same voice the serif carries in English. Larger at the same step, and never letter-spaced."
  - kind: "terminal"
    stop: "proof"
    label: "06 · the console voice"
    lines:
      - { prompt: true, text: "npm run build" }
      - { text: "built 37 pages in 1.8s" }
    note: "Code, terminals and logs are brand territory too, not a theme bolted on afterwards."
    expansion:
      label: "Show me how"
      intro: "Marking a surface as the console voice is one class. The mono face, the recessed well, sixteen terminal colours and the diff and log styles all arrive with it."
      diffTitle: "the diff"
      diff:
        - { mark: "add", text: "--type-scale: 1;" }
        - { mark: "drop", text: "--type-scale: .9375;" }
        - { mark: "change", text: "font-feature-settings: 'liga' 0;" }
      diffNote: "The band locates the line. The mark in the gutter carries the meaning, because colour never encodes alone."
      logTitle: "the log"
      logs:
        - { level: "trace", text: "cache lookup, 2 hits" }
        - { level: "debug", text: "24 rows rendered" }
        - { level: "info", text: "listening on port 4321" }
        - { level: "warn", text: "retrying in 2s" }
        - { level: "error", text: "upload rejected, file too large" }
        - { level: "fatal", text: "out of memory" }
      logNote: "Trace is the quietest and fatal is the only filled band, so a long run reads as a hierarchy instead of a wall."
      ansiTitle: "the sixteen"
      ansiNote: "One canonical mapping for every emulator and prompt. In the light scheme, bright means more ink, not more light, so nothing drops below the contrast floor."
  - kind: "states"
    stop: "palette"
    label: "02 · the states"
    items:
      - { glyph: "✓", name: "positive", tone: "positive" }
      - { glyph: "i", name: "info", tone: "info" }
      - { glyph: "✕", name: "negative", tone: "negative" }
      - { glyph: "!", name: "caution", tone: "caution" }
    note: "Colour never works alone. Every state has a glyph partner."
    expansion:
      label: "All six states"
      intro: "Four of them speak, one stays neutral, and one is allowed to whisper."
      items:
        - { glyph: "✓", name: "positive", tone: "positive", caption: "Good news. Sage ink on its own wash." }
        - { glyph: "i", name: "info", tone: "info", caption: "Guidance. An ink blue derived from the navy." }
        - { glyph: "✕", name: "negative", tone: "negative", caption: "Madder, a book-cloth brick. Never alarm red." }
        - { glyph: "!", name: "caution", tone: "caution", caption: "Dry ochre, darker and greener than caramel on purpose." }
        - { glyph: "·", name: "neutral", tone: "neutral", caption: "No verdict. The putty chip that carries plain facts." }
        - { glyph: "–", name: "inactive", tone: "inactive", caption: "Deliberately below the contrast bar. Disabled controls only." }
  - kind: "swatches"
    stop: "charts"
    label: "05 · the chart colours"
    colors:
      - { hex: "#B07A3C", name: "caramel", ink: "light" }
      - { hex: "#41507A", name: "ink blue", ink: "light" }
      - { hex: "#55908C", name: "chart teal", ink: "light" }
      - { hex: "#6E4460", name: "plum", ink: "light" }
      - { hex: "#5E7A5B", name: "sage", ink: "light" }
      - { hex: "#7A6119", name: "ochre", ink: "light" }
      - { hex: "#7A443A", name: "madder", ink: "light" }
    note: "Ordered, not semantic. The first three survive colour blindness on their own."
    expansion:
      demo: "chart"
      label: "Chart the palette"
      intro: "Ordered for reading, not for decoration. Past three series every line carries a shape or a dash as well, so colour never encodes alone."
      chartNote: "Seven series in their published order, labelled directly. A legend is a lookup the reader should not need."
      seqLabel: "magnitude, one hue"
      divLabel: "diverging, madder to sage"
      nullLabel: "no data"
      nullNote: "Missing values get a hatch, never a grey that could read as a value."
  - kind: "audit"
    stop: "proof"
    label: "06 · the audit"
    rows:
      - { check: "contrast, light", result: "pass" }
      - { check: "contrast, dark", result: "pass" }
      - { check: "colour blindness", result: "pass" }
      - { check: "reduced motion", result: "pass" }
    expansion:
      label: "Read the full audit"
      intro: "Every pairing is measured before it ships, on both surfaces, and the failures are published rather than hidden."
      rows:
        - { check: "states on light", result: "pass" }
        - { check: "states on dark", result: "pass" }
        - { check: "colour blindness, simulated", result: "pass" }
        - { check: "prefers more contrast", result: "pass" }
        - { check: "focus shown everywhere", result: "pass" }
        - { check: "reduced motion honoured", result: "pass" }
      flaggedTitle: "published, not hidden"
      flagged:
        - { pair: "caramel as text on cream", note: "3.07 to one. Large type only, and code takes a darker caramel ink instead." }
        - { pair: "sage as text on cream", note: "Raw sage passes only at large sizes. Body text takes the deeper sage cut." }
        - { pair: "inactive, both modes", note: "About 2.7 to one and left that way on purpose. Disabled controls are the one exemption the rules allow." }
  - kind: "stat"
    stop: "proof"
    label: "06 · the motion law"
    value: "2"
    caption: "Duration roles. Entrances ride one and stop under reduced motion. Feedback rides the other and always lands."
    expansion:
      demo: "motion"
      label: "Play the law"
      intro: "Two durations with two duties. Choreography rides the entrance and may be taken away. Feedback rides the state and never is."
      enterCaption: "Entrance, 420ms. The card rises once on the enter duration, and one choreographed moment per surface is the whole budget."
      stateCaption: "Feedback, 220ms. The chip changes colour on the state duration. Hover, focus and selection must never go dead."
      replayLabel: "Play it again"
      reducedNote: "Under reduced motion the entrance is zeroed and the colour change stays. Choreography goes, feedback survives."

closing:
  heading: "One calm core. Built to be borrowed."
  wash: "borrowed."
  sub: "The system is a contract, not a kit. Six things you may set, six things you never touch, and everything on this board comes with its proof."
  contract:
    label: "Read the contract"
    may: "You may set six things. The voice of a surface, its register, light or dark, its density, its rhythm, and your own tokens under your own prefix."
    never: "You may never touch six things. The type roles, the font stacks, the palette, the Arabic rules, the motion law, and any name the foundation already owns."
  proofsLabel: "Show me the proofs"
  proofsStop: "proof"
---
