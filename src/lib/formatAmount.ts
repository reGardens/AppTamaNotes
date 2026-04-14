/** Format number with dot thousand separator: 1000 → "1.000", 10000 → "10.000" */
export function formatAmount(value: number | string): string {
  const num = typeof value === 'string' ? parseInt(value.replace(/\./g, ''), 10) : value;
  if (isNaN(num) || num === 0) return '0';
  return Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Parse formatted amount string back to number: "1.000" → 1000 */
export function parseAmount(formatted: string): number {
  return parseInt(formatted.replace(/\./g, ''), 10) || 0;
}
