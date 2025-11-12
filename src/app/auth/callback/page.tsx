'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { createClient } from '@/utils/supabase/client'

const AuthCallbackPage = (): JSX.Element => {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.push('/auth/login')
        return
      }

      router.push('/dashboard')
      router.refresh()
    }

    handleCallback()
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
