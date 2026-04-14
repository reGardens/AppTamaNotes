import { describe, it, expect } from 'vitest';
import { calculateTotal } from '../calculateTotal';
import { ShoppingNote } from '@/types';

function makeNote(subtotal: number): ShoppingNote {
  return {
    id: 'note-1',
    userId: 'user-1',
    itemName: 'Item',
    quantity: 1,
    unitPrice: subtotal,
    subtotal,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

describe('calculateTotal', () => {
  it('should return 0 for an empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should return the subtotal for a single note', () => {
    expect(calculateTotal([makeNote(65000)])).toBe(65000);
  });

  it('should sum subtotals of multiple notes', () => {
    const notes = [makeNote(65000), makeNote(30000), makeNote(15000)];
    expect(calculateTotal(notes)).toBe(110000);
  });

  it('should handle notes with subtotal of 0', () => {
    const notes = [makeNote(0), makeNote(50000)];
    expect(calculateTotal(notes)).toBe(50000);
  });

  it('should handle large subtotals', () => {
    const notes = [makeNote(10000000), makeNote(25000000)];
    expect(calculateTotal(notes)).toBe(35000000);
  });
});
