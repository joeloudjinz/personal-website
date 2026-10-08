// The worked example from the orders chapter 04-money-and-credit: a credit
// sale of 1,000 with 400 received, a repayment of 300, then a cancel.
export const creditSale = {
  rows: [
    {label: 'Credit sale of 1,000, 400 received at the counter', amount: '+400', tone: 'in' as const},
    {label: 'Repayment a week later', amount: '+300', tone: 'in' as const},
    {label: 'The order is cancelled, the money goes back', amount: '−700', tone: 'out' as const}
  ],
  total: {label: 'What the ledger adds up to', amount: '0'}
};
