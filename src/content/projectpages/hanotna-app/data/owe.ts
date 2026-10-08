// Karim's settlement, the pinned test from the v4.3 staff-pay spec: 1,500 a
// day, Saturday to Thursday, started 12 September 2026.
export const period = [
  {value: '26', label: 'days scheduled from 12 Sep to 11 Oct'},
  {value: '1', label: 'day off, paid'},
  {value: '1', label: 'day off, unpaid'},
  {value: '25', label: 'days paid'}
];

export const settlement = [
  {label: '25 days at 1,500', value: 37500, kind: 'start' as const},
  {label: 'Advance already paid', value: 10000, kind: 'minus' as const},
  {label: 'Left to settle', value: 27500, kind: 'result' as const}
];
