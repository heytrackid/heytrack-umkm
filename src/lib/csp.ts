

 
// src/lib/csp.ts
/**
 * Edge-safe CSP helpers
 */
export function generateNonce(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
}

export async function calculateHash(content: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
  const bytes = Array.from(new Uint8Array(buf))
  return `sha256-${btoa(String.fromCharCode(...bytes))}`
}

export function getStrictCSP(nonce: string, isDev = false): string {
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://vercel.live;`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com;`

  // Catatan: kamu pakai inline style => 'unsafe-inline' tetap diperlukan
  const policies = [
    `default-src 'self' https: data: blob:;`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`,
    `img-src 'self' https: data: blob: https://*.supabase.co https://*.vercel.app;`,
    `font-src 'self' https://fonts.gstatic.com data:;`,
    `connect-src 'self' https://*.supabase.co https://vrrjoswzmlhkmmcfhicw.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live;`,
    `worker-src 'self' blob:;`,
    `media-src 'self' https://*.supabase.co;`,
    `frame-src 'none';`,
    `object-src 'none';`,
    `base-uri 'self';`,
    `form-action 'self';`,
    `frame-ancestors 'none';`,
    `manifest-src 'self';`,
    `upgrade-insecure-requests;`,
    `block-all-mixed-content;`,
  ]
  return policies.join(' ')
}

export function getHashBasedCSP(hashes: { scripts?: string[]; styles?: string[] }, isDev = false): string {
  const scriptHashes = (hashes.scripts ?? []).map(h => `'${h}'`).join(' ')
  const styleHashes = (hashes.styles ?? []).map(h => `'${h}'`).join(' ')
  const scriptSrc = isDev
    ? `script-src 'self' ${scriptHashes} 'strict-dynamic' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://vercel.live;`
    : `script-src 'self' ${scriptHashes} 'strict-dynamic' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com;`

  const policies = [
    `default-src 'self' https: data: blob:;`,
    scriptSrc,
    `style-src 'self' ${styleHashes} 'unsafe-inline' https://fonts.googleapis.com;`,
    `img-src 'self' https: data: blob: https://*.supabase.co https://*.vercel.app;`,
    `font-src 'self' https://fonts.gstatic.com data:;`,
    `connect-src 'self' https://*.supabase.co https://vrrjoswzmlhkmmcfhicw.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live;`,
    `worker-src 'self' blob:;`,
    `media-src 'self' https://*.supabase.co;`,
    `frame-src 'none';`,
    `object-src 'none';`,
    `base-uri 'self';`,
    `form-action 'self';`,
    `frame-ancestors 'none';`,
    `manifest-src 'self';`,
    `upgrade-insecure-requests;`,
    `block-all-mixed-content;`,
  ]
  return policies.join(' ')
}

export interface CSPNonce { nonce: string }
