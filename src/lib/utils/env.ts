/**
 * Environment utilities for client-side code
 * Safe to use in client components with Turbopack
 */

// Check if we're in development mode
// Use typeof window to ensure this works in both server and client
export const isDevelopment = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  : false

// Check if we're in production mode
export const isProduction = !isDevelopment

// Get environment variable (client-side only, must be NEXT_PUBLIC_*)
export function getEnv(key: string): string | undefined {
  if (typeof window === 'undefined') {return undefined}
  
  // Access from window object to avoid Turbopack issues
  const env = (window as any).__NEXT_DATA__?.props?.pageProps?.env
  return env?.[key]
}

// Check if running in browser
export const isBrowser = typeof window !== 'undefined'

// Check if running on server
export const isServer = typeof window === 'undefined'
