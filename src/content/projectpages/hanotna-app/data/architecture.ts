// The layers and counts from the architecture finding. The seam sits under
// the ports: Firebase is imported nowhere above it, and a test proves it.
export const layers = [
  {name: 'Entry points', detail: 'main_dev, main_staging, main_prod: one line each, the only place a backend is chosen', count: '3 files'},
  {name: 'Screens and widgets', detail: 'the user interface, organised by feature', count: '143 files'},
  {name: 'Providers', detail: 'Riverpod with code generation: lifecycle and derived state', count: '175'},
  {name: 'Use cases and repositories', detail: 'thin write facades, and a three-layer cache in front of reads', count: '12 + 13'},
  {name: 'Ports', detail: 'abstract interfaces: the contract every backend must keep', count: '21'},
  {name: 'Adapters and codecs', detail: 'Firestore adapters, 22 wire codecs, the composition root', count: '60 files'},
  {name: 'Firebase', detail: 'Firestore, Auth, Storage, Crashlytics, Analytics, Performance'}
];
export const seamAfter = 4;
export const seamLabel = 'Firebase imports only below this line. A test proves it.';
