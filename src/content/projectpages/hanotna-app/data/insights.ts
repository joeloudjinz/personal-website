// The six Insights sections and the month's costs, from the Insights
// feature-facts finding. The rent is the rent capture's 30,000 a month and the
// wages are chapter 06's 25 days at 1,500. The utilities and the running
// profit are example numbers.
export const questions = [
  {label: 'Profit this week', note: 'Monday to now, beside the same days last week, with twelve weeks of bars.'},
  {label: 'Covering this month\'s costs', note: 'Rent, wages and utilities, and the day the month\'s profit covered them.'},
  {label: 'Who to call', note: 'Every customer who owes, the biggest and oldest debts first, with a Call button.'},
  {label: 'Money asleep on the shelves', note: 'Stock unsold for 30 or 90 days, valued at what it cost.'},
  {label: 'What earns the most', note: 'The best and weakest products by profit, over 30 or 90 days.'},
  {label: 'Given away in discounts', note: 'Discounts and below-list prices, by product and by seller, over 30 or 90 days.'}
];

export const monthCosts = {
  rows: [
    {label: 'Rent, at its monthly rate', amount: '30,000'},
    {label: 'Karim\'s wages paid in October', amount: '37,500'},
    {label: 'Electricity and water', amount: '4,500'}
  ],
  total: {label: 'This month\'s fixed costs', amount: '72,000'}
};
