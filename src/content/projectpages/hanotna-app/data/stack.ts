// The flavor table from the architecture finding, in DataTable's shape.
export const flavors = {
  columns: [
    {label: 'Setting', kind: 'sentence' as const, tone: 'strong' as const, width: 200},
    {label: 'Dev', kind: 'sentence' as const, tone: 'body' as const},
    {label: 'Staging', kind: 'sentence' as const, tone: 'body' as const},
    {label: 'Production', kind: 'sentence' as const, tone: 'body' as const}
  ],
  rows: [
    {cells: ['Firebase project', 'local emulators', 'its own project', 'its own project']},
    {cells: ['Crash reports, analytics, traces', 'off', 'on', 'on']},
    {cells: ['Offline cache', 'off', 'on', 'on']},
    {cells: ['Cache lifetimes', 'none', '10, 5 and 2 minutes', '15, 10 and 5 minutes']},
    {cells: ['Product photos', 'on, in the emulator', 'off, free plan', 'on']}
  ]
};
