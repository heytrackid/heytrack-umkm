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

  // Validasi email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect('/login?message=Please enter a valid email address')
  }

  console.log('Sending OTP to:', email) // Debug log

  // Try magic link template first (for existing users)
  let result = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Use magic link template
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login/verify`,
    },
  })

  console.log('Magic link attempt:', { data: !!result.data, error: result.error?.message }) // Debug log

  // If magic link fails (user doesn't exist), try confirm signup
  if (result.error && result.error.message.includes('User not found')) {
    console.log('User not found, trying confirm signup template') // Debug log

    result = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Use confirm signup template
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login/verify`,
      },
    })

    console.log('Confirm signup attempt:', { data: !!result.data, error: result.error?.message }) // Debug log
  }

  const { data, error } = result

  console.log('Supabase response:', { data, error }) // Debug log

  if (error) {
    console.error('OTP Send Error:', error) // Debug log

    // Handle specific error types
    if (error.message.includes('rate limit')) {
      redirect('/login?message=Too many requests. Please wait a few minutes before trying again.')
    } else if (error.message.includes('invalid email')) {
      redirect('/login?message=Please enter a valid email address')
    } else if (error.message.includes('SMTP')) {
      redirect('/login?message=Email service temporarily unavailable. Please try again later.')
    } else {
      redirect('/login?message=Could not send OTP: ' + error.message)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login/verify?email=' + encodeURIComponent(email))
}

export async function verifyOTP(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get('email') as string
  const token = formData.get('token') as string

  if (!email || !token) {
    redirect('/login/verify?email=' + encodeURIComponent(email || '') + '&message=Email and OTP are required')
  }

  // Validasi token format (harus 6 digit)
  if (!/^\d{6}$/.test(token)) {
    redirect('/login/verify?email=' + encodeURIComponent(email) + '&message=OTP must be 6 digits')
  }

  console.log('Verifying OTP for:', email, 'Token length:', token.length) // Debug log

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  console.log('Verify OTP response:', { data: !!data, error }) // Debug log

  if (error) {
    console.error('OTP Verify Error:', error) // Debug log
    redirect('/login/verify?email=' + encodeURIComponent(email) + '&message=Invalid OTP code')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
