import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  login,
  logout,
  resetPassword,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from '../api';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(body: unknown, status = 200) {
  return {
    json: () => Promise.resolve(body),
    status,
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('login', () => {
  it('sends POST with email and password and returns response', async () => {
    const body = { success: true, user: { id: 'user-1', email: 'a@b.com' } };
    mockFetch.mockResolvedValueOnce(jsonResponse(body));

    const result = await login('a@b.com', 'password123');

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'password123' }),
    });
    expect(result).toEqual(body);
  });

  it('returns error response on invalid credentials', async () => {
    const body = { success: false, error: 'Email atau password salah' };
    mockFetch.mockResolvedValueOnce(jsonResponse(body, 401));

    const result = await login('wrong@b.com', 'wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Email atau password salah');
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(login('a@b.com', 'pw')).rejects.toThrow('Terjadi kesalahan jaringan');
  });
});

describe('logout', () => {
  it('sends POST and returns success', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));

    const result = await logout();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    expect(result).toEqual({ success: true });
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(logout()).rejects.toThrow('Terjadi kesalahan jaringan');
  });
});

describe('resetPassword', () => {
  it('sends POST with email and newPassword', async () => {
    const body = { success: true };
    mockFetch.mockResolvedValueOnce(jsonResponse(body));

    const result = await resetPassword('a@b.com', 'newpass12');

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', newPassword: 'newpass12' }),
    });
    expect(result).toEqual(body);
  });

  it('returns error when email not found', async () => {
    const body = { success: false, error: 'Email tidak ditemukan' };
    mockFetch.mockResolvedValueOnce(jsonResponse(body, 404));

    const result = await resetPassword('unknown@b.com', 'newpass12');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Email tidak ditemukan');
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(resetPassword('a@b.com', 'pw')).rejects.toThrow('Terjadi kesalahan jaringan');
  });
});

describe('getNotes', () => {
  it('sends GET with userId query param', async () => {
    const notes = [{ id: 'note-1', userId: 'user-1', itemName: 'Beras', quantity: 1, unitPrice: 50000, subtotal: 50000, createdAt: '', updatedAt: '' }];
    mockFetch.mockResolvedValueOnce(jsonResponse({ notes }));

    const result = await getNotes('user-1');

    expect(mockFetch).toHaveBeenCalledWith('/api/notes?userId=user-1', undefined);
    expect(result.notes).toEqual(notes);
  });

  it('encodes userId with special characters', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ notes: [] }));

    await getNotes('user 1&x=y');

    expect(mockFetch).toHaveBeenCalledWith('/api/notes?userId=user%201%26x%3Dy', undefined);
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(getNotes('user-1')).rejects.toThrow('Terjadi kesalahan jaringan');
  });
});

describe('addNote', () => {
  it('sends POST with CreateNoteInput body', async () => {
    const input = { userId: 'user-1', itemName: 'Gula', quantity: 3, unitPrice: 15000 };
    const note = { ...input, id: 'note-2', subtotal: 45000, createdAt: '', updatedAt: '' };
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true, note }));

    const result = await addNote(input);

    expect(mockFetch).toHaveBeenCalledWith('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    expect(result.success).toBe(true);
    expect(result.note).toEqual(note);
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(addNote({ userId: 'u', itemName: 'x', quantity: 1, unitPrice: 1 })).rejects.toThrow('Terjadi kesalahan jaringan');
  });
});

describe('updateNote', () => {
  it('sends PUT with id and UpdateNoteInput', async () => {
    const data = { itemName: 'Gula Pasir', quantity: 5, unitPrice: 15000 };
    const note = { id: 'note-2', userId: 'user-1', ...data, subtotal: 75000, createdAt: '', updatedAt: '' };
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true, note }));

    const result = await updateNote('note-2', data);

    expect(mockFetch).toHaveBeenCalledWith('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'note-2', ...data }),
    });
    expect(result.success).toBe(true);
    expect(result.note).toEqual(note);
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(updateNote('note-2', { itemName: 'x', quantity: 1, unitPrice: 1 })).rejects.toThrow('Terjadi kesalahan jaringan');
  });
});

describe('deleteNote', () => {
  it('sends DELETE with id query param', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));

    const result = await deleteNote('note-2');

    expect(mockFetch).toHaveBeenCalledWith('/api/notes?id=note-2', { method: 'DELETE' });
    expect(result.success).toBe(true);
  });

  it('encodes id with special characters', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));

    await deleteNote('note 2&x=y');

    expect(mockFetch).toHaveBeenCalledWith('/api/notes?id=note%202%26x%3Dy', { method: 'DELETE' });
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(deleteNote('note-2')).rejects.toThrow('Terjadi kesalahan jaringan');
  });
});
