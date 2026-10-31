// The flavor table from the architecture finding: one value per build, in the
// order of the titles.
export const flavors = {
  titles: ['Dev', 'Staging', 'Production'],
  rows: [
    {label: 'Firebase project', values: ['local emulators', 'its own project', 'its own project']},
    {label: 'Crash reports, analytics, traces', values: ['off', 'on', 'on']},
    {label: 'Offline cache', values: ['off', 'on', 'on']},
    {label: 'Cache lifetimes', values: ['none', '10, 5 and 2 minutes', '15, 10 and 5 minutes']},
    {label: 'Product photos', values: ['on, in the emulator', 'off, free plan', 'on']}
  ]
};
