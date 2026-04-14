import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockRaf = vi.fn();
const mockDestroy = vi.fn();

const mockLenisInstance = {
  raf: mockRaf,
  destroy: mockDestroy,
};

vi.mock('lenis', () => ({
  default: vi.fn(() => mockLenisInstance),
}));

import { initLenis, destroyLenis } from '../lenisSetup';

describe('lenisSetup', () => {
  let rafCallbacks: Array<(time: number) => void> = [];

  beforeEach(() => {
    mockRaf.mockClear();
    mockDestroy.mockClear();
    rafCallbacks = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb as (time: number) => void);
      return rafCallbacks.length;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initLenis', () => {
    it('should return a Lenis instance with raf and destroy methods', () => {
      const lenis = initLenis();
      expect(lenis).toBe(mockLenisInstance);
    });

    it('should start a requestAnimationFrame loop', () => {
      initLenis();
      expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('should call lenis.raf inside the animation frame callback', () => {
      initLenis();
      // Invoke the captured RAF callback
      const cb = rafCallbacks[0];
      expect(cb).toBeDefined();
      cb(16.67);
      expect(mockRaf).toHaveBeenCalledWith(16.67);
      // Should schedule the next frame
      expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(2);
    });
  });

  describe('destroyLenis', () => {
    it('should call lenis.destroy()', () => {
      const lenis = initLenis();
      destroyLenis(lenis);
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });
  });
});
