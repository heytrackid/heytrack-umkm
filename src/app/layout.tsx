import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import ErrorBoundary from '@/components/error/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import QueryProvider from '@/providers/QueryProvider';
import SupabaseProvider from '@/providers/SupabaseProvider';
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
    <ClerkProvider>
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
            <SupabaseProvider>
              <QueryProvider>
                <SettingsProvider>
                  <ErrorBoundary>
                    <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
                      <SignedOut>
                        <SignInButton>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm h-10 px-4 cursor-pointer transition-colors">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton>
                          <button className="bg-[#6c47ff] hover:bg-[#5a3ad1] text-white rounded-lg font-medium text-sm h-10 px-4 cursor-pointer transition-colors">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </SignedOut>
                      <SignedIn>
                        <UserButton />
                      </SignedIn>
                    </header>
                    {children}
                  </ErrorBoundary>
                  <Toaster />
                </SettingsProvider>
              </QueryProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
