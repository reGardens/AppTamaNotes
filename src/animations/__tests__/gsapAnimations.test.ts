import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ANIMATION_DURATIONS, animateIn, animateOut, animatePageTransition } from '../gsapAnimations';
import gsap from 'gsap';

vi.mock('gsap', () => {
  const fromTo = vi.fn();
  const to = vi.fn((_el, vars) => {
    if (vars.onComplete) vars.onComplete();
  });
  return { default: { fromTo, to } };
});

describe('gsapAnimations', () => {
  let element: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    element = document.createElement('div');
  });

  describe('ANIMATION_DURATIONS', () => {
    it('should have enter duration within 300-600ms range', () => {
      expect(ANIMATION_DURATIONS.enter).toBeGreaterThanOrEqual(0.3);
      expect(ANIMATION_DURATIONS.enter).toBeLessThanOrEqual(0.6);
    });

    it('should have exit duration within 300-600ms range', () => {
      expect(ANIMATION_DURATIONS.exit).toBeGreaterThanOrEqual(0.3);
      expect(ANIMATION_DURATIONS.exit).toBeLessThanOrEqual(0.6);
    });

    it('should have pageTransition duration within 300-600ms range', () => {
      expect(ANIMATION_DURATIONS.pageTransition).toBeGreaterThanOrEqual(0.3);
      expect(ANIMATION_DURATIONS.pageTransition).toBeLessThanOrEqual(0.6);
    });
  });

  describe('animateIn', () => {
    it('should call gsap.fromTo with fade-in + slide-up params', () => {
      animateIn(element);

      expect(gsap.fromTo).toHaveBeenCalledWith(
        element,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      );
    });
  });

  describe('animateOut', () => {
    it('should call gsap.to with fade-out + slide-down params', async () => {
      await animateOut(element);

      expect(gsap.to).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          opacity: 0,
          y: 30,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: expect.any(Function),
        }),
      );
    });

    it('should return a promise that resolves on complete', async () => {
      const result = animateOut(element);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe('animatePageTransition', () => {
    it('should call gsap.fromTo with fade-in + scale params', () => {
      animatePageTransition(element);

      expect(gsap.fromTo).toHaveBeenCalledWith(
        element,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      );
    });
  });
});
