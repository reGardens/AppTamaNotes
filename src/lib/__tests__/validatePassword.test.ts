import { describe, it, expect } from 'vitest';
import { validatePassword } from '../validatePassword';

describe('validatePassword', () => {
  it('should return valid for password with exactly 8 characters', () => {
    const result = validatePassword('abcdefgh');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return valid for password longer than 8 characters', () => {
    const result = validatePassword('mysecurepassword');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return invalid for password shorter than 8 characters', () => {
    const result = validatePassword('short');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password minimal 8 karakter');
  });

  it('should return invalid for empty string', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password minimal 8 karakter');
  });

  it('should return invalid for 7-character password', () => {
    const result = validatePassword('1234567');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password minimal 8 karakter');
  });
});
