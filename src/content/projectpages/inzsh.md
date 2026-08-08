---
slug: "inzsh"
subdomain: "inzsh.abdellahaddoun.com"
projectName: "InZsh"
hero:
  kicker: "Zsh prompt theme · a JoeInz project"
  heading: "InZsh: a prompt that knows the hour."
  wash: "knows the hour"
  promise: "A zsh prompt that stays calm, bends to how you like it, and knows when the next prayer falls. Your machine does the maths."
  status: "In progress"
  version: "v0.1.0"
  ctaPrimary:
    label: "Install InZsh"
    href: "#get-started"
  ctaSecondary:
    label: "See the code"
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
      label: "`sharp` (dark, the default) · `warm` (light)"
    - value: "No network"
      label: "No calls by default · autolocate is opt-in"
    - value: "Zero"
      label: "Dependencies beyond zsh itself"
why:
  kicker: "Why it exists"
  heading: "Three things I wanted from a prompt."
  paragraphs:
    - "I wanted prayer times in my prompt. Not fetched from a web service, just worked out on my own machine from coordinates I set once. That’s where this started."
    - "Two other things came with it. Every colour in the prompt has a defined job and a contrast ratio that was measured rather than eyeballed, so it holds up on screens I’ve never seen. And every setting declares the values it accepts and what it falls back to, so a typo quietly degrades the prompt instead of breaking it."
    - "That last part is the one I care about most. The knobs are the architecture rather than a layer on top, so whatever comes next should arrive as new settings rather than a rewrite."
anatomy:
  kicker: "Segments · left, right, hidden"
  heading: "What the prompt draws, and in what order."
  # Ranks are written with a real minus, not a hyphen, for the reason the ranges
  # in the configuration band use a real en dash.
  intro: "One integer settles both questions about a segment. A positive rank puts it on the left, ascending from the left edge; a negative rank puts it on the right, running inward from the right edge. A rank of `0` ships the segment hidden, and it appears the moment you give it one: the rows reading hidden below are the ones sitting at `0`. Every segment then takes its own overrides, `INZSH_<SEGMENT>_RANK`, `_PRIORITY` (what is dropped first as the window narrows, which is a separate question from rank), `_BG`, `_FG` and `_MINCOLS`."
  table:
    columns:
      - label: "Segment"
        kind: tokens
        tone: strong
        width: 150
      - label: "Rank"
        kind: tokens
        tone: muted
        width: 90
      - label: "What it shows"
        kind: sentence
        tone: muted
    rows:
      - cells: ["root", "10", "That you are root."]
      - cells: ["user", "20", "Your username."]
      - cells: ["host", "30", "The hostname."]
      - cells: ["dir", "40", "The working directory, truncated to fit."]
      - cells: ["git", "50", "The branch, or the commit when you are detached, a glyph for the state (clean, dirty, staged, detached) and how far ahead or behind you are. Worked out by a background worker, never on the render path."]
      - cells: ["venv", "60", "The active Python virtualenv."]
      - cells: ["retval", "70", "The exit status of the last command, with a glyph. It reads pipelines, and it names signals."]
      - cells: ["time", "−10", "The clock."]
      - cells: ["salah", "−20", "The next prayer and the time it falls."]
      - cells: ["ssh", "hidden", "That you are on a remote session."]
      - cells: ["jobs", "hidden", "Background jobs this shell is holding."]
      - cells: ["duration", "hidden", "How long the last command took, once it passes a threshold; `3` seconds by default."]
      - cells: ["date", "hidden", "The calendar day, as opposed to the time of day."]
deepDive:
  kicker: "Prayer times · computed locally"
  heading: "Prayer times, in the prompt."
  standfirst: "Your machine does the calculation, from coordinates you give it or, if you ask, ones it looks up once. The times are never fetched, and the segment stays hidden until you set it up."
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
      value: "`MWL` Muslim World League · `ISNA` Islamic Society of North America · `UmmAlQura` Umm al-Qura University, Makkah · `Egyptian` Egyptian General Authority of Survey · `Karachi` University of Islamic Sciences, Karachi · `Algeria` Ministry of Religious Affairs and Wakfs, Algeria; default `MWL`."
    - label: "Aliases:"
      value: "`Makkah`, `Mecca`, `UmmAlQuraUniversity`, `Egypt` and `MuslimWorldLeague` all resolve; matching ignores case, spacing and punctuation."
    - label: "Asr:"
      value: "`standard` · `shafi` · `hanafi`; default `standard`."
    - label: "Two details"
      value: "Umm al-Qura sets isha at a fixed 90 minutes after maghrib rather than by an angle. And maghrib is sunset for every method shipped here, which is where a method-specific offset would go if one were ever added."
    - label: "Accuracy"
      value: "These are calculations, not announcements from your masjid, so a local timetable can differ by a few minutes. Six offset knobs exist for exactly that: `INZSH_SALAH_OFFSET_FAJR` and its siblings nudge any prayer up to three hours either way. The nudge is display only, so moving maghrib doesn’t move an isha measured as an interval from it."
    - label: "High latitudes"
      value: "`INZSH_SALAH_HIGHLAT` takes `angle` · `seventh` · `middle` · `none`; default `angle`. It decides what happens at latitudes where the sun never reaches the depression angle and fajr or isha would otherwise not exist; `none` leaves the prayer absent rather than inventing one."
    - label: "Privacy"
      value: "There’s one way this touches the network, and you switch it on twice. `INZSH_SALAH_AUTOLOCATE` permits a lookup; the request happens only when you run `inzsh locate`. It’s one HTTPS GET to a URL you can read and change, so you can point it at your own service. Whoever answers sees your public IP, which is what they’re asked to turn into a position. Set coordinates by hand and none of it applies."
  links:
    - label: "How the prayers are defined"
      href: "https://praytimes.org/calculation"
    - label: "The solar arithmetic (USNO)"
      href: "https://aa.usno.navy.mil/faq/sun_approx"
    - label: "The authorities’ parameters"
      href: "https://api.aladhan.com/v1/methods"
    - label: "The API our tests check against"
      href: "https://api.aladhan.com/v1/timings"
config:
  # No kicker: this is the one band the approved design runs without one.
  heading: "Configured, not forked."
  # Do not describe narrow panes as a "mode" or a named size here. The product's
  # configuration reference records that the named steps (full, wide, narrow,
  # minimal, behind three INZSH_LADDER_*_COLS variables) were removed rather than
  # tuned, because fitting from real measurements turned out simpler and exact.
  # Nothing on this page may claim a feature the docs record as deleted.
  intro: "Nothing here needs a fork. Every setting declares what it takes, segments can be overridden individually, and `inzsh preset` changes the look without restarting your shell. The engine knobs:"
  # Columns, then rows of cells in that order. The headers are copy, not the
  # component's: "fallback" prints as "Default" here. The widths are the four
  # this band was drawn at; a band with three columns declares its own.
  table:
    columns:
      - label: "Knob"
        kind: tokens
        tone: strong
        width: 250
      - label: "Values"
        kind: tokens
        tone: body
        width: 210
      - label: "Default"
        kind: tokens
        tone: muted
        width: 90
      - label: "Effect"
        kind: sentence
        tone: muted
    rows:
      - cells:
          - "INZSH_PRESET"
          - ["sharp", "warm"]
          # Registered with an empty default (lib/core/config.zsh), which means
          # "leave the built-in register alone" — and that register is the dark
          # one. "sharp" is true in effect but not literally, so the cell says
          # unset.
          - "unset"
          - "Which register is drawn. Unset leaves the built-in one, which is the dark register. Read once, when the theme is sourced, so set it in .zshrc above the line that sources the theme."
      - cells:
          - "INZSH_SURFACE_MODE"
          - ["alternate", "ramp", "flat", "hue"]
          - "alternate"
          - "How segment backgrounds are assigned."
      - cells:
          - "INZSH_SEPARATOR_STYLE"
          - ["arrow", "round", "divider"]
          - "arrow"
          - "The glyph between two segments. `arrow` and `round` need a Nerd Font; `divider` needs only box drawing."
      - cells:
          - "INZSH_SEGMENT_PAD"
          - ["0–4"]
          - "1"
          - "Columns of air either side of every block."
      - cells:
          - "INZSH_TRANSIENT"
          - ["1", "0"]
          - "1"
          - "Collapses the prompt to its minimal form after a command is accepted, so scrollback reads as commands and output."
      - cells:
          - "INZSH_DIR_COMPONENTS"
          - ["non-negative integer"]
          - "0"
          - "Caps how many trailing path components stay before truncation. `0` is the whole path."
      - cells:
          - "INZSH_GIT_TIMEOUT"
          - ["1–60"]
          - "2"
          - "Seconds before the git call is killed."
  note: "Every knob states what it accepts and where it lands if you get it wrong. A bad value falls back instead of breaking your prompt."
  link:
    label: "The configuration reference"
    href: "https://github.com/joeloudjinz/inzsh/blob/dev/docs/configuration.md"
steps:
  kicker: "Get started"
  heading: "Three steps in."
  intro: "You’ll need zsh 5.8+ and a Nerd Font (the prompt draws powerline separators). The installer is reversible: `--uninstall` takes everything back out."
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
      note: "Goes in .zshrc, above the line that sources the theme. It’s only read at load, so below won’t take."
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
  intro: "Two presets, one palette. `sharp` is dark, `warm` is light and a little warmer. The last shot is the same prompt on a terminal limited to 256 colours."
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
      value: "Needs RGB passthrough: `set -sa terminal-features ',*:RGB'`"
    - label: "Not supported"
      value: "Linux TTY and other bare consoles"
    - label: "Optional"
      value: "oh-my-zsh"
    - label: "License"
      value: "MIT"
pillars:
  # Be careful here. The product's docs/limitations.md is explicit that nothing
  # in the repo measures contrast and there is no colour-vision simulation step,
  # by hand or otherwise. This band used to claim both were automated; they are
  # not. Only the glyph rule is enforced by the suite. Do not restore a card that
  # says the palette is "checked", "verified" or "tested" for contrast or CVD.
  kicker: "Colour · designed, and where it stops"
  heading: "It stays readable."
  cards:
    - title: "Contrast designed to AA."
      body: "Worked out pair by pair when the palette was built, with the ratios written down beside the colours in the token layer. That is design work on the record, not a gate: no test measures it."
    - title: "Never colour alone."
      body: "No state is signalled by colour only; each one carries a glyph. This one the suite enforces, and it fails if a state loses its mark."
    - title: "An honest fallback."
      body: "256-colour terminals get a hand-tuned palette that holds the theme’s shape. It’s close rather than identical, and says so."
verification:
  kicker: "Verification · 52 spec files"
  heading: "Built not to break."
  rows:
    # Still two rows, but the second is a recipe that runs now. It had to be
    # written as a disclaimer once: `make shots` rendered three tapes at their
    # pinned size, `make demo` wrote GIFs into a scratch directory, and there was
    # no scale knob, so no command named here rebuilt a file the page shipped.
    #
    # At b9693ff all three are gone. `shots` writes four stills into docs/assets,
    # `demo` publishes the showcase it renders, and `SCALE` re-renders each tape at
    # multiplied pinned dimensions. Every file in src/assets/img/inzsh came out of
    # those two commands — checked by running them, not by reading the Makefile.
    #
    # The first row was true as written and is untouched.
    - label: "Fixtures"
      value: "Every still and recording here is rendered from the project’s VHS tapes in the pinned fixture environment (fixed repository, clock and identity), and nothing is hand-edited or cropped."
    - label: "Rebuilding"
      value: "`make shots` and `make demo` rebuild every file on this page from those tapes. `SCALE` renders them larger: the 2× captures here are `SCALE=2`."
    - label: "Test suites"
      value: "52 spec files across unit, render, pty terminal-grid, installer and perf-budget suites, plus golden files that fail when the prompt changes shape."
    # No millisecond figure here, deliberately. A measured time is a fact about
    # the machine that measured it, and every other number on this page is a
    # property of the software that holds wherever it runs. The repo also
    # declares a 30 ms house budget while the benchmark gates the render row at
    # 12 ms; until that is settled upstream, quoting either would be quoting the
    # one that suited us.
    - label: "Render path"
      value: "No subprocesses at all: arithmetic and parameter expansion. Git status comes from a background worker and a cache, so a slow repository can’t stall it. 16 benchmarks gate it; a breach fails the build."
    - label: "CI"
      value: "Runs on Linux and macOS, against zsh 5.8."
    - label: "Diagnostics"
      value: "`inzsh doctor` prints one diagnostic block (zsh version, terminal, `$TERM`, colour depth, locale, Nerd Font, tmux), and never prints your coordinates."
# <!-- provisional: FAQ answers 2-4 pending rewrite -->
# Only the first answer is approved copy. Answers 2-4 are placeholders assembled
# from facts stated elsewhere on this page; the user has deferred rewriting them.
faq:
  kicker: "FAQ"
  heading: "Fair questions."
  items:
    - q: "What leaves my machine?"
      a: "Nothing, unless you opt in. There’s no telemetry and there are no network calls by default. The one exception is `INZSH_SALAH_AUTOLOCATE=1`, which permits an IP-geolocation query, and even then it only happens when you run `inzsh locate` yourself. Manual coordinates avoid it entirely."
    - q: "How do I uninstall it?"
      a: "The installer is reversible: `--uninstall` takes everything back out. Your .zshrc was backed up at install time."
    - q: "Why do the colours look wrong in tmux?"
      a: "tmux needs RGB passthrough: `set -sa terminal-features ',*:RGB'`."
    - q: "What is `inzsh doctor` for?"
      a: "It prints one diagnostic block (zsh version, terminal, `$TERM`, colour depth, locale, Nerd Font, tmux), and never prints your coordinates."
closing:
  heading: "Give your prompt a system."
  wash: "system"
  sub: "The installer is reversible, or read the source first."
  ctaPrimary:
    label: "Install InZsh"
    href: "#get-started"
  ctaSecondary:
    label: "Read the source"
    href: "https://github.com/joeloudjinz/inzsh"
  facts: ["MIT", "no telemetry", "zsh 5.8+"]
credit: "The segment-rank idea (one integer per segment, controlling both order and visibility) comes from comfyline, by not pua. InZsh is an independent implementation."
---

<!-- provisional: FAQ answers 2-4 pending rewrite -->
