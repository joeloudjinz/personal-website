---
slug: "inzsh"
subdomain: "inzsh.abdellahaddoun.com"
projectName: "InZsh"
hero:
  kicker: "Zsh prompt theme · a Joe Inz project"
  name: "InZsh"
  hook: "a prompt that knows the hour"
  promise: "A calm, configurable zsh prompt — built from a design system, with prayer times computed on your machine."
  status: "In progress"
  version: "0.1.0"
  ctaPrimary:
    label: "Install InZsh"
    href: "#get-started"
  ctaSecondary:
    label: "View the repository"
    href: "https://github.com/joeloudjinz/inzsh"
  # hero.media omitted — showcase.gif (1000 × 480) has not been captured yet.
glance:
  - value: "zsh 5.8+"
    label: "Minimum version · what CI runs against"
  - value: "2 presets"
    label: "inzsh-sharp (dark, default) · inzsh-warm (light)"
  - value: "No network"
    label: "No calls by default · autolocate is opt-in"
  - value: "Zero"
    label: "Dependencies beyond zsh itself"
why:
  heading: "Most prompts are palettes. This one is a system."
  paragraphs:
    - "Most prompt themes are a set of colours that happened to look nice together — and they usually do, on the terminal they were designed in. InZsh starts from the other end: every colour in the prompt is a semantic role from the JoeInz design system, with a contrast ratio that’s verified, not eyeballed."
    - "The other reason is simpler. I wanted prayer times in my prompt, and no theme does that — not as a plugin calling a web API, and not computed on the machine from coordinates I set once. So I built it."
prayer:
  heading: "Prayer times, in the prompt."
  standfirst: "Optional, and off unless configured. When it’s on, the times are computed on your machine using standard astronomical methods."
  config:
    - text: "INZSH_SALAH_LAT=21.4225"
    - text: "INZSH_SALAH_LON=39.8262"
    - text: "INZSH_SALAH_METHOD=mwl"
    - text: "INZSH_SALAH_ASR=shafi"
    - text: "# standard · shafi · hanafi"
  methods: "MWL · ISNA · UmmAlQura · Egyptian · Karachi · Algeria — default MWL. Aliases like Makkah, Mecca or Egypt work; case, spacing and punctuation are ignored."
  asr: "standard · shafi · hanafi — default standard."
  # prayer.media omitted — the 1000 × 200 prayer-times capture has not been generated yet.
  highLatitudes: "‘INZSH_SALAH_HIGHLAT’ takes angle · seventh · middle · none — default angle. It decides what happens at latitudes where the sun never reaches the depression angle and fajr or isha would otherwise not exist; ‘none’ leaves the prayer absent rather than inventing one."
  privacy: "No telemetry, and no network calls by default. One opt-in exception: ‘INZSH_SALAH_AUTOLOCATE=1’ permits a query to a third-party IP geolocation service — which means your IP is sent to it. Even then, the theme never makes the request on its own; you run ‘inzsh locate’ when you want the stored position refreshed. Set the coordinates manually and none of this applies."
config:
  heading: "Configured, not forked."
  intro: "Every knob is declared — engine and segment knob families, with per-segment overrides. ‘inzsh preset’ switches styles in a running shell, and a narrow-terminal mode keeps the prompt usable in small panes. The engine knobs:"
  knobs:
    - name: "INZSH_PRESET"
      values: ["sharp", "warm"]
      fallback: "sharp"
      effect: "Which register is drawn. Read once, when the theme is sourced — set it in .zshrc above the line that sources the theme."
    - name: "INZSH_SURFACE_MODE"
      values: ["alternate", "ramp", "flat", "hue"]
      fallback: "alternate"
      effect: "How segment backgrounds are assigned."
    - name: "INZSH_SEPARATOR_STYLE"
      values: ["arrow", "round", "divider"]
      fallback: "arrow"
      effect: "The glyph between two segments. arrow and round need a Nerd Font; divider needs only box drawing."
    - name: "INZSH_SEGMENT_PAD"
      values: ["0–4"]
      fallback: "1"
      effect: "Columns of air either side of every block."
    - name: "INZSH_TRANSIENT"
      values: ["1", "0"]
      fallback: "1"
      effect: "Collapses the prompt to its minimal form after a command is accepted, so scrollback reads as commands and output."
    - name: "INZSH_DIR_COMPONENTS"
      values: ["non-negative integer"]
      fallback: "0"
      effect: "Caps how many trailing path components stay before truncation. 0 is the whole path."
    - name: "INZSH_GIT_TIMEOUT"
      values: ["1–60"]
      fallback: "2"
      effect: "Seconds before the git call is killed."
  note: "Every knob declares its accepted values and its fallback. An unreadable value falls back rather than breaking the prompt."
  link:
    label: "The configuration reference"
    href: "https://github.com/joeloudjinz/inzsh/blob/dev/docs/configuration.md"
steps:
  - title: "Clone and install"
    lines:
      - prompt: true
        text: "git clone https://github.com/joeloudjinz/inzsh.git ~/.inzsh"
      - prompt: true
        text: "cd ~/.inzsh && zsh install.zsh"
    note: "Idempotent — safe to re-run. It backs up your .zshrc before touching it."
  - title: "Pick a preset"
    lines:
      - text: "INZSH_PRESET=warm"
    note: "In .zshrc, above the line that sources the theme — it’s read when the theme loads. The default is sharp."
  - title: "Optional — prayer times"
    lines:
      - text: "INZSH_SALAH_LAT=21.4225"
      - text: "INZSH_SALAH_LON=39.8262"
      - text: "INZSH_SALAH_METHOD=mwl"
      - text: "INZSH_SALAH_ASR=shafi"
      - text: "# standard · shafi · hanafi"
    note: "Latitude, longitude, calculation method, Asr school. Off unless these are set."
# gallery omitted — the three 1000 × 200 preset captures have not been generated yet.
specs:
  - label: "Requires"
    value: "zsh 5.8+ · a Nerd Font · a supported terminal"
  - label: "Full colour"
    value: "Ghostty · iTerm2 · kitty · Alacritty · WezTerm — the design target"
  - label: "256 colours"
    value: "macOS Terminal.app — palette tuned for it; close, not identical"
  - label: "tmux"
    value: "Needs RGB passthrough — set -sa terminal-features ',*:RGB'"
  - label: "Not supported"
    value: "Linux TTY and other bare consoles"
  - label: "Optional"
    value: "oh-my-zsh"
  - label: "License"
    value: "MIT"
colour:
  heading: "It stays readable."
  cards:
    - title: "AA, verified."
      body: "Every foreground/background pairing is checked against WCAG AA — in both presets, at both colour depths."
    - title: "Checked for colour-blindness."
      body: "The palette is run under protanopia, deuteranopia and tritanopia simulation."
    - title: "Never colour alone."
      body: "No state is signalled by colour only — each one carries a glyph."
    - title: "An honest fallback."
      body: "256-colour terminals get a hand-tuned palette that holds the theme’s shape. It’s close rather than identical — and says so."
verification:
  heading: "Built not to break."
  rows:
    - label: "Fixtures"
      value: "Every still and recording on this page is generated from fixtures — ‘make shots’ and ‘make demo’ rebuild them. Nothing is hand-edited."
    - label: "Test suites"
      value: "52 spec files across unit, render, pty terminal-grid, installer and perf-budget suites — plus golden files that fail when the prompt changes shape."
    - label: "CI"
      value: "Runs on Linux and macOS, against zsh 5.8."
    - label: "Diagnostics"
      value: "‘inzsh doctor’ prints one diagnostic block — zsh version, terminal, $TERM, colour depth, locale, Nerd Font, tmux — and never prints your coordinates."
# <!-- provisional: FAQ answers 2-4 pending rewrite -->
# Only the first answer is approved copy. Answers 2-4 are placeholders assembled
# from facts stated elsewhere on this page; the user has deferred rewriting them.
faq:
  - q: "What leaves my machine?"
    a: "Nothing, unless you opt in. There’s no telemetry and there are no network calls by default. The one exception is ‘INZSH_SALAH_AUTOLOCATE=1’, which permits an IP-geolocation query — and even then it only happens when you run ‘inzsh locate’ yourself. Manual coordinates avoid it entirely."
  - q: "How do I uninstall it?"
    a: "The installer is reversible: ‘--uninstall’ takes everything back out. Your .zshrc was backed up at install time."
  - q: "Why do the colours look wrong in tmux?"
    a: "tmux needs RGB passthrough — set -sa terminal-features ',*:RGB'."
  - q: "What is ‘inzsh doctor’ for?"
    a: "It prints one diagnostic block — zsh version, terminal, $TERM, colour depth, locale, Nerd Font, tmux — and never prints your coordinates."
closing:
  heading: "Give your prompt a system."
  wash: "system"
  sub: "The installer is reversible — or read the source first."
  facts: ["MIT", "no telemetry", "zsh 5.8+"]
credit: "The segment-rank idea — one integer per segment, controlling both order and visibility — comes from comfyline, by not pua. InZsh is an independent implementation."
---

<!-- provisional: FAQ answers 2-4 pending rewrite -->
