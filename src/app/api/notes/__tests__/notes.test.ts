import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '../route';
import { NextRequest } from 'next/server';
import type { ShoppingNote } from '@/types';

const sampleNotes: ShoppingNote[] = [
  {
    id: 'note-1',
    userId: 'user-1',
    itemName: 'Beras 5kg',
    quantity: 2,
    unitPrice: 65000,
    subtotal: 130000,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z',
  },
  {
    id: 'note-2',
    userId: 'user-2',
    itemName: 'Gula 1kg',
    quantity: 3,
    unitPrice: 15000,
    subtotal: 45000,
    createdAt: '2025-01-15T11:00:00.000Z',
    updatedAt: '2025-01-15T11:00:00.000Z',
  },
];

let mockFileData = JSON.stringify(sampleNotes);

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    default: {
      ...actual,
      promises: {
        ...actual.promises,
        readFile: vi.fn().mockImplementation(() => Promise.resolve(mockFileData)),
        writeFile: vi.fn().mockImplementation((_path: string, data: string) => {
          mockFileData = data;
          return Promise.resolve();
        }),
      },
    },
    promises: {
      ...actual.promises,
      readFile: vi.fn().mockImplementation(() => Promise.resolve(mockFileData)),
      writeFile: vi.fn().mockImplementation((_path: string, data: string) => {
        mockFileData = data;
        return Promise.resolve();
      }),
    },
  };
});

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/notes');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString(), { method: 'GET' });
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPutRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/notes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createDeleteRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/notes');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString(), { method: 'DELETE' });
}

describe('GET /api/notes', () => {
  beforeEach(() => {
    mockFileData = JSON.stringify(sampleNotes);
    vi.clearAllMocks();
  });

  it('should return notes filtered by userId', async () => {
    const res = await GET(createGetRequest({ userId: 'user-1' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.notes).toHaveLength(1);
    expect(json.notes[0].itemName).toBe('Beras 5kg');
  });

  it('should return empty array for userId with no notes', async () => {
    const res = await GET(createGetRequest({ userId: 'user-999' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.notes).toHaveLength(0);
  });

  it('should return 400 when userId is missing', async () => {
    const res = await GET(createGetRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('userId wajib disertakan');
  });
});

describe('POST /api/notes', () => {
  beforeEach(() => {
    mockFileData = JSON.stringify(sampleNotes);
    vi.clearAllMocks();
  });

  it('should create a new note with calculated subtotal', async () => {
    const res = await POST(
      createPostRequest({
        userId: 'user-1',
        itemName: 'Minyak Goreng',
        quantity: 2,
        unitPrice: 28000,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.note.itemName).toBe('Minyak Goreng');
    expect(json.note.subtotal).toBe(56000);
    expect(json.note.userId).toBe('user-1');
    expect(json.note.id).toMatch(/^note-/);
    expect(json.note.createdAt).toBeDefined();
    expect(json.note.updatedAt).toBeDefined();
  });

  it('should return 400 for empty itemName', async () => {
    const res = await POST(
      createPostRequest({
        userId: 'user-1',
        itemName: '  ',
        quantity: 1,
        unitPrice: 10000,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should return 400 for negative quantity', async () => {
    const res = await POST(
      createPostRequest({
        userId: 'user-1',
        itemName: 'Telur',
        quantity: -1,
        unitPrice: 25000,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should return 400 for zero unitPrice', async () => {
    const res = await POST(
      createPostRequest({
        userId: 'user-1',
        itemName: 'Telur',
        quantity: 1,
        unitPrice: 0,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});

describe('PUT /api/notes', () => {
  beforeEach(() => {
    mockFileData = JSON.stringify(sampleNotes);
    vi.clearAllMocks();
  });

  it('should update an existing note and recalculate subtotal', async () => {
    const res = await PUT(
      createPutRequest({
        id: 'note-1',
        itemName: 'Beras 10kg',
        quantity: 1,
        unitPrice: 120000,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.note.itemName).toBe('Beras 10kg');
    expect(json.note.subtotal).toBe(120000);
    expect(json.note.quantity).toBe(1);
    expect(json.note.unitPrice).toBe(120000);
  });

  it('should return 404 for non-existent note ID', async () => {
    const res = await PUT(
      createPutRequest({
        id: 'note-nonexistent',
        itemName: 'Test',
        quantity: 1,
        unitPrice: 1000,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Catatan tidak ditemukan');
  });

  it('should return 400 when id is missing', async () => {
    const res = await PUT(
      createPutRequest({
        itemName: 'Test',
        quantity: 1,
        unitPrice: 1000,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should return 400 for invalid input on update', async () => {
    const res = await PUT(
      createPutRequest({
        id: 'note-1',
        itemName: '',
        quantity: 1,
        unitPrice: 1000,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});

describe('DELETE /api/notes', () => {
  beforeEach(() => {
    mockFileData = JSON.stringify(sampleNotes);
    vi.clearAllMocks();
  });

  it('should delete an existing note', async () => {
    const res = await DELETE(createDeleteRequest({ id: 'note-1' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify note was removed from data
    const remaining = JSON.parse(mockFileData) as ShoppingNote[];
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('note-2');
  });

  it('should return 404 for non-existent note ID', async () => {
    const res = await DELETE(createDeleteRequest({ id: 'note-nonexistent' }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Catatan tidak ditemukan');
  });

  it('should return 400 when id is missing', async () => {
    const res = await DELETE(createDeleteRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('ID catatan wajib disertakan');
  });
});
