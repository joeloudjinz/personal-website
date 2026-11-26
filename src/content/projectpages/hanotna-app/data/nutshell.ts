// The app in a minute: one plain line per feature, its example, the chapter
// that tells it in full, and a small figure that plays the example. Every
// number is one the page or the KB already holds: the cart and the label from
// the captures, Omar, Karim and the partners from the chapter examples, the
// home screen's attention list and the month's costs from the insights example,
// 150k lines of test code from the testing stats and the app's 118k from the
// v4.7.0 figures recount.
export const features = [
  {label: 'Sell at the counter in one tap', note: '2 × Ifri, a Hamoud, two wafers, 5% off: 190 د.ج, done.', href: '#counter',
    figure: {kind: 'tape' as const, rows: [{label: 'Subtotal', amount: '200'}, {label: '5% off', amount: '−10', tone: 'out' as const}], total: {label: 'Total', amount: '190'}}},
  {label: 'Print shelf labels', note: 'A QR of the code, the store\'s name and the price, sent to a thermal printer over the shop\'s Wi-Fi.', href: '#labels-from-a-thermal-printer',
    figure: {kind: 'label' as const, lines: ['Hamoud', 'Boualem 1L'] as [string, string], price: '80 د.ج',
      // BEV-002, the product's code in the capture: version 1, level H, mask 0, as the app encodes a short SKU.
      qr: ['111111101001101111111', '100000100110001000001', '101110100000101011101', '101110101100001011101', '101110100010101011101', '100000100110101000001', '111111101010101111111', '000000000101000000000', '001011101010110001001', '101001010110010100010', '100011101011000011111', '100100000111001110011', '010110110101010011101', '000000001101101010010', '111111100000100010011', '100000101001111101001', '101110101011000010011', '101110100100000010110', '101110101000100011101', '100000100101110101010', '111111100001010011011']}},
  {label: 'Keep the stock book honest', note: 'The book said 24, the shelf held 27: the difference is written down with its reason.', href: '#stock',
    figure: {kind: 'tape' as const, rows: [{label: 'In the book', amount: '24 pcs'}, {label: 'Counted on the shelf', amount: '27 pcs'}], total: {label: 'Written to the log', amount: '+3 pcs', tone: 'in' as const}}},
  {label: 'Customers who pay later', note: 'Omar paid 400 of 1,000 at the counter; the rest sits on his tab, oldest debt first.', href: '#credit',
    figure: {kind: 'bar' as const, above: ['Paid at the counter 400', 'On the tab 600'], segments: [{width: 40, tone: 'accent' as const}], below: ['Omar\'s 1,000 of goods, oldest debt first']}},
  {label: 'Bills, rent and wages', note: 'A delivery half paid, the rent paid until a date, Karim\'s 25 days at 1,500.', href: '#owe',
    figure: {kind: 'waterfall' as const, steps: [{label: '25 days at 1,500', value: 37500, kind: 'start' as const}, {label: 'advance', value: 10000, kind: 'minus' as const}, {label: 'to settle', value: 27500, kind: 'result' as const}]}},
  {label: 'The partners\' ledger', note: 'Who put in what, what the shop is worth, and how a cycle\'s profit splits.', href: '#partnership',
    figure: {kind: 'bar' as const, chip: 'Amine\'s 20% work share first', segments: [{width: 75, tone: 'b' as const}, {width: 25, tone: 'c' as const}], below: ['Yacine, 75% of the capital', 'Nadia, 25%']}},
  {label: 'The whole day on one screen', note: 'Today\'s sales, who is overdue, what is due, and a draft left open.', href: '#dashboard',
    figure: {kind: 'rows' as const, rows: [{tone: 'n' as const, text: '1 customer overdue'}, {tone: 'c' as const, text: '2,040 د.ج owed to you'}, {tone: 'c' as const, text: 'Rent due since 1 October'}, {tone: 'i' as const, text: '1 draft in progress'}]}},
  {label: 'Closing-time answers', note: 'Are the month\'s costs covered, who to call, what sits unsold: for the partners, never staff.', href: '#insights',
    figure: {kind: 'tape' as const, rows: [{label: 'Rent, wages, utilities', amount: '72,000'}, {label: 'Profit by the 19th', amount: '73,100', tone: 'in' as const}], total: {label: 'Covered on', amount: '19 Oct'}}}
];

export const engineering = [
  {label: 'Flutter and Firebase', note: 'The app on the phone, Firestore behind it.', href: '#stack',
    figure: {kind: 'link' as const, to: 'Firestore'}},
  {label: 'One rule, kept by a test', note: 'Firebase may be imported in one folder only; a test scans every file.', href: '#architecture',
    figure: {kind: 'seam' as const, above: 'Screens, providers, ports', label: 'Firebase only below', below: 'Adapters'}},
  {label: 'More test code than app code', note: '4,900 cases, 77 end-to-end scenarios, 24 rules suites.', href: '#testing',
    figure: {kind: 'bars' as const, rows: [{label: 'tests', width: 100, value: '150k', tone: 'accent' as const}, {label: 'app', width: 78, value: '118k', tone: 'c' as const}]}},
  {label: 'Guards that fail the build', note: 'Twenty-seven checks for mistakes made once, never again.', href: '#guards',
    figure: {kind: 'wall' as const, count: 27, hit: 15}}
];
