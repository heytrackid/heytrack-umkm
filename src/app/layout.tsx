import { StackProvider, StackTheme } from "@stackframe/stack";
import { Analytics } from '@vercel/analytics/next';
import { Geist, Geist_Mono } from 'next/font/google';
import { stackServerApp } from "../stack/server";

import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { headers } from 'next/headers';

import { PreloadingProvider } from '@/providers/PreloadingProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { SWRProvider } from '@/providers/SWRProvider';

import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

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

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "HeyTrack UMKM - Smart Culinary Management System",
  description: "Comprehensive culinary business management system with AI Assistant, COGS calculation, inventory management, orders tracking, and financial analytics for Indonesian SMEs",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactElement> => {
  // Get CSP nonce from headers
  const nonce = (await headers()).get('x-nonce')

  return (
    <html lang="id" suppressHydrationWarning className="dark h-full">
      <head>
        {/* Mobile viewport with safe area support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* Performance resource hints */}
        <link rel="preconnect" href={process['env']['NEXT_PUBLIC_SUPABASE_URL'] ?? ''} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process['env']['NEXT_PUBLIC_SUPABASE_URL'] ?? ''} />
        <link rel="preconnect" href="https://api.openrouter.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openrouter.ai" />


        
        {/* CSP nonce for inline scripts */}
        {nonce && (
          <script
            nonce={nonce}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `window.__CSP_NONCE__ = '${nonce}';`,
            }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100svh] m-0 p-0 w-full`}
        suppressHydrationWarning
      ><StackProvider app={stackServerApp}><StackTheme>
        <SupabaseProvider>
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
                       enableSmartPreloading={false}
                       enableIdlePreloading={false}
                       enableNetworkAware={false}
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
          </SupabaseProvider>
        <Analytics />
      </StackTheme></StackProvider></body>
    </html>
  );
}

export default RootLayout
