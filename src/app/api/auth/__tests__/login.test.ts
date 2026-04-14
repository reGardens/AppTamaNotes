import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../login/route';
import { NextRequest } from 'next/server';

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  const users = [
    { id: 'user-1', email: 'test@example.com', password: 'password123' },
    { id: 'user-2', email: 'other@example.com', password: 'otherpass99' },
  ];
  return {
    ...actual,
    default: {
      ...actual,
      promises: {
        ...actual.promises,
        readFile: vi.fn().mockResolvedValue(JSON.stringify(users)),
      },
    },
    promises: {
      ...actual.promises,
      readFile: vi.fn().mockResolvedValue(JSON.stringify(users)),
    },
  };
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user data on valid credentials', async () => {
    const res = await POST(createRequest({ email: 'test@example.com', password: 'password123' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user).toEqual({ id: 'user-1', email: 'test@example.com' });
  });

  it('should not include password in response', async () => {
    const res = await POST(createRequest({ email: 'test@example.com', password: 'password123' }));
    const json = await res.json();

    expect(json.user.password).toBeUndefined();
  });

  it('should return 401 on wrong password', async () => {
    const res = await POST(createRequest({ email: 'test@example.com', password: 'wrongpass' }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Email atau password salah');
  });

  it('should return 401 on non-existent email', async () => {
    const res = await POST(createRequest({ email: 'nobody@example.com', password: 'password123' }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Email atau password salah');
  });

  it('should return 400 when email is missing', async () => {
    const res = await POST(createRequest({ password: 'password123' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Email dan password wajib diisi');
  });

  it('should return 400 when password is missing', async () => {
    const res = await POST(createRequest({ email: 'test@example.com' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Email dan password wajib diisi');
  });
});
