// CSP Nonce Generator and Hash Calculator
// For strict CSP without 'unsafe-inline'
// Uses Web Crypto API for Edge Runtime compatibility

/**
 * Generate a cryptographically secure nonce for CSP
 * Use this in middleware to generate per-request nonce
 * Uses Web Crypto API (Edge Runtime compatible)
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/**
 * Calculate SHA-256 hash for inline content
 * Use this to whitelist specific inline scripts/styles
 * Uses Web Crypto API (Edge Runtime compatible)
 */
export async function calculateHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashBase64 = btoa(String.fromCharCode(...hashArray))
  return `sha256-${hashBase64}`
}

/**
 * Get strict CSP header with nonce (no unsafe-inline)
 */
export function getStrictCSP(nonce: string, isDev = false): string {
  const policies = [
    "default-src 'self'",
    
    // Scripts: Use nonce instead of unsafe-inline
    isDev 
      ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://vercel.live`
      : `script-src 'self' 'nonce-${nonce}' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com`,
    
    // Styles: Use nonce for <style> tags, unsafe-inline for style attributes (React needs this)
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
    
    // Images
    "img-src 'self' data: https: blob: https://*.supabase.co https://vercel.com",
    
    // Fonts
    "font-src 'self' data: https://fonts.gstatic.com",
    
    // Connections
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live",
    
    // Workers
    "worker-src 'self' blob:",
    
    // Media
    "media-src 'self' https://*.supabase.co",
    
    // Frames
    "frame-src 'none'",
    
    // Objects
    "object-src 'none'",
    
    // Base URI
    "base-uri 'self'",
    
    // Forms
    "form-action 'self'",
    
    // Frame ancestors
    "frame-ancestors 'none'",
    
    // Manifest
    "manifest-src 'self'",
    
    // Prefetch
    "prefetch-src 'self' https://*.supabase.co",
    
    // Upgrade insecure requests
    "upgrade-insecure-requests",
    
    // Block mixed content
    "block-all-mixed-content"
  ]

  return policies.join('; ')
}

/**
 * Get CSP with specific hashes for known inline content
 * Use this if you have static inline scripts/styles
 */
export function getHashBasedCSP(hashes: { scripts?: string[], styles?: string[] }, isDev = false): string {
  const scriptHashes = hashes.scripts?.map(h => `'${h}'`).join(' ') || ''
  const styleHashes = hashes.styles?.map(h => `'${h}'`).join(' ') || ''
  
  const policies = [
    "default-src 'self'",
    
    // Scripts with hashes
    isDev 
      ? `script-src 'self' ${scriptHashes} 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://vercel.live`
      : `script-src 'self' ${scriptHashes} https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com`,
    
    // Styles with hashes, unsafe-inline for style attributes (React needs this)
    `style-src 'self' ${styleHashes} 'unsafe-inline' https://fonts.googleapis.com`,
    
    "img-src 'self' data: https: blob: https://*.supabase.co https://vercel.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live",
    "worker-src 'self' blob:",
    "media-src 'self' https://*.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "prefetch-src 'self' https://*.supabase.co",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ]

  return policies.join('; ')
}

/**
 * CSP Nonce Context Type
 * Use this to pass nonce through React context
 */
export type CSPNonce = {
  nonce: string
}
