// PRODUÇÃO:
export const STRIPE_PRICES = {
  annual: 'price_1T7KpZ6oqWcsG0cdx4It6l4s',
  semiannual: 'price_1T7KpK6oqWcsG0cdfCSYZF65',
  monthly: 'price_1T7Kow6oqWcsG0cdkGsMi4Jj',
} as const;

// TESTE:
// export const STRIPE_PRICES = {
//   annual: 'price_1T82ry6oqWcsG0cdTqbgNVHZ',
//   semiannual: 'price_1T82ry6oqWcsG0cdTqbgNVHZ',
//   monthly: 'price_1T82ry6oqWcsG0cdTqbgNVHZ',
// } as const;

// PRODUÇÃO (preços introdutórios — usam Subscription Schedules):
export const STRIPE_PRICES_SEMANAL = {
  week1:  'price_1T7ys66oqWcsG0cdnODbhaHM', // 7 dias  → renova em quinzenal
  week4:  'price_1TAazj6oqWcsG0cdHEz2R0qo', // 28 dias → renova em mensal
  week12: 'price_1TAcPF6oqWcsG0cdhNetZIYf', // 84 dias → renova em trimestral
} as const;

// TESTE:
// export const STRIPE_PRICES_SEMANAL = {
//   week1:  'price_1T82ry6oqWcsG0cdTqbgNVHZ', // fase 2 → price_1TAckE6oqWcsG0cdfK11DZSA
//   week4:  'price_1T82ry6oqWcsG0cdTqbgNVHZ',
//   week12: 'price_1T82ry6oqWcsG0cdTqbgNVHZ',
// } as const;
