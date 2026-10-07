// The raster-to-SVG pipeline from the design-and-RTL finding.
export const markPipeline = {
  nodes: [
    {id: 'raster', label: 'Flat raster artwork', x: 130, y: 70, w: 200, lane: 'd' as const},
    {id: 'inks', label: 'Split into inks', x: 500, y: 70, lane: 'a' as const},
    {id: 'trace', label: 'Trace each ink', x: 870, y: 70, lane: 'a' as const},
    {id: 'hexes', label: 'Recolour to the brand hexes', x: 870, y: 200, w: 240, lane: 'b' as const},
    {id: 'variants', label: 'Variants by fill swap', x: 500, y: 200, w: 220, lane: 'b' as const},
    {id: 'verify', label: 'Rendered at 512, 48 and 32', x: 130, y: 200, w: 240, lane: 'c' as const}
  ],
  edges: [
    {from: 'raster', to: 'inks', label: 'nearest reference colour'},
    {from: 'inks', to: 'trace', label: 'potrace per ink'},
    {from: 'trace', to: 'hexes'},
    {from: 'hexes', to: 'variants'},
    {from: 'variants', to: 'verify'}
  ]
};
