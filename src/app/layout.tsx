import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { PreloadingProvider } from '@/providers/PreloadingProvider';
import QueryProvider from '@/providers/QueryProvider';
import { Analytics } from '@vercel/analytics/next';
import { PerformanceMonitor } from '@/lib/performance';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
// import SupabaseProvider from '@/providers/SupabaseProvider'; // Temporarily disabled
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeyTrack UMKM - Smart Culinary Management System",
  description: "Comprehensive culinary business management system with AI Assistant, COGS calculation, inventory management, orders tracking, and financial analytics for Indonesian SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="h-full">
      <head>
        {/* Performance resource hints */}
        <link rel="preconnect" href={process.env['NEXT_PUBLIC_SUPABASE_URL'] || ''} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env['NEXT_PUBLIC_SUPABASE_URL'] || ''} />
        <link rel="preconnect" href="https://api.openrouter.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openrouter.ai" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full m-0 p-0 w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SettingsProvider>
              <PreloadingProvider
                enableSmartPreloading
                enableIdlePreloading
                enableNetworkAware
                debug={process.env.NODE_ENV === 'development'}
              >
                <GlobalErrorBoundary>
                  {/* Header temporarily disabled during development */}
                  {/* <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
                  <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-sm font-medium text-orange-700 dark:text-orange-300">
                    🚧 Development Mode - Auth Disabled
                  </div>
                </header> */}
                  {children}
                </GlobalErrorBoundary>
              </PreloadingProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.625rem',
                    zIndex: 9999,
                  },
                  success: {
                    iconTheme: {
                      primary: 'hsl(var(--primary))',
                      secondary: 'hsl(var(--primary-foreground))',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
              {/* Performance Monitoring */}
              {process.env.NODE_ENV === 'production' && <PerformanceMonitor />}
            </SettingsProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
