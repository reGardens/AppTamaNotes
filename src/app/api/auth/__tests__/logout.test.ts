import { describe, it, expect } from 'vitest';
import { POST } from '../logout/route';

describe('POST /api/auth/logout', () => {
  it('should return success true', async () => {
    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
