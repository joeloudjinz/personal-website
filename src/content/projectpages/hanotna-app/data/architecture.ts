// The layers and counts from the architecture finding. The seam sits under
// the ports: Firebase is imported nowhere above it, and a test proves it.
export const layers = [
  {name: 'Entry points', detail: 'main_dev, main_staging, main_prod: one line each, the only place a backend is chosen', count: '3 files'},
  {name: 'Screens and widgets', detail: 'the user interface, organised by feature', count: '182 files'},
  {name: 'Providers', detail: 'Riverpod with code generation: lifecycle and derived state', count: '193'},
  {name: 'Use cases and repositories', detail: 'thin write facades, and a three-layer cache in front of reads', count: '12 + 13'},
  {name: 'Ports', detail: 'abstract interfaces: the contract every backend must keep', count: '21'},
  {name: 'Adapters and codecs', detail: 'Firestore adapters, 22 wire codecs, the composition root', count: '60 files'},
  {name: 'Firebase', detail: 'Firestore, Auth, Storage, Crashlytics, Analytics, Performance'}
];
export const seamAfter = 4;
export const seamLabel = 'Firebase imports only below this line. A test proves it.';

// Who uses whom, checked edge by edge in the source.
export const importEdges = {
  nodes: [
    {id: 'screens', label: 'Screens', x: 100, y: 200, lane: 'a' as const},
    {id: 'usecases', label: 'Use cases', x: 560, y: 60, lane: 'b' as const},
    {id: 'ports', label: 'Ports', x: 860, y: 60, lane: 'c' as const},
    {id: 'providers', label: 'Providers', x: 360, y: 210, lane: 'b' as const},
    {id: 'repositories', label: 'Repositories', x: 660, y: 210, lane: 'b' as const},
    {id: 'widgets', label: 'Widgets', x: 360, y: 340, lane: 'a' as const},
    {id: 'shared', label: 'Models, config, utilities', x: 660, y: 340, w: 220, lane: 'd' as const},
    {id: 'backend', label: 'Firebase adapters', x: 900, y: 340, w: 180, lane: 'd' as const}
  ],
  edges: [
    {from: 'screens', to: 'widgets'},
    {from: 'screens', to: 'providers'},
    {from: 'screens', to: 'shared'},
    {from: 'providers', to: 'usecases'},
    {from: 'providers', to: 'repositories'},
    {from: 'providers', to: 'ports'},
    {from: 'usecases', to: 'ports'},
    {from: 'repositories', to: 'ports'},
    {from: 'backend', to: 'ports'},
    {from: 'backend', to: 'shared'}
  ]
};
