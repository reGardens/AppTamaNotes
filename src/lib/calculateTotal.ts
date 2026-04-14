import { ShoppingNote } from '@/types';

/**
 * Hitung total harga dari seluruh catatan belanja.
 * Jumlahkan semua subtotal dari array ShoppingNote.
 *
 * @param notes - Array catatan belanja
 * @returns Total dari seluruh subtotal
 */
export function calculateTotal(notes: ShoppingNote[]): number {
  return notes.reduce((total, note) => total + note.subtotal, 0);
}
