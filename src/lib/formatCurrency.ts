/**
 * Format angka ke string mata uang Rupiah dengan pemisah titik ribuan.
 * Contoh: 1000000 → "Rp 1.000.000", 0 → "Rp 0"
 *
 * @param amount - Angka yang akan diformat
 * @returns String dalam format "Rp X.XXX.XXX"
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return amount < 0 ? `Rp -${formatted}` : `Rp ${formatted}`;
}
