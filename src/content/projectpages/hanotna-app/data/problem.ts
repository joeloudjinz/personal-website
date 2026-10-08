// The four parties money moves between, from the product-story and capital
// findings. Lanes: a customers, b partners, c suppliers, d the running costs.
export const actors = {
  nodes: [
    {id: 'store', label: 'The shop’s cash', x: 500, y: 180, w: 200},
    {id: 'customers', label: 'Customers', x: 150, y: 70, lane: 'a' as const},
    {id: 'partners', label: 'Partners', x: 850, y: 70, lane: 'b' as const},
    {id: 'suppliers', label: 'Suppliers', x: 150, y: 290, lane: 'c' as const},
    {id: 'costs', label: 'Rent, wages, bills', x: 850, y: 290, lane: 'd' as const}
  ],
  edges: [
    {from: 'customers', to: 'store', label: 'cash and credit sales'},
    {from: 'partners', to: 'store', label: 'capital in'},
    {from: 'store', to: 'partners', label: 'profit split'},
    {from: 'store', to: 'suppliers', label: 'bills paid'},
    {from: 'store', to: 'costs', label: 'expenses'}
  ]
};
