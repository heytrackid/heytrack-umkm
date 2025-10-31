'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { apiLogger } from '@/lib/logger'
const AuthCallbackPage = () => {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          apiLogger.error({ error }, 'Auth callback error:')
          void router.push('/auth/login?error=auth_callback_error')
          return
        }

        if (data.session) {
          void router.push('/dashboard')
        } else {
          void router.push('/auth/login')
        }
      } catch (_err) {
        apiLogger.error({ err }, 'Unexpected error in auth callback:')
        void router.push('/auth/login?error=unexpected_error')
      }
    }

    void handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Memproses autentikasi...</h2>
        <p className="text-muted-foreground">Mohon tunggu sebentar</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
