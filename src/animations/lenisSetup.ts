import Lenis from 'lenis';

/**
 * Initialize Lenis for smooth scrolling across the entire page.
 * Validates: Requirements 9.1
 *
 * @returns The Lenis instance for later cleanup
 */
export function initLenis(): Lenis {
  const lenis = new Lenis({
    smoothWheel: true,
    lerp: 0.1,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return lenis;
}

/**
 * Destroy a Lenis instance and clean up resources.
 *
 * @param lenis - The Lenis instance to destroy
 */
export function destroyLenis(lenis: Lenis): void {
  lenis.destroy();
}
