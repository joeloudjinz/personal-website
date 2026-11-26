// The recount strip is the app's own comment text; the six adjustment types
// are the ones StockAdjustmentType carries for products on the shelf.
export const recount = {
  rows: [
    {label: 'In the book before the count', amount: '24 pcs'},
    {label: 'Counted on the shelf', amount: '27 pcs'}
  ],
  total: {label: 'Adjustment written to the log', amount: '+3 pcs'}
};

export const adjustmentTypes = [
  {label: 'manual', note: 'a recount, or opening stock with no bill'},
  {label: 'bill', note: 'stock received against a supplier bill'},
  {label: 'order_confirm', note: 'a sale confirmed'},
  {label: 'order_edit', note: 'a confirmed sale edited'},
  {label: 'order_cancel', note: 'a sale cancelled'},
  {label: 'return', note: 'goods returned, put back on the shelf or not'}
];
