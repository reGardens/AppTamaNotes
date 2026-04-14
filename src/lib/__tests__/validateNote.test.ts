import { describe, it, expect } from 'vitest';
import { validateNote } from '../validateNote';
import { CreateNoteInput } from '@/types';

describe('validateNote', () => {
  it('should return valid for correct input', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: 'Beras 5kg',
      quantity: 2,
      unitPrice: 65000,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty itemName', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: '',
      quantity: 2,
      unitPrice: 65000,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Nama item wajib diisi');
  });

  it('should reject whitespace-only itemName', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: '   ',
      quantity: 2,
      unitPrice: 65000,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Nama item wajib diisi');
  });

  it('should reject zero quantity', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: 'Beras',
      quantity: 0,
      unitPrice: 65000,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Jumlah harus bilangan positif');
  });

  it('should reject negative quantity', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: 'Beras',
      quantity: -1,
      unitPrice: 65000,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Jumlah harus bilangan positif');
  });

  it('should reject zero unitPrice', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: 'Beras',
      quantity: 2,
      unitPrice: 0,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Harga satuan harus bilangan positif');
  });

  it('should reject negative unitPrice', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: 'Beras',
      quantity: 2,
      unitPrice: -5000,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Harga satuan harus bilangan positif');
  });

  it('should collect all errors when multiple fields are invalid', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: '',
      quantity: -1,
      unitPrice: 0,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it('should reject NaN quantity', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: 'Beras',
      quantity: NaN,
      unitPrice: 65000,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Jumlah harus bilangan positif');
  });

  it('should reject Infinity unitPrice', () => {
    const input: CreateNoteInput = {
      userId: 'user-1',
      itemName: 'Beras',
      quantity: 2,
      unitPrice: Infinity,
    };
    const result = validateNote(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Harga satuan harus bilangan positif');
  });
});
