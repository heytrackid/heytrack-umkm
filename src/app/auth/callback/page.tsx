'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'

const AuthCallbackPage = (): JSX.Element => {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async (): Promise<void> => {
      const supabase = await createClient()

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          apiLogger.error({ error }, 'Auth callback error:')
          router.push('/auth/login?error=auth_callback_error')
          return
        }

        if (data.session) {
          router.push('/dashboard')
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error))
        apiLogger.error({ error: normalizedError }, 'Unexpected error in auth callback:')
        router.push('/auth/login?error=unexpected_error')
      }
    }

    void handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Memproses autentikasi...</h2>
        <p className="text-muted-foreground">Mohon tunggu sebentar</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
