import { StackProvider, StackTheme } from "@stackframe/stack";
import { Analytics } from '@vercel/analytics/next';
import { Poppins } from 'next/font/google';
import { Suspense } from 'react';
import { stackServerApp } from "../stack/server";

import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { SettingsProvider } from '@/contexts/settings-context';
import { headers } from 'next/headers';
;


import { Providers } from '@/providers';
import { PreloadingProvider } from '@/providers/PreloadingProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { SupabaseProvider } from '@/providers/SupabaseProvider';

import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import "./globals.css";



const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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


        
        {/* CSP nonce for inline scripts (server-safe) */}
        {nonce && (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: `window.__CSP_NONCE__ = '${nonce}';` }}
          />
        )}
      </head>
      <body
        className={`${poppins.variable} antialiased min-h-[100svh] m-0 p-0 w-full font-sans`}
        suppressHydrationWarning
      ><StackProvider app={stackServerApp}><StackTheme>
        <Suspense fallback={null}>
          <SupabaseProvider>
            <Providers>
                   <SettingsProvider>
                     <ReactQueryProvider>
                         <PreloadingProvider
                           enableSmartPreloading={false}
                           enableIdlePreloading={false}
                           enableNetworkAware={false}
                           debug={false}
                           >
                             <GlobalErrorBoundary>
                           {children}
                             </GlobalErrorBoundary>
                           </PreloadingProvider>
                       </ReactQueryProvider>
                     </SettingsProvider>
            </Providers>
            </SupabaseProvider>
          </Suspense>
         <Analytics />
         <Toaster />
      </StackTheme></StackProvider></body>
    </html>
  );
}

export default RootLayout
