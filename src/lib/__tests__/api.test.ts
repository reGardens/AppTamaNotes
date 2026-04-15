import { describe, it, expect, beforeEach } from 'vitest';
import { login, logout, resetPassword, getNotes, addNote, updateNote, deleteNote } from '../api';

// Mock localStorage
const store: Record<string, string> = {};
const mockLS = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLS, writable: true });

beforeEach(() => { mockLS.clear(); });

describe('login', () => {
  it('returns success for valid credentials', async () => {
    const res = await login('rezzabagus.rb@gmail.com', 'Kapanpundimanapun');
    expect(res.success).toBe(true);
    expect(res.user?.email).toBe('rezzabagus.rb@gmail.com');
  });

  it('returns error for invalid credentials', async () => {
    const res = await login('wrong@email.com', 'wrong');
    expect(res.success).toBe(false);
  });
});

describe('logout', () => {
  it('returns success', async () => {
    const res = await logout();
    expect(res.success).toBe(true);
  });
});

describe('resetPassword', () => {
  it('resets password for valid email', async () => {
    const res = await resetPassword('rezzabagus.rb@gmail.com', 'newpass12');
    expect(res.success).toBe(true);
    // Can login with new password
    const login2 = await login('rezzabagus.rb@gmail.com', 'newpass12');
    expect(login2.success).toBe(true);
  });

  it('fails for unknown email', async () => {
    const res = await resetPassword('unknown@email.com', 'newpass12');
    expect(res.success).toBe(false);
  });

  it('fails for short password', async () => {
    const res = await resetPassword('rezzabagus.rb@gmail.com', 'short');
    expect(res.success).toBe(false);
  });
});

describe('notes CRUD', () => {
  it('adds and gets notes', async () => {
    await addNote({ userId: 'user-1', itemName: 'Beras', quantity: 2, unitPrice: 50000 });
    const res = await getNotes('user-1');
    expect(res.notes).toHaveLength(1);
    expect(res.notes[0].itemName).toBe('Beras');
    expect(res.notes[0].subtotal).toBe(100000);
  });

  it('updates a note', async () => {
    const add = await addNote({ userId: 'user-1', itemName: 'Gula', quantity: 1, unitPrice: 15000 });
    const updated = await updateNote(add.note!.id, { itemName: 'Gula Pasir', quantity: 3, unitPrice: 15000 });
    expect(updated.success).toBe(true);
    expect(updated.note!.itemName).toBe('Gula Pasir');
    expect(updated.note!.subtotal).toBe(45000);
  });

  it('deletes a note', async () => {
    const add = await addNote({ userId: 'user-1', itemName: 'Telur', quantity: 1, unitPrice: 25000 });
    const del = await deleteNote(add.note!.id);
    expect(del.success).toBe(true);
    const res = await getNotes('user-1');
    expect(res.notes).toHaveLength(0);
  });

  it('filters notes by userId', async () => {
    await addNote({ userId: 'user-1', itemName: 'A', quantity: 1, unitPrice: 1000 });
    await addNote({ userId: 'user-2', itemName: 'B', quantity: 1, unitPrice: 2000 });
    const res1 = await getNotes('user-1');
    const res2 = await getNotes('user-2');
    expect(res1.notes).toHaveLength(1);
    expect(res2.notes).toHaveLength(1);
    expect(res1.notes[0].itemName).toBe('A');
    expect(res2.notes[0].itemName).toBe('B');
  });
});
