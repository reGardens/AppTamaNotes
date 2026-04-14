'use client';

import React, { useEffect, useMemo, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { initLenis, destroyLenis } from '@/animations/lenisSetup';
import SweetAlertProvider from '@/components/SweetAlertProvider';
import { useThemeStore } from '@/store/themeStore';

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('ErrorBoundary:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Terjadi kesalahan</h2>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Refresh Halaman</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppProviders({ children }: { children: ReactNode }) {
  const darkMode = useThemeStore((s) => s.darkMode);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode ? {
        background: { default: '#0f172a', paper: '#1e293b' },
        text: { primary: '#e2e8f0', secondary: '#94a3b8' },
      } : {
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#1e293b', secondary: '#64748b' },
      }),
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: darkMode ? { '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60a5fa' } } : {},
        },
      },
      MuiInputLabel: { styleOverrides: { root: darkMode ? { color: '#94a3b8' } : {} } },
      MuiTableCell: { styleOverrides: { root: darkMode ? { borderBottomColor: '#334155' } : {} } },
      MuiSelect: { styleOverrides: { icon: darkMode ? { color: '#94a3b8' } : {} } },
    },
  }), [darkMode]);

  useEffect(() => {
    const lenis = initLenis();
    return () => { destroyLenis(lenis); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <SweetAlertProvider>{children}</SweetAlertProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
