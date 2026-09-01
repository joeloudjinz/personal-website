---
slug: "inzsh"
subdomain: "inzsh.abdellahaddoun.com"
projectName: "InZsh"
# Head-only. None of this renders on the page; the H1 is hero.heading and is
# untouched by anything here.
seo:
  # Leads with the words someone would actually type. "Oh My Zsh" is spelled the
  # way the project spells it, because that is what gets searched.
  title: "InZsh — a Zsh prompt theme with offline prayer times"
  # hero.promise is written for rhythm and opens on "A zsh prompt that stays
  # calm", which reads well under the H1 and tells a search result nothing. This
  # says what it is first and keeps the offline claim, which is the differentiator.
  description: "A configurable Zsh prompt theme for Oh My Zsh. Prayer times computed on your machine, no network calls, two presets and colours from the JoeInz design system."
  # Taken from the repository's own topics, so the two cannot drift apart.
  keywords:
    - "zsh theme"
    - "zsh prompt"
    - "oh my zsh"
    - "powerline"
    - "prayer times"
    - "salah times terminal"
    - "shell prompt"
    - "terminal"
    - "nerd font"
    - "InZsh"
  # There is no per-project share image, so this falls back to the site avatar.
  # The alt describes that photograph rather than the page, which is what an
  # assistive reader and a crawler are both being told about.
  imageAlt: "Abdellah Addoun — author of InZsh"
software:
  applicationCategory: "DeveloperApplication"
  operatingSystem: "macOS, Linux"
  # Matches the LICENSE the repository ships. Verified against the repo.
  license: "MIT"
  repository: "https://github.com/joeloudjinz/inzsh"
hero:
  kicker: "Zsh prompt theme · a JoeInz project"
  heading: "InZsh: a prompt that knows the hour."
  wash: "knows the hour"
  promise: "A zsh prompt that stays calm, bends to how you like it, and knows when the next prayer falls. Your machine does the maths."
  status: "Stable"
  version: "v2.0.2"
  ctaPrimary:
    label: "Install InZsh"
    href: "#get-started"
  ctaSecondary:
    label: "See the code"
    href: "https://github.com/joeloudjinz/inzsh"
  media:
    src: "../../assets/img/inzsh/showcase-2000.gif"
    # One rung, and not by choice. An animated capture skips the image pipeline —
    # one frame is what would come back — so the only candidates it can offer are
    # files somebody rendered, and upstream commits one render per tape. See
    # variants in content.config.ts.
    #
    # This shipped 1000 and 2000 until the 2.0 refresh. The 2000 was replaced from
    # the new tape, whose 1x upstream has not committed, so the smaller rung came
    # out rather than being faked by resampling the larger one. That is the call
    # the 1.5x rung got before it, and for the same reason: upstream's SCALE takes
    # 2, 3 or 4 and nothing between — SCALE=1.5 is refused before a frame is drawn
    # — so a rung we rendered ourselves would cost the reproduction claim the
    # verification band makes, which is the more valuable of the two.
    #
    # What it costs, measured: a 320 viewport took the 1000 at 652 KiB and now
    # takes the 2000 at 1.6 MiB. Unlike the 1.5x gap this one IS reproducible —
    # `make demo` with no SCALE writes the 1000 — so closing it is one command in
    # the upstream checkout and a file dropped in beside this one, rather than
    # something to work around here.
    alt: "A recording of the InZsh prompt, about two minutes long. Coordinates for Mecca are set and a prayer segment appears on the right of the prompt, reading Maghrib 17:50 beside the clock. A directory is created and entered, a repository is opened and its branch shown, a failing command marks the prompt with a cross. Then the look changes a setting at a time: every segment takes a colour of its own, the separators round off, the ribbon goes flat, and the dark sharp preset is redrawn as the light warm one. It ends on the row axis — the user and host segments move down to a second row and the clock moves to the end of that row, leaving a two-row prompt with rounded separators in the warm register, the prayer times and the clock still ranged right."
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
  # Five bands are in the header's section row, out of the nine a reader might
  # plausibly jump to. What is not here, and why:
  #
  #   rows     The band directly under this one, and the newest thing on the page.
  #            It is not in the row because the row is full, not because it does
  #            not deserve one: by src/utils/navFit.ts the five below add up to
  #            446px of the 480px the bar holds, and "Rows" is another 43.5px plus
  #            a 28px gap — 517.5px, over by 37.5. A reader who jumps to Segments
  #            scrolls into it, which is the same argument the gallery gets.
  #   commands Same arithmetic and worse: "Commands" is 85.5px, so six labels
  #            would be 559.5px. It sits directly under Install, which is in the
  #            row.
  #   gallery  Three full-width captures with nothing else in the band. It is the
  #            one section you cannot scroll past without noticing.
  #   specs    A reference list you consult once you have decided, rather than a
  #            place you arrive at. It sits between the gallery and the FAQ, both
  #            of which are a screen away.
  #
  # Not a taste call about which five look best. Five is what fits, the build says
  # so, and a sixth means giving one of these five up rather than widening the bar.
  navLabel: "Segments"
  kicker: "Segments · left, right, hidden"
  heading: "What the prompt draws, and in what order."
  # Ranks are written with a real minus, not a hyphen, for the reason the ranges
  # in the configuration band use a real en dash.
  intro: "One integer places a segment along a row and decides whether it is drawn at all. A positive rank puts it on the left, ascending from the left edge; a negative rank puts it on the right, running inward from the right edge; and the numbers need not be contiguous, so `1`, `4` and `10` order exactly as they read. A rank of `0` ships the segment hidden — the four rows reading hidden below are the ones sitting at `0` — and it appears the moment you give it another number. WHICH row is a separate question, and a newer one: `INZSH_ROW<N>_LEFT` and `INZSH_ROW<N>_RIGHT` answer it, and naming a segment in one of those arrays overrides its rank outright, a `0` included. That is the other way the four hidden segments below are switched on, and it is what the next band is about. Each segment also takes its own overrides — `INZSH_<SEGMENT>_RANK`, `_PRIORITY` (what is dropped first as the window narrows, which is a separate question from rank), `_BG`, `_FG` and `_MINCOLS`."
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
# The band the segment reference now leads into: that one is the set of parts,
# this one is how the set is laid out. Shipped with 1.3 and breaking in 2.0, so it
# is the newest thing on the page and the only headline feature the page has ever
# been missing.
#
# No navLabel, and not for want of deserving one — the header's row is full at
# five. The arithmetic is in the anatomy band's note above, where the rest of that
# reasoning already lives.
arrangement:
  kicker: "Rows · one prompt, several lines"
  heading: "Rank places a block along a row. Rows say which."
  standfirst: "Until 1.3 every block landed on the same row, and the only choice about lines was whether the input marker got one of its own. Rank still decides where a block sits along a row; `INZSH_ROW<N>_LEFT` and `INZSH_ROW<N>_RIGHT` now decide which row it is drawn on, and a segment named in one of them is placed and shown whatever its rank said."
  code:
    label: "Three values in .zshrc"
    lines:
      - text: "INZSH_ROW2_LEFT=(USER HOST)"
      - text: "INZSH_ROW2_RIGHT=(TIME)"
      - text: "INZSH_MARKER_ROW=own"
      - text: "# own · inline"
  media:
    src: "../../assets/img/inzsh/rows-2000.gif"
    alt: "A recording of the prompt gaining and losing rows. It begins as a single row — joeinz, joeinz-pc, the path ~/work and a branch segment reading main with a mark for uncommitted changes, with the clock at 12:34 ranged right. Setting INZSH_ROW2_LEFT moves the user and host segments down onto a second row; setting INZSH_ROW2_RIGHT moves the clock to the end of that second row; declaring row 4 puts the branch on a third row drawn directly beneath the second; the input marker then moves off its own line and onto the end of the last row. Everything is unset at the end and the prompt returns to the one row it started as, unchanged."
  rows:
    - label: "Which row"
      value: "`INZSH_ROW<N>_LEFT` and `INZSH_ROW<N>_RIGHT` take an array of segment names in draw order, `<N>` being `1` to `8`. Naming a segment there places and shows it, overriding `INZSH_<SEGMENT>_RANK` entirely — a registered `0` included, which is the other way the four hidden segments appear. `_MINCOLS` still applies: a row array places a segment, it cannot resurrect one the terminal has no room for."
    - label: "Sort keys, not slots"
      value: "Row numbers order the rows; they do not reserve them. Declare rows `1` and `4` and you get two rows, drawn next to each other, because a row with nothing on either side is not drawn at all. So there is no gap to leave and no renumbering to do when you take one out."
    - label: "Per side"
      value: "The override is per side of a row. Setting one row's left leaves its right to derive from rank as usual — and it leaves off everything else that would have landed on that left, rather than sliding it onto the right or onto another row."
    - label: "Arrays only"
      value: "A scalar assignment is refused rather than split on whitespace, so one string naming two segments behaves as if the variable were unset. These are the one family read outside the configuration registry, because every other validator on this page describes a single value rather than a list."
    - label: "Where you type"
      value: "`INZSH_MARKER_ROW` settles where the input marker sits. `own` gives it a bare line of its own below every drawn row, which is what the theme ships; `inline` ends the last drawn row with it instead, after that row's left-hand blocks, and you type on that row. Anything else falls back to `own`."
    - label: "When one will not fit"
      value: "Fitting is per row: content that will not fit is dropped on its own row and never relocated to another one. `inzsh doctor` names every segment, the row and side it landed on, and the reason where it did not — including a row-array entry that named no segment this build has, which is dropped before the prompt is ever drawn."
  links:
    - label: "The configuration reference"
      href: "https://github.com/joeloudjinz/inzsh/blob/dev/docs/configuration.md"
deepDive:
  navLabel: "Prayer times"
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
  navLabel: "Settings"
  # No kicker: this is the one band the approved design runs without one.
  heading: "Configured, not forked."
  # Do not describe narrow panes as a "mode" or a named size here. The product's
  # configuration reference records that the named steps (full, wide, narrow,
  # minimal, behind three INZSH_LADDER_*_COLS variables) were removed rather than
  # tuned, because fitting from real measurements turned out simpler and exact.
  # Nothing on this page may claim a feature the docs record as deleted.
  intro: "Nothing here needs a fork. Every setting declares what it takes, segments can be overridden individually, and `inzsh preset` changes the look without restarting your shell. The reference documents about fifty; these are the engine knobs, the ones that change the prompt rather than one part of it:"
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
          - "INZSH_MARKER_ROW"
          - ["own", "inline"]
          - "own"
          - "Where the input marker sits. `own` gives it a bare line of its own below every drawn row; `inline` ends the last drawn row with it, after that row's left-hand blocks, and you type on that row."
      - cells:
          - "INZSH_ROW<N>_LEFT"
          - ["an array of segment names"]
          - "unset"
          - "Which row a segment's left side draws on, in place of its rank. `<N>` is `1` to `8`, and the numbers sort the rows rather than reserving them. Arrays only: a scalar is refused rather than split on whitespace."
      - cells:
          - "INZSH_ROW<N>_RIGHT"
          - ["the same shape"]
          - "unset"
          - "The same, for a row's right side. The override is per side, so setting one leaves the other to derive from rank as usual."
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
  note: "Every knob states what it accepts and where it lands if you get it wrong. A bad value falls back instead of breaking your prompt. A misspelled name has nothing to validate against, so `inzsh doctor` reaches for the nearest registered name instead — and a name a past release retired gets its replacement named outright, since there is no spec left to refuse the value and nothing about the old name resembles the new one."
  link:
    label: "The configuration reference"
    href: "https://github.com/joeloudjinz/inzsh/blob/dev/docs/configuration.md"
steps:
  # "Install" and not "Get started": the row is nav items rather than headings,
  # and the band already says the longer thing twice, in its kicker and its CTAs.
  navLabel: "Install"
  kicker: "Get started"
  heading: "Three steps in."
  intro: "You’ll need zsh 5.8+ and a Nerd Font (the prompt draws powerline separators). The installer is reversible: `--uninstall` takes everything back out. If you would rather not keep a clone, every release attaches `inzsh.zsh-theme` — the whole library concatenated in dependency order — to be downloaded and sourced from .zshrc on its own. That is also the only shape in which `inzsh doctor` reports a version number, because the version is stamped into the bundle as it is built; installed from a source tree, the theme reports the literal word `source`."
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
# No navLabel, for the reason the anatomy band's note gives in pixels: the header
# row is full at five, and "Commands" is the widest of the labels that did not get
# in. It sits directly under Install, which is in the row.
usage:
  kicker: "Commands · what you can type"
  heading: "One command, four verbs."
  intro: "`inzsh` is the only name the theme puts in your namespace, and everything it offers to be typed is a subcommand of it. A value that names itself is positional — `inzsh preset warm` — and anything a reader would have to guess at takes a named flag instead, which is why the injected clock the pinned suites need is `--now <epoch>` and never a bare number."
  items:
    - label: "Diagnose"
      value: "`inzsh doctor` prints one block: the version, how it was installed and from where, the environment, the resolved prompt shape, where every segment landed and why, and any setting being ignored."
    - label: "Switch register"
      value: "`inzsh preset warm` switches a shell that is already running, from the next prompt on; `inzsh preset` alone says which is in force. It reads no file, so a clone and the bundle behave identically."
    - label: "Refresh the position"
      value: "`inzsh locate` looks your coordinates up only when the stored ones are past the TTL, so it is safe to run at every login. `--force` asks regardless. It is the only thing here that touches the network."
    - label: "Read the timetable"
      value: "`inzsh salah` prints the whole of today, `inzsh salah --days 7` today and the next six. The header names the method, the school and the zone shown — never your position, or anything derived from it."
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
  kicker: "Verification · 54 spec files"
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
      value: "54 spec files, 27 unit and 27 render, plus 11 terminal-grid tests driving a real pty, an installer suite against a throwaway HOME and a perf suite: 3,231 examples and 91 UI tests. Golden files fail when the prompt changes shape."
    # The millisecond figure is here now, and the reason it was withheld is gone.
    # The repo used to declare a 30 ms house budget while the benchmark gated the
    # render row at 12 ms, and quoting either would have been quoting the one that
    # suited us. Upstream settled it: 30 ms warm, stated in the configuration
    # reference as a property of the software — "options change what the prompt
    # looks like, never what it is allowed to cost" — and enforced on every push.
    #
    # 8.23 ms is still a fact about the machine that measured it, which is why the
    # sentence names CI as that machine rather than presenting the number bare.
    # The share of the budget is the part that travels.
    - label: "Render path"
      value: "No subprocesses: arithmetic and parameter expansion. Git status comes from a background worker and a cache, so a slow repository can’t stall it. Warm, it renders in 8.23 ms on CI against the 30 ms budget the build enforces — 27% of it, gated by 16 benchmarks."
    - label: "CI"
      value: "Runs on Linux and macOS, against zsh 5.8."
    - label: "Diagnostics"
      value: "`inzsh doctor` reports what resolved, not what a knob asked for: the shape actually drawn, where each segment landed and why, the prayer cache’s health, and every setting being ignored. Never your coordinates, and the theme root with `$HOME` collapsed to `~`."
# <!-- provisional: FAQ answers 2 and 3 pending rewrite -->
# Answers 2 and 3 are placeholders assembled from facts stated elsewhere on this
# page; the user has deferred rewriting them. The rest are approved copy: 1 always
# was, and the doctor answer was rewritten once doctor turned out to do more than
# print an environment block — then again at 2.0, when the block grew a version,
# an install method, a resolved shape and a line per segment. Answer 6 is new at
# 2.0 and is the one entry here addressed to somebody who already has the theme.
faq:
  navLabel: "FAQ"
  kicker: "FAQ"
  heading: "Fair questions."
  items:
    - q: "What leaves my machine?"
      a: "Nothing, unless you opt in. There’s no telemetry and there are no network calls by default. The one exception is `INZSH_SALAH_AUTOLOCATE=1`, which permits an IP-geolocation query, and even then it only happens when you run `inzsh locate` yourself. Manual coordinates avoid it entirely."
    - q: "How do I uninstall it?"
      a: "The installer is reversible: `--uninstall` takes everything back out. Your .zshrc was backed up at install time."
    - q: "Why do the colours look wrong in tmux?"
      a: "tmux needs RGB passthrough: `set -sa terminal-features ',*:RGB'`."
    # Approved copy, and deliberately the one entry here that admits a defect.
    # The terminals named as unaffected were each checked; do not add one to that
    # list without checking it, and do not describe INZSH_RESIZE_REFLOW as a fix.
    # It is arithmetic that should handle the re-wrap and has not been verified.
    - q: "Why does resizing VS Code leave copies of my prompt behind?"
      a: "Some terminals re-wrap the rows already on screen when the pane changes width, and every one of those events leaves another copy of the prompt behind. That is xterm.js, which means VS Code and Hyper. Native terminals are unaffected: the case was fixed and verified on Ghostty, Terminal.app, kitty, iTerm2, Alacritty and WezTerm. Two ways round it in the meantime. `INZSH_RESIZE_REFLOW=1` turns on arithmetic that should handle the re-wrap, though that path is unverified. `INZSH_RESIZE=0` turns the redraw off altogether, which leaves one stale prompt until your next Enter rather than a column of them. Tracked as issue #215, and written up on the project’s limitations page."
    # The sample line is the shape doctor really prints, down to the spacing and
    # the middle dots. The rejected value in it is NOT the one pasted from a real
    # run, and the swap is not cosmetic. Tailwind scans this file as raw bytes and
    # splits a candidate at "=", and the value from that run is also the name of a
    # border-radius utility — so the line as pasted put a live radius rule into the
    # bundle all 36 pages load, measured. "arrows" is the same kind of typo of the
    # same setting, is rejected the same way, and names no utility. Check any
    # replacement against the note in tailwind.config.mjs before editing this line.
    - q: "What is `inzsh doctor` for?"
      a: "Three questions now, where it started with two. What is running: the version, how it was installed and from where — with your home directory collapsed to `~`, so the path is real and your account name is not. What the prompt actually resolved to: the shape it drew, the separator that really drew and a note when that is not the one you asked for, and a line per segment giving the row and side it landed on, or the reason it landed nowhere. And what is being ignored: every value the theme refused, with the vocabulary it should have used, a line each — `ignored INZSH_SEPARATOR_STYLE=arrows - accepts arrow · round · divider` — plus the nearest registered name for one it does not recognise, the replacement for one a past release retired, and any row-array entry that named no segment this build has. The prayer segment gets two rows of its own: where the position came from, and whether today’s table is cached. Nothing is printed when everything is valid, and your coordinates are never printed at all, so the block stays safe to paste into a public issue."
    - q: "I’m on 1.x. What did 2.0 remove?"
      a: "Two names, and neither of them quietly. `INZSH_PROMPT_LINES` was `INZSH_MARKER_ROW`’s deprecated alias through 1.x — `1` meant `inline`, `2` meant `own` — and 2.0.0 removed it rather than carry two names for one fact indefinitely. A .zshrc still setting it draws exactly as if that line were not there: never an error, never a wrong shape. And `inzsh doctor` names both the replacement and the value that means what yours meant, so a line left behind is a row in the block rather than a setting that quietly stopped counting. The other is the injected clock the pinned suites need, which was `inzsh locate <epoch>` and is now `inzsh locate --now <epoch>`: a positional argument is only allowed where the value names itself, and an epoch does not."
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

<!-- provisional: FAQ answers 2 and 3 pending rewrite -->
