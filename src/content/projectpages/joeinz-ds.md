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
  sub: "A design system is the set of rules that keeps everything I make looking like one thing. This one works in two languages, and every rule on this board can be checked."
  facts: [ "v1.1.0", "two scripts", "one accent", "audited" ]
  lightSwitch:
    toDark: "Turn the lights off"
    toLight: "Turn the lights on"

mirror:
  flipLabel: "عربي"
  en:
    kicker: "Two scripts, one system"
    heading: "One idea, written twice."
    body: "Neither side is the original and neither side is the translation. Flip the card and the layout follows the reading direction."
  ar:
    kicker: "خطّان، نظام واحد"
    heading: "فكرة واحدة، مكتوبة مرّتين."
    body: "لا يُعدّ أيٌّ من الجانبين هو الأصل ولا أيٌّ منهما هو الترجمة. اقلب البطاقة وسيتكيف التصميم مع اتجاه القراءة."

railCaption: "The story · tap to focus"
railNote: "The dot follows the pin under your pointer. Choose a stop to focus its pins."
allLabel: "All pins"
stops:
  - { id: "origin", label: "01 · The doodle" }
  - { id: "palette", label: "02 · The palette" }
  - { id: "type", label: "03 · The type" }
  - { id: "second-script", label: "04 · Arabic" }
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
        - { mark: "bubble", title: "The bubble", job: "The drawn original. It signs covers and profiles, and it never holds text that was typed." }
        - { mark: "monogram", title: "The AA dot", job: "Drawn, not typed. When there is no room for the bubble it stands in for everything else, and it is never used smaller than 24 pixels." }
        - { mark: "wordmark", title: "The Arabic wordmark", job: "The name drawn in Harmattan, kept as shapes rather than live text. The two small marks in it are spelling, not decoration." }
      laws:
        - "Never mirrored, not even in right to left layouts."
        - "Never redrawn, and only two ink pairings are allowed: dark on light, and light on dark."
        - "Once the space is smaller than a thumbnail, the dot replaces the bubble and both wordmarks."
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
      intro: "Caramel appears in exactly five jobs, spent like money. If it turns up anywhere else, some other use has to give its slot back. The state colours and the chart colours are separate sets with their own jobs."
      jobs:
        - { job: "kicker", caption: "The small dash that marks the start of a section", sample: "The palette" }
        - { job: "wash", caption: "One marker highlight per screen, never two", sample: "one accent" }
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
    caption: "Sizes, one setting that resizes them all together, and an Arabic size for every step."
    expansion:
      demo: "ladder"
      label: "Climb the ladder"
      intro: "Seven roles, each about a quarter larger than the one below. Any surface that uses the system, a page or a screen or a slide, resizes the whole ladder with one number and never touches a single step."
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
      denseNote: "A tightly packed screen sets one number, 0.9375, and every step follows it down together. Nothing is ever resized by hand."
      arNote: "Arabic reads smaller at equal size, so every step ships a pre-computed Arabic size. The one exception: the label never drops to 11px. Weight 700 carries it at 13px."
  - kind: "quote"
    stop: "type"
    register: "sharp"
    label: "in my sharp tone"
    text: "Senior is a behaviour, not a title."
    expansion:
      label: "Hear it in Arabic"
      sibling: "الأقدمية سلوك، لا لقب."
      note: "The system calls a tone a register, and it has two. Sharp is the declarative one, and it is set in Readex Pro, which carries both scripts so one speaker sounds like one speaker."
  - kind: "nameplate"
    stop: "second-script"
    label: "04 · the real name"
    name: "عبد اللّه عدّون"
    body: "خطّ عربي بقواعده الكاملة، لا طبقة ترجمة. أحجام أكبر، تباعد أسطر أكبر، ولا تباعد بين الحروف أبدًا."
    note: "My name, set in Arabic by its own rules rather than translated into someone else's."
    expansion:
      label: "See the four laws"
      intro: "أربعة قوانين تجعل العربية خطًّا أصيلًا في النظام، لا طبقة ترجمة فوقه."
      specimens:
        - { law: "harmattan", caption: "هارمتان للدفء، وهو الوجه الافتراضي", sample: "عبد اللّه عدّون" }
        - { law: "amiri", caption: "أميري للمقام الأدبي والاقتباس", sample: "عبد اللّه عدّون" }
        - { law: "digits", caption: "الأرقام غربية دائمًا، حتى داخل النصّ العربي", sample: "رُسم الشعار عام 2021" }
        - { law: "quotes", caption: "الاقتباس بعلامتيه المزدوجتين، لا بغيرهما", sample: "«خطّان، صوت واحد»" }
  - kind: "faces"
    stop: "type"
    label: "03 · the type"
    note: "Five typefaces, each with one job. One that speaks, one that works, one that computes, and two that carry Arabic."
    expansion:
      label: "Meet the five"
      intro: "Every typeface has one job and a script it answers for. None of them is ever faked into a weight or a slant it does not have, and none stands in for another."
      rows:
        - { face: "literata", name: "Literata", job: "The serif that speaks. Covers, headings, and the warm tone." }
        - { face: "readex", name: "Readex Pro", job: "The one that works. A single family carries both scripts through the interface." }
        - { face: "harmattan", name: "Harmattan", job: "Arabic for headings in the warm tone, and the everyday default." }
        - { face: "amiri", name: "Amiri", job: "Arabic for quotation and formal writing, in its only two weights." }
        - { face: "mono", name: "JetBrains Mono", job: "The machine one. Code, logs and the terminal, with its joined-up characters switched off." }
  - kind: "quote"
    stop: "type"
    register: "warm"
    label: "in my warm tone"
    text: "Confident about ideas, humble about myself."
    expansion:
      label: "Hear it in Arabic"
      sibling: "واثق بالأفكار، متواضع بالنفس."
      note: "Warm is the reassuring tone, set in Literata in English and Harmattan in Arabic. Arabic runs larger at the same step, and it is never letter-spaced."
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
      diffNote: "The tinted band tells you which line changed. The plus or minus at the start of it tells you what happened, because colour never carries a meaning alone."
      logTitle: "the log"
      logs:
        - { level: "trace", text: "cache lookup, 2 hits" }
        - { level: "debug", text: "24 rows rendered" }
        - { level: "info", text: "listening on port 4321" }
        - { level: "warn", text: "retrying in 2s" }
        - { level: "error", text: "upload rejected, file too large" }
        - { level: "fatal", text: "out of memory" }
      logNote: "Trace is the quietest and fatal is the only filled band, so a long run reads as a hierarchy instead of a wall."
      ansiTitle: "the sixteen terminal colours"
      ansiNote: "One fixed set, so every terminal and prompt shows the same sixteen. On a light background, bright means more ink rather than more light, so nothing drops below the contrast floor."
  - kind: "states"
    stop: "palette"
    label: "02 · the states"
    items:
      - { glyph: "✓", name: "positive", tone: "positive" }
      - { glyph: "i", name: "info", tone: "info" }
      - { glyph: "✕", name: "negative", tone: "negative" }
      - { glyph: "!", name: "caution", tone: "caution" }
    note: "Colour never works alone. Every state carries a symbol as well, so nobody has to see the colour to get the message."
    expansion:
      label: "All six states"
      intro: "Four of them speak, one stays neutral, and one is allowed to whisper."
      items:
        - { glyph: "✓", name: "positive", tone: "positive", caption: "Good news. A soft green called sage, on its own tint." }
        - { glyph: "i", name: "info", tone: "info", caption: "Guidance. A blue drawn out of the brand's navy." }
        - { glyph: "✕", name: "negative", tone: "negative", caption: "Bad news. A brick red called madder, never an alarm red." }
        - { glyph: "!", name: "caution", tone: "caution", caption: "A warning. A dry gold called ochre, kept darker than caramel on purpose." }
        - { glyph: "·", name: "neutral", tone: "neutral", caption: "No verdict. A soft grey-brown called putty, for plain facts." }
        - { glyph: "–", name: "inactive", tone: "inactive", caption: "Deliberately faint, and the one thing here allowed to be. Switched-off controls only." }
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
    note: "A running order, not a set of meanings. The first three stay apart for colour-blind readers with no extra help."
    expansion:
      demo: "chart"
      label: "Chart the palette"
      intro: "Ordered for reading, not for decoration. Past the first three, every line carries a shape or a dash as well, so colour never carries a meaning alone."
      chartNote: "Seven lines in their fixed order, each labelled where it sits. A key off to the side is a lookup the reader should not need."
      seqLabel: "how much of something, light to dark"
      divLabel: "worse to better, with a neutral middle"
      nullLabel: "no data"
      nullNote: "Missing values get a hatch, never a grey that could read as a value."
  - kind: "audit"
    stop: "proof"
    label: "06 · the audit"
    rows:
      - { check: "text on cream", result: "easily read" }
      - { check: "text on navy", result: "easily read" }
      - { check: "colour blindness", result: "still clear" }
      - { check: "reduced motion", result: "respected" }
    note: "Every colour pairing is measured before it ships, on both backgrounds, and the ones that fall short are published instead of hidden."
    expansion:
      label: "Read the full audit"
      intro: "Contrast is measured as a ratio. The standard asks for 4.5 to one at normal text sizes, and anything above that is easier to read. Every number below is the tightest case rather than the average."
      rows:
        - { check: "quietest text on cream", ratio: 4.8 }
        - { check: "quietest text on navy", ratio: 4.6 }
        - { check: "muted text on cream", ratio: 5.5 }
        - { check: "muted text on navy", ratio: 8.9 }
        - { check: "when you ask for more contrast", ratio: 7.5 }
        - { check: "code text on selection", ratio: 9.5 }
      floor: 4.5
      floorLabel: "4.5, the floor"
      pairsTitle: "the tightest four, drawn"
      pairs:
        - { label: "muted text on cream", ink: "#6B5A4C", ground: "#F3EAD2", ratio: "5.5:1" }
        - { label: "comment dim on cream", ink: "#746353", ground: "#F3EAD2", ratio: "4.8:1" }
        - { label: "muted text on navy", ink: "#C9BFA6", ground: "#191F33", ratio: "8.9:1" }
        - { label: "comment dim on navy", ink: "#8E8874", ground: "#191F33", ratio: "4.6:1" }
      pairsNote: "Each label is drawn in the ink it names, on the ground it was measured against. Comment dim is the faded grey used for code comments, and it is the quietest text allowed anywhere."
      simTitle: "colour blindness, simulated"
      simRows:
        - { label: "as published", kind: "normal" }
        - { label: "red-green, common", kind: "deuteranopia" }
        - { label: "red-green, rarer", kind: "protanopia" }
      simNote: "The seven chart colours simulated for the two commonest kinds of red-green colour blindness, deuteranopia and protanopia. The first three hold apart in every row, which is why the later ones also carry a shape or a dash."
      flaggedTitle: "published, not hidden"
      flagged:
        - { pair: "caramel as text on cream", note: "3.07 to one. Large type only, and code takes a darker caramel ink instead." }
        - { pair: "sage as text on cream", note: "Raw sage passes only at large sizes. Body text takes the deeper sage cut." }
        - { pair: "inactive, both modes", note: "About 2.7 to one and left that way on purpose. Disabled controls are the one exemption the rules allow." }
  - kind: "stat"
    stop: "proof"
    label: "06 · the motion law"
    value: "2"
    caption: "Two speeds. One for movement, which stops for anyone whose device asks for less motion. One for colour changes, which always happens."
    expansion:
      demo: "motion"
      label: "Play the law"
      intro: "Two speeds with two duties. Movement rides the first and can be taken away. Colour feedback rides the second and never is."
      enterCaption: "Movement, 420ms. The card rises once as it arrives, and one moment like that per screen is the whole budget."
      stateCaption: "Feedback, 220ms. The chip changes colour. Hover, focus and selection must never go dead, so this one always runs."
      replayLabel: "Play it again"
      reducedNote: "Animation makes some people genuinely unwell, and their device can say so. When it does, the movement goes and the colour change stays."

closing:
  heading: "One calm core. Built to be borrowed."
  wash: "borrowed."
  sub: "The system is a contract, not a kit. Six things you may set, six things you never touch, and everything on this board comes with its proof."
  contract:
    label: "Read the contract"
    may: "You may set six things. What a page is for, the tone it speaks in, light or dark, how tightly it packs, its spacing, and your own settings kept under your own name."
    never: "You may never touch six things. The type sizes, the typefaces, the palette, the Arabic rules, the motion law, and any name the system already uses."
  proofsLabel: "Show me the proofs"
  proofsStop: "proof"
---
