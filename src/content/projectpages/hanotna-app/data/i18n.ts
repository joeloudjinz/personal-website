// The translation pipeline from the design-and-RTL finding.
export const pipeline = {
  nodes: [
    {id: 'sweep', label: 'Sweep the code', x: 110, y: 70, lane: 'd' as const},
    {id: 'glossary', label: '48-term glossary first', x: 380, y: 70, lane: 'a' as const},
    {id: 'batches', label: '13 batches, cut per screen', x: 650, y: 70, w: 220, lane: 'a' as const},
    {id: 'translator', label: 'Translator', x: 880, y: 180, lane: 'b' as const},
    {id: 'checker', label: 'The checker', x: 650, y: 290, lane: 'c' as const},
    {id: 'arb', label: 'app_ar.arb', x: 380, y: 290, lane: 'a' as const},
    {id: 'guards', label: 'Guards run forever', x: 110, y: 290, lane: 'd' as const}
  ],
  edges: [
    {from: 'sweep', to: 'glossary', label: '1,171 strings'},
    {from: 'glossary', to: 'batches'},
    {from: 'batches', to: 'translator'},
    {from: 'translator', to: 'checker', label: 'a return per batch'},
    {from: 'checker', to: 'translator', label: 'a re-ask on failure'},
    {from: 'checker', to: 'arb', label: '1,357 keys'},
    {from: 'arb', to: 'guards'}
  ]
};
