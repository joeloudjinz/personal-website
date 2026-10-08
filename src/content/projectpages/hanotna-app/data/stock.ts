// The recount strip is the app's own comment text; the eight adjustment types
// are StockAdjustmentType, both from the commerce finding.
export const recount = {
  rows: [
    {label: 'In the book before the count', amount: '24 pcs'},
    {label: 'Counted on the shelf', amount: '27 pcs'}
  ],
  total: {label: 'Adjustment written to the log', amount: '+3 pcs'}
};

export const adjustmentTypes = [
  {label: 'manual', note: 'a recount by hand'},
  {label: 'bill', note: 'a recount tagged to a supplier bill'},
  {label: 'order_confirm', note: 'a sale confirmed'},
  {label: 'order_edit', note: 'a confirmed sale edited'},
  {label: 'order_cancel', note: 'a sale cancelled'},
  {label: 'return', note: 'goods returned'},
  {label: 'service_material', note: 'material consumed'},
  {label: 'service_cancel', note: 'material restocked'}
];
