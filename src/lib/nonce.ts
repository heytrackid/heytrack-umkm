import { headers } from 'next/headers'

/**
 * Get CSP nonce from request headers
 * Use this in Server Components to access the nonce
 * 
 * @returns The nonce string or null if not available
 */
export async function getNonce(): Promise<string | null> {
  try {
    const headersList = await headers()
    return headersList.get('x-nonce')
  } catch {
    return null
  }
}

/**
 * Get CSP nonce or throw error if not available
 * Use this when nonce is required
 * 
 * @returns The nonce string
 * @throws Error if nonce is not available
 */
export async function requireNonce(): Promise<string> {
  const nonce = await getNonce()
  if (!nonce) {
    throw new Error('CSP nonce not available')
  }
  return nonce
}
