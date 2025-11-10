

 
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
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://vercel.live https://*.vercel.app;`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://*.vercel.app;`

  // Catatan: kamu pakai inline style => 'unsafe-inline' tetap diperlukan
  const policies = [
    `default-src 'self' https: data: blob:;`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.app;`,
    `img-src 'self' https: data: blob: https://*.supabase.co https://*.vercel.app https://app.heytrack.id;`,
    `font-src 'self' https://fonts.gstatic.com data: https://*.vercel.app;`,
    `connect-src 'self' https://*.supabase.co https://vrrjoswzmlhkmmcfhicw.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live https://*.vercel.app https://app.heytrack.id ${isDev ? "http://localhost:3000 http://127.0.0.1:3000 ws://localhost:3000 ws://127.0.0.1:3000" : ''};`,
    `worker-src 'self' blob: https://*.vercel.app;`,
    `media-src 'self' https://*.supabase.co https://*.vercel.app;`,
    isDev ? `frame-src 'self' https://vercel.live https://*.vercel.app;` : `frame-src 'self' https://*.vercel.app;`,
    `object-src 'none';`,
    `base-uri 'self';`,
    `form-action 'self' https://*.supabase.co;`,
    `frame-ancestors 'none';`,
    `manifest-src 'self' https://*.vercel.app;`,
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
    `connect-src 'self' https://*.supabase.co https://vrrjoswzmlhkmmcfhicw.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live ${isDev ? "http://localhost:3000 http://127.0.0.1:3000 ws://localhost:3000 ws://127.0.0.1:3000" : ''};`,
    `worker-src 'self' blob:;`,
    `media-src 'self' https://*.supabase.co;`,
    isDev ? `frame-src 'self' https://vercel.live;` : `frame-src 'self';`,
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
