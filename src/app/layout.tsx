import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { getNonce } from '@/lib/nonce';
import { AuthProvider } from '@/providers/AuthProvider';
import { PreloadingProvider } from '@/providers/PreloadingProvider';
import QueryProvider from '@/providers/QueryProvider';
import { SWRProvider } from '@/providers/SWRProvider';
import SupabaseProvider from '@/providers/SupabaseProvider';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HeyTrack UMKM - Smart Culinary Management System",
  description: "Comprehensive culinary business management system with AI Assistant, COGS calculation, inventory management, orders tracking, and financial analytics for Indonesian SMEs",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  // Get CSP nonce for this request
  const nonce = await getNonce()

  return (
    <html lang="id" suppressHydrationWarning className="dark h-full">
      <head>
        {/* Performance resource hints */}
        <link rel="preconnect" href={process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''} />
        <link rel="preconnect" href="https://api.openrouter.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openrouter.ai" />

        {/* CSP nonce for Next.js inline scripts */}
        {nonce && (
          <meta property="csp-nonce" content={nonce} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full m-0 p-0 w-full`}
      >
        <SupabaseProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <QueryProvider>
                <SettingsProvider>
                  <SWRProvider>
                    <PreloadingProvider
                      enableSmartPreloading
                      enableIdlePreloading
                      enableNetworkAware
                      debug={false}
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
                    </SWRProvider>
                  </SettingsProvider>
                </QueryProvider>
              </ThemeProvider>
            </AuthProvider>
          </SupabaseProvider>
        <Analytics />
      </body>
    </html>
  );
}

export default RootLayout
