import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import ErrorBoundary from '@/components/error/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as HotToaster } from 'react-hot-toast';
import QueryProvider from '@/providers/QueryProvider';
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
  title: "HeyTrack UMKM - Kuliner Management System",
  description: "Comprehensive culinary business management system with COGS calculation, inventory, orders, and financial tracking for Indonesian SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="h-full">
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
              <ErrorBoundary>
                {/* Header temporarily disabled during development */}
                {/* <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
                  <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-sm font-medium text-orange-700 dark:text-orange-300">
                    🚧 Development Mode - Auth Disabled
                  </div>
                </header> */}
                {children}
              </ErrorBoundary>
              <Toaster />
              <HotToaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
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
            </SettingsProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
