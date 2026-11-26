// The product-order lifecycle, from Hanotna's ProductOrderStatus enum and the
// screens that move an order: New sale, a draft's page and an order's page.
// The edge labels are the buttons' own. Coordinates are on the StateMachine's
// 1000-wide grid.
export const productOrder = {
  nodes: [
    {id: 'start', label: 'New', x: 100, y: 180},
    {id: 'draft', label: 'Draft', x: 360, y: 60},
    {id: 'confirmed', label: 'Confirmed', x: 620, y: 180},
    {id: 'cancelled', label: 'Cancelled', x: 940, y: 180, terminal: true},
    {id: 'deleted', label: 'Deleted', x: 100, y: 60, terminal: true}
  ],
  edges: [
    {from: 'start', to: 'draft', label: 'Save as draft'},
    {from: 'start', to: 'confirmed', label: 'Confirm sale'},
    {from: 'draft', to: 'confirmed', label: 'Confirm sale'},
    {from: 'draft', to: 'deleted', label: 'Delete draft'},
    {from: 'confirmed', to: 'cancelled', label: 'Cancel order: restock, refund'}
  ]
};
