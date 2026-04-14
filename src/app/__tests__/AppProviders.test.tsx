import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

vi.mock('@/animations/lenisSetup', () => ({
  initLenis: vi.fn(() => ({ destroy: vi.fn() })),
  destroyLenis: vi.fn(),
}));

vi.mock('@/components/SweetAlertProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="sweet-alert-provider">{children}</div>,
}));

vi.mock('@/store/themeStore', () => ({
  useThemeStore: (selector: (s: { darkMode: boolean; toggleDarkMode: () => void }) => unknown) =>
    selector({ darkMode: false, toggleDarkMode: vi.fn() }),
}));

import AppProviders from '../AppProviders';
import { initLenis, destroyLenis } from '@/animations/lenisSetup';

describe('AppProviders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders children correctly', () => {
    render(<AppProviders><div data-testid="child">Hello</div></AppProviders>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initializes Lenis on mount', () => {
    render(<AppProviders><div>Content</div></AppProviders>);
    expect(initLenis).toHaveBeenCalledOnce();
  });

  it('destroys Lenis on unmount', () => {
    const { unmount } = render(<AppProviders><div>Content</div></AppProviders>);
    unmount();
    expect(destroyLenis).toHaveBeenCalledOnce();
  });

  it('renders ErrorBoundary fallback when child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    function ThrowingChild(): React.ReactNode { throw new Error('Test error'); }
    render(<AppProviders><ThrowingChild /></AppProviders>);
    expect(screen.getByText('Terjadi kesalahan')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
