import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { PreloadingProvider } from '@/providers/PreloadingProvider';
import QueryProvider from '@/providers/QueryProvider';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { getNonce } from '@/lib/nonce';
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Get CSP nonce for this request
  const nonce = await getNonce()

  return (
    <html lang="id" suppressHydrationWarning className="h-full">
      <head>
        {/* Performance resource hints */}
        <link rel="preconnect" href={process.env['NEXT_PUBLIC_SUPABASE_URL'] || ''} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env['NEXT_PUBLIC_SUPABASE_URL'] || ''} />
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
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  className: 'toast-custom',
                }}
              />
              {/* Performance Monitoring - Removed temporarily */}
            </SettingsProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
