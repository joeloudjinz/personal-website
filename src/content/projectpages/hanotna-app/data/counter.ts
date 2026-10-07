// The product-order lifecycle, from Hanotna's ProductOrderStatus enum and the
// orders chapter 01-state-machines: draft, confirmed, cancelled, plus the two
// ends of the road. Coordinates are on the StateMachine's 1000-wide grid.
export const productOrder = {
  nodes: [
    {id: 'start', label: 'New', x: 100, y: 180},
    {id: 'draft', label: 'Draft', x: 360, y: 60},
    {id: 'confirmed', label: 'Confirmed', x: 620, y: 180},
    {id: 'cancelled', label: 'Cancelled', x: 900, y: 180, terminal: true},
    {id: 'deleted', label: 'Deleted', x: 360, y: 290, terminal: true}
  ],
  edges: [
    {from: 'start', to: 'draft', label: 'save a draft'},
    {from: 'start', to: 'confirmed', label: 'quick sale'},
    {from: 'draft', to: 'confirmed', label: 'confirm'},
    {from: 'draft', to: 'deleted', label: 'delete'},
    {from: 'draft', to: 'cancelled', label: 'cancel'},
    {from: 'confirmed', to: 'cancelled', label: 'cancel, restock, refund'}
  ]
};
