import { ValidationResult } from '@/types';

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
