import gsap from 'gsap';

/**
 * Animation duration constants (in seconds).
 * All durations are within the 300ms–600ms range per Requirement 9.5.
 */
export const ANIMATION_DURATIONS = {
  enter: 0.4,
  exit: 0.3,
  pageTransition: 0.5,
} as const;

/**
 * Animate an element in with fade-in + slide-up.
 * Validates: Requirements 9.2, 9.5
 */
export function animateIn(element: HTMLElement): void {
  gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: ANIMATION_DURATIONS.enter, ease: 'power2.out' },
  );
}

/**
 * Animate an element out with fade-out + slide-down.
 * Returns a Promise that resolves when the animation completes.
 * Validates: Requirements 9.3, 9.5
 */
export function animateOut(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(element, {
      opacity: 0,
      y: 30,
      duration: ANIMATION_DURATIONS.exit,
      ease: 'power2.in',
      onComplete: resolve,
    });
  });
}

/**
 * Animate a page transition with fade-in + slight scale.
 * Validates: Requirements 9.4, 9.5
 */
export function animatePageTransition(element: HTMLElement): void {
  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: ANIMATION_DURATIONS.pageTransition, ease: 'power2.out' },
  );
}
