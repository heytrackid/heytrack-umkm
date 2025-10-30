// CSP Nonce Helper for Server Components
// Use this to get nonce from request headers

import { headers } from 'next/headers'

/**
 * Get CSP nonce from request headers
 * Use this in Server Components to add nonce to inline scripts/styles
 * 
 * @example
 * ```tsx
 * import { getNonce } from '@/lib/nonce'
 * 
 * export default async function MyPage() {
 *   const nonce = await getNonce()
 *   
 *   return (
 *     <div>
 *       <script nonce={nonce}>
 *         console.log('This script has nonce')
 *       </script>
 *     </div>
 *   )
 * }
 * ```
 */
export async function getNonce(): Promise<string | null> {
  const headersList = await headers()
  return headersList.get('x-nonce')
}

/**
 * Get nonce or throw error if not available
 * Use this when nonce is required
 */
export async function requireNonce(): Promise<string> {
  const nonce = await getNonce()
  if (!nonce) {
    throw new Error('CSP nonce not available. Make sure middleware is running.')
  }
  return nonce
}
