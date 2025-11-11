import { useCallback, useState } from 'react'

interface UseTurnstileOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useTurnstile(options?: UseTurnstileOptions) {
  const [token, setToken] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDev = process.env.NODE_ENV === 'development'

  const handleVerify = useCallback((turnstileToken: string) => {
    setToken(turnstileToken)
    setError(null)
    setIsVerified(true)
    
    // In development, auto-succeed
    if (isDev && turnstileToken === 'dev-bypass-token') {
      options?.onSuccess?.()
    }
  }, [isDev, options])

  const verifyToken = useCallback(
    async (turnstileToken?: string) => {
      const tokenToVerify = turnstileToken || token

      if (!tokenToVerify) {
        const errorMsg = 'No token to verify'
        setError(errorMsg)
        options?.onError?.(errorMsg)
        return false
      }

      // Development bypass - skip API call
      if (isDev && tokenToVerify === 'dev-bypass-token') {
        setIsVerified(true)
        options?.onSuccess?.()
        return true
      }

      setIsVerifying(true)
      setError(null)

      try {
        const response = await fetch('/api/verify-turnstile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenToVerify }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          // Log detailed error for debugging
          console.error('Turnstile verification failed:', {
            status: response.status,
            error: data.error,
            errorCodes: data.errorCodes,
            details: data.details
          })

          // User-friendly error messages
          let errorMsg = 'Verifikasi keamanan gagal'
          if (response.status === 400) {
            if (data.errorCodes?.includes('timeout-or-duplicate')) {
              errorMsg = 'Token keamanan sudah digunakan atau expired. Silakan refresh halaman.'
            } else if (data.errorCodes?.includes('invalid-input-response')) {
              errorMsg = 'Token keamanan tidak valid. Silakan coba lagi.'
            }
          } else if (response.status === 500) {
            errorMsg = 'Konfigurasi keamanan bermasalah. Silakan hubungi admin.'
          } else if (response.status === 502) {
            errorMsg = 'Layanan verifikasi tidak tersedia. Silakan coba lagi.'
          }

          throw new Error(errorMsg)
        }

        setIsVerified(true)
        options?.onSuccess?.()
        return true
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Verification failed'
        setError(errorMsg)
        setIsVerified(false)
        options?.onError?.(errorMsg)
        return false
      } finally {
        setIsVerifying(false)
      }
    },
    [token, options, isDev]
  )

  const reset = useCallback(() => {
    setToken(null)
    setIsVerified(false)
    setError(null)
    setIsVerifying(false)
  }, [])

  return {
    token,
    isVerifying,
    isVerified,
    error,
    handleVerify,
    verifyToken,
    reset,
  }
}
