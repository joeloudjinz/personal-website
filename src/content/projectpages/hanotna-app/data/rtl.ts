// Three runs inside Arabic sentences, from the design-and-RTL finding. The
// browser draws both forms; `fix` says which one the app ships.
export const bidiCases = [
  {
    label: 'A signed amount',
    before: '', run: '−1,250', after: ' د.ج',
    fix: 'isolate' as const,
    note: 'Typed as is, the minus sign drifts to the far side of the number. The app wraps the sign and digits in an isolate, never the currency, so the amount reads as the cashier meant it.'
  },
  {
    label: 'A date stamp',
    before: 'أُضيف ', run: '2026-08-27', after: '',
    fix: 'isolate' as const,
    note: 'A bare ISO date inside an Arabic sentence comes out day first. The isolate keeps it year first, which is what the stamp means.'
  },
  {
    label: 'A date range with Arabic words',
    before: '', run: '12 سبتمبر – 11 أكتوبر 2026', after: '',
    fix: 'bare' as const,
    note: 'Here the run holds Arabic words, and forcing it left to right strands the 12 at the far end of the line. The rule is: a run with no Arabic gets an isolate, a run with an Arabic word never does.'
  }
];
