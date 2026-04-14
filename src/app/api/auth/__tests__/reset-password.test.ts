import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../reset-password/route';
import { NextRequest } from 'next/server';

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mockUsers = [
  { id: 'user-1', email: 'test@example.com', password: 'password123' },
  { id: 'user-2', email: 'other@example.com', password: 'otherpass99' },
];

let currentUsers = structuredClone(mockUsers);

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    default: {
      ...actual,
      promises: {
        ...actual.promises,
        readFile: vi.fn().mockImplementation(() =>
          Promise.resolve(JSON.stringify(currentUsers))
        ),
        writeFile: vi.fn().mockImplementation((_path: string, data: string) => {
          currentUsers = JSON.parse(data);
          return Promise.resolve();
        }),
      },
    },
    promises: {
      ...actual.promises,
      readFile: vi.fn().mockImplementation(() =>
        Promise.resolve(JSON.stringify(currentUsers))
      ),
      writeFile: vi.fn().mockImplementation((_path: string, data: string) => {
        currentUsers = JSON.parse(data);
        return Promise.resolve();
      }),
    },
  };
});

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUsers = structuredClone(mockUsers);
  });

  it('should reset password for a registered email with valid password', async () => {
    const res = await POST(
      createRequest({ email: 'test@example.com', newPassword: 'newpass12' })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(currentUsers[0].password).toBe('newpass12');
  });

  it('should return 404 for unregistered email', async () => {
    const res = await POST(
      createRequest({ email: 'nobody@example.com', newPassword: 'newpass12' })
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Email tidak ditemukan');
  });

  it('should return 400 when new password is less than 8 characters', async () => {
    const res = await POST(
      createRequest({ email: 'test@example.com', newPassword: 'short' })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Password minimal 8 karakter');
  });

  it('should return 400 when email is missing', async () => {
    const res = await POST(createRequest({ newPassword: 'newpass12' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should return 400 when newPassword is missing', async () => {
    const res = await POST(createRequest({ email: 'test@example.com' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should not modify other users when resetting password', async () => {
    await POST(
      createRequest({ email: 'test@example.com', newPassword: 'newpass12' })
    );

    expect(currentUsers[1].password).toBe('otherpass99');
  });

  it('should validate password before checking email', async () => {
    const res = await POST(
      createRequest({ email: 'test@example.com', newPassword: 'short' })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Password minimal 8 karakter');
    // Password should not have changed
    expect(currentUsers[0].password).toBe('password123');
  });
});
