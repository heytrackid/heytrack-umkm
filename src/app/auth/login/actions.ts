'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { authLogger } from '@/lib/logger'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const captchaToken = formData.get('hcaptcha-token') as string

    // Log the login attempt
    authLogger.info({ email, captchaProvided: !!captchaToken }, 'Login attempt initiated')

    const data = {
        email,
        password,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        authLogger.error({ 
            email, 
            errorCode: error.code,
            errorMessage: error.message,
            errorStatus: error.status
        }, 'Supabase authentication failed')
        
        // Provide more specific error messages based on Supabase error codes
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email atau password salah. Silakan coba lagi.'
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Email belum dikonfirmasi. Silakan periksa inbox Anda untuk email konfirmasi.'
        } else if (error.message.includes('Rate limit')) {
            errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
        } else if (error.message.includes('Network')) {
            errorMessage = 'Koneksi jaringan gagal. Silakan periksa koneksi internet Anda.'
        }
        
        return { error: errorMessage }
    }

    authLogger.info({ email }, 'Login successful')
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function loginWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        authLogger.error({ 
            error: error.message, 
            errorCode: error.code 
        }, 'Google OAuth login failed')
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
    
    return { error: 'Failed to initiate Google login' }
}
