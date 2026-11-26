// The cycle lifecycle, the profit a close saves and its split, with the
// partners given Algerian names (D6). The income rows are the example shop's
// own close, so the close-sheet capture agrees with them.
export const cycle = {
  nodes: [
    {id: 'open', label: 'Cycle open', x: 180, y: 180},
    {id: 'closed', label: 'Closed', x: 500, y: 180, terminal: true},
    {id: 'next', label: 'Next cycle', x: 820, y: 180}
  ],
  edges: [
    {from: 'open', to: 'closed', label: 'close: snapshot, income, split'},
    {from: 'closed', to: 'next', label: 'the same transaction'}
  ]
};

export const cycleIncome = {
  rows: [
    {label: 'Sales in the cycle', amount: '651,142', tone: 'in' as const},
    {label: 'What those goods cost', amount: '−454,142', tone: 'out' as const},
    {label: 'Expenses', amount: '−85,000', tone: 'out' as const},
    {label: 'Cash counted below the book', amount: '−2,000', tone: 'out' as const}
  ],
  total: {label: 'Actual profit', amount: '110,000'}
};

export const profitSplit = [
  {label: 'Cycle income', value: 110000, kind: 'start' as const},
  {label: 'Amine, 20% work share, off the top', value: 22000, kind: 'minus' as const},
  {label: 'Investor pool', value: 88000, kind: 'result' as const},
  {label: 'Yacine, 75% of the capital', value: 66000, kind: 'result' as const},
  {label: 'Nadia, 25% of the capital', value: 22000, kind: 'result' as const}
];

// One drawer count, the example shop's of 27 October: what the drawer should
// hold against what was counted.
export const drawerCount = {
  rows: [
    {label: 'Left in the drawer at the last count', amount: '5,000'},
    {label: 'Cash payments since', amount: '+12,500', tone: 'in' as const},
    {label: 'The drawer should hold', amount: '17,500'},
    {label: 'Counted: 12,000 to the safe, 5,000 left', amount: '17,000'}
  ],
  total: {label: 'Short by', amount: '500'}
};
