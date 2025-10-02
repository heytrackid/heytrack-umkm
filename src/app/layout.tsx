import type { Metadata } from"next";
import React from 'react';
import { Geist, Geist_Mono } from"next/font/google";
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/providers/QueryProvider';
import { PreloadingProvider } from '@/providers/PreloadingProvider';
import { Analytics } from '@vercel/analytics/next';
// import SupabaseProvider from '@/providers/SupabaseProvider'; // Temporarily disabled
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import"./globals.css";

const geistSans = Geist({
  variable:"--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable:"--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:"HeyTrack UMKM - Smart Culinary Management System",
  description:"Comprehensive culinary business management system with AI Assistant, COGS calculation, inventory management, orders tracking, and financial analytics for Indonesian SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="id" suppressHydrationWarning className="h-full">
        <head>
          {/* Performance resource hints */}
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
          <link rel="preconnect" href="https://api.openrouter.ai" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://api.openrouter.ai" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full m-0 p-0 w-full`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <SettingsProvider>
                <PreloadingProvider 
                  enableIdlePreloading={true}
                  enableNetworkAware={true}
                  debug={process.env.NODE_ENV === 'development'}
                >
                  <ErrorBoundary>
                    <SignedOut>
                      <div className="flex items-center justify-center min-h-screen bg-gray-50">
                        <div className="max-w-md w-full space-y-8 p-8">
                          <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                              HeyTrack UMKM
                            </h1>
                            <p className="text-gray-600 mb-8">
                              Sistem manajemen bisnis kuliner cerdas untuk UMKM Indonesia
                            </p>
                            <div className="space-y-4">
                              <a
                                href="/sign-in"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
                              >
                                Masuk
                              </a>
                              <br />
                              <a
                                href="/sign-up"
                                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors inline-block text-center"
                              >
                                Daftar Akun Baru
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      {children}
                    </SignedIn>
                  </ErrorBoundary>
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
                  {/* Web Vitals Reporter disabled during build to avoid overhead; enable when analytics endpoint is ready */}
              </SettingsProvider>
            </QueryProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
