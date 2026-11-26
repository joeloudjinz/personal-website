// Three runs the app has to get right. The browser draws both forms; `fix`
// says which one the app ships.
export const bidiCases = [
  {
    label: 'A signed amount',
    before: '', run: '−1,250', after: ' د.ج',
    fix: 'isolate' as const,
    note: 'Typed as is, the minus sign drifts to the far side of the number. The app wraps the sign and digits in an isolate, never the currency, so the amount reads as the cashier meant it.'
  },
  {
    label: 'A date stamp',
    before: 'منذ ', run: '2026-08-01 08:50', after: '',
    fix: 'isolate' as const,
    note: 'A bare stamp inside an Arabic sentence comes out with its parts in reverse: the time, then the day, the month and the year. The isolate keeps it as one run, year first, which is what the stamp means.'
  },
  {
    label: 'A date range with Arabic words',
    before: '', run: '12 سبتمبر 2026 – 11 أكتوبر 2026', after: '',
    fix: 'bare' as const,
    note: 'Here the run holds Arabic words, and forcing it left to right strands the 12 at the far end of the line. The rule is: a run with no Arabic letters gets a left-to-right isolate, and a run holding an Arabic word does not get that one.'
  }
];
