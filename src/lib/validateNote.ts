import { CreateNoteInput, ValidationResult } from '@/types';

export function validateNote(input: CreateNoteInput): ValidationResult {
  const errors: string[] = [];

  if (!input.itemName || input.itemName.trim() === '') {
    errors.push('Nama item wajib diisi');
  }

  if (typeof input.quantity !== 'number' || !isFinite(input.quantity) || input.quantity <= 0) {
    errors.push('Jumlah harus bilangan positif');
  }

  if (typeof input.unitPrice !== 'number' || !isFinite(input.unitPrice) || input.unitPrice <= 0) {
    errors.push('Harga satuan harus bilangan positif');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
