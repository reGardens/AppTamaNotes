import type {
  ShoppingNote,
  CreateNoteInput,
  UpdateNoteInput,
} from '@/types';

// === Response Types ===

export interface LoginResponse {
  success: boolean;
  user?: { id: string; email: string };
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  error?: string;
}

export interface GetNotesResponse {
  notes: ShoppingNote[];
  success?: boolean;
  error?: string;
}

export interface MutateNoteResponse {
  success: boolean;
  note?: ShoppingNote;
  error?: string;
}

export interface DeleteNoteResponse {
  success: boolean;
  error?: string;
}

// === Helper ===

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    const data = (await res.json()) as T;
    return data;
  } catch {
    throw new Error('Terjadi kesalahan jaringan');
  }
}

// === Auth ===

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<LogoutResponse> {
  return request<LogoutResponse>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function resetPassword(
  email: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return request<ResetPasswordResponse>('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
}

// === Notes ===

export async function getNotes(userId: string): Promise<GetNotesResponse> {
  return request<GetNotesResponse>(`/api/notes?userId=${encodeURIComponent(userId)}`);
}

export async function addNote(
  input: CreateNoteInput,
): Promise<MutateNoteResponse> {
  return request<MutateNoteResponse>('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateNote(
  id: string,
  data: UpdateNoteInput,
): Promise<MutateNoteResponse> {
  return request<MutateNoteResponse>('/api/notes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  return request<DeleteNoteResponse>(`/api/notes?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
