import type { ShoppingNote, CreateNoteInput, UpdateNoteInput } from '@/types';
import { calculateSubtotal } from './calculateSubtotal';

// === Hardcoded users (no server needed) ===
const USERS = [
  { id: 'user-1', email: 'rezzabagus.rb@gmail.com', password: 'Kapanpundimanapun' },
  { id: 'user-2', email: 'Ritakarina0210@gmail.com', password: 'Jakarta021096' },
];

// === Response Types ===
export interface LoginResponse { success: boolean; user?: { id: string; email: string }; error?: string }
export interface LogoutResponse { success: boolean }
export interface ResetPasswordResponse { success: boolean; error?: string }
export interface GetNotesResponse { notes: ShoppingNote[] }
export interface MutateNoteResponse { success: boolean; note?: ShoppingNote; error?: string }
export interface DeleteNoteResponse { success: boolean; error?: string }

// === LocalStorage helpers ===
const NOTES_KEY = 'pratama-notes-data';
const USERS_KEY = 'pratama-users-data';

function getStoredUsers(): typeof USERS {
  if (typeof window === 'undefined') return USERS;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as typeof USERS;
      // Merge: ensure hardcoded users exist (update email/password if changed in code), keep extra users
      const merged = [...USERS];
      for (const s of stored) {
        if (!merged.some((m) => m.id === s.id)) merged.push(s);
      }
      // Update passwords from stored (in case user did reset password)
      for (const s of stored) {
        const m = merged.find((x) => x.id === s.id);
        if (m && USERS.some((u) => u.id === s.id)) {
          // For hardcoded users, keep stored password (may have been reset)
          m.password = s.password;
        }
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch { /* ignore */ }
  localStorage.setItem(USERS_KEY, JSON.stringify(USERS));
  return USERS;
}

function saveUsers(users: typeof USERS) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getStoredNotes(): ShoppingNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveNotes(notes: ShoppingNote[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// === Auth (client-side) ===

export async function login(email: string, password: string): Promise<LoginResponse> {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { success: false, error: 'Email atau password salah' };
  return { success: true, user: { id: user.id, email: user.email } };
}

export async function logout(): Promise<LogoutResponse> {
  return { success: true };
}

export async function resetPassword(email: string, newPassword: string): Promise<ResetPasswordResponse> {
  if (newPassword.length < 8) return { success: false, error: 'Password minimal 8 karakter' };
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return { success: false, error: 'Email tidak ditemukan' };
  users[idx].password = newPassword;
  saveUsers(users);
  return { success: true };
}

// === User Management (admin only - Rezza) ===

export interface AddUserResponse { success: boolean; error?: string }

export async function addUser(email: string, password: string): Promise<AddUserResponse> {
  if (!email || !password) return { success: false, error: 'Email dan password wajib diisi' };
  if (password.length < 8) return { success: false, error: 'Password minimal 8 karakter' };
  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return { success: false, error: 'Email sudah terdaftar' };
  users.push({ id: `user-${Date.now()}`, email, password });
  saveUsers(users);
  return { success: true };
}

export function getUsers(): { id: string; email: string }[] {
  return getStoredUsers().map((u) => ({ id: u.id, email: u.email }));
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  if (userId === 'user-1') return { success: false, error: 'Tidak bisa menghapus akun admin' };
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: 'User tidak ditemukan' };
  users.splice(idx, 1);
  saveUsers(users);
  return { success: true };
}

// === Notes (localStorage) ===

export async function getNotes(userId: string): Promise<GetNotesResponse> {
  const notes = getStoredNotes().filter((n) => n.userId === userId);
  return { notes };
}

export async function addNote(input: CreateNoteInput): Promise<MutateNoteResponse> {
  const subtotal = calculateSubtotal(input.quantity, input.unitPrice);
  const now = new Date().toISOString();
  const note: ShoppingNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: input.userId,
    itemName: input.itemName.trim(),
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    subtotal,
    createdAt: now,
    updatedAt: now,
  };
  const notes = getStoredNotes();
  notes.push(note);
  saveNotes(notes);
  return { success: true, note };
}

export async function updateNote(id: string, data: UpdateNoteInput): Promise<MutateNoteResponse> {
  const notes = getStoredNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return { success: false, error: 'Catatan tidak ditemukan' };
  const subtotal = calculateSubtotal(data.quantity, data.unitPrice);
  notes[idx] = { ...notes[idx], itemName: data.itemName.trim(), quantity: data.quantity, unitPrice: data.unitPrice, subtotal, updatedAt: new Date().toISOString() };
  saveNotes(notes);
  return { success: true, note: notes[idx] };
}

export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  const notes = getStoredNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return { success: false, error: 'Catatan tidak ditemukan' };
  notes.splice(idx, 1);
  saveNotes(notes);
  return { success: true };
}

// === Backup & Restore ===

export function exportBackup(): string {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    notes: getStoredNotes(),
    users: getStoredUsers(),
  };
  return JSON.stringify(data, null, 2);
}

export function downloadBackup() {
  const json = exportBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  a.href = url;
  a.download = `pratama-notes-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function restoreBackup(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.notes || !Array.isArray(data.notes)) return { success: false, count: 0, error: 'Format backup tidak valid' };
    saveNotes(data.notes);
    if (data.users && Array.isArray(data.users)) saveUsers(data.users);
    return { success: true, count: data.notes.length };
  } catch {
    return { success: false, count: 0, error: 'File backup rusak atau tidak valid' };
  }
}
