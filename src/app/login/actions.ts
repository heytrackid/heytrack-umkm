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

  // Send OTP according to Supabase docs - let Supabase handle template selection
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    // shouldCreateUser defaults to true - allows new user signups
    // Supabase will auto-select template: Magic Link for existing, Confirm Signup for new users
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login/verify`,
    },
  })

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
