// The cycle lifecycle from capital chapter 01, and the two worked examples
// from capital chapter 03, with the partners given Algerian names (D6).
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
    {label: 'Business value rose from 500,000 to 620,000', amount: '+120,000', tone: 'in' as const},
    {label: 'Partners took out 30,000 more than before', amount: '+30,000', tone: 'in' as const},
    {label: 'Partners put in 40,000 more than before', amount: '−40,000', tone: 'out' as const}
  ],
  total: {label: 'Cycle income', amount: '110,000'}
};

export const profitSplit = [
  {label: 'Cycle income', value: 110000, kind: 'start' as const},
  {label: 'Amine, 20% work share, off the top', value: 22000, kind: 'minus' as const},
  {label: 'Investor pool', value: 88000, kind: 'result' as const},
  {label: 'Yacine, 75% of the capital', value: 66000, kind: 'result' as const},
  {label: 'Nadia, 25% of the capital', value: 22000, kind: 'result' as const}
];
