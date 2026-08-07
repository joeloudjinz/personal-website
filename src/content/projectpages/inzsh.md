---
slug: "inzsh"
subdomain: "inzsh.abdellahaddoun.com"
projectName: "InZsh"
hero:
  kicker: "Zsh prompt theme · a Joe Inz project"
  heading: "InZsh: a prompt that knows the hour."
  wash: "knows the hour"
  promise: "A calm, configurable zsh prompt, built from a design system, with prayer times computed on your machine."
  status: "In progress"
  version: "v0.1.0"
  ctaPrimary:
    label: "Install InZsh"
    href: "#get-started"
  ctaSecondary:
    label: "View the repository"
    href: "https://github.com/joeloudjinz/inzsh"
  media:
    src: "../../assets/img/inzsh/showcase-2000.gif"
    # The same tape at 1x. An animated capture skips the image pipeline, so
    # rendered files are the only candidates it has — 650 KiB and 1.41 MiB. See
    # variants in content.config.ts.
    #
    # Two rungs rather than three, and the gap between them is real. Upstream's
    # SCALE takes 2, 3 or 4 and nothing between — SCALE=1.5 is refused before a
    # frame is drawn — so the 1.5x rung we used to ship was one we rendered
    # ourselves. Re-rolling it here would cost the reproduction claim the
    # verification band makes, which is the more valuable of the two. Measured:
    # a 768, 1280 or 1440 viewport at DPR 2 now takes the 2000 where it took the
    # 1500, +410 KiB. A 320 viewport is unaffected — it took the 1000 before and
    # takes it now. Closing that gap is a request to the upstream project, not
    # something to work around here.
    variants:
      - "../../assets/img/inzsh/showcase-1000.gif"
    alt: "A recording of the InZsh prompt. Coordinates for Mecca are set and a prayer segment appears on the right of the prompt, reading Maghrib 17:50 beside the clock. A directory is created and entered, a repository is opened and its branch shown, a failing command marks the prompt with a cross, then the surface and separator styles change and the prompt is redrawn from the dark sharp preset into the light warm one."
glance:
  kicker: "At a glance"
  items:
    - value: "zsh 5.8+"
      label: "Minimum version · what CI runs against"
    - value: "2 presets"
      label: "inzsh-sharp (dark, default) · inzsh-warm (light)"
    - value: "No network"
      label: "No calls by default · autolocate is opt-in"
    - value: "Zero"
      label: "Dependencies beyond zsh itself"
why:
  kicker: "Why it exists"
  heading: "Most prompts are palettes. This one is a system."
  paragraphs:
    - "Most prompt themes are a set of colours that happened to look nice together, and they usually do, on the terminal they were designed in. InZsh starts from the other end: every colour in the prompt is a semantic role from the JoeInz design system, with a contrast ratio that’s verified, not eyeballed."
    - "The other reason is simpler. I wanted prayer times in my prompt, and no theme does that: not as a plugin calling a web API, and not computed on the machine from coordinates I set once. So I built it."
deepDive:
  kicker: "Prayer times · computed locally"
  heading: "Prayer times, in the prompt."
  standfirst: "Optional, and off unless configured. When it’s on, the times are computed on your machine using standard astronomical methods."
  code:
    label: "Four values in .zshrc"
    lines:
      - text: "INZSH_SALAH_LAT=21.4225"
      - text: "INZSH_SALAH_LON=39.8262"
      - text: "INZSH_SALAH_METHOD=mwl"
      - text: "INZSH_SALAH_ASR=shafi"
      - text: "# standard · shafi · hanafi"
  media:
    src: "../../assets/img/inzsh/shot-salah.png"
    alt: "A single row of prompt on black, with the prayer times as its subject rather than a detail: joeinz, joeinz-pc, the path ~/work and a branch segment reading main in pink with a mark for uncommitted changes, then the cursor. Ranged right, in segments of their own, Maghrib · 17:50 and the clock at 15:34: the next prayer and the time it falls, computed on the machine from the Mecca coordinates."
  rows:
    - label: "Methods:"
      value: "MWL · ISNA · UmmAlQura · Egyptian · Karachi · Algeria; default MWL. Aliases like Makkah, Mecca or Egypt work; case, spacing and punctuation are ignored."
    - label: "Asr:"
      value: "standard · shafi · hanafi; default standard."
    - label: "High latitudes"
      value: "‘INZSH_SALAH_HIGHLAT’ takes angle · seventh · middle · none; default angle. It decides what happens at latitudes where the sun never reaches the depression angle and fajr or isha would otherwise not exist; ‘none’ leaves the prayer absent rather than inventing one."
    - label: "Privacy"
      value: "No telemetry, and no network calls by default. One opt-in exception: ‘INZSH_SALAH_AUTOLOCATE=1’ permits a query to a third-party IP geolocation service, which means your IP is sent to it. Even then, the theme never makes the request on its own; you run ‘inzsh locate’ when you want the stored position refreshed. Set the coordinates manually and none of this applies."
config:
  # No kicker: this is the one band the approved design runs without one.
  heading: "Configured, not forked."
  # "a narrow-terminal mode" was the earlier wording, and the product's own
  # configuration reference says the named steps it describes — full, wide,
  # narrow, minimal, behind three INZSH_LADDER_*_COLS variables — were removed
  # rather than tuned, because fitting from real measurements turned out to be
  # simpler and exact. Nothing on this page may claim a feature the docs record
  # as deleted, so this now names the three mechanisms that replaced it.
  intro: "Every knob is declared: engine and segment knob families, with per-segment overrides. ‘inzsh preset’ switches styles in a running shell, and a narrow pane is fitted by measurement rather than by a named step: the path shortens, blocks drop in priority order, and the right-hand group moves down beside the cursor. The engine knobs:"
  knobHeaders:
    name: "Knob"
    values: "Values"
    fallback: "Default"
    effect: "Effect"
  knobs:
    - name: "INZSH_PRESET"
      values: ["sharp", "warm"]
      fallback: "sharp"
      effect: "Which register is drawn. Read once, when the theme is sourced. Set it in .zshrc above the line that sources the theme."
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
  kicker: "Get started"
  heading: "Three steps in."
  intro: "You’ll need zsh 5.8+ and a Nerd Font (the prompt draws powerline separators). The installer is reversible: ‘--uninstall’ takes everything back out."
  link:
    label: "The install guide"
    href: "https://github.com/joeloudjinz/inzsh/blob/dev/docs/install.md"
  items:
    - title: "Clone and install"
      lines:
        - prompt: true
          text: "git clone https://github.com/joeloudjinz/inzsh.git ~/.inzsh"
        - prompt: true
          text: "cd ~/.inzsh && zsh install.zsh"
      note: "Idempotent: safe to re-run. It backs up your .zshrc before touching it."
    - title: "Pick a preset"
      lines:
        - text: "INZSH_PRESET=warm"
      note: "In .zshrc, above the line that sources the theme: it’s read when the theme loads. The default is sharp."
    - title: "Optional: prayer times"
      lines:
        - text: "INZSH_SALAH_LAT=21.4225"
        - text: "INZSH_SALAH_LON=39.8262"
        - text: "INZSH_SALAH_METHOD=mwl"
        - text: "INZSH_SALAH_ASR=shafi"
        - text: "# standard · shafi · hanafi"
      note: "Latitude, longitude, calculation method, Asr school. Off unless these are set."
gallery:
  kicker: "Gallery"
  heading: "The same prompt, three ways."
  intro: "‘inzsh-sharp’ is the dark default. ‘inzsh-warm’ is the light one, warmer and more editorial. Both are drawn from the same semantic roles, and ‘INZSH_PRESET’ picks between them when the theme loads."
  pendingLabel: "Capture pending"
  # The captures are here, so width and height no longer do anything — the files'
  # own dimensions take over. They stay as the record of what was commissioned,
  # which the 2× renders honour exactly: 2000 × 400 is the same 5:1 strip.
  #
  # The alts describe the prompt; the captions name which of the three it is. See
  # the note on alt in content.config.ts for why that is two strings and not one.
  items:
    - src: "../../assets/img/inzsh/shot-sharp.png"
      caption: "The sharp preset: dark, full colour."
      alt: "A prompt on black, drawn as arrow-tipped segments on dark slate-blue: the user joeinz, the host joeinz-pc, the path ~/work, then a branch segment reading main in pink with a mark for uncommitted changes. Ranged right, in segments of their own, Maghrib 17:50 and the clock at 15:34."
      width: 1000
      height: 200
    - src: "../../assets/img/inzsh/shot-warm.png"
      caption: "The warm preset: light, editorial."
      alt: "The same prompt on white: the same segments in the same order, drawn as sand-coloured blocks with dark brown type, and the branch segment in deep red. Maghrib 17:50 and the clock at 15:34 are ranged right, as before."
      width: 1000
      height: 200
    - src: "../../assets/img/inzsh/shot-256.png"
      caption: "The 256-colour fallback, as macOS Terminal.app renders it."
      alt: "The sharp preset again, at 256 colours: the segments, the separators and the prayer times all hold their shape and order, but the greys are flatter and the branch pink and the olive clock sit slightly off the full-colour ones. Close rather than identical."
      width: 1000
      height: 200
specs:
  kicker: "Specs · compatibility"
  heading: "The practical part."
  link:
    label: "Known limitations"
    href: "https://github.com/joeloudjinz/inzsh/blob/dev/docs/limitations.md"
  items:
    - label: "Requires"
      value: "zsh 5.8+ · a Nerd Font · a supported terminal"
    - label: "Full colour"
      value: "Ghostty · iTerm2 · kitty · Alacritty · WezTerm (the design target)"
    - label: "256 colours"
      value: "macOS Terminal.app: palette tuned for it; close, not identical"
    - label: "tmux"
      value: "Needs RGB passthrough: set -sa terminal-features ',*:RGB'"
    - label: "Not supported"
      value: "Linux TTY and other bare consoles"
    - label: "Optional"
      value: "oh-my-zsh"
    - label: "License"
      value: "MIT"
pillars:
  kicker: "Colour · semantic roles, verified"
  heading: "It stays readable."
  cards:
    - title: "AA, verified."
      body: "Every foreground/background pairing is checked against WCAG AA, in both presets, at both colour depths."
    - title: "Checked for colour-blindness."
      body: "The palette is run under protanopia, deuteranopia and tritanopia simulation."
    - title: "Never colour alone."
      body: "No state is signalled by colour only; each one carries a glyph."
    - title: "An honest fallback."
      body: "256-colour terminals get a hand-tuned palette that holds the theme’s shape. It’s close rather than identical, and says so."
verification:
  kicker: "Verification · 52 spec files"
  heading: "Built not to break."
  rows:
    # Still two rows, but the second is a recipe that runs now. It had to be
    # written as a disclaimer once: ‘make shots’ rendered three tapes at their
    # pinned size, ‘make demo’ wrote GIFs into a scratch directory, and there was
    # no scale knob, so no command named here rebuilt a file the page shipped.
    #
    # At b9693ff all three are gone. ‘shots’ writes four stills into docs/assets,
    # ‘demo’ publishes the showcase it renders, and SCALE re-renders each tape at
    # multiplied pinned dimensions. Every file in src/assets/img/inzsh came out of
    # those two commands — checked by running them, not by reading the Makefile.
    #
    # The first row was true as written and is untouched.
    - label: "Fixtures"
      value: "Every still and recording here is rendered from the project’s VHS tapes in the pinned fixture environment (fixed repository, clock and identity), and nothing is hand-edited or cropped."
    - label: "Rebuilding"
      value: "‘make shots’ and ‘make demo’ rebuild every file on this page from those tapes. ‘SCALE’ renders them larger: the 2× captures here are ‘SCALE=2’."
    - label: "Test suites"
      value: "52 spec files across unit, render, pty terminal-grid, installer and perf-budget suites, plus golden files that fail when the prompt changes shape."
    - label: "CI"
      value: "Runs on Linux and macOS, against zsh 5.8."
    - label: "Diagnostics"
      value: "‘inzsh doctor’ prints one diagnostic block (zsh version, terminal, $TERM, colour depth, locale, Nerd Font, tmux), and never prints your coordinates."
# <!-- provisional: FAQ answers 2-4 pending rewrite -->
# Only the first answer is approved copy. Answers 2-4 are placeholders assembled
# from facts stated elsewhere on this page; the user has deferred rewriting them.
faq:
  kicker: "FAQ"
  heading: "Fair questions."
  items:
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
  ctaPrimary:
    label: "Install InZsh"
    href: "#get-started"
  ctaSecondary:
    label: "Read the source"
    href: "https://github.com/joeloudjinz/inzsh"
  facts: ["MIT", "no telemetry", "zsh 5.8+"]
credit: "The segment-rank idea — one integer per segment, controlling both order and visibility — comes from comfyline, by not pua. InZsh is an independent implementation."
---

<!-- provisional: FAQ answers 2-4 pending rewrite -->
