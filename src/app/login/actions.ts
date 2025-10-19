'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase-server'

export async function sendOTP(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get('email') as string

  if (!email) {
    redirect('/login?message=Email is required')
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    redirect('/login?message=Could not send OTP')
  }

  revalidatePath('/', 'layout')
  redirect('/login/verify?email=' + encodeURIComponent(email))
}

export async function verifyOTP(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get('email') as string
  const token = formData.get('token') as string

  if (!email || !token) {
    redirect('/login/verify?email=' + encodeURIComponent(email) + '&message=Email and OTP are required')
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    redirect('/login/verify?email=' + encodeURIComponent(email) + '&message=Invalid OTP')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
