'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase'

export async function logout() {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/login?message=Could not logout')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
