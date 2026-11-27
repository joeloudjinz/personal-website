// icons.ts — inner SVG markup copied from the design boards. Wrap each in the <svg> given in the comment.

/** Nav icons: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"> styled by .sp-navlink svg */
export const navIcons = {
  "home": "<path d=\"M3 11.5 12 4l9 7.5\"/><path d=\"M5.5 10v9.5h13V10\"/>",
  "window": "<rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12\" rx=\"2.5\"/><path d=\"M9 7.5V5.5h6v2\"/>",
  "pen": "<path d=\"M4 20l4-1 11-11-3-3L5 16l-1 4z\"/><path d=\"M14 6l3 3\"/>",
  "person": "<circle cx=\"12\" cy=\"8.5\" r=\"3.5\"/><path d=\"M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5\"/>",
  "bubble": "<path d=\"M4 5.5h16v10H9l-5 4z\"/>"
} as const;

/** Top-row icons: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"> */
export const sunIcon = "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6\"/>";
export const moonIcon = "<path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z\"/>";
export const pauseIcon = "<rect x=\"6\" y=\"5\" width=\"4\" height=\"14\" rx=\"1.5\"/><rect x=\"14\" y=\"5\" width=\"4\" height=\"14\" rx=\"1.5\"/>";
export const playIcon = "<path d=\"M8 5.5v13l10.5-6.5z\"/>";
/** Replay intro: <svg viewBox="0 0 24 24" width="14" height="14"> */
export const replayIcon = "<path d=\"M4 12a8 8 0 1 0 2.4-5.7\"/><path d=\"M4 4v4.5h4.5\"/>";

/** The AA mark: <svg viewBox="0 0 240 240" width="32" height="32"> (24 in the footer) */
export const aaMark = "<circle cx=\"120\" cy=\"120\" r=\"118\" style=\"fill: var(--text-strong);\"/><g transform=\"translate(4.72 14.4) scale(0.88)\" style=\"fill: var(--surface);\"><path d=\"M70 68 86 68 55 172 38 172Z M72 68 88 68 118 172 94 172Z M52 138 102 138 102 151 52 151Z M29 172 Q29.5 166.5 36 164.5 L56 164.5 Q61.5 166.5 62 172Z M86 172 Q86.5 166.5 92 164.5 L120 164.5 Q125.5 166.5 126 172Z M177 68 193 68 162 172 145 172Z M179 68 195 68 225 172 201 172Z M159 138 209 138 209 151 159 151Z M136 172 Q136.5 166.5 143 164.5 L163 164.5 Q168.5 166.5 169 172Z M193 172 Q193.5 166.5 199 164.5 L227 164.5 Q232.5 166.5 233 172Z\"/></g>";
