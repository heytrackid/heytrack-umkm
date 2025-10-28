import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import { apiLogger } from '@/lib/logger'
/**
 * Root page - redirects based on auth status
 * Middleware will handle the redirect, but this provides server-side fallback
 */
export default async function HomePage() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    } else {
      redirect('/auth/login')
    }
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error checking auth')
    redirect('/auth/login')
  }
}
