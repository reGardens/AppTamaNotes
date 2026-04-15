import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppProviders from './AppProviders';

export const metadata: Metadata = {
  title: 'Pratama Notes',
  description: 'Aplikasi pencatatan belanjaan keluarga Pratama',
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pratama Notes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
