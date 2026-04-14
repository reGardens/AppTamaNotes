/**
 * Hitung subtotal: quantity × unitPrice.
 *
 * @param quantity - Jumlah item
 * @param unitPrice - Harga satuan dalam Rupiah
 * @returns Hasil perkalian quantity × unitPrice
 */
export function calculateSubtotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}
